export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { Resend } from 'resend'

const STRIPE_PRO_PRICE_ID               = 'price_1T9S2v7OMwDowUuULHznqUD5'
const STRIPE_AGENCY_PRICE_ID            = 'price_1TFMHp7OMwDowUuUgeLAeJNY'
const STRIPE_PRO_ANNUAL_PRICE_ID        = 'price_1TFMHx7OMwDowUuUl9PqWxMs'
const STRIPE_AGENCY_ANNUAL_PRICE_ID     = 'price_1TFMI07OMwDowUuUoHfKJEpo'
const STRIPE_WHITE_LABEL_BASIC_PRICE_ID = 'price_1TFMHt7OMwDowUuU56Fzw4fE'
const STRIPE_WHITE_LABEL_PRO_PRICE_ID   = 'price_1TFMIG7OMwDowUuUcjNNGB0Q'

const CREDIT_PACK_PRICES: Record<string, number> = {
  'price_1TFMI47OMwDowUuUhTrbe3oq': 100,
  'price_1TFMI77OMwDowUuU0wDZWcCL': 300,
  'price_1TFMIA7OMwDowUuUwI3SEGCR': 750,
  'price_1TFMID7OMwDowUuU2sQgbIx9': 2000,
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
  free:   50,
  pro:    500,
  agency: 2000,
}

const PLAN_MONTHLY_VALUE: Record<string, number> = {
  pro:    5.00,
  agency: 20.00,
}

