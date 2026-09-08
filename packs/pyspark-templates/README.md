# Fabric PySpark & Notebook Templates

Production-ready, parameterised notebooks for Microsoft Fabric: idempotent
incremental loads, SCD Type 2, a config-driven cleansing framework, and Delta
maintenance — plus the shared helpers and tests to keep them honest.

Built to match <https://fabdocs.dev/docs/data-engineering>. Licensed for use
within your organisation. Do not redistribute.

## Contents

```
notebooks/
  incremental_load.py        Idempotent watermark + MERGE upsert
  scd2_merge.py              Slowly Changing Dimension (Type 2) load
  data_cleansing_framework.py  Rule-driven cleansing from a JSON spec
  delta_maintenance.py       OPTIMIZE / VACUUM / V-Order from a control table
lib/
  fabric_utils.py            Structured logging, boundary assertions, notebookutils guards
  transforms.py              Pure, unit-testable transformation functions
tests/
  conftest.py                Local SparkSession fixture
  test_transforms.py         pytest examples for lib/transforms.py
config/
  tables.example.json        Control table: load + maintenance settings per table
```

## How to use in Fabric

1. Import each file in `notebooks/` and `lib/` as a Fabric notebook (or add
   `lib/` as a **resource** on the notebooks that import it).
2. Every notebook has a **parameter cell** at the top — mark it as the
   parameter cell (`···` menu → *Toggle parameter cell*) so a pipeline can
   override the values.
3. `lib/*` is plain importable Python — nothing Fabric-specific runs at import
   time, so the `tests/` run locally with `pip install pyspark pytest`.
4. Orchestrate with a **data pipeline**: one Notebook activity per table, or a
   `ForEach` over the entries in `config/tables.example.json`.

## Conventions

- **Idempotent**: re-running with the same parameters produces the same table.
- **Fail loud**: row-count and schema assertions at every boundary.
- **Thin notebooks**: logic lives in `lib/`, the notebook is glue + parameters.
- **CU-aware**: comments call out where a choice changes capacity consumption.

## Local testing

```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install pyspark pytest
pytest -q
```

## Support

Reply to any fabdocs.dev change briefing, or open a discussion at
<https://github.com/fabdocs/fabdocs.dev>. Pack updates for new Fabric Runtimes
are included.
