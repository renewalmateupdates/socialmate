export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const STRIPE_PRO_PRICE_ID               = 'price_1T9pay7OMwDowUuU7S3G3lNX'
const STRIPE_AGENCY_PRICE_ID            = 'price_1T9qAd7OMwDowUuUpzjxLlG2'
const STRIPE_PRO_ANNUAL_PRICE_ID        = 'price_1TA0Iv7OMwDowUuUaAA77Ye1'
const STRIPE_AGENCY_ANNUAL_PRICE_ID     = 'price_1TA0JQ7OMwDowUuUp4NnHEfO'
const STRIPE_WHITE_LABEL_BASIC_PRICE_ID = 'price_1T9qAu7OMwDowUuUsqM2jwoC'
const STRIPE_WHITE_LABEL_PRO_PRICE_ID   = 'price_1TBnnS7OMwDowUuUsr09eHVg'

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

const PLAN_MONTHLY_VALUE: Record<string, number> = {
  pro:    5.00,
  agency: 20.00,
}

const REFERRAL_UPGRADE_CREDITS: Record<string, number> = {
  pro:    50,
  agency: 100,
}

function safeDate(ts: number | null | undefined): string | null {
  if (!ts) return null
  try { return new Date(ts * 1000).toISOString() } catch { return null }
}

function resolveSubscription(subscription: Stripe.Subscription): {
  plan: string | null
  whiteLabelActive: boolean
  whiteLabelTier: string | null
  isWhiteLabelOnly: boolean
} {
  let plan: string | null = null
  let whiteLabelActive = false
  let whiteLabelTier: string | null = null

  for (const item of subscription.items.data) {
    const priceId = item.price.id
    if (PLAN_PRICES.has(priceId)) plan = PRICE_TO_PLAN[priceId]
    if (priceId === STRIPE_WHITE_LABEL_BASIC_PRICE_ID) { whiteLabelActive = true; whiteLabelTier = 'basic' }
    if (priceId === STRIPE_WHITE_LABEL_PRO_PRICE_ID)   { whiteLabelActive = true; whiteLabelTier = 'pro'   }
  }

  return { plan, whiteLabelActive, whiteLabelTier, isWhiteLabelOnly: plan === null && whiteLabelActive }
}

