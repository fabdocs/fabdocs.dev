import Link from 'next/link';
import { GLOSSARY_TERMS } from '@/lib/glossary';

const NAMES = GLOSSARY_TERMS.map((t) => t.term.toUpperCase());

function TickerGroup({ hideOnReducedMotion }: { hideOnReducedMotion?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center gap-8 pr-8 ${hideOnReducedMotion ? 'motion-reduce:hidden' : ''}`}
    >
      {NAMES.map((name, i) => (
        <span key={i} className="flex items-center gap-8">
          <span className="whitespace-nowrap text-sm font-medium tracking-wide text-fd-muted-foreground">
            {name}
          </span>
          <span aria-hidden className="size-1 rounded-full bg-fd-border" />
        </span>
      ))}
    </div>
  );
}

/** Reuses the glossary term list — see src/lib/glossary.ts. */
export function TopicsTicker() {
  return (
    <div className="border-b border-fd-border bg-fd-card/40 py-5">
      <Link
        href="/glossary"
        className="mb-3 block text-center text-xs font-semibold uppercase tracking-widest text-fd-muted-foreground transition-colors hover:text-fd-primary"
      >
        Topics covered in the docs
      </Link>
      <div className="overflow-hidden motion-reduce:overflow-visible">
        <div
          aria-hidden
          className="ticker-track flex w-max motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-x-8 motion-reduce:gap-y-2"
        >
          <TickerGroup />
          <TickerGroup hideOnReducedMotion />
        </div>
        <span className="sr-only">{NAMES.join(', ')}</span>
      </div>
    </div>
  );
}
