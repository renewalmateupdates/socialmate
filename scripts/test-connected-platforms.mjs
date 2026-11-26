#!/usr/bin/env node
/**
 * Posts that can't go out, and X on Free (Nov 25, 2026).
 *
 * An outside tester (Nov 21) picked Bluesky with nothing connected, pressed
 * Schedule, and the post saved as Scheduled: the Queue and the Dashboard
 * listed it, the streak said "streak safe", and it failed at its time with
 * "No Bluesky account connected". The same walk found X marked "Live" with the
 * free platforms on the homepage, "0 / 0, Limit reached" in the Free sidebar,
 * and a Pro list on /pricing that never mentioned X.
 *
 * lib/connected-platforms.ts answers "can this go out?" once; the post routes,
 * Compose and the Dashboard all use it. This covers the helpers and checks
 * that each place still asks.
 *
 *   node scripts/test-connected-platforms.mjs
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
const code = src => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

const { outputText } = ts.transpileModule(read('lib/connected-platforms.ts'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const {
  platformDisplayName, listPlatformNames, missingConnections, notConnectedMessage,
  connectedInScope, unconnectedForPost, streakTimeOf,
} = mod.exports

test('platform names read the way people know them', () => {
  assert.equal(platformDisplayName('twitter'), 'X')
  assert.equal(platformDisplayName('linkedin'), 'LinkedIn')
  assert.equal(platformDisplayName('lemmy'), 'Lemmy')
  assert.equal(listPlatformNames([]), '')
  assert.equal(listPlatformNames(['bluesky']), 'Bluesky')
  assert.equal(listPlatformNames(['bluesky', 'twitter']), 'Bluesky and X')
  assert.equal(listPlatformNames(['bluesky', 'mastodon', 'twitter']), 'Bluesky, Mastodon and X')
})

test('missing connections keep the order they were picked in', () => {
  assert.deepEqual(missingConnections(['bluesky', 'discord', 'mastodon'], new Set(['discord'])), ['bluesky', 'mastodon'])
  assert.deepEqual(missingConnections(['bluesky'], ['bluesky']), [])
  assert.deepEqual(missingConnections([], new Set()), [])
})

test('the refusal names the platform and says what to do', () => {
  const one = notConnectedMessage(['bluesky'])
  assert.match(one, /^No Bluesky account connected, so this can't go out\./)
  assert.match(one, /Connect it in Accounts, or untick it\./)
  assert.match(notConnectedMessage(['bluesky', 'twitter']), /No Bluesky and X account connected.*Connect them.*untick them/)
})

const rows = [
  { platform: 'bluesky', workspace_id: null },
  { platform: 'telegram', workspace_id: null },
  { platform: 'linkedin', workspace_id: 'ws-client' },
]
const owned = [{ id: 'ws-personal', is_personal: true }, { id: 'ws-client', is_personal: false }]

test('connections are read in the scope the post posts from', () => {
  assert.deepEqual(Array.from(connectedInScope(rows, null)).sort(), ['bluesky', 'telegram'])
  assert.deepEqual(Array.from(connectedInScope(rows, 'ws-client')), ['linkedin'])
})

test('a post is flagged only when we know it cannot go out', () => {
  // Personal workspace: personal accounts (workspace_id null) count.
  assert.deepEqual(unconnectedForPost({ platforms: ['bluesky', 'mastodon'], workspace_id: 'ws-personal' }, rows, owned), ['mastodon'])
  assert.deepEqual(unconnectedForPost({ platforms: ['bluesky'], workspace_id: null }, rows, owned), [])
  // A client workspace posts from its own accounts, not the personal ones.
  assert.deepEqual(unconnectedForPost({ platforms: ['bluesky'], workspace_id: 'ws-client' }, rows, owned), ['bluesky'])
  assert.deepEqual(unconnectedForPost({ platforms: ['linkedin'], workspace_id: 'ws-client' }, rows, owned), [])
  // Someone else's workspace posts from the owner's accounts, which we can't read: never flagged.
  assert.deepEqual(unconnectedForPost({ platforms: ['bluesky'], workspace_id: 'ws-theirs' }, rows, owned), [])
})

test('the streak counts posts that went out or can go out, nothing else', () => {
  const base = { scheduled_at: '2026-11-20T15:00:00Z', created_at: '2026-11-18T09:00:00Z' }
  assert.equal(streakTimeOf({ ...base, status: 'published', published_at: '2026-11-20T15:00:04Z' }, true), '2026-11-20T15:00:04Z')
  assert.equal(streakTimeOf({ ...base, status: 'partial', published_at: null }, true), '2026-11-20T15:00:00Z')
  assert.equal(streakTimeOf({ ...base, status: 'scheduled' }, true), '2026-11-20T15:00:00Z')
  assert.equal(streakTimeOf({ ...base, status: 'scheduled' }, false), null, 'a post that cannot go out never counts')
  assert.equal(streakTimeOf({ ...base, status: 'failed' }, true), null, 'a failed Post Now is not "streak safe"')
  assert.equal(streakTimeOf({ ...base, status: 'draft' }, true), null)
  assert.equal(streakTimeOf({ ...base, status: 'pending_approval' }, true), null)
})

test('both post routes refuse an unconnected platform before saving or sending', () => {
  const create = code(read('app/api/posts/create/route.ts'))
  const check = create.indexOf('connectedPlatformsFor(')
  assert.ok(check > 0, '/api/posts/create checks connections')
  assert.ok(check < create.indexOf(".from('posts')"), 'before the scheduled post is inserted')
  assert.ok(check < create.indexOf('publishToAll('), 'before anything is published')
  assert.match(create.slice(check, check + 400), /notConnected: missing[\s\S]*?status: 400/)

  const thread = code(read('app/api/posts/create-thread/route.ts'))
  const tcheck = thread.indexOf('connectedPlatformsFor(')
  assert.ok(tcheck > 0, 'the thread route checks connections')
  assert.ok(tcheck < thread.indexOf('for (const p of threadPlatforms)'), 'before any part is sent')
})

test('Compose blocks Schedule and Post and says why', () => {
  const compose = code(read('app/compose/page.tsx'))
  const publish = compose.slice(compose.indexOf('const handlePublish = async'), compose.indexOf('const handleSubmitForApproval'))
  assert.ok(publish.indexOf('unconnectedSelected.length > 0') > 0, 'handlePublish checks')
  assert.ok(publish.indexOf('unconnectedSelected.length > 0') < publish.indexOf("fetch('/api/posts/create'"), 'before the request')
  assert.match(publish, /showConnectWarning\(\)/)
  assert.match(compose, /app_compose\.connect_to_schedule/)
  assert.match(compose, /missingConnections\(selectedPlatforms, connectedPlatforms\)/)
})

test('the Dashboard streak no longer counts every post by the day it was made', () => {
  const dash = code(read('app/dashboard/page.tsx'))
  assert.match(dash, /streakTimeOf\(/)
  assert.doesNotMatch(dash, /allPosts\.some\(p => \{ const pd = new Date\(p\.created_at\)/)
  assert.match(dash, /app_dashboard\.not_connected/)
})

test('X reads as Pro wherever Free is described', () => {
  const sidebar = code(read('components/Sidebar.tsx'))
  assert.match(sidebar, /xQuota\.limit === 0/, 'Free gets its own X card')
  const limitReached = sidebar.indexOf("'Limit reached")
  assert.ok(limitReached > sidebar.indexOf('xQuota.limit > 0'), '"Limit reached" only shows where there is an allowance')

  const landing = code(read('components/pages/Landing.tsx'))
  assert.match(landing, /PAID_ONLY_PLATFORM_NAMES/, 'the grid reads which platforms are Pro-only from site-facts')
  assert.match(landing, /landing\.platforms\.pro/)

  const pricing = code(read('app/pricing/page.tsx'))
  assert.doesNotMatch(pricing, /7 live platforms/, 'Free no longer claims all seven')
  const pro = pricing.slice(pricing.indexOf("backTitle: 'What you get that Free does not'"))
  assert.match(pro.slice(0, 400), /X \/ Twitter posting/, "X is the first thing Pro's list adds")

  for (const page of ['fitness-coaches', 'musicians', 'nonprofits', 'restaurants', 'real-estate', 'small-business']) {
    assert.doesNotMatch(read(`app/for/${page}/page.tsx`), /'7 live platforms/, `/for/${page} Free perks`)
  }
})
