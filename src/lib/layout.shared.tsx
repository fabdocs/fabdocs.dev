import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import {
  BookOpen,
  Boxes,
  Calculator,
  ChevronDown,
  Database,
  GitBranch,
  Map as MapIcon,
  ShieldCheck,
} from 'lucide-react';
import { appName, gitConfig } from './shared';

/**
 * Shared layout options for the home layout and the docs / notebook layout.
 * See https://fumadocs.dev/docs/ui/layouts/notebook
 *
 * `variant: 'docs'` (passed by docs/layout.tsx) drops the "Documentation"
 * dropdown in favor of a plain Glossary link — the Notebook layout already
 * renders a full tab row for the same 6 sections right below the navbar, so
 * the dropdown there is pure duplication, just gated behind an extra click.
 * On 'home' (the default: /, /blog, /pricing, etc.) there's no tab row, so
 * the dropdown is the only nav-level way to reach a section.
 */
export function baseOptions({ variant = 'home' }: { variant?: 'home' | 'docs' } = {}): BaseLayoutProps {
  const isDocs = variant === 'docs';
  return {
    nav: {
      title: (
        <>
          <span
            aria-hidden
            className="inline-flex size-6 items-center justify-center rounded-md bg-fd-primary text-[13px] font-bold text-fd-primary-foreground"
          >
            f
          </span>
          <span className="font-semibold tracking-tight">
            {appName}
          </span>
        </>
      ),
      transparentMode: 'top',
    },
    links: [
      isDocs
        ? {
            text: 'Glossary',
            url: '/glossary',
            active: 'url' as const,
          }
        : {
            type: 'menu' as const,
            text: (
              <span className="inline-flex items-center gap-1">
                Documentation
                <ChevronDown className="size-3" />
              </span>
            ),
            items: [
              {
                icon: <Database className="size-4" />,
                text: 'OneLake & Delta Lake',
                description: 'Delta optimization, V-Order, VACUUM, shortcuts.',
                url: '/docs/onelake',
                active: 'nested-url' as const,
              },
              {
                icon: <Boxes className="size-4" />,
                text: 'Data Engineering',
                description: 'PySpark patterns, NEE, resource profiles, Runtime.',
                url: '/docs/data-engineering',
                active: 'nested-url' as const,
              },
              {
                icon: <GitBranch className="size-4" />,
                text: 'CI/CD & Git',
                description: 'Git integration, deployment pipelines, GitHub Actions.',
                url: '/docs/cicd',
                active: 'nested-url' as const,
              },
              {
                icon: <ShieldCheck className="size-4" />,
                text: 'Governance & Security',
                description: 'OneLake security, workspace identity, audit logs.',
                url: '/docs/governance',
                active: 'nested-url' as const,
              },
              {
                icon: <Calculator className="size-4" />,
                text: 'Tools & Calculators',
                description: 'CU calculator, pool sizer, Direct Lake advisor.',
                url: '/docs/tools',
                active: 'nested-url' as const,
              },
              {
                icon: <MapIcon className="size-4" />,
                text: 'Migration Playbooks',
                description: 'From Synapse, Databricks, Snowflake, and SSIS.',
                url: '/docs/playbooks',
                active: 'nested-url' as const,
              },
              {
                icon: <BookOpen className="size-4" />,
                text: 'Glossary',
                description: 'Fabric terms in plain English, linked to the docs.',
                url: '/glossary',
                active: 'url' as const,
              },
            ],
          },
      {
        text: 'Kits',
        url: '/packs',
        active: 'url',
      },
      {
        text: 'Blog',
        url: '/blog',
        active: 'nested-url',
      },
      {
        text: 'Pricing',
        url: '/pricing',
        active: 'url',
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
