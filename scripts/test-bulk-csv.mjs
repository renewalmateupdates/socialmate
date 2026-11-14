#!/usr/bin/env node
/**
 * Tests for lib/bulk-csv.ts: the Bulk Scheduler's CSV import.
 *
 *   node scripts/test-bulk-csv.mjs
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
const { outputText } = ts.transpileModule(readFileSync(join(root, 'lib/bulk-csv.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const { parseCsv, parseBulkCsv, bulkCsvTemplate } = mod.exports

const OPTS = { allowed: ['twitter', 'bluesky', 'mastodon', 'discord', 'telegram', 'linkedin'], defaultPlatforms: ['discord'], defaultTime: '09:00' }

test('parses quoted fields with commas, doubled quotes and line breaks', () => {
  const rows = parseCsv('a,b\r\n"one, two","say ""hi""\nthere"\r\n')
  assert.deepEqual(rows, [['a', 'b'], ['one, two', 'say "hi"\nthere']])
})

test('drops blank lines and a byte-order mark', () => {
  assert.deepEqual(parseCsv('﻿x\n\n\ny\n'), [['x'], ['y']])
})

test('reads columns by header name in any order, with Excel dates and 12-hour times', () => {
  const csv = 'Platforms,Time,Content,Date\nbluesky; x,5:30 PM,Hello,12/2/2026\n'
  const { posts, unknownPlatforms } = parseBulkCsv(csv, OPTS)
  assert.deepEqual(posts, [{ content: 'Hello', date: '2026-12-02', time: '17:30', platforms: ['bluesky', 'twitter'] }])
  assert.deepEqual(unknownPlatforms, [])
})

test('fills blank platforms and time from the defaults', () => {
  const { posts } = parseBulkCsv('content,date\nHi,2026-12-01\n', OPTS)
  assert.deepEqual(posts[0], { content: 'Hi', date: '2026-12-01', time: '09:00', platforms: ['discord'] })
})

test('flags bad dates, bad times and unsupported platforms without dropping the row', () => {
  const { posts, unknownPlatforms } = parseBulkCsv('content,date,time,platforms\nA,2026-02-30,25:00,instagram\n', OPTS)
  assert.equal(posts.length, 1)
  assert.match(posts[0].problem, /date/)
  assert.match(posts[0].problem, /time/)
  assert.match(posts[0].problem, /platform/)
  assert.deepEqual(unknownPlatforms, ['instagram'])
})

test('12 AM is midnight and 12 PM is noon', () => {
  const { posts } = parseBulkCsv('content,time\na,12:00 AM\nb,12 PM\n', OPTS)
  assert.deepEqual(posts.map(p => p.time), ['00:00', '12:00'])
})

test('skips rows with no content and explains a missing content column', () => {
  assert.equal(parseBulkCsv('content,date\n,2026-12-01\nx,\n', OPTS).skippedEmpty, 1)
  assert.match(parseBulkCsv('text_body,date\nx,2026-12-01\n', OPTS).error, /content/)
  assert.match(parseBulkCsv('', OPTS).error, /empty/)
})

test('the template parses back into its two example rows', () => {
  const { posts } = parseBulkCsv(bulkCsvTemplate(), OPTS)
  assert.equal(posts.length, 2)
  assert.ok(posts.every(p => !p.problem))
  assert.deepEqual(posts[0].platforms, ['bluesky', 'linkedin'])
})
