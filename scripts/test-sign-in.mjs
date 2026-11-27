#!/usr/bin/env node
/**
 * Tests for lib/sign-in.ts and the auth callback that uses it.
 *
 * The callback ran up to ten database calls one after another before it
 * redirected, and Vercel measured it at 1.31 s (p75, Nov 20 to 27, 2026), all of
 * it inside /onboarding's time to first byte. Now it waits for two reads, side by
 * side, and hands the rest to after(). These tests hold the bookkeeping to what
 * the callback always did, and the callback to waiting on nothing else.
 *
 *   node scripts/test-sign-in.mjs
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

function load(rel, stubs) {
  const { outputText } = ts.transpileModule(read(rel), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const mod = { exports: {} }
  const localRequire = id => {
    if (stubs[id]) return stubs[id]
    if (id.startsWith('@/lib/')) return load(`lib/${id.slice('@/lib/'.length)}.ts`, stubs)
    return require(id)
  }
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, localRequire)
  return mod.exports
}

/** lib/sign-in.ts with Inngest replaced by a recorder. */
function freshSignIn() {
  const sent = []
  const inngest = { send: event => { sent.push(event); return Promise.resolve({ ids: ['e1'] }) } }
  return { mod: load('lib/sign-in.ts', { '@/lib/inngest': { inngest } }), sent }
}

/**
 * A fake service-role client. Each from() is one call; `answers` gives the
 * result by "table.kind" (select, insert, upsert) or "rpc:name".
 */
function fakeAdmin(answers = {}) {
  const calls = []
  const answer = (key, fallback) => Promise.resolve(answers[key] ?? fallback)
  const admin = {
    from(table) {
      const call = { table, ops: [] }
      calls.push(call)
      const kind = () => (call.ops.find(o => o[0] === 'insert' || o[0] === 'upsert')?.[0] ?? 'select')
      const q = {
        select: c => { call.ops.push(['select', c]); return q },
        eq: (c, v) => { call.ops.push(['eq', c, v]); return q },
        in: (c, v) => { call.ops.push(['in', c, v]); return q },
        limit: n => { call.ops.push(['limit', n]); return q },
        maybeSingle: () => { call.ops.push(['maybeSingle']); return q },
        single: () => { call.ops.push(['single']); return q },
        insert: row => { call.ops.push(['insert', row]); return q },
        upsert: (row, opts) => { call.ops.push(['upsert', row, opts]); return q },
        then: (resolve, reject) => answer(`${table}.${kind()}`, kind() === 'select' ? { data: null, error: null } : { error: null }).then(resolve, reject),
      }
      return q
    },
    rpc(name, args) {
      calls.push({ rpc: name, args })
      return answer(`rpc:${name}`, { data: null, error: null })
    },
  }
  return {
    admin,
    calls,
    /** "table.kind" or "rpc:name" for every call, in order. */
    kinds: () => calls.map(c => (c.rpc ? `rpc:${c.rpc}` : `${c.table}.${c.ops.find(o => o[0] === 'insert' || o[0] === 'upsert')?.[0] ?? 'select'}`)),
    /** The row an insert or upsert call sent. */
    row: i => calls[i].ops.find(o => o[0] === 'insert' || o[0] === 'upsert')[1],
    opts: i => calls[i].ops.find(o => o[0] === 'upsert')[2],
  }
}

// Failures are logged, not thrown; keep them for the assertions and out of the output.
const logged = []
console.warn = (...args) => logged.push(args.join(' '))
console.error = (...args) => logged.push(args.join(' '))

const RETURNING = { id: 'u1', email: 'back@example.com', user_metadata: {}, app_metadata: { provider: 'email' } }
const NEW_GOOGLE = {
  id: 'u2',
  email: 'new@example.com',
  user_metadata: { full_name: 'Pat Lee', newsletter_opted_in: true },
  app_metadata: { provider: 'google' },
}

