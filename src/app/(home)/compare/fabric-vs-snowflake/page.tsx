import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/json-ld';

export const metadata: Metadata = {
  title: 'Microsoft Fabric vs Snowflake',
  description:
    'An honest technical comparison — storage format, compute model, governance, and billing — for teams evaluating or migrating between Fabric and Snowflake.',
  alternates: { canonical: '/compare/fabric-vs-snowflake' },
};

const AT_A_GLANCE: { dimension: string; fabric: string; snowflake: string }[] = [
  { dimension: 'Storage format', fabric: 'Delta Lake (open Parquet) on OneLake', snowflake: 'Proprietary micro-partitions natively; Iceberg tables as a newer, separate option' },
  { dimension: 'Compute model', fabric: 'One shared capacity (CUs) across every engine', snowflake: 'Independently sized virtual warehouses (XS–4XL) per workload' },
  { dimension: 'Primary language', fabric: 'Spark/Python-first, plus a T-SQL Warehouse engine', snowflake: 'SQL-first; Snowpark bridges to Python/Java/Scala' },
  { dimension: 'Catalog / governance', fabric: 'OneLake security (RLS/CLS/TLS on the lakehouse)', snowflake: 'Role hierarchy with inherited grants' },
  { dimension: 'BI integration', fabric: 'Power BI Direct Lake (same tenant, no import)', snowflake: 'Strong partner BI connector ecosystem, no zero-copy semantic model' },
  { dimension: 'Billing unit', fabric: 'Capacity Units — one shared, smoothed pool per capacity', snowflake: 'Credits — metered per virtual warehouse, per second' },
  { dimension: 'Deployment scope', fabric: 'Microsoft Fabric SaaS (Azure-hosted)', snowflake: 'Multi-cloud (Azure, AWS, GCP)' },
];

const FAQS = [
  {
    question: 'Is Snowflake data locked into a proprietary format?',
    answer:
      "Native Snowflake tables use proprietary micro-partitions you can't read outside Snowflake directly. Snowflake's newer Iceberg table support is an open-format escape hatch, but it's a separate table type you opt into, not the default. Fabric's OneLake is Delta Parquet natively — every table is already in an open format any engine can read.",
  },
  {
    question: 'Does Fabric have Snowflake-style Time Travel?',
    answer:
      "Yes, via Delta Lake's own history — VERSION AS OF queries a prior table version, the same underlying idea as Snowflake's AT/BEFORE. Retention is governed directly by your VACUUM schedule rather than a separate Time Travel setting, so it's more visible but also more your responsibility to configure correctly.",
  },
  {
    question: 'Is Fabric cheaper than Snowflake?',
    answer:
      "It depends on your workload shape, and a flat answer either way is a guess. The billing models differ structurally — Snowflake credits meter each virtual warehouse independently, while Fabric Capacity Units are one shared, smoothed pool across every workload on the capacity. Teams running many small, independently-sized Snowflake warehouses often find the savings in consolidating onto one Fabric capacity — model your actual case in the CU cost calculator rather than assuming.",
  },
  {
    question: "What's the hardest part of migrating from Snowflake?",
    answer:
      'Semi-structured data. Snowflake\'s VARIANT type has no direct Fabric equivalent — you decide per column whether to keep it as JSON text (query with OPENJSON) or shred it into typed columns during ingest. Shredding is more work up front and meaningfully cheaper to query for the life of the table.',
  },
];

