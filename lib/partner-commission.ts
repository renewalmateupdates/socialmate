import type { SupabaseClient } from '@supabase/supabase-js'

// Partner commission and referral attribution, called from the Stripe webhook
// and the checkout route.
//
// One rule: a partner earns 30% (40% at 100+ active referrals) of every
// subscription payment a referred customer makes, excluding sales tax, and
// 10% or 15% of their credit-pack purchases. "Referred" means a
// referral_conversions row, created by the partner's link at signup
// (app/auth/callback/route.ts) or by the partner's code at checkout
// (recordCodeReferral below), so a code and a link earn the same way.
//
// What it replaced paid a flat $8 or $29 x 30% on every
// customer.subscription.updated event: annual plans (mapped to 'pro'/'agency')
// earned $2.40 a year, white label and the add-ons earned nothing, any
// subscription change paid out again, and a partner code paid only on the
// first payment.

const HOLD_DAYS = 60

export function partnerRate(activeReferralCount: number): number {
  return activeReferralCount >= 100 ? 0.40 : 0.30
}

// Sales tax collected through automatic_tax is not revenue, so it's excluded.
// Handles both invoice shapes: `tax` (API 2024-06-20, what lib/stripe.ts pins)
// and `total_taxes` (newer versions, if the webhook endpoint runs one).
export function invoiceCommissionBase(invoice: {
  amount_paid?: number | null
  tax?: number | null
  total_taxes?: { amount?: number | null }[] | null
}): number {
  const paid = invoice.amount_paid ?? 0
  const tax  = typeof invoice.tax === 'number'
    ? invoice.tax
    : (invoice.total_taxes ?? []).reduce((s, t) => s + (t.amount ?? 0), 0)
  return Math.max(0, paid - tax)
}

function payingStatus(lockExpiresAt: string | null | undefined): 'eligible' | 'locked' {
  return lockExpiresAt && new Date(lockExpiresAt) <= new Date() ? 'eligible' : 'locked'
}

const PAYING = new Set(['locked', 'eligible', 'paid'])

export interface CommissionResult {
  // The referred customer just made their first subscription payment
  // (not paying before this one): referral credits key off this.
  becamePaying: boolean
  commissionCents: number
}

