import type Stripe from 'stripe'

/**
 * Every SocialMate purchase is final. Section 8 of the Terms says so in full;
 * this is the line people see where they pay: above the pay button in Stripe
 * Checkout, and under the plans on /pricing (as `pricing.all_sales_final`,
 * translated in messages/*.json).
 *
 * Only for SocialMate's own sales. Donations, merch and creator tips, unlocks
 * and fan subscriptions are not ours to set terms for, so they don't use it.
 */
export const ALL_SALES_FINAL =
  'All sales are final. Subscriptions can be canceled anytime to stop the next renewal.'

/** Pass as `custom_text` when creating a Checkout Session for a SocialMate purchase. */
export const FINAL_SALE_CHECKOUT_TEXT: Stripe.Checkout.SessionCreateParams.CustomText = {
  submit: { message: ALL_SALES_FINAL },
}
