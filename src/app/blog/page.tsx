import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlogPosts, blogSlug, formatBlogDate } from '@/lib/blog-source';
import { NewsletterSignup } from '@/components/newsletter-signup';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'The Fabric change briefing and longer-form engineering writing — what changed in Microsoft Fabric and what to do about it, plus guides that pull the docs together.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndexPage() {
  const posts = getBlogPosts();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16 md:py-20">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-fd-foreground md:text-5xl">
          Blog
        </h1>
        <p className="mt-4 max-w-xl text-lg text-fd-muted-foreground">
          The change briefing — new runtimes, API updates, breaking changes —
          and longer engineering writing that pulls the reference material into
          one narrative.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {posts.length === 0 ? (
          <p className="text-sm text-fd-muted-foreground">First post coming soon.</p>
        ) : (
          posts.map((post) => {
            const slug = blogSlug(post.info.path);
            return (
              <Link
                key={slug}
                href={`/blog/${slug}`}
                className="group rounded-xl border border-fd-border bg-fd-card p-5 transition hover:border-fd-primary/40"
              >
                <p className="text-xs text-fd-muted-foreground">{formatBlogDate(post.date)}</p>
                <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-fd-foreground group-hover:text-fd-primary">
                  {post.title}
                </h2>
                <p className="mt-1.5 text-sm text-fd-muted-foreground">{post.description}</p>
                {post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-fd-border px-2 py-0.5 text-[11px] text-fd-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })
        )}
      </div>

      <NewsletterSignup source="blog" />
    </main>
  );
}
