#!/usr/bin/env node
/**
 * The scheduled-post job and posts that are gone (Nov 20, 2026).
 *
 * Ending a campaign or deleting a post from the Queue removes the row, but the
 * post's `post/scheduled` run is already sleeping in Inngest. It used to read
 * the row with `.single()`, treat "no row" like "go ahead", call the publish
 * route, get a 404 and retry three times. Nothing was sent, but every deleted
 * post left four wasted calls and a failed run behind.
 *
 * Now a missing row is done, and only a read error retries, so a database
 * hiccup can never drop a post that is still due.
 *
 *   node scripts/test-publish-guard.mjs
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const code = src => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

const src = code(readFileSync(join(root, 'lib/inngest.ts'), 'utf8'))
const start = src.indexOf('export const publishScheduledPost')
const end = src.indexOf('export const', start + 10)
const job = src.slice(start, end === -1 ? undefined : end)

test('the publish job is where we expect it', () => {
  assert.ok(start >= 0, 'publishScheduledPost exists')
  assert.match(job, /step\.run\('check-post-status'/)
  assert.match(job, /\/api\/posts\/publish/)
})

test('the first check reads with maybeSingle and retries on a read error', () => {
  const check = job.slice(job.indexOf("step.run('check-post-status'"), job.indexOf("step.run('publish-post'"))
  assert.match(check, /\.maybeSingle\(\)/, 'zero rows is not an error')
  assert.doesNotMatch(check, /\.single\(\)/, 'no .single(): it turns a deleted row into an error')
  assert.match(check, /if \(error\) throw/, 'a failed read throws so the step retries')
})

test('a deleted post is skipped before anything is sent', () => {
  const skip = job.indexOf('if (!postCheck)')
  const publish = job.indexOf('/api/posts/publish')
  assert.ok(skip > 0, 'there is a guard for a missing row')
  assert.ok(skip < publish, 'the guard comes before the publish route is called')
  assert.match(job.slice(skip, skip + 300), /reason: 'post_deleted'/)
})

test('the second read skips a missing row but never skips on a read error', () => {
  const inner = job.slice(job.indexOf("step.run('publish-post'"), job.indexOf('/api/posts/publish'))
  assert.match(inner, /\.maybeSingle\(\)/)
  assert.doesNotMatch(inner, /\.single\(\)/)
  assert.match(inner, /if \(innerReadErr\)[\s\S]*?else if \(!innerPostCheck\)[\s\S]*?reason: 'post_deleted'/,
    'skip only when there was no error and no row')
})

test('the idempotency guards are still there', () => {
  assert.match(job, /postCheck\.status !== 'scheduled'/, 'an already-handled post is skipped')
  assert.match(job, /alreadyTerminal/, 'published, partial and failed posts are never sent again')
  assert.match(job, /sentPlatformIds\(innerPostCheck\)/, 'a post sent in an earlier attempt is repaired, not resent')
})
