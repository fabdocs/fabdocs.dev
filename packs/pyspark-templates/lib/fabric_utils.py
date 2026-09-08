"""Shared helpers for Fabric notebooks.

Nothing here touches Fabric at import time, so it is safe to import in a local
pytest run. `notebookutils` / `mssparkutils` are looked up lazily.
"""

from __future__ import annotations

import json
import time
from typing import Any, Iterable

try:  # only present inside a Fabric Spark session
    import notebookutils  # type: ignore
except Exception:  # pragma: no cover - local runs
    notebookutils = None  # type: ignore


def log(event: str, **fields: Any) -> None:
    """Emit one JSON line so the Monitoring hub / a log shipper can parse it."""
    print(json.dumps({"ts": round(time.time(), 3), "event": event, **fields}, default=str))


def require_columns(df, expected: Iterable[str]) -> None:
    """Assert the DataFrame has at least these columns; raise with the diff."""
    missing = set(expected) - set(df.columns)
    if missing:
        raise ValueError(f"schema drift: missing columns {sorted(missing)}")


def assert_row_floor(actual: int, floor: int, label: str) -> None:
    """Guard against silent data loss."""
    if actual < floor:
        raise AssertionError(f"{label}: {actual} rows < expected floor {floor}")


def marker_path(namespace: str, key: str) -> str:
    return f"Files/_markers/{namespace}/{key}.done"


def already_done(namespace: str, key: str) -> bool:
    """True if a previous run wrote the completion marker (idempotency guard)."""
    if notebookutils is None:
        return False
    return notebookutils.fs.exists(marker_path(namespace, key))


def mark_done(namespace: str, key: str) -> None:
    if notebookutils is None:
        return
    notebookutils.fs.put(marker_path(namespace, key), "ok", overwrite=True)


def exit_notebook(value: Any) -> None:
    """Return a string result to the calling pipeline (or print it locally)."""
    payload = value if isinstance(value, str) else json.dumps(value, default=str)
    if notebookutils is not None:
        notebookutils.notebook.exit(payload)
    else:  # pragma: no cover
        print(f"[exit] {payload}")
