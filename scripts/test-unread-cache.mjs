#!/usr/bin/env node
/**
 * The unread count shared between a person's tabs (lib/unread-cache.ts,
 * Nov 20, 2026): one request a minute per person, not per open tab.
 *
 *   node scripts/test-unread-cache.mjs
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
const read = rel => readFileSync(join(root, rel), 'utf8')
const code = src => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

function load(rel) {
  const { outputText } = ts.transpileModule(read(rel), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const mod = { exports: {} }
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
  return mod.exports
}

const { freshUnread, unreadEntry, unreadFromStored } = load('lib/unread-cache.ts')

test('a fresh answer from another tab is used', () => {
  const raw = unreadEntry(7, 'user-a', 1_000)
  assert.equal(freshUnread(raw, 'user-a', 1_000 + 49_000, 50_000), 7)
})

test('an old answer is not', () => {
  const raw = unreadEntry(7, 'user-a', 1_000)
  assert.equal(freshUnread(raw, 'user-a', 1_000 + 50_000, 50_000), null)
})

test("another person's answer is never shown", () => {
  const raw = unreadEntry(7, 'user-a', 1_000)
  assert.equal(freshUnread(raw, 'user-b', 2_000, 50_000), null)
  assert.equal(unreadFromStored(raw, 'user-b'), null)
  assert.equal(unreadFromStored(raw, 'user-a'), 7)
})

test('missing, broken or future-dated values are ignored', () => {
  assert.equal(freshUnread(null, 'user-a', 1, 50_000), null)
  assert.equal(freshUnread('not json', 'user-a', 1, 50_000), null)
  assert.equal(freshUnread(unreadEntry(3, 'user-a', 10_000), 'user-a', 5_000, 50_000), null)
  assert.equal(freshUnread(unreadEntry(3, 'user-a', 1), '', 2, 50_000), null)
  assert.equal(unreadFromStored(null, 'user-a'), null)
})

test('the badge hook reads, writes and listens to the shared value', () => {
  const src = code(read('hooks/useUnreadNotifications.ts'))
  assert.match(src, /freshUnread\(/, 'uses a fresh answer from another tab before asking')
  assert.match(src, /localStorage\.setItem\(UNREAD_CACHE_KEY/, 'shares its own answer')
  assert.match(src, /addEventListener\('storage'/, 'hears other tabs at once')
  assert.match(src, /useVisiblePoll\(/, 'still polls only while the tab is on screen')
  assert.match(src, /localStorage\.removeItem\(UNREAD_CACHE_KEY\)/, 'marking read clears the shared value')
})
