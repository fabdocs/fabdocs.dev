"""Pure transformation functions — no I/O, no Fabric, fully unit-testable.

The notebooks read parameters and call these; keep business logic here so it
can be tested with a local SparkSession.
"""

from __future__ import annotations

from typing import Sequence

from pyspark.sql import DataFrame
from pyspark.sql import functions as F
from pyspark.sql import types as T


def add_audit_columns(df: DataFrame, run_id: str, source: str) -> DataFrame:
    """Stamp every row with lineage columns."""
    return (
        df.withColumn("_run_id", F.lit(run_id))
        .withColumn("_source", F.lit(source))
        .withColumn("_ingested_at", F.current_timestamp())
    )


def deduplicate(df: DataFrame, keys: Sequence[str], order_by: str) -> DataFrame:
    """Keep the latest row per key by `order_by` (descending)."""
    w = _window(keys, order_by)
    return (
        df.withColumn("_rn", F.row_number().over(w))
        .where(F.col("_rn") == 1)
        .drop("_rn")
    )


def _window(keys: Sequence[str], order_by: str):
    from pyspark.sql.window import Window

    return Window.partitionBy(*keys).orderBy(F.col(order_by).desc_nulls_last())


def trim_strings(df: DataFrame) -> DataFrame:
    """Trim every string column; turn empty strings into NULL."""
    out = df
    for field in df.schema.fields:
        if isinstance(field.dataType, T.StringType):
            trimmed = F.trim(F.col(field.name))
            out = out.withColumn(
                field.name,
                F.when(trimmed == F.lit(""), F.lit(None)).otherwise(trimmed),
            )
    return out


def coerce_types(df: DataFrame, casts: dict[str, str]) -> DataFrame:
    """Cast columns per {column: spark_type}. Unknown columns are ignored."""
    out = df
    for col, spark_type in casts.items():
        if col in out.columns:
            out = out.withColumn(col, F.col(col).cast(spark_type))
    return out


def apply_not_null_default(df: DataFrame, defaults: dict[str, object]) -> DataFrame:
    """Fill NULLs in the given columns with a default value."""
    present = {c: v for c, v in defaults.items() if c in df.columns}
    return df.fillna(present) if present else df


def flag_invalid(df: DataFrame, rules: dict[str, str]) -> DataFrame:
    """Add a boolean `_valid` column: True only if every SQL rule passes.

    `rules` maps a rule name to a SQL boolean expression, e.g.
    {"amount_positive": "amount >= 0", "has_customer": "customer_id is not null"}
    """
    if not rules:
        return df.withColumn("_valid", F.lit(True))
    expr = " AND ".join(f"({r})" for r in rules.values())
    return df.withColumn("_valid", F.expr(expr))
