#!/usr/bin/env node
/**
 * How TikTok Studio splits a video for TikTok's FILE_UPLOAD (lib/tiktok-chunks.ts).
 *   node scripts/test-tiktok-chunks.mjs
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
const { outputText } = ts.transpileModule(readFileSync(join(root, 'lib/tiktok-chunks.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const { tiktokChunkPlan, tiktokChunkRanges } = mod.exports

const MB = 1_000_000

test('a video up to 64 MB goes up as one piece, as before', () => {
  for (const size of [4_194_304, 20 * MB, 64 * MB]) {
    assert.deepEqual(tiktokChunkPlan(size), { chunk_size: size, total_chunk_count: 1 })
    assert.deepEqual(tiktokChunkRanges(size, tiktokChunkPlan(size)), [{ start: 0, end: size - 1 }])
  }
})

test("TikTok's own example: 50,000,123 bytes in 10,000,000-byte pieces is 5 pieces", () => {
  const ranges = tiktokChunkRanges(50_000_123, { chunk_size: 10_000_000, total_chunk_count: 5 })
  assert.equal(ranges.length, 5)
  assert.deepEqual(ranges.at(-1), { start: 40_000_000, end: 50_000_122 })
})

test('any size up to the 500 MB Studio limit splits within TikTok rules', () => {
  for (let size = 64 * MB + 1; size <= 500 * 1024 * 1024; size += 7_777_777) {
    const plan = tiktokChunkPlan(size)
    const ranges = tiktokChunkRanges(size, plan)
    assert.equal(ranges.length, plan.total_chunk_count)
    assert.ok(plan.total_chunk_count >= 2 && plan.total_chunk_count <= 1000, `${size}: ${plan.total_chunk_count} pieces`)
    assert.equal(ranges[0].start, 0)
    assert.equal(ranges.at(-1).end, size - 1)
    for (let i = 0; i < ranges.length; i++) {
      const len = ranges[i].end - ranges[i].start + 1
      if (i > 0) assert.equal(ranges[i].start, ranges[i - 1].end + 1, 'pieces touch, no gaps or overlaps')
      if (i < ranges.length - 1) assert.equal(len, plan.chunk_size)
      assert.ok(len >= 5 * 1024 * 1024 && len <= 64 * 1024 * 1024, `${size}: piece ${i} is ${len} bytes`)
    }
  }
})
