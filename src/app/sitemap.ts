import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { getBlogPosts, blogSlug } from '@/lib/blog-source';
import { siteUrl } from '@/lib/shared';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const abs = (path: string) => new URL(path, siteUrl).toString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: abs('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: abs('/docs'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: abs('/pricing'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: abs('/packs'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: abs('/blog'), lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: abs('/packs/cicd-automation'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: abs('/packs/pyspark-templates'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: abs('/packs/governance-framework'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: abs('/packs/migration-toolkits'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const docsRoutes: MetadataRoute.Sitemap = source.getPages().map((page) => ({
    url: abs(page.url),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: page.url === '/docs' ? 0.9 : 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = getBlogPosts().map((post) => ({
    url: abs(`/blog/${blogSlug(post.info.path)}`),
    lastModified: new Date(`${post.date}T00:00:00`),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // De-dupe (the docs index may appear in more than one list).
  const seen = new Set<string>();
  return [...staticRoutes, ...blogRoutes, ...docsRoutes].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
