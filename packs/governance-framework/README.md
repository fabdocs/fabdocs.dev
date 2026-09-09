# Fabric Governance & Security Framework

Ready-to-implement patterns for OneLake security, workspace identity, and audit
logging — the artifacts an enterprise review asks for, as code you can run and
version.

Built to match <https://fabdocs.dev/docs/governance>. Licensed for use within
your organisation. Do not redistribute.

## Contents

```
config/
  security-model.example.json     Role model: members, table/row/column grants per role
  retention-policy.example.json    Retention targets per data classification
notebooks/
  provision_onelake_security.py    Create/update OneLake security roles from the spec
  audit_log_export.py              Land Fabric activity in a Delta table for SIEM
  access_review.py                 "Who can read what" evidence for quarterly recert
scripts/
  setup-workspace-identity.sh      az CLI: role assignments + storage network rules
  export-tenant-settings.sh        Snapshot admin tenant settings to JSON (drift check)
docs/
  COMPLIANCE-CHECKLIST.md          The review checklist, mapped to these artifacts
  CONTROL-MATRIX.md                Layer-by-layer "who can read this table" template
```

## The model

Security in Fabric is layered — tenant settings, capacity, workspace roles, item
permissions, and **OneLake security** (row/column/table). The effective answer to
"who can read this table" is the *intersection* of every layer. This framework:

1. Defines the OneLake security role model as **one JSON file** you review in
   pull requests (`config/security-model.example.json`).
2. Applies it idempotently via the Fabric REST API
   (`notebooks/provision_onelake_security.py`).
3. Exports the audit trail continuously (`notebooks/audit_log_export.py`) and
   produces recertification evidence (`notebooks/access_review.py`).
4. Snapshots tenant settings so config drift is visible
   (`scripts/export-tenant-settings.sh`).

## Setup

1. Fill in `config/security-model.example.json` with your Entra **group** object
   ids (never individuals) and the tables each role may read.
2. Run `scripts/setup-workspace-identity.sh` once per environment to wire trusted
   storage access without stored secrets.
3. Schedule `audit_log_export.py` (daily) and `access_review.py` (monthly) as
   pipeline notebooks.
4. Work through `docs/COMPLIANCE-CHECKLIST.md`; fill `docs/CONTROL-MATRIX.md` for
   each regulated dataset.

## Important

The Fabric REST API surface for OneLake security is still evolving. Every API
call in the notebooks is marked `# EDIT:` with a link to the current reference —
treat these as a working scaffold, verify against the docs for your tenant, and
test with a non-privileged account before rollout.

## Support

Reply to any fabdocs.dev change briefing, or open a discussion at
<https://github.com/fabdocs/fabdocs.dev>.
