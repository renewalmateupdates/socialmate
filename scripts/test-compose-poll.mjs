#!/usr/bin/env node
/**
 * A saved draft's poll comes back when the draft is reopened (lib/compose-poll.ts).
 * On Nov 19, 2026 a draft saved with a Yes/No poll reopened with the poll panel
 * off and empty, and the next save would have written poll_data: null over it.
 *
 *   node scripts/test-compose-poll.mjs
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
const { outputText } = ts.transpileModule(readFileSync(join(root, 'lib/compose-poll.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const { draftPoll } = mod.exports

test('the poll saved on Nov 19 comes back as it was', () => {
  assert.deepEqual(draftPoll({ options: ['Yes', 'No'], duration: '1d' }), { options: ['Yes', 'No'], duration: '1d' })
})

test('no poll, or an empty one, means no panel', () => {
  for (const raw of [null, undefined, {}, { options: [] }, { options: 'Yes,No' }, 'poll', 7]) assert.equal(draftPoll(raw), null)
})

test('the panel always has at least two boxes and at most four', () => {
  assert.deepEqual(draftPoll({ options: ['Only one'] }).options, ['Only one', ''])
  assert.deepEqual(draftPoll({ options: ['a', 'b', 'c', 'd', 'e'] }).options, ['a', 'b', 'c', 'd'])
  assert.deepEqual(draftPoll({ options: ['a', 3, null, 'b'] }).options, ['a', 'b'])
})

test('an unknown duration falls back to one day', () => {
  assert.equal(draftPoll({ options: ['a', 'b'], duration: '30d' }).duration, '1d')
  assert.equal(draftPoll({ options: ['a', 'b'] }).duration, '1d')
  assert.equal(draftPoll({ options: ['a', 'b'], duration: '7d' }).duration, '7d')
})

test('Compose reads the poll back when it opens a draft', () => {
  const src = readFileSync(join(root, 'app/compose/page.tsx'), 'utf8')
  const load = src.slice(src.indexOf("if (draft.tags?.length > 0) setPostTags(draft.tags)"), src.indexOf('setCurrentDraftId(draftId)'))
  assert.match(load, /draftPoll\(draft\.poll_data\)/)
  assert.match(load, /setShowPollPanel\(true\)/)
})
