#!/usr/bin/env bash
# Fabric CI/CD Automation Pack — run an item and fail the job if it errors.
# Usage: smoke-test.sh "<Workspace>" "<Item.Notebook|Item.DataPipeline>"
set -euo pipefail

WORKSPACE="${1:?workspace required}"
ITEM="${2:?item required}"

echo "==> Smoke test: '$ITEM' in '$WORKSPACE'"

# `--wait` blocks until the run finishes; a failed run exits non-zero.
if fab job run "$WORKSPACE" --item "$ITEM" --wait; then
  echo "==> Smoke test passed"
else
  echo "==> Smoke test FAILED — check the run in the Fabric monitoring hub" >&2
  exit 1
fi
