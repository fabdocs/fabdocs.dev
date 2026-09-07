import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Boxes,
  Calculator,
  Database,
  GaugeCircle,
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

const stats = [
  { value: '27', label: 'production guides' },
  { value: '6', label: 'engineering domains' },
  { value: 'CU', label: 'impact stated on every page' },
];

function K({ children }: { children: ReactNode }) {
  return <span className="text-fd-primary">{children}</span>;
}
function C({ children }: { children: ReactNode }) {
  return <span className="text-fd-muted-foreground">{children}</span>;
}
function S({ children }: { children: ReactNode }) {
  return <span className="text-amber-600 dark:text-amber-400">{children}</span>;
}

function CodeWindow({
  filename,
  children,
  className = '',
}: {
  filename: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-fd-border bg-fd-card shadow-2xl shadow-black/5 dark:shadow-black/40 ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-fd-border bg-fd-muted/50 px-4 py-2.5">
        <span className="size-3 rounded-full bg-red-400/80" />
        <span className="size-3 rounded-full bg-amber-400/80" />
        <span className="size-3 rounded-full bg-emerald-400/80" />
        <span className="ml-2 font-mono text-xs text-fd-muted-foreground">{filename}</span>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono">{children}</code>
      </pre>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={[organizationJsonLd, websiteJsonLd]} />

      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-fd-border">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] glow-teal" />

        <div className="mx-auto grid max-w-6xl gap-14 px-4 py-20 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card/80 px-3 py-1 text-xs font-medium text-fd-muted-foreground backdrop-blur">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-fd-primary opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-fd-primary" />
              </span>
              The production engineering manual for Microsoft Fabric
            </span>

            <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Microsoft docs tell you <span className="text-fd-muted-foreground">what</span>.
              <br />
              {appName} tells you <span className="text-fd-primary">how</span>.
            </h1>

            <p className="mt-6 max-w-xl text-lg text-fd-muted-foreground">
              Build, deploy, govern, and scale lakehouses, notebooks, and CI/CD
              pipelines in production — without torching your capacity budget.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground shadow-lg shadow-fd-primary/25 transition-transform hover:-translate-y-0.5"
              >
                Read the manual
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/docs/tools/cu-cost-calculator"
                className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-5 py-2.5 text-sm font-semibold text-fd-foreground transition-colors hover:bg-fd-accent"
              >
                <Calculator className="size-4 text-fd-primary" />
                CU cost calculator
              </Link>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-bold tracking-tight text-fd-foreground">{s.value}</dt>
                  <dd className="mt-1 text-xs leading-snug text-fd-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <CodeWindow filename="silver_orders.Notebook.py" className="lg:rotate-1">
{`
`}<C># Idempotent by default — re-running is always safe</C>{`
`}<K>from</K>{` delta.tables `}<K>import</K>{` DeltaTable

`}<K>await</K>{` (
    DeltaTable.forName(spark, `}<S>&quot;silver.orders&quot;</S>{`)
        .alias(`}<S>&quot;t&quot;</S>{`)
        .merge(incoming.alias(`}<S>&quot;s&quot;</S>{`), `}<S>&quot;t.order_id = s.order_id&quot;</S>{`)
        .whenMatchedUpdateAll(condition=`}<S>&quot;s.updated_at &gt; t.updated_at&quot;</S>{`)
        .whenNotMatchedInsertAll()
        .execute()
)

`}<C># CU impact: nightly OPTIMIZE pays for itself in a week</C>{`
spark.sql(`}<S>&quot;OPTIMIZE silver.orders&quot;</S>{`)
`}
          </CodeWindow>
        </div>
      </section>

      {/* Audience band */}
      <section className="border-b border-fd-border bg-fd-card/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-3">
          {[
            { k: 'For data engineers', v: 'Taming lakehouses, Spark jobs, and Delta table sprawl.' },
            { k: 'For enterprise architects', v: 'Designing OneLake topology, security, and CI/CD that scales.' },
            { k: 'For analytics leads', v: 'Making Capacity Unit burn predictable and defensible.' },
          ].map((item) => (
            <div key={item.k} className="flex gap-3">
              <GaugeCircle className="mt-0.5 size-5 shrink-0 text-fd-primary" />
              <div>
                <div className="text-sm font-semibold text-fd-foreground">{item.k}</div>
                <p className="mt-1 text-sm text-fd-muted-foreground">{item.v}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section grid */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What&rsquo;s inside</h2>
          <p className="mt-3 text-fd-muted-foreground">
            Six areas, each with production-tested patterns and a stated CU impact —
            not a feature tour.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group relative flex flex-col gap-3 rounded-xl border border-fd-border bg-fd-card p-5 transition-all hover:-translate-y-0.5 hover:border-fd-primary/40 hover:shadow-lg hover:shadow-fd-primary/5"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary ring-1 ring-inset ring-fd-primary/20">
                <s.icon className="size-5" />
              </span>
              <div className="font-semibold">{s.title}</div>
              <p className="text-sm text-fd-muted-foreground">{s.body}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-fd-primary">
                Open
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Patterns band */}
      <section className="border-y border-fd-border bg-fd-card/40">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Patterns, not screenshots</h2>
            <p className="mt-4 text-fd-muted-foreground">
              Every notebook is a function: inputs from parameters, deterministic
              output, safe to re-run. Every page states what a technique costs in
              Capacity Units before it tells you how to do it.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                'Idempotent MERGE and replaceWhere — never blind appends',
                'Native Execution Engine tuning to cut CU per run',
                'Deployment pipelines + variable libraries, no manual publish',
              ].map((li) => (
                <li key={li} className="flex gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-fd-primary" />
                  <span className="text-fd-muted-foreground">{li}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/docs/data-engineering/pyspark-patterns"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-fd-primary"
            >
              Production PySpark patterns <ArrowRight className="size-4" />
            </Link>
          </div>

          <CodeWindow filename="resource_profile.py" className="lg:-rotate-1">
{`
`}<C># Match the profile to the workload shape —</C>{`
`}<C># one setting flips ~20 Spark configs correctly</C>{`
spark.conf.set(
    `}<S>&quot;spark.fabric.resourceProfile&quot;</S>{`,
    `}<S>&quot;readHeavyForSpark&quot;</S>{`,
)

`}<K>if</K>{` job.is_streaming_sink:
    profile = `}<S>&quot;writeHeavy&quot;</S>{`
`}<K>elif</K>{` job.feeds_direct_lake:
    profile = `}<S>&quot;readHeavyForPBI&quot;</S>{`
`}
          </CodeWindow>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 py-24 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Start with the slice that hurts most
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-fd-muted-foreground">
          Runaway CU bills, a lakehouse full of small files, or a deployment
          process that lives in someone&rsquo;s head.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          {[
            { label: 'Fix small files', href: '/docs/onelake/delta-optimization' },
            { label: 'Model CU cost', href: '/docs/tools/cu-cost-calculator' },
            { label: 'Set up CI/CD', href: '/docs/cicd' },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-lg border border-fd-border bg-fd-card px-4 py-2 text-sm font-medium transition-colors hover:border-fd-primary/40 hover:bg-fd-accent"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
