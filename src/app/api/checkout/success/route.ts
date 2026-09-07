import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { signSubscriberCookie, buildSetCookie } from '@/lib/subscriber-cookie';
import { siteUrl } from '@/lib/shared';

// This route IS the Stripe Checkout success_url. Any failure here falls
// through to a plain redirect with no cookie set — never a 500 on a
// payment-success path; worst case the payer lands back at the free tier.
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');
  const stripe = getStripe();
  const secret = process.env.COOKIE_SIGNING_SECRET;

  // req.nextUrl reflects the server's own bind address on Cloudflare Workers,
  // not the incoming request — read the Host header directly so this
  // redirects back to wherever checkout was actually started from.
  const host = req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto') ?? req.nextUrl.protocol.replace(':', '');
  const origin = host ? `${protocol}://${host}` : siteUrl;

  const fallback = NextResponse.redirect(new URL('/pricing', origin));

  if (!sessionId || !stripe || !secret) return fallback;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id;

    if (session.status !== 'complete' || !customerId) return fallback;

    const res = NextResponse.redirect(new URL('/pricing?upgraded=1', origin));
    res.headers.append('Set-Cookie', buildSetCookie(await signSubscriberCookie(customerId, secret)));
    return res;
  } catch {
    return fallback;
  }
}
