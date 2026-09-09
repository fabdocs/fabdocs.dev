import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { AISearch, AISearchPanel } from '@/components/ai/search';
import { SiteFooter } from '@/components/site-footer';

export default function Layout({ children }: LayoutProps<'/blog'>) {
  return (
    <HomeLayout {...baseOptions()}>
      <AISearch>
        <AISearchPanel />
        {children}
        <SiteFooter />
      </AISearch>
    </HomeLayout>
  );
}
