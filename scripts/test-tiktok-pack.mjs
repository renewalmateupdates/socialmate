#!/usr/bin/env node
/**
 * Tests for the TikTok pack (lib/tiktok-pack.ts) and the routes that use it.
 *
 * TikTok stays free (Joshua, Nov 28, 2026: "I dont want to make tiktok a pro
 * feature"). Post now is never refused at the month's count; a one-time pack
 * extends scheduling past it. Before this, /api/tiktok/post added
 * workspaces.tiktok_booster_credits to the month's allowance and never took
 * anything from it, so any credit there would have been a free raise every
 * month, and nothing sold credits at all.
 *
 *   node scripts/test-tiktok-pack.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'
import { loadTs, repoRoot as root } from './lib/load-ts.mjs'

// Line endings normalized: a Windows checkout has CRLF.
const read = p => readFileSync(join(root, p), 'utf8').replace(/\r\n/g, '\n')
const pack = loadTs(join(root, 'lib/tiktok-pack.ts'))
const {
  TIKTOK_PACK, TIKTOK_PACK_PRICE, TIKTOK_PACK_TYPE,
  tiktokAllowance, usedThisMonth, packVideosFromMetadata, packOfferMessage,
} = pack

test('the month is used before the pack', () => {
  assert.deepEqual(tiktokAllowance(20, 5, 0), { allowed: true, usesPack: false, monthLeft: 15 })
  assert.deepEqual(tiktokAllowance(20, 19, 3), { allowed: true, usesPack: false, monthLeft: 1 })
  assert.deepEqual(tiktokAllowance(20, 20, 3), { allowed: true, usesPack: true, monthLeft: 0 })
  assert.deepEqual(tiktokAllowance(60, 0, 0), { allowed: true, usesPack: false, monthLeft: 60 })
})

test('with the month and the pack used up, scheduling is refused', () => {
  assert.deepEqual(tiktokAllowance(20, 20, 0), { allowed: false, usesPack: false, monthLeft: 0 })
  // Post now is never refused, so the count can pass the month's videos.
  assert.deepEqual(tiktokAllowance(20, 27, 0), { allowed: false, usesPack: false, monthLeft: 0 })
  assert.deepEqual(tiktokAllowance(20, 27, 1), { allowed: true, usesPack: true, monthLeft: 0 })
})

test('a bad count never turns into extra videos', () => {
  assert.equal(tiktokAllowance(20, -5, 0).monthLeft, 20)
  assert.equal(tiktokAllowance(20, 20, -3).allowed, false)
})

test("the month's count is 0 once the month has changed", () => {
  const now = new Date('2026-11-28T15:00:00Z')
  assert.equal(usedThisMonth(17, '2026-11-01', now), 17)
  assert.equal(usedThisMonth(17, '2026-10-01', now), 0)
  assert.equal(usedThisMonth(17, '2025-11-01', now), 0)
  assert.equal(usedThisMonth(17, null, now), 0)
  assert.equal(usedThisMonth(null, '2026-11-01', now), 0)
  assert.equal(usedThisMonth(-2, '2026-11-01', now), 0)
})

test('the webhook credits only what a TikTok pack session paid for', () => {
  assert.equal(packVideosFromMetadata({ type: 'tiktok_pack', user_id: 'u', videos: '20' }), 20)
  assert.equal(packVideosFromMetadata({ type: 'tiktok_pack', videos: '40' }), 40)
  for (const videos of ['', 'abc', '0', '-5', '2.5', '100000', undefined]) {
    assert.equal(packVideosFromMetadata({ type: 'tiktok_pack', videos }), null, `videos=${videos}`)
  }
  assert.equal(packVideosFromMetadata({ type: 'twitter_booster', videos: '20' }), null)
  assert.equal(packVideosFromMetadata(null), null)
  assert.equal(packVideosFromMetadata(undefined), null)
  assert.equal(TIKTOK_PACK_TYPE, 'tiktok_pack')
})

test('one price, one constant', () => {
  assert.equal(TIKTOK_PACK_PRICE, `$${(TIKTOK_PACK.priceCents / 100).toFixed(2)}`)
  assert.ok(Number.isInteger(TIKTOK_PACK.priceCents) && TIKTOK_PACK.priceCents > 0)
  assert.ok(Number.isInteger(TIKTOK_PACK.videos) && TIKTOK_PACK.videos > 0)

  const { ADDONS } = loadTs(join(root, 'lib/site-facts.ts'))
  assert.deepEqual(ADDONS.tiktokPack, { videos: TIKTOK_PACK.videos, price: TIKTOK_PACK.priceCents / 100 })

  // Checkout builds its price from the constant; nothing types the number.
  const route = read('app/api/tiktok/pack/route.ts')
  assert.match(route, /unit_amount:\s*TIKTOK_PACK\.priceCents/)
  assert.match(route, /type:\s*TIKTOK_PACK_TYPE/)
  assert.match(route, /videos:\s*String\(TIKTOK_PACK\.videos\)/)
  for (const p of ['app/api/tiktok/pack/route.ts', 'app/tiktok/studio/TikTokStudioClient.tsx', 'app/faq/page.tsx', 'app/pricing/page.tsx']) {
    const src = read(p)
    const packLines = src.split('\n').filter(l => /tiktok pack|TIKTOK_PACK/i.test(l))
    for (const line of packLines) assert.doesNotMatch(line, /\$1\.99|\b199\b/, `${p} types the pack price: ${line.trim()}`)
  }
})

test('the refusal names the way through, and says Post now still works', () => {
  const msg = packOfferMessage(20, 'Free')
  assert.match(msg, /20 TikTok videos on the Free plan/)
  assert.match(msg, /Post now still works/)
  assert.ok(msg.includes(`${TIKTOK_PACK.videos} scheduled videos for ${TIKTOK_PACK_PRICE}`))
  assert.doesNotMatch(msg, /unlimited|no limit/i)
})

test('/api/tiktok/post uses the allowance and takes the pack video before saving', () => {
  const src = read('app/api/tiktok/post/route.ts')
  assert.match(src, /PLAN_TIKTOK_VIDEOS/, 'reads the plan numbers from lib/plan.ts')
  assert.doesNotMatch(src, /PLAN_TIKTOK_QUOTA/, 'no second copy of the plan numbers')
  assert.doesNotMatch(src, /\+\s*boosterCredits/, 'the pack is not added to the month')
  assert.match(src, /tiktokAllowance\(quota, videosThisMonth, packVideos\)/)

  const take = src.indexOf('takePackVideo(')
  const insert = src.search(/\.from\('tiktok_posts'\)\s*\.insert\(/)
  assert.ok(take > 0 && insert > take, 'the pack video is taken before the post row is saved')

  assert.match(src, /\.\.\.\(allowance\.usesPack && \{ used_pack_video: true \}\)/,
    'the new column is named only for a video that uses a pack')
  // Saving fails, the token is gone, TikTok refuses: each gives the video back.
  assert.ok((src.match(/if \(allowance\.usesPack\) await givePackVideoBack\(/g) ?? []).length >= 3)
  // A pack video never counts against the month.
  assert.ok((src.match(/if \(!allowance\.usesPack\) \{/g) ?? []).length >= 2)
})

test('cancelling gives back what the video took', () => {
  const src = read('app/api/tiktok/scheduled/[id]/route.ts')
  assert.match(src, /\.from\('tiktok_posts'\)\s*\.select\('\*'\)/, "reads with '*', so it works before the column exists")
  assert.match(src, /if \(row\.used_pack_video === true\) \{\s*await givePackVideoBack\(/)
})

test('Studio checks before uploading and opens checkout without losing the video', () => {
  const src = read('app/tiktok/studio/TikTokStudioClient.tsx')
  const check = src.indexOf("stage = 'room'")
  const upload = src.indexOf("stage = 'stage_upload'")
  assert.ok(check > 0 && upload > check, 'the count is checked before the video uploads')
  assert.match(src, /postRemedy === 'tiktok_pack' && \(/)
  assert.match(src, /if \(scheduleData\.quota_exhausted\) setPostRemedy\('tiktok_pack'\)/)

  const open = src.indexOf("window.open('', '_blank')")
  const post = src.indexOf("fetch('/api/tiktok/pack', { method: 'POST' })")
  assert.ok(open > 0 && post > open, 'the checkout tab opens inside the press, before any await')
  assert.doesNotMatch(src, /useSearchParams\(\)[^\n]*pack/, 'the return is read from window.location')
})

test('the webhook credits a paid TikTok pack once, before the subscription branch', () => {
  const src = read('app/api/stripe/webhook/route.ts')
  const start = src.indexOf('if (type === TIKTOK_PACK_TYPE && userId) {')
  const subscription = src.indexOf('// ── Base plan subscription via checkout ──')
  assert.ok(start > 0 && subscription > start, 'handled before the subscription branch returns early')
  const block = src.slice(start, subscription)
  assert.match(block, /packVideosFromMetadata\(session\.metadata\)/, 'credits the size the session bought')
  assert.match(block, /session\.payment_status !== 'paid'/, 'credits a paid session only')
  assert.match(block, /\.from\('processed_events'\)\s*\.select\('id'\)/, 'once per payment')
  assert.match(block, /tiktok_booster_credits: \(ws\.tiktok_booster_credits \?\? 0\) \+ videos/)
  // Marked processed only after the videos are added, so Stripe's retry of a
  // failed write still credits it.
  const add = block.indexOf('tiktok_booster_credits: (ws.tiktok_booster_credits')
  const mark = block.indexOf('.insert({ event_id: eventKey')
  assert.ok(add > 0 && mark > add)
  assert.match(block, /status: 500/)
})

test('a refused scheduled send gives back what the video took', () => {
  const src = read('lib/inngest.ts')
  const i = src.indexOf('sentRow?.used_pack_video === true')
  assert.ok(i > 0, 'the failure step checks for a pack video')
  assert.match(src.slice(i - 700, i), /\.from\('tiktok_posts'\)\s*\.select\('\*'\)\s*\.eq\('id', post\.id\)/,
    "read with '*', not the publisher's column list")
  assert.match(src.slice(i, i + 200), /givePackVideoBack\(db, post\.user_id, 'tiktok-scheduled'\)/)
})

test('the click is a recorded funnel step', () => {
  assert.match(read('lib/analytics.ts'), /'tiktok_pack_clicked'/)
})

test('the SQL adds the column with a default', () => {
  assert.match(read('supabase/tiktok_pack_nov28.sql'),
    /ALTER TABLE tiktok_posts\s+ADD COLUMN IF NOT EXISTS used_pack_video boolean NOT NULL DEFAULT false/)
})
