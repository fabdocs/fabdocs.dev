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

## Ask AI assistant + Pro subscription

An "Ask AI" button on every docs page opens a chat panel (`src/components/ai/search.tsx`)
that streams from `POST /api/chat` — an LLM with a `search` tool grounded in the
docs content (flexsearch over the processed markdown), citing the pages it used.

**Tiers** (`src/lib/ai-limits.ts`): Free = 5 questions/day per IP; **Pro ($5/mo)**
= 200/day. Pro is a cookie-based Stripe subscription — no user accounts:

- `POST /api/checkout` → Stripe Checkout → `GET /api/checkout/success` sets a
  signed `fd_sub` cookie holding the Stripe customer id
- `POST /api/stripe/webhook` writes subscription status to KV (`sub:<cid>`)
- `src/lib/subscription.ts` trusts the cookie for 6h, then re-validates against KV
- `POST /api/billing/portal` → Stripe billing portal
- `/pricing` page reflects current plan and gates the CTA

**Config** (Cloudflare Worker → Settings → Variables and Secrets; see
`.dev.vars.example`):

| Var | Needed for | Notes |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | the assistant | without it, `/api/chat` returns 503 |
| `ANTHROPIC_MODEL` | — | optional, defaults to `claude-haiku-4-5-20251001` |
| `COOKIE_SIGNING_SECRET` | Pro | `openssl rand -base64 32` |
| `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID` | Pro checkout | a $5/mo recurring Price |
| `STRIPE_WEBHOOK_SECRET` | Pro sync | endpoint on `/api/stripe/webhook`, events `customer.subscription.*` |

KV namespace `KV` (binding in `wrangler.jsonc`) backs both rate-limiting
(`ratelimit:` keys) and subscription state (`sub:` keys). The whole feature
degrades gracefully: no `ANTHROPIC_API_KEY` → assistant off; no Stripe vars →
Pro shows "coming soon"; everything else keeps working.

## SEO & analytics

- `src/app/sitemap.ts` and `src/app/robots.ts` generate `/sitemap.xml` and
  `/robots.txt` from the docs source. Submit the sitemap in Google Search
  Console + Bing Webmaster Tools.
- JSON-LD: `Organization` + `WebSite` on the home page, `TechArticle` +
  `BreadcrumbList` on every docs page (`src/lib/seo.ts`, `src/components/json-ld.tsx`).
- Per-page canonical URLs, OpenGraph, Twitter cards, and generated OG images
  (`/og/docs/**`).
- **Analytics**: Cloudflare Web Analytics, via a beacon script in
  `src/app/layout.tsx` gated on `NEXT_PUBLIC_CF_BEACON_TOKEN` (set in
  `wrangler.jsonc`'s `vars` — safe to commit, it's meant to be publicly
  visible in the rendered page). To point it at a different site or
  regenerate the token: Cloudflare dashboard → your account → **Web
  Analytics** → add/select the site → copy the token out of the JS snippet.

## Notes

- `next.config.mjs` rewrites `/docs/**/*.md` → the Fumadocs Markdown route so
  crawlers/LLMs can fetch a plain-text version of any page. (`/llms.txt` and
  `/llms-full.txt` are generated too.)
- Edge middleware (`proxy.ts`) was removed — the Cloudflare adapter can't bundle
  Next 16 node middleware yet. The `.md` rewrite above covers the useful part.
- The desktop nav's **Tools** and **More** dropdowns
  (`src/components/site-nav-menu.tsx`) are a custom Radix `NavigationMenu`,
  not Fumadocs' built-in menu item — Fumadocs anchors its dropdown's popup to
  the whole nav row rather than the trigger that opened it. Desktop-only
  (`on: 'nav'` in `src/lib/layout.shared.tsx`); flat equivalents render in
  Fumadocs' own mobile menu (`on: 'menu'`) instead.
