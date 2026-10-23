import type { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { checkSubscriber } from './subscription';
import { PACK_OWNER_COOKIE, verifyPackOwnerCookie } from './pack-cookie';

export interface PackAccessCheck {
  allowed: boolean;
  setCookieHeader?: string;
}

// A pack is unlocked by either an active Pro subscription (checkSubscriber)
// or a one-time purchase of that specific pack (packowner:<cid>:<slug> in KV).
export async function checkPackAccess(req: NextRequest, slug: string): Promise<PackAccessCheck> {
  const subscriber = await checkSubscriber(req);
  if (subscriber.isSubscriber) {
    return { allowed: true, setCookieHeader: subscriber.setCookieHeader };
  }

  const secret = process.env.COOKIE_SIGNING_SECRET;
  const raw = req.cookies.get(PACK_OWNER_COOKIE)?.value;
  if (!secret || !raw) return { allowed: false, setCookieHeader: subscriber.setCookieHeader };

  const payload = await verifyPackOwnerCookie(raw, secret);
  if (!payload) return { allowed: false, setCookieHeader: subscriber.setCookieHeader };

  try {
    const { env } = await getCloudflareContext({ async: true });
    const owned = await env.KV.get(`packowner:${payload.cid}:${slug}`);
    return { allowed: Boolean(owned), setCookieHeader: subscriber.setCookieHeader };
  } catch {
    // KV outage — fail open. Unlike the subscriber cookie, this one is only
    // ever issued after a completed one-time purchase and never needs
    // revalidating against a status that can later change, so a valid
    // signature alone is enough evidence to not lock out a paying customer.
    return { allowed: true, setCookieHeader: subscriber.setCookieHeader };
  }
}
