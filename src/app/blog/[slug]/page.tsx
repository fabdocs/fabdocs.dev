import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import { BlogTOC } from '@/components/blog-toc';
import { ReadingProgress } from '@/components/reading-progress';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { JsonLd } from '@/components/json-ld';
import {
  blog,
  blogSlug,
  formatBlogDate,
  getBlogPost,
  getBlogPosts,
  getRelatedPosts,
} from '@/lib/blog-source';
import { appName, siteUrl } from '@/lib/shared';

export default async function BlogPostPage(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const MDX = post.body;
  const url = `${siteUrl}/blog/${slug}`;

  // Sorted newest first: the next array entry is older (prev), the
  // previous array entry is newer (next).
  const allPosts = getBlogPosts();
  const currentIndex = allPosts.findIndex((p) => blogSlug(p.info.path) === slug);
  const olderPost = allPosts[currentIndex + 1];
  const newerPost = currentIndex > 0 ? allPosts[currentIndex - 1] : undefined;
  const relatedPosts = getRelatedPosts(slug);

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

        {relatedPosts.length > 0 && (
          <div className="not-prose mb-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
              Related
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedPosts.map((related) => (
                <Link
                  key={related.info.path}
                  href={`/blog/${blogSlug(related.info.path)}`}
                  className="group rounded-xl border border-fd-border bg-fd-card p-4 transition hover:border-fd-primary/40"
                >
                  <p className="font-semibold text-fd-foreground group-hover:text-fd-primary">
                    {related.title}
                  </p>
                  <p className="mt-1 text-sm text-fd-muted-foreground">{related.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {(newerPost || olderPost) && (
          <div className="not-prose mb-10 grid gap-3 sm:grid-cols-2">
            {newerPost ? (
              <Link
                href={`/blog/${blogSlug(newerPost.info.path)}`}
                className="group rounded-xl border border-fd-border bg-fd-card p-4 transition hover:border-fd-primary/40"
              >
                <p className="text-xs text-fd-muted-foreground">Newer</p>
                <p className="mt-1 font-semibold text-fd-foreground group-hover:text-fd-primary">
                  {newerPost.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {olderPost ? (
              <Link
                href={`/blog/${blogSlug(olderPost.info.path)}`}
                className="group rounded-xl border border-fd-border bg-fd-card p-4 text-right transition hover:border-fd-primary/40"
              >
                <p className="text-xs text-fd-muted-foreground">Older</p>
                <p className="mt-1 font-semibold text-fd-foreground group-hover:text-fd-primary">
                  {olderPost.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
          </div>
        )}

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

  const imageUrl = `${siteUrl}/og/blog/${slug}`;

  return {
    // Absolute: skip the root layout's " — fabdocs.dev" suffix. Post titles
    // are long enough on their own that the suffix pushed several past the
    // ~60-char point where Google truncates the SERP title.
    title: { absolute: post.title },
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: 'article',
      url: `${siteUrl}/blog/${slug}`,
      title: post.title,
      description: post.description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [imageUrl],
    },
  };
}
