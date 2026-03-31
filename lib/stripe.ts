import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20' as any,
    })
  }
  return _stripe
}

/** @deprecated Use getStripe() instead */
export const stripe = {
  get customers() { return getStripe().customers },
  get subscriptions() { return getStripe().subscriptions },
  get checkout() { return getStripe().checkout },
  get billingPortal() { return getStripe().billingPortal },
  get webhooks() { return getStripe().webhooks },
  get prices() { return getStripe().prices },
  get paymentIntents() { return getStripe().paymentIntents },
  get coupons() { return getStripe().coupons },
  get promotionCodes() { return getStripe().promotionCodes },
}
