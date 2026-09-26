import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/json-ld';

export const metadata: Metadata = {
  title: 'Microsoft Fabric vs Power BI Premium',
  description:
    "What's actually different between a Power BI Premium capacity and a Fabric capacity, whether you still need Premium, and what happens to a P SKU you already own.",
  alternates: { canonical: '/compare/fabric-vs-power-bi-premium' },
};

const AT_A_GLANCE: { dimension: string; premium: string; fabric: string }[] = [
  { dimension: 'What it licenses', premium: 'Power BI content only — reports, paginated reports, dataflows Gen1, dedicated capacity for AI visuals', fabric: 'Every workload on the same capacity: Power BI, Spark, Warehouse, Lakehouse, Data Factory pipelines, Real-Time Intelligence, Data Science' },
  { dimension: 'SKU naming', premium: 'P1–P5 (and EM1–EM3 on the embedded tier)', fabric: 'F2–F2048, sized in Capacity Units' },
  { dimension: 'Underlying resource', premium: 'A Power BI-only capacity', fabric: 'The same class of capacity, broadened to license every Fabric engine' },
  { dimension: 'New purchases', premium: 'No longer sold as a new capacity — see below', fabric: 'The current way to buy this tier of compute' },
  { dimension: 'Free viewing threshold', premium: 'P1 and above', fabric: 'F64 and above (same tier, renamed)' },
];

const FAQS = [
  {
    question: 'Can I still buy Power BI Premium capacity?',
    answer:
      "Microsoft's direction has been to fold Premium capacity purchasing into Fabric — new P-SKU capacity purchases are no longer the path forward, and F SKU is what you buy instead. Licensing terms like this do shift over time, so confirm current purchase options in the Microsoft admin/licensing portal rather than assuming this page is still current months from now.",
  },
  {
    question: 'What happens to a Premium capacity I already own?',
    answer:
      "It keeps working. Nothing about your existing reports, refresh schedules, or capacity assignment breaks on its own. The practical question is what your capacity looks like at renewal — plan on moving to the equivalent Fabric F SKU (P1 to F64, P2 to F128, and so on) rather than assuming the P SKU renews indefinitely.",
  },
  {
    question: "Do I need Fabric if I'm not using Spark, Warehouse, or pipelines?",
    answer:
      "Not for the workload itself — if every workspace on the capacity is pure Power BI content, a Fabric capacity licenses that exactly the same way Premium did. What you gain is the option to turn on other Fabric engines later on the same capacity without buying anything new, not a requirement to use them.",
  },
  {
    question: 'Is Premium Per User (PPU) affected too?',
    answer:
      "PPU is a separate, per-seat license from capacity SKUs, aimed at smaller Power BI-only deployments that don't need a shared capacity at all. Whether it's on the same purchasing path as P-SKU capacity has been changing — check current PPU availability in your tenant's licensing terms rather than assuming this page tracks it in real time.",
  },
];

export default function CompareFabricPowerBIPremiumPage() {
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
          Microsoft Fabric vs Power BI Premium
        </h1>
        <p className="mt-4 max-w-xl text-lg text-fd-muted-foreground">
          These aren't really two competing products to choose between —
          Fabric capacity is the successor to Premium capacity, licensing the
          same underlying resource for a broader set of workloads. The
          confusion is real, so here's what actually changed.
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
                <th className="p-3 font-medium">Power BI Premium</th>
                <th className="p-3 font-medium">Fabric</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fd-border">
              {AT_A_GLANCE.map((row) => (
                <tr key={row.dimension}>
                  <td className="p-3 font-medium text-fd-foreground">{row.dimension}</td>
                  <td className="p-3 text-fd-muted-foreground">{row.premium}</td>
                  <td className="p-3 text-fd-muted-foreground">{row.fabric}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-fd-muted-foreground">
          Full P-SKU-to-F-SKU mapping, CU counts, and per-tier pricing are in
          the{' '}
          <Link href="/docs/tools/capacity-sku-reference" className="text-fd-primary hover:underline">
            capacity SKU reference
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-fd-foreground">
          What actually changed
        </h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm text-fd-muted-foreground">
          <li>
            <strong className="text-fd-foreground">Same infrastructure, wider license.</strong>{' '}
            A Fabric F64 capacity isn't a different machine from a Premium P1
            capacity — it's the same tier of shared capacity, licensed to run
            Spark notebooks, a T-SQL Warehouse, Data Factory pipelines, and
            Real-Time Intelligence alongside Power BI, instead of Power BI
            alone.
          </li>
          <li>
            <strong className="text-fd-foreground">Nothing you built stops working.</strong>{' '}
            Reports, semantic models, and refresh schedules on an existing
            Premium capacity keep running. The renaming and licensing shift
            doesn't retroactively touch content that's already there.
          </li>
          <li>
            <strong className="text-fd-foreground">The purchasing path moved.</strong>{' '}
            New capacity purchases go through Fabric SKUs now rather than
            standalone Premium SKUs — see the FAQ for what that means at your
            next renewal.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-fd-foreground">
          Should you turn on the rest of Fabric?
        </h2>
        <p className="mt-3 text-sm text-fd-muted-foreground">
          Owning an F SKU doesn't obligate you to use Spark or the Warehouse —
          if Power BI is the only workload today, an F-SKU capacity licenses
          that exactly the way Premium did, at the equivalent tier. The
          difference is optionality: the same capacity can pick up a
          lakehouse or a pipeline later with no new purchase, which is worth
          knowing about even if you don't need it on day one. Model what a
          given workload would actually cost in CUs before turning anything
          on, using the{' '}
          <Link href="/docs/tools/cu-cost-calculator" className="text-fd-primary hover:underline">
            CU cost calculator
          </Link>
          .
        </p>
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
