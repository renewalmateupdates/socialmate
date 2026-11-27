#!/usr/bin/env node
/**
 * Deals and the pricing page's code box (Nov 26, 2026).
 *
 * Black Friday: BLACKFRIDAY takes 50% off the first 12 months of Pro or Agency
 * from Nov 26 to Dec 4 (Eastern). lib/promos.ts holds the dates and the math;
 * the banners hide themselves when it ends, the same moment Stripe's
 * promotion code expires.
 *
 * Two bugs found while wiring it, both in the code box:
 * - /api/stripe/checkout records a redemption when it opens Stripe's page, so
 *   backing out once burned the code ("You have already used this code").
 *   Now only a completed checkout that carried the code counts.
 * - NONPROFIT50 and STUDENT25 had no Stripe promotion code, so the box said
 *   "50% off applied" and Stripe charged the full price. Such a code is now
 *   refused with an email to write to.
 *
 *   node scripts/test-promos.mjs
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))
const ts = require('typescript')
const read = p => readFileSync(join(root, p), 'utf8')
const code = src => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

function load(path, modules = {}) {
  const { outputText } = ts.transpileModule(read(path), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  })
  const mod = { exports: {} }
  const req = id => (id in modules ? modules[id] : require(id))
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, req)
  return mod.exports
}

const plan = load('lib/plan.ts')
const promos = load('lib/promos.ts', { '@/lib/plan': plan })
const { paidWithCode, worksAtCheckout, isSchoolEmail, schoolEmailProblem } = load('lib/coupon-redemption.ts')
const { BLACK_FRIDAY, BLACK_FRIDAY_PRICES, COUPON_LENGTH, discountedPrice, isBlackFridayLive, blackFridayEndLabel } = promos

test('Black Friday runs from midnight Nov 26 to 11:59:59 PM Dec 4, Eastern', () => {
  assert.equal(isBlackFridayLive(new Date('2026-11-26T04:59:59Z')), false, '11:59 PM Nov 25 in New York')
  assert.equal(isBlackFridayLive(new Date('2026-11-26T05:00:00Z')), true, 'midnight Nov 26 in New York')
  assert.equal(isBlackFridayLive(new Date('2026-12-05T04:59:59Z')), true, '11:59:59 PM Dec 4 in New York')
  assert.equal(isBlackFridayLive(new Date('2026-12-05T05:00:00Z')), false)
  assert.equal(blackFridayEndLabel('en-US'), 'Dec 4')
})

test('the deal prices come from the plan prices, not typed by hand', () => {
  assert.equal(discountedPrice(8, 50), '$4')
  assert.equal(discountedPrice(29, 50), '$14.50')
  assert.equal(discountedPrice(80, 50), '$40')
  assert.equal(discountedPrice(290, 50), '$145')
  assert.deepEqual(BLACK_FRIDAY_PRICES, {
    proMonthly: discountedPrice(plan.PLAN_PRICES.pro.monthly, 50),
    proAnnual: discountedPrice(plan.PLAN_PRICES.pro.annual, 50),
    agencyMonthly: discountedPrice(plan.PLAN_PRICES.agency.monthly, 50),
    agencyAnnual: discountedPrice(plan.PLAN_PRICES.agency.annual, 50),
  })
  assert.equal(BLACK_FRIDAY.percentOff, 50)
  assert.equal(BLACK_FRIDAY.months, 12)
  assert.equal(COUPON_LENGTH.BLACKFRIDAY, 'your first 12 months')
  assert.equal(COUPON_LENGTH.BDAY31, 'your first payment', 'BDAY31 is a once coupon in Stripe')
})

function fakeStripe(sessions, { fail = false } = {}) {
  const calls = []
  return {
    calls,
    checkout: {
      sessions: {
        list: async params => {
          calls.push(params)
          if (fail) throw new Error('stripe down')
          return { data: sessions }
        },
      },
    },
  }
}

test('a code counts as used only after a checkout that carried it finished', async () => {
  const paid = fakeStripe([{ metadata: { coupon_code: 'blackfriday' } }])
  assert.equal(await paidWithCode(paid, 'a@example.com', 'BLACKFRIDAY'), true)
  assert.deepEqual(paid.calls[0], { customer_details: { email: 'a@example.com' }, status: 'complete', limit: 100 })

  const other = fakeStripe([{ metadata: { coupon_code: 'BDAY31' } }, { metadata: {} }])
  assert.equal(await paidWithCode(other, 'a@example.com', 'BLACKFRIDAY'), false, 'a different code, or none')
  assert.equal(await paidWithCode(fakeStripe([]), 'a@example.com', 'BLACKFRIDAY'), false, 'backed out: no finished checkout')

  assert.equal(await paidWithCode(fakeStripe([], { fail: true }), 'a@example.com', 'X'), true, 'Stripe down: keep refusing, as before')
  assert.equal(await paidWithCode(fakeStripe([]), null, 'X'), true, 'no email to check: keep refusing')
})

test('a percent or fixed code needs a Stripe promotion code behind it', () => {
  assert.equal(worksAtCheckout({ discount_type: 'percent', stripe_promo_id: null }), false, 'NONPROFIT50 and STUDENT25 on Nov 26')
  assert.equal(worksAtCheckout({ discount_type: 'fixed', stripe_promo_id: null }), false)
  assert.equal(worksAtCheckout({ discount_type: 'percent', stripe_promo_id: 'promo_1' }), true)
  assert.equal(worksAtCheckout({ discount_type: 'trial_extension', stripe_promo_id: null }), true, 'trial days need no promotion code')
})

test('STUDENT25 needs a school email; NONPROFIT50 stays on the honor system', () => {
  // Joshua, Nov 27, 2026: "students should verify with a .edu email".
  for (const ok of ['sam@school.edu', 'Sam@MAIL.STATE.EDU', 'a@uni.edu.au', 'b@ox.ac.uk', 'c@u-tokyo.ac.jp', ' d@college.edu ']) {
    assert.equal(isSchoolEmail(ok), true, ok)
  }
  for (const no of ['sam@gmail.com', 'edu@gmail.com', 'a@myedu.com', 'b@school.education', 'c@edu.com', 'd@site.ac', '', null, undefined, 'not-an-email']) {
    assert.equal(isSchoolEmail(no), false, String(no))
  }
  assert.equal(schoolEmailProblem('STUDENT25', 'sam@school.edu'), null)
  assert.equal(schoolEmailProblem(' student25 ', 'sam@school.edu'), null, 'any case, any spaces')
  assert.match(schoolEmailProblem('STUDENT25', 'sam@gmail.com'), /school email/)
  assert.match(schoolEmailProblem('STUDENT25', null), /Sign in with your school email/)
  assert.equal(schoolEmailProblem('NONPROFIT50', 'org@gmail.com'), null, 'honor system')
  assert.equal(schoolEmailProblem('BLACKFRIDAY', null), null)
})

test('both routes apply the same three rules', () => {
  const validate = code(read('app/api/coupons/validate/route.ts'))
  assert.match(validate, /worksAtCheckout\(coupon\)/)
  assert.ok(validate.indexOf('worksAtCheckout(coupon)') < validate.indexOf('valid: true'), 'before saying valid')
  assert.match(validate, /prior\?\.length && await paidWithCode\(/)
  assert.match(validate, /schoolEmailProblem\(coupon\.code, user\?\.email\)/)
  assert.ok(validate.indexOf('schoolEmailProblem(') < validate.indexOf('valid: true'), 'school email checked before saying valid')

  const checkout = code(read('app/api/stripe/checkout/route.ts'))
  assert.match(checkout, /schoolEmailProblem\(found\.code, user\.email\)/, 'a request that skips the code box is checked too')
  assert.ok(checkout.indexOf('schoolEmailProblem(') < checkout.indexOf('checkout.sessions.create('), 'before Stripe is asked')
  assert.match(checkout, /worksAtCheckout\(found\)/)
  assert.match(checkout, /alreadyRecorded && await paidWithCode\(/)
  assert.ok(checkout.indexOf('worksAtCheckout(found)') < checkout.indexOf('checkout.sessions.create('), 'before Stripe is asked')
  assert.match(checkout, /if \(!alreadyRecorded\) \{[\s\S]*?from\('coupon_redemptions'\)\.insert/, 'one redemption row per person')
  assert.doesNotMatch(checkout, /\.ilike\('code'[^)]*\)\s*\.single\(\)/, 'a missing code is not an error')
})

test('the pricing page shows the deal only while it runs, and takes a code from a link', () => {
  const pricing = code(read('app/pricing/page.tsx'))
  assert.match(pricing, /setBfLive\(isBlackFridayLive\(\)\)/, 'decided in the browser, not at build time')
  assert.match(pricing, /\{bfLive && \(/)
  assert.match(pricing, /showWelcomeOffer && !bfLive/, 'the welcome offer steps aside')
  assert.match(pricing, /if \(bfLive\) return null/, 'so does the birthday deal')
  assert.match(pricing, /new URLSearchParams\(window\.location\.search\)\.get\('code'\)/)
  assert.doesNotMatch(pricing, /useSearchParams/, 'the hook would send the page as a spinner')
  assert.doesNotMatch(pricing, /31% off any plan/, 'BDAY31 is one payment, not every payment')
})

test('the Dashboard offers the deal to Free and lists only platforms that are coming', () => {
  const dash = code(read('app/dashboard/page.tsx'))
  assert.match(dash, /<BlackFridayBanner plan=\{plan\} \/>/)
  const soon = dash.match(/const COMING_SOON_PLATFORMS = \[([^\]]*)\]/)
  assert.ok(soon, 'one list of coming platforms')
  assert.doesNotMatch(soon[1], /pinterest|reddit/, 'both declined')
  const banner = code(read('components/BlackFridayBanner.tsx'))
  assert.match(banner, /plan !== 'free' \|\| !isBlackFridayLive\(\)/)
  assert.match(banner, /\/pricing\?code=\$\{BLACK_FRIDAY\.code\}/)
})

test('TikTok Studio offers the deal after a post, never under a rejection', () => {
  // TikTok creators are most of the people who publish, and they rarely open
  // the Dashboard, so the deal also shows on Studio's screen after a post.
  const studio = code(read('app/tiktok/studio/TikTokStudioClient.tsx'))
  assert.match(studio, /<BlackFridayBanner plan=\{plan\} from="tiktok_studio" \/>/)
  assert.match(studio, /publishState !== 'rejected' && \(\s*<div data-theme="dark"/, 'dark, like the rest of Studio')
  const banner = code(read('components/BlackFridayBanner.tsx'))
  assert.match(banner, /track\('promo_clicked', \{ code: BLACK_FRIDAY\.code, from \}\)/, 'says where it was clicked')
})

test('every language has the deal strings', () => {
  const en = Object.keys(JSON.parse(read('messages/en.json')).promo).sort()
  for (const locale of ['de', 'es', 'fr', 'ja', 'ko', 'pt', 'ru', 'zh']) {
    const promo = JSON.parse(read(`messages/${locale}.json`)).promo
    assert.deepEqual(Object.keys(promo ?? {}).sort(), en, `${locale}.json promo keys`)
    for (const [k, v] of Object.entries(promo)) {
      for (const p of (JSON.parse(read('messages/en.json')).promo[k].match(/\{\w+\}/g) ?? [])) {
        assert.ok(v.includes(p), `${locale}.promo.${k} keeps ${p}`)
      }
    }
  }
})

test('the nonprofit price is worked out from the Pro price', () => {
  const page = read('app/for/nonprofits/page.tsx')
  assert.doesNotMatch(page, /\$2\.50/, 'half of the old $5 price')
  assert.match(page, /discountedPrice\(PLAN_PRICES\.pro\.monthly, 50\)/)
})
