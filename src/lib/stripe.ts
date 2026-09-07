import Stripe from 'stripe';

let cachedStripe: Stripe | null = null;

/**
 * Returns null (never throws) when Stripe isn't configured yet, so every
 * caller can degrade to "billing not available" instead of the whole site
 * breaking before a Stripe account exists.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;

  if (!cachedStripe) {
    // Cloudflare Workers has no Node `http` module — Stripe's SDK must be
    // told to use the Fetch API instead, per Stripe/Cloudflare's documented
    // Workers integration.
    cachedStripe = new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
  }
  return cachedStripe;
}
