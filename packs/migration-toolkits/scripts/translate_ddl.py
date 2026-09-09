#!/usr/bin/env python3
"""Fabric Migration Toolkits — DDL translator.

Translates SQL Server (T-SQL) or Snowflake CREATE TABLE statements into
Fabric-compatible DDL (Warehouse T-SQL, or a Spark SQL / Delta CREATE).

If `sqlglot` is installed it does the heavy lifting; otherwise a regex fallback
handles the common cases. Either way: REVIEW every output file. This is a head
start, not a compiler — computed columns, defaults with functions, check
constraints, and VARIANT shredding still need a human.

Usage:
    python translate_ddl.py --dialect tsql   --target warehouse in.sql  > out.sql
    python translate_ddl.py --dialect snowflake --target delta     in.sql  > out.sql

Docs: https://fabdocs.dev/docs/playbooks
"""
from __future__ import annotations

import argparse
import re
import sys

# --- type maps ------------------------------------------------------------
TSQL_TO_WAREHOUSE = {
    r"\bNVARCHAR\s*\(\s*MAX\s*\)": "VARCHAR(8000)",
    r"\bVARCHAR\s*\(\s*MAX\s*\)": "VARCHAR(8000)",
    r"\bNVARCHAR\b": "VARCHAR",
    r"\bNCHAR\b": "CHAR",
    r"\bDATETIME2?\b": "DATETIME2(6)",
    r"\bSMALLDATETIME\b": "DATETIME2(0)",
    r"\bMONEY\b": "DECIMAL(19,4)",
    r"\bSMALLMONEY\b": "DECIMAL(10,4)",
    r"\bTINYINT\b": "SMALLINT",
    r"\bBIT\b": "BIT",
    r"\bUNIQUEIDENTIFIER\b": "VARCHAR(36)",
    r"\bIMAGE\b": "VARBINARY(8000)",
    r"\bTEXT\b": "VARCHAR(8000)",
    r"\bNTEXT\b": "VARCHAR(8000)",
    r"\bXML\b": "VARCHAR(8000)",
    r"\bDATETIMEOFFSET\b": "DATETIME2(6)",  # loses offset — see cheatsheet
}

SNOWFLAKE_TO_DELTA = {
    r"\bNUMBER\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)": r"DECIMAL(\1,\2)",
    r"\bNUMBER\b": "DECIMAL(38,0)",
    r"\bFLOAT8?\b": "DOUBLE",
    r"\bVARCHAR\s*\(\s*\d+\s*\)": "STRING",
    r"\b(VARCHAR|STRING|TEXT|CHAR)\b": "STRING",
    r"\bVARIANT\b": "STRING",  # holds JSON — parse downstream, see cheatsheet
    r"\bOBJECT\b": "STRING",
    r"\bARRAY\b": "STRING",
    r"\bTIMESTAMP_NTZ\b": "TIMESTAMP",
    r"\bTIMESTAMP_LTZ\b": "TIMESTAMP",
    r"\bTIMESTAMP_TZ\b": "TIMESTAMP",
    r"\bBOOLEAN\b": "BOOLEAN",
    r"\bBINARY\b": "BINARY",
}

# lines we drop and warn about, per dialect
DROP_PATTERNS = [
    (re.compile(r"\bIDENTITY\s*\([^)]*\)", re.I), "IDENTITY removed — generate keys in the load"),
    (re.compile(r"\bROWGUIDCOL\b", re.I), "ROWGUIDCOL removed"),
    (re.compile(r"\bCLUSTERED\b|\bNONCLUSTERED\b", re.I), "index hints removed — use Z-ORDER / liquid clustering"),
    (re.compile(r"\bCONSTRAINT\b.+\bCHECK\b", re.I), "CHECK constraint dropped — enforce in the cleansing job"),
    (re.compile(r"\bDEFAULT\s+\w+\s*\(", re.I), "function DEFAULT dropped — set in the load"),
    (re.compile(r"\bCOLLATE\s+\w+", re.I), "COLLATE removed"),
    (re.compile(r"\bWITH\s*\(.*\bDATA_COMPRESSION.*\)", re.I), "storage options removed"),
)


def apply_map(text: str, mapping: dict[str, str]) -> str:
    for pat, repl in mapping.items():
        text = re.sub(pat, repl, text, flags=re.I)
    return text


def strip_and_warn(text: str) -> tuple[str, list[str]]:
    warnings: list[str] = []
    for pat, msg in DROP_PATTERNS:
        if pat.search(text):
            warnings.append(msg)
            text = pat.sub("", text)
    return text, warnings


def regex_translate(sql: str, dialect: str, target: str) -> str:
    mapping = TSQL_TO_WAREHOUSE if dialect == "tsql" else SNOWFLAKE_TO_DELTA
    out_lines: list[str] = []
    for stmt in re.split(r";\s*\n", sql):
        if not stmt.strip():
            continue
        body = stmt
        if dialect == "tsql":
            body = re.sub(r"\[([^\]]+)\]", r"\1", body)          # drop [brackets]
            body = re.sub(r"\bdbo\.", "", body, flags=re.I)      # default schema
        body = apply_map(body, mapping)
        body, warns = strip_and_warn(body)
        body = re.sub(r",\s*\)", ")", body)                      # trailing commas
        body = re.sub(r"[ \t]+\n", "\n", body)
        if target == "delta" and dialect == "tsql":
            body = re.sub(r"\bCREATE TABLE\b", "CREATE TABLE", body, flags=re.I)
            body += "\nUSING DELTA"
        for w in warns:
            out_lines.append(f"-- WARNING: {w}")
        out_lines.append(body.strip() + ";\n")
    return "\n".join(out_lines)


def sqlglot_translate(sql: str, dialect: str, target: str) -> str | None:
    try:
        import sqlglot
    except ImportError:
        return None
    read = "tsql" if dialect == "tsql" else "snowflake"
    write = "tsql" if target == "warehouse" else "spark"
    pieces = []
    for expr in sqlglot.parse(sql, read=read):
        if expr is None:
            continue
        pieces.append(expr.sql(dialect=write, pretty=True))
    translated = ";\n\n".join(pieces) + ";\n"
    # still run the drop/warn pass for things sqlglot keeps
    translated, _ = strip_and_warn(translated)
    return translated


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("file", help="input .sql file, or - for stdin")
    ap.add_argument("--dialect", choices=["tsql", "snowflake"], required=True)
    ap.add_argument("--target", choices=["warehouse", "delta"], default="warehouse")
    args = ap.parse_args()

    sql = sys.stdin.read() if args.file == "-" else open(args.file, encoding="utf-8").read()

    result = sqlglot_translate(sql, args.dialect, args.target)
    if result is None:
        print("-- (sqlglot not installed — regex fallback; review carefully)", file=sys.stderr)
        result = regex_translate(sql, args.dialect, args.target)

    print(f"-- Translated {args.dialect} -> {args.target} by fabdocs.dev Migration Toolkits")
    print("-- REVIEW every statement. Computed columns, VARIANT shredding, and")
    print("-- function defaults are NOT handled. See docs/function-cheatsheet.md")
    print()
    print(result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
