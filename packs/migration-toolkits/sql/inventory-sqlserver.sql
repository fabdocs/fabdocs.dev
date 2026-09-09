/* Fabric Migration Toolkits — SQL Server source inventory.
   Run in the source database. Produces one row per user table with the numbers
   you need to plan the move: size, rows, last write, dependency count, and a
   "likely dead" flag. Export the result set to CSV and tag each row
   keep / retire / rebuild.
   Docs: https://fabdocs.dev/docs/playbooks/from-ssis */

SET NOCOUNT ON;

WITH sizes AS (
    SELECT
        t.object_id,
        SUM(ps.row_count)                              AS row_count,
        SUM(ps.reserved_page_count) * 8.0 / 1024       AS size_mb
    FROM sys.dm_db_partition_stats ps
    JOIN sys.tables t ON t.object_id = ps.object_id
    WHERE ps.index_id IN (0, 1)
    GROUP BY t.object_id
),
deps AS (
    SELECT referenced_id AS object_id, COUNT(*) AS referenced_by
    FROM sys.sql_expression_dependencies
    WHERE referenced_id IS NOT NULL
    GROUP BY referenced_id
),
last_write AS (
    SELECT object_id, MAX(last_user_update) AS last_user_update
    FROM sys.dm_db_index_usage_stats
    WHERE database_id = DB_ID()
    GROUP BY object_id
)
SELECT
    s.name                                   AS [schema],
    t.name                                   AS [table],
    ISNULL(sz.row_count, 0)                   AS [rows],
    CAST(ISNULL(sz.size_mb, 0) AS DECIMAL(18,1)) AS size_mb,
    lw.last_user_update,
    ISNULL(d.referenced_by, 0)               AS referenced_by,
    CASE
        WHEN ISNULL(sz.row_count, 0) = 0 THEN 'empty'
        WHEN lw.last_user_update IS NULL
          OR lw.last_user_update < DATEADD(DAY, -180, SYSUTCDATETIME()) THEN 'likely-dead'
        ELSE ''
    END                                      AS flag,
    ''                                       AS decision  /* keep / retire / rebuild */
FROM sys.tables t
JOIN sys.schemas s      ON s.schema_id = t.schema_id
LEFT JOIN sizes sz      ON sz.object_id = t.object_id
LEFT JOIN deps d        ON d.object_id = t.object_id
LEFT JOIN last_write lw ON lw.object_id = t.object_id
WHERE t.is_ms_shipped = 0
ORDER BY size_mb DESC;
