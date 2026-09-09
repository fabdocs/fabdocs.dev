# Control matrix — "who can read this table"

Fill one of these per regulated dataset. The **effective access** is the
intersection of every layer — an auditor wants to see you have traced the whole
chain, not just the OneLake role.

## Dataset: `EDIT-schema.table`

| Layer | Control in place | Who it lets in | Reviewed |
| --- | --- | --- | --- |
| Tenant settings | e.g. external sharing disabled; SPN access scoped to group X | — | date / name |
| Capacity | which workspaces run on this capacity | — | date / name |
| Workspace role | Admin: `<group>` · Member: `<group>` · Contributor: `<group>` · Viewer: `<group>` | full data (Admin/Member bypass OneLake security) | date / name |
| Item permission | who the semantic model / report is shared with | report only, per RLS | date / name |
| OneLake security | roles: `analyst_emea` (RLS `region='EMEA'`, CLS deny `customer_tax_id`), `pii_cleared` (full) | filtered rows/cols per role | date / name |

**Effective readers of full, unfiltered data:** `EDIT` (workspace Admin/Member
groups + `pii_cleared`).

**Classification:** `EDIT` (public / internal / confidential / regulated)
**Retention:** `EDIT` hours (Delta) / `EDIT` days (audit)
**Last full verification with a member account:** `EDIT date` by `EDIT name`
