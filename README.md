# fabdocs.dev

The production engineering manual for **Microsoft Fabric** — how to build, deploy,
govern, and scale lakehouses, notebooks, and CI/CD pipelines without burning your
capacity budget.

Built with [Fumadocs](https://fumadocs.dev) (Notebook layout) on Next.js 16,
deployed to **Cloudflare Workers** via [OpenNext](https://opennext.js.org/cloudflare).

## Stack

| Piece | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Docs UI | `fumadocs-ui` (Base UI) — Notebook layout, `tabMode="navbar"` |
| Content | `fumadocs-mdx` — MDX in `content/docs` |
| Search | Orama (`/api/search` route handler) |
| Hosting | Cloudflare Workers (`@opennextjs/cloudflare`) |

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

## Content

Docs live in [`content/docs`](content/docs). Each top-level folder is a
**navbar tab** (its `meta.json` has `"root": true`):

```
content/docs/
├── index.mdx                 "Start here"
├── onelake/                  OneLake & Delta Lake
├── data-engineering/         Notebooks, PySpark, NEE
├── cicd/                     Git integration, pipelines, IaC
├── governance/               OneLake security, identity, audit
├── tools/                    CU calculator, VS Code sync
└── playbooks/                Databricks / Snowflake / SSIS migrations
```

Interactive components live in [`src/components`](src/components) and are
registered in [`src/components/mdx.tsx`](src/components/mdx.tsx) — e.g.
`<CuCalculator />` (the CU cost & capacity calculator).

## Deployment (Cloudflare)

Preview the Workers build locally:

```bash
npm run preview      # opennextjs-cloudflare build + wrangler dev
```

Deploy from your machine:

```bash
npx wrangler login
npm run deploy       # opennextjs-cloudflare build + wrangler deploy
```

### Recommended: deploy on git push

In the Cloudflare dashboard → **Workers & Pages → Create → Import a repository**,
select this repo and set:

| Setting | Value |
| --- | --- |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx wrangler deploy` |
| Version command | *(leave default)* |

Cloudflare runs the build on Linux (OpenNext is not fully supported on Windows),
so CI deploys are the reliable path. `wrangler.jsonc` holds the Worker config
(name `fabdocs-dev`, `nodejs_compat`, `ASSETS` binding).

Then point the `fabdocs.dev` custom domain at the Worker under
**Settings → Domains & Routes**.

## Notes

- `next.config.mjs` rewrites `/docs/**/*.md` → the Fumadocs Markdown route so
  crawlers/LLMs can fetch a plain-text version of any page. (`/llms.txt` and
  `/llms-full.txt` are generated too.)
- Edge middleware (`proxy.ts`) was removed — the Cloudflare adapter can't bundle
  Next 16 node middleware yet. The `.md` rewrite above covers the useful part.
