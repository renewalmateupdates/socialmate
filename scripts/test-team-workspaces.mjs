#!/usr/bin/env node
/**
 * Tests for lib/team-workspaces.ts: whose accounts a workspace posts to, and
 * what each team role may do there.
 *
 *   node scripts/test-team-workspaces.mjs
 *
 * The case that started it (1 Nov 2026): a free-plan owner's editor could not
 * post to the owner's LinkedIn, because every publish path looked up accounts
 * under the editor's own user_id.
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
const source = readFileSync(join(root, 'lib/team-workspaces.ts'), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const {
  accountScopeFor, resolveWorkspaceAccess, requiresApproval, canCreatePosts, realWorkspaceId,
  canManagePost, managesTeamPosts,
} = mod.exports

// A just-enough Supabase stand-in: from(table).select().eq()...maybeSingle()
// returns the first row matching every eq() filter.
function fakeDb(tables) {
  return {
    from(table) {
      const filters = []
      const q = {
        select() { return q },
        eq(col, val) { filters.push([col, val]); return q },
        async maybeSingle() {
          const row = (tables[table] ?? []).find(r => filters.every(([c, v]) => r[c] === v))
          return { data: row ?? null, error: null }
        },
      }
      return q
    },
  }
}

const OWNER  = 'owner-uuid'
const EDITOR = 'editor-uuid'
const db = fakeDb({
  workspaces: [
    { id: 'ws-owner-personal', owner_id: OWNER, is_personal: true },
    { id: 'ws-owner-client',   owner_id: OWNER, is_personal: false },
  ],
  team_members: [
    { owner_id: OWNER, email: 'editor@example.com', role: 'editor', status: 'active' },
    { owner_id: OWNER, email: 'gone@example.com',   role: 'editor', status: 'pending' },
    { owner_id: OWNER, email: 'look@example.com',   role: 'viewer', status: 'active' },
    { owner_id: OWNER, email: 'boss@example.com',   role: 'admin',  status: 'active' },
  ],
})

test("a team member's post goes to the owner's personal accounts", async () => {
  const scope = await accountScopeFor(db, 'ws-owner-personal', EDITOR)
  assert.deepEqual(scope, { ownerId: OWNER, accountWorkspaceId: null })
})

test('a client workspace scopes accounts to that workspace, under its owner', async () => {
  const scope = await accountScopeFor(db, 'ws-owner-client', EDITOR)
  assert.deepEqual(scope, { ownerId: OWNER, accountWorkspaceId: 'ws-owner-client' })
})

test('no workspace, or the sentinel, means the author\'s own personal accounts', async () => {
  assert.deepEqual(await accountScopeFor(db, null, EDITOR), { ownerId: EDITOR, accountWorkspaceId: null })
  assert.deepEqual(await accountScopeFor(db, 'personal', EDITOR), { ownerId: EDITOR, accountWorkspaceId: null })
})

test('an unknown workspace keeps the old behaviour rather than guessing', async () => {
  assert.deepEqual(await accountScopeFor(db, 'ws-missing', EDITOR), { ownerId: EDITOR, accountWorkspaceId: 'ws-missing' })
})

test('the owner is the owner', async () => {
  const access = await resolveWorkspaceAccess(db, { id: OWNER, email: 'owner@example.com' }, 'ws-owner-personal')
  assert.equal(access.role, 'owner')
  assert.equal(access.ownerId, OWNER)
})

test('an active editor gets the editor role and the owner\'s accounts', async () => {
  const access = await resolveWorkspaceAccess(db, { id: EDITOR, email: 'editor@example.com' }, 'ws-owner-personal')
  assert.equal(access.role, 'editor')
  assert.equal(access.ownerId, OWNER)
  assert.equal(access.accountWorkspaceId, null)
})

test('a pending invite or a stranger has no access', async () => {
  assert.equal(await resolveWorkspaceAccess(db, { id: 'x', email: 'gone@example.com' }, 'ws-owner-personal'), null)
  assert.equal(await resolveWorkspaceAccess(db, { id: 'y', email: 'nobody@example.com' }, 'ws-owner-personal'), null)
  assert.equal(await resolveWorkspaceAccess(db, { id: 'z' }, 'ws-owner-personal'), null)
})

test('an unknown workspace grants nothing', async () => {
  assert.equal(await resolveWorkspaceAccess(db, { id: OWNER, email: 'owner@example.com' }, 'ws-missing'), null)
})

test('approval binds editors and clients only where the owner has an approval queue', () => {
  assert.equal(requiresApproval('editor', 'free'), false)
  assert.equal(requiresApproval('client', 'free'), false)
  assert.equal(requiresApproval('editor', 'pro'), true)
  assert.equal(requiresApproval('client', 'agency'), true)
  for (const role of ['owner', 'admin', 'viewer']) {
    for (const plan of ['free', 'pro', 'agency']) assert.equal(requiresApproval(role, plan), false)
  }
})

test('viewers cannot create posts; everyone else can', () => {
  assert.equal(canCreatePosts('viewer'), false)
  for (const role of ['owner', 'admin', 'editor', 'client']) assert.equal(canCreatePosts(role), true)
})

test('realWorkspaceId drops the sentinel and empties', () => {
  assert.equal(realWorkspaceId('personal'), null)
  assert.equal(realWorkspaceId(''), null)
  assert.equal(realWorkspaceId(undefined), null)
  assert.equal(realWorkspaceId('abc'), 'abc')
})

// ─── Managing team posts (Queue, Calendar, Drafts) ──────────────────────────
// The case: an owner's assistant scheduled posts that the owner could not see,
// move, cancel or delete, because every query and write was "author only".

const editorPost = { user_id: EDITOR, workspace_id: 'ws-owner-personal' }
const ownerPost  = { user_id: OWNER,  workspace_id: 'ws-owner-personal' }

test('authors can always manage their own posts', async () => {
  assert.equal(await canManagePost(db, { id: EDITOR, email: 'editor@example.com' }, editorPost), true)
  assert.equal(await canManagePost(db, { id: OWNER, email: 'owner@example.com' }, { user_id: OWNER, workspace_id: null }), true)
})

test("the owner and admins manage their team's posts", async () => {
  assert.equal(await canManagePost(db, { id: OWNER, email: 'owner@example.com' }, editorPost), true)
  assert.equal(await canManagePost(db, { id: 'admin-uuid', email: 'boss@example.com' }, editorPost), true)
  assert.equal(await canManagePost(db, { id: OWNER, email: 'owner@example.com' }, { user_id: EDITOR, workspace_id: 'ws-owner-client' }), true)
})

test("editors and viewers cannot change someone else's post", async () => {
  assert.equal(await canManagePost(db, { id: EDITOR, email: 'editor@example.com' }, ownerPost), false)
  assert.equal(await canManagePost(db, { id: 'viewer-uuid', email: 'look@example.com' }, editorPost), false)
})

test('strangers, and posts with no workspace, belong to their author only', async () => {
  assert.equal(await canManagePost(db, { id: 'y', email: 'nobody@example.com' }, editorPost), false)
  assert.equal(await canManagePost(db, { id: OWNER, email: 'owner@example.com' }, { user_id: EDITOR, workspace_id: null }), false)
  assert.equal(await canManagePost(db, { id: OWNER, email: 'owner@example.com' }, { user_id: EDITOR, workspace_id: 'personal' }), false)
})

test('only owners and admins manage team posts', () => {
  assert.equal(managesTeamPosts('owner'), true)
  assert.equal(managesTeamPosts('admin'), true)
  for (const role of ['editor', 'viewer', 'client']) assert.equal(managesTeamPosts(role), false)
})
