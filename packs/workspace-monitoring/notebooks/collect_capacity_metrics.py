# Fabric notebook — Collect capacity / item run metrics
# Two supported sources; pick the one enabled on your tenant.
#   A) Workspace Monitoring Eventhouse (KQL) — engine-level Spark events,
#      enabled per-workspace under Workspace settings -> Monitoring.
#   B) Fabric Admin REST API — coarser, tenant-wide, no per-workspace opt-in.
# Lands a normalised row per item-run into monitoring.capacity_metrics.
#
# Docs: https://fabdocs.dev/docs/governance/audit-logs
#       https://fabdocs.dev/docs/tools/capacity-sku-reference

# ---------------------------------------------------------------------------
# Parameters
# ---------------------------------------------------------------------------
source = "eventhouse"          # "eventhouse" or "admin_api"
target_table = "monitoring.capacity_metrics"
lookback_hours = 26            # 24h + overlap

# Eventhouse (source A)
kusto_cluster_uri = "https://EDIT.kusto.fabric.microsoft.com"
kusto_database = "EDIT-eventhouse-db"

# Admin API (source B)
capacity_ids = ["EDIT-capacity-guid"]

# ---------------------------------------------------------------------------
import json
from datetime import datetime, timedelta, timezone

from pyspark.sql import functions as F

try:
    import notebookutils  # type: ignore
except Exception:
    notebookutils = None


def _token(resource: str) -> str:
    if notebookutils is not None:
        return notebookutils.credentials.getToken(resource)
    raise RuntimeError("Run inside Fabric, or wire a token for local testing.")


def collect_from_eventhouse() -> list[dict]:
    from azure.kusto.data import KustoClient, KustoConnectionStringBuilder
    from azure.kusto.data.helpers import dataframe_from_result_table

    token = _token("https://api.kusto.fabric.microsoft.com")
    kcsb = KustoConnectionStringBuilder.with_token_provider(kusto_cluster_uri, lambda: token)
    client = KustoClient(kcsb)

    # Adjust the table/columns to your Eventhouse schema — this assumes the
    # default Spark monitoring tables. `DurationMs` is used as the CU proxy:
    # relative run cost, not a literal Capacity Unit value.
    query = f"""
    SparkListenerApplicationEnd
    | where Timestamp > ago({lookback_hours}h)
    | project ItemName, WorkspaceName, DurationMs, Timestamp
    """
    resp = client.execute(kusto_database, query)
    df = dataframe_from_result_table(resp.primary_results[0])
    return [
        {
            "item": r["ItemName"],
            "workspace": r["WorkspaceName"],
            "cu_seconds": (r["DurationMs"] or 0) / 1000.0,
            "event_time": r["Timestamp"].isoformat(),
        }
        for _, r in df.iterrows()
    ]


def collect_from_admin_api() -> list[dict]:
    import requests

    token = _token("https://api.fabric.microsoft.com")
    headers = {"Authorization": f"Bearer {token}"}
    out: list[dict] = []
    for cap_id in capacity_ids:
        # EDIT: confirm the current admin capacity-workload metrics path
        url = f"https://api.fabric.microsoft.com/v1/admin/capacities/{cap_id}/workloads"
        resp = requests.get(url, headers=headers, timeout=60)
        resp.raise_for_status()
        for w in resp.json().get("value", []):
            out.append(
                {
                    "item": w.get("workloadName", "unknown"),
                    "workspace": w.get("workspaceName", "unknown"),
                    "cu_seconds": w.get("cuSeconds", 0),
                    "event_time": datetime.now(timezone.utc).isoformat(),
                }
            )
    return out


rows = collect_from_eventhouse() if source == "eventhouse" else collect_from_admin_api()
print(json.dumps({"source": source, "rows": len(rows)}))

if rows:
    df = spark.createDataFrame(rows).withColumn("event_time", F.to_timestamp("event_time"))
    df = df.withColumn("_collected_at", F.current_timestamp())
    (df.write.format("delta").mode("append").option("mergeSchema", "true").saveAsTable(target_table))

if notebookutils is not None:
    notebookutils.notebook.exit(json.dumps({"source": source, "rows": len(rows)}))
