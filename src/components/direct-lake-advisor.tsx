'use client';

import { useMemo, useState } from 'react';

/**
 * Direct Lake vs Import mode — a rule-based decision helper, not a
 * calculator. There's no published formula for "which is cheaper"; the
 * decision genuinely depends on table maintenance, transform needs, and
 * traffic. Rules mirror /blog/direct-lake-vs-import.
 */
type TableHealth = 'tuned' | 'untuned';
type Transforms = 'none' | 'needed';
type Traffic = 'high' | 'low';

type Recommendation = 'direct-lake' | 'import' | 'import-until-tuned';

function recommend(tableHealth: TableHealth, transforms: Transforms, traffic: Traffic): Recommendation {
  if (transforms === 'needed') return 'import';
  if (tableHealth === 'untuned' && traffic === 'high') return 'import-until-tuned';
  return 'direct-lake';
}

const COPY: Record<
  Recommendation,
  { label: string; body: string; tone: 'primary' | 'amber' }
> = {
  'direct-lake': {
    label: 'Direct Lake',
    body:
      "The table can serve this report directly — no refresh to schedule, and it stays current automatically. If the table isn't tuned yet, fix it soon; the benefit compounds as traffic grows.",
    tone: 'primary',
  },
  import: {
    label: 'Import mode',
    body:
      "Direct Lake can't push down model-side transforms or calculated columns — that work has to happen before the model, in Import or a dataflow.",
    tone: 'amber',
  },
  'import-until-tuned': {
    label: 'Import — for now',
    body:
      'High traffic against an un-tuned table means expensive transcoding on every reframe, which can cost more than a scheduled refresh. Fix V-Order and compaction first, then revisit Direct Lake.',
    tone: 'amber',
  },
};

function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-fd-foreground">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition ${
              value === o.value
                ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground'
                : 'border-fd-border bg-fd-background text-fd-foreground hover:border-fd-primary/40'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DirectLakeAdvisor() {
  const [tableHealth, setTableHealth] = useState<TableHealth>('tuned');
  const [transforms, setTransforms] = useState<Transforms>('none');
  const [traffic, setTraffic] = useState<Traffic>('high');

  const result = useMemo(
    () => recommend(tableHealth, transforms, traffic),
    [tableHealth, transforms, traffic],
  );
  const copy = COPY[result];

  return (
    <div className="not-prose my-6 rounded-2xl border border-fd-border bg-fd-card/50 p-4 sm:p-6">
      <div className="flex flex-col gap-5">
        <OptionGroup
          label="Is the source Delta table V-Order-tuned and regularly compacted?"
          value={tableHealth}
          onChange={setTableHealth}
          options={[
            { value: 'tuned', label: 'Yes, maintained' },
            { value: 'untuned', label: 'No / not sure' },
          ]}
        />
        <OptionGroup
          label="Does the report need calculated columns or transforms Direct Lake can't push down?"
          value={transforms}
          onChange={setTransforms}
          options={[
            { value: 'none', label: 'No, straight from the table' },
            { value: 'needed', label: 'Yes, model-side transforms' },
          ]}
        />
        <OptionGroup
          label="How is the report queried?"
          value={traffic}
          onChange={setTraffic}
          options={[
            { value: 'high', label: 'High traffic / always open' },
            { value: 'low', label: 'Rarely opened' },
          ]}
        />
      </div>

      <div
        className={`mt-6 rounded-xl border p-4 ${
          copy.tone === 'primary'
            ? 'border-fd-primary/30 bg-fd-primary/5'
            : 'border-amber-500/40 bg-amber-500/10'
        }`}
      >
        <div className="text-sm font-semibold text-fd-foreground">Recommendation</div>
        <p className="mt-1 font-mono text-lg text-fd-foreground">{copy.label}</p>
        <p className="mt-2 text-sm text-fd-muted-foreground">{copy.body}</p>
      </div>

      <p className="mt-4 text-xs text-fd-muted-foreground">
        A decision guide based on the tradeoffs in{' '}
        <a href="/blog/direct-lake-vs-import" className="text-fd-primary hover:underline">
          Direct Lake vs Import mode
        </a>
        , not a benchmark. Every report has edge cases the three questions above
        don't capture — treat this as a starting point.
      </p>
    </div>
  );
}
