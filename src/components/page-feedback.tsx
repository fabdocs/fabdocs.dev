'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

type State = 'idle' | 'submitting' | 'done' | 'error';

export function PageFeedback({ page }: { page: string }) {
  const [state, setState] = useState<State>('idle');

  const vote = async (value: 'yes' | 'no') => {
    if (state === 'submitting' || state === 'done') return;
    setState('submitting');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, vote: value }),
      });
      if (!res.ok) throw new Error('request failed');
      setState('done');
    } catch {
      setState('error');
    }
  };

  return (
    <div className="not-prose flex flex-wrap items-center justify-between gap-3 rounded-xl border border-fd-border bg-fd-card px-4 py-3">
      {state === 'done' ? (
        <p className="text-sm text-fd-muted-foreground">Thanks for the feedback.</p>
      ) : (
        <>
          <span className="text-sm font-medium text-fd-foreground">Was this page helpful?</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => vote('yes')}
              disabled={state === 'submitting'}
              className="inline-flex items-center gap-1.5 rounded-md border border-fd-border px-3 py-1.5 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent disabled:opacity-60"
            >
              <ThumbsUp className="size-3.5" />
              Yes
            </button>
            <button
              type="button"
              onClick={() => vote('no')}
              disabled={state === 'submitting'}
              className="inline-flex items-center gap-1.5 rounded-md border border-fd-border px-3 py-1.5 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent disabled:opacity-60"
            >
              <ThumbsDown className="size-3.5" />
              No
            </button>
            {state === 'error' && (
              <span className="text-xs text-fd-muted-foreground">Couldn&rsquo;t save — try again.</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
