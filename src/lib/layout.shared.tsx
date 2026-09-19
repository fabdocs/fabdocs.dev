import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

/**
 * Shared layout options for the home layout and the docs / notebook layout.
 * See https://fumadocs.dev/docs/ui/layouts/notebook
 *
 * `variant: 'docs'` (passed by docs/layout.tsx) swaps the first nav link
 * for Glossary instead of Documentation — the Notebook layout already
 * renders a full tab row for all 6 sections right below the navbar, so a
 * "Documentation" link back to /docs would be the only thing not already
 * one click away there, while Glossary is the one thing the tab row
 * doesn't cover. On 'home' (the default: /, /blog, /pricing, etc.) there's
 * no tab row, so Documentation -> /docs (now a proper "where to start"
 * page, not just a card grid) is the more useful first link.
 *
 * A dropdown listing every section used to live here; removed in favor of
 * flat links, matching Kits/Blog/Pricing, since /docs itself already does
 * the wayfinding in one click.
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
        ? { text: 'Glossary', url: '/glossary', active: 'url' }
        : { text: 'Documentation', url: '/docs', active: 'nested-url' },
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
