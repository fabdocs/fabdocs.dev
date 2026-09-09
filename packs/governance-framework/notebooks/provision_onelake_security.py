# Fabric notebook — Provision OneLake security roles from a spec
# Reads config/security-model.example.json and creates/updates OneLake security
# roles on the target lakehouse via the Fabric REST API. Idempotent: it diffs
# desired vs. existing and only writes changes.
#
# Docs: https://fabdocs.dev/docs/governance/onelake-security
#
# NOTE: the OneLake security REST surface is still evolving. Every API call is
# marked `# EDIT:` — verify the path/body against the current reference for your
# tenant, and dry-run first.

# ---------------------------------------------------------------------------
# Parameters
# ---------------------------------------------------------------------------
model_path = "config/security-model.example.json"  # or pass the JSON string directly
dry_run = True                                     # start here; flip to False after review

# ---------------------------------------------------------------------------
import json

import requests

try:
    import notebookutils  # type: ignore
except Exception:
    notebookutils = None

FABRIC_API = "https://api.fabric.microsoft.com/v1"  # EDIT: confirm base path


def _token() -> str:
    if notebookutils is not None:
        # EDIT: audience for the Fabric API
        return notebookutils.credentials.getToken("https://api.fabric.microsoft.com")
    raise RuntimeError("Run inside Fabric, or wire your own token here for local testing.")


def _load_model(path: str) -> dict:
    if notebookutils is not None and not path.strip().startswith("{"):
        return json.loads(notebookutils.fs.head(path, 1024 * 1024))
    return json.loads(open(path).read()) if not path.strip().startswith("{") else json.loads(path)


def _headers() -> dict:
    return {"Authorization": f"Bearer {_token()}", "Content-Type": "application/json"}


def get_existing_roles(workspace_id: str, lakehouse_id: str) -> dict:
    # EDIT: confirm the list endpoint for OneLake data-access roles
    url = f"{FABRIC_API}/workspaces/{workspace_id}/items/{lakehouse_id}/dataAccessRoles"
    resp = requests.get(url, headers=_headers(), timeout=60)
    resp.raise_for_status()
    return {r["name"]: r for r in resp.json().get("value", [])}


def desired_role_body(role: dict) -> dict:
    """Translate our spec into the API's role shape (EDIT to match the schema)."""
    permissions = []
    for t in role["tables"]:
        entry = {"table": t["table"], "access": t.get("access", "read")}
        if t.get("rowFilter"):
            entry["rowFilter"] = t["rowFilter"]
        if t.get("denyColumns"):
            entry["columnExclusions"] = t["denyColumns"]
        permissions.append(entry)
    return {
        "name": role["name"],
        "description": role.get("description", ""),
        "members": [{"type": "group", "objectId": m} for m in role["members"]],
        "permissions": permissions,
    }


def apply(model: dict) -> list[dict]:
    ws, lh = model["workspaceId"], model["lakehouseId"]
    existing = {} if dry_run else get_existing_roles(ws, lh)
    actions = []
    for role in model["roles"]:
        body = desired_role_body(role)
        if role["name"] in existing:
            action, method = "update", "PUT"
            url = f"{FABRIC_API}/workspaces/{ws}/items/{lh}/dataAccessRoles/{role['name']}"
        else:
            action, method = "create", "POST"
            url = f"{FABRIC_API}/workspaces/{ws}/items/{lh}/dataAccessRoles"
        actions.append({"role": role["name"], "action": action})
        if dry_run:
            print(json.dumps({"would": action, "role": role["name"], "body": body}, indent=2))
            continue
        resp = requests.request(method, url, headers=_headers(), json=body, timeout=60)
        resp.raise_for_status()
    return actions


model = _load_model(model_path)
result = apply(model)
print(json.dumps({"dry_run": dry_run, "actions": result}, indent=2))

if notebookutils is not None:
    notebookutils.notebook.exit(json.dumps({"dry_run": dry_run, "actions": result}))
