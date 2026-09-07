'use client';

import { useMemo, useState } from 'react';

/**
 * Spark pool sizing estimator — a transparent heuristic, NOT a guarantee.
 *
 * cores  = dataMB / (throughputPerCore x targetSeconds)
 * nodes  = max(3, ceil(cores / nodeVCores))
 * memOK  = nodes x nodeMemGB x 0.6 >= dataGB x shuffleFactor
 * CU/run = nodes x nodeVCores x 0.5 x targetSeconds     (0.5 CU per Spark vCore)
 *
 * Effective per-core throughput (MB/s) by workload — deliberately conservative,
 * accounting for read + decode + transform, not raw scan speed.
 */
const WORKLOADS = {
  'scan / filter / aggregate': { mbPerCore: 45, shuffleFactor: 0.3 },
  'joins / heavy shuffle': { mbPerCore: 22, shuffleFactor: 1.5 },
  'ML training / UDF-heavy': { mbPerCore: 9, shuffleFactor: 2.0 },
} as const;

const NODES = {
  Small: { vcores: 4, memGB: 32 },
  Medium: { vcores: 8, memGB: 64 },
  Large: { vcores: 16, memGB: 128 },
  XLarge: { vcores: 32, memGB: 256 },
} as const;

type WorkloadKey = keyof typeof WORKLOADS;
type NodeKey = keyof typeof NODES;

const num = (v: string, fallback: number) => {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};
const fmt = (n: number, d = 0) =>
  n.toLocaleString('en-US', { maximumFractionDigits: d });

function Field({
  label,
  hint,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-fd-foreground">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step={step}
        value={value}
        onChange={(e) => onChange(num(e.target.value, value))}
        className="rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 text-fd-foreground outline-none transition-colors focus:border-fd-primary"
      />
      {hint ? <span className="text-xs text-fd-muted-foreground">{hint}</span> : null}
    </label>
  );
}

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-fd-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-lg border border-fd-border bg-fd-background px-3 py-1.5 text-fd-foreground outline-none transition-colors focus:border-fd-primary"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PoolSizer() {
  const [dataGB, setDataGB] = useState(200);
  const [targetMinutes, setTargetMinutes] = useState(30);
  const [workload, setWorkload] = useState<WorkloadKey>('joins / heavy shuffle');
  const [nodeSize, setNodeSize] = useState<NodeKey>('Medium');
  const [ratePerCUHour, setRatePerCUHour] = useState(0.18);

  const r = useMemo(() => {
    const { mbPerCore, shuffleFactor } = WORKLOADS[workload];
    const node = NODES[nodeSize];
    const targetSeconds = targetMinutes * 60;
    const dataMB = dataGB * 1024;

    const coresNeeded = dataMB / (mbPerCore * targetSeconds);
    const nodes = Math.max(3, Math.ceil(coresNeeded / node.vcores));
    const totalVCores = nodes * node.vcores;
    const totalMemGB = nodes * node.memGB;

    const usableMemGB = totalMemGB * 0.6;
    const shuffleNeedGB = dataGB * shuffleFactor;
    const memOK = usableMemGB >= shuffleNeedGB;

    const partitions = Math.ceil(dataMB / 128); // 128 MB target
    const cuSeconds = totalVCores * 0.5 * targetSeconds;
    const costPerRun = (cuSeconds / 3600) * ratePerCUHour;

    return {
      nodes,
      node,
      totalVCores,
      totalMemGB,
      partitions,
      memOK,
      shuffleNeedGB,
      usableMemGB,
      cuSeconds,
      costPerRun,
      suggestBigger: !memOK,
    };
  }, [dataGB, targetMinutes, workload, nodeSize, ratePerCUHour]);

  return (
    <div className="not-prose my-6 rounded-2xl border border-fd-border bg-fd-card/50 p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field
          label="Input data per run (GB)"
          hint="Uncompressed logical size Spark will read"
          value={dataGB}
          step={10}
          onChange={setDataGB}
        />
        <Field
          label="Target run time (min)"
          hint="How long the job may take end to end"
          value={targetMinutes}
          step={5}
          onChange={setTargetMinutes}
        />
        <Choice
          label="Workload shape"
          value={workload}
          options={Object.keys(WORKLOADS) as WorkloadKey[]}
          onChange={setWorkload}
        />
        <Choice
          label="Node size"
          value={nodeSize}
          options={Object.keys(NODES) as NodeKey[]}
          onChange={setNodeSize}
        />
        <Field
          label="Rate ($ / CU-hour)"
          hint="F64 PAYG ≈ $0.18"
          value={ratePerCUHour}
          step={0.01}
          onChange={setRatePerCUHour}
        />
      </div>

      <div className="mt-6 rounded-xl border border-fd-primary/30 bg-fd-primary/5 p-4">
        <div className="text-sm font-semibold text-fd-foreground">Suggested pool</div>
        <p className="mt-1 font-mono text-lg text-fd-foreground">
          {r.nodes} × {nodeSize}{' '}
          <span className="text-fd-muted-foreground">
            ({r.node.vcores} vCore / {r.node.memGB} GB each)
          </span>
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-fd-muted-foreground">Total vCores</dt>
            <dd className="font-mono">{fmt(r.totalVCores)}</dd>
          </div>
          <div>
            <dt className="text-fd-muted-foreground">Total memory</dt>
            <dd className="font-mono">{fmt(r.totalMemGB)} GB</dd>
          </div>
          <div>
            <dt className="text-fd-muted-foreground">~ Shuffle partitions</dt>
            <dd className="font-mono">{fmt(r.partitions)}</dd>
          </div>
          <div>
            <dt className="text-fd-muted-foreground">CU-seconds / run</dt>
            <dd className="font-mono">{fmt(r.cuSeconds)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-fd-muted-foreground">
          Est. <strong className="text-fd-foreground">${fmt(r.costPerRun, 2)}</strong> per run
          at the rate above.
        </p>
      </div>

      <div
        className={`mt-4 rounded-lg border p-3 text-sm ${
          r.memOK
            ? 'border-emerald-500/30 bg-emerald-500/5 text-fd-muted-foreground'
            : 'border-amber-500/40 bg-amber-500/10 text-fd-foreground'
        }`}
      >
        {r.memOK ? (
          <>
            Memory headroom looks OK: ~{fmt(r.usableMemGB)} GB usable vs ~
            {fmt(r.shuffleNeedGB)} GB estimated shuffle/cache need.
          </>
        ) : (
          <>
            <strong>Memory-tight.</strong> Estimated shuffle/cache need ~
            {fmt(r.shuffleNeedGB)} GB exceeds ~{fmt(r.usableMemGB)} GB usable. Use a
            bigger node size, add nodes, split the job, or lean on disk spill
            (slower). Shuffle-heavy jobs are the usual cause.
          </>
        )}
      </div>

      <p className="mt-4 text-xs text-fd-muted-foreground">
        Heuristic estimate for planning. Real throughput depends on file layout,
        skew, the Native Execution Engine, broadcast joins, and your actual
        transforms. Benchmark one real run and adjust.
      </p>
    </div>
  );
}
