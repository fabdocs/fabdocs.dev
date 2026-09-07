import Link from 'next/link';
import { appName, gitConfig } from '@/lib/shared';

const columns = [
  {
    heading: 'Documentation',
    links: [
      { label: 'OneLake & Delta Lake', href: '/docs/onelake' },
      { label: 'Data Engineering', href: '/docs/data-engineering' },
      { label: 'CI/CD & Git', href: '/docs/cicd' },
      { label: 'Governance & Security', href: '/docs/governance' },
    ],
  },
  {
    heading: 'Applied',
    links: [
      { label: 'CU cost calculator', href: '/docs/tools/cu-cost-calculator' },
      { label: 'VS Code sync', href: '/docs/tools/vscode-sync' },
      { label: 'Migration playbooks', href: '/docs/playbooks' },
    ],
  },
  {
    heading: 'Project',
    links: [
      { label: 'Start here', href: '/docs' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'GitHub', href: `https://github.com/${gitConfig.user}/${gitConfig.repo}` },
      { label: 'llms.txt', href: '/llms.txt' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-fd-border bg-fd-card/40">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="inline-flex size-6 items-center justify-center rounded-md bg-fd-primary text-[13px] font-bold text-fd-primary-foreground"
              >
                f
              </span>
              <span className="font-semibold tracking-tight">{appName}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-fd-muted-foreground">
              The production engineering manual for Microsoft Fabric.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <div className="text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
                {col.heading}
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-fd-foreground/80 transition-colors hover:text-fd-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-fd-border pt-6 text-xs text-fd-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {appName}. Content licensed for reference use.
          </p>
          <p>
            An independent community resource. Not affiliated with, endorsed by, or
            sponsored by Microsoft. &ldquo;Microsoft Fabric&rdquo; is a trademark of
            Microsoft Corporation.
          </p>
        </div>
      </div>
    </footer>
  );
}
