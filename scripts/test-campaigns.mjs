#!/usr/bin/env node
/**
 * Tests for lib/campaigns.ts: campaign slots, time zones, rotation,
 * validation, AI rewrite checks and the Shopify import.
 *
 *   node scripts/test-campaigns.mjs
 *
 * Loads the TypeScript module through the project's own `typescript` package,
 * so it needs no test framework.
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
const source = readFileSync(join(root, 'lib/campaigns.ts'), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const {
  zonedTimeToUtc, localDayKey, campaignSlots, pickContent, postsPerWeek, validateCampaign,
  acceptRewrite, charLimitFor, normalizeStoreUrl, parseShopifyProducts, productMessage,
  linkTargets, shortLinkUrl, withTrackedLinks, campaignClicks,
} = mod.exports

const NY = 'America/New_York'

test('a wall-clock time becomes the right instant, either side of daylight saving', () => {
  // US daylight saving ends at 2 AM on Sunday, Nov 1, 2026.
  assert.equal(zonedTimeToUtc('2026-10-30', '10:00', NY).toISOString(), '2026-10-30T14:00:00.000Z')
  assert.equal(zonedTimeToUtc('2026-11-02', '10:00', NY).toISOString(), '2026-11-02T15:00:00.000Z')
  assert.equal(zonedTimeToUtc('2026-07-01', '09:30', 'Asia/Kolkata').toISOString(), '2026-07-01T04:00:00.000Z')
  assert.equal(zonedTimeToUtc('2026-07-01', '23:45', 'UTC').toISOString(), '2026-07-01T23:45:00.000Z')
})

test('the local calendar day depends on the time zone', () => {
  const at = new Date('2026-10-27T03:00:00Z')
  assert.equal(localDayKey(at, NY), '2026-10-26')
  assert.equal(localDayKey(at, 'UTC'), '2026-10-27')
})

const schedule = {
  days: [1, 3, 5],            // Mon, Wed, Fri
  times: ['10:00', '18:00'],
  timezone: NY,
  start_date: '2026-10-26',   // a Monday
  end_date: '2026-11-08',
}

test('slots land only on the chosen days and times, in order', () => {
  const all = campaignSlots(schedule, new Date(0), new Date('2030-01-01'))
  assert.equal(all.length, 12) // 2 weeks x 3 days x 2 times
  assert.deepEqual(all.map(s => s.ordinal), [...Array(12).keys()])
  for (const s of all) {
    const day = localDayKey(s.at, NY)
    const wd = new Date(day + 'T12:00:00Z').getUTCDay()
    assert.ok([1, 3, 5].includes(wd), `${day} is not Mon/Wed/Fri`)
  }
  assert.equal(all[0].at.toISOString(), '2026-10-26T14:00:00.000Z')
  // After the Nov 1 change, 10 AM is 15:00 UTC.
  assert.equal(all[6].at.toISOString(), '2026-11-02T15:00:00.000Z')
})

test('a window returns the same ordinals the full run would, so rotation is stable week to week', () => {
  const all = campaignSlots(schedule, new Date(0), new Date('2030-01-01'))
  const week2 = campaignSlots(schedule, new Date('2026-11-01T00:00:00Z'), new Date('2026-11-08T23:59:00Z'))
  assert.deepEqual(week2.map(s => s.ordinal), all.slice(6).map(s => s.ordinal))
  assert.deepEqual(week2.map(s => s.at.toISOString()), all.slice(6).map(s => s.at.toISOString()))
})

test('the window is exclusive at the start and inclusive at the end', () => {
  const first = new Date('2026-10-26T14:00:00Z')
  assert.equal(campaignSlots(schedule, first, first).length, 0)
  assert.equal(campaignSlots(schedule, new Date(first.getTime() - 1), first).length, 1)
})

test('messages take turns, then each comes back as its next version', () => {
  const messages = [
    { text: 'A', variants: ['A1', 'A2'] },
    { text: 'B', variants: ['B1'] },
  ]
  const texts = [0, 1, 2, 3, 4, 5, 6].map(o => pickContent(messages, o).text)
  assert.deepEqual(texts, ['A', 'B', 'A1', 'B1', 'A2', 'B', 'A'])
  assert.equal(pickContent([{ text: 'x', image_url: 'https://i.example/x.png' }], 4).imageUrl, 'https://i.example/x.png')
})

test('posts per week is days times times', () => {
  assert.equal(postsPerWeek(schedule), 6)
})

const good = {
  name: 'Shop launch',
  platforms: ['bluesky', 'discord'],
  days: [1, 3, 5],
  times: ['18:00', '10:00'],
  timezone: NY,
  start_date: '2026-10-27',
  end_date: '2026-12-01',
  messages: [{ text: '  Hello world  ' }, { text: '' }, { text: 'Second', image_url: 'javascript:alert(1)' }],
}
const ctx = { today: '2026-10-27', paidPlan: false, connected: ['bluesky', 'discord', 'twitter'] }

test('a good campaign comes back clean', () => {
  const r = validateCampaign(good, ctx)
  assert.equal(r.ok, true)
  assert.deepEqual(r.value.times, ['10:00', '18:00'])
  assert.deepEqual(r.value.messages, [{ text: 'Hello world', image_url: null }, { text: 'Second', image_url: null }])
})

test('validation refuses what the app cannot do', () => {
  const bad = (patch, c = ctx) => validateCampaign({ ...good, ...patch }, c)
  assert.match(bad({ name: ' ' }).error, /name/)
  assert.match(bad({ platforms: ['tiktok'] }).error, /can't post to tiktok/)
  assert.match(bad({ platforms: ['mastodon'] }).error, /Connect mastodon/)
  assert.match(bad({ platforms: ['twitter'] }).error, /Pro plan/)
  assert.equal(bad({ platforms: ['twitter'] }, { ...ctx, paidPlan: true }).ok, true)
  assert.match(bad({ days: [] }).error, /day of the week/)
  assert.match(bad({ days: [7, -1] }).error, /day of the week/)
  assert.match(bad({ times: ['25:00'] }).error, /time of day/)
  assert.match(bad({ times: ['08:00', '09:00', '10:00', '11:00', '12:00'] }).error, /up to 4/)
  assert.match(bad({ timezone: 'Mars/Olympus' }).error, /time zone/)
  assert.match(bad({ start_date: '2026-10-20' }).error, /past/)
  assert.match(bad({ end_date: '2026-10-26' }).error, /before the start/)
  assert.match(bad({ end_date: '2027-06-01' }).error, /26 weeks/)
  assert.match(bad({ start_date: '2026-02-30' }).error, /start date/)
  assert.match(bad({ messages: [{ text: '  ' }] }).error, /at least one message/)
  assert.match(bad({ messages: [{ text: 'x'.repeat(2001) }] }).error, /2000/)
})

test('a rewrite keeps every link and price, adds none, and fits the platform', () => {
  const original = 'The 2027 Planner, $9\n\nhttps://shop.example.com/products/planner'
  assert.equal(
    acceptRewrite(original, 'Plan your year for $9: https://shop.example.com/products/planner', 300),
    'Plan your year for $9: https://shop.example.com/products/planner',
  )
  assert.equal(acceptRewrite(original, 'Plan your year for $7: https://shop.example.com/products/planner', 300), null, 'changed price')
  assert.equal(acceptRewrite(original, 'Plan your year for $9 at our shop', 300), null, 'dropped link')
  assert.equal(acceptRewrite(original, 'For $9: https://shop.example.com/products/planner https://evil.example', 300), null, 'added link')
  assert.equal(acceptRewrite(original, 'For $9 https://shop.example.com/products/planner ' + 'x'.repeat(300), 300), null, 'too long')
  assert.equal(acceptRewrite(original, original, 300), null, 'same as the original')
  assert.equal(acceptRewrite(original, 42, 300), null)
})

test('the character limit is the shortest platform', () => {
  assert.equal(charLimitFor(['linkedin', 'bluesky', 'discord']), 300)
  assert.equal(charLimitFor(['twitter', 'bluesky']), 280)
})

test('store links normalize to the store origin', () => {
  assert.equal(normalizeStoreUrl('shop.gilgameshenterprise.com'), 'https://shop.gilgameshenterprise.com')
  assert.equal(normalizeStoreUrl('https://Shop.Example.com/products/x?y=1'), 'https://shop.example.com')
  assert.equal(normalizeStoreUrl('not a store'), null)
  assert.equal(normalizeStoreUrl('ftp://x.com'), null)
  assert.equal(normalizeStoreUrl(''), null)
})

test('the Shopify import keeps only products someone can buy', () => {
  const body = {
    products: [
      { title: 'Complete Edition', handle: 'complete', variants: [{ price: '19.00', available: true }], images: [{ src: 'https://cdn.shopify.com/s/files/a.png?v=1' }] },
      { title: 'Complete Edition', handle: 'complete-1', variants: [{ price: '0.00', available: false }], images: [] },
      { title: 'Sold out', handle: 'gone', variants: [{ price: '5.00', available: false }] },
      { title: 'Planner', handle: 'planner', variants: [{ price: '9.50', available: true }] },
      { handle: 'no-title', variants: [{ price: '1.00' }] },
    ],
  }
  const products = parseShopifyProducts(body, 'https://shop.example.com')
  assert.deepEqual(products.map(p => p.url), ['https://shop.example.com/products/complete', 'https://shop.example.com/products/planner'])
  assert.equal(products[0].price, '$19')
  assert.equal(products[1].price, '$9.50')
  assert.equal(products[0].image_url, 'https://cdn.shopify.com/s/files/a.png?v=1&width=800')
  assert.equal(products[1].image_url, null)
  assert.equal(productMessage(products[0]), 'Complete Edition, $19\n\nhttps://shop.example.com/products/complete')
  assert.deepEqual(parseShopifyProducts({ nope: true }, 'https://x.com'), [])
})

// ── Link tracking (campaign mode phase 2) ────────────────────────────────────

const APP = 'https://socialmate.studio'

test('the links in a message and its versions, once each, without trailing punctuation', () => {
  assert.deepEqual(
    linkTargets(['Grab it: https://shop.com/a. Or https://shop.com/b!', 'New version https://shop.com/a']),
    ['https://shop.com/a', 'https://shop.com/b'],
  )
  assert.deepEqual(linkTargets(['no links here']), [])
})

test('tracked links are swapped for short links, punctuation kept', () => {
  const links = [{ url: 'https://shop.com/a', slug: 'abc1234' }]
  assert.equal(shortLinkUrl(APP + '/', 'abc1234'), 'https://socialmate.studio/go/abc1234')
  assert.equal(
    withTrackedLinks('Grab it: https://shop.com/a. Now', links, APP, 500),
    'Grab it: https://socialmate.studio/go/abc1234. Now',
  )
  // An untracked link stays as written.
  assert.equal(withTrackedLinks('https://other.com', links, APP, 500), 'https://other.com')
  assert.equal(withTrackedLinks('https://shop.com/a', undefined, APP, 500), 'https://shop.com/a')
})

test('a short link is never matched again, even for a socialmate.studio link', () => {
  const links = [
    { url: 'https://socialmate.studio', slug: 'home123' },
    { url: 'https://socialmate.studio/pricing', slug: 'price12' },
  ]
  assert.equal(
    withTrackedLinks('https://socialmate.studio and https://socialmate.studio/pricing', links, APP, 500),
    'https://socialmate.studio/go/home123 and https://socialmate.studio/go/price12',
  )
})

test('if the short link would push a post over the limit, the text goes out as written', () => {
  const links = [{ url: 'https://x.co/a', slug: 'abc1234' }]
  const text = 'y'.repeat(270) + ' https://x.co/a'
  assert.equal(withTrackedLinks(text, links, APP, 280), text)
})

test('clicks per message and in total', () => {
  const messages = [
    { text: 'a', links: [{ url: 'https://a.com', slug: 's1' }, { url: 'https://b.com', slug: 's2' }] },
    { text: 'no link' },
    { text: 'c', links: [{ url: 'https://c.com', slug: 's3' }] },
  ]
  assert.deepEqual(
    campaignClicks(messages, [{ slug: 's1', clicks: 4 }, { slug: 's2', clicks: 1 }, { slug: 's3', clicks: null }]),
    { total: 5, byMessage: [5, 0, 0], tracked: true },
  )
  assert.deepEqual(campaignClicks([{ text: 'x' }], []), { total: 0, byMessage: [0], tracked: false })
})

test('AI versions are still checked against the links as written', () => {
  // Tracking swaps links only when a post is made, so the rewrite check
  // compares versions with the message's own links, as before.
  assert.equal(acceptRewrite('Buy https://shop.com/a now', 'Get it today: https://shop.com/a', 280), 'Get it today: https://shop.com/a')
})
