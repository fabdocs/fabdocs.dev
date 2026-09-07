import { getPageImageUrl, getPageMarkdownUrl, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/notebook/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { gitConfig } from '@/lib/shared';
import { JsonLd } from '@/components/json-ld';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { AISearchTrigger } from '@/components/ai/search';
import { MessageCircleIcon } from 'lucide-react';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;

  const crumbs = [{ name: 'Documentation', url: '/docs' }];
  if (params.slug && params.slug.length > 1) {
    const parent = source.getPage([params.slug[0]]);
    if (parent) crumbs.push({ name: parent.data.title, url: parent.url });
  }
  if (page.url !== '/docs') crumbs.push({ name: page.data.title, url: page.url });

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <JsonLd
        data={[
          articleJsonLd({
            title: page.data.title,
            description: page.data.description,
            url: page.url,
            imageUrl: getPageImageUrl(page).url,
          }),
          breadcrumbJsonLd(crumbs),
        ]}
      />
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row flex-wrap gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
        />
        <AISearchTrigger className="inline-flex items-center justify-center gap-2 rounded-md border bg-fd-secondary px-2 py-1.5 text-xs font-medium text-fd-secondary-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-3.5 [&_svg]:text-fd-primary">
          <MessageCircleIcon />
          Ask AI
        </AISearchTrigger>
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url },
    openGraph: {
      type: 'article',
      url: page.url,
      title: page.data.title,
      description: page.data.description,
      images: getPageImageUrl(page).url,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.data.title,
      description: page.data.description,
      images: getPageImageUrl(page).url,
    },
  };
}
