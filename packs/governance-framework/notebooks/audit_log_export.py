# Fabric notebook — Export Fabric activity to a Delta table for SIEM / retention
# Pulls the Microsoft 365 unified audit log for Fabric/Power BI activity via the
# Office 365 Management Activity API and appends it to a governed Delta table.
# Schedule daily with a 1-day lookback + a small overlap to cover late events.
#
# Docs: https://fabdocs.dev/docs/governance/audit-logs
#
# The unified audit log only retains ~180 days in the portal — this makes your
# retention real. For engine-level detail (Spark, semantic model), enable
# Workspace Monitoring and query its Eventhouse instead.

# ---------------------------------------------------------------------------
# Parameters
# ---------------------------------------------------------------------------
target_table = "governance.audit_activity"
lookback_hours = 26          # 24h window + 2h overlap
tenant_id = "EDIT-tenant-id"
# App registration with Office 365 Management APIs -> ActivityFeed.Read
client_id = "EDIT-client-id"
key_vault_url = "https://EDIT.vault.azure.net/"
client_secret_name = "o365-mgmt-client-secret"

# ---------------------------------------------------------------------------
import json
from datetime import datetime, timedelta, timezone

import requests
from pyspark.sql import functions as F

try:
    import notebookutils  # type: ignore
except Exception:
    notebookutils = None

RESOURCE = "https://manage.office.com"
CONTENT_TYPE = "Audit.General"  # Fabric/Power BI events land here


def _secret() -> str:
    return notebookutils.credentials.getSecret(key_vault_url, client_secret_name)


def _token() -> str:
    resp = requests.post(
        f"https://login.microsoftonline.com/{tenant_id}/oauth2/token",
        data={
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": _secret(),
            "resource": RESOURCE,
        },
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def fetch_activity(token: str, start: datetime, end: datetime) -> list[dict]:
    headers = {"Authorization": f"Bearer {token}"}
    base = f"{RESOURCE}/api/v1.0/{tenant_id}/activity/feed"
    # Ensure the subscription exists (idempotent).
    requests.post(f"{base}/subscriptions/start", headers=headers,
                  params={"contentType": CONTENT_TYPE}, timeout=60)

    out: list[dict] = []
    resp = requests.get(
        f"{base}/subscriptions/content",
        headers=headers,
        params={
            "contentType": CONTENT_TYPE,
            "startTime": start.strftime("%Y-%m-%dT%H:%M:%S"),
            "endTime": end.strftime("%Y-%m-%dT%H:%M:%S"),
        },
        timeout=120,
    )
    resp.raise_for_status()
    for blob in resp.json():
        content = requests.get(blob["contentUri"], headers=headers, timeout=120)
        content.raise_for_status()
        out.extend(content.json())
    return out


end = datetime.now(timezone.utc)
start = end - timedelta(hours=lookback_hours)
events = fetch_activity(_token(), start, end)
print(json.dumps({"window_start": start.isoformat(), "events": len(events)}))

if not events:
    if notebookutils is not None:
        notebookutils.notebook.exit(json.dumps({"events": 0}))

df = (
    spark.createDataFrame([json.dumps(e) for e in events], "string")
    .withColumnRenamed("value", "raw")
    .withColumn("j", F.from_json("raw", "Id string, CreationTime string, Operation string, "
                                        "UserId string, Workspace string, ItemName string, "
                                        "ClientIP string, UserAgent string"))
    .select(
        F.col("j.Id").alias("event_id"),
        F.to_timestamp("j.CreationTime").alias("event_time"),
        F.col("j.Operation").alias("operation"),
        F.col("j.UserId").alias("user"),
        F.col("j.Workspace").alias("workspace"),
        F.col("j.ItemName").alias("item"),
        F.col("j.ClientIP").alias("client_ip"),
        F.col("j.UserAgent").alias("user_agent"),
        F.col("raw"),
        F.current_timestamp().alias("_ingested_at"),
    )
    .dropDuplicates(["event_id"])
)

from delta.tables import DeltaTable

if not spark.catalog.tableExists(target_table):
    df.write.format("delta").partitionBy(F.to_date("event_time")).saveAsTable(target_table)
else:
    (
        DeltaTable.forName(spark, target_table).alias("t")
        .merge(df.alias("s"), "t.event_id = s.event_id")
        .whenNotMatchedInsertAll()
        .execute()
    )

written = spark.read.table(target_table).count()
print(json.dumps({"events": len(events), "table_rows": written}))
if notebookutils is not None:
    notebookutils.notebook.exit(json.dumps({"events": len(events), "table_rows": written}))
