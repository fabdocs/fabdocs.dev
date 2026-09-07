'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export function PricingButtons({
  isSubscriber,
  billingEnabled,
}: {
  isSubscriber: boolean;
  billingEnabled: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function startCheckout() {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? 'Could not start checkout.');
        setLoading(false);
      }
    } catch {
      setError('Could not start checkout.');
      setLoading(false);
    }
  }

  async function openBillingPortal() {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? 'Could not open the billing portal.');
        setLoading(false);
      }
    } catch {
      setError('Could not open the billing portal.');
      setLoading(false);
    }
  }

  if (!billingEnabled) {
    return (
      <button
        disabled
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-fd-primary/40 px-5 py-2.5 text-sm font-medium text-fd-primary-foreground"
      >
        Pro coming soon
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={isSubscriber ? openBillingPortal : startCheckout}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
        {loading ? 'Loading…' : isSubscriber ? 'Manage subscription' : 'Upgrade — $5/mo'}
      </button>
      {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}
