#!/usr/bin/env node
/**
 * Tests for lib/emails/product-update-nov2026.ts: who gets the November update
 * email and what it says.
 *
 *   node scripts/test-product-update-email.mjs
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

// Loads lib/*.ts as the app would, resolving '@/lib/x' to the real lib/x.ts.
const cache = new Map()
function load(rel) {
  if (cache.has(rel)) return cache.get(rel).exports
  const source = readFileSync(join(root, rel), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES5 },
  })
  const mod = { exports: {} }
  cache.set(rel, mod)
  const localRequire = (id) => {
    if (id === '@/lib/supabase-admin') return { getSupabaseAdmin: () => { throw new Error('no db in tests') } }
    if (id.startsWith('@/lib/')) return load(`lib/${id.slice('@/lib/'.length)}.ts`)
    return require(id)
  }
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, localRequire)
  return mod.exports
}

const { updateAudience, updateEmailHtml, UPDATE_SUBJECT, UPDATE_EVENT, UNSUBSCRIBED_EVENT } =
  load('lib/emails/product-update-nov2026.ts')
const { PLAN_POST_LIMITS, PLAN_AI_CREDITS, PLAN_PRICES } = load('lib/plan.ts')
const { INTERNAL_EMAILS } = load('lib/internal-accounts.ts')

const CONFIRMED = '2026-06-01T00:00:00Z'
const user = (id, email, fullName, confirmed = CONFIRMED) =>
  ({ id, email, email_confirmed_at: confirmed, user_metadata: fullName ? { full_name: fullName } : {} })

const USERS = [
  user('a', 'ann@example.com', 'Ann Lee'),         // gets it
  user('b', 'bo@example.com'),                      // gets it, no name
  user('c', 'cy@example.com', 'Cy', null),          // never confirmed their email
  user('d', 'di@example.com', 'Di'),                // replied "unsubscribe" to an earlier note
  user('e', 'ed@example.com', 'Ed'),                // already got this email
  user('f', INTERNAL_EMAILS[0], 'Us'),              // our own account
  user('g', null, 'No Email'),                      // no address
  user('h', 'hal@example.com', 'Hal'),              // unticked the newsletter (iris_opt_in false)
]
const INPUT = { users: USERS, alreadySentIds: ['e'], unsubscribedIds: ['d'], optedOutIds: ['h'] }

test('only confirmed outside accounts that were not sent, did not unsubscribe and want the newsletter', () => {
  const { targets, signups, alreadySent, unsubscribed, optedOut, unconfirmed } = updateAudience(INPUT)
  assert.deepEqual(targets.map(t => t.id), ['a', 'b'])
  assert.equal(signups, 6, 'every outside account with an email counts as a signup')
  assert.equal(alreadySent, 1)
  assert.equal(unsubscribed, 1)
  assert.equal(optedOut, 1)
  assert.equal(unconfirmed, 1)
})

test('a newsletter opt-out gets nothing, even confirmed and never sent; unsubscribed counts first', () => {
  const both = updateAudience({ ...INPUT, optedOutIds: ['d', 'h'] })
  assert.deepEqual(both.targets.map(t => t.id), ['a', 'b'])
  assert.equal(both.unsubscribed, 1, "'d' unsubscribed and opted out: counted once, as unsubscribed")
  assert.equal(both.optedOut, 1)
  // Without the opt-out, 'h' is an ordinary target.
  assert.deepEqual(updateAudience({ ...INPUT, optedOutIds: [] }).targets.map(t => t.id), ['a', 'b', 'h'])
})

test('reviewer test logins (META_REVIEWER_EMAILS, YOUTUBE_REVIEWER_EMAILS) are ours, not signups', () => {
  const saved = { meta: process.env.META_REVIEWER_EMAILS, yt: process.env.YOUTUBE_REVIEWER_EMAILS }
  try {
    process.env.META_REVIEWER_EMAILS = ' Reviewer@Example.com , other@example.com'
    process.env.YOUTUBE_REVIEWER_EMAILS = 'yt-review@example.com'
    const users = [...USERS, user('r', 'reviewer@example.com', 'Meta Reviewer'), user('y', 'YT-Review@Example.com', 'Google Reviewer')]
    const { targets, signups } = updateAudience({ ...INPUT, users })
    assert.deepEqual(targets.map(t => t.id), ['a', 'b'])
    assert.equal(signups, 6, 'neither reviewer login counts as a signup')
  } finally {
    for (const [name, value] of [['META_REVIEWER_EMAILS', saved.meta], ['YOUTUBE_REVIEWER_EMAILS', saved.yt]]) {
      if (value === undefined) delete process.env[name]
      else process.env[name] = value
    }
  }
})

test('an unsubscribe wins even over an unconfirmed or already-sent account', () => {
  // 'd' is no longer in the unsubscribed list here, so it gets the email.
  const { targets, unsubscribed } = updateAudience({ ...INPUT, unsubscribedIds: ['a', 'c', 'e'] })
  assert.deepEqual(targets.map(t => t.id), ['b', 'd'])
  assert.equal(unsubscribed, 3)
})

test('first name only, blank when unknown or not a string', () => {
  const { targets } = updateAudience(INPUT)
  assert.deepEqual(targets[0], { id: 'a', email: 'ann@example.com', name: 'Ann' })
  assert.equal(targets[1].name, '')
  const odd = updateAudience({
    ...INPUT,
    users: [{ id: 'z', email: 'z@example.com', email_confirmed_at: CONFIRMED, user_metadata: { full_name: 42 } }],
  })
  assert.equal(odd.targets[0].name, '')
})

test('the email: headline, numbers from lib/plan.ts, links, the question', () => {
  const html = updateEmailHtml('Ann', 267, 'https://socialmate.studio')
  assert.match(html, /Ann, here's where SocialMate stands\./)
  assert.match(html, /267 people have signed up so far/)
  assert.ok(html.includes(`${PLAN_POST_LIMITS.free} posts and ${PLAN_AI_CREDITS.free} AI credits a month`))
  assert.ok(html.includes(`Pro is $${PLAN_PRICES.pro.monthly} a month`))
  assert.match(html, /href="https:\/\/socialmate\.studio\/#demo"/)
  assert.match(html, /href="https:\/\/socialmate\.studio\/dashboard"/)
  assert.match(html, /what's the one thing stopping you from using SocialMate every week\?/)
  assert.match(html, /Reply "unsubscribe"/)
  // The question comes after the "What changed" panel and before the button.
  assert.ok(html.indexOf('What changed') < html.indexOf('one thing stopping you'))
  assert.ok(html.indexOf('one thing stopping you') < html.indexOf('Open SocialMate'))
  const noName = updateEmailHtml('', 267, 'https://socialmate.studio')
  assert.match(noName, />Here's where SocialMate stands\./)
})

test('a name cannot inject HTML', () => {
  const html = updateEmailHtml('<b>x</b>', 1, 'https://socialmate.studio')
  assert.doesNotMatch(html, /<b>x<\/b>/)
  assert.match(html, /&lt;b&gt;x&lt;\/b&gt;/)
})

test('no em dashes, and no "unlimited" in any form', () => {
  const text = updateEmailHtml('Ann', 267, 'https://socialmate.studio') + UPDATE_SUBJECT
  assert.doesNotMatch(text, /—/)
  assert.doesNotMatch(text, /unlimited|no (post )?caps?\b|no limits/i)
})

test('the two events are distinct, so unsubscribing is never mistaken for a send', () => {
  assert.notEqual(UPDATE_EVENT, UNSUBSCRIBED_EVENT)
})
