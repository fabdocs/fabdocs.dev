import type { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import {
  SUBSCRIBER_COOKIE,
  signSubscriberCookie,
  verifySubscriberCookie,
  buildSetCookie,
  buildClearCookie,
} from './subscriber-cookie';

// 6h — bounds how long a cancelled subscriber can keep access via a
// stale-but-signature-valid cookie before it's re-checked against KV.
const REVALIDATE_AFTER_SECONDS = 60 * 60 * 6;

const ENTITLED_STATUSES = new Set(['active', 'trialing', 'past_due']);

interface SubscriptionRecord {
  status: string;
}

export interface SubscriberCheck {
  isSubscriber: boolean;
  customerId?: string;
  setCookieHeader?: string;
}

export async function checkSubscriber(request: NextRequest): Promise<SubscriberCheck> {
  const secret = process.env.COOKIE_SIGNING_SECRET;
  const raw = request.cookies.get(SUBSCRIBER_COOKIE)?.value;
  if (!secret || !raw) return { isSubscriber: false };

  const payload = await verifySubscriberCookie(raw, secret);
  if (!payload) return { isSubscriber: false };

  const age = Math.floor(Date.now() / 1000) - payload.iat;
  if (age < REVALIDATE_AFTER_SECONDS) {
    return { isSubscriber: true, customerId: payload.cid };
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const kvValue = await env.KV.get(`sub:${payload.cid}`);
    const record = kvValue ? (JSON.parse(kvValue) as SubscriptionRecord) : null;

    if (record && ENTITLED_STATUSES.has(record.status)) {
      return {
        isSubscriber: true,
        customerId: payload.cid,
        setCookieHeader: buildSetCookie(await signSubscriberCookie(payload.cid, secret)),
      };
    }

    return { isSubscriber: false, setCookieHeader: buildClearCookie() };
  } catch {
    // KV outage — fail open for this one request rather than locking out a
    // real subscriber, but don't refresh the cookie, so the next request
    // retries the re-validation instead of extending trust on a guess.
    return { isSubscriber: true, customerId: payload.cid };
  }
}