test('the personal workspace is created only when the read finds none', async () => {
  const { ensurePersonalWorkspace } = freshSignIn().mod

  let db = fakeAdmin({ 'workspaces.select': { data: { id: 'w1' }, error: null } })
  await ensurePersonalWorkspace(db.admin, 'u1')
  assert.deepEqual(db.kinds(), ['workspaces.select'])
  assert.deepEqual(db.calls[0].ops.filter(o => o[0] === 'eq'), [['eq', 'owner_id', 'u1'], ['eq', 'is_personal', true]])
  // Two personal workspaces still read as "has one": limit(1), never single().
  assert.ok(db.calls[0].ops.some(o => o[0] === 'limit' && o[1] === 1))
  assert.ok(db.calls[0].ops.some(o => o[0] === 'maybeSingle'))
  assert.ok(!db.calls[0].ops.some(o => o[0] === 'single'))

  db = fakeAdmin({ 'workspaces.select': { data: null, error: null } })
  await ensurePersonalWorkspace(db.admin, 'u1')
  assert.deepEqual(db.kinds(), ['workspaces.select', 'workspaces.insert'])
  assert.deepEqual(db.row(1), { owner_id: 'u1', name: 'Personal', is_personal: true })

  db = fakeAdmin({ 'workspaces.select': { data: null, error: { message: 'canceling statement due to statement timeout' } } })
  await ensurePersonalWorkspace(db.admin, 'u1')
  assert.deepEqual(db.kinds(), ['workspaces.select'], 'a failed read is not "no workspace", so nothing is created')
  assert.ok(logged.some(l => l.includes('personal workspace read failed')))
})

test('a returning sign-in only counts the login', async () => {
  const { mod, sent } = freshSignIn()
  const db = fakeAdmin()
  await mod.recordSignIn(db.admin, RETURNING, { isNewAccount: false, attribution: {} })
  assert.deepEqual(db.kinds(), ['rpc:increment_login_count'])
  assert.deepEqual(db.calls[0].args, { p_user_id: 'u1' })
  assert.equal(sent.length, 0)
})

test("a new account's first sign-in records the signup, starts the welcome emails and keeps its choices", async () => {
  const { mod, sent } = freshSignIn()
  const db = fakeAdmin()
  const attribution = { source: 'chatgpt.com', referrer: 'https://chatgpt.com/', landing: '/for/tiktok-creators' }
  await mod.recordSignIn(db.admin, NEW_GOOGLE, { isNewAccount: true, attribution })

  assert.deepEqual(db.kinds(), [
    'user_settings.select',        // welcome_email_sent
    'usage_events.insert',         // funnel_signup_completed
    'user_settings.upsert',        // welcome_email_sent: true
    'user_settings.upsert',        // iris_opt_in
    'rpc:increment_login_count',
    'user_settings.upsert',        // signup_source, signup_referrer
  ])
  assert.deepEqual(db.row(1), {
    user_id: 'u2',
    event_type: 'funnel_signup_completed',
    metadata: { provider: 'google', landing: '/for/tiktok-creators', referrer_host: 'chatgpt.com', utm_source: 'chatgpt.com' },
  })
  assert.deepEqual(db.row(2), { user_id: 'u2', welcome_email_sent: true })
  assert.deepEqual(db.opts(2), { onConflict: 'user_id' })
  assert.deepEqual(sent, [{ id: 'user-signup-u2', name: 'user/signup', data: { email: 'new@example.com', firstName: 'Pat' } }])
  assert.deepEqual(db.row(3), { user_id: 'u2', iris_opt_in: true })
  assert.deepEqual(db.row(5), { user_id: 'u2', signup_source: 'chatgpt.com', signup_referrer: 'https://chatgpt.com/' })
})

test('a second first sign-in records no second signup and sends no second welcome', async () => {
  const { mod, sent } = freshSignIn()
  const db = fakeAdmin({ 'user_settings.select': { data: { welcome_email_sent: true }, error: null } })
  await mod.recordSignIn(db.admin, NEW_GOOGLE, { isNewAccount: true, attribution: {} })
  assert.deepEqual(db.kinds(), ['user_settings.select', 'user_settings.upsert', 'rpc:increment_login_count'])
  assert.deepEqual(db.row(1), { user_id: 'u2', iris_opt_in: true }, 'the newsletter choice is still kept')
  assert.equal(sent.length, 0)
})

