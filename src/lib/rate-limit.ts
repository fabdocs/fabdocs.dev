import { getCloudflareContext } from '@opennextjs/cloudflare';

const DEFAULT_WINDOW_SECONDS = 60 * 60;

/**
 * Per-identifier counter in the KV namespace, key-prefixed by route so
 * different endpoints don't share a budget. Non-atomic read-then-write — a
 * race can let a couple of extra requests through under heavy concurrency
 * from the same identifier, which is fine for "bound worst-case cost", not
 * meant to be an exact quota.
 *
 * `identifier` defaults to the caller's IP; pass a Stripe customer id for
 * the subscriber pool so it's per-account, not per-IP.
 */
export async function checkRateLimit(
  request: Request,
  routeKey: string,
  limit: number,
  identifier?: string,
  windowSeconds: number = DEFAULT_WINDOW_SECONDS,
): Promise<{ allowed: boolean; remaining: number }> {
  const id = identifier ?? request.headers.get('cf-connecting-ip') ?? 'unknown';
  const key = `ratelimit:${routeKey}:${id}`;

  const { env } = await getCloudflareContext({ async: true });
  const current = Number((await env.KV.get(key)) ?? '0');

  if (current >= limit) {
    return { allowed: false, remaining: 0 };
  }

  await env.KV.put(key, String(current + 1), { expirationTtl: windowSeconds });
  return { allowed: true, remaining: limit - current - 1 };
}
