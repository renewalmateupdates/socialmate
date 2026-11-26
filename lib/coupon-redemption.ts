import type Stripe from 'stripe'

/**
 * Two rules for the pricing page's code box, shared by /api/coupons/validate
 * and /api/stripe/checkout so they can't drift apart.
 *
 * 1. A code only counts as used once someone has paid with it.
 *    /api/stripe/checkout writes a coupon_redemptions row when it creates the
 *    Checkout Session, before anyone pays. Both routes used to treat that row
 *    alone as "already used", so backing out of Stripe's page once burned the
 *    code for good, and the pricing page then said "You have already used this
 *    code". Now the row only counts when one of the person's completed Checkout
 *    Sessions carried the code (the session's metadata.coupon_code).
 *
 * 2. A percent or fixed code needs a Stripe promotion code behind it.
 *    Checkout applies the discount through `stripe_promo_id`. NONPROFIT50 and
 *    STUDENT25 had none (Nov 26, 2026), so the pricing page said "50% off
 *    applied" and Stripe then charged the full price. Such a code is refused
 *    with a way to reach us instead.
 */

/**
 * Has this person completed a checkout with this code? On any doubt (no email,
 * or Stripe didn't answer) it says yes, which keeps the old rule: refuse.
 */
export async function paidWithCode(
  stripe: { checkout: Stripe['checkout'] },
  email: string | null | undefined,
  code: string,
): Promise<boolean> {
  if (!email) return true
  try {
    const sessions = await stripe.checkout.sessions.list({
      customer_details: { email },
      status: 'complete',
      limit: 100,
    })
    const wanted = code.trim().toUpperCase()
    return sessions.data.some(s => String(s.metadata?.coupon_code ?? '').trim().toUpperCase() === wanted)
  } catch (err) {
    console.warn('[coupons] could not read past checkouts:', err instanceof Error ? err.message : err)
    return true
  }
}

/** False for a percent or fixed code with no Stripe promotion code to apply it. */
export function worksAtCheckout(coupon: { discount_type: string | null; stripe_promo_id: string | null }): boolean {
  if (coupon.discount_type === 'percent' || coupon.discount_type === 'fixed') return Boolean(coupon.stripe_promo_id)
  return true
}
