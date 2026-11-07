import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { ToolsMenu, MoreMenu } from '@/components/site-nav-menu';
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
 * A dropdown listing every docs *section* used to live here and was removed
 * in favor of flat links, since it just duplicated the tab row docs pages
 * already have. The Tools/More dropdowns added below are a different thing:
 * they surface pages that have no top-nav presence on either variant today
 * (the 5 interactive tools under /docs/tools, plus /compare and /changelog)
 * rather than re-listing something already one click away.
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
      // Desktop: Tools and More are Radix dropdowns (site-nav-menu.tsx).
      // Mobile: the plain links below them render in Fumadocs' collapsible
      // menu instead, since the dropdowns are desktop-only (`on: 'nav'`).
      { type: 'custom', on: 'nav', children: <ToolsMenu /> },
      { text: 'Tools', url: '/docs/tools', on: 'menu' },
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
      { type: 'custom', on: 'nav', children: <MoreMenu showGlossary={!isDocs} /> },
      { text: 'Compare', url: '/compare', on: 'menu' },
      { text: 'Changelog', url: '/changelog', on: 'menu' },
      ...(isDocs ? [] : [{ text: 'Glossary', url: '/glossary', on: 'menu' as const }]),
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
