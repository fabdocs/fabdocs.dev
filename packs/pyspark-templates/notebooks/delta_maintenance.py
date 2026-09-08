# Fabric notebook — Delta maintenance
# Runs OPTIMIZE (+ optional Z-ORDER), sets V-Order / target file size, and
# VACUUMs — per table, driven by config/tables.example.json. Schedule this
# off-peak (see the docs for a maintenance cadence).
#
# Docs: https://fabdocs.dev/docs/onelake/delta-optimization
#       https://fabdocs.dev/docs/onelake/vacuum-and-retention
#       https://fabdocs.dev/docs/onelake/v-order

# ---------------------------------------------------------------------------
# Parameters
# ---------------------------------------------------------------------------
# A subset of config/tables.example.json -> "maintenance". Inline here for
# clarity; a pipeline can pass this as a JSON string parameter instead.
tables = [
    {
        "name": "silver.orders",
        "zorder_by": ["customer_id", "order_date"],
        "vorder": True,
        "target_file_mb": 128,
        "vacuum_retain_hours": 168,
    },
    {
        "name": "bronze.events",
        "zorder_by": [],
        "vorder": False,
        "target_file_mb": 256,
        "vacuum_retain_hours": 72,
    },
]
dry_run = False

# ---------------------------------------------------------------------------
from lib.fabric_utils import log, exit_notebook

results = []

for t in tables:
    name = t["name"]
    if not spark.catalog.tableExists(name):
        log("skip", table=name, reason="does not exist")
        continue

    # table properties
    props = {
        "delta.targetFileSize": str(int(t.get("target_file_mb", 128)) * 1024 * 1024),
        "delta.parquet.vorder.enabled": "true" if t.get("vorder") else "false",
    }
    if t.get("vacuum_retain_hours"):
        props["delta.deletedFileRetentionDuration"] = f"interval {int(t['vacuum_retain_hours'])} hours"
    set_clause = ", ".join(f"'{k}' = '{v}'" for k, v in props.items())
    log("set-props", table=name, props=props)
    if not dry_run:
        spark.sql(f"ALTER TABLE {name} SET TBLPROPERTIES ({set_clause})")

    # optimize (+ z-order)
    zcols = t.get("zorder_by") or []
    opt_sql = f"OPTIMIZE {name}" + (f" ZORDER BY ({', '.join(zcols)})" if zcols else "")
    log("optimize", table=name, sql=opt_sql)
    if not dry_run:
        spark.sql(opt_sql)

    # vacuum
    retain = int(t.get("vacuum_retain_hours", 168))
    vac_sql = f"VACUUM {name} RETAIN {retain} HOURS" + (" DRY RUN" if dry_run else "")
    log("vacuum", table=name, sql=vac_sql)
    spark.sql(vac_sql)

    detail = spark.sql(f"DESCRIBE DETAIL {name}").first()
    avg_mb = round((detail["sizeInBytes"] or 0) / max(detail["numFiles"] or 1, 1) / 1e6, 1)
    results.append({"table": name, "numFiles": detail["numFiles"], "avgFileMB": avg_mb})

log("done", results=results)
exit_notebook({"status": "ok", "tables": results})
