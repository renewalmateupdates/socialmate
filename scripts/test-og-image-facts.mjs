#!/usr/bin/env node
/**
 * public/og-image.png is a picture, so nothing in the code changes it when a
 * price or a platform does. scripts/make-og-image.mjs records what it drew in
 * scripts/og-image-facts.json; this fails when that no longer matches
 * lib/plan.ts and lib/site-facts.ts.
 *
 *   node scripts/test-og-image-facts.mjs
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'
import { currentFacts, FACTS_PATH, OG_WIDTH, OG_HEIGHT } from './make-og-image.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

test('the share image shows the current prices, free cap and platforms', () => {
  const drawn = JSON.parse(readFileSync(FACTS_PATH, 'utf8'))
  assert.deepEqual(drawn, currentFacts(),
    'public/og-image.png is out of date. Run: node scripts/make-og-image.mjs')
})

test('the PNG is the size every page declares for it', () => {
  const png = readFileSync(join(root, 'public', 'og-image.png'))
  assert.equal(png.toString('ascii', 1, 4), 'PNG')
  // IHDR: width and height are the big-endian ints at bytes 16 and 20.
  assert.equal(png.readUInt32BE(16), OG_WIDTH)
  assert.equal(png.readUInt32BE(20), OG_HEIGHT)
  const layout = readFileSync(join(root, 'app', 'layout.tsx'), 'utf8')
  assert.match(layout, new RegExp(`url: '/og-image.png', width: ${OG_WIDTH}, height: ${OG_HEIGHT}`))
})
