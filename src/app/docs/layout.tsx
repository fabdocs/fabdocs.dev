import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { baseOptions } from '@/lib/layout.shared';
import { AISearch, AISearchPanel } from '@/components/ai/search';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      tabMode="navbar"
      nav={{ ...baseOptions().nav, mode: 'top' }}
      sidebar={{ defaultOpenLevel: 0 }}
    >
      <AISearch>
        <AISearchPanel />
        {children}
      </AISearch>
    </DocsLayout>
  );
}
