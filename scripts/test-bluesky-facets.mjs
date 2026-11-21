#!/usr/bin/env node
/**
 * Tests for lib/bluesky-facets.ts: the link facets that make links clickable
 * in SocialMate's Bluesky posts.
 *
 *   node scripts/test-bluesky-facets.mjs
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

const source = readFileSync(join(root, 'lib/bluesky-facets.ts'), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES5 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const { linkFacets, tagFacets, postFacets } = mod.exports

// What each facet covers, read back from the UTF-8 bytes the way Bluesky reads it.
function covered(text) {
  const bytes = Buffer.from(text, 'utf8')
  return linkFacets(text).map(f => ({
    text: bytes.subarray(f.index.byteStart, f.index.byteEnd).toString('utf8'),
    uri: f.features[0].uri,
    type: f.features[0].$type,
  }))
}

test('full links, with sentence punctuation left out', () => {
  assert.deepEqual(covered('See https://shop.com/item. Then go'), [
    { text: 'https://shop.com/item', uri: 'https://shop.com/item', type: 'app.bsky.richtext.facet#link' },
  ])
})

test('a bare domain becomes an https link', () => {
  assert.deepEqual(covered('Free plan, no card. socialmate.studio'), [
    { text: 'socialmate.studio', uri: 'https://socialmate.studio', type: 'app.bsky.richtext.facet#link' },
  ])
})

test('byte offsets count emoji and accents as UTF-8', () => {
  assert.deepEqual(covered('🎉 café https://x.com/ok'), [
    { text: 'https://x.com/ok', uri: 'https://x.com/ok', type: 'app.bsky.richtext.facet#link' },
  ])
})

test('brackets: kept when the link opened one, dropped when the sentence did', () => {
  assert.deepEqual(covered('(https://en.wikipedia.org/wiki/Mercury_(planet))').map(c => c.uri), [
    'https://en.wikipedia.org/wiki/Mercury_(planet)',
  ])
  assert.deepEqual(covered('(see https://shop.com)').map(c => c.uri), ['https://shop.com'])
})

test('not links: emails, file names, code, abbreviations', () => {
  assert.deepEqual(covered('email me@shop.com, open file.txt, run Node.js, e.g. this'), [])
})

test('several links, in order', () => {
  assert.deepEqual(covered('a.com then https://b.org/x and c.io').map(c => c.uri), [
    'https://a.com', 'https://b.org/x', 'https://c.io',
  ])
})

// Hashtags (Nov 20, 2026): read back the way Bluesky reads them.
function tags(text, fn = tagFacets) {
  const bytes = Buffer.from(text, 'utf8')
  return fn(text)
    .filter(f => f.features[0].$type === 'app.bsky.richtext.facet#tag')
    .map(f => ({ text: bytes.subarray(f.index.byteStart, f.index.byteEnd).toString('utf8'), tag: f.features[0].tag }))
}

test('hashtags become tag facets covering the # and the tag', () => {
  assert.deepEqual(tags('Free plan, no card. #SocialMediaTips #BuildInPublic'), [
    { text: '#SocialMediaTips', tag: 'SocialMediaTips' },
    { text: '#BuildInPublic', tag: 'BuildInPublic' },
  ])
})

test('trailing punctuation is left out of the tag', () => {
  assert.deepEqual(tags('Happy #Thanksgiving! Then #BlackFriday.'), [
    { text: '#Thanksgiving', tag: 'Thanksgiving' },
    { text: '#BlackFriday', tag: 'BlackFriday' },
  ])
})

test('not hashtags: numbers, C#, mid-word, a lone #', () => {
  assert.deepEqual(tags('Ranked #1, written in C#, issue#42, and # alone'), [])
})

test('tag offsets count emoji and accents as UTF-8', () => {
  assert.deepEqual(tags('🎉 café #2027Goals'), [{ text: '#2027Goals', tag: '2027Goals' }])
})

test('a full-width ＃ counts, as it does in the Bluesky app', () => {
  assert.deepEqual(tags('新年 ＃あけおめ'), [{ text: '＃あけおめ', tag: 'あけおめ' }])
})

test('postFacets: links and hashtags together, in order, with no tag inside a link', () => {
  const text = 'Read https://shop.com/#sale now #ShopSmall and socialmate.studio #CreatorTools'
  const all = postFacets(text)
  const bytes = Buffer.from(text, 'utf8')
  assert.deepEqual(all.map(f => bytes.subarray(f.index.byteStart, f.index.byteEnd).toString('utf8')), [
    'https://shop.com/#sale', '#ShopSmall', 'socialmate.studio', '#CreatorTools',
  ])
  for (let i = 1; i < all.length; i++) assert.ok(all[i].index.byteStart >= all[i - 1].index.byteEnd, 'no overlaps')
})

test('the Bluesky publisher and inbox replies send links and hashtags', () => {
  const publisher = readFileSync(join(root, 'lib/publish/bluesky.ts'), 'utf8')
  const reply = readFileSync(join(root, 'app/api/inbox/reply/route.ts'), 'utf8')
  assert.match(publisher, /postFacets\(content\)/)
  assert.match(reply, /postFacets\(reply_text\)/)
  assert.doesNotMatch(publisher + reply, /linkFacets\(/, 'link-only facets would drop the hashtags')
})
