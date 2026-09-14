import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/json-ld';
import { siteUrl } from '@/lib/shared';
import { getSortedGlossaryTerms } from '@/lib/glossary';

export const metadata: Metadata = {
  title: 'Glossary',
  description:
    'Plain-English definitions of Microsoft Fabric terms — OneLake, Direct Lake, V-Order, Capacity Units, shortcuts, mirroring, and more — each linked to the full reference.',
  alternates: { canonical: '/glossary' },
};

const SORTED = getSortedGlossaryTerms();

export default function GlossaryPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Microsoft Fabric glossary',
    description: metadata.description,
    url: `${siteUrl}/glossary`,
    hasDefinedTerm: SORTED.map((t) => ({
      '@type': 'DefinedTerm',
      name: t.term,
      description: t.definition,
      url: `${siteUrl}/glossary#${t.slug}`,
    })),
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16 md:py-20">
      <JsonLd data={jsonLd} />
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-fd-foreground md:text-5xl">
          Glossary
        </h1>
        <p className="mt-4 max-w-xl text-lg text-fd-muted-foreground">
          Fabric terminology, defined in plain English, each linked to the full
          reference page.
        </p>
      </div>

      <nav aria-label="Jump to term" className="flex flex-wrap gap-2 text-sm">
        {SORTED.map((t) => (
          <a
            key={t.slug}
            href={`#${t.slug}`}
            className="rounded-full border border-fd-border px-3 py-1 text-fd-muted-foreground transition hover:border-fd-primary/40 hover:text-fd-foreground"
          >
            {t.term}
          </a>
        ))}
      </nav>

      <dl className="flex flex-col divide-y divide-fd-border">
        {SORTED.map((t) => (
          <div key={t.slug} id={t.slug} className="scroll-mt-24 py-5">
            <dt className="text-lg font-semibold tracking-tight text-fd-foreground">
              {t.term}
            </dt>
            <dd className="mt-2 text-sm text-fd-muted-foreground">
              {t.definition}{' '}
              <Link href={t.href} className="text-fd-primary hover:underline">
                Full reference &rarr;
              </Link>
            </dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
