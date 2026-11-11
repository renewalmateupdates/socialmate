#!/usr/bin/env node
/**
 * Tests for lib/tiktok-studio.ts: the caption TikTok receives (caption plus the
 * Hashtags box, without repeats) and the cover frame picked when a video's
 * first frame is black.
 *
 *   node scripts/test-tiktok-studio.mjs
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

const source = readFileSync(join(root, 'lib/tiktok-studio.ts'), 'utf8')
// ES5, the project's own target, so the regex is checked the way tsc sees it.
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES5 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const {
  TIKTOK_CAPTION_MAX, captionHashtags, tagsToAppend, fullTikTokCaption, buildTikTokCaption,
  frameLight, isDarkFrame, defaultCoverTime,
} = mod.exports

// The Nov 11 promo caption, hashtags typed straight into it.
const PROMO = 'Built by one person, nights and weekends. socialmate.studio\n\n#socialmediascheduler #contentcreator #buildinpublic'

test('reads the hashtags already in a caption', () => {
  assert.deepEqual(captionHashtags(PROMO), ['socialmediascheduler', 'contentcreator', 'buildinpublic'])
  assert.deepEqual(captionHashtags('Ends a sentence #fyp. Then #Later, and #a#b'), ['fyp', 'later', 'a', 'b'])
  assert.deepEqual(captionHashtags(''), [])
})

test('hashtags in both the caption and the box are posted once', () => {
  const tags = ['buildinpublic', 'ContentCreator', 'fyp']
  assert.deepEqual(tagsToAppend(PROMO, tags), ['fyp'])
  assert.equal(buildTikTokCaption(PROMO, tags), PROMO + '\n\n#fyp')
})

test('box tags: # stripped, blanks and repeats dropped, order kept', () => {
  assert.deepEqual(tagsToAppend('', ['#one', ' two ', '', 'ONE', '##three', 'two']), ['one', 'two', 'three'])
})

test('a request body that is not an array means no tags', () => {
  assert.deepEqual(tagsToAppend('hi', 'fyp'), [])
  assert.deepEqual(tagsToAppend('hi', null), [])
  assert.equal(buildTikTokCaption('hi', undefined), 'hi')
})

test('caption shape matches what the routes always sent', () => {
  assert.equal(buildTikTokCaption('Hello', []), 'Hello')
  assert.equal(buildTikTokCaption('', ['a', 'b']), '#a #b')
  assert.equal(buildTikTokCaption('Hello', ['a', 'b']), 'Hello\n\n#a #b')
  assert.equal(buildTikTokCaption('', []), '')
})

test('the counter sees the full length, the route caps it', () => {
  const long = 'x'.repeat(2195)
  assert.equal(fullTikTokCaption(long, ['abcdef']).length, 2195 + 2 + 7)
  assert.equal(buildTikTokCaption(long, ['abcdef']).length, TIKTOK_CAPTION_MAX)
})

// RGBA helpers: a w x h frame filled with one grey, optionally with some white pixels.
function frame(grey, whiteShare = 0, pixels = 1000) {
  const data = new Uint8ClampedArray(pixels * 4)
  const white = Math.round(pixels * whiteShare)
  for (let p = 0; p < pixels; p++) {
    const v = p < white ? 255 : grey
    data[p * 4] = v; data[p * 4 + 1] = v; data[p * 4 + 2] = v; data[p * 4 + 3] = 255
  }
  return data
}

test('brightness of a frame', () => {
  const black = frameLight(frame(12), 1)
  assert.ok(Math.abs(black.luma - 12) < 0.01)
  assert.equal(black.lit, 0)
  const text = frameLight(frame(18, 0.05), 1)
  assert.ok(text.lit > 0.04 && text.lit < 0.06)
  assert.deepEqual(frameLight(new Uint8ClampedArray(0)), { luma: 0, lit: 0 })
})

test('what counts as black', () => {
  // The promo's first frame measured mean 12, max 12.
  assert.equal(isDarkFrame(frameLight(frame(12), 1)), true)
  // Dark background with text on it, like the promo at one second in.
  assert.equal(isDarkFrame(frameLight(frame(18, 0.05), 1)), false)
  // A dark-mode app screen (the audit demo measured mean 56).
  assert.equal(isDarkFrame(frameLight(frame(56), 1)), false)
})

test('the default cover is the first lit sampled frame', () => {
  const dark = frameLight(frame(5), 1)
  const lit = frameLight(frame(120), 1)
  assert.equal(defaultCoverTime([
    { time: 0.9, light: dark }, { time: 2.8, light: lit }, { time: 4.6, light: lit },
  ]), 2.8)
  // Nothing lit, or nothing measured: keep TikTok's default.
  assert.equal(defaultCoverTime([{ time: 0.9, light: dark }]), null)
  assert.equal(defaultCoverTime([{ time: 0.9 }, { time: 2.8 }]), null)
  assert.equal(defaultCoverTime([]), null)
})