// Stacking credit model: every 5 paying referrals = +100 bonus credits
const REFERRAL_CREDITS_PER_TIER = 100
const REFERRAL_TIER_SIZE        = 5

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
  const newPlanCredits = PLAN_CREDITS[newPlan] ?? 50
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
  try {
    const { data: conversion } = await supabase
      .from('referral_conversions')
      .select('affiliate_user_id')
      .eq('referred_user_id', referredUserId)
      .single()
    if (!conversion) return

    // Count paying referrals for this affiliate (including this new one)
    const { data: allConversions } = await supabase
      .from('referral_conversions')
      .select('status')
      .eq('affiliate_user_id', conversion.affiliate_user_id)

    const payingCount = (allConversions || []).filter(
      (r: any) => r.status === 'eligible' || r.status === 'paid'
    ).length

    // Stacking model: award 100 credits at each multiple of 5 paying referrals
    // previousPayingCount was payingCount - 1 (before this referral was counted)
    const prevCount = payingCount - 1
    const crossedTier = (
      Math.floor(payingCount / REFERRAL_TIER_SIZE) > Math.floor(prevCount / REFERRAL_TIER_SIZE)
    )

    if (crossedTier) {
      const { data: referrerSettings } = await supabase
        .from('user_settings')
        .select('ai_credits_remaining, earned_credits')
        .eq('user_id', conversion.affiliate_user_id)
        .single()
      if (referrerSettings) {
        await supabase
          .from('user_settings')
          .update({
            ai_credits_remaining: (referrerSettings.ai_credits_remaining ?? 0) + REFERRAL_CREDITS_PER_TIER,
            earned_credits: (referrerSettings.earned_credits ?? 0) + REFERRAL_CREDITS_PER_TIER,
          })
          .eq('user_id', conversion.affiliate_user_id)
      }
    }

    // Custom domain unlock at 3+ paying referrals
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

// ── Regenerate a single-use promo code after it's been redeemed ─────────────
async function regenerateAffiliatePromoCode(
  supabase: ReturnType<typeof getSupabase>,
  promoRecord: { id: string; code: string; stripe_coupon_id: string; code_template?: string | null }
) {
  try {
    const couponId = promoRecord.stripe_coupon_id?.split('|')[0]
    if (!couponId) return

    // Use original template to build new code, or derive from current code
    const template = promoRecord.code_template || promoRecord.code
    // Strip any trailing 2-char suffix from previous regenerations (e.g. "GILGAMES3MAB" → "GILGAMES3M")
    const base = template.length > 2 ? template : template
    const suffix = Math.random().toString(36).slice(2, 4).toUpperCase()
    const newCode = `${base}${suffix}`

    const newPromo = await stripe.promotionCodes.create({
      promotion: { type: 'coupon', coupon: couponId },
      code: newCode,
      max_redemptions: 1,
      metadata: { regenerated_from: promoRecord.code },
    } as any)

    await supabase.from('affiliate_promo_codes')
      .update({
        code:             newCode,
        stripe_coupon_id: `${couponId}|${newPromo.id}`,
        times_used:       0,
      })
      .eq('id', promoRecord.id)
  } catch (err) {
    console.warn('Promo code regeneration failed (non-fatal):', err)
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

    // ── Studio Stax listing payment ──
    if (session.metadata?.studio_stax === 'true') {
      const { listing_id, billing_type, slot_quarter, slot_start, slot_end, token, studio_stax_renew, slot_id } = session.metadata
      const paymentIntentId = session.payment_intent as string
      const isRenewal = studio_stax_renew === 'true'

      if (listing_id) {
        // Fetch listing for email
        const { data: listing } = await supabase
          .from('curated_listings')
          .select('id, name, tagline, applicant_name, applicant_email')
          .eq('id', listing_id)
          .single()

        const now      = new Date()
        const newStart = slot_start ?? now.toISOString()
        const newEnd   = slot_end   ?? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()

        if (isRenewal && slot_id) {
          // Renewal: expire the old slot, insert a new one carrying over original amount
          const originalMeta = session.metadata?.original_amount
          const originalCents = originalMeta ? parseInt(originalMeta) : (session.amount_total ?? 0)

          await supabase.from('studio_stax_slots').update({ status: 'expired' }).eq('id', slot_id)
          await supabase.from('studio_stax_slots').insert({
            listing_id,
            buyer_email:        listing?.applicant_email ?? session.customer_email,
            buyer_name:         listing?.applicant_name ?? '',
            billing_type:       'annual',
            slot_quarter:       slot_quarter ?? String(now.getUTCFullYear()),
            amount_paid_cents:  originalCents, // preserve original amount for future renewal pricing
            stripe_payment_id:  paymentIntentId,
            status:             'active',
            starts_at:          newStart,
            expires_at:         newEnd,
            renewal_token:      null,
            renewal_token_expires: null,
          })
        } else {
        // Insert slot
        await supabase.from('studio_stax_slots').insert({
          listing_id,
          buyer_email:        listing?.applicant_email ?? session.customer_email,
          buyer_name:         listing?.applicant_name ?? '',
          billing_type:       billing_type ?? 'annual',
          slot_quarter:       slot_quarter ?? String(now.getUTCFullYear()),
          amount_paid_cents:  session.amount_total ?? 0,
          stripe_payment_id:  paymentIntentId,
          status:             'active',
          starts_at:          newStart,
          expires_at:         newEnd,
        })
        }

        // Update listing — mark live (idempotent; already live on renewal)
        await supabase
          .from('curated_listings')
          .update({
            status:                   'live',
            checkout_token:           null,
            checkout_token_expires:   null,
            stripe_payment_intent_id: paymentIntentId,
          })
          .eq('id', listing_id)

        // Send confirmation/renewal email
        if (listing?.applicant_email) {
          try {
            const resend   = new Resend(process.env.RESEND_API_KEY)
            const appUrl   = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
            const listingUrl = `${appUrl}/studio-stax`
            // Renewal = 20% off what they paid. $100 founder → $80. $150 standard → $120.
            const paidCents    = session.amount_total ?? 0
            const renewalPrice = Math.round(paidCents * 0.80 / 100)
            await resend.emails.send({
              from:    'SocialMate <hello@socialmate.studio>',
              to:      listing.applicant_email,
              subject: isRenewal ? `✅ ${listing.name} renewed in Studio Stax` : `🎉 ${listing.name} is now live in Studio Stax`,
              html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#111;padding:24px 32px;text-align:center;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;">Studio Stax</p>
        <h1 style="margin:6px 0 0;font-size:22px;font-weight:800;color:#fff;">You're live 🎉</h1>
      </div>
      <div style="padding:32px;">
        <p style="margin:0 0 16px;font-size:14px;color:#374151;">Hey ${listing.applicant_name},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.6;">
          Payment confirmed — <strong>${listing.name}</strong> is now live in Studio Stax.
          Donate to SM-Give to climb the rankings (the more you give, the higher you appear in the directory).
        </p>

        <a href="${listingUrl}" style="display:block;text-align:center;background:#111;color:#fff;font-weight:700;font-size:14px;padding:14px 24px;border-radius:12px;text-decoration:none;margin-bottom:12px;">
          View your listing in Studio Stax →
        </a>
        <a href="${appUrl}/studio-stax/portal" style="display:block;text-align:center;background:#f9fafb;color:#111;font-weight:700;font-size:14px;padding:14px 24px;border-radius:12px;text-decoration:none;border:1px solid #e5e7eb;margin-bottom:24px;">
          Manage listing &amp; view analytics →
        </a>

        <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">What's next</p>
          <ul style="margin:0;padding-left:16px;font-size:13px;color:#374151;line-height:1.8;">
            <li>Donate to SM-Give to climb the rankings</li>
            <li>You'll get renewal reminders at 30, 14, and 7 days before expiry</li>
            <li>Renewal locks in at $${renewalPrice}/year</li>
            <li>Blog feature article written at 3 months and every 3 months you stay active</li>
          </ul>
        </div>

        <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">From the SocialMate family</p>
          <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#111;">Track every recurring expense free with RenewalMate</p>
          <p style="margin:0 0 12px;font-size:12px;color:#6b7280;line-height:1.5;">
            Keep tabs on your Studio Stax subscription — and all your other tools — with RenewalMate. Always free to start.
          </p>
          <a href="https://renewalmate.com" style="font-size:12px;font-weight:700;color:#f59e0b;text-decoration:none;">renewalmate.com →</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
            })
          } catch (emailErr) {
            console.error('[StaxWebhook] Confirmation email failed:', emailErr)
          }
        }
      }

      return NextResponse.json({ received: true })
    }

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
        .select('ai_credits_remaining, paid_credits')
        .eq('user_id', userId)
        .single()
      const currentLegacy = settings?.ai_credits_remaining ?? 0
      const currentPaid   = settings?.paid_credits ?? 0
      const updatePayload: Record<string, number> = {
        ai_credits_remaining: currentLegacy + creditsToAdd,
        paid_credits: currentPaid + creditsToAdd,
      }
      await supabase
        .from('user_settings')
        .update(updatePayload)
        .eq('user_id', userId)

      // Track affiliate promo code commission for credit pack purchases
      try {
        if (session.discounts && session.discounts.length > 0) {
          for (const discount of session.discounts) {
            if (discount.promotion_code) {
              const promoCodeId = typeof discount.promotion_code === 'string'
                ? discount.promotion_code
                : discount.promotion_code.id

              const { data: promoRecord } = await supabase
                .from('affiliate_promo_codes')
                .select('id, affiliate_id, times_used, code, stripe_coupon_id, code_template')
                .like('stripe_coupon_id', `%${promoCodeId}%`)
                .maybeSingle()

              if (promoRecord?.affiliate_id) {
                // 10% on Starter/Popular, 15% on Pro/Max
                const CREDIT_PACK_RATES: Record<string, number> = {
                  'price_1TFMI47OMwDowUuUhTrbe3oq': 0.10, // Starter 100cr
                  'price_1TFMI77OMwDowUuU0wDZWcCL': 0.10, // Popular 300cr
                  'price_1TFMIA7OMwDowUuUwI3SEGCR': 0.15, // Pro Pack 750cr
                  'price_1TFMID7OMwDowUuU2sQgbIx9': 0.15, // Max Pack 2000cr
                }
                const rate = CREDIT_PACK_RATES[priceId] ?? 0.10
                const amountCents = session.amount_total ?? 0
                const commissionCents = Math.floor(amountCents * rate)

                if (commissionCents > 0) {
                  await supabase.from('affiliate_conversions').insert({
                    affiliate_id:      promoRecord.affiliate_id,
                    amount_cents:      amountCents,
                    commission_cents:  commissionCents,
                    status:            'holding',
                    converted_at:      new Date().toISOString(),
                    conversion_type:   'credit_pack',
                    stripe_session_id: session.id,
                  })
                }

                // Track usage + issue fresh single-use code
                await supabase.from('affiliate_promo_codes')
                  .update({ times_used: (promoRecord.times_used ?? 0) + 1 })
                  .eq('id', promoRecord.id)
                await regenerateAffiliatePromoCode(supabase, promoRecord)
              }
            }
          }
        }
      } catch (err) {
        console.warn('Credit pack affiliate commission failed (non-fatal):', err)
      }

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
      user_id:                    userId,
      plan,
      white_label_active:         whiteLabelActive,
      white_label_tier:           whiteLabelTier,
      stripe_customer_id:         customerId,
      stripe_subscription_id:     subscription.id,
      plan_expires_at:            safeDate((subscription as any).current_period_end),
      ai_credits_remaining:       creditsToSet,
      monthly_credits_remaining:  creditsToSet,
      ai_credits_total:           PLAN_CREDITS[plan] ?? 100,
      ai_credits_reset_at:        new Date().toISOString(),
    }, { onConflict: 'user_id' })

    if (userId) {
      await processReferralCredits(supabase, userId, plan, true)
      await processAffiliateCommission(supabase, userId, plan, true)
    }

    // Track affiliate promo code usage + regenerate (single-use codes)
    try {
      if (session.discounts && session.discounts.length > 0) {
        for (const discount of session.discounts) {
          if (discount.promotion_code) {
            const promoCodeId = typeof discount.promotion_code === 'string'
              ? discount.promotion_code
              : discount.promotion_code.id

            // stripe_coupon_id stores "couponId|promoCodeId" or just couponId
            const { data: promoRecord } = await supabase
              .from('affiliate_promo_codes')
              .select('id, times_used, code, stripe_coupon_id, code_template, affiliate_id')
              .like('stripe_coupon_id', `%${promoCodeId}%`)
              .maybeSingle()

            if (promoRecord) {
              await supabase
                .from('affiliate_promo_codes')
                .update({ times_used: (promoRecord.times_used ?? 0) + 1 })
                .eq('id', promoRecord.id)
              // Regenerate single-use code so affiliate always has a fresh one
              await regenerateAffiliatePromoCode(supabase, promoRecord)
            }
          }
        }
      }
    } catch (err) {
      console.warn('Promo code usage tracking failed (non-fatal):', err)
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
      updatePayload.ai_credits_remaining      = creditsToSet
      updatePayload.monthly_credits_remaining = creditsToSet
      updatePayload.ai_credits_total          = PLAN_CREDITS[plan] ?? 100
      updatePayload.ai_credits_reset_at       = new Date().toISOString()
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
        plan:                      'free',
        white_label_active:        false,
        white_label_tier:          null,
        stripe_subscription_id:    null,
        plan_expires_at:           null,
        monthly_credits_remaining: 50,
        ai_credits_remaining:      50,
        ai_credits_total:          50,
        ai_credits_reset_at:       new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    if (userSettings?.user_id) {
      await handleAffiliateChurn(supabase, userSettings.user_id)
    }
  }

  return NextResponse.json({ received: true })
}