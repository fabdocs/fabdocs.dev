import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/json-ld';

export const metadata: Metadata = {
  title: 'Microsoft Fabric vs Databricks',
  description:
    'An honest technical comparison — compute, storage, catalog, orchestration, and billing model — for teams evaluating or migrating between Fabric and Databricks.',
  alternates: { canonical: '/compare/fabric-vs-databricks' },
};

const AT_A_GLANCE: { dimension: string; fabric: string; databricks: string }[] = [
  { dimension: 'Storage format', fabric: 'Delta Lake on OneLake (ADLS Gen2)', databricks: 'Delta Lake on your cloud storage' },
  { dimension: 'Compute engine', fabric: 'Spark + Native Execution Engine (Velox/Gluten)', databricks: 'Spark + Photon' },
  { dimension: 'Catalog / governance', fabric: 'OneLake security (RLS/CLS/TLS on the lakehouse)', databricks: 'Unity Catalog' },
  { dimension: 'Orchestration', fabric: 'Data pipelines + notebook activities', databricks: 'Jobs/Workflows + Delta Live Tables' },
  { dimension: 'BI integration', fabric: 'Power BI Direct Lake (same tenant, no import)', databricks: 'Databricks SQL + partner BI connectors' },
  { dimension: 'Billing unit', fabric: 'Capacity Units — one shared, smoothed pool per capacity', databricks: 'DBUs — metered per cluster/warehouse, per second' },
  { dimension: 'Deployment scope', fabric: 'Microsoft Fabric SaaS (Azure-hosted)', databricks: 'Multi-cloud (Azure, AWS, GCP)' },
];

const FAQS = [
  {
    question: 'Can I use my Databricks Delta tables in Fabric without copying them?',
    answer:
      "Yes, if they live in storage you control (ADLS, S3, GCS). A OneLake shortcut points at the existing Delta folder with zero copy — every Fabric engine reads it like a native table. See the Shortcuts reference for caching and consistency details.",
  },
  {
    question: 'Does Fabric have an equivalent to Unity Catalog?',
    answer:
      'Not the same product, but OneLake security covers the same core job — row-, column-, and table-level access defined once and enforced across every engine (Spark, SQL endpoint, Direct Lake). It lacks some of Unity Catalog\'s cross-workspace lineage and data-sharing surface as of this writing.',
  },
  {
    question: 'Is Fabric cheaper than Databricks?',
    answer:
      "It depends entirely on your workload shape, and anyone who gives you a flat answer without knowing your usage is guessing. The billing models are structurally different — Fabric's Capacity Units are a shared, smoothed pool across every workload on the capacity; Databricks' DBUs meter per cluster or warehouse. Run your actual data volume and job pattern through the CU cost calculator before assuming either way.",
  },
  {
    question: 'What is the closest Fabric equivalent to Delta Live Tables?',
    answer:
      "There isn't a direct declarative equivalent. The migration playbook rebuilds each DLT table as an idempotent notebook wired into a pipeline's dependency order, with DLT expectations becoming explicit boundary assertions in the notebook.",
  },
];

export default function CompareFabricDatabricksPage() {
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
        <h1 className="text-4xl font-bold tracking-tight text-fd-foreground md:text-5xl">
          Microsoft Fabric vs Databricks
        </h1>
        <p className="mt-4 max-w-xl text-lg text-fd-muted-foreground">
          Both are Spark-based lakehouses that write Delta Parquet. The real
          differences are in billing shape, catalog model, and how tightly
          each ties into its BI layer — not raw engine capability.
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
                <th className="p-3 font-medium">Databricks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fd-border">
              {AT_A_GLANCE.map((row) => (
                <tr key={row.dimension}>
                  <td className="p-3 font-medium text-fd-foreground">{row.dimension}</td>
                  <td className="p-3 text-fd-muted-foreground">{row.fabric}</td>
                  <td className="p-3 text-fd-muted-foreground">{row.databricks}</td>
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
            <strong className="text-fd-foreground">Both write Delta Lake.</strong>{' '}
            Same open table format, same transaction log. A Databricks table is
            already in a format Fabric can read — often via a{' '}
            <Link href="/docs/onelake/shortcuts" className="text-fd-primary hover:underline">
              shortcut
            </Link>{' '}
            rather than a rewrite.
          </li>
          <li>
            <strong className="text-fd-foreground">Both accelerate Spark natively.</strong>{' '}
            Databricks' Photon and Fabric's{' '}
            <Link href="/docs/data-engineering/native-execution-engine" className="text-fd-primary hover:underline">
              Native Execution Engine
            </Link>{' '}
            both replace parts of the JVM execution path with a vectorized
            native engine, at no extra charge, for the same SQL/DataFrame API.
          </li>
          <li>
            <strong className="text-fd-foreground">Both centralize governance.</strong>{' '}
            Unity Catalog grants and{' '}
            <Link href="/docs/governance/onelake-security" className="text-fd-primary hover:underline">
              OneLake security
            </Link>{' '}
            roles solve the same problem — define row/column/table access once,
            have every engine honor it.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-fd-foreground">
          Where they genuinely differ
        </h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm text-fd-muted-foreground">
          <li>
            <strong className="text-fd-foreground">Billing shape.</strong> A
            Fabric capacity is one shared, smoothed pool of{' '}
            <Link href="/glossary#capacity-unit" className="text-fd-primary hover:underline">
              Capacity Units
            </Link>{' '}
            that every workload draws from — Spark, Warehouse, Direct Lake, all
            of it. Databricks meters DBUs per cluster or SQL warehouse. Neither
            is inherently cheaper; they reward different usage patterns.
          </li>
          <li>
            <strong className="text-fd-foreground">BI integration depth.</strong>{' '}
            Fabric's Direct Lake reads OneLake tables straight into a Power BI
            semantic model with no import step, because it's the same product.
            Databricks SQL is a strong warehouse engine but the BI layer is
            always a separate connection.
          </li>
          <li>
            <strong className="text-fd-foreground">No declarative pipeline engine in Fabric.</strong>{' '}
            Delta Live Tables' DAG-with-expectations model has no direct
            Fabric equivalent — you rebuild it explicitly as notebooks wired
            into a pipeline.
          </li>
          <li>
            <strong className="text-fd-foreground">Cloud scope.</strong> Databricks
            runs on Azure, AWS, or GCP. Fabric is Microsoft's SaaS platform —
            Azure-hosted, no multi-cloud option.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-fd-foreground">
          Migrating from Databricks to Fabric
        </h2>
        <p className="mt-3 text-sm text-fd-muted-foreground">
          If you're moving an existing estate rather than choosing greenfield,
          the step-by-step conversion — notebooks, jobs, Unity Catalog tables,
          and DLT pipelines — is in the migration playbook, including the
          Delta-protocol and Photon-vs-NEE gotchas that actually bite.
        </p>
        <Link
          href="/docs/playbooks/from-databricks"
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
