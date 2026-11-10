#!/usr/bin/env node
/**
 * Tests for lib/admin-metrics.ts: how the /admin pages read and count.
 *
 *   node scripts/test-admin-metrics.mjs
 *
 * The case that started it (Nov 10, 2026): /admin/users said 4 accounts had
 * ever published when 7 had. The database returns at most 1,000 rows per
 * request, the route asked for 20,000, and everyone past row 1,000 read as
 * "0 pub". These tests use a fake database that enforces the same cap.
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

// Loads a lib file, resolving '@/lib/x' imports to their TypeScript source.
function loadTs(rel) {
  const { outputText } = ts.transpileModule(readFileSync(join(root, rel), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const mod = { exports: {} }
  const req = id => (id.startsWith('@/') ? loadTs(`${id.slice(2)}.ts`) : require(id))
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, req)
  return mod.exports
}

const {
  PAGE_SIZE, selectAll, listAllAuthUsers, postWentOut, postWentOutSince, platformOutcome,
  isPersonActivity, latestIso, everDid, loadAccountFacts, internalIdsOf,
} = loadTs('lib/admin-metrics.ts')

// A database that behaves like PostgREST here: whatever is asked for, one
// response holds at most 1,000 rows. Supports the calls the helpers make.
function fakeDb(tables, authUsers = []) {
  return {
    from(table) {
      const rows = tables[table] ?? []
      let filtered = rows
      const q = {
        select() { return q },
        in(col, values) { filtered = filtered.filter(r => values.includes(r[col])); return q },
        order() { return q },
        limit() { return q },
        async range(from, to) {
          return { data: filtered.slice(from, Math.min(to + 1, from + PAGE_SIZE)), error: null }
        },
        then(resolve) { resolve({ data: filtered.slice(0, PAGE_SIZE), error: null }) },
      }
      return q
    },
    auth: {
      admin: {
        // Real GoTrue caps per_page too; this one caps at 50 to prove the
        // loop does not trust the requested page size.
        async listUsers({ page, perPage }) {
          const size = Math.min(perPage, 50)
          return { data: { users: authUsers.slice((page - 1) * size, page * size) }, error: null }
        },
      },
    },
  }
}

test('selectAll reads past the 1,000-row cap', async () => {
  const posts = Array.from({ length: 2345 }, (_, i) => ({ id: i, user_id: `u${i % 7}` }))
  const db = fakeDb({ posts })
  const capped = await db.from('posts').select('*').limit(20000)
  assert.equal(capped.data.length, 1000, 'the fake enforces the cap, like production')
  const all = await selectAll('posts', () => db.from('posts').select('*'))
  assert.equal(all.length, 2345)
})

test('selectAll throws on an error instead of returning nothing', async () => {
  const broken = { range: async () => ({ data: null, error: { message: 'column posts.nope does not exist' } }) }
  await assert.rejects(selectAll('posts', () => broken), /posts: column posts.nope does not exist/)
})

test('selectAll stops on an exact multiple of the page size', async () => {
  const db = fakeDb({ posts: Array.from({ length: 2000 }, (_, i) => ({ id: i })) })
  assert.equal((await selectAll('posts', () => db.from('posts').select('*'))).length, 2000)
})

test('listAllAuthUsers keeps paging when the server caps the page size', async () => {
  const users = Array.from({ length: 261 }, (_, i) => ({ id: `u${i}`, email: `p${i}@example.com` }))
  assert.equal((await listAllAuthUsers(fakeDb({}, users))).length, 261)
})

test('a post went out if it reached any platform', () => {
  assert.equal(postWentOut({ status: 'published', published_at: '2026-11-01T00:00:00Z' }), true)
  assert.equal(postWentOut({ status: 'partial', published_at: '2026-11-01T00:00:00Z' }), true)
  assert.equal(postWentOut({ status: 'partial', published_at: null }), true)
  assert.equal(postWentOut({ status: 'failed', published_at: null }), false)
  assert.equal(postWentOut({ status: 'scheduled', published_at: null }), false)
  assert.equal(postWentOut({ status: 'draft' }), false)
  assert.equal(postWentOutSince({ status: 'published', published_at: '2026-11-09T00:00:00Z' }, '2026-11-03T00:00:00Z'), true)
  assert.equal(postWentOutSince({ status: 'published', published_at: '2026-10-09T00:00:00Z' }, '2026-11-03T00:00:00Z'), false)
})

test('a partial post succeeded only where it has a platform post id', () => {
  const p = { status: 'partial', platforms: ['telegram', 'twitter', 'bluesky'], platform_post_ids: { bluesky: 'a', telegram: 'b' } }
  assert.equal(platformOutcome(p, 'bluesky'), 'published')
  assert.equal(platformOutcome(p, 'telegram'), 'published')
  assert.equal(platformOutcome(p, 'twitter'), 'failed')
  assert.equal(platformOutcome({ status: 'published' }, 'discord'), 'published')
  assert.equal(platformOutcome({ status: 'failed' }, 'discord'), 'failed')
  assert.equal(platformOutcome({ status: 'scheduled' }, 'discord'), 'other')
})

test('scheduler-fired events are not the person being active', () => {
  assert.equal(isPersonActivity('funnel_compose_opened'), true)
  assert.equal(isPersonActivity('funnel_post_failed'), true)
  assert.equal(isPersonActivity('funnel_post_published'), false)
  assert.equal(isPersonActivity('funnel_tiktok_post_done'), false)
  assert.equal(isPersonActivity('reactivation_email'), false)
})

test('latestIso picks the newest and skips blanks', () => {
  assert.equal(latestIso(null, '2026-10-02T00:00:00Z', undefined, '2026-11-08T12:00:00+00:00'), '2026-11-08T12:00:00+00:00')
  assert.equal(latestIso(null, undefined), null)
})

test('everDid unions rows and events and says which came from events only', () => {
  const r = everDid(['a', 'b'], ['b', 'c', 'c'])
  assert.deepEqual(Array.from(r.ids).sort(), ['a', 'b', 'c'])
  assert.deepEqual(Array.from(r.eventsOnly), ['c'])
})

test('loadAccountFacts counts the Nov 10 shape correctly', async () => {
  // Ours publishes 1,800 posts first, so every customer post sits past row
  // 1,000, which is exactly what hid them from /admin/users.
  const users = [
    { id: 'ours', email: 'socialmatehq@gmail.com' },
    { id: 'discord', email: 'a@example.com' },
    { id: 'deleted', email: 'b@example.com' },
    { id: 'gone', email: 'c@example.com' },
    { id: 'idle', email: 'd@example.com' },
  ]
  const posts = [
    ...Array.from({ length: 1800 }, (_, i) => ({ id: `o${i}`, user_id: 'ours', status: 'published', published_at: '2026-10-01T00:00:00Z' })),
    ...Array.from({ length: 11 }, (_, i) => ({ id: `d${i}`, user_id: 'discord', status: 'published', published_at: '2026-11-06T00:00:00Z' })),
    { id: 'x1', user_id: 'idle', status: 'draft', published_at: null },
  ]
  const usage_events = [
    { id: 1, user_id: 'deleted', event_type: 'funnel_post_published', created_at: '2026-10-24T12:03:50Z' },
    { id: 2, user_id: 'deleted', event_type: 'funnel_connect_succeeded', created_at: '2026-10-24T11:00:00Z' },
    { id: 3, user_id: 'gone', event_type: 'funnel_connect_succeeded', created_at: '2026-10-20T11:00:00Z' },
    { id: 4, user_id: 'idle', event_type: 'funnel_compose_opened', created_at: '2026-10-20T11:00:00Z' },
  ]
  const connected_accounts = [{ id: 1, user_id: 'discord' }, { id: 2, user_id: 'ours' }]
  const f = await loadAccountFacts(fakeDb({ posts, usage_events, connected_accounts }, users))

  assert.deepEqual(Array.from(f.internalIds), ['ours'])
  assert.equal(f.customers.length, 4)
  assert.ok(f.published.has('discord'), 'a customer past row 1,000 still counts')
  assert.ok(f.published.has('deleted'), 'published, then deleted the post')
  assert.deepEqual(Array.from(f.publishedDeleted), ['deleted'])
  assert.ok(!f.published.has('idle'), 'a draft is not a publish')
  assert.ok(f.posted.has('idle') && f.posted.has('deleted'))
  assert.deepEqual(Array.from(f.connected).sort(), ['deleted', 'discord', 'gone', 'ours'])
  assert.deepEqual(Array.from(f.connectedEarlier).sort(), ['deleted', 'gone'])
  assert.equal(f.lastPublishedAt.get('discord'), '2026-11-06T00:00:00Z')
  assert.equal(f.lastPublishedAt.get('deleted'), '2026-10-24T12:03:50Z')
})

test('internalIdsOf matches lib/internal-accounts.ts, case-insensitively', () => {
  const ids = internalIdsOf([{ id: '1', email: 'SocialMateHQ@gmail.com' }, { id: '2', email: 'someone@example.com' }, { id: '3' }])
  assert.deepEqual(Array.from(ids), ['1'])
})
