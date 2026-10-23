import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { siteUrl } from '@/lib/shared';
import { PACKS } from '@/generated/packs';

export async function POST(request: NextRequest) {
  const stripe = getStripe();

  // Origin header, not the hardcoded siteUrl — otherwise local/preview testing
  // redirects back to production after a real Stripe payment.
  const origin = request.headers.get('origin') ?? siteUrl;

  const body = await request
    .json()
    .catch(() => ({}) as { pack?: unknown }) as { pack?: unknown };
  const pack = typeof body.pack === 'string' ? body.pack : undefined;

  if (pack) {
    if (!PACKS[pack]) {
      return NextResponse.json({ error: 'Unknown pack.' }, { status: 400 });
    }
    const packPriceId = process.env.STRIPE_PACK_PRICE_ID;
    if (!stripe || !packPriceId) {
      return NextResponse.json({ error: 'Pack purchases are not available yet.' }, { status: 503 });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price: packPriceId, quantity: 1 }],
        customer_creation: 'always',
        metadata: { pack },
        success_url: `${origin}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/packs/${pack}?canceled=1`,
        allow_promotion_codes: true,
      });

      if (!session.url) {
        return NextResponse.json({ error: 'Could not start checkout.' }, { status: 502 });
      }
      return NextResponse.json({ url: session.url });
    } catch {
      return NextResponse.json({ error: 'Could not start checkout.' }, { status: 502 });
    }
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!stripe || !priceId) {
    return NextResponse.json({ error: 'Upgrades are not available yet.' }, { status: 503 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=1`,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Could not start checkout.' }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 502 });
  }
}
