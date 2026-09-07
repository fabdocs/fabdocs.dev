import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Boxes,
  Calculator,
  Database,
  GitBranch,
  Map as MapIcon,
  ShieldCheck,
} from 'lucide-react';
import { appName } from '@/lib/shared';
import { JsonLd } from '@/components/json-ld';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const sections = [
  {
    icon: Database,
    title: 'OneLake & Delta Lake',
    href: '/docs/onelake',
    body: 'Delta optimization, V-Order tuning, VACUUM & retention, and multi-cloud shortcuts that stay consistent.',
  },
  {
    icon: Boxes,
    title: 'Data Engineering',
    href: '/docs/data-engineering',
    body: 'Production PySpark patterns, the Native Execution Engine, resource profiles, and surviving Runtime upgrades.',
  },
  {
    icon: GitBranch,
    title: 'CI/CD & Git',
    href: '/docs/cicd',
    body: 'Workspace-as-code: Git integration, deployment pipelines, variable libraries, GitHub Actions for Fabric.',
  },
  {
    icon: ShieldCheck,
    title: 'Governance & Security',
    href: '/docs/governance',
    body: 'OneLake security roles, workspace identity, and audit logging that passes a compliance review.',
  },
  {
    icon: Calculator,
    title: 'Tools & Calculators',
    href: '/docs/tools',
    body: 'An interactive CU cost & capacity calculator, plus a VS Code sync guide to escape the web UI.',
  },
  {
    icon: MapIcon,
    title: 'Migration Playbooks',
    href: '/docs/playbooks',
    body: 'Step-by-step conversions from Databricks, Snowflake, and SSIS — inventory, move a slice, validate, cut over.',
  },
];

const codeSample = `# Idempotent by default — re-running is always safe
(DeltaTable.forName(spark, target)
    .alias("t")
    .merge(incoming.alias("s"), "t.order_id = s.order_id")
    .whenMatchedUpdateAll(condition="s.updated_at > t.updated_at")
    .whenNotMatchedInsertAll()
    .execute())`;

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={[organizationJsonLd, websiteJsonLd]} />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-fd-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-70 [background:radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--color-fd-primary)_18%,transparent),transparent_70%)]"
        />
        <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center sm:py-32">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs font-medium text-fd-muted-foreground">
            <span className="size-1.5 rounded-full bg-fd-primary" />
            The production engineering manual for Microsoft Fabric
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Microsoft docs tell you <span className="text-fd-muted-foreground">what</span>.
            <br />
            {appName} tells you <span className="text-fd-primary">how</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-lg text-fd-muted-foreground">
            Build, deploy, govern, and scale lakehouses, notebooks, and CI/CD
            pipelines in production — without torching your capacity budget.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90"
            >
              Read the manual
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/docs/tools/cu-cost-calculator"
              className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-5 py-2.5 text-sm font-semibold text-fd-foreground transition-colors hover:bg-fd-accent"
            >
              <Calculator className="size-4" />
              CU cost calculator
            </Link>
          </div>
        </div>
      </section>

      {/* Positioning band */}
      <section className="border-b border-fd-border bg-fd-card/40">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-14 sm:grid-cols-3">
          {[
            {
              k: 'For data engineers',
              v: 'Taming lakehouses, Spark jobs, and Delta table sprawl.',
            },
            {
              k: 'For enterprise architects',
              v: 'Designing OneLake topology, security, and CI/CD that scales.',
            },
            {
              k: 'For analytics leads',
              v: 'Making Capacity Unit burn predictable and defensible.',
            },
          ].map((item) => (
            <div key={item.k}>
              <div className="text-sm font-semibold text-fd-foreground">{item.k}</div>
              <p className="mt-1.5 text-sm text-fd-muted-foreground">{item.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section grid */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight">What&rsquo;s inside</h2>
        <p className="mt-2 text-fd-muted-foreground">
          Six areas, each with production-tested patterns and a stated CU impact.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group flex flex-col gap-3 rounded-xl border border-fd-border bg-fd-card p-5 transition-colors hover:border-fd-primary/40 hover:bg-fd-accent"
            >
              <s.icon className="size-6 text-fd-primary" />
              <div className="font-semibold">{s.title}</div>
              <p className="text-sm text-fd-muted-foreground">{s.body}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-fd-primary opacity-0 transition-opacity group-hover:opacity-100">
                Open <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Code + principle */}
      <section className="border-t border-fd-border bg-fd-card/40">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Patterns, not screenshots
            </h2>
            <p className="mt-3 text-fd-muted-foreground">
              Every notebook is a function: inputs from parameters, deterministic
              output, safe to re-run. Every page states what a technique costs in
              Capacity Units before it tells you how to do it.
            </p>
            <Link
              href="/docs/data-engineering/pyspark-patterns"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-fd-primary"
            >
              Production PySpark patterns <ArrowRight className="size-4" />
            </Link>
          </div>
          <pre className="overflow-x-auto rounded-xl border border-fd-border bg-fd-background p-4 text-[13px] leading-relaxed text-fd-foreground">
            <code>{codeSample}</code>
          </pre>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-5xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Start with the slice that hurts most
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-fd-muted-foreground">
          Runaway CU bills, a lakehouse full of small files, or a deployment
          process that lives in someone&rsquo;s head.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/docs/onelake/delta-optimization"
            className="rounded-lg border border-fd-border bg-fd-card px-4 py-2 text-sm font-medium transition-colors hover:bg-fd-accent"
          >
            Fix small files
          </Link>
          <Link
            href="/docs/tools/cu-cost-calculator"
            className="rounded-lg border border-fd-border bg-fd-card px-4 py-2 text-sm font-medium transition-colors hover:bg-fd-accent"
          >
            Model CU cost
          </Link>
          <Link
            href="/docs/cicd"
            className="rounded-lg border border-fd-border bg-fd-card px-4 py-2 text-sm font-medium transition-colors hover:bg-fd-accent"
          >
            Set up CI/CD
          </Link>
        </div>
      </section>
    </main>
  );
}
