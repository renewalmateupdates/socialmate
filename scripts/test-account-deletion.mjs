#!/usr/bin/env node
/**
 * Tests for lib/account-deletion.ts and the registry release in
 * lib/platform-jail.ts.
 *
 *   node scripts/test-account-deletion.mjs
 *
 * The case that started it (Nov 10, 2026): two people pressed Delete account
 * and were left with no profile, settings or workspace but a working login.
 * The route deleted their data first and the auth user last, and the auth
 * delete failed because a platform_account_registry row still named them.
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
// Only the admin client is stubbed: these functions are handed their db.
const cache = new Map()
function load(rel) {
  if (cache.has(rel)) return cache.get(rel).exports
  const source = readFileSync(join(root, rel), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const mod = { exports: {} }
  cache.set(rel, mod)
  const localRequire = (id) => {
    if (id === '@/lib/supabase-admin') return { getSupabaseAdmin: () => { throw new Error('tests pass their own db') } }
    if (id.startsWith('@/lib/')) return load(`lib/${id.slice('@/lib/'.length)}.ts`)
    return require(id)
  }
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, localRequire)
  return mod.exports
}

const { releasedForDeletedOwner, reconnectVerdict, COOLING_DAYS } = load('lib/platform-jail.ts')
const { deleteAccount } = load('lib/account-deletion.ts')

const DAY = 24 * 60 * 60 * 1000
const NOW = new Date('2026-11-10T12:00:00Z')
const U = 'user-being-deleted'
const OTHER = 'someone-else'

// An in-memory admin client. Every call lands in `log` in the order it ran,
// so a test can see what happened before the auth delete and what after.
function fakeDb(tables, { failAuthDelete = null, failReadOn = null, failRegistryWriteOn = null, failDeleteOn = null } = {}) {
  const data = structuredClone(tables)
  const log = []
  const matches = (row, filters) => filters.every(([col, val]) => row[col] === val)
  const db = {
    data,
    log,
    from(table) {
      const filters = []
      let mode = 'select'
      let values = null
      let range = null
      let single = false
      const exec = () => {
        log.push({ table, mode, filters: filters.map(([c, v]) => `${c}=${v}`).join('&') })
        const rows = data[table] ?? []
        if (mode === 'select') {
          if (failReadOn === table) return { data: null, error: { message: `${table} read failed` } }
          let out = rows.filter(r => matches(r, filters)).map(r => structuredClone(r))
          if (range) out = out.slice(range[0], range[1] + 1)
          return single ? { data: out[0] ?? null, error: null } : { data: out, error: null }
        }
        if (mode === 'update') {
          if (table === 'platform_account_registry' && filters.some(([c, v]) => c === 'id' && v === failRegistryWriteOn)) {
            return { data: null, error: { message: 'registry write failed' } }
          }
          for (const r of rows) if (matches(r, filters)) Object.assign(r, values)
          return { data: null, error: null }
        }
        if (failDeleteOn === table) return { data: null, error: { message: `${table} delete failed` } }
        data[table] = rows.filter(r => !matches(r, filters))
        return { data: null, error: null }
      }
      const q = {
        select() { return q },
        eq(col, val) { filters.push([col, val]); return q },
        order() { return q },
        range(from, to) { range = [from, to]; return q },
        maybeSingle() { single = true; return q },
        delete() { mode = 'delete'; return q },
        update(v) { mode = 'update'; values = v; return q },
        then(resolve, reject) {
          try { resolve(exec()) } catch (err) { reject(err) }
        },
      }
      return q
    },
    auth: {
      admin: {
        async deleteUser(id) {
          log.push({ table: 'auth.users', mode: 'delete', filters: `id=${id}` })
          if (failAuthDelete) return { data: { user: null }, error: { message: failAuthDelete } }
          return { data: { user: { id } }, error: null }
        },
      },
    },
    storage: {
      from(bucket) {
        return {
          async remove(paths) {
            log.push({ table: `storage:${bucket}`, mode: 'remove', paths })
            return { data: [], error: null }
          },
        }
      },
    },
  }
  return db
}

const registryActive = {
  id: 'reg-active', platform: 'bluesky', platform_account_id: 'did:plc:a', connected_to_user: U,
  status: 'active', disconnected_at: null, cooling_until: null, updated_at: '2026-10-28T19:02:52Z',
}
const registryCooling = {
  id: 'reg-cooling', platform: 'tiktok', platform_account_id: 'tt-1', connected_to_user: U,
  status: 'cooling', disconnected_at: '2026-11-01T00:00:00Z', cooling_until: '2026-12-16T00:00:00Z', updated_at: '2026-11-01T00:00:00Z',
}

function account() {
  return {
    platform_account_registry: [
      structuredClone(registryActive),
      structuredClone(registryCooling),
      { id: 'reg-other', platform: 'discord', platform_account_id: 'd-1', connected_to_user: OTHER, status: 'active', disconnected_at: null, cooling_until: null, updated_at: null },
    ],
    user_settings: [{ user_id: U, stripe_subscription_id: 'sub_123' }, { user_id: OTHER, stripe_subscription_id: null }],
    profiles: [{ id: U }, { id: OTHER }],
    posts: [{ id: 'p1', user_id: U }, { id: 'p2', user_id: OTHER }],
    workspaces: [{ id: 'w1', owner_id: U, is_personal: true }, { id: 'w2', owner_id: OTHER, is_personal: true }],
    connected_accounts: [{ id: 'c1', user_id: U }],
    media_items: [{ id: 'm1', user_id: U, storage_path: `${U}/photo.png` }, { id: 'm2', user_id: OTHER, storage_path: `${OTHER}/x.png` }],
    media_files: [],
    tiktok_posts: [{ id: 't1', user_id: U, video_storage_path: `${U}/clip.mp4` }, { id: 't2', user_id: U, video_storage_path: null }],
    affiliate_profiles: [{ id: 'aff-1', user_id: U }],
    affiliate_tax_forms: [{ id: 'tax-1', affiliate_id: 'aff-1' }],
    team_members: [{ id: 'tm1', owner_id: U, email: 'invitee@example.com' }, { id: 'tm2', owner_id: OTHER, email: 'deleted@example.com' }],
    usage_events: [{ id: 'ue1', user_id: U }, { id: 'ue2', user_id: OTHER }],
    user_achievements: [{ id: 'ua1', user_id: U }],
  }
}

function canceller() {
  const calls = []
  return { calls, cancel: async (id) => { calls.push(id) } }
}

const firstIndex = (log, pred) => log.findIndex(pred)
const isDataWrite = (e) => e.mode === 'delete' && e.table !== 'auth.users'

test('an active registry row starts the 45-day pause with no owner', () => {
  const next = releasedForDeletedOwner(registryActive, NOW)
  assert.equal(next.connected_to_user, null)
  assert.equal(next.status, 'cooling')
  assert.equal(next.disconnected_at, NOW.toISOString())
  assert.equal(Date.parse(next.cooling_until) - NOW.getTime(), COOLING_DAYS * DAY)

  // Nobody, the deleted owner's new account included, can pick it up during
  // the pause; anyone can after it.
  const during = new Date(NOW.getTime() + DAY)
  const after = new Date(NOW.getTime() + (COOLING_DAYS + 1) * DAY)
  assert.deepEqual(reconnectVerdict(next, 'new-account-same-person', during), { allowed: false, reason: 'in_cooldown', until: next.cooling_until })
  assert.deepEqual(reconnectVerdict(next, OTHER, during), { allowed: false, reason: 'in_cooldown', until: next.cooling_until })
  assert.deepEqual(reconnectVerdict(next, OTHER, after), { allowed: true })
})

test('a row that is already cooling keeps its dates and loses its owner', () => {
  const next = releasedForDeletedOwner(registryCooling, NOW)
  assert.equal(next.connected_to_user, null)
  assert.equal(next.status, 'cooling')
  assert.equal(next.disconnected_at, registryCooling.disconnected_at)
  assert.equal(next.cooling_until, registryCooling.cooling_until)
})

test('a released row stays released and loses its owner', () => {
  const next = releasedForDeletedOwner({ status: 'released', disconnected_at: null, cooling_until: null }, NOW)
  assert.equal(next.connected_to_user, null)
  assert.equal(next.status, 'released')
})

test('deletes the auth user before any data, then the data and files', async () => {
  const db = fakeDb(account())
  const stripe = canceller()
  const result = await deleteAccount(db, { userId: U, email: 'deleted@example.com', cancelSubscription: stripe.cancel, now: NOW })

  assert.deepEqual(result, { ok: true, cleanupErrors: [] })
  assert.deepEqual(stripe.calls, ['sub_123'])

  const authAt = firstIndex(db.log, e => e.table === 'auth.users')
  const firstDataDelete = firstIndex(db.log, isDataWrite)
  const lastRegistryWrite = db.log.map((e, i) => (e.table === 'platform_account_registry' && e.mode === 'update' ? i : -1)).filter(i => i >= 0).pop()
  assert.ok(authAt > 0, 'the auth user is deleted')
  assert.ok(lastRegistryWrite < authAt, 'the registry is freed before the auth delete')
  assert.ok(firstDataDelete > authAt, 'no data is deleted before the auth user is gone')
  assert.ok(firstIndex(db.log, e => e.mode === 'remove') > authAt, 'files go after the auth user')

  // The registry rows survive, without an owner; the other user's is untouched.
  const reg = Object.fromEntries(db.data.platform_account_registry.map(r => [r.id, r]))
  assert.equal(reg['reg-active'].connected_to_user, null)
  assert.equal(reg['reg-active'].status, 'cooling')
  assert.equal(reg['reg-cooling'].cooling_until, registryCooling.cooling_until)
  assert.equal(reg['reg-other'].connected_to_user, OTHER)

  // The account's rows are gone, everyone else's are not.
  for (const [table, col] of [['profiles', 'id'], ['user_settings', 'user_id'], ['posts', 'user_id'], ['workspaces', 'owner_id'], ['connected_accounts', 'user_id'], ['media_items', 'user_id'], ['tiktok_posts', 'user_id'], ['affiliate_profiles', 'user_id'], ['usage_events', 'user_id'], ['user_achievements', 'user_id']]) {
    assert.equal(db.data[table].filter(r => r[col] === U).length, 0, `${table} rows for the account are deleted`)
  }
  assert.equal(db.data.affiliate_tax_forms.length, 0, 'tax forms are found through the affiliate id')
  assert.deepEqual(db.data.team_members, [], 'their invitees and their own memberships are both removed')
  assert.equal(db.data.profiles.length, 1)
  assert.equal(db.data.posts.length, 1)
  assert.equal(db.data.media_items.length, 1)

  // Files listed by rows that cascade away with the auth user are still removed.
  const removed = db.log.filter(e => e.mode === 'remove').flatMap(e => e.paths)
  assert.deepEqual(removed.sort(), [`${U}/clip.mp4`, `${U}/photo.png`])
})

test('a failed auth delete leaves the account exactly as it was', async () => {
  const before = account()
  const db = fakeDb(before, { failAuthDelete: 'update or delete on table "users" violates foreign key constraint' })
  const result = await deleteAccount(db, { userId: U, email: 'deleted@example.com', cancelSubscription: canceller().cancel, now: NOW })

  assert.equal(result.ok, false)
  assert.equal(result.stage, 'auth')
  assert.equal(db.log.filter(isDataWrite).length, 0, 'no table is deleted from')
  assert.equal(db.log.filter(e => e.mode === 'remove').length, 0, 'no file is removed')
  assert.deepEqual(db.data, before, 'every row, the registry included, is as it was')
})

test('a failed read stops before anything is written or cancelled', async () => {
  const db = fakeDb(account(), { failReadOn: 'media_items' })
  const stripe = canceller()
  const result = await deleteAccount(db, { userId: U, email: null, cancelSubscription: stripe.cancel, now: NOW })

  assert.equal(result.ok, false)
  assert.equal(result.stage, 'read')
  assert.deepEqual(stripe.calls, [])
  assert.equal(db.log.filter(e => e.mode !== 'select').length, 0)
})

test('a failed registry write puts back the rows already freed and stops', async () => {
  const before = account()
  const db = fakeDb(before, { failRegistryWriteOn: 'reg-cooling' })
  const result = await deleteAccount(db, { userId: U, email: null, cancelSubscription: canceller().cancel, now: NOW })

  assert.equal(result.ok, false)
  assert.equal(result.stage, 'registry')
  assert.equal(firstIndex(db.log, e => e.table === 'auth.users'), -1, 'the auth user is not touched')
  assert.deepEqual(db.data, before)
})

test('a cleanup failure after the auth delete is reported, not returned as a failed delete', async () => {
  const db = fakeDb({ ...account(), feedback: [{ id: 'f1', user_id: U }] }, { failDeleteOn: 'feedback' })
  const result = await deleteAccount(db, { userId: U, email: null, cancelSubscription: canceller().cancel, now: NOW })

  assert.equal(result.ok, true)
  assert.deepEqual(result.cleanupErrors, ['feedback: feedback delete failed'])
  assert.equal(db.data.profiles.filter(r => r.id === U).length, 0, 'the rest of the cleanup still ran')
})
