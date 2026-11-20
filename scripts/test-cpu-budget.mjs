#!/usr/bin/env node
/**
 * What Vercel bills for (Nov 20, 2026).
 *
 * On Nov 19 Vercel paused the Hobby team for Fluid Active CPU (Hobby includes
 * 4 CPU-hours a month). Its Observability showed where the time went:
 *   - the notification bell and the sidebar's unread badge polled
 *     /api/notifications and /api/notifications/count every minute, in both
 *     copies of the sidebar and in background tabs: about 2,000 calls each, the
 *     two busiest routes and two thirds of all Active CPU;
 *   - the proxy ran on every one of those calls (8.1K invocations, more than
 *     every function together) and did nothing there;
 *   - the homepage rendered fresh on every visit (227 renders, 16 s), because
 *     it read ?ref= from the request.
 * These tests keep each of those from coming back.
 *
 *   node scripts/test-cpu-budget.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))
const ts = require('typescript')
const read = rel => readFileSync(join(root, rel), 'utf8')
// Source without comments, so an explanation that names the old code is not mistaken for it.
const code = src => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

function load(rel) {
  const { outputText } = ts.transpileModule(read(rel), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const mod = { exports: {} }
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
  return mod.exports
}

function walk(dir, out = []) {
  for (const name of readdirSync(join(root, dir))) {
    const rel = join(dir, name)
    if (statSync(join(root, rel)).isDirectory()) walk(rel, out)
    else if (/\.(ts|tsx)$/.test(name)) out.push(rel.replace(/\\/g, '/'))
  }
  return out
}

test('the homepage reads nothing from the request, so the CDN can cache it', () => {
  const page = code(read('app/page.tsx'))
  assert.doesNotMatch(page, /searchParams|cookies\(|headers\(|draftMode\(|connection\(/, 'app/page.tsx reads the request again')
  assert.doesNotMatch(page, /force-dynamic/)
  assert.match(page, /export const revalidate = \d+/)
  assert.doesNotMatch(code(read('components/pages/Landing.tsx')), /\b(cookies|headers)\(\)/)

  // The referral banner reads ?ref= in the browser instead, and encodes it.
  const banner = code(read('app/components/ReferralBanner.tsx'))
  assert.match(banner, /window\.location\.search/)
  assert.match(banner, /encodeURIComponent\(refCode\)/)
})

test('the proxy runs on pages, not on API routes or files', () => {
  const literal = read('proxy.ts').match(/matcher:\s*\[\s*'([^']+)'/)
  assert.ok(literal, 'proxy.ts matcher not found')
  const matches = new RegExp('^' + literal[1].replace(/\\\\/g, '\\') + '$')

  const pages = ['/', '/pricing', '/blog/some-post', '/for/streamers', '/compose', '/queue', '/settings', '/auth/callback', '/refer/abc123', '/l/someone']
  for (const p of pages) assert.ok(matches.test(p), `${p} should still run the proxy`)

  // Every protected page keeps its sign-in check.
  const protectedPaths = [...read('lib/protected-paths.ts').matchAll(/^\s*'(\/[a-z0-9/-]+)',/gm)].map(m => m[1])
  assert.ok(protectedPaths.length >= 30, `found ${protectedPaths.length} protected paths`)
  for (const p of protectedPaths) {
    assert.ok(matches.test(p), `${p} is protected but the proxy would skip it`)
    assert.ok(matches.test(p + '/x'), `${p}/x is protected but the proxy would skip it`)
  }

  const skipped = [
    '/api/notifications', '/api/notifications/count', '/api/inngest', '/api/cron/publish-scheduled',
    '/demo/socialmate-demo.mp4', '/sw.js', '/manifest.json', '/robots.txt', '/sitemap.xml',
    '/blog/feed.xml', '/llms.txt', '/favicon.ico', '/og-image.png', '/_next/static/chunks/main.js', '/_next/image',
  ]
  for (const p of skipped) assert.ok(!matches.test(p), `${p} should not run the proxy`)
})

test('no shared component polls the API on a plain timer', () => {
  // Components, contexts and hooks are mounted on many pages at once. A timer
  // in one of them that calls the API runs in every open tab, hidden or not.
  const offenders = [...walk('components'), ...walk('contexts'), ...walk('hooks')]
    .filter(f => {
      const src = code(read(f))
      return /setInterval\(/.test(src) && /['"`]\/api\//.test(src)
    })
  assert.deepEqual(offenders, [], 'poll through hooks/useVisiblePoll.ts, which stops while the tab is hidden')

  for (const f of ['components/Sidebar.tsx', 'components/NotificationBell.tsx']) {
    const src = code(read(f))
    assert.doesNotMatch(src, /setInterval\(/, f)
    assert.match(src, /useUnreadNotifications\(\)/, f)
  }
  assert.doesNotMatch(code(read('components/Sidebar.tsx')), /fetch\('\/api\/notifications/, 'the sidebar fetches notifications itself again')

  const poll = code(read('hooks/useVisiblePoll.ts'))
  assert.match(poll, /document\.visibilityState !== 'visible'/)
  assert.match(poll, /visibilitychange/)
})

test('requests for the same JSON share one fetch until it is stale', async () => {
  const { fetchJsonShared, forgetShared } = load('lib/shared-fetch.ts')
  const realFetch = globalThis.fetch
  let calls = 0
  globalThis.fetch = async url => {
    calls++
    if (url === '/fails') throw new Error('offline')
    if (url === '/500') return { ok: false, json: async () => ({ error: 'x' }) }
    return { ok: true, json: async () => ({ unread: 3, call: calls }) }
  }
  try {
    // Both sidebar copies and the bell mount together: one request.
    const [a, b, c] = await Promise.all([1, 2, 3].map(() => fetchJsonShared('/count', 50_000)))
    assert.equal(calls, 1)
    assert.deepEqual(a, { unread: 3, call: 1 })
    assert.equal(b, a)
    assert.equal(c, a)

    // A page change within the window reuses the answer.
    assert.equal(await fetchJsonShared('/count', 50_000), a)
    assert.equal(calls, 1)

    // Marking read forgets it, so the next ask goes to the server.
    forgetShared('/count')
    assert.deepEqual(await fetchJsonShared('/count', 50_000), { unread: 3, call: 2 })

    // A stale answer is asked for again.
    await fetchJsonShared('/count', 0)
    assert.equal(calls, 3)

    // Failures come back as null, like an error response, never as a throw.
    assert.equal(await fetchJsonShared('/fails', 50_000), null)
    assert.equal(await fetchJsonShared('/500', 50_000), null)
  } finally {
    globalThis.fetch = realFetch
  }
})

test('the notifications page uses the read flag the bell and the badges use', () => {
  const page = code(read('app/notifications/page.tsx'))
  assert.doesNotMatch(page, /update\(\{\s*read:/, 'the page writes the `read` column again; everything else reads is_read')
  assert.match(page, /update\(\{ is_read: true \}\)/)
  assert.match(page, /read: n\.is_read === true/)
  assert.doesNotMatch(page, /n\.body\b/, 'notifications keep their text in `message`')
  assert.match(page, /notificationsChanged\(\)/)
  for (const f of ['app/api/notifications/route.ts', 'app/api/notifications/count/route.ts']) {
    assert.match(read(f), /is_read/, f)
  }
})
