# Fabric notebook — Rule-driven data cleansing
# Reads a JSON spec (inline or from config/tables.example.json) and applies:
# trim/blank->null, type coercion, NOT NULL defaults, dedupe, and validation
# rules that split rows into a clean table and a quarantine table.
#
# Docs: https://fabdocs.dev/docs/data-engineering/pyspark-patterns

# ---------------------------------------------------------------------------
# Parameters
# ---------------------------------------------------------------------------
source_table = "bronze.orders"
target_table = "silver.orders_clean"
quarantine_table = "silver.orders_quarantine"
run_id = "manual"

# Inline spec — or load it from a control file (see config/tables.example.json)
spec = {
    "dedupe_keys": ["order_id"],
    "dedupe_order_by": "updated_at",
    "casts": {"amount": "decimal(18,2)", "order_date": "date", "quantity": "int"},
    "not_null_defaults": {"status": "UNKNOWN", "quantity": 0},
    "rules": {
        "amount_non_negative": "amount >= 0",
        "has_customer": "customer_id is not null",
        "valid_status": "status in ('NEW','PAID','SHIPPED','CANCELLED','UNKNOWN')",
    },
}

# ---------------------------------------------------------------------------
from pyspark.sql import functions as F

from lib.fabric_utils import log, exit_notebook
from lib.transforms import (
    trim_strings,
    coerce_types,
    apply_not_null_default,
    deduplicate,
    flag_invalid,
    add_audit_columns,
)

log("start", source=source_table, target=target_table)

df = spark.read.table(source_table)
n_raw = df.count()

df = trim_strings(df)
df = coerce_types(df, spec.get("casts", {}))
df = apply_not_null_default(df, spec.get("not_null_defaults", {}))
if spec.get("dedupe_keys"):
    df = deduplicate(df, spec["dedupe_keys"], spec.get("dedupe_order_by", spec["dedupe_keys"][0]))
df = flag_invalid(df, spec.get("rules", {}))
df = add_audit_columns(df, run_id, source_table)

clean = df.where("_valid = true").drop("_valid")
bad = df.where("_valid = false").drop("_valid")

n_clean, n_bad = clean.count(), bad.count()
log("cleansed", raw=n_raw, clean=n_clean, quarantined=n_bad)

clean.write.format("delta").mode("overwrite").option("overwriteSchema", "true").saveAsTable(target_table)
if n_bad:
    bad.write.format("delta").mode("append").option("mergeSchema", "true").saveAsTable(quarantine_table)

# A rising quarantine rate usually means an upstream contract changed.
bad_rate = round(n_bad / n_raw, 4) if n_raw else 0.0
exit_notebook({"status": "ok", "clean": n_clean, "quarantined": n_bad, "bad_rate": bad_rate})
