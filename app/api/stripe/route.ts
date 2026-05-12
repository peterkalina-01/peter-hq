import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
  }

  const stripe = new Stripe(key);

  try {
    const now = Math.floor(Date.now() / 1000);
    const startOf7d = now - 7 * 24 * 3600;
    const startOf30d = now - 30 * 24 * 3600;

    // Get all active subscriptions for MRR
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
    });

    // Calculate MRR
    let mrr = 0;
    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const price = item.price;
        const amount = (price.unit_amount || 0) / 100;
        if (price.recurring?.interval === 'month') {
          mrr += amount;
        } else if (price.recurring?.interval === 'year') {
          mrr += amount / 12;
        }
      }
    }

    // Get charges last 7 days
    const charges7d = await stripe.charges.list({
      created: { gte: startOf7d },
      limit: 100,
    });

    const revenue7d = charges7d.data
      .filter(c => c.status === 'succeeded')
      .reduce((sum, c) => sum + c.amount / 100, 0);

    // Get charges last 30 days
    const charges30d = await stripe.charges.list({
      created: { gte: startOf30d },
      limit: 100,
    });

    const revenue30d = charges30d.data
      .filter(c => c.status === 'succeeded')
      .reduce((sum, c) => sum + c.amount / 100, 0);

    // Get recent transactions (last 10)
    const recentCharges = await stripe.charges.list({ limit: 10 });
    const transactions = recentCharges.data
      .filter(c => c.status === 'succeeded')
      .map(c => ({
        id: c.id,
        amount: c.amount / 100,
        currency: c.currency.toUpperCase(),
        description: c.description || c.billing_details?.name || 'Payment',
        date: new Date(c.created * 1000).toLocaleDateString('sk-SK', {
          day: 'numeric', month: 'short',
        }),
        created: c.created,
      }));

    // Active customers count
    const customers = await stripe.customers.list({ limit: 100 });
    const activeCustomers = subscriptions.data
      .map(s => s.customer)
      .filter((v, i, a) => a.indexOf(v) === i).length;

    return NextResponse.json({
      mrr: Math.round(mrr * 100) / 100,
      revenue7d: Math.round(revenue7d * 100) / 100,
      revenue30d: Math.round(revenue30d * 100) / 100,
      activeCustomers,
      totalCustomers: customers.data.length,
      transactions,
      activeSubscriptions: subscriptions.data.length,
    });
  } catch (error) {
    console.error('Stripe API error:', error);
    return NextResponse.json({ error: 'Stripe error' }, { status: 500 });
  }
}
