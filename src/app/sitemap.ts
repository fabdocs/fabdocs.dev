import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
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
  ];

  const docsRoutes: MetadataRoute.Sitemap = source.getPages().map((page) => ({
    url: abs(page.url),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: page.url === '/docs' ? 0.9 : 0.7,
  }));

  // De-dupe (the docs index may appear in both lists).
  const seen = new Set<string>();
  return [...staticRoutes, ...docsRoutes].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
