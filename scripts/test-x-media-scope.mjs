#!/usr/bin/env node
/**
 * Tests for hasMediaScope in lib/publish/twitter.ts: posts with images to X
 * need the media.write scope, which accounts connected before Nov 2026 lack.
 *
 *   node scripts/test-x-media-scope.mjs
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

const source = readFileSync(join(root, 'lib/publish/twitter.ts'), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const mod = { exports: {} }
const stub = (id) => {
  if (id === '@/lib/supabase-admin') return { getSupabaseAdmin: () => { throw new Error('no db in tests') } }
  if (id === '@/lib/plan') return { resolveWorkspacePlan: async () => 'free' }
  if (id === './retry') return { RetryablePublishError: class extends Error {} }
  return require(id)
}
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, stub)
const { hasMediaScope } = mod.exports

test('the scope every account had before Nov 2026 cannot upload media', () => {
  assert.equal(hasMediaScope('tweet.read tweet.write users.read offline.access'), false)
})

test('a reconnected account can', () => {
  assert.equal(hasMediaScope('tweet.read tweet.write users.read offline.access media.write'), true)
  assert.equal(hasMediaScope('media.write tweet.write'), true)
})

test('nothing stored, or a look-alike, is not the permission', () => {
  assert.equal(hasMediaScope(null), false)
  assert.equal(hasMediaScope(undefined), false)
  assert.equal(hasMediaScope(''), false)
  assert.equal(hasMediaScope('media.writes tweet.write'), false)
})
