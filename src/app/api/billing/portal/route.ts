import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { checkSubscriber } from '@/lib/subscription';
import { siteUrl } from '@/lib/shared';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const subscriber = await checkSubscriber(req);

  if (!stripe || !subscriber.isSubscriber || !subscriber.customerId) {
    return NextResponse.json({ error: 'No active subscription found.' }, { status: 401 });
  }

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: subscriber.customerId,
      return_url: `${siteUrl}/pricing`,
    });
    return NextResponse.json({ url: portal.url });
  } catch {
    return NextResponse.json({ error: 'Could not open the billing portal.' }, { status: 502 });
  }
}
