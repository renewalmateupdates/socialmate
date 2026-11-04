#!/usr/bin/env node
/**
 * Tests for lib/tool-draft.ts: the post a free tool hands to onboarding and Compose.
 *
 *   node scripts/test-tool-draft.mjs
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
const { outputText } = ts.transpileModule(readFileSync(join(root, 'lib/tool-draft.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const { makeToolDraft, parseToolDraft, TOOL_DRAFT_TTL_MS, TOOL_DRAFT_MAX_CHARS, TOOL_LABELS, START_FROM_TOOL } = mod.exports

const NOW = 1_800_000_000_000

test('makes a trimmed, stamped draft, and nothing from empty text or an unknown tool', () => {
  assert.deepEqual(makeToolDraft('  hello  ', 'character-counter', NOW), { text: 'hello', tool: 'character-counter', savedAt: NOW })
  assert.equal(makeToolDraft('   ', 'character-counter', NOW), null)
  assert.equal(makeToolDraft('hi', 'not-a-tool', NOW), null)
})

test('caps very long text', () => {
  assert.equal(makeToolDraft('x'.repeat(TOOL_DRAFT_MAX_CHARS + 50), 'thread-splitter', NOW).text.length, TOOL_DRAFT_MAX_CHARS)
})

test('round-trips through storage', () => {
  const d = makeToolDraft('Launch day', 'linkedin-formatter', NOW)
  assert.deepEqual(parseToolDraft(JSON.stringify(d), NOW + 1000), d)
})

test('refuses anything expired, from the future, malformed or for an unknown tool', () => {
  const d = makeToolDraft('Launch day', 'utm-builder', NOW)
  assert.equal(parseToolDraft(JSON.stringify(d), NOW + TOOL_DRAFT_TTL_MS + 1), null)
  assert.equal(parseToolDraft(JSON.stringify({ ...d, savedAt: NOW + 3_600_000 }), NOW), null)
  assert.equal(parseToolDraft('{not json', NOW), null)
  assert.equal(parseToolDraft(null, NOW), null)
  assert.equal(parseToolDraft(JSON.stringify({ ...d, tool: 'evil' }), NOW), null)
  assert.equal(parseToolDraft(JSON.stringify({ ...d, text: '   ' }), NOW), null)
  assert.equal(parseToolDraft(JSON.stringify({ ...d, savedAt: 'yesterday' }), NOW), null)
})

test('every tool has a label, and the button goes through /start', () => {
  for (const tool of ['character-counter', 'linkedin-formatter', 'thread-splitter', 'discord-timestamp', 'utm-builder']) {
    assert.ok(TOOL_LABELS[tool], tool)
  }
  assert.equal(START_FROM_TOOL, '/start?from=tool')
})
