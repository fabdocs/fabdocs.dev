'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Loader2, Lock } from 'lucide-react';

type State = 'idle' | 'loading' | 'locked' | 'error';

export function PackDownload({ slug, label = 'Download pack' }: { slug: string; label?: string }) {
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');

  async function download() {
    if (state === 'loading') return;
    setState('loading');
    setMessage('');
    try {
      const res = await fetch(`/api/packs/${slug}`);
      if (res.status === 403) {
        setState('locked');
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setState('error');
        setMessage(data.error ?? 'Download failed.');
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition') ?? '';
      const name = /filename="([^"]+)"/.exec(cd)?.[1] ?? `${slug}.zip`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setState('idle');
    } catch {
      setState('error');
      setMessage('Network error — try again.');
    }
  }

  if (state === 'locked') {
    return (
      <div className="rounded-lg border border-fd-primary/40 bg-fd-primary/5 p-4 text-sm">
        <p className="flex items-center gap-2 font-medium">
          <Lock className="size-4 text-fd-primary" />
          Included with Pro
        </p>
        <p className="mt-1 text-fd-muted-foreground">
          Pro ($5/mo) unlocks every pack plus 200 AI questions/day.
        </p>
        <Link
          href="/pricing"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-fd-primary px-4 py-2 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90"
        >
          See Pricing
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={download}
        disabled={state === 'loading'}
        className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {state === 'loading' ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        {label}
      </button>
      {state === 'error' && (
        <p className="mt-2 text-xs text-red-500 dark:text-red-400">{message}</p>
      )}
    </div>
  );
}