export default function CompareFabricSnowflakePage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-6 py-16 md:py-20">
      <JsonLd data={faqJsonLd} />

      <div>
        <Link href="/compare" className="text-sm text-fd-muted-foreground hover:text-fd-primary">
          &larr; All comparisons
        </Link>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-fd-foreground md:text-5xl">
          Microsoft Fabric vs Snowflake
        </h1>
        <p className="mt-4 max-w-xl text-lg text-fd-muted-foreground">
          Both separate storage from compute and bill on an abstracted unit
          instead of raw VM pricing. The real differences are storage
          openness, how compute is sized, and how tightly each ties into its
          BI layer.
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-fd-foreground">
          At a glance
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-fd-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-fd-card/60 text-fd-muted-foreground">
              <tr>
                <th className="p-3 font-medium">Dimension</th>
                <th className="p-3 font-medium">Fabric</th>
                <th className="p-3 font-medium">Snowflake</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fd-border">
              {AT_A_GLANCE.map((row) => (
                <tr key={row.dimension}>
                  <td className="p-3 font-medium text-fd-foreground">{row.dimension}</td>
                  <td className="p-3 text-fd-muted-foreground">{row.fabric}</td>
                  <td className="p-3 text-fd-muted-foreground">{row.snowflake}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-fd-foreground">
          Where they're actually similar
        </h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm text-fd-muted-foreground">
          <li>
            <strong className="text-fd-foreground">Both separate storage from compute.</strong>{' '}
            Neither ties you to a fixed cluster running 24/7 for occasional
            queries — Snowflake suspends idle warehouses, Fabric's capacity
            model smooths usage across workloads rather than per-warehouse.
          </li>
          <li>
            <strong className="text-fd-foreground">Both abstract away infrastructure sizing.</strong>{' '}
            You pick a warehouse size or a capacity SKU, not a VM type or
            core count. Neither requires you to manage the underlying
            cluster.
          </li>
          <li>
            <strong className="text-fd-foreground">Both version their tables.</strong>{' '}
            Snowflake's Time Travel and Delta Lake's transaction log both let
            you query or restore a prior table state — see{' '}
            <Link href="/docs/onelake/vacuum-and-retention" className="text-fd-primary hover:underline">
              VACUUM &amp; retention
            </Link>{' '}
            for how Fabric governs how far back that window goes.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-fd-foreground">
          Where they genuinely differ
        </h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm text-fd-muted-foreground">
          <li>
            <strong className="text-fd-foreground">Storage openness.</strong>{' '}
            A native Snowflake table lives in a proprietary format you can
            only query through Snowflake. A Fabric lakehouse table is Delta
            Parquet on OneLake from the start — readable by Spark, the SQL
            endpoint, or an external engine via a{' '}
            <Link href="/docs/onelake/shortcuts" className="text-fd-primary hover:underline">
              shortcut
            </Link>{' '}
            in the other direction, with no export step.
          </li>
          <li>
            <strong className="text-fd-foreground">Compute sizing model.</strong>{' '}
            Snowflake warehouses are sized and billed independently per
            workload (XS through 4XL). Fabric pools every workload — Spark,
            Warehouse, Direct Lake — against one{' '}
            <Link href="/glossary#capacity-unit" className="text-fd-primary hover:underline">
              Capacity Unit
            </Link>{' '}
            budget you size once.
          </li>
          <li>
            <strong className="text-fd-foreground">Engine breadth.</strong>{' '}
            Snowflake is a SQL engine first, with Snowpark bridging to
            Python/Spark-style workloads. Fabric ships Spark notebooks, a
            T-SQL warehouse, and KQL side by side over the same OneLake
            storage — pick the engine per workload rather than per platform.
          </li>
          <li>
            <strong className="text-fd-foreground">BI integration depth.</strong>{' '}
            Fabric's Direct Lake reads OneLake tables straight into a Power
            BI semantic model with no import step. Snowflake has a mature
            partner BI ecosystem, but every connection is external.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-fd-foreground">
          Migrating from Snowflake to Fabric
        </h2>
        <p className="mt-3 text-sm text-fd-muted-foreground">
          If you're moving an existing estate rather than choosing
          greenfield, the step-by-step conversion — DDL translation, task
          graphs, role mapping, and the VARIANT decision — is in the
          migration playbook.
        </p>
        <Link
          href="/docs/playbooks/from-snowflake"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground shadow-lg shadow-fd-primary/25 transition-transform hover:-translate-y-0.5"
        >
          Read the migration playbook
        </Link>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-fd-foreground">
          FAQ
        </h2>
        <div className="mt-4 flex flex-col divide-y divide-fd-border">
          {FAQS.map((faq) => (
            <div key={faq.question} className="py-4">
              <h3 className="font-semibold text-fd-foreground">{faq.question}</h3>
              <p className="mt-2 text-sm text-fd-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