function getSupabase() {
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Compute credits to set when plan changes — preserve purchased/banked credits on upgrade
function resolveCreditsOnPlanChange(
  currentPlan: string | null,
  newPlan: string,
  currentCredits: number
): number {
  const newPlanCredits = PLAN_CREDITS[newPlan] ?? 100
  const isUpgrade = (
    (currentPlan === 'free'  && (newPlan === 'pro' || newPlan === 'agency')) ||
    (currentPlan === 'pro'   && newPlan === 'agency')
  )
  // On upgrade: keep whatever is higher (banked credits vs new plan amount)
  // On downgrade/same: use new plan amount (can't keep agency credits on free)
  return isUpgrade ? Math.max(currentCredits, newPlanCredits) : newPlanCredits
}

async function processReferralCredits(
  supabase: ReturnType<typeof getSupabase>,
  referredUserId: string,
  plan: string,
  isNewSubscription: boolean
) {
  if (!isNewSubscription) return
  const creditsToAward = REFERRAL_UPGRADE_CREDITS[plan]
  if (!creditsToAward) return
  try {
    const { data: conversion } = await supabase
      .from('referral_conversions')
      .select('affiliate_user_id')
      .eq('referred_user_id', referredUserId)
      .single()
    if (!conversion) return

    const { data: referrerSettings } = await supabase
      .from('user_settings')
      .select('ai_credits_remaining')
      .eq('user_id', conversion.affiliate_user_id)
      .single()
    if (!referrerSettings) return

    await supabase
      .from('user_settings')
      .update({ ai_credits_remaining: (referrerSettings.ai_credits_remaining ?? 0) + creditsToAward })
      .eq('user_id', conversion.affiliate_user_id)

    const { data: allConversions } = await supabase
      .from('referral_conversions')
      .select('status')
      .eq('affiliate_user_id', conversion.affiliate_user_id)

    const payingCount = (allConversions || []).filter(
      (r: any) => r.status === 'eligible' || r.status === 'paid'
    ).length

    if (payingCount >= 3) {
      await supabase
        .from('user_settings')
        .update({ custom_domain_unlocked: true })
        .eq('user_id', conversion.affiliate_user_id)
    }
  } catch (err) {
    console.error('Referral credit award error:', err)
  }
}

async function processAffiliateCommission(
  supabase: ReturnType<typeof getSupabase>,
  referredUserId: string,
  plan: string,
  isNewSubscription: boolean
) {
  try {
    const { data: conversion } = await supabase
      .from('referral_conversions')
      .select('*')
      .eq('referred_user_id', referredUserId)
      .single()
    if (!conversion) return

    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', conversion.affiliate_user_id)
      .single()
    if (!affiliate || affiliate.status !== 'active') return

    const activeCount  = affiliate.active_referral_count ?? 0
    const rate         = activeCount >= 100 ? 0.40 : 0.30
    const monthlyValue = PLAN_MONTHLY_VALUE[plan] ?? 0
    const commission   = parseFloat((monthlyValue * rate).toFixed(2))
    if (commission <= 0) return

    const lockExpired = new Date(conversion.lock_expires_at) <= new Date()
    const newStatus   = lockExpired ? 'eligible' : 'locked'

    await supabase
      .from('referral_conversions')
      .update({
        status:             newStatus,
        monthly_commission: commission,
        total_earned:       (conversion.total_earned ?? 0) + commission,
      })
      .eq('id', conversion.id)

    const newUnpaid      = parseFloat(((affiliate.unpaid_earnings ?? 0) + commission).toFixed(2))
    const newTotal       = parseFloat(((affiliate.total_earnings  ?? 0) + commission).toFixed(2))
    const newActiveCount = isNewSubscription ? (affiliate.active_referral_count ?? 0) + 1 : (affiliate.active_referral_count ?? 0)
    const updatedRate    = newActiveCount >= 100 ? 0.40 : 0.30

    await supabase
      .from('affiliates')
      .update({
        unpaid_earnings:       newUnpaid,
        total_earnings:        newTotal,
        active_referral_count: newActiveCount,
        commission_rate:       updatedRate,
      })
      .eq('user_id', conversion.affiliate_user_id)
  } catch (err) {
    console.error('Affiliate commission error:', err)
  }
}

async function handleAffiliateChurn(
  supabase: ReturnType<typeof getSupabase>,
  referredUserId: string
) {
  try {
    const { data: conversion } = await supabase
      .from('referral_conversions')
      .select('affiliate_user_id')
      .eq('referred_user_id', referredUserId)
      .single()
    if (!conversion) return

    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('active_referral_count, commission_rate')
      .eq('user_id', conversion.affiliate_user_id)
      .single()
    if (!affiliate) return

    const newCount = Math.max(0, (affiliate.active_referral_count ?? 1) - 1)
    const newRate  = newCount >= 100 ? 0.40 : 0.30

    await supabase
      .from('affiliates')
      .update({ active_referral_count: newCount, commission_rate: newRate })
      .eq('user_id', conversion.affiliate_user_id)

    await supabase
      .from('referral_conversions')
      .update({ status: 'pending' })
      .eq('referred_user_id', referredUserId)
  } catch (err) {
    console.error('Affiliate churn handler error:', err)
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  const body     = await req.text()
  const sig      = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 })
  }

  // ── CHECKOUT COMPLETED ──────────────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object as Stripe.Checkout.Session
    const userId   = session.metadata?.user_id
    const type     = session.metadata?.type
    const priceId  = session.metadata?.price_id

    // ── Credit pack — one-time payment ──
    if (type === 'credit_pack' && priceId && userId) {
      const creditsToAdd = CREDIT_PACK_PRICES[priceId]
      if (!creditsToAdd) return NextResponse.json({ received: true })

      // Idempotency: use payment_intent ID to prevent double-processing
      const paymentIntentId = session.payment_intent as string
      if (paymentIntentId) {
        const { data: existing } = await supabase
          .from('processed_events')
          .select('id')
          .eq('event_id', paymentIntentId)
          .maybeSingle()

        if (existing) {
          console.log('Credit pack already processed:', paymentIntentId)
          return NextResponse.json({ received: true })
        }

        // Mark as processed before adding credits
        await supabase
          .from('processed_events')
          .insert({ event_id: paymentIntentId, type: 'credit_pack', user_id: userId })
          .select()
      }

      const { data: settings } = await supabase
        .from('user_settings')
        .select('ai_credits_remaining')
        .eq('user_id', userId)
        .single()
      const current = settings?.ai_credits_remaining ?? 0
      await supabase
        .from('user_settings')
        .update({ ai_credits_remaining: current + creditsToAdd })
        .eq('user_id', userId)

      return NextResponse.json({ received: true })
    }

    // ── White label add-on ──
    if (type === 'white_label' && userId) {
      const whiteLabelTier = session.metadata?.white_label_tier || 'basic'
      await supabase
        .from('user_settings')
        .update({ white_label_active: true, white_label_tier: whiteLabelTier })
        .eq('user_id', userId)
      return NextResponse.json({ received: true })
    }

    // ── Base plan subscription via checkout ──
    if (!session.subscription) return NextResponse.json({ received: true })

    const customerId   = session.customer as string
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    const { plan, whiteLabelActive, whiteLabelTier, isWhiteLabelOnly } = resolveSubscription(subscription)

    if (isWhiteLabelOnly || !plan) return NextResponse.json({ received: true })

    // Read current state BEFORE upsert to preserve credits correctly
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('plan, ai_credits_remaining')
      .eq('user_id', userId)
      .maybeSingle()

    // If already on this plan, subscription.updated already handled credits — don't overwrite
