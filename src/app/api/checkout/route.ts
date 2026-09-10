import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { siteUrl } from '@/lib/shared';

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!stripe || !priceId) {
    // TEMPORARY diagnostic — booleans only, never the secret values. Remove
    // once Stripe env vars are confirmed reaching the Worker.
    return NextResponse.json(
      {
        error: 'Upgrades are not available yet.',
        debug: {
          hasSecretKey: Boolean(process.env.STRIPE_SECRET_KEY),
          secretKeyLen: (process.env.STRIPE_SECRET_KEY ?? '').length,
          hasPriceId: Boolean(process.env.STRIPE_PRICE_ID),
          priceIdLen: (process.env.STRIPE_PRICE_ID ?? '').length,
        },
      },
      { status: 503 },
    );
  }

  // Origin header, not the hardcoded siteUrl — otherwise local/preview testing
  // redirects back to production after a real Stripe payment.
  const origin = request.headers.get('origin') ?? siteUrl;

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
