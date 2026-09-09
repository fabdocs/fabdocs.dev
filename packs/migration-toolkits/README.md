# Fabric Migration Toolkits

Move an enterprise warehouse or lakehouse into Microsoft Fabric with the boring
parts done: inventory the source, translate the DDL, copy the data with a
manifest, and prove parity before you cut over.

Covers **SQL Server / SSIS**, **Snowflake**, and **Databricks** sources. Built
to match <https://fabdocs.dev/docs/playbooks>. Licensed for use within your
organisation. Do not redistribute.

## Contents

```
sql/
  inventory-sqlserver.sql       Tables, sizes, row counts, dependencies, dead objects
  inventory-snowflake.sql       Same, for Snowflake
scripts/
  translate_ddl.py              SQL Server / Snowflake DDL -> Fabric-compatible DDL
docs/
  function-cheatsheet.md        Dialect translation reference (functions, syntax)
  cutover-runbook.md            The parallel-run + cut-over checklist
notebooks/
  metadata_driven_copy.py       Copy source tables into bronze from a manifest (JDBC / files)
  validate_parity.py            Row counts + aggregate checksums, old vs new, per table
config/
  migration-manifest.example.json  The table list + per-table load settings
```

## The arc

1. **Inventory** — run the `sql/inventory-*.sql` script against the source.
   Tag every table **keep / retire / rebuild**. A third of most estates is dead.
2. **Pick a thin slice** — one source table → one transform → one output, end to
   end. Prove the pattern and your CI before scaling out.
3. **Translate DDL** — `scripts/translate_ddl.py` maps types and rewrites the
   obvious syntax. Review every file; it is a head start, not a compiler.
4. **Load** — fill `config/migration-manifest.example.json`, run
   `notebooks/metadata_driven_copy.py` (history once, then incremental).
5. **Validate** — `notebooks/validate_parity.py` compares counts and checksums
   per table. Green for a full business cycle before cut-over.
6. **Cut over** — follow `docs/cutover-runbook.md`. Done = the *old* pipeline is
   deleted.

## Requirements

- A Fabric capacity, a dev workspace, one lakehouse, one warehouse.
- Network path from Fabric to the source (a Data Gateway or firewall rule) for
  JDBC copies; or an unload-to-Parquet + shortcut for large history.
- Python: `pip install sqlglot` for `translate_ddl.py` (optional but recommended).

## Support

Reply to any fabdocs.dev change briefing, or open a discussion at
<https://github.com/fabdocs/fabdocs.dev>.
