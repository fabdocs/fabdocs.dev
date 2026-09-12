import type { Metadata } from 'next';
import Link from 'next/link';
import { appName, contactEmail, gitConfig } from '@/lib/shared';
import { BlogTOC } from '@/components/blog-toc';
import { AI_FREE_LIMIT, AI_SUBSCRIBER_LIMIT } from '@/lib/ai-limits';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms that govern using fabdocs.dev, the free Microsoft Fabric documentation, and the paid Ask AI / starter-kit subscription.',
  alternates: { canonical: '/terms' },
};

const toc = [
  { title: 'Agreement to terms', url: '#agreement-to-terms', depth: 2 },
  { title: 'The service', url: '#the-service', depth: 2 },
  { title: 'Free tier and Pro subscription', url: '#free-tier-and-pro-subscription', depth: 2 },
  { title: 'AI-generated content', url: '#ai-generated-content', depth: 2 },
  { title: 'Starter kits', url: '#starter-kits', depth: 2 },
  { title: 'Acceptable use', url: '#acceptable-use', depth: 2 },
  { title: 'Content and intellectual property', url: '#content-and-intellectual-property', depth: 2 },
  { title: 'Third-party services', url: '#third-party-services', depth: 2 },
  { title: 'Disclaimer of warranties', url: '#disclaimer-of-warranties', depth: 2 },
  { title: 'Limitation of liability', url: '#limitation-of-liability', depth: 2 },
  { title: 'Changes to these terms', url: '#changes-to-these-terms', depth: 2 },
  { title: 'Contact', url: '#contact', depth: 2 },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl lg:mx-0">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mb-2 text-lg text-fd-muted-foreground">
          The terms that apply to using {appName}, in plain language.
        </p>
        <p className="mb-10 text-sm text-fd-muted-foreground/70">Last updated: September 12, 2026</p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <article className="min-w-0 max-w-3xl flex-1">
          <div className="prose-sm max-w-none space-y-10 text-fd-muted-foreground [&_h2]:mb-3 [&_h2]:scroll-mt-24 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-fd-foreground [&_li]:leading-relaxed [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
            <section>
              <h2 id="agreement-to-terms">Agreement to terms</h2>
              <p>
                By using {appName} — reading the docs, using Ask AI or the interactive
                calculators, or subscribing to Pro — you agree to these terms. If you
                don&rsquo;t agree with them, the site&rsquo;s free content is still available to
                read; the AI assistant, packs, and subscription described below aren&rsquo;t
                offered to you.
              </p>
            </section>

            <section>
              <h2 id="the-service">The service</h2>
              <p>
                {appName} is an independent, unofficial Microsoft Fabric engineering manual:
                docs, playbooks, calculators, and blog content, all free to read with no sign-up.
                It also offers an AI-assisted &ldquo;Ask AI&rdquo; tool, free up to a daily limit,
                with a paid Pro subscription for a higher limit and access to five downloadable
                starter kits. {appName} isn&rsquo;t affiliated with, endorsed by, or sponsored by
                Microsoft; &ldquo;Microsoft Fabric&rdquo; is a trademark of Microsoft Corporation.
              </p>
            </section>

            <section>
              <h2 id="free-tier-and-pro-subscription">Free tier and Pro subscription</h2>
              <ul>
                <li>
                  Every doc, playbook, reference page, and the interactive calculators are free,
                  no account required.
                </li>
                <li>
                  Ask AI is usable without an account, up to {AI_FREE_LIMIT} questions a day.
                </li>
                <li>
                  Pro is a $5/month recurring subscription that raises the Ask AI limit to{' '}
                  {AI_SUBSCRIBER_LIMIT} questions a day and unlocks all five starter-kit downloads.
                  It renews automatically each month until cancelled.
                </li>
                <li>Billing is handled entirely by Stripe. {appName} never sees or stores your card details.</li>
                <li>
                  You can cancel anytime from the billing portal, linked from the{' '}
                  <Link href="/pricing" className="text-fd-primary hover:underline">
                    Pricing
                  </Link>{' '}
                  page once subscribed. Cancelling stops future renewal; access continues until
                  the end of the billing period already paid for.
                </li>
                <li>
                  Charges are non-refundable except where required by law. If a charge was made
                  in error, contact{' '}
                  <a href={`mailto:${contactEmail}`} className="text-fd-primary hover:underline">
                    {contactEmail}
                  </a>{' '}
                  and it will be looked at.
                </li>
              </ul>
            </section>

            <section>
              <h2 id="ai-generated-content">AI-generated content</h2>
              <p>
                Ask AI generates answers — including code — based on your question, grounded in a
                search of this site&rsquo;s own docs, using a third-party AI model. This output is
                a starting point, not a verified answer:
              </p>
              <ul>
                <li>It can be wrong, outdated, or not fit your actual environment.</li>
                <li>It isn&rsquo;t a substitute for understanding what a technique does before running it against production data or infrastructure.</li>
                <li>You&rsquo;re responsible for reviewing and testing anything generated before relying on it.</li>
              </ul>
              <p>
                {appName} provides this output &ldquo;as is&rdquo;, with no warranty that it&rsquo;s
                accurate, complete, or suitable for any particular purpose.
              </p>
            </section>

            <section>
              <h2 id="starter-kits">Starter kits</h2>
              <p>
                The scripts, notebooks, and templates in each starter kit are provided for use
                within your own organisation, included with an active Pro subscription. They are
                not licensed for resale or redistribution. Several kits explicitly call out where
                a Fabric API surface is still evolving or where a value needs your own input
                (marked <code>EDIT:</code>) — review and test each artifact against your own
                tenant before running it against production data.
              </p>
            </section>

            <section>
              <h2 id="acceptable-use">Acceptable use</h2>
              <p>You agree not to:</p>
              <ul>
                <li>
                  Circumvent the daily rate limits (e.g., automated scripting, rotating
                  identifiers, or other means of evading the limit rather than subscribing).
                </li>
                <li>Redistribute or resell the starter kits, or share Pro access with people outside your organisation.</li>
                <li>Attempt to disrupt, overload, or gain unauthorized access to the site or its underlying infrastructure.</li>
                <li>Use the service for any unlawful purpose.</li>
              </ul>
              <p>
                {appName} may suspend or terminate access, including a paid subscription without
                refund of the current period, for violating these terms.
              </p>
            </section>

            <section>
              <h2 id="content-and-intellectual-property">Content and intellectual property</h2>
              <p>
                No license has been set for the site&rsquo;s written content, so all rights are
                reserved by default. If you&rsquo;d like to reuse content from the site, open an
                issue on{' '}
                <a
                  href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-fd-primary hover:underline"
                >
                  GitHub
                </a>{' '}
                to ask. Code snippets shown in the free docs, and any code generated for you by
                Ask AI, are yours to use freely in your own work.
              </p>
            </section>

            <section>
              <h2 id="third-party-services">Third-party services</h2>
              <p>
                {appName} runs on Cloudflare (hosting and data storage), uses Stripe for billing,
                and uses Anthropic&rsquo;s API to generate Ask AI responses. Each of these
                providers processes the data necessary to perform its function (payment details
                with Stripe, your question with Anthropic) under its own terms and privacy
                practices. See{' '}
                <Link href="/privacy" className="text-fd-primary hover:underline">
                  Privacy Policy
                </Link>{' '}
                for what {appName} itself stores.
              </p>
            </section>

            <section>
              <h2 id="disclaimer-of-warranties">Disclaimer of warranties</h2>
              <p>
                The site and its tools are provided &ldquo;as is&rdquo; and &ldquo;as
                available&rdquo;, without warranties of any kind, express or implied. {appName}{' '}
                doesn&rsquo;t guarantee the service will be uninterrupted, error-free, or that its
                content is accurate or current at all times — Microsoft Fabric changes fast.
              </p>
            </section>

            <section>
              <h2 id="limitation-of-liability">Limitation of liability</h2>
              <p>
                To the fullest extent permitted by law, {appName} isn&rsquo;t liable for any
                indirect, incidental, or consequential damages arising from your use of the site
                or its tools — including damages resulting from relying on AI-generated content or
                a starter-kit artifact against production infrastructure without independently
                reviewing it.
              </p>
            </section>

            <section>
              <h2 id="changes-to-these-terms">Changes to these terms</h2>
              <p>
                These terms may be updated as the site changes. Meaningful changes will be
                reflected here, with the date at the top kept current. Continuing to use the site
                after a change means you accept the updated terms.
              </p>
            </section>

            <section>
              <h2 id="contact">Contact</h2>
              <p>
                Questions about these terms, billing, or anything else:{' '}
                <a href={`mailto:${contactEmail}`} className="text-fd-primary hover:underline">
                  {contactEmail}
                </a>
                . For a content error or bug, opening an issue on{' '}
                <a
                  href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-fd-primary hover:underline"
                >
                  GitHub
                </a>{' '}
                works too.
              </p>
            </section>
          </div>
        </article>

        <BlogTOC toc={toc} />
      </div>
    </main>
  );
}
