#!/usr/bin/env bash
# Fabric CI/CD Automation Pack — assert every variable is defined in every
# value set of the variable library. A key present in Default but missing
# elsewhere silently falls back to the Default value in that stage.
# Usage: check-value-sets.sh [config/variable-library.example.json]
set -euo pipefail

FILE="${1:-config/variable-library.example.json}"
[ -f "$FILE" ] || { echo "not found: $FILE" >&2; exit 2; }

python - "$FILE" <<'PY'
import json, sys
data = json.load(open(sys.argv[1]))
variables = set(data["variables"])
sets = data["valueSets"]
bad = 0
for name, values in sets.items():
    missing = variables - set(values)
    extra = set(values) - variables
    if missing:
        print(f"  value set '{name}' is MISSING: {', '.join(sorted(missing))}")
        bad = 1
    if extra:
        print(f"  value set '{name}' has UNDECLARED keys: {', '.join(sorted(extra))}")
        bad = 1
sys.exit(bad)
PY

echo "==> value sets OK"
