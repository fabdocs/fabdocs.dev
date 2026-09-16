import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { AISearch, AISearchPanel } from '@/components/ai/search';
import { SiteFooter } from '@/components/site-footer';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <HomeLayout {...baseOptions()}>
      <AISearch>
        {/*
          AISearchPanel's inner sticky container has no width of its own
          outside Fumadocs' docs/notebook grid layouts (it's designed to
          slot into #nd-docs-layout / #nd-notebook-layout) — without one,
          it renders full page width and covers the navbar entirely. A
          flex wrapper lets it shrink to its content width (driven by the
          --ai-chat-width var on the chat form inside) and right-align via
          its own lg:ms-auto, same as it would inside those grids.
        */}
        <div className="relative z-50 lg:flex lg:justify-end">
          <AISearchPanel />
        </div>
        {children}
        <SiteFooter />
      </AISearch>
    </HomeLayout>
  );
}
