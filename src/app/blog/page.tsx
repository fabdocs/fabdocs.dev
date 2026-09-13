import type { Metadata } from 'next';
import { getBlogPosts, blogSlug } from '@/lib/blog-source';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { BlogList } from '@/components/blog-list';

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
