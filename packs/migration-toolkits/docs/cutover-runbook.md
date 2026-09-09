# Cut-over runbook

The migration is not done when the new pipeline runs — it is done when the
**old one is deleted**. Work through this per subject area (not the whole estate
at once).

## T-minus 2+ weeks — parallel run

- [ ] New pipeline runs on the same schedule as the old, into separate tables.
- [ ] `validate_parity.py` runs nightly; the parity report is **green for every
      `keep` table** for a full business cycle (include a month-end close).
- [ ] A business user has signed off on **one report** built on the new data.
- [ ] Downstream consumers inventoried (reports, extracts, APIs, other teams).
- [ ] Rollback is written down: re-point consumers to the old tables, re-enable
      the old schedule. Test it once.

## T-minus 2 days — freeze

- [ ] Announce the cut-over window to consumers.
- [ ] Freeze schema changes on both sides.
- [ ] Final full parity run — investigate any drift, don't wave it through.

## Cut-over day

- [ ] Run the old pipeline one last time; snapshot its output.
- [ ] Run the new pipeline; confirm parity against that snapshot.
- [ ] Re-point consumers: swap connection strings / semantic model sources to the
      Fabric endpoints. Prefer a rename so names don't change for consumers.
- [ ] Smoke-test the top 5 reports and any critical extract.
- [ ] **Disable** (do not delete) the old SQL Agent job / ADF trigger / SSIS
      package. Keep it disabled-but-present as the rollback.

## T-plus 1 cycle — decommission

- [ ] One clean business cycle on Fabric with no incidents.
- [ ] Consumers confirmed migrated; no traffic on the old tables (check the
      source's `access_history` / index usage stats).
- [ ] **Delete** the old pipeline and its objects. Archive the source DB backup
      per your retention policy.
- [ ] Close the migration ticket. Record CU consumption vs. the old compute cost.
