'use client';

import { useId, useState } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Status = 'idle' | 'loading' | 'ok' | 'error';

export function NewsletterSignup({
  source,
  interest,
  variant = 'card',
  className,
}: {
  source: 'footer' | 'home' | 'packs' | 'docs' | 'blog';
  interest?: string;
  variant?: 'card' | 'inline';
  className?: string;
}) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, source, interest }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setStatus('ok');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error — try again.');
    }
  }

  const field = (
    <form onSubmit={submit} className="flex w-full max-w-md gap-2">
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <input
        id={id}
        type="email"
        required
        autoComplete="email"
        placeholder="you@company.com"
        value={email}
        disabled={status === 'loading' || status === 'ok'}
        onChange={(e) => setEmail(e.target.value)}
        className="min-w-0 flex-1 rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm text-fd-foreground outline-none transition-colors focus:border-fd-primary disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={status === 'loading' || status === 'ok'}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-fd-primary px-3.5 py-2 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === 'loading' ? (
          <Loader2 className="size-4 animate-spin" />
        ) : status === 'ok' ? (
          <Check className="size-4" />
        ) : (
          <ArrowRight className="size-4" />
        )}
        {status === 'ok' ? 'Subscribed' : 'Subscribe'}
      </button>
    </form>
  );

  const note =
    status === 'ok' ? (
      <p className="mt-2 text-xs text-fd-primary">
        You&rsquo;re on the list. Watch for the first briefing.
      </p>
    ) : status === 'error' ? (
      <p className="mt-2 text-xs text-red-500 dark:text-red-400">{message}</p>
    ) : (
      <p className="mt-2 text-xs text-fd-muted-foreground">
        Fabric runtime changes, API updates, and deprecations. No spam, unsubscribe anytime.
      </p>
    );

  if (variant === 'inline') {
    return (
      <div className={className}>
        {field}
        {note}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-fd-border bg-fd-card/60 p-6 sm:p-8',
        className,
      )}
    >
      <h2 className="text-lg font-semibold tracking-tight">
        The Fabric change briefing
      </h2>
      <p className="mb-4 mt-1.5 max-w-lg text-sm text-fd-muted-foreground">
        A tight technical digest of what changed in Microsoft Fabric — new
        runtimes, API updates, breaking changes — and what to do about it.
      </p>
      {field}
      {note}
    </div>
  );
}
