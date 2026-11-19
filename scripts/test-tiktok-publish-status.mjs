#!/usr/bin/env node
/**
 * Tests for lib/tiktok-publish-status.ts: reading TikTok's publish status,
 * recording it so only one caller settles a row, the week-long give-up, the
 * notification text, and the wiring that keeps checking after the creator
 * leaves TikTok Studio (Nov 18, 2026: three rows from one creator had sat on
 * 'publishing' for up to three days because only the Studio's two-minute poll
 * ever asked).
 *
 *   node scripts/test-tiktok-publish-status.mjs
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
const read = (p) => readFileSync(join(root, p), 'utf8')

const { outputText } = ts.transpileModule(read('lib/tiktok-publish-status.ts'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
const {
  TIKTOK_STATUS_URL, STUDIO_POLL_MS, FOLLOW_UP_DELAYS_MS, SWEEP_MIN_AGE_MS, GIVE_UP_AFTER_MS, NEVER_CONFIRMED,
  readTiktokPublishStatus, fetchTiktokPublishStatus, recordTiktokPublishCheck, shouldGiveUp, settledNotice,
} = mod.exports

/** Just enough of supabase-js for update().eq().eq().select(). */
function fakeDb(rows, { failWith } = {}) {
  const writes = []
  return {
    writes,
    from(table) {
      assert.equal(table, 'tiktok_posts')
      return {
        update(patch) {
          const filters = []
          const q = {
            eq(col, val) { filters.push([col, val]); return q },
            async select() {
              writes.push({ patch, filters: filters.slice() })
              if (failWith) return { data: null, error: { message: failWith } }
              const hit = rows.filter(r => filters.every(([c, v]) => r[c] === v))
              for (const r of hit) Object.assign(r, patch)
              return { data: hit.map(r => ({ id: r.id })), error: null }
            },
          }
          return q
        },
      }
    },
  }
}

const ROW = { id: 'r1', user_id: 'u1', workspace_id: null, post_caption: 'Hello TikTok' }
const freshRow = (status = 'publishing') => ({ ...ROW, status, error_message: null, video_url: null, tiktok_account_open_id: null })

test('reads every status TikTok documents', () => {
  assert.deepEqual(readTiktokPublishStatus({ data: { status: 'PUBLISH_COMPLETE', publicaly_available_post_id: ['7311'] } }),
    { kind: 'published', publicPostId: '7311' })
  assert.deepEqual(readTiktokPublishStatus({ data: { status: 'PUBLISH_COMPLETE', publicly_available_post_id: [42] } }),
    { kind: 'published', publicPostId: '42' })
  assert.deepEqual(readTiktokPublishStatus({ data: { status: 'PUBLISH_COMPLETE', publicaly_available_post_id: [] } }),
    { kind: 'published', publicPostId: null })
  assert.deepEqual(readTiktokPublishStatus({ data: { status: 'FAILED', fail_reason: 'duration_check_failed' } }),
    { kind: 'failed', reason: 'duration_check_failed' })
  assert.deepEqual(readTiktokPublishStatus({ data: { status: 'FAILED', fail_reason: '' } }), { kind: 'failed', reason: null })
  assert.deepEqual(readTiktokPublishStatus({ data: { status: 'SEND_TO_USER_INBOX' } }), { kind: 'in_drafts' })
  assert.deepEqual(readTiktokPublishStatus({ data: { status: 'PROCESSING_UPLOAD' } }),
    { kind: 'processing', tiktokStatus: 'PROCESSING_UPLOAD' })
  assert.deepEqual(readTiktokPublishStatus({}), { kind: 'processing', tiktokStatus: null })
  assert.deepEqual(readTiktokPublishStatus(null), { kind: 'processing', tiktokStatus: null })
})

test('a status check that cannot run is "unchecked", never a failure', async () => {
  const thrown = await fetchTiktokPublishStatus('p1', 't', async () => { throw new TypeError('Load failed') })
  assert.deepEqual(thrown, { kind: 'unchecked', httpStatus: 0 })
  const http500 = await fetchTiktokPublishStatus('p1', 't', async () => new Response('{}', { status: 500 }))
  assert.deepEqual(http500, { kind: 'unchecked', httpStatus: 500 })
  const notJson = await fetchTiktokPublishStatus('p1', 't', async () => new Response('<html>', { status: 200 }))
  assert.deepEqual(notJson, { kind: 'unchecked', httpStatus: 200 })
})

