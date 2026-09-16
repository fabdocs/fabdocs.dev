import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { AISearch, AISearchPanel } from '@/components/ai/search';
import { SiteFooter } from '@/components/site-footer';

export default function Layout({ children }: LayoutProps<'/blog'>) {
  return (
    <HomeLayout {...baseOptions()}>
      <AISearch>
        {/* See src/app/(home)/layout.tsx for why this needs lg:flex lg:justify-end. */}
        <div className="relative z-50 lg:flex lg:justify-end">
          <AISearchPanel />
        </div>
        {children}
        <SiteFooter />
      </AISearch>
    </HomeLayout>
  );
}