// Credit a partner for one payment. `sourceId` is the Stripe invoice id
// (subscriptions) or Checkout Session id (credit packs) and makes this
// idempotent: Stripe redelivers webhooks, and a payment is only ever credited
// once. `partnerUserId` overrides the referral lookup (a legacy partner promo
// code on a credit pack names its partner directly).
export async function creditPartnerCommission(
  db: SupabaseClient,
  params: {
    buyerUserId: string
    amountCents: number
    sourceId: string
    kind: 'subscription' | 'credit_pack'
    rate?: number
    partnerUserId?: string | null
  },
): Promise<CommissionResult> {
  const none: CommissionResult = { becamePaying: false, commissionCents: 0 }

  const { data: already, error: dupErr } = await db
    .from('affiliate_conversions')
    .select('id')
    .eq('stripe_session_id', params.sourceId)
    .limit(1)
  if (dupErr) {
    console.warn('[commission] duplicate check failed:', dupErr.message)
    return none
  }
  if ((already ?? []).length > 0) return none

  const { data: referral, error: refErr } = await db
    .from('referral_conversions')
    .select('id, affiliate_user_id, status, total_earned, lock_expires_at')
    .eq('referred_user_id', params.buyerUserId)
    .maybeSingle()
  if (refErr) console.warn('[commission] referral lookup failed:', refErr.message)

  // Referral status tracks whether the referred customer pays, for every
  // referrer: partners and ordinary users alike (the latter earn referral
  // credits, not commission). Only subscriptions make someone "paying".
  let becamePaying = false
  if (referral && params.kind === 'subscription') {
    const wasPaying = PAYING.has(referral.status ?? '')
    const status = payingStatus(referral.lock_expires_at)
    becamePaying = !wasPaying
    if (status !== referral.status) {
      const { error } = await db.from('referral_conversions').update({ status }).eq('id', referral.id)
      if (error) console.warn('[commission] referral status update failed:', error.message)
    }
  }

  const partnerUserId = params.partnerUserId ?? referral?.affiliate_user_id
  if (!partnerUserId || partnerUserId === params.buyerUserId) return { ...none, becamePaying }

  const { data: affiliate, error: affErr } = await db
    .from('affiliates')
    .select('id, status, unpaid_earnings, total_earnings, active_referral_count')
    .eq('user_id', partnerUserId)
    .maybeSingle()
  if (affErr) console.warn('[commission] partner lookup failed:', affErr.message)
  if (!affiliate || affiliate.status !== 'active') return { ...none, becamePaying }

  const rate = params.rate ?? partnerRate(affiliate.active_referral_count ?? 0)
  const commissionCents = Math.floor(Math.max(0, params.amountCents) * rate)
  if (commissionCents <= 0) return { ...none, becamePaying }

  const now = new Date()
  const { error: insErr } = await db.from('affiliate_conversions').insert({
    affiliate_id:      affiliate.id,
    amount_cents:      params.amountCents,
    commission_cents:  commissionCents,
    status:            'holding',
    converted_at:      now.toISOString(),
    conversion_type:   params.kind === 'subscription' ? 'subscription_payment' : 'credit_pack',
    stripe_session_id: params.sourceId,
  })
  if (insErr) {
    // No ledger row means no balance change: never pay what isn't recorded.
    console.warn('[commission] conversion insert failed:', insErr.message)
    return { ...none, becamePaying }
  }

  const dollars = commissionCents / 100
  // A referral counts toward the 40% tier from their first subscription payment.
  const activeCount = (affiliate.active_referral_count ?? 0) + (becamePaying ? 1 : 0)
  const { error: updErr } = await db.from('affiliates').update({
    unpaid_earnings:       parseFloat(((affiliate.unpaid_earnings ?? 0) + dollars).toFixed(2)),
    total_earnings:        parseFloat(((affiliate.total_earnings  ?? 0) + dollars).toFixed(2)),
    active_referral_count: activeCount,
    commission_rate:       partnerRate(activeCount),
  }).eq('id', affiliate.id)
  if (updErr) console.warn('[commission] balance update failed:', updErr.message)

  if (referral && referral.affiliate_user_id === partnerUserId) {
    const { error } = await db.from('referral_conversions').update({
      total_earned: parseFloat(((referral.total_earned ?? 0) + dollars).toFixed(2)),
      ...(params.kind === 'subscription' ? { monthly_commission: dollars } : {}),
    }).eq('id', referral.id)
    if (error) console.warn('[commission] referral earnings update failed:', error.message)
  }

  return { becamePaying, commissionCents }
}

// A partner's code at checkout makes the buyer that partner's referral, so the
// code earns on every payment exactly like the link. An existing referral is
// taken over only if it has never earned anything: the code is the newest and
// most explicit signal, but a customer already paying under one partner is
// never moved to another. A partner can't refer themselves.
export async function recordCodeReferral(
  db: SupabaseClient,
  params: { buyerUserId: string; affiliateId: string; code: string },
): Promise<void> {
  const { data: affiliate, error: affErr } = await db
    .from('affiliates')
    .select('user_id, status')
    .eq('id', params.affiliateId)
    .maybeSingle()
  if (affErr) console.warn('[code referral] partner lookup failed:', affErr.message)
  if (!affiliate?.user_id || affiliate.status !== 'active') return
  if (affiliate.user_id === params.buyerUserId) return

  const { data: existing, error: exErr } = await db
    .from('referral_conversions')
    .select('id, affiliate_user_id, total_earned')
    .eq('referred_user_id', params.buyerUserId)
    .maybeSingle()
  if (exErr) {
    console.warn('[code referral] lookup failed:', exErr.message)
    return
  }

  const lockExpiresAt = new Date(Date.now() + HOLD_DAYS * 24 * 60 * 60 * 1000).toISOString()

  if (!existing) {
    const { error } = await db.from('referral_conversions').insert({
      affiliate_user_id: affiliate.user_id,
      referred_user_id:  params.buyerUserId,
      referral_code:     params.code,
      status:            'pending',
      converted_at:      new Date().toISOString(),
      lock_expires_at:   lockExpiresAt,
    })
    if (error) console.warn('[code referral] insert failed:', error.message)
    return
  }

  if (existing.affiliate_user_id === affiliate.user_id) return
  if ((existing.total_earned ?? 0) > 0) return

  const { error } = await db.from('referral_conversions').update({
    affiliate_user_id: affiliate.user_id,
    referral_code:     params.code,
    lock_expires_at:   lockExpiresAt,
  }).eq('id', existing.id)
  if (error) console.warn('[code referral] reassign failed:', error.message)
}
