#!/usr/bin/env node
/**
 * Tests for the free image tools (Nov 13, 2026):
 *   lib/tools/image-sizes.ts   crop, fit, drag and quote-text math
 *   lib/tool-image.ts          the image "Use in a post" hands to Compose
 *
 *   node scripts/test-image-tools.mjs
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const nodeRequire = createRequire(join(root, 'package.json'))
const ts = nodeRequire('typescript')

function load(path) {
  const { outputText } = ts.transpileModule(readFileSync(join(root, path), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const mod = { exports: {} }
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, nodeRequire)
  return mod.exports
}

const sz = load('lib/tools/image-sizes.ts')
const ti = load('lib/tool-image.ts')

const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-6, `${msg ?? ''} ${a} vs ${b}`)

// ── Presets ─────────────────────────────────────────────────────────────────

test('the presets are the agreed sizes, each id once', () => {
  const sizes = Object.fromEntries(sz.IMAGE_PRESETS.map(p => [p.id, `${p.width}x${p.height}`]))
  assert.deepEqual(sizes, {
    x: '1600x900', linkedin: '1200x627', bluesky: '1000x1000', discord: '1280x720',
    youtube: '1280x720', tiktok: '1080x1920', pinterest: '1000x1500', square: '1080x1080',
  })
  assert.equal(sz.presetById('nope').id, 'x')
  assert.equal(sz.presetById('tiktok').height, 1920)
})

// ── Crop to fill ────────────────────────────────────────────────────────────

test('a wide photo cropped to a square keeps full height and slides sideways', () => {
  const c = sz.coverCrop(4000, 2000, 1080, 1080)
  assert.deepEqual(c, { x: 1000, y: 0, w: 2000, h: 2000 })
  assert.equal(sz.coverCrop(4000, 2000, 1080, 1080, { x: 0, y: 0.5 }).x, 0)
  assert.equal(sz.coverCrop(4000, 2000, 1080, 1080, { x: 1, y: 0.5 }).x, 2000)
})

test('a tall photo cropped to 16:9 keeps full width and slides up and down', () => {
  const c = sz.coverCrop(1080, 1920, 1600, 900, { x: 0.5, y: 0 })
  assert.equal(c.w, 1080)
  near(c.h, 1080 * 900 / 1600)
  assert.equal(c.y, 0)
  near(sz.coverCrop(1080, 1920, 1600, 900, { x: 0.5, y: 1 }).y, 1920 - 1080 * 900 / 1600)
})

test('the crop always has the frame shape and stays inside the image', () => {
  for (const p of sz.IMAGE_PRESETS) {
    for (const [w, h] of [[4032, 3024], [3024, 4032], [800, 800], [1600, 900], [300, 2000]]) {
      for (const f of [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 0.3, y: 0.7 }, { x: -4, y: 9 }, { x: NaN, y: 0.5 }]) {
        const c = sz.coverCrop(w, h, p.width, p.height, f)
        near(c.w / c.h, p.width / p.height, `${p.id} ${w}x${h}`)
        assert.ok(c.x >= -1e-9 && c.y >= -1e-9, `${p.id} origin`)
        assert.ok(c.x + c.w <= w + 1e-6 && c.y + c.h <= h + 1e-6, `${p.id} ${w}x${h} inside`)
      }
    }
  }
})

test('an image already the right shape has nothing to drag', () => {
  assert.equal(sz.cropAxis(1600, 900, 1600, 900), null)
  assert.equal(sz.cropAxis(3200, 1800, 1280, 720), null)
  assert.equal(sz.cropAxis(4000, 2000, 1080, 1080), 'x')
  assert.equal(sz.cropAxis(1080, 1920, 1600, 900), 'y')
})

// ── Fit ─────────────────────────────────────────────────────────────────────

test('fit centers the whole image and never crops it', () => {
  assert.deepEqual(sz.containRect(4000, 2000, 1080, 1080), { x: 0, y: 270, w: 1080, h: 540 })
  assert.deepEqual(sz.containRect(1000, 2000, 1600, 900), { x: 575, y: 0, w: 450, h: 900 })
  assert.deepEqual(sz.containRect(0, 10, 100, 100), { x: 0, y: 0, w: 0, h: 0 })
})

// ── Drag ────────────────────────────────────────────────────────────────────

test('dragging the picture right moves the crop left, by the preview scale', () => {
  // 4000x2000 into a square: crop is 2000 wide, slack 2000. A 400px preview
  // shows 5 source px per preview px, so a 100px drag moves 500 source px.
  const f = sz.dragFocus({ x: 0.5, y: 0.5 }, 100, 0, 4000, 2000, 1080, 1080, 400)
  near(f.x, (1000 - 500) / 2000)
  assert.equal(f.y, 0.5)
  const g = sz.dragFocus({ x: 0.5, y: 0.5 }, -100, 0, 4000, 2000, 1080, 1080, 400)
  near(g.x, (1000 + 500) / 2000)
})

test('a drag stops at the edge and leaves an axis with no room alone', () => {
  assert.equal(sz.dragFocus({ x: 0.5, y: 0.5 }, 10_000, 0, 4000, 2000, 1080, 1080, 400).x, 0)
  assert.equal(sz.dragFocus({ x: 0.5, y: 0.5 }, -10_000, 0, 4000, 2000, 1080, 1080, 400).x, 1)
  // Vertical drag on a crop that can only move sideways changes nothing.
  assert.deepEqual(sz.dragFocus({ x: 0.2, y: 0.5 }, 0, 300, 4000, 2000, 1080, 1080, 400), { x: 0.2, y: 0.5 })
  assert.deepEqual(sz.dragFocus({ x: 0.5, y: 0.5 }, 50, 50, 1600, 900, 1600, 900, 300), { x: 0.5, y: 0.5 })
  assert.deepEqual(sz.dragFocus({ x: 0.5, y: 0.5 }, 50, 50, 1600, 900, 1600, 900, 0), { x: 0.5, y: 0.5 })
})

// ── Preview and file names ──────────────────────────────────────────────────

test('previews keep the frame shape inside the box', () => {
  assert.deepEqual(sz.previewSize(1080, 1920, 300, 300), { w: 169, h: 300 })
  assert.deepEqual(sz.previewSize(1600, 900, 320, 400), { w: 320, h: 180 })
  assert.deepEqual(sz.previewSize(0, 900, 320, 400), { w: 0, h: 0 })
})

test('file names carry the tool, the preset and the size', () => {
  assert.equal(sz.exportFileName('Quote card', sz.presetById('x'), 'png'), 'quote-card-x-1600x900.png')
  assert.equal(sz.exportFileName('image-resizer', sz.presetById('tiktok'), 'jpg'), 'image-resizer-tiktok-1080x1920.jpg')
  assert.equal(sz.exportFileName('***', sz.presetById('square'), 'png'), 'image-square-1080x1080.png')
})

// ── Quote text ──────────────────────────────────────────────────────────────

// A fake font: every character is `px * 0.5` wide.
const measureAt = px => s => Array.from(s).length * px * 0.5

test('wrapping keeps words whole, keeps blank lines and breaks a word too long for the card', () => {
  const m = measureAt(20) // 10px per char
  assert.deepEqual(sz.wrapLines('one two three four', 90, m), ['one two', 'three', 'four'])
  assert.deepEqual(sz.wrapLines('a\n\nb', 90, m), ['a', '', 'b'])
  assert.deepEqual(sz.wrapLines('\n\nhello\n\n', 90, m), ['hello'])
  assert.deepEqual(sz.wrapLines('abcdefghijklmnop', 50, m), ['abcde', 'fghij', 'klmno', 'p'])
  for (const line of sz.wrapLines('word '.repeat(40) + 'x'.repeat(30), 120, m)) assert.ok(m(line) <= 120, line)
})

test('a short quote keeps the chosen size; a long one shrinks until it fits', () => {
  const short = sz.fitQuote('Build the door.', 800, 400, 80, 24, 1.3, measureAt)
  assert.equal(short.px, 80)
  assert.equal(short.cut, false)
  const long = sz.fitQuote('word '.repeat(120), 800, 400, 80, 24, 1.3, measureAt)
  assert.ok(long.px < 80 && long.px >= 24, String(long.px))
  assert.ok(long.lines.length * long.px * 1.3 <= 400)
  assert.equal(long.cut, false)
})

test('text that cannot fit even at the smallest size is cut with an ellipsis', () => {
  const r = sz.fitQuote('word '.repeat(2000), 400, 200, 60, 20, 1.3, measureAt)
  assert.equal(r.px, 20)
  assert.equal(r.cut, true)
  assert.equal(r.lines.length, Math.floor(200 / (20 * 1.3)))
  assert.ok(r.lines[r.lines.length - 1].endsWith('…'))
})

test('the size choices grow from S to XL', () => {
  const shares = sz.QUOTE_SIZES.map(s => s.share)
  assert.deepEqual([...shares].sort((a, b) => a - b), shares)
})

// ── Handing the image to Compose ────────────────────────────────────────────

const NOW = 1_800_000_000_000

test('stores PNG and JPG images from the two tools, with a safe file name', () => {
  assert.deepEqual(ti.makeToolImageMeta({ type: 'image/png', size: 1234 }, 'quote-card', 'Quote Card X 1600x900.png', NOW), {
    tool: 'quote-card', name: 'quote-card-x-1600x900.png', type: 'image/png', size: 1234, savedAt: NOW,
  })
  assert.equal(ti.makeToolImageMeta({ type: 'image/jpeg', size: 10 }, 'image-resizer', '../../etc/passwd', NOW).name, 'etc-passwd.jpg')
  assert.equal(ti.makeToolImageMeta({ type: 'image/jpeg', size: 10 }, 'image-resizer', '', NOW).name, 'image.jpg')
})

test('refuses other types, empty or oversized files and unknown tools', () => {
  assert.equal(ti.makeToolImageMeta({ type: 'image/gif', size: 10 }, 'quote-card', 'a', NOW), null)
  assert.equal(ti.makeToolImageMeta({ type: 'image/png', size: 0 }, 'quote-card', 'a', NOW), null)
  assert.equal(ti.makeToolImageMeta({ type: 'image/png', size: ti.TOOL_IMAGE_MAX_BYTES + 1 }, 'quote-card', 'a', NOW), null)
  assert.equal(ti.makeToolImageMeta({ type: 'image/png', size: 10 }, 'character-counter', 'a', NOW), null)
})

test('reads stored metadata back, refusing anything expired, from the future or malformed', () => {
  const m = ti.makeToolImageMeta({ type: 'image/png', size: 99 }, 'quote-card', 'q.png', NOW)
  assert.deepEqual(ti.parseToolImageMeta(m, NOW + 1000), m)
  assert.equal(ti.parseToolImageMeta(m, NOW + ti.TOOL_IMAGE_TTL_MS + 1), null)
  assert.equal(ti.parseToolImageMeta({ ...m, savedAt: NOW + 3_600_000 }, NOW), null)
  assert.equal(ti.parseToolImageMeta({ ...m, tool: 'evil' }, NOW), null)
  assert.equal(ti.parseToolImageMeta({ ...m, type: 'text/html' }, NOW), null)
  assert.equal(ti.parseToolImageMeta({ ...m, size: -1 }, NOW), null)
  assert.equal(ti.parseToolImageMeta(null, NOW), null)
  assert.equal(ti.parseToolImageMeta('q.png', NOW), null)
})

test('every image tool has a label, and the button goes through /start', () => {
  for (const tool of ti.IMAGE_TOOLS) assert.ok(ti.IMAGE_TOOL_LABELS[tool], tool)
  assert.equal(ti.START_FROM_TOOL_IMAGE, '/start?from=tool-image')
})
