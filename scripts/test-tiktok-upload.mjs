#!/usr/bin/env node
/**
 * Tests for lib/tiktok-upload.ts: sending a video to TikTok piece by piece and
 * resending a piece the connection dropped or TikTok answered 5xx for (TikTok's
 * Media Transfer Guide: "You should retry submitting this chunk"), and saving a
 * scheduled video to storage with storage's own reason when it refuses. Plus
 * the TikTok Studio wiring that made posting hard to find on a phone.
 *
 * Nov 15-18, 2026: three phone uploads of 68 to 163 MB were cut off and started
 * over from zero, a 4 MB upload hit a TikTok 500, and half the phone users who
 * added a video never pressed Post.
 *
 *   node scripts/test-tiktok-upload.mjs
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
const read = p => readFileSync(join(root, p), 'utf8')

const mod = { exports: {} }
new Function('module', 'exports', 'require', ts.transpileModule(read('lib/tiktok-upload.ts'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
}).outputText)(mod, mod.exports, require)
const { uploadToTiktok, uploadedThrough, putStagedVideo, storageErrorDetail, STAGE_TOO_LARGE, RETRY_DELAYS_MS } = mod.exports

const blob = new Blob([new Uint8Array(30)])
const RANGES = [{ start: 0, end: 9 }, { start: 10, end: 19 }, { start: 20, end: 29 }]

/**
 * A fake TikTok. `script` is a list of answers, one per request, in order:
 * a number is an HTTP status, 'drop' throws like a cut-off connection, and an
 * object is { status, headers, body }.
 */
function fakeTiktok(script) {
  const calls = []
  const sleeps = []
  const fetchImpl = async (url, init) => {
    calls.push({ url, range: init.headers['Content-Range'], size: init.body.size })
    const next = script.shift()
    if (next === undefined) throw new Error('fake TikTok got an unexpected request')
    if (next === 'drop') throw new TypeError('Load failed')
    const a = typeof next === 'number' ? { status: next } : next
    return new Response(a.body ?? null, { status: a.status, headers: a.headers ?? {} })
  }
  return { fetchImpl, calls, sleeps, sleep: async ms => { sleeps.push(ms) } }
}

test('sends every piece in order, with its range, and reports progress', async () => {
  const t = fakeTiktok([206, 206, 201])
  const progress = []
  const r = await uploadToTiktok({ url: 'u', blob, mimeType: 'video/mp4', ranges: RANGES, ...t, onProgress: (d, n) => progress.push(`${d}/${n}`) })
  assert.deepEqual(r, { ok: true, resent: 0 })
  assert.deepEqual(t.calls.map(c => c.range), ['bytes 0-9/30', 'bytes 10-19/30', 'bytes 20-29/30'])
  assert.deepEqual(t.calls.map(c => c.size), [10, 10, 10])
  assert.deepEqual(progress, ['10/30', '20/30', '30/30'])
  assert.equal(t.sleeps.length, 0)
})

test('a piece cut off mid-send is sent again after a wait', async () => {
  const t = fakeTiktok([206, 'drop', 206, 201])
  const r = await uploadToTiktok({ url: 'u', blob, mimeType: 'video/mp4', ranges: RANGES, ...t })
  assert.deepEqual(r, { ok: true, resent: 1 })
  assert.deepEqual(t.calls.map(c => c.range), ['bytes 0-9/30', 'bytes 10-19/30', 'bytes 10-19/30', 'bytes 20-29/30'])
  assert.deepEqual(t.sleeps, [RETRY_DELAYS_MS[0]])
})

test('a TikTok 5xx is retried, as the Media Transfer Guide says', async () => {
  const t = fakeTiktok([500, 502, 201])
  const r = await uploadToTiktok({ url: 'u', blob: new Blob([new Uint8Array(4)]), mimeType: 'video/mp4', ranges: [{ start: 0, end: 3 }], ...t })
  assert.deepEqual(r, { ok: true, resent: 2 })
})

test('it gives up after the last wait, and says why', async () => {
  const t = fakeTiktok([500, 500, 500, { status: 500, body: 'gateway' }])
  const r = await uploadToTiktok({ url: 'u', blob, mimeType: 'video/mp4', ranges: RANGES, ...t })
  assert.equal(r.ok, false)
  assert.equal(r.code, 'upload_http_500')
  assert.equal(r.resent, RETRY_DELAYS_MS.length)
  assert.match(r.message, /TikTok upload failed \(500\): gateway/)

  const d = fakeTiktok(['drop', 'drop', 'drop', 'drop'])
  const rd = await uploadToTiktok({ url: 'u', blob, mimeType: 'video/mp4', ranges: RANGES, ...d })
  assert.equal(rd.code, 'upload_network')
  assert.match(rd.message, /cut off \(Load failed\)/)
})

