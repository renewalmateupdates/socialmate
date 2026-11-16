#!/usr/bin/env node
/**
 * Tests for lib/bulk-email.ts: the daily cap, stopping at Resend's quota, and
 * never recording a send Resend rejected.
 *
 *   node scripts/test-bulk-email.mjs
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

// What the fake Resend returns for the next sendMail call, by recipient.
let resendReplies = {}
function load(rel) {
  const { outputText } = ts.transpileModule(readFileSync(join(root, rel), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  })
  const mod = { exports: {} }
  const localRequire = (id) => {
    if (id === '@/lib/mail') {
      return { sendMail: async (opts) => resendReplies[opts.to] ?? { data: { id: 'x' }, error: null } }
    }
    return require(id)
  }
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, localRequire)
  return mod.exports
}

const { runBulkSend, sendOrThrow, isQuotaError, QuotaError, positiveInt, BULK_EMAIL_EVENTS, BULK_BATCH_SIZE } =
  load('lib/bulk-email.ts')

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
