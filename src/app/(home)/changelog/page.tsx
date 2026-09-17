import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog',
  description:
    "What's shipped on fabdocs.dev, most recent first — new docs, tools, packs, and fixes.",
  alternates: { canonical: '/changelog' },
};

interface Entry {
  date: string;
  items: string[];
}

const ENTRIES: Entry[] = [
  {
    date: '2026-09-17',
    items: [
      'Site-wide accuracy pass: corrected inaccurate code examples and unverified claims found during an internal review — a broken hero code sample, a pricing-page inconsistency, and a dangerous VACUUM example among them.',
    ],
  },
  {
    date: '2026-09-15 – 2026-09-16',
    items: [
      'Added a Documentation dropdown to the top nav.',
      'Added Fabric vs Databricks and Fabric vs Snowflake comparison pages, plus a /compare index.',
      'Made the Ask AI assistant usable directly from the homepage.',
    ],
  },
  {
    date: '2026-09-14',
    items: [
      'Added the Direct Lake vs Import advisor, an interactive decision tool.',
      'Added a 21-term Fabric glossary.',
      'Added a "topics covered" ticker to the homepage.',
    ],
  },
  {
    date: '2026-09-13',
    items: [
      'Grew the blog to 5 posts, added tag filtering and an RSS feed.',
      'Added per-post social share images and fixed truncated titles and oversized descriptions.',
      'Added a custom 404 page and previous/next navigation between blog posts.',
    ],
  },
  {
    date: '2026-09-12',
    items: [
      'Added the Azure Synapse Analytics migration playbook.',
      'Added the Privacy Policy, Terms of Service, and security.txt.',
      "Added \"What Ask AI sends (and doesn't)\" — the assistant's full data-handling writeup.",
    ],
  },
  {
    date: '2026-09-08 – 2026-09-10',
    items: [
      'Shipped all 5 starter kits: CI/CD Automation, PySpark & Notebook Templates, Governance & Security Framework, Migration Toolkits, Workspace Monitoring.',
      'Added a free compliance review checklist alongside the Governance pack.',
      'Launched the blog.',
    ],
  },
  {
    date: '2026-09-07',
    items: [
      'fabdocs.dev launches — OneLake & Delta Lake, Data Engineering, CI/CD & Git, Governance & Security, and Tools & Calculators.',
      'Added the Ask AI assistant and the Pro ($5/mo) subscription.',
      'Added the newsletter signup.',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-16 md:py-20">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-fd-foreground md:text-5xl">
          Changelog
        </h1>
        <p className="mt-4 max-w-xl text-lg text-fd-muted-foreground">
          What&rsquo;s shipped on fabdocs.dev, most recent first.
        </p>
      </div>

      <ol className="flex flex-col gap-8 border-s border-fd-border ps-6">
        {ENTRIES.map((entry) => (
          <li key={entry.date} className="relative">
            <span
              aria-hidden
              className="absolute top-1.5 -start-[1.6rem] size-2 rounded-full bg-fd-primary"
            />
            <time className="font-mono text-sm text-fd-muted-foreground">{entry.date}</time>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-fd-foreground">
              {entry.items.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-fd-muted-foreground" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </main>
  );
}
