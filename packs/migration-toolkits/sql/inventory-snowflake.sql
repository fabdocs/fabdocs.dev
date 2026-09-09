-- Fabric Migration Toolkits — Snowflake source inventory.
-- Run in the source database (needs access to INFORMATION_SCHEMA and, for the
-- dead-object heuristic, ACCOUNT_USAGE). Export to CSV and tag each row
-- keep / retire / rebuild.
-- Docs: https://fabdocs.dev/docs/playbooks/from-snowflake

WITH tbls AS (
    SELECT
        table_schema,
        table_name,
        row_count,
        bytes / 1024 / 1024                       AS size_mb,
        CASE WHEN table_type = 'VIEW' THEN 'view' ELSE 'table' END AS kind
    FROM information_schema.tables
    WHERE table_schema NOT IN ('INFORMATION_SCHEMA')
),
last_access AS (
    -- Requires ACCOUNT_USAGE (up to ~3h latency). Drop this CTE if unavailable.
    SELECT
        REGEXP_SUBSTR(value:objectName::string, '[^.]+$')          AS table_name,
        MAX(query_start_time)                                       AS last_read
    FROM snowflake.account_usage.access_history,
         LATERAL FLATTEN(input => base_objects_accessed)
    WHERE query_start_time > DATEADD('day', -180, CURRENT_TIMESTAMP())
    GROUP BY 1
),
has_variant AS (
    SELECT table_schema, table_name, COUNT(*) AS variant_cols
    FROM information_schema.columns
    WHERE data_type IN ('VARIANT', 'OBJECT', 'ARRAY')
    GROUP BY 1, 2
)
SELECT
    t.table_schema                                AS "schema",
    t.table_name                                  AS "table",
    t.kind,
    t.row_count                                   AS "rows",
    ROUND(t.size_mb, 1)                           AS size_mb,
    la.last_read,
    COALESCE(hv.variant_cols, 0)                  AS variant_cols,
    CASE
        WHEN t.row_count = 0 THEN 'empty'
        WHEN la.last_read IS NULL THEN 'likely-dead'
        WHEN COALESCE(hv.variant_cols, 0) > 0 THEN 'has-variant'
        ELSE ''
    END                                          AS flag,
    ''                                           AS decision
FROM tbls t
LEFT JOIN last_access la  ON la.table_name = t.table_name
LEFT JOIN has_variant hv  ON hv.table_schema = t.table_schema AND hv.table_name = t.table_name
ORDER BY size_mb DESC NULLS LAST;
