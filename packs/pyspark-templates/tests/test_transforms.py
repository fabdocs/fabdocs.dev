from lib.transforms import (
    trim_strings,
    deduplicate,
    coerce_types,
    apply_not_null_default,
    flag_invalid,
    add_audit_columns,
)


def test_trim_strings_blanks_to_null(spark):
    df = spark.createDataFrame([("  hi  ", "   "), ("x", "y")], ["a", "b"])
    out = {r["a"]: r["b"] for r in trim_strings(df).collect()}
    assert out["hi"] is None
    assert out["x"] == "y"


def test_deduplicate_keeps_latest(spark):
    df = spark.createDataFrame(
        [(1, "old", "2026-01-01"), (1, "new", "2026-02-01"), (2, "only", "2026-01-01")],
        ["id", "val", "ts"],
    )
    out = {r["id"]: r["val"] for r in deduplicate(df, ["id"], "ts").collect()}
    assert out == {1: "new", 2: "only"}


def test_coerce_types(spark):
    df = spark.createDataFrame([("10", "2026-01-02")], ["amount", "d"])
    out = coerce_types(df, {"amount": "int", "d": "date", "missing": "int"})
    row = out.collect()[0]
    assert row["amount"] == 10
    assert str(row["d"]) == "2026-01-02"


def test_apply_not_null_default(spark):
    df = spark.createDataFrame([(None, None), ("PAID", 3)], ["status", "qty"])
    out = {(r["status"], r["qty"]) for r in apply_not_null_default(df, {"status": "UNKNOWN", "qty": 0}).collect()}
    assert ("UNKNOWN", 0) in out
    assert ("PAID", 3) in out


def test_flag_invalid(spark):
    df = spark.createDataFrame([(5, 1), (-1, 2), (3, None)], ["amount", "customer_id"])
    rules = {"amt": "amount >= 0", "cust": "customer_id is not null"}
    out = {(r["amount"], r["_valid"]) for r in flag_invalid(df, rules).collect()}
    assert (5, True) in out
    assert (-1, False) in out
    assert (3, False) in out


def test_add_audit_columns(spark):
    df = spark.createDataFrame([(1,)], ["id"])
    out = add_audit_columns(df, "run-123", "bronze.x").collect()[0]
    assert out["_run_id"] == "run-123"
    assert out["_source"] == "bronze.x"
    assert out["_ingested_at"] is not None
