#!/usr/bin/env node
/**
 * Tests for lib/blog/feed.ts (the RSS feed at /blog/feed.xml).
 *
 *   node scripts/test-blog-feed.mjs
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
const { outputText } = ts.transpileModule(readFileSync(join(root, 'lib/blog/feed.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const { xmlEscape, prepareItems, buildFeed } = mod.exports

const item = (slug, date, extra = {}) => ({ slug, title: `Post ${slug}`, description: 'd', date: new Date(date), ...extra })

test('escapes the five XML characters and drops forbidden control characters', () => {
  assert.equal(xmlEscape(`a & b < c > "d" 'e'\u0001`), 'a &amp; b &lt; c &gt; &quot;d&quot; &apos;e&apos;')
})

test('newest first, one per slug, capped', () => {
  const out = prepareItems([item('a', '2026-01-01'), item('b', '2026-03-01'), item('a', '2026-05-01'), item('c', '2026-02-01')], 2)
  assert.deepEqual(out.map(i => i.slug), ['a', 'b'])
})

test('an invalid date sinks to the end instead of breaking the sort', () => {
  const out = prepareItems([item('x', 'not a date'), item('y', '2026-01-01')])
  assert.deepEqual(out.map(i => i.slug), ['y', 'x'])
})

test('the feed is well-formed enough to parse and carries each item', () => {
  const xml = buildFeed(prepareItems([item('hello-world', '2026-11-03', { title: 'Q&A <live>', category: 'Guides' })]))
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'))
  assert.ok(xml.includes('<title>Q&amp;A &lt;live&gt;</title>'))
  assert.ok(xml.includes('<link>https://socialmate.studio/blog/hello-world</link>'))
  assert.ok(xml.includes('<category>Guides</category>'))
  assert.ok(xml.includes('rel="self"'))
  // Every opened element closes.
  for (const tag of ['rss', 'channel', 'item', 'title', 'description']) {
    const open = (xml.match(new RegExp(`<${tag}[ >]`, 'g')) || []).length
    const close = (xml.match(new RegExp(`</${tag}>`, 'g')) || []).length
    assert.equal(open, close, tag)
  }
})

test('pubDate is an RFC 822 date', () => {
  const xml = buildFeed([item('a', '2026-11-03T12:00:00Z')])
  assert.ok(xml.includes('<pubDate>Tue, 03 Nov 2026 12:00:00 GMT</pubDate>'))
})
