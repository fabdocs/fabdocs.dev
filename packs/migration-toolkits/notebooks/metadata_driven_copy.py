# Fabric notebook — Metadata-driven source copy
# Reads config/migration-manifest.example.json and copies each source table into
# a bronze Delta table. Supports full snapshot and incremental (watermark).
# One notebook, driven by a manifest — not one notebook per table.
#
# Docs: https://fabdocs.dev/docs/playbooks

# ---------------------------------------------------------------------------
# Parameters
# ---------------------------------------------------------------------------
manifest_path = "config/migration-manifest.example.json"
only_table = ""          # optional: run a single "schema.table" from the manifest
mode = "auto"            # auto | full | incremental
# JDBC connection (SQL Server / Snowflake). Prefer a connection / Key Vault
# secret over inline credentials.
jdbc_url = "EDIT-jdbc-url"
jdbc_user = "EDIT-user"
key_vault_url = "https://EDIT.vault.azure.net/"
jdbc_secret_name = "source-db-password"
bronze_prefix = "bronze"

# ---------------------------------------------------------------------------
import json

from pyspark.sql import functions as F

try:
    import notebookutils  # type: ignore
except Exception:
    notebookutils = None


def load_manifest(path: str) -> dict:
    if notebookutils is not None:
        return json.loads(notebookutils.fs.head(path, 1024 * 1024))
    return json.loads(open(path).read())


def jdbc_password() -> str:
    if notebookutils is not None:
        return notebookutils.credentials.getSecret(key_vault_url, jdbc_secret_name)
    raise RuntimeError("Provide the password for a local run.")


def read_source(query: str):
    return (
        spark.read.format("jdbc")
        .option("url", jdbc_url)
        .option("user", jdbc_user)
        .option("password", jdbc_password())
        .option("dbtable", f"({query}) q")
        .option("fetchsize", "10000")
        .load()
    )


def copy_table(entry: dict) -> dict:
    src = f'{entry["source_schema"]}.{entry["source_table"]}'
    tgt = f'{bronze_prefix}.{entry.get("target_table", entry["source_table"]).lower()}'
    wm_col = entry.get("watermark_column")
    run_mode = mode if mode != "auto" else ("incremental" if wm_col else "full")

    if run_mode == "incremental" and wm_col:
        last = "1900-01-01"
        if spark.catalog.tableExists(tgt):
            last = str(spark.read.table(tgt).agg(F.max(wm_col)).first()[0] or last)
        query = f"SELECT * FROM {src} WHERE {wm_col} > '{last}'"
    else:
        query = f"SELECT * FROM {src}"

    df = read_source(query).withColumn("_copied_at", F.current_timestamp()).withColumn("_source", F.lit(src))
    n = df.count()

    if run_mode == "incremental" and spark.catalog.tableExists(tgt):
        (df.write.format("delta").mode("append").option("mergeSchema", "true").saveAsTable(tgt))
    else:
        (df.write.format("delta").mode("overwrite").option("overwriteSchema", "true").saveAsTable(tgt))

    return {"source": src, "target": tgt, "mode": run_mode, "rows": n}


manifest = load_manifest(manifest_path)
tables = manifest["tables"]
if only_table:
    tables = [t for t in tables if f'{t["source_schema"]}.{t["source_table"]}' == only_table]

results = [copy_table(t) for t in tables if t.get("decision", "keep") != "retire"]
print(json.dumps({"copied": results}, indent=2, default=str))
if notebookutils is not None:
    notebookutils.notebook.exit(json.dumps({"copied": results}, default=str))
