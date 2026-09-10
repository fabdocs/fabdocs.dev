# Fabric Workspace Monitoring Framework

A monitoring lakehouse + notebooks that answer the three questions capacity
owners actually get asked: *what's burning CU, what's failing, and what's been
abandoned* — before Microsoft's bill or an angry Teams message tells you.

Built to match <https://fabdocs.dev/docs/tools/capacity-sku-reference> and the
[CU cost calculator](https://fabdocs.dev/docs/tools/cu-cost-calculator).
Licensed for use within your organisation. Do not redistribute.

## Contents

```
notebooks/
  collect_capacity_metrics.py   Item-level CU consumption -> Delta, daily
  job_run_health.py             Pipeline/notebook run outcomes; flags failures
                                  and abandoned items (no successful run in N days)
  refresh_health.py             Semantic model refresh history and failure streaks
  alert_on_thresholds.py        Reads the collected tables, posts to a Teams
                                  webhook when a threshold trips
config/
  monitoring.example.json       Scope (workspaces/items) + alert thresholds
report/
  measures.dax                  Starter DAX measures for a Direct Lake report
  README.md                     How to build the three-page starter report
```

## The model

One small **monitoring lakehouse**, fed daily by three notebooks:

```
monitoring.capacity_metrics    item, workspace, operation, cu_seconds, date
monitoring.job_runs            item, workspace, status, duration_s, started_at
monitoring.refresh_history     model, workspace, status, duration_s, started_at
```

`alert_on_thresholds.py` reads all three and posts a summary to a Teams webhook
when something crosses a threshold in `config/monitoring.example.json` — a
capacity CU spike, N consecutive job failures, or a refresh failure streak.

## Setup

1. Create a lakehouse named `Monitoring` (or point the notebooks at an existing
   one).
2. Fill in `config/monitoring.example.json`: the workspaces/capacities in
   scope and your thresholds.
3. Schedule the three collector notebooks daily (a pipeline with three Notebook
   activities, or three scheduled runs).
4. Schedule `alert_on_thresholds.py` after the collectors.
5. Build the starter report per `report/README.md` — three pages: Capacity
   overview, Job health, Refresh health — as a Direct Lake model over the
   monitoring lakehouse.

## What this replaces

The Capacity Metrics app is great for *today's* picture but has a short
retention window and no alerting. This framework gives you your own retained
history, thresholds you control, and evidence for "why did the capacity spike
last Tuesday" three months from now.

## Support

Reply to any fabdocs.dev change briefing, or open a discussion at
<https://github.com/fabdocs/fabdocs.dev>.