test('asks TikTok the documented way', async () => {
  let seen
  const check = await fetchTiktokPublishStatus('pub_9', 'tok', async (url, init) => {
    seen = { url, init }
    return new Response(JSON.stringify({ data: { status: 'SEND_TO_USER_INBOX' }, error: { code: 'ok' } }), { status: 200 })
  })
  assert.deepEqual(check, { kind: 'in_drafts' })
  assert.equal(seen.url, TIKTOK_STATUS_URL)
  assert.equal(seen.init.method, 'POST')
  assert.equal(seen.init.headers.Authorization, 'Bearer tok')
  assert.deepEqual(JSON.parse(seen.init.body), { publish_id: 'pub_9' })
})

test('processing writes nothing and is not settled', async () => {
  const rows = [freshRow()]
  const db = fakeDb(rows)
  let mirrored = 0
  const r = await recordTiktokPublishCheck(db, ROW, { kind: 'processing', tiktokStatus: 'PROCESSING_UPLOAD' }, 'open', async () => { mirrored++ })
  assert.equal(r.settled, false)
  assert.equal(r.status, 'publishing')
  assert.equal(db.writes.length, 0)
  assert.equal(mirrored, 0)
  const u = await recordTiktokPublishCheck(db, ROW, { kind: 'unchecked', httpStatus: 0 }, 'open', async () => { mirrored++ })
  assert.equal(u.settled, false)
  assert.equal(db.writes.length, 0)
})

test('published: moves the row once, mirrors it once, even when two callers race', async () => {
  const rows = [freshRow()]
  const db = fakeDb(rows)
  let mirrored = 0
  const onPublished = async (row) => { assert.equal(row.id, 'r1'); mirrored++ }
  const check = { kind: 'published', publicPostId: '7311' }

  const first = await recordTiktokPublishCheck(db, ROW, check, 'open_1', onPublished)
  assert.deepEqual(first, { status: 'published', settled: true, changed: true, recorded: true, reason: null })
  assert.equal(rows[0].status, 'published')
  assert.equal(rows[0].video_url, 'https://www.tiktok.com/@/video/7311')
  assert.equal(rows[0].tiktok_account_open_id, 'open_1')
  // Only ever applied to a row still on 'publishing'.
  assert.deepEqual(db.writes[0].filters, [['id', 'r1'], ['status', 'publishing']])

  // The Studio's poll and the follow-up job both get PUBLISH_COMPLETE.
  const second = await recordTiktokPublishCheck(db, ROW, check, 'open_1', onPublished)
  assert.equal(second.settled, true)
  assert.equal(second.changed, false)
  assert.equal(mirrored, 1, 'a second caller must not create a second mirrored post')
})

test('failed keeps TikTok\'s reason, or says it gave none', async () => {
  const rows = [freshRow()]
  const r = await recordTiktokPublishCheck(fakeDb(rows), ROW, { kind: 'failed', reason: 'duration_check_failed' }, null, async () => {})
  assert.equal(r.status, 'failed')
  assert.equal(r.reason, 'duration_check_failed')
  assert.equal(rows[0].error_message, 'duration_check_failed')

  const rows2 = [freshRow()]
  const r2 = await recordTiktokPublishCheck(fakeDb(rows2), ROW, { kind: 'failed', reason: null }, null, async () => {})
  assert.equal(r2.reason, null)
  assert.match(rows2[0].error_message, /without giving a reason/)
})

test('in_drafts settles an upload sent to the creator\'s drafts', async () => {
  const rows = [freshRow()]
  let mirrored = 0
  const r = await recordTiktokPublishCheck(fakeDb(rows), ROW, { kind: 'in_drafts' }, 'open', async () => { mirrored++ })
  assert.equal(r.status, 'in_drafts')
  assert.equal(rows[0].status, 'in_drafts')
  assert.equal(mirrored, 0, 'a draft is not a published post')
})

test('a refused write is reported, and nothing is mirrored', async () => {
  const rows = [freshRow()]
  let mirrored = 0
  const r = await recordTiktokPublishCheck(fakeDb(rows, { failWith: 'violates check constraint' }), ROW,
    { kind: 'published', publicPostId: null }, 'open', async () => { mirrored++ })
  assert.equal(r.recorded, false)
  assert.equal(r.changed, false)
  assert.equal(r.status, 'published', 'the Studio still hears what TikTok said')
  assert.equal(mirrored, 0)
})

