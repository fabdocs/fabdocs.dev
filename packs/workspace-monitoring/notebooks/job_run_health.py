# Fabric notebook — Job run health
# Pulls recent item job-instance history (pipelines, notebooks) via the Fabric
# REST API, lands it, and flags: N consecutive failures, and items with no
# successful run in `abandoned_days` (candidates to retire).
#
# Docs: https://fabdocs.dev/docs/tools/capacity-sku-reference

# ---------------------------------------------------------------------------
# Parameters
# ---------------------------------------------------------------------------
workspace_ids = ["EDIT-workspace-guid-1", "EDIT-workspace-guid-2"]
target_table = "monitoring.job_runs"
abandoned_days = 30
consecutive_failures_flag = 3

# ---------------------------------------------------------------------------
import json
from datetime import datetime, timedelta, timezone

import requests
from pyspark.sql import functions as F
from pyspark.sql.window import Window

try:
    import notebookutils  # type: ignore
except Exception:
    notebookutils = None


def _token() -> str:
    if notebookutils is not None:
        return notebookutils.credentials.getToken("https://api.fabric.microsoft.com")
    raise RuntimeError("Run inside Fabric, or wire a token for local testing.")


def list_items(workspace_id: str) -> list[dict]:
    headers = {"Authorization": f"Bearer {_token()}"}
    resp = requests.get(
        f"https://api.fabric.microsoft.com/v1/workspaces/{workspace_id}/items",
        headers=headers, timeout=60,
    )
    resp.raise_for_status()
    return [i for i in resp.json().get("value", []) if i.get("type") in ("DataPipeline", "Notebook")]


def list_job_instances(workspace_id: str, item_id: str) -> list[dict]:
    headers = {"Authorization": f"Bearer {_token()}"}
    # EDIT: confirm path/pagination for your API version
    resp = requests.get(
        f"https://api.fabric.microsoft.com/v1/workspaces/{workspace_id}/items/{item_id}/jobs/instances",
        headers=headers, timeout=60,
    )
    resp.raise_for_status()
    return resp.json().get("value", [])


rows = []
for ws in workspace_ids:
    for item in list_items(ws):
        for j in list_job_instances(ws, item["id"]):
            rows.append(
                {
                    "workspace": ws,
                    "item": item["displayName"],
                    "item_type": item["type"],
                    "status": j.get("status", "Unknown"),
                    "started_at": j.get("startTimeUtc"),
                    "ended_at": j.get("endTimeUtc"),
                }
            )

print(json.dumps({"runs_collected": len(rows)}))

if not rows:
    if notebookutils is not None:
        notebookutils.notebook.exit(json.dumps({"runs_collected": 0}))

df = (
    spark.createDataFrame(rows)
    .withColumn("started_at", F.to_timestamp("started_at"))
    .withColumn("ended_at", F.to_timestamp("ended_at"))
    .withColumn("duration_s", F.col("ended_at").cast("long") - F.col("started_at").cast("long"))
    .withColumn("_collected_at", F.current_timestamp())
)
df.write.format("delta").mode("append").option("mergeSchema", "true").saveAsTable(target_table)

# --- flags -------------------------------------------------------------
history = spark.read.table(target_table)
w = Window.partitionBy("workspace", "item").orderBy(F.col("started_at").desc())
recent = history.withColumn("rn", F.row_number().over(w)).where(F.col("rn") <= consecutive_failures_flag)

streaks = (
    recent.groupBy("workspace", "item")
    .agg(F.sum(F.when(F.col("status") == "Failed", 1).otherwise(0)).alias("recent_failures"), F.count("*").alias("n"))
    .where((F.col("recent_failures") == F.col("n")) & (F.col("n") == consecutive_failures_flag))
)

cutoff = datetime.now(timezone.utc) - timedelta(days=abandoned_days)
last_success = (
    history.where("status = 'Succeeded'")
    .groupBy("workspace", "item")
    .agg(F.max("started_at").alias("last_success"))
)
all_items = history.select("workspace", "item").distinct()
abandoned = (
    all_items.join(last_success, ["workspace", "item"], "left")
    .where(F.col("last_success").isNull() | (F.col("last_success") < F.lit(cutoff)))
)

result = {
    "consecutive_failure_items": [r.asDict() for r in streaks.collect()],
    "abandoned_items": [r.asDict() for r in abandoned.collect()],
}
print(json.dumps(result, indent=2, default=str))
if notebookutils is not None:
    notebookutils.notebook.exit(json.dumps(result, default=str))