test('a 416 after a dropped send means TikTok already had that piece: move on', async () => {
  // Without TikTok's progress header (it may not be readable cross-origin).
  const t = fakeTiktok([206, 'drop', 416, 201])
  const r = await uploadToTiktok({ url: 'u', blob, mimeType: 'video/mp4', ranges: RANGES, ...t })
  assert.equal(r.ok, true)
  assert.deepEqual(t.calls.map(c => c.range), ['bytes 0-9/30', 'bytes 10-19/30', 'bytes 10-19/30', 'bytes 20-29/30'])

  // With it, and it agrees.
  const h = fakeTiktok([206, 'drop', { status: 416, headers: { 'Content-Range': 'bytes 0-19/30' } }, 201])
  assert.equal((await uploadToTiktok({ url: 'u', blob, mimeType: 'video/mp4', ranges: RANGES, ...h })).ok, true)
})

test('a 416 that shows TikTok is behind, or comes without a drop, fails instead of guessing', async () => {
  const behind = fakeTiktok([206, 'drop', { status: 416, headers: { 'Content-Range': 'bytes 0-4/30' } }])
  const r1 = await uploadToTiktok({ url: 'u', blob, mimeType: 'video/mp4', ranges: RANGES, ...behind })
  assert.equal(r1.code, 'upload_http_416')

  const noDrop = fakeTiktok([206, 416])
  const r2 = await uploadToTiktok({ url: 'u', blob, mimeType: 'video/mp4', ranges: RANGES, ...noDrop })
  assert.equal(r2.code, 'upload_http_416')
})

test('an expired upload URL is not retried', async () => {
  const t = fakeTiktok([403])
  const r = await uploadToTiktok({ url: 'u', blob, mimeType: 'video/mp4', ranges: RANGES, ...t })
  assert.equal(r.code, 'upload_http_403')
  assert.equal(t.calls.length, 1)
})

test("reads TikTok's progress header", () => {
  assert.equal(uploadedThrough('bytes 0-9999/50000'), 9999)
  assert.equal(uploadedThrough('BYTES 0-1/2'), 1)
  assert.equal(uploadedThrough(null), null)
  assert.equal(uploadedThrough('nonsense'), null)
})

test('a scheduled video: saved, or sent once more after a drop', async () => {
  const ok = fakeTiktok([200])
  assert.deepEqual(await putStagedVideo({ url: 's', blob, mimeType: 'video/mp4', ...ok }), { ok: true })
  const again = fakeTiktok(['drop', 200])
  assert.deepEqual(await putStagedVideo({ url: 's', blob, mimeType: 'video/mp4', ...again }), { ok: true })
  assert.equal(again.calls.length, 2)
})

test("storage's refusal is explained in its own words, and too big says what to do instead", async () => {
  const big = fakeTiktok([{ status: 400, body: JSON.stringify({ statusCode: '413', error: 'Payload too large', message: 'The object exceeded the maximum allowed size' }) }])
  const r1 = await putStagedVideo({ url: 's', blob, mimeType: 'video/mp4', ...big })
  assert.deepEqual(r1, { ok: false, code: 'stage_too_large', message: STAGE_TOO_LARGE })
  assert.match(STAGE_TOO_LARGE, /Post it now or send it to your TikTok drafts/)

  const other = fakeTiktok([{ status: 400, body: JSON.stringify({ statusCode: '400', error: 'InvalidJWT', message: 'jwt expired' }) }])
  const r2 = await putStagedVideo({ url: 's', blob, mimeType: 'video/mp4', ...other })
  assert.equal(r2.code, 'stage_http_400')
  assert.match(r2.message, /\(400: InvalidJWT: jwt expired\)/)

  const down = fakeTiktok([503, 503])
  assert.equal((await putStagedVideo({ url: 's', blob, mimeType: 'video/mp4', ...down })).code, 'stage_http_503')
  const gone = fakeTiktok(['drop', 'drop'])
  assert.equal((await putStagedVideo({ url: 's', blob, mimeType: 'video/mp4', ...gone })).code, 'stage_network')

  assert.deepEqual(storageErrorDetail('not json at all'), { detail: 'not json at all', tooLarge: false })
})

test('wiring: TikTok Studio uses these, and posting is findable on a phone', () => {
  const s = read('app/tiktok/studio/TikTokStudioClient.tsx')
  assert.match(s, /await uploadToTiktok\(\{/)
  assert.match(s, /await putStagedVideo\(\{/)
  assert.doesNotMatch(s, /tikPutRes|const putRes = await fetch\(signedUrl/, 'the old single-shot PUTs are gone')
  assert.match(s, /const releaseScreen = await keepScreenOn\(\)/)
  assert.match(s, /releaseScreen\(\)/)
  // Tab names at every width, and the post form outside the small scroll box.
  assert.doesNotMatch(s, /<span className="hidden sm:inline">\{labels\[tab\]\}<\/span>/)
  assert.match(s, /toolTab === 'post' \? '' : 'max-h-72 overflow-y-auto'/)
  // The next step pinned to the bottom on phones.
  assert.match(s, /Next: caption and post/)
  assert.match(s, /pb-\[calc\(0\.75rem\+env\(safe-area-inset-bottom\)\)\]/)
  // The Post button explains itself instead of a hover tooltip.
  assert.match(s, /onClick=\{\(\) => \(blocker \? showBlocker\(blocker\) : handlePost\(\)\)\}/)
  assert.doesNotMatch(s, /title=\{blockedReason/)
  assert.match(read('lib/analytics.ts'), /'tiktok_post_blocked'/)
})
