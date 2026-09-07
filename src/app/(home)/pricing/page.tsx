import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { PricingButtons } from '@/components/pricing-buttons';
import { JsonLd } from '@/components/json-ld';
import { SUBSCRIBER_COOKIE, verifySubscriberCookie } from '@/lib/subscriber-cookie';
import { AI_FREE_LIMIT, AI_SUBSCRIBER_LIMIT } from '@/lib/ai-limits';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'fabdocs.dev is free to read. Pro is $5/mo for a much higher daily limit on the Ask AI assistant — no account, cancel anytime.',
  alternates: { canonical: '/pricing' },
};

const FREE_FEATURES = [
  'Every guide, reference page, and playbook',
  'The interactive CU calculator and Spark pool sizer',
  `Ask AI assistant — ${AI_FREE_LIMIT} questions/day`,
  'Markdown + llms.txt exports of every page',
];

const PRO_FEATURES = [
  'Everything in Free',
  `Ask AI — ${AI_SUBSCRIBER_LIMIT} questions/day`,
  'Priority when new tools and playbooks ship',
  'No account — checkout and billing run through Stripe',
  'Cancel anytime, self-serve',
];

const FAQS = [
  {
    question: 'What exactly does Pro unlock?',
    answer: `A much higher daily limit on the Ask AI assistant — ${AI_SUBSCRIBER_LIMIT} questions per day instead of ${AI_FREE_LIMIT}. All docs, references, playbooks, and the interactive calculators stay free for everyone.`,
  },
  {
    question: 'Do I need to create an account?',
    answer: 'No. Checkout and the billing portal are handled entirely by Stripe — fabdocs never sees or stores your card details, and there is no separate login. Your subscription is tied to a signed cookie on your browser.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes — cancel yourself from the billing portal, no email needed. Access stays at the Pro limit through the end of the period you already paid for; it just does not renew after that.',
  },
  {
    question: 'Is there a refund if I cancel partway through a month?',
    answer: 'No — cancelling stops the next renewal, but the current paid period is not prorated or refunded. You keep the Pro limit until it ends.',
  },
  {
    question: 'I use a shared computer / cleared my cookies and lost Pro access.',
    answer: 'Re-run checkout from the same browser, or open the billing portal link from your Stripe receipt email. The subscription itself is not lost — only the browser cookie that proves it.',
  },
];

export default async function PricingPage() {
  const secret = process.env.COOKIE_SIGNING_SECRET;
  const raw = (await cookies()).get(SUBSCRIBER_COOKIE)?.value;
  const isSubscriber = Boolean(raw && secret && (await verifySubscriberCookie(raw, secret)));
  const billingEnabled = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);

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
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 text-center">
      <JsonLd data={faqJsonLd} />

      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Simple <span className="text-fd-primary">pricing</span>
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-fd-muted-foreground">
        The whole manual — every guide, reference, playbook, and calculator — is free,
        no sign-up. Pro just raises the daily limit on the AI assistant.
      </p>

      <div className="mt-12 grid gap-6 text-left sm:grid-cols-2">
        <div className="rounded-xl border border-fd-border bg-fd-card p-6">
          <h2 className="text-lg font-semibold">Free</h2>
          <p className="mt-1 text-3xl font-bold">
            $0<span className="text-sm font-normal text-fd-muted-foreground"> forever</span>
          </p>
          <ul className="mt-6 flex flex-col gap-3 text-sm">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-fd-muted-foreground" />
                <span className="text-fd-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/docs"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
          >
            Read the manual
          </Link>
        </div>

        <div className="rounded-xl border border-fd-primary/40 bg-fd-primary/5 p-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Pro</h2>
            {isSubscriber && (
              <span className="rounded-full border border-fd-primary/30 bg-fd-primary/10 px-2 py-0.5 font-mono text-[10px] text-fd-primary">
                Current plan
              </span>
            )}
          </div>
          <p className="mt-1 text-3xl font-bold">
            $5<span className="text-sm font-normal text-fd-muted-foreground"> /month</span>
          </p>
          <ul className="mt-6 flex flex-col gap-3 text-sm">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-fd-primary" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <PricingButtons isSubscriber={isSubscriber} billingEnabled={billingEnabled} />
          </div>
        </div>
      </div>

      <div className="mt-16 text-left">
        <h2 className="text-lg font-semibold">Pricing FAQ</h2>
        <dl className="mt-4 divide-y divide-fd-border border-y border-fd-border">
          {FAQS.map((faq) => (
            <div key={faq.question} className="py-4">
              <dt className="text-sm font-medium text-fd-foreground">{faq.question}</dt>
              <dd className="mt-1.5 text-sm text-fd-muted-foreground">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}
