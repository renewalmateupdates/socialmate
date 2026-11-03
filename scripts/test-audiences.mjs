#!/usr/bin/env node
/**
 * Checks lib/audiences.ts against the app: the /for pages it lists, the hub,
 * and the claims every page must avoid.
 *
 *   node scripts/test-audiences.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))
const ts = require('typescript')
const { outputText } = ts.transpileModule(readFileSync(join(root, 'lib/audiences.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const { AUDIENCES, HANDBUILT_AUDIENCES, AUDIENCE_GROUPS, audienceHub } = mod.exports

const folders = readdirSync(join(root, 'app/for'), { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('['))
  .map(d => d.name)

test('every hand-built folder is on the hub list, and every listed one exists', () => {
  const listed = HANDBUILT_AUDIENCES.map(h => h.slug)
  assert.deepEqual([...listed].sort(), [...folders].sort())
})

test('no generated slug repeats a hand-built folder (the folder would win)', () => {
  for (const a of AUDIENCES) assert.ok(!folders.includes(a.slug), a.slug)
  assert.equal(new Set(AUDIENCES.map(a => a.slug)).size, AUDIENCES.length)
})

test('every generated page has a hub group', () => {
  for (const a of AUDIENCES) assert.ok(AUDIENCE_GROUPS[a.slug], a.slug)
  for (const slug of Object.keys(AUDIENCE_GROUPS)) assert.ok(AUDIENCES.some(a => a.slug === slug), `stale group ${slug}`)
})

test('the hub links every page exactly once', () => {
  const hrefs = audienceHub().flatMap(g => g.pages.map(p => p.href))
  assert.equal(hrefs.length, AUDIENCES.length + HANDBUILT_AUDIENCES.length)
  assert.equal(new Set(hrefs).size, hrefs.length)
})

test('every related link points at a page that exists', () => {
  const slugs = new Set([...AUDIENCES.map(a => a.slug), ...folders])
  for (const a of AUDIENCES) for (const r of a.related) {
    const ok = r.href.startsWith('/for/') ? slugs.has(r.href.slice(5)) : existsSync(join(root, `app${r.href}/page.tsx`))
    assert.ok(ok, `${a.slug} -> ${r.href}`)
  }
})

test('no page says unlimited or quotes a retired price', () => {
  for (const a of AUDIENCES) {
    const text = JSON.stringify(a)
    assert.ok(!/unlimited|no post (cap|limit)/i.test(text), a.slug)
    assert.ok(!/\$5\b|\$20\b/.test(text), a.slug)
  }
})

test('fan-platform pages leave out TikTok and LinkedIn', () => {
  for (const a of AUDIENCES.filter(a => /onlyfans|fansly|fanvue/.test(a.slug))) {
    assert.ok(!/tiktok|linkedin/i.test(JSON.stringify(a)), a.slug)
  }
})
