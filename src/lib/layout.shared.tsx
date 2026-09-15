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
 * `menuChevron` defaults to true because HomeLayout's dropdown trigger
 * doesn't render its own indicator. The Notebook layout's trigger already
 * appends a ChevronDown itself, so docs/layout.tsx passes `false` to avoid
 * showing two.
 */
export function baseOptions({ menuChevron = true }: { menuChevron?: boolean } = {}): BaseLayoutProps {
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
      {
        type: 'menu',
        text: menuChevron ? (
          <span className="inline-flex items-center gap-1">
            Documentation
            <ChevronDown className="size-3" />
          </span>
        ) : (
          'Documentation'
        ),
        items: [
          {
            icon: <Database className="size-4" />,
            text: 'OneLake & Delta Lake',
            description: 'Delta optimization, V-Order, VACUUM, shortcuts.',
            url: '/docs/onelake',
            active: 'nested-url',
          },
          {
            icon: <Boxes className="size-4" />,
            text: 'Data Engineering',
            description: 'PySpark patterns, NEE, resource profiles, Runtime.',
            url: '/docs/data-engineering',
            active: 'nested-url',
          },
          {
            icon: <GitBranch className="size-4" />,
            text: 'CI/CD & Git',
            description: 'Git integration, deployment pipelines, GitHub Actions.',
            url: '/docs/cicd',
            active: 'nested-url',
          },
          {
            icon: <ShieldCheck className="size-4" />,
            text: 'Governance & Security',
            description: 'OneLake security, workspace identity, audit logs.',
            url: '/docs/governance',
            active: 'nested-url',
          },
          {
            icon: <Calculator className="size-4" />,
            text: 'Tools & Calculators',
            description: 'CU calculator, pool sizer, Direct Lake advisor.',
            url: '/docs/tools',
            active: 'nested-url',
          },
          {
            icon: <MapIcon className="size-4" />,
            text: 'Migration Playbooks',
            description: 'From Synapse, Databricks, Snowflake, and SSIS.',
            url: '/docs/playbooks',
            active: 'nested-url',
          },
          {
            icon: <BookOpen className="size-4" />,
            text: 'Glossary',
            description: 'Fabric terms in plain English, linked to the docs.',
            url: '/glossary',
            active: 'url',
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
