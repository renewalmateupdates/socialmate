import type { SupabaseClient } from '@supabase/supabase-js'

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
export async function getAffiliateAvailableBalanceCents(
  db: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data } = await db
    .from('affiliates')
    .select('unpaid_earnings')
    .eq('user_id', userId)
    .maybeSingle()
  return Math.round((data?.unpaid_earnings ?? 0) * 100)
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
