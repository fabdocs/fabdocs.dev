import { getBlogPosts, blogSlug } from '@/lib/blog-source';
import { appDescription, appName, siteUrl } from '@/lib/shared';

export const dynamic = 'force-static';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const posts = getBlogPosts();

  const items = posts
    .map((post) => {
      const url = `${siteUrl}/blog/${blogSlug(post.info.path)}`;
      const pubDate = new Date(`${post.date}T00:00:00Z`).toUTCString();
      const categories = post.tags
        .map((tag) => `<category>${escapeXml(tag)}</category>`)
        .join('');

      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <pubDate>${pubDate}</pubDate>
  <description>${escapeXml(post.description)}</description>
  ${categories}
</item>`;
    })
    .join('\n');

  const lastBuildDate = posts[0]
    ? new Date(`${posts[0].date}T00:00:00Z`).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(appName)} — Blog</title>
  <link>${siteUrl}/blog</link>
  <description>${escapeXml(appDescription)}</description>
  <language>en-us</language>
  <lastBuildDate>${lastBuildDate}</lastBuildDate>
  <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
