import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { PackDownload } from '@/components/pack-download';
import { packFileList, PACKS } from '@/generated/packs';

export const metadata: Metadata = {
  title: 'CI/CD Automation Pack',
  description:
    'Drop-in GitHub Actions workflows and scripts to run Microsoft Fabric as workspace-as-code: validate on PR, promote dev → test → prod on merge with a manual prod gate.',
  alternates: { canonical: '/packs/cicd-automation' },
};

const INCLUDES = [
  'pr-validate.yml — static checks on every PR (hard-coded ids, parameter.yml, naming, TODOs)',
  'deploy.yml — Git sync → dev→test deploy → smoke test → gated test→prod → release tag',
  'checks.sh, deploy-stage.sh, smoke-test.sh, check-value-sets.sh',
  'parameter.yml deployment-rule template (find/replace, spark pool, bindings)',
  'variable-library.example.json — three per-stage value sets',
  'README with SPN setup, tenant settings, and the GitHub secrets/environments checklist',
];

const files = packFileList('cicd-automation');
const exists = Boolean(PACKS['cicd-automation']);

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16">
      <Link href="/packs" className="text-sm text-fd-muted-foreground hover:text-fd-primary">
        ← All kits
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Fabric CI/CD Automation Pack
      </h1>
      <p className="mt-4 max-w-2xl text-fd-muted-foreground">
        Workspace-as-code for Microsoft Fabric without writing the pipeline from
        scratch. Copy three folders into your repo, fill in the{' '}
        <code className="rounded bg-fd-muted px-1 py-0.5 text-sm">EDIT:</code>{' '}
        markers, and you have validate-on-PR plus a gated dev → test → prod
        promotion. Matches the patterns in the{' '}
        <Link href="/docs/cicd" className="text-fd-primary hover:underline">
          CI/CD &amp; Git docs
        </Link>
        .
      </p>

      <div className="mt-8">
        {exists ? (
          <PackDownload slug="cicd-automation" label="Download pack (.zip)" />
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

      <h2 className="mt-12 text-lg font-semibold">Requirements</h2>
      <ul className="mt-4 flex flex-col gap-2.5 text-sm text-fd-muted-foreground">
        <li>A Git-connected dev workspace and a 3-stage deployment pipeline.</li>
        <li>
          A service principal added as Admin on all three workspaces, with SPN
          API access enabled in the Fabric admin portal.
        </li>
        <li>
          GitHub repo secrets <code>FABRIC_CLIENT_ID</code>,{' '}
          <code>FABRIC_CLIENT_SECRET</code>, <code>FABRIC_TENANT_ID</code>, and a
          protected <code>prod</code> Environment with required reviewers.
        </li>
      </ul>

      <p className="mt-12 text-sm text-fd-muted-foreground">
        Fabric ships changes monthly. Pack updates are included — subscribers
        hear about them in the{' '}
        <Link href="/packs" className="hover:text-fd-primary">
          change briefing
        </Link>
        .
      </p>
    </main>
  );
}
