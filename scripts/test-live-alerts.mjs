#!/usr/bin/env node
/**
 * Tests for lib/live-alerts.ts: the alert message, Twitch names, the
 * one-alert-per-stream rule, and the EventSub signature check.
 *
 *   node scripts/test-live-alerts.mjs
 *
 * Loads the TypeScript module through the project's own `typescript` package,
 * so it needs no test framework.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { createHmac } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))
const ts = require('typescript')
function load(file) {
  const { outputText } = ts.transpileModule(readFileSync(join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const mod = { exports: {} }
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
  return mod.exports
}
const {
  DEFAULT_TEMPLATE, renderAlert, normalizeTwitchLogin, validateTemplate, shouldAlert, checkAlertPlatforms,
} = load('lib/live-alerts.ts')
const { verifyTwitchMessage } = load('lib/twitch-verify.ts')

test('alerts post only where SocialMate can, where you are connected, and X only on a paid plan', () => {
  const ctx = { allowed: ['bluesky', 'discord', 'twitter'], connected: ['bluesky', 'discord', 'twitter'], paidPlan: false, paidOnly: ['twitter'] }
  assert.deepEqual(checkAlertPlatforms(['discord', 'bluesky', 'discord'], ctx), { ok: true, platforms: ['discord', 'bluesky'] })
  assert.match(checkAlertPlatforms([], ctx).error, /at least one/)
  assert.match(checkAlertPlatforms(['tiktok'], ctx).error, /can't post to tiktok/)
  assert.match(checkAlertPlatforms(['bluesky'], { ...ctx, connected: [] }).error, /Connect bluesky/)
  assert.match(checkAlertPlatforms(['twitter'], ctx).error, /Pro plan/)
  assert.equal(checkAlertPlatforms(['twitter'], { ...ctx, paidPlan: true }).ok, true)
})

const vars = { name: 'NovaPlays', title: 'Ranked grind to Diamond', game: 'League of Legends', url: 'https://twitch.tv/novaplays' }

test('the default message fills every field', () => {
  assert.equal(renderAlert(DEFAULT_TEMPLATE, vars), 'NovaPlays is live on Twitch: Ranked grind to Diamond\n\nhttps://twitch.tv/novaplays')
})

test('a stream with no title leaves no dangling colon', () => {
  assert.equal(renderAlert(DEFAULT_TEMPLATE, { ...vars, title: '' }), 'NovaPlays is live on Twitch\n\nhttps://twitch.tv/novaplays')
  assert.equal(renderAlert('Live now: {title} ({game})\n{url}', { ...vars, title: '  ' }), 'Live now: (League of Legends)\nhttps://twitch.tv/novaplays')
})

test('lines without an empty field are kept exactly as written', () => {
  assert.equal(renderAlert('Going live, come hang out:\n{url}', vars), 'Going live, come hang out:\nhttps://twitch.tv/novaplays')
  assert.equal(renderAlert('{name} playing {game}!', vars), 'NovaPlays playing League of Legends!')
})

test('unknown braces are left alone', () => {
  assert.equal(renderAlert('{name} {notafield}', vars), 'NovaPlays {notafield}')
})

test('Twitch names normalize from what people type', () => {
  assert.equal(normalizeTwitchLogin('NovaPlays'), 'novaplays')
  assert.equal(normalizeTwitchLogin('@NovaPlays'), 'novaplays')
  assert.equal(normalizeTwitchLogin('https://www.twitch.tv/NovaPlays/videos'), 'novaplays')
  assert.equal(normalizeTwitchLogin('ab'), null)
  assert.equal(normalizeTwitchLogin('has space'), null)
  assert.equal(normalizeTwitchLogin(42), null)
})

test('the message template falls back to the default and has a length cap', () => {
  assert.deepEqual(validateTemplate(''), { ok: true, template: DEFAULT_TEMPLATE })
  assert.deepEqual(validateTemplate('  Live! {url}  '), { ok: true, template: 'Live! {url}' })
  assert.equal(validateTemplate('x'.repeat(501)).ok, false)
})

test('one alert per stream, and none inside the cooldown', () => {
  const now = new Date('2026-10-27T20:00:00Z')
  assert.equal(shouldAlert({ last_stream_id: null, last_alert_at: null }, 's1', now), true)
  assert.equal(shouldAlert({ last_stream_id: 's1', last_alert_at: '2026-10-20T00:00:00Z' }, 's1', now), false, 'same stream')
  assert.equal(shouldAlert({ last_stream_id: 's1', last_alert_at: '2026-10-27T19:45:00Z' }, 's2', now), false, 'restart within 30 min')
  assert.equal(shouldAlert({ last_stream_id: 's1', last_alert_at: '2026-10-27T19:20:00Z' }, 's2', now), true, 'new stream after 40 min')
})

test('only a correctly signed, recent message is accepted', () => {
  const secret = 'a'.repeat(64)
  const now = new Date('2026-10-27T20:00:00Z')
  const id = 'msg-1'
  const timestamp = '2026-10-27T19:59:30.123456789Z'
  const body = '{"subscription":{"type":"stream.online"}}'
  const signature = 'sha256=' + createHmac('sha256', secret).update(id + timestamp + body).digest('hex')
  assert.equal(verifyTwitchMessage({ id, timestamp, signature }, body, secret, now), true)
  assert.equal(verifyTwitchMessage({ id, timestamp, signature }, body + ' ', secret, now), false, 'body changed')
  assert.equal(verifyTwitchMessage({ id, timestamp, signature }, body, 'b'.repeat(64), now), false, 'wrong secret')
  assert.equal(verifyTwitchMessage({ id: 'msg-2', timestamp, signature }, body, secret, now), false, 'id changed')
  assert.equal(verifyTwitchMessage({ id, timestamp, signature }, body, secret, new Date('2026-10-27T20:20:00Z')), false, 'too old')
  assert.equal(verifyTwitchMessage({ id, timestamp, signature: null }, body, secret, now), false)
  assert.equal(verifyTwitchMessage({ id, timestamp, signature: 'sha256=short' }, body, secret, now), false)
})
