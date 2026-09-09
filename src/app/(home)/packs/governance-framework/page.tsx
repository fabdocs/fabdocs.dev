import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { PackDownload } from '@/components/pack-download';
import { packFileList, PACKS } from '@/generated/packs';

export const metadata: Metadata = {
  title: 'Governance & Security Framework',
  description:
    'Ready-to-implement OneLake security role models, workspace-identity setup, audit-log export, and access-review evidence for Microsoft Fabric — the artifacts an enterprise review asks for, as code.',
  alternates: { canonical: '/packs/governance-framework' },
};

const INCLUDES = [
  'security-model.example.json — the OneLake security role model as one PR-reviewable file (members, RLS, CLS, table grants)',
  'provision_onelake_security.py — apply the model idempotently via the Fabric REST API, with a dry-run mode',
  'audit_log_export.py — land the unified audit log in a governed Delta table for SIEM and real retention',
  'access_review.py — granted-vs-actually-used worksheet with READ_WITHOUT_GRANT / GRANTED_BUT_UNUSED flags',
  'setup-workspace-identity.sh — az CLI: role assignment + firewalled-storage trusted access, no stored keys',
  'export-tenant-settings.sh — snapshot admin tenant settings to JSON so config drift shows up in Git',
  'COMPLIANCE-CHECKLIST.md — the review checklist mapped to each artifact, with owner + cadence',
  'CONTROL-MATRIX.md — a per-dataset "who can read this table" template across every layer',
];

const files = packFileList('governance-framework');
const exists = Boolean(PACKS['governance-framework']);

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16">
      <Link href="/packs" className="text-sm text-fd-muted-foreground hover:text-fd-primary">
        ← All kits
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Governance &amp; Security Framework
      </h1>
      <p className="mt-4 max-w-2xl text-fd-muted-foreground">
        The evidence an enterprise review asks for — OneLake security modelled in
        Git, applied idempotently; a continuous audit-log export; and a
        recertification worksheet — as runnable artifacts instead of a slide
        deck. Matches the{' '}
        <Link href="/docs/governance" className="text-fd-primary hover:underline">
          Governance docs
        </Link>{' '}
        and the free{' '}
        <Link
          href="/docs/governance/compliance-checklist"
          className="text-fd-primary hover:underline"
        >
          compliance checklist
        </Link>
        .
      </p>

      <div className="mt-8">
        {exists ? (
          <PackDownload slug="governance-framework" label="Download pack (.zip)" />
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
        <strong className="text-fd-foreground">A working scaffold, not a black box.</strong>{' '}
        The OneLake security REST surface is still evolving — every API call is
        marked <code>{'# EDIT:'}</code> with a link to the current reference.
        Verify against the docs for your tenant and test with a non-privileged
        account before rollout. Updates for API and Runtime changes are included.
      </div>
    </main>
  );
}
