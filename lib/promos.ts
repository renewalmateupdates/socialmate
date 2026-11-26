import { PLAN_PRICES } from '@/lib/plan'

/**
 * Time-limited deals, in one place, so the banners, the Dashboard and the
 * pricing page all say the same thing and hide themselves on the same day.
 *
 * Black Friday 2026. Joshua picked the dates (Nov 26 to Dec 4) and left the
 * amount to Claude: 50% off the first 12 months of Pro or Agency, monthly or
 * annual, with one code. In live Stripe that is coupon XYLnid2Q (percent_off
 * 50, duration repeating, duration_in_months 12, applies_to the four Pro and
 * Agency products, redeem_by Dec 5 04:59:59 UTC) behind promotion code
 * BLACKFRIDAY (promo_1Ug43u7OMwDowUuUMJGVIkwh), plus a `coupons` row so the
 * pricing page's code box accepts it. Checked with Stripe test clocks on
 * Nov 26: monthly bills $4 twelve times, then $8; yearly bills $40, then $80
 * at the renewal. Both the code and the banners end on their own.
 */
export const BLACK_FRIDAY = {
  code: 'BLACKFRIDAY',
  percentOff: 50,
  months: 12,
  startsAt: '2026-11-26T05:00:00Z', // midnight Eastern, Nov 26
  endsAt: '2026-12-05T04:59:59Z',   // 11:59:59 PM Eastern, Dec 4
} as const

export function isBlackFridayLive(now: Date = new Date()): boolean {
  const t = now.getTime()
  return t >= Date.parse(BLACK_FRIDAY.startsAt) && t <= Date.parse(BLACK_FRIDAY.endsAt)
}

/** A price after a percent off, as people read it: "$4", "$14.50". */
export function discountedPrice(price: number, percentOff: number): string {
  const cents = Math.round(price * (100 - percentOff))
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`
}

export const BLACK_FRIDAY_PRICES = {
  proMonthly: discountedPrice(PLAN_PRICES.pro.monthly, BLACK_FRIDAY.percentOff),
  proAnnual: discountedPrice(PLAN_PRICES.pro.annual, BLACK_FRIDAY.percentOff),
  agencyMonthly: discountedPrice(PLAN_PRICES.agency.monthly, BLACK_FRIDAY.percentOff),
  agencyAnnual: discountedPrice(PLAN_PRICES.agency.annual, BLACK_FRIDAY.percentOff),
}

/** The deal's last day as the reader's language writes it, in Eastern time ("Dec 4"). */
export function blackFridayEndLabel(bcp47: string = 'en-US'): string {
  return new Intl.DateTimeFormat(bcp47, { month: 'short', day: 'numeric', timeZone: 'America/New_York' })
    .format(new Date(BLACK_FRIDAY.endsAt))
}

/**
 * How long each percent code's discount lasts, as its Stripe coupon is set
 * up. The pricing page shows it next to "applied", so "50% off" never reads
 * as forever when it is one payment. A code missing here shows no length.
 */
export const COUPON_LENGTH: Record<string, string> = {
  [BLACK_FRIDAY.code]: `your first ${BLACK_FRIDAY.months} months`,
  BDAY31: 'your first payment',
  WELCOME50: 'your first payment',
}
