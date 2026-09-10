import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { PackDownload } from '@/components/pack-download';
import { packFileList, PACKS } from '@/generated/packs';

export const metadata: Metadata = {
  title: 'Workspace Monitoring Framework',
  description:
    'A monitoring lakehouse + notebooks that track CU consumption by item, job failures, abandoned pipelines, and semantic model refresh health — with a starter Power BI report and Teams alerting.',
  alternates: { canonical: '/packs/workspace-monitoring' },
};

const INCLUDES = [
  'collect_capacity_metrics.py — item-level CU-adjacent metrics from the Workspace Monitoring Eventhouse (or the Admin API), landed daily',
  'job_run_health.py — pipeline/notebook run outcomes; flags N-consecutive failures and items with no successful run in 30 days',
  'refresh_health.py — semantic model refresh history; flags failure streaks and slow (p90) refreshes',
  'alert_on_thresholds.py — reads all three tables against your thresholds and posts a summary card to a Teams webhook',
  'monitoring.example.json — scope (capacities/workspaces) and every threshold in one file',
  'report/measures.dax + README — a 3-page Direct Lake starter report: Capacity overview, Job health, Refresh health',
];

const files = packFileList('workspace-monitoring');
const exists = Boolean(PACKS['workspace-monitoring']);

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16">
      <Link href="/packs" className="text-sm text-fd-muted-foreground hover:text-fd-primary">
        ← All kits
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Workspace Monitoring Framework
      </h1>
      <p className="mt-4 max-w-2xl text-fd-muted-foreground">
        What&rsquo;s burning CU, what&rsquo;s failing, and what&rsquo;s been
        abandoned — with your own retained history and thresholds, instead of
        the Capacity Metrics app&rsquo;s short window and no alerting. Pairs
        with the{' '}
        <Link href="/docs/tools/capacity-sku-reference" className="text-fd-primary hover:underline">
          capacity SKU reference
        </Link>{' '}
        and the{' '}
        <Link href="/docs/tools/cu-cost-calculator" className="text-fd-primary hover:underline">
          CU calculator
        </Link>
        .
      </p>

      <div className="mt-8">
        {exists ? (
          <PackDownload slug="workspace-monitoring" label="Download pack (.zip)" />
        ) : (
          <p className="text-sm text-fd-muted-foreground">Packaging in progress.</p>
        )}
        <p className="mt-2 text-xs text-fd-muted-foreground">
          {files.length} files · included with{' '}
          <Link href="/pricing" className="hover:text-fd-primary">
            Pro
          </Link>{' '}
          · licensed for use within your organisation
        </p>
      </div>

      <h2 className="mt-12 text-lg font-semibold">What&rsquo;s included</h2>
      <ul className="mt-4 flex flex-col gap-2.5 text-sm">
        {INCLUDES.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-fd-primary" />
            <span className="text-fd-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-lg font-semibold">File tree</h2>
      <pre className="mt-4 overflow-x-auto rounded-xl border border-fd-border bg-fd-card p-4 text-[13px] leading-relaxed text-fd-muted-foreground">
        <code>{files.join('\n')}</code>
      </pre>

      <div className="mt-12 rounded-xl border border-fd-border bg-fd-card/60 p-5 text-sm text-fd-muted-foreground">
        <strong className="text-fd-foreground">CU numbers are a proxy, not a bill.</strong>{' '}
        Item-level metrics come from Workspace Monitoring or the Admin API and
        approximate relative cost — cross-check totals against the Capacity
        Metrics app before making a capacity decision from them.
      </div>
    </main>
  );
}