test('a row that is not publishing is never touched', async () => {
  const rows = [freshRow('scheduled')]
  const r = await recordTiktokPublishCheck(fakeDb(rows), ROW, { kind: 'failed', reason: 'x' }, null, async () => {})
  assert.equal(r.changed, false)
  assert.equal(rows[0].status, 'scheduled')
})

test('gives up only after a week', () => {
  const now = Date.parse('2026-11-19T08:15:00Z')
  assert.equal(shouldGiveUp('2026-11-15T19:58:00Z', now), false)
  assert.equal(shouldGiveUp('2026-11-12T08:14:00Z', now), true)
  assert.equal(shouldGiveUp('not a date', now), false)
  assert.equal(GIVE_UP_AFTER_MS, 7 * 24 * 60 * 60 * 1000)
  assert.match(NEVER_CONFIRMED, /post it again/)
})

test('the follow-up starts after the Studio stops, and the daily sweep is the backstop', () => {
  assert.ok(FOLLOW_UP_DELAYS_MS[0] > STUDIO_POLL_MS, 'the first server check should land after the Studio gives up')
  const total = FOLLOW_UP_DELAYS_MS.reduce((a, b) => a + b, 0)
  assert.ok(total < 24 * 60 * 60 * 1000, 'the follow-up should hand over to the daily sweep within a day')
  assert.ok(FOLLOW_UP_DELAYS_MS.length <= 4, 'each check costs two Inngest steps')
  assert.ok(SWEEP_MIN_AGE_MS >= FOLLOW_UP_DELAYS_MS[0], 'the sweep leaves brand-new uploads to the follow-up')
})

test('notifications say what happened and which video', () => {
  const live = settledNotice('published', null, 'My first video')
  assert.equal(live.type, 'post_published')
  assert.equal(live.title, 'Your TikTok video is live')
  assert.match(live.message, /"My first video"/)

  const rejected = settledNotice('failed', 'duration_check_failed', null)
  assert.equal(rejected.type, 'post_failed')
  assert.match(rejected.message, /duration_check_failed/)
  assert.doesNotMatch(rejected.message, /\(""\)/)

  const noReason = settledNotice('failed', null, '')
  assert.match(noReason.message, /gave no reason/)

  const drafts = settledNotice('in_drafts', null, 'x')
  assert.equal(drafts.type, 'post_published')
  assert.match(drafts.title, /drafts/)

  const unconfirmed = settledNotice('unconfirmed', null, 'y')
  assert.equal(unconfirmed.type, 'post_failed')
  assert.match(unconfirmed.title, /could not confirm/)

  const long = settledNotice('published', null, 'a'.repeat(200))
  assert.ok(long.message.length < 200, 'a long caption is shortened')
  assert.match(long.message, /\.\.\."/)
})

test('wiring: every Post Now gets a server follow-up, and both callers share one check', () => {
  const confirm = read('app/api/tiktok/confirm-upload/route.ts')
  assert.match(confirm, /inngest\.send\(\{ name: 'tiktok\/uploaded'/)
  assert.match(confirm, /!insertError && !scheduled_at/)

  const inngestSrc = read('lib/inngest.ts')
  assert.match(inngestSrc, /export const settleTiktokPublishes = inngest\.createFunction\(/)
  assert.match(inngestSrc, /\{ event: 'tiktok\/uploaded' \}/)
  assert.match(inngestSrc, /recordTiktokPublishCheck\(/)

  const registry = read('app/api/inngest/route.ts')
  assert.equal((registry.match(/settleTiktokPublishes,/g) || []).length, 2, 'imported and registered')

  const route = read('app/api/tiktok/publish-status/route.ts')
  assert.match(route, /recordTiktokPublishCheck\(/)
  assert.doesNotMatch(route, /open\.tiktokapis\.com/, 'the route asks TikTok through the shared module only')
  assert.doesNotMatch(route, /\.update\(/, 'the route writes through the shared module only')

  const studio = read('app/tiktok/studio/TikTokStudioClient.tsx')
  assert.match(studio, /Date\.now\(\) - started > STUDIO_POLL_MS/)
})