test('a referral credits the partner, never the person themself', async () => {
  const { mod } = freshSignIn()

  // Typed in capitals, stored in lowercase, as every code is.
  let db = fakeAdmin({ 'user_settings.select': { data: { user_id: 'partner', referral_code: 'pat10' }, error: null } })
  await mod.recordSignIn(db.admin, RETURNING, { isNewAccount: false, attribution: {}, refCode: 'PAT10' })
  assert.deepEqual(db.kinds(), ['user_settings.select', 'referral_conversions.upsert', 'rpc:increment_login_count'])
  assert.deepEqual(db.calls[0].ops.find(o => o[0] === 'in'), ['in', 'referral_code', ['PAT10', 'pat10']])
  assert.ok(db.calls[0].ops.some(o => o[0] === 'limit' && o[1] === 1))
  const row = db.row(1)
  assert.equal(row.affiliate_user_id, 'partner')
  assert.equal(row.referred_user_id, 'u1')
  assert.equal(row.referral_code, 'pat10', 'the stored spelling')
  assert.equal(row.status, 'pending')
  assert.equal(Date.parse(row.lock_expires_at) - Date.parse(row.converted_at) >= 60 * 864e5 - 1000, true, '60-day lock')
  assert.deepEqual(db.opts(1), { onConflict: 'referred_user_id', ignoreDuplicates: true })

  db = fakeAdmin({ 'user_settings.select': { data: { user_id: 'u1', referral_code: 'mine' }, error: null } })
  await mod.recordSignIn(db.admin, RETURNING, { isNewAccount: false, attribution: {}, refCode: 'MINE' })
  assert.deepEqual(db.kinds(), ['user_settings.select', 'rpc:increment_login_count'])

  db = fakeAdmin({ 'user_settings.select': { data: null, error: { message: 'boom' } } })
  await mod.recordSignIn(db.admin, RETURNING, { isNewAccount: false, attribution: {}, refCode: 'PAT10' })
  assert.deepEqual(db.kinds(), ['user_settings.select', 'rpc:increment_login_count'])

  // Some sites add ?ref=their-site; that can never be a code, so nothing is looked up.
  db = fakeAdmin()
  await mod.recordSignIn(db.admin, RETURNING, { isNewAccount: false, attribution: {}, refCode: 'chatgpt.com' })
  assert.deepEqual(db.kinds(), ['rpc:increment_login_count'])
})

test('without the login-count function, the count is written directly', async () => {
  const { mod } = freshSignIn()
  const db = fakeAdmin({
    'rpc:increment_login_count': { data: null, error: { message: 'Could not find the function' } },
    'user_settings.select': { data: { login_count: 4 }, error: null },
  })
  await mod.recordSignIn(db.admin, RETURNING, { isNewAccount: false, attribution: {} })
  assert.deepEqual(db.kinds(), ['rpc:increment_login_count', 'user_settings.select', 'user_settings.upsert'])
  assert.equal(db.row(2).login_count, 5)
  assert.equal(db.row(2).user_id, 'u1')
})

test('a failed step is logged and the rest still run', async () => {
  const { mod, sent } = freshSignIn()
  logged.length = 0
  const db = fakeAdmin({ 'user_settings.upsert': { error: { message: 'new row violates check constraint' } } })
  await mod.recordSignIn(db.admin, NEW_GOOGLE, { isNewAccount: true, attribution: { source: 'google' } })
  assert.ok(db.kinds().includes('rpc:increment_login_count'))
  assert.equal(sent.length, 1, 'the welcome emails still start')
  assert.ok(logged.some(l => l.includes('welcome flag write failed')))
  assert.ok(logged.some(l => l.includes('attribution write failed')))
})

test('wiring: the callback waits for the exchange and one pair of reads, then redirects', () => {
  const src = read('app/auth/callback/route.ts')
  assert.match(src, /import \{ NextResponse, after \} from 'next\/server'/)
  assert.match(src, /import \{ ensurePersonalWorkspace, recordSignIn \} from '@\/lib\/sign-in'/)

  const start = src.indexOf('exchangeCodeForSession(code)')
  const end = src.indexOf('return NextResponse.redirect(new URL(finalRedirect')
  assert.ok(start > 0 && end > start)
  const between = src.slice(start, end)
  assert.equal((between.match(/\bawait\b/g) ?? []).length, 1, 'the only wait is the Promise.all')
  assert.match(between, /await Promise\.all\(\[\s*ensurePersonalWorkspace\(adminSupabase, user\.id\),\s*supabase\s*\.from\('profiles'\)/)
  assert.match(between, /after\(\(\) => recordSignIn\(adminSupabase, user, \{ isNewAccount, attribution, refCode \}\)\)/)

  // Cookies travel with the response, and after() runs once it has gone.
  const afterAt = between.indexOf('after(() =>')
  const cookieChanges = Array.from(between.matchAll(/cookieStore\.(set|delete)\(/g))
  assert.ok(cookieChanges.length >= 3)
  for (const m of cookieChanges) assert.ok(m.index < afterAt, 'a cookie changed inside or after after()')

  // The bookkeeping lives in lib/sign-in.ts now, not in front of the redirect.
  for (const table of ['user_settings', 'referral_conversions', 'usage_events', 'workspaces']) {
    assert.doesNotMatch(src, new RegExp(`from\\('${table}'\\)`), table)
  }
  assert.doesNotMatch(src, /increment_login_count|inngest|recordFunnel/)
})
