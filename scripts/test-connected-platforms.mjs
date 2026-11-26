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
 * Compose and the Dashboard all use it, and since Nov 26 the Queue (the red
 * "Not connected" badge) and /api/streak (the /streak page) do too. This
 * covers the helpers and checks that each place still asks.
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
  connectedInScope, unconnectedForPost, streakTimeOf, streakDayMap, tiktokStudioConnected,
  connectionRowsFor,
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
  assert.equal(streakTimeOf({ ...base, status: 'published', published_at: '2026-11-20T15:00:04Z' }, true), '2026-11-20T15:00:00Z')
  // Held up by an outage and sent days later, it keeps the day it was due.
  assert.equal(streakTimeOf({ ...base, status: 'published', published_at: '2026-11-23T02:36:00Z' }, true), '2026-11-20T15:00:00Z')
  // Post Now has no scheduled_at: the time it went out.
  assert.equal(streakTimeOf({ status: 'published', scheduled_at: null, published_at: '2026-11-21T08:00:00Z', created_at: '2026-11-21T08:00:00Z' }, true), '2026-11-21T08:00:00Z')
  assert.equal(streakTimeOf({ ...base, status: 'partial', published_at: null }, true), '2026-11-20T15:00:00Z')
  assert.equal(streakTimeOf({ ...base, status: 'scheduled' }, true), '2026-11-20T15:00:00Z')
  assert.equal(streakTimeOf({ ...base, status: 'scheduled' }, false), null, 'a post that cannot go out never counts')
  assert.equal(streakTimeOf({ ...base, status: 'failed' }, true), null, 'a failed Post Now is not "streak safe"')
  assert.equal(streakTimeOf({ ...base, status: 'draft' }, true), null)
  assert.equal(streakTimeOf({ ...base, status: 'pending_approval' }, true), null)
})

test('/api/streak counts the UTC days posts went out, or can go out, from the window on', () => {
  const since = new Date('2026-01-01T00:00:00Z')
  const posts = [
    // Post Now leaves scheduled_at empty. The route filtered on it, so these never counted.
    { status: 'published', platforms: ['bluesky'], workspace_id: null, published_at: '2026-11-20T23:30:00Z', scheduled_at: null, created_at: '2026-11-20T23:30:00Z' },
    // Scheduled and connected: the day it is due.
    { status: 'scheduled', platforms: ['bluesky'], workspace_id: 'ws-personal', scheduled_at: '2026-11-21T15:00:00Z' },
    // Scheduled to a platform with nothing connected: never.
    { status: 'scheduled', platforms: ['mastodon'], workspace_id: 'ws-personal', scheduled_at: '2026-11-22T15:00:00Z' },
    // A client workspace posts from its own accounts, not the personal ones.
    { status: 'scheduled', platforms: ['bluesky'], workspace_id: 'ws-client', scheduled_at: '2026-11-23T15:00:00Z' },
    { status: 'scheduled', platforms: ['linkedin'], workspace_id: 'ws-client', scheduled_at: '2026-11-23T16:00:00Z' },
    // Someone else's workspace posts from their accounts, which we can't read: counts.
    { status: 'scheduled', platforms: ['bluesky'], workspace_id: 'ws-theirs', scheduled_at: '2026-11-24T15:00:00Z' },
    // A time with an offset lands on its UTC day (20:30 UTC on the 24th).
    { status: 'partial', platforms: ['bluesky'], published_at: '2026-11-25T01:30:00+05:00' },
    // Before the window, and posts that never count.
    { status: 'published', platforms: ['bluesky'], published_at: '2025-12-31T23:59:59Z' },
    { status: 'failed', platforms: ['bluesky'], created_at: '2026-11-25T10:00:00Z' },
    { status: 'draft', platforms: ['bluesky'], created_at: '2026-11-25T11:00:00Z' },
  ]
  assert.deepEqual(streakDayMap(posts, rows, owned, since), {
    '2026-11-20': 1, '2026-11-21': 1, '2026-11-23': 1, '2026-11-24': 2,
  })
  // A failed read of the connections or the workspaces: scheduled posts count, as before the check.
  const unchecked = { '2026-11-20': 1, '2026-11-21': 1, '2026-11-22': 1, '2026-11-23': 2, '2026-11-24': 2 }
  assert.deepEqual(streakDayMap(posts, null, owned, since), unchecked)
  assert.deepEqual(streakDayMap(posts, rows, null, since), unchecked)
  assert.deepEqual(streakDayMap([], rows, owned, since), {})
})

