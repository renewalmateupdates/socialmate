#!/usr/bin/env node
/**
 * Keeps `npm run verify:content` at zero open findings, and pins the rule
 * fixes of Nov 27, 2026.
 *
 * The check was built on Nov 13, 2026 to catch pages that say something the
 * product does not do or charge. It was never part of `npm test` and took two
 * and a half minutes, so by Nov 27 it had 146 open findings nobody had seen:
 * two guides calling already-published guides "coming soon", an AI feature
 * described as "in build" that nobody was building, and a comparison table
 * giving the free plan all seven platforms. Most of the rest were other
 * companies' prices read as ours. Building the competitor-name patterns once,
 * instead of once per sentence, took the run to about 5 seconds, so it runs
 * here now.
 *
 *   node scripts/test-site-content.mjs
 */
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'
import { loadTs, repoRoot as root } from './lib/load-ts.mjs'
import { buildRules, checkText } from './lib/content-rules.mjs'

const rules = buildRules(loadTs(join(root, 'lib/site-facts.ts')))
const hits = (text, rule) => checkText(text, rules).filter(f => f.rule === rule).map(f => f.hit)

test('the site has no open finding and no stale allow entry', () => {
  const r = spawnSync(process.execPath, [join(root, 'scripts/verify-site-content.mjs')], { encoding: 'utf8', timeout: 120_000 })
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`
  assert.equal(r.status, 0, `npm run verify:content found something. Fix the copy, or add an entry with its reason to scripts/verify-content-allow.json:\n${out}`)
  assert.doesNotMatch(out, /allow entry no longer matches/, `An allow entry matches nothing now; remove it:\n${out}`)
})

test('a sentence naming the free plan and Pro is not read as Pro', () => {
  assert.deepEqual(hits('SocialMate is free for 250 posts a month, Pro $8, with Discord, Telegram and Mastodon.', 'plan-limit'), [])
  assert.deepEqual(hits('SocialMate is hosted and free to start: 250 posts a month on 6 platforms, Pro $8 adds X.', 'plan-limit'), [])
  // Still caught: a wrong number for either plan.
  assert.equal(hits('SocialMate is free for 100 posts a month.', 'plan-limit').length, 1)
  assert.equal(hits('Pro includes 250 posts a month.', 'plan-limit').length, 1)
})

test("a competitor's own plan is not ours", () => {
  assert.deepEqual(hits("Post Planner's free plan caps at 10 posts per month.", 'plan-limit'), [])
})

test('"not coming soon" is not a promise', () => {
  assert.deepEqual(hits('Pinterest and Reddit declined our applications, so they are not coming soon.', 'coming-soon'), [])
  assert.equal(hits('Pinterest support is coming soon.', 'coming-soon').length, 1)
})

test('a warning against "unlimited" is not the claim', () => {
  assert.deepEqual(hits('Do not describe posts, seats or connected accounts as unlimited.', 'unlimited'), [])
  assert.equal(hits('SocialMate gives you unlimited posts on every plan.', 'unlimited').length, 1)
})

test('a platform that opens after review is not claimed as live', () => {
  assert.deepEqual(hits('Instagram connections open once Meta finishes reviewing SocialMate.', 'unavailable-platform'), [])
  assert.deepEqual(hits('SocialMate is the better choice if you post beyond Instagram and want AI tools.', 'unavailable-platform'), [])
  assert.equal(hits('SocialMate posts to Instagram and TikTok.', 'unavailable-platform').length, 1)
})

test('the rules stay fast', () => {
  // A sentence naming neither SocialMate nor a competitor is the slow path: the
  // old code built and ran all ~190 competitor patterns for it, several times.
  // On Nov 27, 2026 these 2,000 lines took 2,051 ms on the old rules and 64 ms now.
  const text = Array.from({ length: 2000 }, (_, i) => `Step ${i}: the best time to post is early in the morning, when people check their phones before work, so plan the week on Sunday and keep each caption short enough to read in one glance.`).join('\n')
  const start = performance.now()
  checkText(text, rules)
  const ms = performance.now() - start
  assert.ok(ms < 700, `2,000 sentences took ${Math.round(ms)} ms. A pattern is probably being built per sentence again.`)
})
