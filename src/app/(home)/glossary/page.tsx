import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/json-ld';
import { siteUrl } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'Glossary',
  description:
    'Plain-English definitions of Microsoft Fabric terms — OneLake, Direct Lake, V-Order, Capacity Units, shortcuts, mirroring, and more — each linked to the full reference.',
  alternates: { canonical: '/glossary' },
};

interface Term {
  term: string;
  slug: string;
  definition: string;
  href: string;
}

const TERMS: Term[] = [
  {
    term: 'Audit log',
    slug: 'audit-log',
    definition:
      'Fabric activity is split across several sources: the Purview/M365 unified audit log (user and admin actions, 180-day retention), the Monitoring hub (recent job runs), the Capacity Metrics app (CU consumption), and workspace monitoring via Eventhouse for anything you want to keep longer.',
    href: '/docs/governance/audit-logs',
  },
  {
    term: 'Capacity (F SKU)',
    slug: 'capacity',
    definition:
      'The purchased unit of Fabric compute, sized F2 through F2048. The number is the Capacity Units it provides, and every workload — Spark, Warehouse, pipelines, Direct Lake, Eventstream, KQL — draws from that one shared, smoothed pool.',
    href: '/docs/tools/capacity-sku-reference',
  },
  {
    term: 'Capacity Unit (CU)',
    slug: 'capacity-unit',
    definition:
      "Fabric's single billing currency. Every engine's work — a Spark job, a SQL query, a Direct Lake reframe, a pipeline run — converts to CU-seconds drawn from the capacity's shared pool, smoothed over a rolling window rather than billed per-query.",
    href: '/docs/tools/cu-cost-calculator',
  },
  {
    term: 'Deployment pipeline',
    slug: 'deployment-pipeline',
    definition:
      'A Fabric item with up to three stages (dev, test, prod), each bound to a workspace. Deploying copies item definitions from one stage to the next, matching by name and applying deployment rules to rebind stage-specific values.',
    href: '/docs/cicd/deployment-pipelines',
  },
  {
    term: 'Direct Lake',
    slug: 'direct-lake',
    definition:
      "A semantic-model mode that reads Delta tables straight from OneLake into memory on query, with no import step and no refresh schedule — the model reframes to pick up new table versions instead. Its speed ceiling matches Import mode, but only when the source table is V-Order-tuned and compacted.",
    href: '/blog/direct-lake-vs-import',
  },
  {
    term: 'Git integration',
    slug: 'git-integration',
    definition:
      'Binds a workspace to a branch of an Azure DevOps or GitHub repo. Each supported item serializes to a folder containing a `.platform` file plus item-specific definitions — Commit pushes workspace state to the branch, Update pulls it back.',
    href: '/docs/cicd/git-integration',
  },
  {
    term: 'Lakehouse',
    slug: 'lakehouse',
    definition:
      'A Fabric item combining managed Delta tables (queryable by every engine via a SQL analytics endpoint) with an unmanaged Files area for raw or landing data — the most common landing spot for data in OneLake.',
    href: '/docs/onelake',
  },
  {
    term: 'Mirroring',
    slug: 'mirroring',
    definition:
      'Continuous, low-latency replication of an external operational database (Snowflake, Azure SQL, Cosmos DB, Postgres) into read-only Delta tables in a Fabric lakehouse — no pipeline to build, and storage is free up to an allowance sized to your capacity.',
    href: '/docs/onelake/mirroring',
  },
  {
    term: 'Native Execution Engine (NEE)',
    slug: 'native-execution-engine',
    definition:
      'Replaces parts of the JVM-based Spark physical plan with a vectorized C++ engine (Gluten + Velox) for scans, filters, joins, and aggregations — same SQL and DataFrame API, no separate charge, and a direct cut in CU consumption when it applies.',
    href: '/docs/data-engineering/native-execution-engine',
  },
  {
    term: 'notebookutils',
    slug: 'notebookutils',
    definition:
      "The built-in helper module inside a Fabric notebook session (successor to `mssparkutils`, which still works as an alias) for filesystem access, notebook orchestration, secrets, and lakehouse operations. It only exists inside a live Fabric Spark session.",
    href: '/docs/data-engineering/notebookutils-reference',
  },
  {
    term: 'OneLake',
    slug: 'onelake',
    definition:
      'A single, tenant-wide data lake built on ADLS Gen2. Every workspace gets a folder, every lakehouse and warehouse writes Delta-Parquet into it, and every engine — Spark, SQL, Power BI Direct Lake, KQL — reads the same files.',
    href: '/docs/onelake',
  },
  {
    term: 'OneLake security',
    slug: 'onelake-security',
    definition:
      "Row-, column-, and table-level access rules defined once on a lakehouse and enforced at the data layer itself, so Spark, the SQL endpoint, and Direct Lake all honor the same restriction — unlike the older model where Spark could bypass SQL-endpoint or Power BI security.",
    href: '/docs/governance/onelake-security',
  },
  {
    term: 'OPTIMIZE / compaction',
    slug: 'optimize',
    definition:
      'A Spark job that rewrites a Delta table\'s small files into fewer, larger ones (targeting 128–256 MB), cutting the CU cost of every downstream read. Frequent MERGE or streaming writes create the small-file problem this fixes.',
    href: '/docs/onelake/delta-optimization',
  },
  {
    term: 'Resource profile',
    slug: 'resource-profile',
    definition:
      'A named bundle of roughly twenty Spark configuration values — shuffle partitions, AQE thresholds, file-size targets, broadcast limits — tuned for a workload shape (read-heavy, write-heavy, balanced) so you set one option instead of tuning each individually.',
    href: '/docs/data-engineering/resource-profiles',
  },
  {
    term: 'Runtime (Fabric Runtime)',
    slug: 'runtime',
    definition:
      "The versioned bundle of Spark, Delta Lake, and Python that a Fabric notebook or job runs on. Runtimes are deprecated on a schedule, and a version bump can change default behavior — plan upgrades rather than letting them force themselves on you.",
    href: '/docs/data-engineering/runtime-upgrades',
  },
  {
    term: 'Shortcut',
    slug: 'shortcut',
    definition:
      'A pointer that makes a folder or table in another storage account, cloud, or Dataverse appear inside a lakehouse with zero copy. Every Fabric engine reads through it like a native table; Fabric caches file bytes on read for up to 24 hours.',
    href: '/docs/onelake/shortcuts',
  },
  {
    term: 'V-Order',
    slug: 'v-order',
    definition:
      'A write-time Parquet optimization — sorting, row-group reordering, dictionary encoding — tuned for the VertiPaq engine behind Power BI and the SQL analytics endpoint. Costs 10–25% more CU to write; saves 15–50% on Direct Lake and SQL-endpoint reads of the same data.',
    href: '/docs/onelake/v-order',
  },
  {
    term: 'VACUUM',
    slug: 'vacuum',
    definition:
      "Deletes Parquet files no longer referenced by the current Delta table version and older than the retention threshold, reclaiming OneLake storage. It doesn't touch the transaction log — you lose time-travel to removed versions, not the ability to read the current table.",
    href: '/docs/onelake/vacuum-and-retention',
  },
  {
    term: 'Variable library',
    slug: 'variable-library',
    definition:
      'A single workspace item holding named variables, each with a value per value set (typically one per deployment stage). Notebooks and pipelines reference the variable by name, and the active value set switches automatically on deployment.',
    href: '/docs/cicd/variable-libraries',
  },
  {
    term: 'Warehouse',
    slug: 'warehouse',
    definition:
      'A Fabric item providing full T-SQL read/write semantics over Delta tables in OneLake — the same underlying storage a lakehouse uses, accessed through a warehouse-style engine instead of Spark.',
    href: '/docs/onelake',
  },
  {
    term: 'Workspace identity',
    slug: 'workspace-identity',
    definition:
      'A managed Entra service principal that Fabric automatically creates and ties to one workspace, letting items in that workspace authenticate to Azure resources — including storage behind a firewall — with no client secret to store or rotate.',
    href: '/docs/governance/workspace-identity',
  },
];

const SORTED = [...TERMS].sort((a, b) => a.term.localeCompare(b.term));

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
