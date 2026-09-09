# Dialect translation cheatsheet

Quick reference for rewriting queries and stored procedures. `translate_ddl.py`
handles types and obvious syntax; this is for the logic it can't.

## Snowflake → Fabric (Warehouse T-SQL)

| Snowflake | Fabric T-SQL |
| --- | --- |
| `IFF(c, a, b)` | `IIF(c, a, b)` |
| `NVL(x, y)` / `ZEROIFNULL(x)` | `ISNULL(x, y)` / `ISNULL(x, 0)` |
| `NVL2(x, a, b)` | `IIF(x IS NOT NULL, a, b)` |
| `TO_VARCHAR(d, 'fmt')` | `FORMAT(d, 'fmt')` |
| `TO_DATE(s, 'fmt')` | `CONVERT(date, s, style)` or `TRY_CONVERT` |
| `DATEADD('day', 1, d)` | `DATEADD(day, 1, d)` |
| `DATEDIFF('day', a, b)` | `DATEDIFF(day, a, b)` |
| `DATE_TRUNC('month', d)` | `DATEFROMPARTS(YEAR(d), MONTH(d), 1)` |
| `LISTAGG(x, ',') WITHIN GROUP (ORDER BY y)` | `STRING_AGG(x, ',') WITHIN GROUP (ORDER BY y)` |
| `LATERAL FLATTEN(input => col)` | `CROSS APPLY OPENJSON(col)` |
| `col:field::string` (VARIANT) | `JSON_VALUE(col, '$.field')` |
| `QUALIFY ROW_NUMBER() OVER (...) = 1` | subquery / CTE with `WHERE rn = 1` |
| `x ILIKE '%foo%'` | `x LIKE '%foo%'` (default CI collation) |
| `POSITION('a', s)` | `CHARINDEX('a', s)` |
| `SPLIT_PART(s, '-', 2)` | `PARSENAME`/`STRING_SPLIT` + ordinal (2022+) |
| `sequence.NEXTVAL` | `NEXT VALUE FOR sequence` |
| Zero-copy `CLONE` | Delta `SHALLOW CLONE`, or a shortcut |
| `AT (TIMESTAMP => ...)` / `BEFORE` | `VERSION AS OF` / `TIMESTAMP AS OF` (Delta) |

## SQL Server / SSIS → Fabric

| SQL Server | Fabric |
| --- | --- |
| `IDENTITY(1,1)` | generate keys in the load (`row_number()` / hash / GUID) |
| `NEWID()` default | set in the notebook (`F.expr("uuid()")`) |
| `GETDATE()` default | `current_timestamp()` in the load, or `SYSUTCDATETIME()` in Warehouse |
| Computed columns | materialise in the transform |
| `MERGE` (T-SQL) | `MERGE` works in Warehouse; use Delta `MERGE` in Spark |
| `xml` / `.nodes()` | store as `VARCHAR`, parse with `OPENJSON` after converting, or handle in Spark |
| `TOP (n) WITH TIES` | `ROW_NUMBER()`/`RANK()` + filter |
| `#temp` tables | CTEs, or real staging Delta tables |
| Linked servers | a pipeline Copy activity or a shortcut |
| SSIS Lookup | `JOIN` (Warehouse) or broadcast join (Spark) |
| SSIS Slowly Changing Dimension | `MERGE` on the business key — see the PySpark Templates pack |
| SSIS Script Component (row-by-row) | redesign as set-based; last resort a Python UDF |

## ANSI / behaviour gotchas

- **ANSI mode**: Fabric Spark trends toward `spark.sql.ansi.enabled = true`.
  Overflow and bad casts *raise* instead of returning NULL. Fix the data/query;
  don't just disable it.
- **Implicit string→number**: not allowed under ANSI — cast explicitly.
- **`||` concat**: works in Spark SQL; in Warehouse use `+` or `CONCAT`.
- **Case sensitivity**: identifiers are case-insensitive; string comparisons
  follow collation (default CI).
- **`NULL` sorting**: Spark sorts NULLs first ascending; add
  `NULLS LAST` where the old engine differed.
