# Fabric notebook — Semantic model refresh health
# Pulls refresh history for semantic models via the Power BI REST API, lands
# it, and flags consecutive failures and slow refreshes (p90 above threshold).
#
# Docs: https://fabdocs.dev/docs/tools/capacity-sku-reference

# ---------------------------------------------------------------------------
# Parameters
# ---------------------------------------------------------------------------
workspace_ids = ["EDIT-workspace-guid-1"]
target_table = "monitoring.refresh_history"
top_n_per_model = 30
failure_streak_flag = 2
duration_p90_minutes_flag = 30

# ---------------------------------------------------------------------------
import json

import requests
from pyspark.sql import functions as F
from pyspark.sql.window import Window

try:
    import notebookutils  # type: ignore
except Exception:
    notebookutils = None


def _token() -> str:
    if notebookutils is not None:
        return notebookutils.credentials.getToken("https://analysis.windows.net/powerbi/api")
    raise RuntimeError("Run inside Fabric, or wire a token for local testing.")


def list_datasets(workspace_id: str) -> list[dict]:
    headers = {"Authorization": f"Bearer {_token()}"}
    resp = requests.get(
        f"https://api.powerbi.com/v1.0/myorg/groups/{workspace_id}/datasets",
        headers=headers, timeout=60,
    )
    resp.raise_for_status()
    return resp.json().get("value", [])


def refresh_history(workspace_id: str, dataset_id: str) -> list[dict]:
    headers = {"Authorization": f"Bearer {_token()}"}
    resp = requests.get(
        f"https://api.powerbi.com/v1.0/myorg/groups/{workspace_id}/datasets/{dataset_id}/refreshes",
        headers=headers, params={"$top": top_n_per_model}, timeout=60,
    )
    resp.raise_for_status()
    return resp.json().get("value", [])


rows = []
for ws in workspace_ids:
    for ds in list_datasets(ws):
        if not ds.get("isRefreshable"):
            continue
        for r in refresh_history(ws, ds["id"]):
            rows.append(
                {
                    "workspace": ws,
                    "model": ds["name"],
                    "status": r.get("status", "Unknown"),
                    "started_at": r.get("startTime"),
                    "ended_at": r.get("endTime"),
                }
            )

print(json.dumps({"refreshes_collected": len(rows)}))
if not rows:
    if notebookutils is not None:
        notebookutils.notebook.exit(json.dumps({"refreshes_collected": 0}))

df = (
    spark.createDataFrame(rows)
    .withColumn("started_at", F.to_timestamp("started_at"))
    .withColumn("ended_at", F.to_timestamp("ended_at"))
    .withColumn("duration_s", F.col("ended_at").cast("long") - F.col("started_at").cast("long"))
    .withColumn("_collected_at", F.current_timestamp())
)
df.write.format("delta").mode("append").option("mergeSchema", "true").saveAsTable(target_table)

history = spark.read.table(target_table)
w = Window.partitionBy("workspace", "model").orderBy(F.col("started_at").desc())
recent = history.withColumn("rn", F.row_number().over(w)).where(F.col("rn") <= failure_streak_flag)
failing = (
    recent.groupBy("workspace", "model")
    .agg(F.sum(F.when(F.col("status") == "Failed", 1).otherwise(0)).alias("recent_failures"), F.count("*").alias("n"))
    .where((F.col("recent_failures") == F.col("n")) & (F.col("n") == failure_streak_flag))
)

slow = (
    history.where("status = 'Completed'")
    .groupBy("workspace", "model")
    .agg(F.expr("percentile_approx(duration_s, 0.9)").alias("p90_seconds"))
    .where(F.col("p90_seconds") > duration_p90_minutes_flag * 60)
)

result = {
    "failing_models": [r.asDict() for r in failing.collect()],
    "slow_models": [r.asDict() for r in slow.collect()],
}
print(json.dumps(result, indent=2, default=str))
if notebookutils is not None:
    notebookutils.notebook.exit(json.dumps(result, default=str))
