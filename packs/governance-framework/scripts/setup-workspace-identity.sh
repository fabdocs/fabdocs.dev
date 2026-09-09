#!/usr/bin/env bash
# Fabric Governance Framework — wire trusted storage access for a workspace
# identity: grant it on the ADLS Gen2 account and add a resource-instance
# network rule so firewalled storage still trusts Fabric traffic.
#
# Prereqs: az CLI logged in with rights on the storage account; the workspace
# identity already created (Workspace settings -> Workspace identity).
#
# Docs: https://fabdocs.dev/docs/governance/workspace-identity
set -euo pipefail

# --- EDIT -------------------------------------------------------------------
SUBSCRIPTION="EDIT-subscription-id"
RESOURCE_GROUP="EDIT-rg"
STORAGE_ACCOUNT="EDIT-adls-account"
CONTAINER="landing"
WORKSPACE_IDENTITY_OBJECT_ID="EDIT-workspace-identity-objectid"   # from Workspace settings
TENANT_ID="EDIT-tenant-id"
ROLE="Storage Blob Data Reader"   # or "Storage Blob Data Contributor" for write
# -------------------------------------------------------------------------

az account set --subscription "$SUBSCRIPTION"

SCOPE="/subscriptions/${SUBSCRIPTION}/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.Storage/storageAccounts/${STORAGE_ACCOUNT}"

echo "==> Granting '$ROLE' to the workspace identity on $STORAGE_ACCOUNT"
az role assignment create \
  --assignee-object-id "$WORKSPACE_IDENTITY_OBJECT_ID" \
  --assignee-principal-type ServicePrincipal \
  --role "$ROLE" \
  --scope "${SCOPE}/blobServices/default/containers/${CONTAINER}"

echo "==> Locking the account to 'Selected networks' with a Fabric trusted-service exception"
az storage account update \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --public-network-access Enabled \
  --default-action Deny \
  --bypass AzureServices

# Resource instance rule so this specific Fabric tenant is trusted.
az storage account network-rule add \
  --account-name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --tenant-id "$TENANT_ID" \
  --resource-id "/subscriptions/${SUBSCRIPTION}/providers/Microsoft.Fabric/*"  # EDIT: narrow to your capacity/workspace resource id

echo "==> Done. In the shortcut/connection dialog, choose auth method 'Workspace identity' and enable the trusted-service exception."
