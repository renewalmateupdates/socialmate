/**
 * SocialMate — Create Master Promo Codes in Stripe (Live Mode)
 *
 * Run with:
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/create-stripe-promo-codes.mjs
 *
 * This creates all master coupons + promotion codes in your LIVE Stripe account.
 */

import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY
if (!key || !key.startsWith('sk_live_')) {
  console.error('ERROR: Must set STRIPE_SECRET_KEY to a live key (sk_live_...)')
  process.exit(1)
}

const stripe = new Stripe(key, { apiVersion: '2024-04-10' })

const CODES = [
  {
    name:       'SMVIP100',
    code:       'SMVIP100',
    percent_off: 100,
    duration:   'once',
    note:       'Full 1-month free — for VIP/press/personal gifting',
  },
  {
    name:       'SMLAUNCH50',
    code:       'SMLAUNCH50',
    percent_off: 50,
    duration:   'repeating',
    duration_in_months: 3,
    note:       'Launch deal — 50% off for 3 months',
  },
  {
    name:       'SMFAMILY',
    code:       'SMFAMILY',
    percent_off: 100,
    duration:   'forever',
    note:       'Friends & family — free forever',
  },
  {
    name:       'SMPARTNER',
    code:       'SMPARTNER',
    percent_off: 30,
    duration:   'forever',
    note:       'Partner/collab discount — 30% off forever',
  },
  {
    name:       'SMPRESS',
    code:       'SMPRESS',
    percent_off: 100,
    duration:   'repeating',
    duration_in_months: 3,
    note:       'Press/media — 3 months free',
  },
  {
    name:       'SMCREDITS50',
    code:       'SMCREDITS50',
    percent_off: 50,
    duration:   'once',
    note:       '50% off one-time credit pack purchases',
  },
  {
    name:       'SMAFFILIATE',
    code:       'SMAFFILIATE',
    percent_off: 20,
    duration:   'repeating',
    duration_in_months: 3,
    note:       'Affiliate program promo — 20% off for 3 months',
  },
]

async function run() {
  console.log(`\nCreating ${CODES.length} promo codes in Stripe LIVE mode...\n`)

  for (const c of CODES) {
    try {
      const couponParams = {
        name: c.name,
        percent_off: c.percent_off,
        duration: c.duration,
        ...(c.duration_in_months ? { duration_in_months: c.duration_in_months } : {}),
      }

      const coupon = await stripe.coupons.create(couponParams)

      const promo = await stripe.promotionCodes.create({
        coupon: coupon.id,
        code:   c.code,
        active: true,
      })

      console.log(`✅  ${c.code}  —  ${c.note}  (coupon: ${coupon.id}, promo: ${promo.id})`)
    } catch (err) {
      if (err.raw?.code === 'resource_already_exists') {
        console.log(`⚠️   ${c.code}  — already exists, skipping`)
      } else {
        console.error(`❌  ${c.code}  — ${err.message}`)
      }
    }
  }

  console.log('\nDone.\n')
}

run()