// Only set credits if this is a genuinely new subscription (no prior plan or different plan)
const alreadyOnPlan = existingSettings?.plan === plan
const creditsToSet = alreadyOnPlan
  ? (existingSettings?.ai_credits_remaining ?? PLAN_CREDITS[plan] ?? 100)
  : existingSettings
    ? resolveCreditsOnPlanChange(existingSettings.plan, plan, existingSettings.ai_credits_remaining ?? 0)
    : PLAN_CREDITS[plan] ?? 100

    await supabase.from('user_settings').upsert({
      user_id:                userId,
      plan,
      white_label_active:     whiteLabelActive,
      white_label_tier:       whiteLabelTier,
      stripe_customer_id:     customerId,
      stripe_subscription_id: subscription.id,
      plan_expires_at:        safeDate((subscription as any).current_period_end),
      ai_credits_remaining:   creditsToSet,
      ai_credits_total:       PLAN_CREDITS[plan] ?? 100,
      ai_credits_reset_at:    new Date().toISOString(),
    }, { onConflict: 'user_id' })

    if (userId) {
      await processReferralCredits(supabase, userId, plan, true)
      await processAffiliateCommission(supabase, userId, plan, true)
    }
  }

  // ── SUBSCRIPTION UPDATED ────────────────────────────────────────────────────
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const { plan, whiteLabelActive, whiteLabelTier, isWhiteLabelOnly } = resolveSubscription(subscription)

    // White-label-only renewal
    if (isWhiteLabelOnly) {
      await supabase
        .from('user_settings')
        .update({ white_label_active: whiteLabelActive, white_label_tier: whiteLabelTier })
        .eq('stripe_customer_id', subscription.customer as string)
      return NextResponse.json({ received: true })
    }

    if (!plan) return NextResponse.json({ received: true })

    const { data: current } = await supabase
      .from('user_settings')
      .select('user_id, plan, ai_credits_remaining')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    const planChanged    = current?.plan !== plan
    const updatePayload: Record<string, any> = {
      plan,
      white_label_active: whiteLabelActive,
      white_label_tier:   whiteLabelTier,
      plan_expires_at:    safeDate((subscription as any).current_period_end),
    }

    if (planChanged) {
      // subscription.updated fires after checkout.session.completed on upgrades
      // At this point credits may already be correct from checkout handler — don't overwrite
      // unless this is a direct subscription modification (not via checkout)
      const creditsToSet = resolveCreditsOnPlanChange(
        current?.plan ?? null,
        plan,
        current?.ai_credits_remaining ?? 0
      )
      updatePayload.ai_credits_remaining = creditsToSet
      updatePayload.ai_credits_total     = PLAN_CREDITS[plan] ?? 100
      updatePayload.ai_credits_reset_at  = new Date().toISOString()
    }
    // No plan change = renewal, don't touch credits

    await supabase
      .from('user_settings')
      .update(updatePayload)
      .eq('stripe_subscription_id', subscription.id)

    if (current?.user_id) {
      await processAffiliateCommission(supabase, current.user_id, plan, false)
    }
  }

  // ── SUBSCRIPTION DELETED ────────────────────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const { isWhiteLabelOnly } = resolveSubscription(subscription)

    if (isWhiteLabelOnly) {
      await supabase
        .from('user_settings')
        .update({ white_label_active: false, white_label_tier: null })
        .eq('stripe_customer_id', subscription.customer as string)
      return NextResponse.json({ received: true })
    }

    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    await supabase
      .from('user_settings')
      .update({
        plan:                   'free',
        white_label_active:     false,
        white_label_tier:       null,
        stripe_subscription_id: null,
        plan_expires_at:        null,
        ai_credits_remaining:   100,
        ai_credits_total:       100,
        ai_credits_reset_at:    new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    if (userSettings?.user_id) {
      await handleAffiliateChurn(supabase, userSettings.user_id)
    }
  }

  return NextResponse.json({ received: true })
}