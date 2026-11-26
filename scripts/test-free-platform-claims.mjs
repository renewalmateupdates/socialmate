#!/usr/bin/env node
/**
 * Fails when copy says the free plan covers every platform.
 *
 * Free posts to FREE_PLATFORM_NAMES. PAID_ONLY_PLATFORM_NAMES (X) needs Pro,
 * because X bills SocialMate for every post (lib/site-facts.ts). Two sweeps,
 * Nov 25 and 26, 2026, rewrote several hundred lines that said otherwise:
 * "7 platforms · Free forever", "SocialMate is free with 7 platforms", hero
 * notes on the /for pages in all nine languages.
 *
 * What it checks: every sentence of the pages, components, lib, public text
 * files, and every string in the nine locale files. A sentence fails when it
 * names the live platform count ("7 platforms", "all 7", "7-platform", and the
 * locale forms), says free or $0, and says neither which platform needs Pro
 * ("X" near "Pro") nor how many are free.
 *
 * What it cannot see: a claim spread over two sentences or two elements, like
 * a card headed "Free" over a list item "7 platforms", or "every platform"
 * with no number. Read the page as well.
 *
 *   node scripts/test-free-platform-claims.mjs
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import assert from 'node:assert/strict'
import { loadTs } from './lib/load-ts.mjs'
import { plainText } from './lib/content-rules.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { PLATFORMS } = loadTs(join(root, 'lib/site-facts.ts'))
const liveCount = PLATFORMS.length
const freeCount = PLATFORMS.filter(p => p.minPlan === 'free').length

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
const number = (n) => `(?:(?<![\\d.,$])${n}(?![\\d.,%])|\\b${WORDS[n]}\\b)`
const PLATFORM_WORD = 'platform|plataforma|plattform|plateforme|платформ|平台|プラットフォーム|플랫폼'

/** "7 platforms", "7-platform", "all 7", "7 plataformas activas", "7个平台". */
const LIVE_COUNT = new RegExp(`${number(liveCount)}[^.!?。]{0,24}?(?:${PLATFORM_WORD})|\\ball ${number(liveCount)}`, 'iu')
const FREE = /\bfree\b|\$0(?![\d.])|\bgratis\b|grátis|de graça|gratuit|kostenlos|бесплатн|免费|無料|무료|\bno cost\b|\bzero cost\b|costs nothing/iu
/** Says which platform is paid, how many are free, or puts the full count on Pro. */
const QUALIFIED = new RegExp([
  `\\bX\\b[^.!?。]{0,30}\\bPro\\b`,
  `\\bPro\\b[^.!?。]{0,40}\\bX\\b`,
  `\\b(?:except|but) X\\b`,
  `\\bPro\\b[^.!?。]{0,30}${number(liveCount)}[^.!?。]{0,24}?(?:${PLATFORM_WORD})`,
  number(freeCount),
].join('|'), 'iu')

/** Dated records: what was true on their date. */
const SKIP = [/^app\/admin\//, /^app\/api\//, /^app\/changelog\//, /^app\/roadmap\//]

function files() {
  const out = execFileSync('git', ['ls-files', 'app', 'components', 'contexts', 'lib', 'public', 'messages'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  return out.split(/\r?\n/).filter(f => /\.(tsx?|txt|json|html)$/.test(f) && !/\.d\.ts$/.test(f) && !SKIP.some(re => re.test(f)))
}

/** Comments are notes about the code, not copy. */
function stripComments(src) {
  return src
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (m, lead) => lead + ' '.repeat(m.length - lead.length))
}

/** [{ where, text }] for each line of source, or each string of a locale file. */
function pieces(file) {
  const src = readFileSync(join(root, file), 'utf8').replace(/\r\n/g, '\n')
  if (file.startsWith('messages/')) {
    const out = []
    const walk = (o, path) => {
      if (typeof o === 'string') out.push({ where: `${file} ${path.join('.')}`, text: o })
      else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, [...path, k])
    }
    walk(JSON.parse(src), [])
    return out
  }
  const text = /\.tsx?$/.test(file) ? stripComments(src) : src
  return text.split('\n').map((line, i) => ({ where: `${file}:${i + 1}`, text: line }))
}

/** Sentences, split on . ! ? but not on the "·" between short claims. */
const sentences = (text) => plainText(text).split(/(?<=[.!?])\s+(?=[\p{Lu}"'(\[¿¡])|(?<=[。！？])/u)

export function freePlatformClaims(text) {
  return sentences(text).filter(s => LIVE_COUNT.test(s) && FREE.test(s) && !QUALIFIED.test(s))
}

test('the rule catches the claim and lets the honest versions through', () => {
  for (const bad of [
    '7 platforms · 15+ AI tools · Free forever',
    'SocialMate is free with 7 platforms and 15+ AI tools.',
    'Schedule all 7 platforms free',
    "SocialMate's free plan supports all 7 platforms from day one.",
    'Free forever · 7 live platforms including TikTok · No credit card required',
    'Gratis para siempre · 7 plataformas activas · Sin tarjeta de crédito',
    '永久免费 · 7个上线平台',
    'SocialMate covers 7 modern platforms with 15+ AI tools — starting free.',
  ]) assert.deepEqual(freePlatformClaims(bad).length, 1, bad)
  for (const ok of [
    '6 platforms free · X on Pro · 15+ AI tools',
    'SocialMate is free on 6 platforms (X needs Pro), with 15+ AI tools.',
    'SocialMate covers 7 platforms, 6 of them free.',
    'SocialMate covers 7 platforms including TikTok and LinkedIn, all free except X.',
    'SocialMate schedules LinkedIn posts free, and for $8/month you get Pro features across 7 platforms.',
    'Pro is $8/month for 7 platforms, SOMA, and 8 AI agents.',
    'LinkedIn is one of 7 live platforms. LinkedIn scheduling is free on all plans.',
    'Bluesky, X, TikTok and 4 more. Free.',
  ]) assert.deepEqual(freePlatformClaims(ok), [], ok)
})

test('no page, component, locale string or public file ties every platform to the free plan', () => {
  const found = []
  for (const file of files()) {
    for (const { where, text } of pieces(file)) {
      for (const s of freePlatformClaims(text)) found.push(`${where}: ${s.trim().slice(0, 160)}`)
    }
  }
  assert.deepEqual(found, [],
    `Free covers ${freeCount} of the ${liveCount} platforms; X needs Pro. Say so, e.g. "${freeCount} platforms free (X needs Pro)" or "7 platforms, ${freeCount} of them free":\n  ${found.join('\n  ')}`)
})
