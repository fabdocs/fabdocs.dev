# Fabric notebook — Slowly Changing Dimension (Type 2)
# Closes changed rows and inserts new versions, keyed on a business key with a
# hash of the tracked attributes. Idempotent.
#
# Docs: https://fabdocs.dev/docs/data-engineering/pyspark-patterns

# ---------------------------------------------------------------------------
# Parameters
# ---------------------------------------------------------------------------
source_table = "bronze.customer"
target_table = "gold.dim_customer"
business_key = "customer_id"
tracked_columns = ["name", "segment", "country", "credit_limit"]  # changes here => new version
order_column = "updated_at"  # newest source row per key
run_id = "manual"

# ---------------------------------------------------------------------------
from pyspark.sql import functions as F
from delta.tables import DeltaTable

from lib.fabric_utils import log, require_columns, exit_notebook
from lib.transforms import trim_strings, deduplicate

log("start", target=target_table)

src = trim_strings(spark.read.table(source_table))
require_columns(src, [business_key, order_column, *tracked_columns])
src = deduplicate(src, [business_key], order_by=order_column)

row_hash = F.sha2(
    F.concat_ws("||", *[F.coalesce(F.col(c).cast("string"), F.lit("∅")) for c in tracked_columns]),
    256,
)
src = (
    src.select(business_key, *tracked_columns)
    .withColumn("_hash", row_hash)
    .withColumn("_effective_from", F.current_timestamp())
    .withColumn("_effective_to", F.lit(None).cast("timestamp"))
    .withColumn("_is_current", F.lit(True))
    .withColumn("_run_id", F.lit(run_id))
)

if not spark.catalog.tableExists(target_table):
    src.write.format("delta").saveAsTable(target_table)
    n = src.count()
    log("create", rows=n)
    exit_notebook({"status": "created", "rows": n})

tgt = DeltaTable.forName(spark, target_table)

# 1) close current rows whose tracked attributes changed
(
    tgt.alias("t")
    .merge(src.alias("s"), f"t.{business_key} = s.{business_key} AND t._is_current = true")
    .whenMatchedUpdate(
        condition="t._hash <> s._hash",
        set={"_is_current": F.lit(False), "_effective_to": F.current_timestamp()},
    )
    .execute()
)

# 2) insert new versions for keys that are new OR just got closed
current = spark.read.table(target_table).where("_is_current = true").select(business_key, "_hash")
to_insert = src.alias("s").join(
    current.alias("c"),
    (F.col(f"s.{business_key}") == F.col(f"c.{business_key}")) & (F.col("s._hash") == F.col("c._hash")),
    "left_anti",
)
to_insert.write.format("delta").mode("append").saveAsTable(target_table)

inserted = to_insert.count()
log("done", inserted=inserted)
exit_notebook({"status": "ok", "inserted": inserted})
