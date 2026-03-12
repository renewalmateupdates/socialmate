import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const STRIPE_PRO_PRICE_ID           = 'price_1T9pay7OMwDowUuU7S3G3lNX'
const STRIPE_AGENCY_PRICE_ID        = 'price_1T9qAd7OMwDowUuUpzjxLlG2'
const STRIPE_WHITE_LABEL_PRICE_ID   = 'price_1T9qAu7OMwDowUuUsqM2jwoC'
const STRIPE_PRO_ANNUAL_PRICE_ID    = 'price_1TA0Iv7OMwDowUuUaAA77Ye1'
const STRIPE_AGENCY_ANNUAL_PRICE_ID = 'price_1TA0JQ7OMwDowUuUp4NnHEfO'

const CREDIT_PACK_PRICES: Record<string, number> = {
  'price_1TA0jd7OMwDowUuULUw5W7EQ': 100,
  'price_1TA0l37OMwDowUuUU5JpIcDK': 300,
  'price_1TA0nA7OMwDowUuU5wHTbucn': 750,
  'price_1TA0nS7OMwDowUuUKURJ7ZM4': 2000,
}

const PLAN_PRICES = new Set([
  STRIPE_PRO_PRICE_ID,
  STRIPE_AGENCY_PRICE_ID,
  STRIPE_PRO_ANNUAL_PRICE_ID,
  STRIPE_AGENCY_ANNUAL_PRICE_ID,
])

const PRICE_TO_PLAN: Record<string, string> = {
  [STRIPE_PRO_PRICE_ID]:           'pro',
  [STRIPE_AGENCY_PRICE_ID]:        'agency',
  [STRIPE_PRO_ANNUAL_PRICE_ID]:    'pro',
  [STRIPE_AGENCY_ANNUAL_PRICE_ID]: 'agency',
}

const PLAN_CREDITS: Record<string, number> = {
  free:   100,
  pro:    500,
  agency: 2000,
}

function resolveSubscription(subscription: Stripe.Subscription) {
  let plan = 'free'
  let whiteLabelEnabled = false
  for (const item of subscription.items.data) {
    const priceId = item.price.id
    if (PLAN_PRICES.has(priceId)) plan = PRICE_TO_PLAN[priceId]
    if (priceId === STRIPE_WHITE_LABEL_PRICE_ID) whiteLabelEnabled = true
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
    const type = session.metadata?.type
    const priceId = session.metadata?.price_id

    // CREDIT PACK — no bank cap, paid credits are uncapped
    if (type === 'credit_pack' && priceId && userId) {
      const creditsToAdd = CREDIT_PACK_PRICES[priceId]
      if (creditsToAdd) {
        const { data: settings } = await supabase
          .from('user_settings')
          .select('ai_credits_remaining')
          .eq('user_id', userId)
          .single()

        const currentCredits = settings?.ai_credits_remaining ?? 0
        await supabase.from('user_settings')
          .update({ ai_credits_remaining: currentCredits + creditsToAdd })
          .eq('user_id', userId)
      }
      return NextResponse.json({ received: true })
    }

    // SUBSCRIPTION
    const customerId = session.customer as string
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    const { plan, whiteLabelEnabled } = resolveSubscription(subscription)
    const credits = PLAN_CREDITS[plan] ?? 100

    await supabase.from('user_settings').upsert({
      user_id: userId,
      plan,
      white_label_enabled: whiteLabelEnabled,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      plan_expires_at: new Date((subscription as any).current_period_end * 1000).toISOString(),
      ai_credits_remaining: credits,
      ai_credits_total: credits,
      ai_credits_reset_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const { plan, whiteLabelEnabled } = resolveSubscription(subscription)
    const credits = PLAN_CREDITS[plan] ?? 100
    await supabase.from('user_settings')
      .update({
        plan,
        white_label_enabled: whiteLabelEnabled,
        plan_expires_at: new Date((subscription as any).current_period_end * 1000).toISOString(),
        ai_credits_remaining: credits,
        ai_credits_total: credits,
        ai_credits_reset_at: new Date().toISOString(),
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
        ai_credits_remaining: 100,
        ai_credits_total: 100,
        ai_credits_reset_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)
  }

  return NextResponse.json({ received: true })
}