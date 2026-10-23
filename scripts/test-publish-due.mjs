#!/usr/bin/env node
/**
 * Tests for lib/publish/due.ts, the check that stops a post moved to a later
 * time from going out at the time it was first scheduled for.
 *
 *   node scripts/test-publish-due.mjs
 *
 * Loads the TypeScript module through the project's own `typescript` package,
 * so it needs no test framework.
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
const source = readFileSync(join(root, 'lib/publish/due.ts'), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const { notDueYet, DUE_TOLERANCE_MS } = mod.exports

const NOW = Date.parse('2026-10-22T20:00:00Z')
const at = ms => new Date(NOW + ms).toISOString()

test('a post moved a week later is not due', () => {
  assert.equal(notDueYet(at(7 * 86_400_000), NOW), true)
})

test('a post moved an hour later is not due', () => {
  assert.equal(notDueYet(at(3_600_000), NOW), true)
})

test('a post whose time has come is due', () => {
  assert.equal(notDueYet(at(0), NOW), false)
})

test('a post that is overdue is due (the 5-minute sweep and rescue rely on this)', () => {
  assert.equal(notDueYet(at(-3_600_000), NOW), false)
})

test('a wake-up a few seconds early still publishes', () => {
  assert.equal(notDueYet(at(5_000), NOW), false)
  assert.equal(notDueYet(at(DUE_TOLERANCE_MS), NOW), false)
})

test('just past the tolerance is not due', () => {
  assert.equal(notDueYet(at(DUE_TOLERANCE_MS + 1_000), NOW), true)
})

test('no time or an unreadable time never blocks a publish', () => {
  assert.equal(notDueYet(null, NOW), false)
  assert.equal(notDueYet(undefined, NOW), false)
  assert.equal(notDueYet('', NOW), false)
  assert.equal(notDueYet('not a date', NOW), false)
})

test('Postgres timestamptz text is read correctly', () => {
  assert.equal(notDueYet('2026-10-29 20:00:00+00', NOW), true)
  assert.equal(notDueYet('2026-10-22 19:00:00+00', NOW), false)
})
