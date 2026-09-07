'use client';

import { useMemo, useState } from 'react';

/**
 * CU Cost & Capacity Calculator.
 *
 * A transparent, editable estimate — NOT a billing tool. The model:
 *
 *   CU-seconds/day = effectiveVCores x activeSecondsPerDay x cuPerVCore x concurrency
 *   avgCUs         = CU-seconds/day / 86,400
 *   peakCUs        = effectiveVCores x cuPerVCore x concurrency
 *   min F SKU      = smallest F capacity whose CU count >= peakCUs
 *   est. $/month   = skuCUs x ratePerCUHour x 730
 *
 * Defaults follow published Fabric metering behavior (1 Spark vCore bills at
 * ~0.5 CU; F64 pay-as-you-go ≈ $11.52/hr => $0.18 per CU-hour). Tune freely.
 */

const F_SKUS = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024] as const;

type EngineKey = 'spark' | 'sql';

interface EngineState {
  vcores: number;
  cuPerVCore: number;
}

const number = (v: string, fallback: number) => {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

const fmt = (n: number, digits = 0) =>
  n.toLocaleString('en-US', { maximumFractionDigits: digits });

function minSku(peakCUs: number) {
  return F_SKUS.find((s) => s >= peakCUs) ?? null;
}

function Field({
  label,
  hint,
  value,
  onChange,
  step = 1,
  min = 0,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-fd-foreground">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(number(e.target.value, value))}
        className="rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 text-fd-foreground outline-none transition-colors focus:border-fd-primary"
      />
      {hint ? <span className="text-xs text-fd-muted-foreground">{hint}</span> : null}
    </label>
  );
}

function ResultCard({
  title,
  cuSecondsPerDay,
  avgCUs,
  peakCUs,
  monthlyCost,
  reservedCost,
  accent,
}: {
  title: string;
  cuSecondsPerDay: number;
  avgCUs: number;
  peakCUs: number;
  monthlyCost: number | null;
  reservedCost: number | null;
  accent: boolean;
}) {
  const sku = minSku(peakCUs);
  return (
    <div
      className={`flex flex-1 flex-col gap-3 rounded-xl border p-4 ${
        accent
          ? 'border-fd-primary/40 bg-fd-primary/5'
          : 'border-fd-border bg-fd-card'
      }`}
    >
      <div className="text-sm font-semibold text-fd-foreground">{title}</div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-fd-muted-foreground">CU-seconds / day</dt>
        <dd className="text-right font-mono">{fmt(cuSecondsPerDay)}</dd>
        <dt className="text-fd-muted-foreground">Average CUs</dt>
        <dd className="text-right font-mono">{fmt(avgCUs, 2)}</dd>
        <dt className="text-fd-muted-foreground">Peak CUs</dt>
        <dd className="text-right font-mono">{fmt(peakCUs, 1)}</dd>
        <dt className="text-fd-muted-foreground">Min capacity</dt>
        <dd className="text-right font-mono">{sku ? `F${sku}` : '> F1024'}</dd>
      </dl>
      <div className="mt-1 border-t border-fd-border pt-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-fd-muted-foreground">Pay-as-you-go / mo</span>
          <span className="font-mono text-base font-semibold text-fd-foreground">
            {monthlyCost == null ? '—' : `$${fmt(monthlyCost)}`}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-fd-muted-foreground">Reserved (~1yr) / mo</span>
          <span className="font-mono text-sm text-fd-muted-foreground">
            {reservedCost == null ? '—' : `$${fmt(reservedCost)}`}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CuCalculator() {
  const [activeMinutesPerDay, setActiveMinutesPerDay] = useState(120);
  const [concurrency, setConcurrency] = useState(1);
  const [ratePerCUHour, setRatePerCUHour] = useState(0.18);
  const [reservedDiscount, setReservedDiscount] = useState(41);

  const [engines, setEngines] = useState<Record<EngineKey, EngineState>>({
    spark: { vcores: 32, cuPerVCore: 0.5 },
    sql: { vcores: 16, cuPerVCore: 0.5 },
  });

  const setEngine = (key: EngineKey, patch: Partial<EngineState>) =>
    setEngines((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const results = useMemo(() => {
    const activeSeconds = activeMinutesPerDay * 60;
    const compute = (e: EngineState) => {
      const peakCUs = e.vcores * e.cuPerVCore * concurrency;
      const cuSecondsPerDay = peakCUs * activeSeconds;
      const avgCUs = cuSecondsPerDay / 86_400;
      const sku = minSku(peakCUs);
      const monthlyCost = sku == null ? null : sku * ratePerCUHour * 730;
      const reservedCost =
        monthlyCost == null ? null : monthlyCost * (1 - reservedDiscount / 100);
      return { peakCUs, cuSecondsPerDay, avgCUs, monthlyCost, reservedCost };
    };
    return {
      spark: compute(engines.spark),
      sql: compute(engines.sql),
    };
  }, [activeMinutesPerDay, concurrency, ratePerCUHour, reservedDiscount, engines]);

  const delta =
    results.spark.monthlyCost != null && results.sql.monthlyCost != null
      ? results.spark.monthlyCost - results.sql.monthlyCost
      : null;

  return (
    <div className="not-prose my-6 rounded-2xl border border-fd-border bg-fd-card/50 p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field
          label="Active compute / day (min)"
          hint="Total wall-clock time the engine is actually running jobs"
          value={activeMinutesPerDay}
          step={15}
          onChange={setActiveMinutesPerDay}
        />
        <Field
          label="Concurrency"
          hint="Parallel jobs / query streams at peak"
          value={concurrency}
          step={1}
          min={1}
          onChange={setConcurrency}
        />
        <Field
          label="Rate ($ / CU-hour)"
          hint="F64 PAYG ≈ $11.52/hr ÷ 64 = $0.18"
          value={ratePerCUHour}
          step={0.01}
          onChange={setRatePerCUHour}
        />
        <Field
          label="Reserved discount (%)"
          hint="1-year reservation vs pay-as-you-go"
          value={reservedDiscount}
          step={1}
          onChange={setReservedDiscount}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-xl border border-fd-border p-4">
          <div className="text-sm font-semibold">Spark job</div>
          <Field
            label="Total vCores (nodes × node size)"
            hint="e.g. 4 medium nodes × 8 vCores = 32"
            value={engines.spark.vcores}
            step={4}
            onChange={(v) => setEngine('spark', { vcores: v })}
          />
          <Field
            label="CU per vCore"
            hint="Fabric bills a Spark vCore at ~0.5 CU"
            value={engines.spark.cuPerVCore}
            step={0.05}
            onChange={(v) => setEngine('spark', { cuPerVCore: v })}
          />
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-fd-border p-4">
          <div className="text-sm font-semibold">SQL warehouse</div>
          <Field
            label="Effective vCores at peak"
            hint="Warehouse burst allocation while queries run"
            value={engines.sql.vcores}
            step={2}
            onChange={(v) => setEngine('sql', { vcores: v })}
          />
          <Field
            label="CU per vCore"
            hint="Adjust for your observed warehouse metering"
            value={engines.sql.cuPerVCore}
            step={0.05}
            onChange={(v) => setEngine('sql', { cuPerVCore: v })}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <ResultCard
          title="Spark job"
          accent={delta != null && delta < 0}
          {...results.spark}
        />
        <ResultCard
          title="SQL warehouse"
          accent={delta != null && delta > 0}
          {...results.sql}
        />
      </div>

      {delta != null ? (
        <p className="mt-4 text-sm text-fd-muted-foreground">
          At these settings, the{' '}
          <strong className="text-fd-foreground">
            {delta < 0 ? 'Spark job' : 'SQL warehouse'}
          </strong>{' '}
          is cheaper by{' '}
          <strong className="text-fd-foreground">
            ${fmt(Math.abs(delta))}/month
          </strong>{' '}
          on pay-as-you-go. Cross-check against the Capacity Metrics app before
          committing to a SKU.
        </p>
      ) : null}
    </div>
  );
}
