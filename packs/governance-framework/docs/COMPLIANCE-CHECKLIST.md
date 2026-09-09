# Fabric compliance review checklist

Work top to bottom. Each item names the artifact in this pack that produces the
evidence. "Owner" is the person who signs off; "Cadence" is how often it repeats.

## Identity & access

- [ ] **OneLake security roles modelled on groups, not individuals.**
      → `config/security-model.example.json`, applied by
      `notebooks/provision_onelake_security.py`. Owner: data owner. Cadence: on change.
- [ ] **Workspace Admin / Member membership is minimal and named.**
      Those roles bypass OneLake security by design. List every member and why.
      Owner: workspace admin. Cadence: quarterly.
- [ ] **Trusted storage access uses workspace identity, not stored keys.**
      → `scripts/setup-workspace-identity.sh`. Owner: platform. Cadence: on new storage.
- [ ] **Service principals: least privilege, secrets in Key Vault, rotation set.**
      Owner: platform. Cadence: per secret policy.
- [ ] **Direct Lake models use SSO to OneLake** (not a fixed identity) for
      regulated data. Owner: BI lead. Cadence: quarterly.

## Data protection

- [ ] **Sensitive tables and columns inventoried** with a classification.
      → `config/retention-policy.example.json` (`tables` map). Owner: data owner. Cadence: quarterly.
- [ ] **RLS / CLS verified with a real member account** per role — Spark, SQL
      endpoint, and a Direct Lake report all return the filtered set.
      Owner: data owner. Cadence: on change + quarterly.
- [ ] **Retention policy set on tables** to match classification
      (`delta.deletedFileRetentionDuration`). Owner: data eng. Cadence: on new table.
- [ ] **Default-deny confirmed** — a principal with no role sees nothing.
      Owner: data owner. Cadence: quarterly.

## Audit & monitoring

- [ ] **Unified audit log exported continuously** to durable storage / SIEM.
      → `notebooks/audit_log_export.py` (daily). Owner: security. Cadence: daily job + monthly check.
- [ ] **Workspace Monitoring enabled** on regulated workspaces with an explicit
      Eventhouse retention policy. Owner: platform. Cadence: on new workspace.
- [ ] **Alerts** on: permission changes to regulated workspaces, workspace
      identity changes, OneLake security role edits. Owner: security. Cadence: on setup.
- [ ] **Quarterly access review** — granted vs. actually used, exceptions
      signed off. → `notebooks/access_review.py` + `docs/CONTROL-MATRIX.md`.
      Owner: data owner. Cadence: quarterly.

## Change control

- [ ] **Security model changes go through pull request** (the JSON spec is in Git).
      Owner: data owner. Cadence: per change.
- [ ] **Tenant settings snapshotted** and diffed. → `scripts/export-tenant-settings.sh`.
      Owner: Fabric admin. Cadence: weekly.
- [ ] **Prod deploys are gated** (no manual publish in prod). Owner: platform. Cadence: per deploy.
