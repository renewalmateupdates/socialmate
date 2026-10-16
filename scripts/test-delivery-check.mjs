#!/usr/bin/env node
/**
 * Tests for lib/delivery-check.ts, the far-end delivery check's pure logic.
 *
 *   node scripts/test-delivery-check.mjs
 *
 * Loads the TypeScript module through the project's own `typescript` package,
 * so it needs no test framework. All network calls go through a fake fetch.
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
const source = readFileSync(join(root, 'lib/delivery-check.ts'), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const dc = mod.exports

const URI_A = 'at://did:plc:abc123/app.bsky.feed.post/3kaaaa'
const URI_B = 'at://did:plc:abc123/app.bsky.feed.post/3kbbbb'

function fakeFetch(handler) {
  const calls = []
  const fn = async (url, init) => {
    calls.push({ url: String(url), init })
    return handler(String(url), init)
  }
  fn.calls = calls
  return fn
}
const json = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body })

test('coverageForPost splits checkable ids from the rest', () => {
  const { targets, unchecked } = dc.coverageForPost({
    id: 'p1', user_id: 'u1',
    platform_post_ids: { bluesky: URI_A, mastodon: '111222333', twitter: '999', linkedin: 'urn:li:share:1' },
  })
  assert.deepEqual(targets.map(t => `${t.platform}:${t.remoteId}`), [`bluesky:${URI_A}`, 'mastodon:111222333'])
  assert.deepEqual(unchecked.sort(), ['linkedin', 'twitter'])
})

test('coverageForPost leaves out ids it cannot look up', () => {
  const bareKey = dc.coverageForPost({ id: 'p', user_id: 'u', platform_post_ids: { bluesky: '3kaaaa', mastodon: 'abc' } })
  assert.deepEqual(bareKey.targets, [])
  assert.deepEqual(bareKey.unchecked.sort(), ['bluesky', 'mastodon'])
  for (const ids of [null, undefined, 'x', ['a'], 42]) {
    assert.deepEqual(dc.coverageForPost({ id: 'p', user_id: 'u', platform_post_ids: ids }), { targets: [], unchecked: [] })
  }
})

test('pickTargets skips settled posts, keeps order, and caps the run', () => {
  const t = (id, platform = 'bluesky') => ({ postId: id, userId: 'u', platform, remoteId: URI_A })
  const all = [t('1'), t('2'), t('3', 'mastodon'), t('4')]
  const picked = dc.pickTargets(all, new Set(['2:bluesky']), 2)
  assert.deepEqual(picked.map(x => x.postId), ['1', '3'])
})

test('mastodonRef parses "accountId@instance" and rejects anything else', () => {
  assert.deepEqual(dc.mastodonRef('10987@Mastodon.Social', 'tok'), { host: 'mastodon.social', accountId: '10987', token: 'tok' })
  assert.equal(dc.mastodonRef('no-at-sign', 'tok'), null)
  assert.equal(dc.mastodonRef('1@http://evil.example/x', 'tok'), null)
  assert.equal(dc.mastodonRef('1@localhost', 'tok'), null)
  assert.equal(dc.mastodonRef(null, 'tok'), null)
  assert.deepEqual(dc.mastodonRef('@fosstodon.org', null), { host: 'fosstodon.org', accountId: null, token: null })
})

test('classifyMastodonStatus only calls a post missing when the instance says so', () => {
  assert.equal(dc.classifyMastodonStatus(200), 'live')
  assert.equal(dc.classifyMastodonStatus(404), 'missing')
  assert.equal(dc.classifyMastodonStatus(410), 'missing')
  for (const s of [401, 403, 429, 500, 502]) assert.equal(dc.classifyMastodonStatus(s), 'unknown')
})

test('combineResults', () => {
  assert.equal(dc.combineResults(['missing', 'live']), 'live')
  assert.equal(dc.combineResults(['missing', 'missing']), 'missing')
  assert.equal(dc.combineResults(['missing', 'unknown']), 'unknown')
  assert.equal(dc.combineResults([]), 'unknown')
})

test('checkBluesky marks found posts live and absent ones missing', async () => {
  const f = fakeFetch(() => json(200, { posts: [{ uri: URI_A }] }))
  const out = await dc.checkBluesky([URI_A, URI_B], f)
  assert.equal(out.get(URI_A), 'live')
  assert.equal(out.get(URI_B), 'missing')
  assert.equal(f.calls.length, 1)
  assert.match(f.calls[0].url, /^https:\/\/public\.api\.bsky\.app\/xrpc\/app\.bsky\.feed\.getPosts\?uris=/)
})

test('checkBluesky never calls a post missing when the API fails', async () => {
  for (const f of [fakeFetch(() => json(502, {})), fakeFetch(() => { throw new Error('network') })]) {
    const out = await dc.checkBluesky([URI_A], f)
    assert.equal(out.get(URI_A), 'unknown')
  }
})

test('checkBluesky asks in batches of 25', async () => {
  const uris = Array.from({ length: 30 }, (_, i) => `at://did:plc:abc/app.bsky.feed.post/k${i}`)
  const f = fakeFetch(() => json(200, { posts: [] }))
  const out = await dc.checkBluesky(uris, f)
  assert.equal(f.calls.length, 2)
  assert.equal(out.size, 30)
})

test('checkMastodon tries every instance and checks the author', async () => {
  const refs = [
    { host: 'a.social', accountId: '1', token: 't1' },
    { host: 'b.social', accountId: '2', token: 't2' },
  ]
  const live = fakeFetch(url => url.includes('a.social') ? json(404, {}) : json(200, { account: { id: '2' } }))
  assert.equal(await dc.checkMastodon(refs, '555', live), 'live')
  assert.equal(live.calls[1].init.headers.Authorization, 'Bearer t2')

  const someoneElse = fakeFetch(() => json(200, { account: { id: '999' } }))
  assert.equal(await dc.checkMastodon(refs, '555', someoneElse), 'missing')

  const gone = fakeFetch(() => json(404, {}))
  assert.equal(await dc.checkMastodon(refs, '555', gone), 'missing')

  const flaky = fakeFetch(url => { if (url.includes('b.social')) throw new Error('timeout'); return json(404, {}) })
  assert.equal(await dc.checkMastodon(refs, '555', flaky), 'unknown')

  assert.equal(await dc.checkMastodon([], '555', gone), 'unknown')
})

test('coverageForPost checks bot-sent Discord messages and skips webhook posts', () => {
  const bot = dc.coverageForPost({
    id: 'p', user_id: 'u',
    platform_post_ids: { discord: '1290000000000000001' },
    destinations: { discord: 'dest-1' },
  })
  assert.deepEqual(bot.targets, [{ postId: 'p', userId: 'u', platform: 'discord', remoteId: '1290000000000000001', destinationId: 'dest-1' }])
  const noDest = dc.coverageForPost({ id: 'p', user_id: 'u', platform_post_ids: { discord: '1290000000000000001' } })
  assert.equal(noDest.targets[0].destinationId, null)
  const webhook = dc.coverageForPost({ id: 'p', user_id: 'u', platform_post_ids: { discord: 'discord-1729000000000' } })
  assert.deepEqual(webhook, { targets: [], unchecked: ['discord'] })
})

test('classifyDiscordStatus', () => {
  assert.equal(dc.classifyDiscordStatus(200), 'live')
  assert.equal(dc.classifyDiscordStatus(404), 'missing')
  for (const s of [401, 403, 429, 500]) assert.equal(dc.classifyDiscordStatus(s), 'unknown')
})

test('checkDiscord reads the message back with the bot token', async () => {
  const channel = '1180000000000000000', message = '1290000000000000001'
  const live = fakeFetch(() => json(200, { id: message }))
  assert.equal(await dc.checkDiscord(channel, message, 'tok', live), 'live')
  assert.equal(live.calls[0].url, `https://discord.com/api/v10/channels/${channel}/messages/${message}`)
  assert.equal(live.calls[0].init.headers.Authorization, 'Bot tok')
  assert.equal(await dc.checkDiscord(channel, message, 'tok', fakeFetch(() => json(404, {}))), 'missing')
  assert.equal(await dc.checkDiscord(channel, message, 'tok', fakeFetch(() => json(403, {}))), 'unknown')
  assert.equal(await dc.checkDiscord(channel, message, 'tok', fakeFetch(() => { throw new Error('x') })), 'unknown')
  const never = fakeFetch(() => json(200, {}))
  assert.equal(await dc.checkDiscord(channel, message, null, never), 'unknown')
  assert.equal(await dc.checkDiscord('not-a-channel', message, 'tok', never), 'unknown')
  assert.equal(never.calls.length, 0)
})

test('publicUrl links Bluesky posts only', () => {
  assert.equal(
    dc.publicUrl({ postId: 'p', userId: 'u', platform: 'bluesky', remoteId: URI_A }),
    'https://bsky.app/profile/did:plc:abc123/post/3kaaaa',
  )
  assert.equal(dc.publicUrl({ postId: 'p', userId: 'u', platform: 'mastodon', remoteId: '1' }), null)
})

test('tally counts each result', () => {
  const t = { postId: 'p', userId: 'u', platform: 'bluesky', remoteId: URI_A }
  assert.deepEqual(dc.tally([{ target: t, result: 'live' }, { target: t, result: 'live' }, { target: t, result: 'unknown' }]), { live: 2, missing: 0, unknown: 1 })
})
