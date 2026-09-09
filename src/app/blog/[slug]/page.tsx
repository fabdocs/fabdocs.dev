import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import { BlogTOC } from '@/components/blog-toc';
import { ReadingProgress } from '@/components/reading-progress';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { JsonLd } from '@/components/json-ld';
import { blog, blogSlug, formatBlogDate, getBlogPost } from '@/lib/blog-source';
import { appName, siteUrl } from '@/lib/shared';

export default async function BlogPostPage(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const MDX = post.body;
  const url = `${siteUrl}/blog/${slug}`;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 gap-10 px-6 py-12 md:py-16">
      <ReadingProgress />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          url,
          keywords: post.tags.join(', '),
          publisher: {
            '@type': 'Organization',
            name: appName,
            url: siteUrl,
            logo: `${siteUrl}/icon.svg`,
          },
        }}
      />
      <article className="prose min-w-0 flex-1">
        <p className="text-sm text-fd-muted-foreground">{formatBlogDate(post.date)}</p>
        <h1 className="mb-2 text-[1.75em] font-bold tracking-tight">{post.title}</h1>
        <p className="mb-8 text-lg text-fd-muted-foreground">{post.description}</p>
        <MDX components={getMDXComponents()} />
        <hr className="my-10 border-fd-border" />
        <div className="not-prose">
          <NewsletterSignup source="blog" />
          <p className="mt-4 text-sm text-fd-muted-foreground">
            More in the <Link href="/blog" className="text-fd-primary hover:underline">blog</Link>,
            or start with the <Link href="/docs" className="text-fd-primary hover:underline">manual</Link>.
          </p>
        </div>
      </article>
      <BlogTOC toc={post.toc} />
    </main>
  );
}

export async function generateStaticParams() {
  return blog.entries.map((entry) => ({ slug: blogSlug(entry.info.path) }));
}

export async function generateMetadata(props: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: 'article',
      url: `${siteUrl}/blog/${slug}`,
      title: post.title,
      description: post.description,
    },
  };
}
