import { defineCollections } from 'fumadocs-mdx/macro';
import { z } from 'zod';

export const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  tags: z.array(z.string()).default([]),
});

// A flat collection — posts are individually-addressable long-form entries
// sorted by date, no page tree / sidebar.
export const blog = defineCollections({
  type: 'doc',
  dir: 'content/blog',
  schema: blogSchema,
  postprocess: {
    includeProcessedMarkdown: true,
  },
});

export function blogSlug(path: string): string {
  return path.replace(/\.mdx?$/, '');
}

export function getBlogPosts() {
  return [...blog.entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getBlogPost(slug: string) {
  return blog.entries.find((entry) => blogSlug(entry.info.path) === slug);
}

// Ranks other posts by shared-tag count (ties broken by recency). Chronological
// neighbors (see prev/next nav on the post page) are often topically unrelated
// once there are more than a couple of posts, so this is a separate signal.
export function getRelatedPosts(slug: string, limit = 2) {
  const posts = getBlogPosts();
  const current = posts.find((p) => blogSlug(p.info.path) === slug);
  if (!current) return [];

  const currentTags = new Set(current.tags);
  return posts
    .filter((p) => blogSlug(p.info.path) !== slug)
    .map((p) => ({ post: p, shared: p.tags.filter((t) => currentTags.has(t)).length }))
    .filter((entry) => entry.shared > 0)
    .sort((a, b) => b.shared - a.shared || new Date(b.post.date).getTime() - new Date(a.post.date).getTime())
    .slice(0, limit)
    .map((entry) => entry.post);
}

// `new Date('2026-09-09')` parses as UTC midnight, which can render as the
// previous day in a timezone behind UTC. Append a local time to avoid it.
export function formatBlogDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
