#!/usr/bin/env node
/**
 * Tests for video posting to X, LinkedIn and Bluesky (lib/publish/video.ts and
 * the three publishers' upload flows), against mocked platform APIs: the
 * request sequence each platform documents, the processing wait and its
 * deadline, and publishToAll sending video posts to platforms at once.
 *
 *   node scripts/test-publish-video.mjs
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

// Loads lib/**/*.ts as the app would. '@/lib/x' and './x' (inside lib/publish)
// resolve to the real files; stubs replace whatever touches a database.
const stubs = {
  '@/lib/supabase-admin': { getSupabaseAdmin: () => { throw new Error('no db in tests') } },
  '@/lib/plan': { resolveWorkspacePlan: async () => 'free' },
}
const cache = new Map()
let fresh = 0
function load(rel, extraStubs = {}) {
  // A load with its own stubs is never shared: each test gets its own copy.
  const key = Object.keys(extraStubs).length ? `${rel}#${++fresh}` : rel
  if (cache.has(key)) return cache.get(key).exports
  const source = readFileSync(join(root, rel), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const mod = { exports: {} }
  cache.set(key, mod)
  const dir = dirname(rel)
  const localRequire = (id) => {
    if (extraStubs[id]) return extraStubs[id]
    if (stubs[id]) return stubs[id]
    if (id.startsWith('@/lib/')) return load(`lib/${id.slice('@/lib/'.length)}.ts`)
    if (id.startsWith('./')) return load(`${dir}/${id.slice(2)}.ts`)
    return require(id)
  }
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, localRequire)
  return mod.exports
}

const video = load('lib/publish/video.ts')
const { uploadXVideo } = load('lib/publish/twitter.ts')
const { uploadBlueskyVideo, blueskyParts, pdsFromDidDoc } = load('lib/publish/bluesky.ts')
const { uploadLinkedInVideo } = load('lib/publish/linkedin.ts')

// ── fetch mock ──────────────────────────────────────────────────────────────
function mockFetch(handler) {
  const calls = []
  globalThis.fetch = async (url, init = {}) => {
    const call = { url: String(url), method: init.method ?? 'GET', headers: init.headers ?? {}, body: init.body }
    calls.push(call)
    const out = await handler(call)
    const status = out.status ?? 200
    const body = status === 204 || out.body === undefined ? null : JSON.stringify(out.body)
    return new Response(body, { status, headers: out.headers })
  }
  return calls
}
const realFetch = globalThis.fetch
test.afterEach(() => { globalThis.fetch = realFetch })

const clip = (n = 10) => ({ bytes: new Uint8Array(Array.from({ length: n }, (_, i) => i)), contentType: 'video/mp4' })

// ── MP4 boxes ───────────────────────────────────────────────────────────────
function box(type, ...payloads) {
  const body = Buffer.concat(payloads.map(p => Buffer.from(p)))
  const head = Buffer.alloc(8)
  head.writeUInt32BE(8 + body.length, 0)
  head.write(type, 4, 'latin1')
  return Buffer.concat([head, body])
}
function mvhd(timescale, duration) {
  const b = Buffer.alloc(100)
  b.writeUInt32BE(timescale, 12)
  b.writeUInt32BE(duration, 16)
  return box('mvhd', b)
}
function tkhd(width, height, turned = false) {
  const b = Buffer.alloc(84)
  // matrix at 40: a, b, u, c, d, v, x, y, w
  const m = turned ? [0, 0x10000, 0, -0x10000, 0, 0, 0, 0, 0x40000000] : [0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000]
  m.forEach((v, i) => b.writeInt32BE(v, 40 + i * 4))
  b.writeUInt32BE(width * 65536, 76)
  b.writeUInt32BE(height * 65536, 80)
  return box('tkhd', b)
}
const mp4 = (...moovChildren) => new Uint8Array(Buffer.concat([box('ftyp', Buffer.from('isom')), box('moov', ...moovChildren), box('mdat', Buffer.alloc(16))]))

test('which media is a video', () => {
  assert.equal(video.isVideoUrl('https://x.supabase.co/media/u/1.mp4'), true)
  assert.equal(video.isVideoUrl('https://x.supabase.co/media/u/1.MOV?token=a'), true)
  assert.equal(video.isVideoUrl('https://x.supabase.co/media/u/1.jpg'), false)
  assert.equal(video.firstVideo(['a.png', 'b.mp4', 'c.mov']), 'b.mp4')
  assert.equal(video.firstVideo(undefined), null)
})

