import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getStripe } from '@/lib/stripe';

// Only the subscription lifecycle events — Stripe folds payment
// failures/retries into the subscription's own `status` field.
const HANDLED_PREFIX = 'customer.subscription.';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });
  }

  // Signature verification needs the raw, untouched body — must not call
  // req.json() first.
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  if (event.type.startsWith(HANDLED_PREFIX)) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    try {
      const { env } = await getCloudflareContext({ async: true });
      await env.KV.put(
        `sub:${customerId}`,
        JSON.stringify({
          customerId,
          subscriptionId: subscription.id,
          status: subscription.status,
          currentPeriodEnd: subscription.items.data[0]?.current_period_end ?? null,
          updatedAt: Math.floor(Date.now() / 1000),
        }),
      );
    } catch {
      // Non-2xx tells Stripe to retry with backoff — covers a transient KV
      // error without us building retry logic.
      return NextResponse.json({ error: 'Failed to record subscription state.' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
