#!/usr/bin/env bash
# Fabric CI/CD Automation Pack — repo hygiene checks.
# Fails the PR on the mistakes that break a deployment or leak an environment.
set -euo pipefail

WORKSPACE_DIR="${WORKSPACE_DIR:-workspaces}" # EDIT if your serialized items live elsewhere
PARAM_FILE="${PARAM_FILE:-config/parameter.yml}"

fail=0
note() { printf '  - %s\n' "$1"; }

echo "==> Hard-coded OneLake / abfss paths"
if grep -rEn "abfss://[^\"' )]*@[a-z0-9-]+\.dfs\.core\.windows\.net" "$WORKSPACE_DIR" 2>/dev/null; then
  note "Found absolute abfss:// paths — use a variable library or deployment rule instead."
  fail=1
fi

echo "==> Hard-coded workspace GUIDs in notebooks / pipelines"
if grep -rEn "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}" \
     "$WORKSPACE_DIR" --include="*.py" --include="*.json" 2>/dev/null \
   | grep -viE "logicalId|\"id\":|objectId" ; then
  note "GUIDs in item bodies are usually a stage-specific binding — parameterise them."
  fail=1
fi

echo "==> parameter.yml is valid YAML"
if [ -f "$PARAM_FILE" ]; then
  python -c "import sys,yaml; yaml.safe_load(open('$PARAM_FILE'))" \
    || { note "$PARAM_FILE is not valid YAML."; fail=1; }
else
  note "$PARAM_FILE not found (skipping) — add it once you have deployment rules."
fi

echo "==> Item folder naming (<Name>.<Type>)"
if [ -d "$WORKSPACE_DIR" ]; then
  while IFS= read -r d; do
    base="$(basename "$d")"
    case "$base" in
      *.Notebook|*.DataPipeline|*.Lakehouse|*.Environment|*.SemanticModel|*.Report|*.Warehouse|*.Dataflow) ;;
      .*) ;;
      *) note "Unexpected item folder name: $base"; fail=1 ;;
    esac
  done < <(find "$WORKSPACE_DIR" -mindepth 2 -maxdepth 2 -type d)
fi

echo "==> TODO / FIXME left in shipped items"
if grep -rEn "TODO|FIXME|XXX" "$WORKSPACE_DIR" --include="*.py" 2>/dev/null; then
  note "Left-in markers — resolve or move to an issue before promoting."
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  echo "==> checks FAILED"
  exit 1
fi
echo "==> checks passed"