test('MP4 size and length, with a phone video stored sideways reading upright', () => {
  assert.deepEqual(video.mp4Info(mp4(mvhd(1000, 26000), box('trak', tkhd(1080, 1920)))), { durationSec: 26, width: 1080, height: 1920 })
  assert.deepEqual(video.mp4Info(mp4(mvhd(600, 1200), box('trak', tkhd(1920, 1080, true)))), { durationSec: 2, width: 1080, height: 1920 })
  // An audio track first (0 x 0) is skipped for the video track after it.
  assert.deepEqual(video.mp4Info(mp4(box('trak', tkhd(0, 0)), box('trak', tkhd(1280, 720)))), { width: 1280, height: 720 })
  assert.deepEqual(video.mp4Info(new Uint8Array([1, 2, 3])), {})
})

test('a video over the cap is refused before it is read', async () => {
  mockFetch(() => ({ body: {}, headers: { 'content-length': String(60 * 1024 * 1024) } }))
  await assert.rejects(video.fetchVideo('https://s/v.mp4'), /60 MB\. SocialMate sends videos up to 50 MB/)
})

test('a stored video with no video content type is typed by its extension', async () => {
  globalThis.fetch = async () => new Response(new Uint8Array([0, 1, 2]), { headers: { 'content-type': 'application/octet-stream' } })
  const v = await video.fetchVideo('https://s/clip.mov')
  assert.equal(v.contentType, 'video/quicktime')
  assert.equal(v.bytes.byteLength, 3)
})

// ── X ────────────────────────────────────────────────────────────────────────
test('X: initialize, append in order, finalize, then wait for processing', async () => {
  let polls = 0
  const calls = mockFetch(({ url }) => {
    if (url.endsWith('/initialize')) return { body: { data: { id: '77' } } }
    if (url.includes('/append')) return { status: 204 }
    if (url.endsWith('/finalize')) return { body: { data: { id: '77', processing_info: { state: 'pending', check_after_secs: 1 } } } }
    if (url.includes('command=STATUS')) { polls++; return { body: { data: { processing_info: { state: 'succeeded' } } } } }
    return { status: 404 }
  })
  const id = await uploadXVideo('tok', clip(10), Date.now() + 10_000)
  assert.equal(id, '77')
  assert.equal(polls, 1)
  const init = JSON.parse(calls[0].body)
  assert.deepEqual(init, { media_type: 'video/mp4', total_bytes: 10, media_category: 'tweet_video' })
  assert.equal(calls[1].body.get('segment_index'), '0')
  assert.equal(calls[0].headers.Authorization, 'Bearer tok')
})

test('X: a failed processing state fails with X\'s reason', async () => {
  mockFetch(({ url }) => {
    if (url.endsWith('/initialize')) return { body: { data: { id: '9' } } }
    if (url.includes('/append')) return { status: 204 }
    return { body: { data: { processing_info: { state: 'failed', error: { message: 'unsupported codec' } } } } }
  })
  await assert.rejects(uploadXVideo('tok', clip(4), Date.now() + 10_000), /X could not process this video: unsupported codec/)
})

test('X: still processing at the deadline asks for a retry, without waiting it out', async () => {
  mockFetch(({ url }) => {
    if (url.endsWith('/initialize')) return { body: { data: { id: '9' } } }
    if (url.includes('/append')) return { status: 204 }
    return { body: { data: { processing_info: { state: 'in_progress', check_after_secs: 5 } } } }
  })
  const started = Date.now()
  await assert.rejects(uploadXVideo('tok', clip(4), Date.now() + 1000), err => err.name === 'VideoStillProcessing' && err.retryable === true && /X is still processing/.test(err.message))
  assert.ok(Date.now() - started < 1000)
})

test('X: a refused upload carries its HTTP status for the publisher to explain', async () => {
  mockFetch(() => ({ status: 403, body: { title: 'Forbidden', detail: 'missing scope' } }))
  await assert.rejects(uploadXVideo('tok', clip(4), Date.now() + 1000), err => err.status === 403 && /initialize failed: missing scope/.test(err.message))
})

