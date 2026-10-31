import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/json-ld';

export const metadata: Metadata = {
  title: 'Microsoft Fabric vs Azure Synapse Analytics',
  description:
    'Fabric and Synapse share an engine lineage. The real questions are what carries over directly, what needs a rebuild, and whether migrating is worth it yet.',
  alternates: { canonical: '/compare/fabric-vs-synapse' },
};

const AT_A_GLANCE: { dimension: string; synapse: string; fabric: string }[] = [
  { dimension: 'Pipelines engine', synapse: 'Synapse Pipelines (Azure Data Factory)', fabric: 'Fabric Data Pipelines — the same engine again' },
  { dimension: 'SQL compute', synapse: 'Dedicated SQL pools (hash/round-robin/replicate distribution) + serverless SQL pools', fabric: 'Fabric Warehouse over Delta — no distribution model to configure' },
  { dimension: 'Spark', synapse: 'Spark pools, mssparkutils', fabric: 'Spark in a notebook/Environment, notebookutils (successor, mostly a rename)' },
  { dimension: 'Storage', synapse: 'ADLS Gen2, queried via external tables / serverless SQL', fabric: 'OneLake (Delta Lake) — every engine reads the same table natively' },
  { dimension: 'Operational DB replication', synapse: 'Synapse Link (SQL, Dataverse, Cosmos DB)', fabric: 'Database mirroring — same concept, built by the same team' },
  { dimension: 'Security model', synapse: 'Workspace RBAC + SQL-level roles', fabric: 'Workspace roles + OneLake security (RLS/CLS/TLS enforced at the data layer)' },
  { dimension: 'Billing unit', synapse: 'Per-pool DWU/vCore + serverless pay-per-TB-scanned', fabric: 'Capacity Units — one shared, smoothed pool across every workload' },
];

const FAQS = [
  {
    question: 'Is Fabric just Synapse renamed?',
    answer:
      "No — it's a real architectural shift, not a rebrand. Synapse Pipelines and the Data Factory engine carry over almost unchanged, but Synapse's dedicated SQL pool distribution model (hash/round-robin/replicate) has no equivalent in Fabric at all. A Fabric Warehouse sits on Delta tables in OneLake and relies on file layout — Z-order, liquid clustering, file size — to do what distribution used to do. That's a different execution model to design for, not a setting to toggle.",
  },
  {
    question: 'Is Microsoft retiring Synapse?',
    answer:
      "Microsoft's public direction has been that Fabric is where Synapse capability is headed, but exact timelines and what happens to existing Synapse workspaces are the kind of thing that shifts — check current guidance directly rather than trusting a specific date on this page. What's solid regardless of timeline: anything new you'd build in Synapse today has a direct Fabric equivalent, so building there doesn't buy you anything incremental.",
  },
  {
    question: "What's the single hardest part of migrating?",
    answer:
      "Dedicated SQL pool tables that leaned heavily on distribution tuning for a handful of huge fact tables. Translating a hash-distributed fact table into a Z-ordered Delta table or a replicated dimension into a small broadcast-friendly table is design work with real judgment calls, not a mechanical export — budget real time for it specifically, separate from the pipeline and Spark-notebook migration, which are comparatively mechanical.",
  },
  {
    question: 'Is Fabric cheaper than Synapse?',
    answer:
      "It depends on the shape of what you're running, and a flat answer either way is a guess. Synapse bills dedicated pools by DWU/vCore and serverless by TB scanned; Fabric Capacity Units pool every workload — Warehouse, Spark, pipelines — against one smoothed budget. Teams running several underutilized dedicated pools often find consolidating onto one Fabric capacity cheaper; teams with one enormous, consistently busy pool may not. Model your actual workload in the CU cost calculator rather than assuming.",
  },
  {
    question: 'Does Synapse Link map directly to Fabric mirroring?',
    answer:
      "About as directly as any migration gets. Fabric's database mirroring is the same idea — continuous, low-latency replication into read-only Delta tables — built by the same team with the lessons from Synapse Link folded in. Stand up the mirror against the same source, validate row counts match the existing Synapse Link tables, then cut the old link.",
  },
];

