import Link from 'next/link';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { BookOpen, LayoutGrid, Newspaper, Wrench } from 'lucide-react';
import { baseOptions } from '@/lib/layout.shared';
import { SiteFooter } from '@/components/site-footer';

const destinations = [
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'OneLake, Data Engineering, CI/CD & Git, Governance & Security.',
    href: '/docs',
  },
  {
    icon: Wrench,
    title: 'Tools',
    description: 'CU cost calculator, Spark pool sizer, capacity SKU reference.',
    href: '/docs/tools',
  },
  {
    icon: LayoutGrid,
    title: 'Starter kits',
    description: 'CI/CD, PySpark, governance, migration, and monitoring packs.',
    href: '/packs',
  },
  {
    icon: Newspaper,
    title: 'Blog',
    description: 'The Fabric change briefing and longer-form engineering writing.',
    href: '/blog',
  },
];

export default function NotFound() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 py-20 text-center md:py-28">
        <p className="text-sm font-semibold tracking-wide text-fd-primary">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-fd-foreground md:text-4xl">
          That page moved or never existed
        </h1>
        <p className="mt-4 max-w-md text-fd-muted-foreground">
          The link that brought you here is broken or out of date. Use search in
          the header, or jump straight to one of these:
        </p>

        <div className="mt-10 grid w-full gap-4 text-left sm:grid-cols-2">
          {destinations.map(({ icon: Icon, title, description, href }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-3 rounded-xl border border-fd-border bg-fd-card p-4 transition hover:border-fd-primary/40"
            >
              <Icon className="mt-0.5 size-5 shrink-0 text-fd-primary" aria-hidden />
              <div>
                <div className="font-semibold text-fd-foreground group-hover:text-fd-primary">
                  {title}
                </div>
                <p className="mt-1 text-sm text-fd-muted-foreground">{description}</p>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground shadow-lg shadow-fd-primary/25 transition-transform hover:-translate-y-0.5"
        >
          Back to homepage
        </Link>
      </main>
      <SiteFooter />
    </HomeLayout>
  );
}
