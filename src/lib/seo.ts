import { appDescription, appName, siteUrl } from './shared';

const abs = (path: string) => new URL(path, siteUrl).toString();

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: appName,
  url: siteUrl,
  description: appDescription,
  logo: abs('/icon.svg'),
};

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: appName,
  url: siteUrl,
  description: appDescription,
};

export function articleJsonLd(input: {
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: input.title,
    description: input.description,
    url: abs(input.url),
    image: input.imageUrl ? abs(input.imageUrl) : undefined,
    isPartOf: { '@type': 'WebSite', name: appName, url: siteUrl },
    publisher: {
      '@type': 'Organization',
      name: appName,
      url: siteUrl,
      logo: abs('/icon.svg'),
    },
  };
}

export function breadcrumbJsonLd(crumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: abs(crumb.url),
    })),
  };
}
