import type { Metadata } from 'next';
import Link from 'next/link';
import { Cookie, Database, Mail, ShieldCheck } from 'lucide-react';
import { appName, contactEmail, gitConfig } from '@/lib/shared';
import { BlogTOC } from '@/components/blog-toc';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    "What fabdocs.dev collects, what it doesn't, and how the newsletter, Ask AI, and Pro subscription actually work.",
  alternates: { canonical: '/privacy' },
};

const summary = [
  {
    icon: Mail,
    text: 'We collect your email only if you sign up for the newsletter — nothing else, ever.',
  },
  {
    icon: Cookie,
    text: 'Analytics is cookieless (Cloudflare Web Analytics) — no tracking, no cross-site profiles.',
  },
  {
    icon: ShieldCheck,
    text: 'No ads or ad trackers, anywhere — the only cookie is one that remembers an active Pro subscription.',
  },
  {
    icon: Database,
    text: 'Your data is never sold, rented, or shared with any third party.',
  },
];

const toc = [
  { title: 'What we collect', url: '#what-we-collect', depth: 2 },
  { title: 'The Ask AI assistant', url: '#the-ask-ai-assistant', depth: 2 },
  { title: 'The subscriber cookie', url: '#the-subscriber-cookie', depth: 2 },
  { title: "What we don't do", url: '#what-we-dont-do', depth: 2 },
  { title: 'Removing your data', url: '#removing-your-data', depth: 2 },
  { title: 'Third-party services', url: '#third-party-services', depth: 2 },
  { title: 'Changes to this policy', url: '#changes-to-this-policy', depth: 2 },
  { title: 'Questions', url: '#questions', depth: 2 },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl lg:mx-0">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mb-2 text-lg text-fd-muted-foreground">
          A plain description of what this site actually collects, stores, and does with it.
        </p>
        <p className="mb-10 text-sm text-fd-muted-foreground/70">Last updated: September 12, 2026</p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <article className="min-w-0 max-w-3xl flex-1">
          <div className="mb-14 grid grid-cols-1 gap-4 rounded-xl border border-fd-primary/20 bg-fd-primary/5 p-6 sm:grid-cols-2">
            {summary.map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <item.icon className="mt-0.5 size-5 shrink-0 text-fd-primary" />
                <p className="text-sm text-fd-foreground">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="prose-sm max-w-none space-y-10 text-fd-muted-foreground [&_h2]:mb-3 [&_h2]:scroll-mt-24 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-fd-foreground [&_li]:leading-relaxed [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
            <section>
              <h2 id="what-we-collect">What we collect</h2>
              <ul>
                <li>
                  <strong className="text-fd-foreground">Newsletter subscribers:</strong> your
                  email address, plus the page you subscribed from and — for spam/rate-limit
                  purposes only — the IP address the signup came from. That&rsquo;s stored in
                  Cloudflare KV.
                </li>
                <li>
                  <strong className="text-fd-foreground">Ask AI questions:</strong> your question
                  text and the URL of the page you asked it from, sent to Anthropic to generate an
                  answer. See{' '}
                  <a href="#the-ask-ai-assistant" className="text-fd-primary hover:underline">
                    below
                  </a>
                  .
                </li>
                <li>
                  <strong className="text-fd-foreground">Rate limiting:</strong> your IP address is
                  used to count daily requests (Ask AI, newsletter signups, pack downloads) and
                  auto-expires after the limit window — it isn&rsquo;t kept longer than that or used
                  for anything else.
                </li>
                <li>
                  <strong className="text-fd-foreground">Analytics:</strong> aggregate page-view
                  counts via Cloudflare Web Analytics, which doesn&rsquo;t use cookies or track
                  individuals across sites.
                </li>
              </ul>
            </section>

            <section>
              <h2 id="the-ask-ai-assistant">The Ask AI assistant</h2>
              <p>
                When you ask a question — on a docs page or via the sparkle button on a code
                block — the question text and the current page URL are sent to Anthropic&rsquo;s
                API, along with the text of the docs pages the assistant searches to ground its
                answer. Anthropic processes this to generate a response; fabdocs.dev doesn&rsquo;t
                store your questions or the assistant&rsquo;s answers after the response is
                streamed back to your browser.
              </p>
            </section>

            <section>
              <h2 id="the-subscriber-cookie">The subscriber cookie</h2>
              <p>
                Subscribing to Pro sets one cookie that lets the site recognize you as a
                subscriber without asking you to sign in on every visit. It holds a signed
                reference back to your Stripe customer record — not your email, name, or payment
                details — and is used only to unlock the higher daily Ask AI limit and pack
                downloads. Nothing else on the site sets a cookie.
              </p>
            </section>

            <section>
              <h2 id="what-we-dont-do">What we don&rsquo;t do</h2>
              <ul>
                <li>No Google Analytics, Facebook Pixel, or similar third-party ad trackers.</li>
                <li>No selling, renting, or sharing your data with anyone.</li>
                <li>No cross-site tracking or ad profiles built from your visit.</li>
                <li>fabdocs.dev never sees or stores your payment card details — Stripe handles that entirely.</li>
              </ul>
            </section>

            <section>
              <h2 id="removing-your-data">Removing your data</h2>
              <p>
                To have your newsletter email removed, email{' '}
                <a href={`mailto:${contactEmail}`} className="text-fd-primary hover:underline">
                  {contactEmail}
                </a>{' '}
                or open an issue on{' '}
                <a
                  href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-fd-primary hover:underline"
                >
                  GitHub
                </a>{' '}
                and it will be deleted. Cancelling a Pro subscription removes the subscriber
                cookie&rsquo;s validity automatically; your Stripe customer record follows{' '}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-fd-primary hover:underline"
                >
                  Stripe&rsquo;s own privacy policy
                </a>
                .
              </p>
            </section>

            <section>
              <h2 id="third-party-services">Third-party services</h2>
              <p>
                fabdocs.dev runs on Cloudflare — Workers for hosting, KV for the newsletter and
                rate limiting, and Web Analytics for traffic counts. Pro subscriptions are billed
                through Stripe, which handles and stores all payment details directly. Ask AI
                questions are sent to Anthropic&rsquo;s API to generate a response. Each
                provider&rsquo;s own privacy practices apply to the data it processes on
                fabdocs.dev&rsquo;s behalf.
              </p>
            </section>

            <section>
              <h2 id="changes-to-this-policy">Changes to this policy</h2>
              <p>
                This page may be updated as the site changes. Meaningful changes will be reflected
                here, with the date at the top kept current.
              </p>
            </section>

            <section>
              <h2 id="questions">Questions</h2>
              <p>
                Email{' '}
                <a href={`mailto:${contactEmail}`} className="text-fd-primary hover:underline">
                  {contactEmail}
                </a>{' '}
                or open an issue on{' '}
                <a
                  href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-fd-primary hover:underline"
                >
                  GitHub
                </a>
                . Billing questions are also covered in{' '}
                <Link href="/terms" className="text-fd-primary hover:underline">
                  Terms of Service
                </Link>
                .
              </p>
            </section>
          </div>
        </article>

        <BlogTOC toc={toc} />
      </div>
    </main>
  );
}
