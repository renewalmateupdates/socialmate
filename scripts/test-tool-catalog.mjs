#!/usr/bin/env node
/**
 * Checks lib/tools/catalog.ts against app/tools: every listed tool has a page,
 * and every tool page is listed (the index, the sitemap and each page's
 * "More free tools" strip all read the catalog).
 *
 *   node scripts/test-tool-catalog.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const catalog = readFileSync(join(root, 'lib/tools/catalog.ts'), 'utf8')
const hrefs = Array.from(catalog.matchAll(/href:\s*'([^']+)'/g), m => m[1])
const pages = readdirSync(join(root, 'app/tools'), { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(join(root, 'app/tools', d.name, 'page.tsx')))
  .map(d => `/tools/${d.name}`)

test('every catalog entry has a page', () => {
  assert.ok(hrefs.length > 0)
  for (const h of hrefs) assert.ok(existsSync(join(root, `app${h}/page.tsx`)), h)
})

test('every tool page is in the catalog, once', () => {
  assert.deepEqual([...hrefs].sort(), [...pages].sort())
  assert.equal(new Set(hrefs).size, hrefs.length)
})

test('every tool page shows the other tools', () => {
  for (const p of pages) {
    const src = readFileSync(join(root, `app${p}/page.tsx`), 'utf8')
    assert.ok(src.includes(`<MoreTools current="${p}"`), p)
  }
})
