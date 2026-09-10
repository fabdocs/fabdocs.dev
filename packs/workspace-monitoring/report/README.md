# Starter monitoring report

A three-page Power BI report on **Direct Lake** over the `monitoring`
lakehouse. No import, no refresh schedule to manage — it reads the collector
notebooks' output live.

## Build it

1. In the `Monitoring` lakehouse, **New report** (or a new semantic model
   pointed at the lakehouse's SQL endpoint / Direct Lake).
2. Add the three tables: `capacity_metrics`, `job_runs`, `refresh_history`.
3. If you track multiple capacities, add a small `capacities` table (id, name,
   cu_limit) — either a manual table or synced from
   `config/monitoring.example.json` — and relate it to `capacity_metrics` on
   `workspace`/capacity id.
4. Paste in `measures.dax` (one measure at a time — Power BI doesn't bulk-import
   DAX from a file).

## Pages

**1. Capacity overview**
- Card: `Avg CU Utilization %`, `Total CU Seconds (24h)`
- Line chart: `CU Trend 7d` by day
- Bar chart: CU seconds by `item`, top 10
- Card: `Top Item by CU (24h)`

**2. Job health**
- Card: `Job Success Rate %`, `Failed Jobs (7d)`, `Abandoned Items`
- Table: item, workspace, last status, last run time — conditional formatting
  red on `Failed`
- Bar chart: `Avg Job Duration (min)` by item

**3. Refresh health**
- Card: `Refresh Success Rate %`, `Models With Failing Streak`
- Table: model, workspace, last status, `Refresh P90 Duration (min)`
- Line chart: refresh duration trend by model

## Distribution

Pin page 1 to a dashboard for capacity owners; share the full report with the
platform team. Set a **data alert** on `Avg CU Utilization %` for a fast path
that doesn't depend on `alert_on_thresholds.py`.
