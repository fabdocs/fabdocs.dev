'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatBlogDate } from '@/lib/blog-source';

export interface BlogListPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
}

export function BlogList({ posts }: { posts: BlogListPost[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag]) => tag);
  }, [posts]);

  const visiblePosts = activeTag
    ? posts.filter((post) => post.tags.includes(activeTag))
    : posts;

  if (posts.length === 0) {
    return <p className="text-sm text-fd-muted-foreground">First post coming soon.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTag(null)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            activeTag === null
              ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground'
              : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/40 hover:text-fd-foreground'
          }`}
        >
          All ({posts.length})
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag((current) => (current === tag ? null : tag))}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              activeTag === tag
                ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground'
                : 'border-fd-border text-fd-muted-foreground hover:border-fd-primary/40 hover:text-fd-foreground'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {visiblePosts.length === 0 ? (
          <p className="text-sm text-fd-muted-foreground sm:col-span-2">
            No posts tagged &ldquo;{activeTag}&rdquo; yet.
          </p>
        ) : (
          visiblePosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-xl border border-fd-border bg-fd-card p-5 transition hover:border-fd-primary/40"
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
          ))
        )}
      </div>
    </div>
  );
}
