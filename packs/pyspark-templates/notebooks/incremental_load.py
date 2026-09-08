# Fabric notebook — Idempotent incremental load
# Watermark read from source -> optional cleansing -> MERGE upsert into target.
# Re-running with the same parameters is always safe.
#
# Docs: https://fabdocs.dev/docs/data-engineering/pyspark-patterns

# ---------------------------------------------------------------------------
# Parameters  (mark this cell as the parameter cell)
# ---------------------------------------------------------------------------
source_table = "bronze.orders"          # or an abfss:// path passed by the pipeline
target_table = "silver.orders"
business_key = "order_id"
watermark_column = "updated_at"
watermark_value = "1900-01-01T00:00:00"  # pipeline passes the last successful value
run_id = "manual"
full_reload = False
row_floor = 0                            # fail if fewer rows than this arrive

# ---------------------------------------------------------------------------
from pyspark.sql import functions as F
from delta.tables import DeltaTable

from lib.fabric_utils import log, require_columns, assert_row_floor, exit_notebook
from lib.transforms import add_audit_columns, trim_strings, deduplicate

log("start", target=target_table, watermark_value=watermark_value, full_reload=full_reload)

# --- read -------------------------------------------------------------------
reader = spark.read.table(source_table) if "." in source_table else spark.read.format("delta").load(source_table)
incoming = reader if full_reload else reader.where(F.col(watermark_column) > F.lit(watermark_value))

incoming = trim_strings(incoming)
incoming = deduplicate(incoming, [business_key], watermark_column)
incoming = add_audit_columns(incoming, run_id, source_table)

require_columns(incoming, [business_key, watermark_column])
n_in = incoming.count()
assert_row_floor(n_in, row_floor, "incoming")
log("read", rows=n_in)

if n_in == 0:
    exit_notebook({"status": "noop", "rows": 0, "new_watermark": watermark_value})

# --- write ----------------------------------------------------------------
if not spark.catalog.tableExists(target_table):
    incoming.write.format("delta").saveAsTable(target_table)
    log("create", rows=n_in)
else:
    (
        DeltaTable.forName(spark, target_table).alias("t")
        .merge(incoming.alias("s"), f"t.{business_key} = s.{business_key}")
        .whenMatchedUpdateAll(condition=f"s.{watermark_column} > t.{watermark_column}")
        .whenNotMatchedInsertAll()
        .execute()
    )
    log("merge", rows=n_in)

# --- verify + hand back the new watermark --------------------------------
new_watermark = str(incoming.agg(F.max(watermark_column)).first()[0])
written = spark.read.table(target_table).count()
log("done", target_rows=written, new_watermark=new_watermark)

exit_notebook({"status": "ok", "rows": n_in, "new_watermark": new_watermark})
