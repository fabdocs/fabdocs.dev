#!/usr/bin/env bash
# Fabric CI/CD Automation Pack — deploy one deployment-pipeline stage.
# Usage: deploy-stage.sh "<Pipeline Name>" <SourceStage> <TargetStage> [--items "A.Notebook,B.DataPipeline"]
set -euo pipefail

PIPELINE="${1:?pipeline name required}"
SOURCE="${2:?source stage required}"
TARGET="${3:?target stage required}"
shift 3

ITEMS_ARG=()
while [ $# -gt 0 ]; do
  case "$1" in
    --items) ITEMS_ARG=(--items "$2"); shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

echo "==> Deploying '$PIPELINE': $SOURCE -> $TARGET"

# Show the diff first so it's in the run log for audit.
fab deploy-pipeline "$PIPELINE" --source "$SOURCE" --target "$TARGET" --preview \
  || echo "(preview not supported by this CLI version — continuing)"

fab deploy-pipeline "$PIPELINE" \
  --source "$SOURCE" \
  --target "$TARGET" \
  "${ITEMS_ARG[@]}" \
  --wait

echo "==> $SOURCE -> $TARGET complete"
