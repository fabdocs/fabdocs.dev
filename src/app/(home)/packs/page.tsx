import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Boxes,
  GitBranch,
  Map as MapIcon,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { NewsletterSignup } from '@/components/newsletter-signup';

export const metadata: Metadata = {
  title: 'Starter kits & frameworks',
  description:
    'Production-ready PySpark templates, CI/CD automation packs, migration toolkits, and governance frameworks for Microsoft Fabric — in development.',
  alternates: { canonical: '/packs' },
};

const PACKS = [
  {
    icon: GitBranch,
    title: 'CI/CD Automation Pack',
    status: 'Available',
    body: 'Drop-in GitHub Actions workflows for validate-on-PR and promote-on-merge, deployment-pipeline scripts, and parameter.yml / variable-library templates for Dev → Test → Prod. Wired to the patterns in the CI/CD docs.',
    href: '/packs/cicd-automation',
    cta: 'View pack →',
  },
  {
    icon: Boxes,
    title: 'PySpark & Notebook Templates',
    status: 'Planned',
    body: 'Modular, tested notebooks: idempotent incremental loads, a configurable data-cleansing framework, SCD handling, and a Delta maintenance job (OPTIMIZE / VACUUM / V-Order) you schedule per table.',
    href: '/docs/data-engineering/pyspark-patterns',
  },
  {
    icon: MapIcon,
    title: 'Migration Toolkits',
    status: 'Planned',
    body: 'Conversion kits for SQL Server / SSIS, Snowflake, and Databricks → Fabric: inventory scripts, DDL/type translators, a metadata-driven copy framework, and a parallel-run validation harness (row counts + checksums).',
    href: '/docs/playbooks',
  },
  {
    icon: ShieldCheck,
    title: 'Governance & Security Framework',
    status: 'Planned',
    body: 'Ready-to-implement OneLake security role models, workspace-identity setup scripts, and an audit-log export pipeline for SIEM — the patterns from the Governance docs as runnable artifacts.',
    href: '/docs/governance',
  },
  {
    icon: Activity,
    title: 'Workspace Monitoring Framework',
    status: 'Planned',
    body: 'A monitoring lakehouse + notebooks that track CU consumption by item, job failures, refresh health, and abandoned pipelines — with a starter Power BI report.',
    href: '/docs/tools/capacity-sku-reference',
  },
];

export default function PacksPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs font-medium text-fd-muted-foreground">
          <span className="size-1.5 rounded-full bg-fd-primary" />
          Revenue tier — in development
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
          Starter kits &amp; frameworks
        </h1>
        <p className="mt-4 text-fd-muted-foreground">
          The architectural guides stay free. These are the production-ready
          components that save the 20 hours of trial and error: tested scripts,
          templates, and automation — not theory. Planned to ship with{' '}
          <Link href="/pricing" className="text-fd-primary underline-offset-2 hover:underline">
            Pro
          </Link>
          , with standalone purchase for individual packs.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {PACKS.map((pack) => (
          <div
            key={pack.title}
            className="flex flex-col gap-3 rounded-xl border border-fd-border bg-fd-card p-5"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary ring-1 ring-inset ring-fd-primary/20">
                <pack.icon className="size-5" />
              </span>
              <span
                className={
                  pack.status === 'Available'
                    ? 'rounded-full border border-fd-primary/30 bg-fd-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-fd-primary'
                    : 'rounded-full border border-fd-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-fd-muted-foreground'
                }
              >
                {pack.status}
              </span>
            </div>
            <div className="font-semibold">{pack.title}</div>
            <p className="text-sm text-fd-muted-foreground">{pack.body}</p>
            <Link
              href={pack.href}
              className="mt-auto pt-2 text-sm font-medium text-fd-primary hover:underline"
            >
              {pack.cta ?? 'Related docs →'}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <NewsletterSignup source="packs" />
        <p className="mt-3 text-xs text-fd-muted-foreground">
          Subscribers hear first when a pack ships, and help decide the order —
          reply to any briefing with what you&rsquo;d buy.
        </p>
      </div>
    </main>
  );
}
