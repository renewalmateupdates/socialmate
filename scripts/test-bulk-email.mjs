#!/usr/bin/env node
/**
 * Tests for lib/bulk-email.ts: the daily cap, stopping at Resend's quota, and
 * never recording a send Resend rejected.
 *
 *   node scripts/test-bulk-email.mjs
 */
import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))
const ts = require('typescript')

// What the fake Resend returns for a send, by recipient. Everything else is the
// real lib/mail.ts and lib/bulk-email.ts, compiled down to ES5 like the
// tsconfig target, so the error classes are tested the way they can compile.
let resendReplies = {}
class FakeResend {
  constructor() { this.emails = { send: async (opts) => resendReplies[opts.to] ?? { data: { id: 'x' }, error: null } } }
}
const cache = new Map()
function load(rel) {
  if (cache.has(rel)) return cache.get(rel).exports
  const { outputText } = ts.transpileModule(readFileSync(join(root, rel), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES5, lib: ['es2019'] },
  })
  const mod = { exports: {} }
  cache.set(rel, mod)
  const localRequire = (id) => {
    if (id === 'resend') return { Resend: FakeResend }
    if (id.startsWith('@/lib/')) return load(`lib/${id.slice('@/lib/'.length)}.ts`)
    return require(id)
  }
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, localRequire)
  return mod.exports
}

const { runBulkSend, sendOrThrow, isQuotaError, QuotaError, positiveInt, BULK_EMAIL_EVENTS, BULK_BATCH_SIZE } =
  load('lib/bulk-email.ts')
const { sendMailOrThrow, MailError, logIfRejected } = load('lib/mail.ts')

const people = (n) => Array.from({ length: n }, (_, i) => ({ email: `p${i}@example.com` }))
const quiet = () => { const e = console.error, w = console.warn; console.error = () => {}; console.warn = () => {}; return () => { console.error = e; console.warn = w } }

async function run(targets, opts = {}) {
  const recorded = []
  const restore = quiet()
  try {
    const res = await runBulkSend({
      label: 'test', targets, sentLast24h: 0, cap: 100, intervalMs: 0,
      send: (t) => sendOrThrow({ to: t.email, subject: 's', html: 'h' }),
      record: async (t) => { recorded.push(t.email) },
      ...opts,
    })
    return { res, recorded }
  } finally { restore() }
}

test('sends everyone when under the cap and the batch size', async () => {
  resendReplies = {}
  const { res, recorded } = await run(people(5))
  assert.equal(res.sent, 5)
  assert.equal(res.remaining, 0)
  assert.equal(res.stopped, undefined)
  assert.equal(res.note, 'done')
  assert.equal(recorded.length, 5)
})

test('the batch size limits one POST without calling it a cap', async () => {
  resendReplies = {}
  const { res } = await run(people(80), { batchSize: 50 })
  assert.equal(res.sent, 50)
  assert.equal(res.remaining, 30)
  assert.equal(res.stopped, undefined)
})

test('stops at the daily cap, counting what went out in the last 24 hours', async () => {
  resendReplies = {}
  const { res } = await run(people(50), { sentLast24h: 90, batchSize: 50 })
  assert.equal(res.sent, 10)
  assert.equal(res.remaining, 40)
  assert.equal(res.stopped, 'daily_cap')
  assert.match(res.note, /daily bulk cap of 100/)
})

test('sends nothing once the cap is used up', async () => {
  resendReplies = {}
  const { res, recorded } = await run(people(10), { sentLast24h: 100 })
  assert.equal(res.sent, 0)
  assert.equal(res.remaining, 10)
  assert.equal(res.stopped, 'daily_cap')
  assert.equal(recorded.length, 0)
})

test('a rejected send is not recorded and the batch carries on', async () => {
  resendReplies = { 'p1@example.com': { data: null, error: { name: 'validation_error', message: 'bad address' } } }
  const { res, recorded } = await run(people(3))
  assert.equal(res.sent, 2)
  assert.equal(res.failed, 1)
  assert.deepEqual(res.failedEmails, ['p1@example.com'])
  assert.deepEqual(recorded, ['p0@example.com', 'p2@example.com'])
  assert.equal(res.remaining, 1)
})

test('the batch stops at the first quota error instead of failing through everyone', async () => {
  resendReplies = { 'p2@example.com': { data: null, error: { name: 'daily_quota_exceeded', message: 'You have reached your daily email sending quota.' } } }
  const { res, recorded } = await run(people(10))
  assert.equal(res.sent, 2)
  assert.equal(res.failed, 1)
  assert.equal(res.stopped, 'quota')
  assert.equal(res.remaining, 8)
  assert.deepEqual(recorded, ['p0@example.com', 'p1@example.com'])
  assert.match(res.note, /quota is spent/)
})

test('a failed record still counts the email as sent', async () => {
  resendReplies = {}
  const restore = quiet()
  try {
    const res = await runBulkSend({
      label: 'test', targets: people(2), sentLast24h: 0, cap: 100, intervalMs: 0,
      send: (t) => sendOrThrow({ to: t.email, subject: 's', html: 'h' }),
      record: async () => { throw new Error('insert failed') },
    })
    assert.equal(res.sent, 2)
    assert.equal(res.failed, 0)
  } finally { restore() }
})

