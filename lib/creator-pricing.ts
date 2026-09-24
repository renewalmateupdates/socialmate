// Creator Hub money rules, in one place.
//
// Creator Hub takes 0% for SocialMate. It does NOT pay Stripe's processing fee
// for creators: on a destination charge the platform's balance is debited for
// that fee (Stripe docs, connect/destination-charges), so it is recovered with an
// application fee equal to Stripe's fee. SocialMate keeps nothing beyond that.

// Below about $3 the 30 cent fixed fee eats more than 13% (33% at $1), and a
// $0.50 unlock would lose about 63%. Stripe's own minimum charge is 50 cents.
export const MIN_CHARGE_CENTS = 300

// Stripe US card pricing. Checked against real test-mode charges on 2026-09-24:
// this formula matched Stripe's actual fee to the cent at $3, $5, $10 and $25
// (39, 45, 59, 103 cents). Not covered, and absorbed by the platform: international
// cards (+1.5%) and currency conversion (+1%). Subscriptions also pay Stripe
// Billing's 0.7% of recurring volume (stripe.com/pricing).
const CARD_PERCENT = 0.029
const CARD_FIXED_CENTS = 30
const BILLING_PERCENT = 0.007

export function stripeFeeCents(amountCents: number, opts: { subscription?: boolean } = {}): number {
  const percent = CARD_PERCENT + (opts.subscription ? BILLING_PERCENT : 0)
  return Math.ceil(amountCents * percent + CARD_FIXED_CENTS)
}

/** `application_fee_amount` for a one-time payment (tip, unlock). */
export function applicationFeeCents(amountCents: number): number {
  // Stripe rejects a fee equal to or above the charge. The floor makes that
  // unreachable, but a bad row should not be able to break checkout.
  return Math.min(stripeFeeCents(amountCents), Math.max(0, amountCents - 1))
}

/**
 * `transfer_data.amount_percent` for a subscription invoice: the share the
 * creator receives. Destination-charge subscriptions cannot use
 * application_fee_percent (Stripe: that needs a Stripe-Account header), so the
 * platform keeps the remainder instead. Rounded DOWN to two decimals, which is
 * all Stripe accepts, so the platform never keeps less than the fee.
 */
export function creatorTransferPercent(priceCents: number): number {
  const fee = stripeFeeCents(priceCents, { subscription: true })
  return Math.floor((1 - fee / priceCents) * 10000) / 100
}

export const MIN_CHARGE_DOLLARS = MIN_CHARGE_CENTS / 100
