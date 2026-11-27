#!/usr/bin/env node
/**
 * What the site says is coming must be what is actually coming, and SOMA is
 * not free.
 *
 * Nov 27, 2026: /pricing's FAQ, /features (in nine languages), /best-times,
 * /templates, /roadmap, six /for pages and a blog post still said Pinterest
 * and Reddit were coming or planned, long after both declined SocialMate's
 * applications. Eleven /for pages kept their own "coming" lists (one named
 * LinkedIn, live since May; another named Kick, which nothing supports).
 * /best-times filed TikTok and X under "Planned". About 20 /vs pages listed
 * SOMA with "starting free", and SOMA comes with Pro.
 *
 *   node scripts/test-platform-status-claims.mjs
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
const read = p => readFileSync(join(root, p), 'utf8')

function load(path) {
  const mod = { exports: {} }
  const req = id => (id === './plan' ? load('lib/plan.ts') : require(id))
  new Function('module', 'exports', 'require', ts.transpileModule(read(path), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
  }).outputText)(mod, mod.exports, req)
  return mod.exports
}
const facts = load('lib/site-facts.ts')

function walk(dir, exts, out = []) {
  for (const name of readdirSync(join(root, dir))) {
    const p = join(dir, name)
    const st = statSync(join(root, p))
    if (st.isDirectory()) walk(p, exts, out)
    else if (exts.some(e => name.endsWith(e))) out.push(p.split('\\').join('/'))
  }
  return out
}
const SOURCES = [
  ...walk('app', ['.ts', '.tsx']),
  ...walk('lib', ['.ts', '.tsx']),
  ...walk('components', ['.ts', '.tsx']),
  ...walk('messages', ['.json']),
]
/** Code comments explain history ("this said Pinterest was coming"); readers never see them. */
const isComment = line => /^\s*(\/\/|\*|\/\*|\{\s*\/\*)/.test(line)

test('the coming list names only platforms that wait on an approval', () => {
  const soon = facts.SOON_PLATFORM_NAMES
  assert.ok(soon.length > 0)
  for (const name of soon) {
    assert.ok(!facts.DECLINED_PLATFORM_NAMES.includes(name), `${name} declined, so it is not coming`)
    assert.ok(!facts.LIVE_PLATFORM_NAMES.includes(name), `${name} is live, so it is not coming`)
  }
  assert.match(facts.SENTENCES.soon, /Pinterest and Reddit declined/)
})

test('no /for page keeps its own coming list', () => {
  const pages = SOURCES.filter(p => /^app\/for\/[^/]+\/page\.tsx$/.test(p))
  for (const p of pages) {
    const src = read(p)
    if (!src.includes('COMING_PLATFORMS')) continue
    assert.doesNotMatch(src, /const COMING_PLATFORMS = \[/, `${p} lists its own coming platforms`)
    assert.match(src, /import \{ SOON_PLATFORMS \} from '@\/lib\/site-facts'/, p)
  }
})

test('nothing calls Pinterest or Reddit coming, planned or on the roadmap', () => {
  const near = /(Pinterest|Reddit)[^.\n]{0,120}\b(coming|roadmap|soon|planned)\b|\b(coming|roadmap|soon|planned)\b[^.\n]{0,80}(Pinterest|Reddit)/i
  // A line that says they declined, or are not coming, is the correction itself.
  const negated = /declin|turned down|no longer names|not coming|aren.t coming|are not coming|isn.t coming|not listed as planned|not shown as if/i
  const hits = []
  for (const p of SOURCES) {
    read(p).split(/\r?\n/).forEach((line, i) => {
      if (near.test(line) && !negated.test(line) && !isComment(line)) hits.push(`${p}:${i + 1}: ${line.trim().slice(0, 140)}`)
    })
  }
  assert.deepEqual(hits, [])
})

test('/best-times files every live platform as live', () => {
  const src = read('app/best-times/page.tsx')
  for (const [name, id] of [['TikTok', 'tiktok'], ['X/Twitter', 'twitter'], ['LinkedIn', 'linkedin']]) {
    assert.match(src, new RegExp(`platform: '${name.replace('/', '\\/')}',\\s*id: '${id}',\\s*status: 'live'`), name)
  }
  assert.doesNotMatch(src, />4 platforms</, 'the live count is derived')
})

test('the free plan is described by its real numbers', () => {
  const hits = []
  for (const p of SOURCES) {
    read(p).split(/\r?\n/).forEach((line, i) => {
      if (/50 credits\/month across|that's 50 posts|connect multiple accounts per platform|No social set restriction/i.test(line)) {
        hits.push(`${p}:${i + 1}`)
      }
    })
  }
  assert.deepEqual(hits, [], 'Free is 250 posts and 50 AI credits a month, one account per platform')
})

test('Free is not sold as every AI tool', () => {
  // Free gets 50 AI credits a month; Post Score and SOMA are Pro.
  const hits = []
  for (const p of SOURCES.filter(f => f.startsWith('app/vs/'))) {
    read(p).split(/\r?\n/).forEach((line, i) => {
      if (/15\+ (AI )?tools free|AI tools on free tier|includes 15\+ AI tools free/i.test(line)) hits.push(`${p}:${i + 1}`)
    })
  }
  assert.deepEqual(hits, [])
})

test('SOMA is never sold as part of the free start', () => {
  const free = /starting free|starting completely free|starting at \$0|\$0 to start|all for \$0|free plan|Free to start|starts at \$0/i
  const hits = []
  for (const p of SOURCES.filter(f => f.startsWith('app/vs/'))) {
    read(p).split(/\r?\n/).forEach((line, i) => {
      if (/\bSOMA\b/.test(line) && free.test(line) && !/SOMA[^.]{0,40}\bPro\b|\bPro\b[^.]{0,40}SOMA|\$8/.test(line)) {
        hits.push(`${p}:${i + 1}: ${line.trim().slice(0, 140)}`)
      }
    })
  }
  assert.deepEqual(hits, [])
})
