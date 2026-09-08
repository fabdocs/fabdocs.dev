import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { PackDownload } from '@/components/pack-download';
import { packFileList, PACKS } from '@/generated/packs';

export const metadata: Metadata = {
  title: 'PySpark & Notebook Templates',
  description:
    'Production-ready, parameterised Fabric notebooks: idempotent incremental loads, SCD Type 2, a rule-driven cleansing framework, and Delta maintenance — with shared helpers and pytest tests.',
  alternates: { canonical: '/packs/pyspark-templates' },
};

const INCLUDES = [
  'incremental_load.py — watermark read + idempotent MERGE upsert, returns the new watermark to the pipeline',
  'scd2_merge.py — Slowly Changing Dimension Type 2 with an attribute hash',
  'data_cleansing_framework.py — trim / coerce / default / dedupe / validate, splitting clean vs. quarantine rows',
  'delta_maintenance.py — OPTIMIZE (+ Z-ORDER), V-Order, target file size, VACUUM, driven by a control table',
  'lib/fabric_utils.py — structured logging, boundary assertions, idempotency markers, notebookutils guards',
  'lib/transforms.py — pure transformation functions, no I/O',
  'tests/ — a local SparkSession fixture and pytest coverage for every transform',
  'config/tables.example.json — one control file for loads, cleansing, and maintenance',
];

const files = packFileList('pyspark-templates');
const exists = Boolean(PACKS['pyspark-templates']);

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16">
      <Link href="/packs" className="text-sm text-fd-muted-foreground hover:text-fd-primary">
        ← All kits
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        PySpark &amp; Notebook Templates
      </h1>
      <p className="mt-4 max-w-2xl text-fd-muted-foreground">
        The notebooks you&rsquo;d otherwise write from scratch for every
        lakehouse — idempotent, parameter-driven, and testable. Logic lives in{' '}
        <code className="rounded bg-fd-muted px-1 py-0.5 text-sm">lib/</code> so
        the notebook stays thin and the transforms run under{' '}
        <code className="rounded bg-fd-muted px-1 py-0.5 text-sm">pytest</code>{' '}
        locally. Matches the{' '}
        <Link href="/docs/data-engineering" className="text-fd-primary hover:underline">
          Data Engineering docs
        </Link>
        .
      </p>

      <div className="mt-8">
        {exists ? (
          <PackDownload slug="pyspark-templates" label="Download pack (.zip)" />
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

      <h2 className="mt-12 text-lg font-semibold">Using them in Fabric</h2>
      <ol className="mt-4 flex list-decimal flex-col gap-2.5 pl-5 text-sm text-fd-muted-foreground">
        <li>
          Import each <code>notebooks/</code> and <code>lib/</code> file as a
          Fabric notebook (or attach <code>lib/</code> as a notebook resource).
        </li>
        <li>Mark the top cell of each notebook as the parameter cell.</li>
        <li>
          Orchestrate with a data pipeline — one Notebook activity per table, or
          a <code>ForEach</code> over <code>config/tables.example.json</code>.
        </li>
        <li>
          Run the tests locally: <code>pip install pyspark pytest &amp;&amp; pytest -q</code>.
        </li>
      </ol>

      <p className="mt-12 text-sm text-fd-muted-foreground">
        Updated for new Fabric Runtimes — subscribers hear about changes in the{' '}
        <Link href="/packs" className="hover:text-fd-primary">
          change briefing
        </Link>
        .
      </p>
    </main>
  );
}
