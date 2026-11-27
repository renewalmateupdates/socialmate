#!/usr/bin/env node
/**
 * Tests for lib/oauth-state.ts: telling a repeat hit on a connect callback from
 * a real failure, and the LinkedIn and X callbacks that use it.
 *
 * Since Oct 1, 2026 four people saw LinkedIn's "invalid state" error and all
 * four were connected: the errors came 3 to 4 minutes after a connect that
 * worked (one person three times), when the one-time state cookie was already
 * spent. TikTok had this fixed with a two-minute window; LinkedIn and X never
 * got it.
 *
 *   node scripts/test-oauth-state.mjs
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

const mod = { exports: {} }
new Function('module', 'exports', 'require', ts.transpileModule(read('lib/oauth-state.ts'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
}).outputText)(mod, mod.exports, require)
const { checkOAuthState, isRepeatOfFreshConnect, connectedJustNow, REPEAT_WINDOW_MS, SLOW_REPEAT_WINDOW_MS } = mod.exports

const NOW = new Date('2026-11-23T19:53:00Z')
const ago = ms => new Date(NOW.getTime() - ms).toISOString()

test('the state check names what went wrong', () => {
  assert.deepEqual(checkOAuthState('abc', 'abc'), { ok: true })
  assert.deepEqual(checkOAuthState(undefined, 'abc'), { ok: false, reason: 'state_missing' })
  assert.deepEqual(checkOAuthState('abc', 'xyz'), { ok: false, reason: 'state_mismatch' })
  assert.deepEqual(checkOAuthState('abc', null), { ok: false, reason: 'state_mismatch' })
})

test("a repeat within the window is success; LinkedIn's 3 to 4 minute repeats need the slow window", () => {
  assert.equal(isRepeatOfFreshConnect(ago(30_000), NOW), true)
  assert.equal(isRepeatOfFreshConnect(ago(4 * 60_000), NOW), false, 'past the two-minute default')
  assert.equal(isRepeatOfFreshConnect(ago(4 * 60_000), NOW, SLOW_REPEAT_WINDOW_MS), true)
  assert.equal(isRepeatOfFreshConnect(ago(11 * 60_000), NOW, SLOW_REPEAT_WINDOW_MS), false)
  assert.equal(isRepeatOfFreshConnect(new Date(NOW.getTime() + 5000).toISOString(), NOW), false, 'a write in the future')
  assert.equal(isRepeatOfFreshConnect(null, NOW), false)
  assert.equal(isRepeatOfFreshConnect('not a date', NOW), false)
  assert.ok(SLOW_REPEAT_WINDOW_MS > REPEAT_WINDOW_MS)
})

/** A fake supabase query: records the filters and answers once awaited. */
function fakeDb(answer) {
  const calls = []
  const q = {
    from: t => { calls.push(['from', t]); return q },
    select: c => { calls.push(['select', c]); return q },
    eq: (c, v) => { calls.push(['eq', c, v]); return q },
    order: (c, o) => { calls.push(['order', c, o]); return q },
    limit: n => { calls.push(['limit', n]); return q },
    then: (resolve, reject) => Promise.resolve(answer).then(resolve, reject),
  }
  return { db: q, calls }
}

test("the lookup reads this person's row on this platform, newest write first", async () => {
  const { db, calls } = fakeDb({ data: [{ updated_at: ago(3 * 60_000), created_at: ago(90 * 864e5) }], error: null })
  assert.equal(await connectedJustNow(db, 'u1', 'linkedin', SLOW_REPEAT_WINDOW_MS, NOW), true)
  assert.deepEqual(calls.filter(c => c[0] === 'eq'), [['eq', 'user_id', 'u1'], ['eq', 'platform', 'linkedin']])
  assert.deepEqual(calls.find(c => c[0] === 'order'), ['order', 'updated_at', { ascending: false, nullsFirst: false }])
})

test('a new row with no updated_at falls back to created_at', async () => {
  const { db } = fakeDb({ data: [{ updated_at: null, created_at: ago(60_000) }], error: null })
  assert.equal(await connectedJustNow(db, 'u1', 'twitter', SLOW_REPEAT_WINDOW_MS, NOW), true)
})

test('no row, an old row or a failed read all mean the error stands', async () => {
  assert.equal(await connectedJustNow(fakeDb({ data: [], error: null }).db, 'u1', 'linkedin', SLOW_REPEAT_WINDOW_MS, NOW), false)
  assert.equal(await connectedJustNow(fakeDb({ data: [{ updated_at: ago(3600e3) }], error: null }).db, 'u1', 'linkedin', SLOW_REPEAT_WINDOW_MS, NOW), false)
  assert.equal(await connectedJustNow(fakeDb({ data: null, error: { message: 'boom' } }).db, 'u1', 'linkedin', SLOW_REPEAT_WINDOW_MS, NOW), false)
})

test('wiring: LinkedIn and X answer a repeat with success, and reconnects mark the row fresh', () => {
  for (const [file, platform] of [['app/api/linkedin/callback/route.ts', 'linkedin'], ['app/api/accounts/twitter/callback/route.ts', 'twitter']]) {
    const src = read(file)
    assert.match(src, new RegExp(`checkOAuthState\\(cookieStore\\.get\\('${platform}_oauth_state'\\)\\?\\.value, state\\)`), file)
    assert.match(src, new RegExp(`connectedJustNow\\(getSupabaseAdmin\\(\\), maybeUser\\.id, '${platform}', SLOW_REPEAT_WINDOW_MS\\)`), file)
    assert.match(src, new RegExp(`/accounts\\?success=${platform}_connected\``), file)
    assert.doesNotMatch(src, new RegExp(`error=${platform}_invalid_state`), `${file} names the reason now`)
    assert.match(src, /updated_at:\s+new Date\(\)\.toISOString\(\)/, `${file} marks a reconnect fresh`)
  }
  // LinkedIn's reconnect used to throw its error away.
  const li = read('app/api/linkedin/callback/route.ts')
  assert.match(li, /const \{ error: updateError \} = await getSupabaseAdmin\(\)\s*\.from\('connected_accounts'\)\s*\.update\(/)
  // The connect route sends people to the callback fixed here.
  assert.match(read('app/api/accounts/linkedin/connect/route.ts'), /\/api\/linkedin\/callback/)
})
