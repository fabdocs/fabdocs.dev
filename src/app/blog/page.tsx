import type { Metadata } from 'next';
import { getBlogPosts, blogSlug } from '@/lib/blog-source';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { BlogList } from '@/components/blog-list';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'The Fabric change briefing and longer-form engineering writing that pulls the reference docs into one narrative.',
  alternates: {
    canonical: '/blog',
    types: { 'application/rss+xml': '/rss.xml' },
  },
};

export default function BlogIndexPage() {
  const posts = getBlogPosts();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16 md:py-20">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-fd-foreground md:text-5xl">
            Blog
          </h1>
          <a
            href="/rss.xml"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-fd-border px-3 py-1 text-xs font-medium text-fd-muted-foreground transition hover:border-fd-primary/40 hover:text-fd-foreground"
          >
            RSS
          </a>
        </div>
        <p className="mt-4 max-w-xl text-lg text-fd-muted-foreground">
          The change briefing — new runtimes, API updates, breaking changes —
          and longer engineering writing that pulls the reference material into
          one narrative.
        </p>
      </div>

      <BlogList
        posts={posts.map((post) => ({
          slug: blogSlug(post.info.path),
          title: post.title,
          description: post.description,
          date: post.date,
          tags: post.tags,
        }))}
      />

      <NewsletterSignup source="blog" />
    </main>
  );
}
