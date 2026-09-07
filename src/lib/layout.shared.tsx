import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

/**
 * Shared layout options for the home layout and the docs / notebook layout.
 * See https://fumadocs.dev/docs/ui/layouts/notebook
 */
export function baseOptions(): BaseLayoutProps {
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
        text: 'Documentation',
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: 'Tools',
        url: '/docs/tools',
        active: 'nested-url',
      },
      {
        text: 'Playbooks',
        url: '/docs/playbooks',
        active: 'nested-url',
      },
      {
        text: 'Kits',
        url: '/packs',
        active: 'url',
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