test('sendOrThrow: a quota error is a QuotaError, any other rejection a plain Error', async () => {
  resendReplies = { 'q@example.com': { data: null, error: { name: 'monthly_quota_exceeded', message: 'Monthly quota reached' } },
                    'b@example.com': { data: null, error: { name: 'validation_error', message: 'bad' } } }
  await assert.rejects(sendOrThrow({ to: 'q@example.com', subject: 's', html: 'h' }), (e) => e instanceof QuotaError)
  await assert.rejects(sendOrThrow({ to: 'b@example.com', subject: 's', html: 'h' }), (e) => !(e instanceof QuotaError) && e.message === 'bad')
  await sendOrThrow({ to: 'ok@example.com', subject: 's', html: 'h' })
})

test('sendMailOrThrow: a rejected single send reaches the caller\'s catch', async () => {
  resendReplies = { 'x@example.com': { data: null, error: { name: 'validation_error', message: 'Invalid to field' } } }
  await assert.rejects(sendMailOrThrow({ to: 'x@example.com', subject: 's', html: 'h' }),
    (e) => e instanceof MailError && e.name === 'MailError' && e.code === 'validation_error' && e.message === 'Invalid to field')
  await sendMailOrThrow({ to: 'fine@example.com', subject: 's', html: 'h' })
})

test('the three single-send sites use the throwing send inside their try/catch', () => {
  for (const file of ['app/api/soma/projects/[id]/generate/route.ts', 'lib/inngest-token-expiry.ts', 'lib/inngest.ts']) {
    const src = readFileSync(join(root, file), 'utf8')
    assert.match(src, /await sendMailOrThrow\(/, `${file} should use sendMailOrThrow`)
    assert.doesNotMatch(src, /await sendMail\(/, `${file} still awaits sendMail, whose rejection a catch never sees`)
  }
})

test('logIfRejected logs a rejection and passes every result through unchanged', async () => {
  const logged = []
  const orig = console.error
  console.error = (...a) => logged.push(a.join(' '))
  try {
    const bad = { data: null, error: { name: 'validation_error', message: 'Invalid to field' } }
    assert.equal(await logIfRejected('api/x:1', Promise.resolve(bad)), bad)
    const ok = { data: { id: 'e1' }, error: null }
    assert.equal(await logIfRejected('api/x:2', Promise.resolve(ok)), ok)
    await assert.rejects(logIfRejected('api/x:3', Promise.reject(new Error('network'))), /network/)
  } finally { console.error = orig }
  assert.equal(logged.length, 1)
  assert.match(logged[0], /api\/x:1 rejected: validation_error Invalid to field/)
})

test('no direct resend.emails.send call ignores its error', () => {
  // The Stripe webhook is left alone until Joshua says otherwise (CLAUDE.md,
  // "What NOT to Touch"); lib/mail.ts is where sendMail itself calls Resend.
  const ALLOWED = new Set(['app/api/stripe/webhook/route.ts', 'lib/mail.ts'])
  const files = []
  const walk = (dir) => {
    for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`
      if (e.isDirectory()) walk(rel)
      else if (/\.tsx?$/.test(e.name)) files.push(rel)
    }
  }
  walk('app'); walk('lib')
  const bad = []
  for (const rel of files) {
    if (ALLOWED.has(rel)) continue
    readFileSync(join(root, rel), 'utf8').split('\n').forEach((line, i) => {
      if (!/\.emails\.send\(/.test(line)) return
      if (/logIfRejected\(/.test(line) || /\{\s*(data\s*,\s*)?error\b/.test(line)) return
      bad.push(`${rel}:${i + 1}`)
    })
  }
  assert.deepEqual(bad, [], 'wrap these in logIfRejected(...) or check { error }: ' + bad.join(', '))
})

test('helpers', () => {
  assert.equal(isQuotaError({ message: 'You have reached your daily email sending quota.' }), true)
  assert.equal(isQuotaError({ name: 'rate_limit_exceeded', message: 'Too many requests' }), false)
  assert.equal(isQuotaError(null), false)
  assert.equal(positiveInt('60', 100), 60)
  assert.equal(positiveInt(undefined, 100), 100)
  assert.equal(positiveInt('-5', 100), 100)
  assert.equal(positiveInt('abc', 100), 100)
  assert.equal(BULK_BATCH_SIZE, 50)
})

test('every bulk route records an event the cap counts', () => {
  const routes = {
    'app/api/admin/update-email/route.ts': 'product_update_nov2026_email',
    'app/api/admin/tiktok-first-post-email/route.ts': 'tiktok_first_post_email',
    'app/api/admin/tiktok-live-email/route.ts': 'tiktok_live_email',
    'app/api/admin/reactivate/route.ts': 'reactivation_email',
    'app/api/admin/unblocked/route.ts': 'unblocked_email',
  }
  for (const [file, event] of Object.entries(routes)) {
    assert.ok(BULK_EMAIL_EVENTS.includes(event), `${event} is not in BULK_EMAIL_EVENTS`)
    const src = readFileSync(join(root, file), 'utf8')
    assert.match(src, /runBulkSend\(/, `${file} does not send through runBulkSend`)
    assert.doesNotMatch(src, /await sendMail\(/, `${file} still calls sendMail without checking the error`)
  }
})
