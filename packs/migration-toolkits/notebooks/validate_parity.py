# Fabric notebook — Parity validation (old vs new)
# For each table in the manifest: compare row count and a set of aggregate
# checksums between the source (via JDBC) and the migrated Delta table. Writes a
# parity report table and fails if any table is outside tolerance.
#
# Run nightly during the parallel-run window. Green for a full business cycle
# before cut-over.
#
# Docs: https://fabdocs.dev/docs/playbooks

# ---------------------------------------------------------------------------
# Parameters
# ---------------------------------------------------------------------------
manifest_path = "config/migration-manifest.example.json"
report_table = "migration.parity_report"
row_tolerance = 0.001          # 0.1% row-count drift allowed
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


def password() -> str:
    return notebookutils.credentials.getSecret(key_vault_url, jdbc_secret_name)


def source_agg(entry: dict) -> dict:
    """Pull count + numeric checksums from the source in one round trip."""
    src = f'{entry["source_schema"]}.{entry["source_table"]}'
    checks = entry.get("checksum_columns", [])
    sums = ", ".join(f"CAST(SUM(CAST({c} AS FLOAT)) AS FLOAT) AS s_{c}" for c in checks) or "0 AS s_none"
    query = f"SELECT COUNT(*) AS n, {sums} FROM {src}"
    row = (
        spark.read.format("jdbc")
        .option("url", jdbc_url).option("user", jdbc_user).option("password", password())
        .option("dbtable", f"({query}) q").load().first()
    )
    return row.asDict()


def target_agg(entry: dict) -> dict:
    tgt = f'{bronze_prefix}.{entry.get("target_table", entry["source_table"]).lower()}'
    checks = entry.get("checksum_columns", [])
    aggs = [F.count(F.lit(1)).alias("n")] + [
        F.sum(F.col(c).cast("double")).alias(f"s_{c}") for c in checks
    ]
    return spark.read.table(tgt).agg(*aggs).first().asDict()


def compare(entry: dict) -> dict:
    s, t = source_agg(entry), target_agg(entry)
    src_n, tgt_n = s.get("n", 0) or 0, t.get("n", 0) or 0
    drift = abs(src_n - tgt_n) / max(src_n, 1)
    checks_ok = True
    detail = {}
    for c in entry.get("checksum_columns", []):
        sv, tv = s.get(f"s_{c}"), t.get(f"s_{c}")
        ok = (sv is None and tv is None) or (
            sv is not None and tv is not None and abs(sv - tv) <= max(abs(sv) * 1e-6, 1e-3)
        )
        detail[c] = {"source": sv, "target": tv, "ok": ok}
        checks_ok = checks_ok and ok
    passed = drift <= row_tolerance and checks_ok
    return {
        "table": f'{entry["source_schema"]}.{entry["source_table"]}',
        "source_rows": src_n,
        "target_rows": tgt_n,
        "row_drift": round(drift, 6),
        "checksums": detail,
        "passed": passed,
    }


manifest = load_manifest(manifest_path)
rows = [compare(t) for t in manifest["tables"] if t.get("decision", "keep") == "keep"]

report = spark.createDataFrame(
    [(r["table"], r["source_rows"], r["target_rows"], r["row_drift"], r["passed"], json.dumps(r["checksums"])) for r in rows],
    ["table", "source_rows", "target_rows", "row_drift", "passed", "checksums"],
).withColumn("_checked_at", F.current_timestamp())
report.write.format("delta").mode("append").option("mergeSchema", "true").saveAsTable(report_table)

failed = [r["table"] for r in rows if not r["passed"]]
print(json.dumps({"checked": len(rows), "failed": failed}, indent=2))
if notebookutils is not None:
    notebookutils.notebook.exit(json.dumps({"checked": len(rows), "failed": failed}))
if failed:
    raise AssertionError(f"parity failed for: {failed}")
