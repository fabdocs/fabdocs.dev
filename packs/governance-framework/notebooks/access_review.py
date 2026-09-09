# Fabric notebook — Quarterly access-review evidence
# Joins the security model (who is *granted* what) against the exported audit
# log (who *actually read* what) and writes a recertification worksheet plus a
# few exception reports. Run monthly; hand the output to data owners to sign.
#
# Docs: https://fabdocs.dev/docs/governance/audit-logs

# ---------------------------------------------------------------------------
# Parameters
# ---------------------------------------------------------------------------
audit_table = "governance.audit_activity"
model_path = "config/security-model.example.json"
output_table = "governance.access_review"
review_window_days = 90

# ---------------------------------------------------------------------------
import json

from pyspark.sql import functions as F

try:
    import notebookutils  # type: ignore
except Exception:
    notebookutils = None


def load_model(path: str) -> dict:
    if notebookutils is not None:
        return json.loads(notebookutils.fs.head(path, 1024 * 1024))
    return json.loads(open(path).read())


model = load_model(model_path)

# Flatten the model: one row per (role, group, table)
grant_rows = [
    (role["name"], member, t["table"], t.get("access", "read"), bool(t.get("rowFilter")), bool(t.get("denyColumns")))
    for role in model["roles"]
    for member in role["members"]
    for t in role["tables"]
]
grants = spark.createDataFrame(
    grant_rows, ["role", "group_object_id", "table", "access", "has_rls", "has_cls"]
)

# Actual reads in the window
reads = (
    spark.read.table(audit_table)
    .where(F.col("event_time") >= F.date_sub(F.current_date(), review_window_days))
    .where(F.col("operation").rlike("(?i)read|export|view|query"))
    .select(
        F.col("user"),
        F.col("item").alias("table"),
        F.col("workspace"),
        F.col("event_time"),
    )
)

read_summary = reads.groupBy("table").agg(
    F.countDistinct("user").alias("distinct_readers"),
    F.count("*").alias("read_events"),
    F.max("event_time").alias("last_read"),
)

worksheet = (
    grants.groupBy("table")
    .agg(
        F.collect_set("role").alias("roles_granting"),
        F.max("has_rls").alias("any_rls"),
        F.max("has_cls").alias("any_cls"),
    )
    .join(read_summary, "table", "full_outer")
    .withColumn(
        "flag",
        F.when(F.col("roles_granting").isNull(), F.lit("READ_WITHOUT_GRANT"))
        .when(F.col("distinct_readers").isNull(), F.lit("GRANTED_BUT_UNUSED"))
        .otherwise(F.lit("OK")),
    )
    .withColumn("_reviewed_at", F.current_timestamp())
)

worksheet.write.format("delta").mode("overwrite").option("overwriteSchema", "true").saveAsTable(output_table)

flags = {r["flag"]: r["n"] for r in worksheet.groupBy("flag").agg(F.count("*").alias("n")).collect()}
print(json.dumps({"window_days": review_window_days, "flags": flags}))
if notebookutils is not None:
    notebookutils.notebook.exit(json.dumps({"flags": flags}))
