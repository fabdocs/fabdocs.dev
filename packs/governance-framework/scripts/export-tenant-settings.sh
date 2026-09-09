#!/usr/bin/env bash
# Fabric Governance Framework — snapshot admin tenant settings to a timestamped
# JSON file so configuration drift is visible in Git. Run on a schedule (a
# GitHub Action cron) and commit the output; a diff = a governance event.
#
# Prereqs: a service principal that is a Fabric Administrator, with API access
# enabled. Exports FABRIC_CLIENT_ID / FABRIC_CLIENT_SECRET / FABRIC_TENANT_ID.
#
# Docs: https://fabdocs.dev/docs/governance
set -euo pipefail

: "${FABRIC_CLIENT_ID:?}"; : "${FABRIC_CLIENT_SECRET:?}"; : "${FABRIC_TENANT_ID:?}"

OUT_DIR="${1:-governance-snapshots}"
mkdir -p "$OUT_DIR"
STAMP="$(date -u +%Y%m%d)"

TOKEN="$(curl -s -X POST \
  "https://login.microsoftonline.com/${FABRIC_TENANT_ID}/oauth2/v2.0/token" \
  -d "grant_type=client_credentials" \
  -d "client_id=${FABRIC_CLIENT_ID}" \
  -d "client_secret=${FABRIC_CLIENT_SECRET}" \
  -d "scope=https://api.fabric.microsoft.com/.default" | python -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')"

fetch() { # $1 = api path, $2 = output filename
  curl -s -H "Authorization: Bearer ${TOKEN}" \
    "https://api.fabric.microsoft.com/v1/admin/$1" \
    | python -m json.tool > "${OUT_DIR}/${STAMP}-$2.json"
  echo "  wrote ${OUT_DIR}/${STAMP}-$2.json"
}

echo "==> Snapshotting tenant configuration"
fetch "tenantsettings" "tenant-settings"          # EDIT: confirm path
fetch "workspaces?type=Workspace" "workspaces"
fetch "capacities" "capacities"

echo "==> Commit these files. A diff on the next run is a change to review."
