import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { PackDownload } from '@/components/pack-download';
import { packFileList, PACKS } from '@/generated/packs';

export const metadata: Metadata = {
  title: 'Migration Toolkits',
  description:
    'Move SQL Server / SSIS, Snowflake, or Databricks into Microsoft Fabric: source inventory scripts, a DDL translator, a manifest-driven copy notebook, and a parity-validation harness.',
  alternates: { canonical: '/packs/migration-toolkits' },
};

const INCLUDES = [
  'inventory-sqlserver.sql / inventory-snowflake.sql — one row per table: size, rows, last write, dependencies, likely-dead flag',
  'translate_ddl.py — SQL Server / Snowflake DDL → Fabric DDL (sqlglot when available, regex fallback), with warnings for what it drops',
  'metadata_driven_copy.py — copy every source table into bronze from one manifest; full snapshot or watermark-incremental',
  'validate_parity.py — row counts + aggregate checksums, source vs. migrated, per table; fails outside tolerance',
  'migration-manifest.example.json — the table list with per-table decision, watermark, and checksum columns',
  'function-cheatsheet.md — Snowflake/T-SQL → Fabric translation reference for the logic the translator can’t do',
  'cutover-runbook.md — the parallel-run, freeze, cut-over, and decommission checklist',
];

const files = packFileList('migration-toolkits');
const exists = Boolean(PACKS['migration-toolkits']);

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16">
      <Link href="/packs" className="text-sm text-fd-muted-foreground hover:text-fd-primary">
        ← All kits
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Migration Toolkits
      </h1>
      <p className="mt-4 max-w-2xl text-fd-muted-foreground">
        The repeatable parts of a warehouse migration, done: inventory the
        source and tag what&rsquo;s dead, translate the DDL, copy the data from a
        manifest, and prove parity before you cut over. Covers SQL Server / SSIS,
        Snowflake, and Databricks. Pairs with the{' '}
        <Link href="/docs/playbooks" className="text-fd-primary hover:underline">
          migration playbooks
        </Link>
        .
      </p>

      <div className="mt-8">
        {exists ? (
          <PackDownload slug="migration-toolkits" label="Download pack (.zip)" />
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

      <h2 className="mt-12 text-lg font-semibold">The arc</h2>
      <ol className="mt-4 flex list-decimal flex-col gap-2 pl-5 text-sm text-fd-muted-foreground">
        <li>Inventory the source; tag every table keep / retire / rebuild.</li>
        <li>Move one thin vertical slice end to end first.</li>
        <li>Translate DDL, review every file.</li>
        <li>Fill the manifest; run the copy (history once, then incremental).</li>
        <li>Run parity nightly — green for a full business cycle.</li>
        <li>Cut over per the runbook. Done = the old pipeline is deleted.</li>
      </ol>

      <div className="mt-12 rounded-xl border border-fd-border bg-fd-card/60 p-5 text-sm text-fd-muted-foreground">
        <strong className="text-fd-foreground">Honest about scope.</strong> The
        DDL translator is a head start, not a compiler — computed columns,
        function defaults, and VARIANT shredding still need a human. Every script
        is marked where it needs your input.
      </div>
    </main>
  );
}
