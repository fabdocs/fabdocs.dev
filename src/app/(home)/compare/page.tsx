import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Compare Microsoft Fabric',
  description:
    'Honest, non-marketing comparisons between Microsoft Fabric and the platforms teams evaluate it against.',
  alternates: { canonical: '/compare' },
};

const COMPARISONS = [
  {
    title: 'Fabric vs Databricks',
    href: '/compare/fabric-vs-databricks',
    description: 'Billing shape, catalog model, and BI integration depth.',
  },
  {
    title: 'Fabric vs Snowflake',
    href: '/compare/fabric-vs-snowflake',
    description: 'Storage openness, compute sizing, and governance.',
  },
];

export default function ComparePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16 md:py-20">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-fd-foreground md:text-5xl">
          Compare
        </h1>
        <p className="mt-4 max-w-xl text-lg text-fd-muted-foreground">
          Deciding between Fabric and something else? These are deliberately
          not sales pitches — where the platforms are genuinely similar, where
          they differ, and an honest answer on cost instead of a made-up
          number.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {COMPARISONS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-xl border border-fd-border bg-fd-card p-5 transition hover:border-fd-primary/40"
          >
            <h2 className="text-lg font-semibold tracking-tight text-fd-foreground group-hover:text-fd-primary">
              {c.title}
            </h2>
            <p className="mt-1.5 text-sm text-fd-muted-foreground">{c.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
