import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const PLAN_PRICES = new Set([
  process.env.STRIPE_PRO_PRICE_ID!,
  process.env.STRIPE_AGENCY_PRICE_ID!,
])

const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRO_PRICE_ID!]: 'pro',
  [process.env.STRIPE_AGENCY_PRICE_ID!]: 'agency',
}

function resolveSubscription(subscription: Stripe.Subscription) {
  let plan = 'free'
  let whiteLabelEnabled = false

  for (const item of subscription.items.data) {
    const priceId = item.price.id
    if (PLAN_PRICES.has(priceId)) {
      plan = PRICE_TO_PLAN[priceId]
    }
    if (priceId === process.env.STRIPE_WHITE_LABEL_PRICE_ID!) {
      whiteLabelEnabled = true
    }
  }

  return { plan, whiteLabelEnabled }
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const customerId = session.customer as string

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    const { plan, whiteLabelEnabled } = resolveSubscription(subscription)

    await supabase.from('user_settings').upsert({
      user_id: userId,
      plan,
      white_label_enabled: whiteLabelEnabled,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      plan_expires_at: new Date((subscription as any).current_period_end * 1000).toISOString(),
    }, { onConflict: 'user_id' })
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const { plan, whiteLabelEnabled } = resolveSubscription(subscription)

    await supabase.from('user_settings')
      .update({
        plan,
        white_label_enabled: whiteLabelEnabled,
        plan_expires_at: new Date((subscription as any).current_period_end * 1000).toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    await supabase.from('user_settings')
      .update({
        plan: 'free',
        white_label_enabled: false,
        stripe_subscription_id: null,
        plan_expires_at: null,
      })
      .eq('stripe_subscription_id', subscription.id)
  }

  return NextResponse.json({ received: true })
}