/**
 * A partner's commission rate on subscription payments, in one place.
 *
 * The program promises 30%, and 40% "forever" from 100 active referrals
 * (CLAUDE.md, the partner emails, /affiliates). Until Nov 2026 the code made
 * it 40% only while the count stayed at 100 or more: one churned customer at
 * 100 dropped the partner back to 30%. Now `affiliates.commission_rate` records
 * the tier: it becomes 0.40 on the payment that reaches 100, and nothing
 * lowers it again, so the rate is the higher of the stored one and the count's.
 *
 * Read the count and the rate from `affiliates`, the row the Stripe webhook
 * credits. `affiliate_profiles` has columns with the same names that nothing
 * writes, which is how the partner portal came to show 0 referrals.
 */

export const BASE_RATE = 0.30
export const MILESTONE_RATE = 0.40
export const MILESTONE_REFERRALS = 100

/** 30%, or 40% from the 100th active referral on, and kept after that. */
export function partnerRate(activeReferralCount: number, storedRate?: number | null): number {
  const byCount = (activeReferralCount ?? 0) >= MILESTONE_REFERRALS ? MILESTONE_RATE : BASE_RATE
  // A tiny tolerance: numeric columns can come back as 0.39999999.
  const kept = typeof storedRate === 'number' && storedRate >= MILESTONE_RATE - 1e-6
  return kept ? MILESTONE_RATE : byCount
}

export interface PartnerTier {
  rate: number
  /** "30%" or "40%". */
  label: string
  /** How far to the 40% tier, or null once it is reached. */
  nextTier: { rate: string; remaining: number } | null
}

export function partnerTier(activeReferralCount: number, storedRate?: number | null): PartnerTier {
  const rate = partnerRate(activeReferralCount, storedRate)
  const reached = rate >= MILESTONE_RATE
  return {
    rate,
    label: `${Math.round(rate * 100)}%`,
    nextTier: reached
      ? null
      : { rate: `${Math.round(MILESTONE_RATE * 100)}%`, remaining: Math.max(0, MILESTONE_REFERRALS - (activeReferralCount ?? 0)) },
  }
}

/** The figures a partner list shows, taken from an `affiliates` row (earnings are stored in dollars). */
export function partnerFigures(row: {
  active_referral_count?: number | null
  commission_rate?: number | null
  total_earnings?: number | null
  unpaid_earnings?: number | null
} | null | undefined) {
  const count = row?.active_referral_count ?? 0
  return {
    active_referral_count: count,
    commission_rate: partnerRate(count, row?.commission_rate),
    total_earnings_cents: Math.round((row?.total_earnings ?? 0) * 100),
    available_balance_cents: Math.round((row?.unpaid_earnings ?? 0) * 100),
  }
}
