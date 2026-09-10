# Fabric notebook — Threshold alerting
# Reads the three monitoring tables, checks them against
# config/monitoring.example.json thresholds, and posts a summary card to a
# Teams incoming webhook when something trips. Run this after the three
# collector notebooks.
#
# Docs: https://fabdocs.dev/docs/tools/capacity-sku-reference

# ---------------------------------------------------------------------------
# Parameters
# ---------------------------------------------------------------------------
config_path = "config/monitoring.example.json"

# ---------------------------------------------------------------------------
import json

import requests
from pyspark.sql import functions as F

try:
    import notebookutils  # type: ignore
except Exception:
    notebookutils = None


def load_config(path: str) -> dict:
    if notebookutils is not None:
        return json.loads(notebookutils.fs.head(path, 1024 * 1024))
    return json.loads(open(path).read())


def webhook_url(cfg: dict) -> str | None:
    alerting = cfg.get("alerting", {})
    if notebookutils is not None and alerting.get("keyVaultUrl"):
        try:
            return notebookutils.credentials.getSecret(
                alerting["keyVaultUrl"], alerting["teamsWebhookSecretName"]
            )
        except Exception:
            pass
    return alerting.get("teamsWebhookUrl")


def post_teams(url: str, title: str, lines: list[str]) -> None:
    card = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "summary": title,
        "themeColor": "D93025",
        "title": title,
        "text": "\n\n".join(f"- {line}" for line in lines),
    }
    requests.post(url, json=card, timeout=30)


cfg = load_config(config_path)
th = cfg["thresholds"]
findings: list[str] = []

# Capacity utilization (very rough: sum(cu_seconds)/86400 vs cuLimit)
if spark.catalog.tableExists("monitoring.capacity_metrics"):
    daily = (
        spark.read.table("monitoring.capacity_metrics")
        .where(F.col("event_time") >= F.date_sub(F.current_date(), 1))
        .groupBy("workspace")
        .agg(F.sum("cu_seconds").alias("cu_seconds"))
        .collect()
    )
    for cap in cfg.get("capacities", []):
        used = sum(r["cu_seconds"] for r in daily) or 0
        pct = round(100 * (used / 86400) / max(cap["cuLimit"], 1), 1)
        if pct >= th["avgCuUtilizationPct"]:
            findings.append(f"Capacity **{cap['name']}** ~{pct}% average utilization (last 24h)")

# Job failure streaks
if spark.catalog.tableExists("monitoring.job_runs"):
    from pyspark.sql.window import Window

    w = Window.partitionBy("workspace", "item").orderBy(F.col("started_at").desc())
    n = th["consecutiveJobFailures"]
    recent = (
        spark.read.table("monitoring.job_runs")
        .withColumn("rn", F.row_number().over(w))
        .where(F.col("rn") <= n)
    )
    bad = (
        recent.groupBy("workspace", "item")
        .agg(F.sum(F.when(F.col("status") == "Failed", 1).otherwise(0)).alias("f"), F.count("*").alias("c"))
        .where((F.col("f") == F.col("c")) & (F.col("c") == n))
        .collect()
    )
    for r in bad:
        findings.append(f"**{r['item']}** ({r['workspace']}) failed its last {n} runs")

if findings:
    print(json.dumps({"alerts": findings}, indent=2))
    url = webhook_url(cfg)
    if url:
        post_teams(url, "Fabric monitoring alert", findings)
    else:
        print("No webhook configured — printed only.")
else:
    print(json.dumps({"alerts": []}))

if notebookutils is not None:
    notebookutils.notebook.exit(json.dumps({"alerts": findings}))