// ── Bluesky ──────────────────────────────────────────────────────────────────
test('Bluesky: the PDS comes from the DID document', () => {
  assert.equal(pdsFromDidDoc({ service: [{ id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: 'https://morel.us-east.host.bsky.network' }] }), 'https://morel.us-east.host.bsky.network')
  assert.equal(pdsFromDidDoc(null), null)
})

test('Bluesky: parts cover every byte once, numbered from 1', () => {
  assert.deepEqual(blueskyParts(10, 4), [
    { partNumber: 1, start: 0, end: 4 }, { partNumber: 2, start: 4, end: 8 }, { partNumber: 3, start: 8, end: 10 },
  ])
  assert.deepEqual(blueskyParts(8, 4).length, 2)
})

test('Bluesky: service token for the PDS, start, each part, finish, then the job\'s blob', async () => {
  const blob = { $type: 'blob', ref: { $link: 'bafk' }, mimeType: 'video/mp4', size: 10 }
  const parts = []
  const calls = mockFetch(({ url, body }) => {
    if (url.includes('getServiceAuth')) return { body: { token: 'svc' } }
    if (url.endsWith('startUpload')) return { body: { jobId: 'j1', partSizeBytes: 4, partCount: 3, expiresAt: 'x' } }
    if (url.includes('uploadPart')) { parts.push([new URL(url).searchParams.get('partNumber'), body.byteLength]); return { body: { partNumber: 1, sizeBytes: body.byteLength } } }
    if (url.endsWith('finishUpload')) return { body: { completedJobId: 'j2', jobStatus: { jobId: 'j1', did: 'd', state: 'JOB_STATE_ENCODING' } } }
    if (url.includes('getJobStatus')) return { body: { jobStatus: { jobId: 'j2', did: 'd', state: 'JOB_STATE_COMPLETED', blob } } }
    return { status: 404 }
  })
  const got = await uploadBlueskyVideo('acc', 'https://morel.us-east.host.bsky.network/', clip(10), Date.now() + 10_000)
  assert.deepEqual(got, blob)
  const auth = new URL(calls[0].url)
  assert.equal(auth.origin, 'https://morel.us-east.host.bsky.network')
  assert.equal(auth.searchParams.get('aud'), 'did:web:morel.us-east.host.bsky.network')
  assert.equal(auth.searchParams.get('lxm'), 'com.atproto.repo.uploadBlob')
  assert.match(auth.searchParams.get('exp'), /^\d+$/)
  assert.deepEqual(parts, [['1', 4], ['2', 4], ['3', 2]])
  // The poll uses the id finishUpload hands back (a duplicate upload reuses an earlier job).
  assert.equal(new URL(calls.at(-1).url).searchParams.get('jobId'), 'j2')
  assert.equal(calls.find(c => c.url.endsWith('startUpload')).headers.Authorization, 'Bearer svc')
})

test('Bluesky: a failed job fails with Bluesky\'s reason', async () => {
  mockFetch(({ url }) => {
    if (url.includes('getServiceAuth')) return { body: { token: 'svc' } }
    if (url.endsWith('startUpload')) return { body: { jobId: 'j1', partSizeBytes: 10, partCount: 1 } }
    if (url.includes('uploadPart')) return { body: {} }
    return { body: { completedJobId: 'j1', jobStatus: { state: 'JOB_STATE_FAILED', failureCode: 'validation_failure' } } }
  })
  await assert.rejects(uploadBlueskyVideo('acc', 'https://pds.example', clip(10), Date.now() + 10_000), /Bluesky could not process this video: validation_failure/)
})

test('Bluesky: an upload plan that doesn\'t add up is refused before sending parts', async () => {
  const calls = mockFetch(({ url }) => {
    if (url.includes('getServiceAuth')) return { body: { token: 'svc' } }
    return { body: { jobId: 'j1', partSizeBytes: 4, partCount: 7 } }
  })
  await assert.rejects(uploadBlueskyVideo('acc', 'https://pds.example', clip(10), Date.now() + 10_000), /upload plan/)
  assert.equal(calls.filter(c => c.url.includes('uploadPart')).length, 0)
})

