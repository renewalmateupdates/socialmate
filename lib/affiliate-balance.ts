import type { SupabaseClient } from '@supabase/supabase-js'
import { oldestFirst, selectAll } from '@/lib/admin-metrics'

// The real, currently-earned-but-unpaid commission balance lives on
// affiliates.unpaid_earnings (a dollar amount) for this user's row in the
// `affiliates` table -- NOT affiliate_profiles.available_balance_cents.
//
// Two separate tables exist for what's meant to be the same partner:
// `affiliates` is where the Stripe webhook actually posts commission on every
// conversion (processAffiliateCommission, the coupon-subscription path), and
// `affiliate_profiles` is the Partners onboarding/payout-request table (TOS,
// Stripe Connect setup, promo codes). available_balance_cents was never once
// written to by the webhook -- an affiliate could earn real, correct
// commission in affiliates.unpaid_earnings and their Partners balance would
// stay at whatever it started (effectively $0), so they could never reach
// the $25 minimum to request a payout for money they had actually earned.
//
// Fixed by reading/writing the real balance through these two helpers rather
// than through affiliate_profiles at all, joined by the one thing both
// tables actually share: user_id.
// Commissions are held 60 days (the refund and chargeback window) before they
// can be cashed out, as /affiliates promises. Until Nov 10, 2026 nothing held
// them: a commission earned today counted toward the $25 payout at once, and
// the dashboard's "Pending · 60-day hold" tile was always $0.
export const PAYOUT_HOLD_DAYS = 60

// Unpaid earnings minus what was earned in the last PAYOUT_HOLD_DAYS. Returns 0
// when either read fails: if we can't tell what is still held, nothing is
// payable yet.
export async function getAffiliateAvailableBalanceCents(
  db: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data, error } = await db
    .from('affiliates')
    .select('id, unpaid_earnings')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    console.warn('[affiliate-balance] balance read failed:', error.message)
    return 0
  }
  if (!data) return 0
  const unpaidCents = Math.round((data.unpaid_earnings ?? 0) * 100)

  const holdStart = new Date(Date.now() - PAYOUT_HOLD_DAYS * 86_400_000).toISOString()
  let heldCents = 0
  try {
    const recent = await selectAll<{ commission_cents: number | null }>('affiliate_conversions', () =>
      oldestFirst(db.from('affiliate_conversions')
        .select('commission_cents')
        .eq('affiliate_id', data.id)
        .gte('converted_at', holdStart)))
    heldCents = recent.reduce((sum, r) => sum + (r.commission_cents ?? 0), 0)
  } catch (e) {
    console.warn('[affiliate-balance] hold read failed:', e instanceof Error ? e.message : e)
    return 0
  }
  return Math.max(0, unpaidCents - heldCents)
}

// Spends amountCents off the real balance -- called when a payout is
// approved. Floors at zero so a race with a fresh conversion never goes
// negative.
export async function deductAffiliateEarnings(
  db: SupabaseClient,
  userId: string,
  amountCents: number,
): Promise<void> {
  const { data } = await db
    .from('affiliates')
    .select('unpaid_earnings')
    .eq('user_id', userId)
    .maybeSingle()
  const current = data?.unpaid_earnings ?? 0
  const next = Math.max(0, parseFloat((current - amountCents / 100).toFixed(2)))
  await db.from('affiliates').update({ unpaid_earnings: next }).eq('user_id', userId)
}