test('a TikTok Studio post can go out from any TikTok row of its author', () => {
  assert.equal(tiktokStudioConnected(rows), false)
  assert.equal(tiktokStudioConnected([...rows, { platform: 'tiktok', workspace_id: 'ws-client' }]), true)
  assert.equal(tiktokStudioConnected([]), false)
})

// Just enough of a Supabase client for connectionRowsFor: from().select().eq().
function fakeClient(results) {
  const calls = []
  return {
    calls,
    from: table => ({
      select: cols => ({
        eq: (col, val) => { calls.push([table, cols, col, val]); return Promise.resolve(results[table]) },
      }),
    }),
  }
}

test('the connections are two reads with their workspace, and a failed read flags nothing', async () => {
  const client = fakeClient({
    connected_accounts: { data: [{ platform: 'bluesky', workspace_id: null }], error: null },
    post_destinations:  { data: [{ platform: 'telegram', workspace_id: 'ws-client' }], error: null },
  })
  assert.deepEqual(await connectionRowsFor(client, 'u1'), [
    { platform: 'bluesky', workspace_id: null },
    { platform: 'telegram', workspace_id: 'ws-client' },
  ])
  assert.deepEqual(client.calls, [
    ['connected_accounts', 'platform, workspace_id', 'user_id', 'u1'],
    ['post_destinations',  'platform, workspace_id', 'user_id', 'u1'],
  ])

  const warn = console.warn
  console.warn = () => {}
  try {
    for (const failing of ['connected_accounts', 'post_destinations']) {
      const results = {
        connected_accounts: { data: [], error: null },
        post_destinations:  { data: [], error: null },
        [failing]: { data: null, error: { message: 'column does not exist' } },
      }
      assert.equal(await connectionRowsFor(fakeClient(results), 'u1'), null, `${failing} failing`)
    }
  } finally {
    console.warn = warn
  }
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

test('the Dashboard reads the newest posts, not the oldest 1,000', () => {
  // PostgREST caps a response at 1,000 rows. Ordered oldest first, an account
  // past that (the admin's, 1,828 posts) saw nothing scheduled and a zero
  // streak while 53 posts were queued (Nov 25, 2026).
  const dash = code(read('app/dashboard/page.tsx'))
  const load = dash.slice(dash.indexOf('const loadPosts = async'), dash.indexOf('const init = async'))
  assert.match(load, /\.order\('created_at', \{ ascending: false \}\)/)
  assert.match(load, /\.limit\(POSTS_READ_LIMIT\)/)
  assert.doesNotMatch(load, /\.order\('scheduled_at', \{ ascending: true \}\)/)
  assert.match(load, /count: 'exact', head: true/, 'a full page gets the Published total from a count')
  assert.match(dash, /\.sort\(\(a, b\) => new Date\(a\.scheduled_at\)\.getTime\(\) - new Date\(b\.scheduled_at\)\.getTime\(\)\)/,
    'Coming up shows the soonest posts')
})

test('the Queue marks a post that cannot go out, with two reads for the whole page', () => {
  const queue = code(read('app/queue/page.tsx'))
  assert.match(queue, /connectionRowsFor\(supabase, user\.id\)/)
  assert.equal(queue.match(/connectionRowsFor\(/g).length, 1, 'read once per load, not once per post')
  // Only in a workspace the viewer owns: anywhere else posts go out from the owner's accounts.
  assert.match(queue, /viewerOwnsThis\s*=\s*!!activeWorkspace && isOwnWorkspace\(activeWorkspace\)/)
  assert.match(queue, /connectionRows && viewerOwnsThis \? unconnectedForPost\(post, connectionRows, ownedWorkspaces\)/)
  assert.match(queue, /unconnected=\{unconnectedFor\(post\)\}/)
  assert.match(queue, /app_dashboard\.not_connected/)
  assert.match(queue, /tiktokStudioConnected\(connectionRows\)/)
})

test('/api/streak counts with streakTimeOf and the connection check, past 1,000 rows', () => {
  const streak = code(read('app/api/streak/route.ts'))
  assert.match(streak, /connectionRowsFor\(admin, user\.id\)/)
  assert.match(streak, /from\('workspaces'\)\.select\('id, is_personal'\)\.eq\('owner_id', user\.id\)/)
  assert.match(streak, /streakDayMap\(posts, rows, owned, since\)/)
  assert.match(streak, /selectAll</, 'paged: PostgREST returns 1,000 rows a request')
  assert.doesNotMatch(streak, /\.gte\('scheduled_at'/, 'a Post Now post has no scheduled_at')
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
