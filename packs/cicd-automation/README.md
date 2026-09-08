# Fabric CI/CD Automation Pack

Drop-in GitHub Actions + scripts to run Microsoft Fabric as workspace-as-code:
validate on PR, promote dev → test → prod on merge, with prod behind a manual
gate. Built to match the patterns at
<https://fabdocs.dev/docs/cicd>.

Licensed for use within your organisation. Do not redistribute.

## What's in the box

```
.github/workflows/
  pr-validate.yml     Static checks on every PR to main
  deploy.yml          Update dev from Git -> deploy dev→test -> gated test→prod
scripts/
  checks.sh           Repo hygiene: hard-coded ids, parameter.yml, naming
  deploy-stage.sh     One deployment-pipeline stage, with --wait
  smoke-test.sh       Run a notebook / pipeline and fail on error
config/
  parameter.yml                 Deployment-rule template (find/replace + bindings)
  variable-library.example.json Per-stage value sets for a variable library
```

## Prerequisites

1. **Repo layout** — a Git-connected **dev** workspace, and a deployment
   pipeline `Analytics Pipeline` with stages `Development`, `Test`, `Production`
   bound to their workspaces. `test` and `prod` are **not** Git-connected.
2. **Service principal (SPN)** — an Entra app added as **Admin** on all three
   workspaces (directly or via a group), with SPN access enabled in the Fabric
   admin portal (`Tenant settings → Service principals can use Fabric APIs`).
3. **GitHub secrets** (repo → Settings → Secrets and variables → Actions):
   | Secret | Value |
   | --- | --- |
   | `FABRIC_CLIENT_ID` | SPN application (client) id |
   | `FABRIC_CLIENT_SECRET` | SPN client secret |
   | `FABRIC_TENANT_ID` | Entra tenant id |
   Put the deploy secrets in a protected **Environment** named `prod` with
   required reviewers so the prod job needs a human approval.
4. **GitHub Environments** — create `test` and `prod`. Add reviewers to `prod`.

## Setup

1. Copy `.github/`, `scripts/`, and `config/` into your repo root.
2. `chmod +x scripts/*.sh`.
3. Edit the workspace / pipeline / item names at the top of each workflow and
   script (search for `EDIT:`).
4. Fill in `config/parameter.yml` and `config/variable-library.example.json`
   with your real connection ids, paths, and capacities.
5. Open a test PR — `pr-validate` should run. Merge it — `deploy` should update
   dev, deploy to test, run the smoke test, then wait for your approval before
   prod.

## Pinning

`ms-fabric-cli` command names still change between releases. The workflows pin
`FAB_VERSION` — bump it deliberately and re-run `fab --help` when you do.

## Support

Questions and fixes: reply to any fabdocs.dev change briefing, or open a
discussion at <https://github.com/fabdocs/fabdocs.dev>.