export default function CompareFabricSynapsePage() {
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
          Microsoft Fabric vs Azure Synapse Analytics
        </h1>
        <p className="mt-4 max-w-xl text-lg text-fd-muted-foreground">
          This comparison is different from the others — Fabric and Synapse
          share an engine lineage, so the question isn't really "which
          platform" so much as "what carries over directly, and what needs a
          genuine rebuild."
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
                <th className="p-3 font-medium">Synapse</th>
                <th className="p-3 font-medium">Fabric</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fd-border">
              {AT_A_GLANCE.map((row) => (
                <tr key={row.dimension}>
                  <td className="p-3 font-medium text-fd-foreground">{row.dimension}</td>
                  <td className="p-3 text-fd-muted-foreground">{row.synapse}</td>
                  <td className="p-3 text-fd-muted-foreground">{row.fabric}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-fd-foreground">
          What carries over almost unchanged
        </h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm text-fd-muted-foreground">
          <li>
            <strong className="text-fd-foreground">Pipelines.</strong>{' '}
            Synapse Pipelines are Azure Data Factory. Fabric Data Pipelines
            are the same engine again. Most activities — Copy, Lookup,
            ForEach, Execute Pipeline, web/webhook calls — translate directly
            from exported JSON; the real work is re-pointing linked services
            to Connections.
          </li>
          <li>
            <strong className="text-fd-foreground">Spark notebooks.</strong>{' '}
            The %%pyspark and %%spark cell magics carry over as-is.{' '}
            mssparkutils becomes{' '}
            <Link href="/docs/data-engineering/notebookutils-reference" className="text-fd-primary hover:underline">
              notebookutils
            </Link>
            , mostly a rename.
          </li>
          <li>
            <strong className="text-fd-foreground">Synapse Link sources.</strong>{' '}
            SQL, Dataverse, and Cosmos DB replication maps close to directly
            onto{' '}
            <Link href="/docs/onelake/mirroring" className="text-fd-primary hover:underline">
              database mirroring
            </Link>
            .
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-fd-foreground">
          What needs a genuine rebuild
        </h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm text-fd-muted-foreground">
          <li>
            <strong className="text-fd-foreground">SQL pool distribution.</strong>{' '}
            A dedicated pool's HASH, ROUND_ROBIN, and REPLICATE options
            have no Fabric equivalent — there's no "how is this table
            physically distributed" concept to configure. A hash-distributed
            fact table becomes a normal Delta table{' '}
            <Link href="/docs/onelake/delta-optimization" className="text-fd-primary hover:underline">
              Z-ordered
            </Link>{' '}
            on the former hash key; a replicated dimension becomes just a
            small table, since size alone triggers broadcast behavior.
          </li>
          <li>
            <strong className="text-fd-foreground">Security and RBAC.</strong>{' '}
            Synapse's workspace RBAC and SQL-level roles don't have an
            export/import path into{' '}
            <Link href="/docs/governance/onelake-security" className="text-fd-primary hover:underline">
              OneLake security
            </Link>
            . Design the role set fresh from current requirements rather than
            trying to port it — most access models accumulate years of scope
            creep anyway, so this is a forcing function worth taking.
          </li>
          <li>
            <strong className="text-fd-foreground">Serverless SQL pool views and PolyBase external tables.</strong>{' '}
            Views over external files with schema encoded inline, and
            PolyBase-style external tables, don't repoint cleanly — they get
            rebuilt against the Lakehouse SQL endpoint or as a shortcut,
            since column mapping and type inference behave differently.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-fd-foreground">
          Migrating from Synapse to Fabric
        </h2>
        <p className="mt-3 text-sm text-fd-muted-foreground">
          If you've decided to move, the step-by-step order — pipelines
          first, Synapse Link sources in parallel, Spark notebooks next,
          dedicated SQL pool tables last — plus the full mapping table and
          the PolyBase/serverless-view gotchas, is in the migration
          playbook.
        </p>
        <Link
          href="/docs/playbooks/from-synapse"
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