// ── LinkedIn ─────────────────────────────────────────────────────────────────
test('LinkedIn: registers a feedshare-video asset, uploads it, waits for AVAILABLE', async () => {
  const calls = mockFetch(({ url, method }) => {
    if (url.includes('registerUpload')) return { body: { value: { asset: 'urn:li:digitalmediaAsset:C5', uploadMechanism: { 'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest': { uploadUrl: 'https://upload.linkedin/x' } } } } }
    if (method === 'PUT') return { status: 201 }
    if (url.includes('/v2/assets/C5')) return { body: { recipes: [{ recipe: 'urn:li:digitalmediaRecipe:feedshare-video', status: 'AVAILABLE' }] } }
    return { status: 404 }
  })
  const out = await uploadLinkedInVideo('tok', 'urn:li:person:abc', clip(10), Date.now() + 10_000)
  assert.deepEqual(out, { asset: 'urn:li:digitalmediaAsset:C5', ready: true })
  const reg = JSON.parse(calls[0].body)
  assert.deepEqual(reg.registerUploadRequest.recipes, ['urn:li:digitalmediaRecipe:feedshare-video'])
  assert.equal(reg.registerUploadRequest.owner, 'urn:li:person:abc')
  assert.equal(calls[1].body.byteLength, 10)
})

test('LinkedIn: a processing error fails the post', async () => {
  mockFetch(({ url, method }) => {
    if (url.includes('registerUpload')) return { body: { value: { asset: 'urn:li:digitalmediaAsset:C6', uploadMechanism: { 'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest': { uploadUrl: 'https://upload.linkedin/x' } } } } }
    if (method === 'PUT') return { status: 201 }
    return { body: { recipes: [{ status: 'CLIENT_ERROR' }] } }
  })
  await assert.rejects(uploadLinkedInVideo('tok', 'urn:li:person:abc', clip(10), Date.now() + 10_000), /LinkedIn could not process this video \(CLIENT_ERROR\)/)
})

// ── publishToAll ─────────────────────────────────────────────────────────────
function slowPublisher(name, ms, log) {
  return async () => { log.push(`start ${name}`); await new Promise(r => setTimeout(r, ms)); log.push(`end ${name}`); return `${name}-id` }
}
function loadIndex(log) {
  return load('lib/publish/index.ts', {
    './discord':   { publishToDiscord:   slowPublisher('discord', 150, log) },
    './bluesky':   { publishToBluesky:   async (...a) => ({ uri: await slowPublisher('bluesky', 150, log)(...a), cid: 'c' }) },
    './telegram':  { publishToTelegram:  slowPublisher('telegram', 150, log) },
    './mastodon':  { publishToMastodon:  slowPublisher('mastodon', 150, log) },
    './youtube':   { publishToYouTube:   slowPublisher('youtube', 150, log) },
    './linkedin':  { publishToLinkedIn:  slowPublisher('linkedin', 150, log) },
    './pinterest': { publishToPinterest: slowPublisher('pinterest', 150, log) },
    './twitter':   { publishToTwitter:   async () => { log.push('start twitter'); throw new video.VideoStillProcessing('X') } },
  })
}

test('a post with a video goes to its platforms at the same time, results in order', async () => {
  const log = []
  const { publishToAll } = loadIndex(log)
  const t0 = Date.now()
  const results = await publishToAll('u', ['bluesky', 'linkedin', 'twitter'], 'hi', {}, null, {}, ['https://s/v.mp4'])
  assert.ok(Date.now() - t0 < 280, `took ${Date.now() - t0} ms; sequential would be about 300`)
  assert.deepEqual(log.slice(0, 3).sort(), ['start bluesky', 'start linkedin', 'start twitter'])
  assert.deepEqual(results.map(r => [r.platform, r.success]), [['bluesky', true], ['linkedin', true], ['twitter', false]])
  assert.equal(results[2].retryable, true)
})

test('a post without a video still goes one platform at a time', async () => {
  const log = []
  const { publishToAll } = loadIndex(log)
  const results = await publishToAll('u', ['bluesky', 'linkedin'], 'hi', {}, null, {}, ['https://s/a.png'])
  assert.deepEqual(log, ['start bluesky', 'end bluesky', 'start linkedin', 'end linkedin'])
  assert.deepEqual(results, [
    { platform: 'bluesky', success: true, postId: 'bluesky-id' },
    { platform: 'linkedin', success: true, postId: 'linkedin-id' },
  ])
})

test('an unknown platform still gets its "not yet available" result', async () => {
  const { publishToAll } = loadIndex([])
  const [r] = await publishToAll('u', ['myspace'], 'hi')
  assert.equal(r.success, false)
  assert.match(r.userError, /Myspace support is coming soon/)
})
