#!/usr/bin/env node
/**
 * Tests for lib/soma-images.ts, which keeps SOMA from reusing an Unsplash photo.
 *
 *   node scripts/test-soma-images.mjs
 *
 * Loads the TypeScript module through the project's own `typescript` package,
 * so it needs no test framework. Unsplash is never called: fetch is stubbed.
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
const source = readFileSync(join(root, 'lib/soma-images.ts'), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const { unsplashPhotoKey, usedPhotoKeys, pickUnusedPhoto, fetchUnsplashImage } = mod.exports

// The same photo, as Unsplash hands it out on two different requests.
const img = (id, ixid = 'abc') =>
  `https://images.unsplash.com/photo-${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=${ixid}&ixlib=rb-4.1.0&q=80&w=400`
const photo = (id, ixid) => ({
  urls: { small: img(id, ixid) },
  user: { name: `Photographer ${id}`, links: { html: `https://unsplash.com/@p${id}` } },
  links: { download_location: `https://api.unsplash.com/photos/${id}/download` },
})

// Stub fetch: answers each photos/random call with the next batch, records every URL asked for.
function stubFetch(batches, { ok = true } = {}) {
  const calls = []
  globalThis.fetch = async url => {
    calls.push(String(url))
    if (String(url).includes('/download')) return { ok: true, json: async () => ({}) }
    return { ok, json: async () => batches.shift() ?? [] }
  }
  return calls
}

test('the same photo with a different tracking id has the same key', () => {
  assert.equal(unsplashPhotoKey(img('1', 'first')), unsplashPhotoKey(img('1', 'second')))
  assert.notEqual(unsplashPhotoKey(img('1')), unsplashPhotoKey(img('2')))
})

test('used keys come only from Unsplash images on past posts', () => {
  const used = usedPhotoKeys([
    { media_urls: [img('1'), 'Photo by A on Unsplash | https://unsplash.com/@a'] },
    { media_urls: ['https://xyz.supabase.co/storage/v1/object/public/media/clip.mp4'] },
    { media_urls: null },
    { media_urls: [] },
  ])
  assert.deepEqual([...used], [unsplashPhotoKey(img('1'))])
})

test('a photo used before is skipped even when its URL changed', () => {
  const used = new Set([unsplashPhotoKey(img('1', 'old'))])
  const picked = pickUnusedPhoto([photo('1', 'new'), photo('2')], used)
  assert.equal(picked.urls.small, img('2'))
  assert.equal(pickUnusedPhoto([photo('1', 'new')], used), null)
})

test('fetch returns the first unused photo and remembers it', async () => {
  const calls = stubFetch([[photo('1'), photo('2')]])
  const used = new Set([unsplashPhotoKey(img('1'))])
  const result = await fetchUnsplashImage('morning coffee', used, 'key')
  assert.equal(result[0], img('2'))
  assert.equal(result[1], 'Photo by Photographer 2 on Unsplash | https://unsplash.com/@p2')
  assert.ok(used.has(unsplashPhotoKey(img('2'))))
  assert.match(calls[0], /count=10/)
  assert.match(calls[0], /query=morning%20coffee/)
  await new Promise(r => setTimeout(r, 0))
  assert.ok(calls.some(u => u.startsWith('https://api.unsplash.com/photos/2/download')), 'download ping for the photo used')
})

test('when the keyword batch is all used, it tries the general query once', async () => {
  const calls = stubFetch([[photo('1')], [photo('3')]])
  const used = new Set([unsplashPhotoKey(img('1'))])
  const result = await fetchUnsplashImage('morning coffee', used, 'key')
  assert.equal(result[0], img('3'))
  assert.match(calls[1], /query=creator%20social%20media/)
})

test('when every photo offered was used, the post gets no photo instead of a repeat', async () => {
  stubFetch([[photo('1')], [photo('1', 'again')]])
  const used = new Set([unsplashPhotoKey(img('1'))])
  assert.equal(await fetchUnsplashImage('morning coffee', used, 'key'), null)
})

test('two posts in one run never get the same photo', async () => {
  stubFetch([[photo('1'), photo('2')], [photo('1', 'x'), photo('2', 'y'), photo('3')]])
  const used = new Set()
  const a = await fetchUnsplashImage('desk setup', used, 'key')
  const b = await fetchUnsplashImage('desk setup', used, 'key')
  assert.notEqual(unsplashPhotoKey(a[0]), unsplashPhotoKey(b[0]))
})

test('a refused request stops without trying again', async () => {
  const calls = stubFetch([[photo('1')]], { ok: false })
  assert.equal(await fetchUnsplashImage('morning coffee', new Set(), 'key'), null)
  assert.equal(calls.length, 1)
})

test('no access key means no request and no photo', async () => {
  const calls = stubFetch([[photo('1')]])
  assert.equal(await fetchUnsplashImage('morning coffee', new Set(), undefined), null)
  assert.equal(calls.length, 0)
})
