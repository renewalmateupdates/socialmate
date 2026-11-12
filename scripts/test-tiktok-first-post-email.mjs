#!/usr/bin/env node
/**
 * Tests for lib/tiktok-first-post-email.ts: who gets the one-off "post your
 * first TikTok" email and what it says.
 *
 *   node scripts/test-tiktok-first-post-email.mjs
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
const cache = new Map()
function load(rel) {
  if (cache.has(rel)) return cache.get(rel).exports
  const source = readFileSync(join(root, rel), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES5 },
  })
  const mod = { exports: {} }
  cache.set(rel, mod)
  const localRequire = (id) => {
    if (id === '@/lib/supabase-admin') return { getSupabaseAdmin: () => { throw new Error('no db in tests') } }
    if (id.startsWith('@/lib/')) return load(`lib/${id.slice('@/lib/'.length)}.ts`)
    return require(id)
  }
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, localRequire)
  return mod.exports
}

const { firstPostAudience, firstPostEmailHtml, FIRST_POST_SUBJECT } = load('lib/tiktok-first-post-email.ts')
const { INTERNAL_EMAILS } = load('lib/internal-accounts.ts')

const user = (id, email, fullName) => ({ id, email, user_metadata: fullName ? { full_name: fullName } : {} })

const USERS = [
  user('a', 'ann@example.com', 'Ann Lee'),        // connected, never posted, got Oct 23
  user('b', 'bo@example.com'),                     // connected, never posted, joined after Oct 23
  user('c', 'cy@example.com', 'Cy'),               // connected, already posted
  user('d', 'di@example.com', 'Di'),               // disconnected (like the Nov 9 user)
  user('e', 'ed@example.com', 'Ed'),               // connected, already got this email
  user('f', INTERNAL_EMAILS[0], 'Us'),             // our own account
  user('g', null, 'No Email'),                     // no address
]
const INPUT = {
  users: USERS,
  tiktokConnectedIds: ['a', 'b', 'c', 'e', 'f', 'g'],
  tiktokUsedIds: ['c', 'd'],
  alreadySentIds: ['e'],
  oct23Ids: ['a', 'c', 'd'],
}

test('only outside, still-connected people who never posted and were not sent', () => {
  const { targets, alreadySent, alreadyPosted } = firstPostAudience(INPUT)
  assert.deepEqual(targets.map(t => t.id), ['a', 'b'])
  assert.equal(alreadySent, 1)
  assert.equal(alreadyPosted, 1)
})

test('first name only, blank when unknown, and the Oct 23 flag', () => {
  const { targets } = firstPostAudience(INPUT)
  assert.deepEqual(targets[0], { id: 'a', email: 'ann@example.com', name: 'Ann', gotOct23: true })
  assert.deepEqual(targets[1], { id: 'b', email: 'bo@example.com', name: '', gotOct23: false })
})

test('a non-string full_name is ignored', () => {
  const { targets } = firstPostAudience({ ...INPUT, users: [{ id: 'a', email: 'x@example.com', user_metadata: { full_name: 42 } }] })
  assert.equal(targets[0].name, '')
})

test('the email: headline, Studio link, the right footnote', () => {
  const withName = firstPostEmailHtml('Ann', true, 'https://socialmate.studio')
  assert.match(withName, /Ann, your TikTok is connected and ready\./)
  assert.match(withName, /href="https:\/\/socialmate\.studio\/tiktok\/studio"/)
  assert.match(withName, /only follow-up to our October note/)
  assert.match(withName, /20 TikTok videos a month/)
  const noName = firstPostEmailHtml('', false, 'https://socialmate.studio')
  assert.match(noName, />Your TikTok is connected and ready\./)
  assert.match(noName, /A one-off note because you connected TikTok/)
  assert.doesNotMatch(noName, /October/)
})

test('a name cannot inject HTML', () => {
  const html = firstPostEmailHtml('<b>x</b>', false, 'https://socialmate.studio')
  assert.doesNotMatch(html, /<b>x<\/b>/)
  assert.match(html, /&lt;b&gt;x&lt;\/b&gt;/)
})

test('no em dashes in anything a reader sees', () => {
  const html = firstPostEmailHtml('Ann', true, 'https://socialmate.studio') + FIRST_POST_SUBJECT
  assert.doesNotMatch(html, /—/)
})
