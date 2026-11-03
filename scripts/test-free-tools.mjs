#!/usr/bin/env node
/**
 * Tests for the free tools added Nov 3, 2026:
 *   lib/tools/char-count.ts       /tools/character-counter
 *   lib/tools/utm.ts              /tools/utm-builder
 *   lib/tools/bluesky-domain.ts   /tools/bluesky-custom-domain
 *
 *   node scripts/test-free-tools.mjs
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

// Loads a lib/tools module, resolving its relative imports to other lib/tools modules.
const cache = new Map()
function load(name) {
  if (cache.has(name)) return cache.get(name)
  const { outputText } = ts.transpileModule(readFileSync(join(root, `lib/tools/${name}.ts`), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const mod = { exports: {} }
  cache.set(name, mod.exports)
  const req = (spec) => (spec.startsWith('./') ? load(spec.slice(2)) : nodeRequire(spec))
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, req)
  return mod.exports
}

const { countAll, countFor, textStats, COUNT_PLATFORMS } = load('char-count')
const { buildUtmUrl, cleanValue, normalizeUrl, linksPerPlatform } = load('utm')
const bd = load('bluesky-domain')

// ── Character counter ───────────────────────────────────────────────────────

test('every platform has a positive limit and a unique id', () => {
  const ids = new Set(COUNT_PLATFORMS.map(p => p.id))
  assert.equal(ids.size, COUNT_PLATFORMS.length)
  for (const p of COUNT_PLATFORMS) assert.ok(p.limit > 0, p.id)
})

test('X weights emoji and links, Bluesky counts graphemes, strict platforms count UTF-16', () => {
  assert.equal(countFor('hi 👋', 'x'), 5)
  assert.equal(countFor('hi 👋', 'bluesky'), 4)
  assert.equal(countFor('hi 👋', 'linkedin'), 5)
  assert.equal(countFor('see https://example.com/a/very/long/path/that/goes/on', 'x'), 4 + 23)
})

test('the strict count is never below the visible count (a green number always fits)', () => {
  const samples = ['plain', 'emoji 🎉🔥', '漢字テキスト', '𝗯𝗼𝗹𝗱', 'flags 🇺🇸🇯🇵', 'zwj 👩‍💻']
  for (const s of samples) {
    const visible = Array.from(s).length
    for (const id of ['linkedin', 'telegram', 'threads', 'instagram', 'discord', 'tiktok']) {
      assert.ok(countFor(s, id) >= visible, `${id} on ${s}`)
    }
  }
})

test('countAll reports left and fits', () => {
  const row = countAll('x'.repeat(281)).find(r => r.id === 'x')
  assert.equal(row.left, -1)
  assert.equal(row.fits, false)
  assert.ok(countAll('short').every(r => r.fits))
})

test('text stats', () => {
  assert.deepEqual(textStats(''), { characters: 0, charactersNoSpaces: 0, words: 0, lines: 0, hashtags: 0 })
  const s = textStats('Hello world #one\n#two not#three')
  assert.equal(s.words, 5)
  assert.equal(s.lines, 2)
  assert.equal(s.hashtags, 2)
})

// ── UTM builder ─────────────────────────────────────────────────────────────

test('builds a link, adding https and keeping other parameters and the fragment', () => {
  const r = buildUtmUrl({ url: 'example.com/shop?ref=7#top', source: 'Bluesky', medium: 'social', campaign: 'Black Friday' })
  assert.equal(r.error, undefined)
  const u = new URL(r.url)
  assert.equal(u.protocol, 'https:')
  assert.equal(u.searchParams.get('ref'), '7')
  assert.equal(u.searchParams.get('utm_source'), 'bluesky')
  assert.equal(u.searchParams.get('utm_campaign'), 'black-friday')
  assert.equal(u.hash, '#top')
})

test('replaces UTM values the link already had instead of duplicating them', () => {
  const r = buildUtmUrl({ url: 'https://a.co/?utm_source=old&utm_medium=old', source: 'x', medium: 'social', campaign: 'c' })
  const u = new URL(r.url)
  assert.deepEqual(u.searchParams.getAll('utm_source'), ['x'])
  assert.deepEqual(u.searchParams.getAll('utm_medium'), ['social'])
})

test('explains what is missing or wrong', () => {
  assert.ok(buildUtmUrl({ url: '', source: 'x', medium: '', campaign: '' }).error)
  assert.ok(buildUtmUrl({ url: 'not a url', source: 'x', medium: '', campaign: '' }).error)
  assert.ok(buildUtmUrl({ url: 'javascript:alert(1)', source: 'x', medium: '', campaign: '' }).error)
  assert.ok(buildUtmUrl({ url: 'https://a.co', source: ' ', medium: 'social', campaign: 'c' }).error)
  const r = buildUtmUrl({ url: 'https://a.co', source: 'x', medium: '', campaign: '' })
  assert.equal(r.warnings.length, 2)
})

test('values are trimmed, dashed and lowercased; case can be kept on request', () => {
  assert.equal(cleanValue('  Spring  Sale '), 'spring-sale')
  assert.equal(cleanValue('Spring Sale', false), 'Spring-Sale')
  const r = buildUtmUrl({ url: 'a.co', source: 'Bluesky', medium: 'social', campaign: 'c' }, false)
  assert.ok(r.warnings.some(w => w.includes('lowercase')))
})

test('only http and https pages are accepted', () => {
  assert.equal(normalizeUrl('ftp://a.co'), null)
  assert.equal(normalizeUrl('localhost:3000/x')?.hostname, 'localhost')
  assert.equal(normalizeUrl('nodot'), null)
})

test('one link per platform, each with its own source', () => {
  const rows = linksPerPlatform({ url: 'a.co', medium: 'social', campaign: 'launch' }, ['bluesky', 'linkedin', 'nope'])
  assert.deepEqual(rows.map(r => r.id), ['bluesky', 'linkedin'])
  assert.equal(new URL(rows[1].result.url).searchParams.get('utm_source'), 'linkedin')
})

// ── Bluesky custom domain ───────────────────────────────────────────────────

const DID = 'did:plc:abcdefghijklmnopqrstuvwx'

test('normalizes handles and domains, including pasted URLs', () => {
  assert.equal(bd.normalizeHandle(' @Name.BSKY.social. '), 'name.bsky.social')
  assert.equal(bd.normalizeDomain('https://Example.com/about'), 'example.com')
  assert.equal(bd.normalizeDomain('sub.example.co.uk'), 'sub.example.co.uk')
  assert.equal(bd.normalizeDomain('localhost'), null)
  assert.equal(bd.normalizeDomain('bad_domain.com'), null)
  assert.equal(bd.normalizeDomain('1.2.3.4'), null)
  assert.equal(bd.normalizeDomain('-bad.com'), null)
})

test('recognizes DIDs', () => {
  assert.ok(bd.isDid(DID))
  assert.ok(bd.isDid('did:web:example.com'))
  assert.ok(!bd.isDid('did:plc:short'))
  assert.ok(!bd.isDid('example.com'))
})

test('builds the TXT record and the file address', () => {
  assert.deepEqual(bd.dnsRecord('example.com', DID), { type: 'TXT', host: '_atproto', fullName: '_atproto.example.com', value: `did=${DID}` })
  assert.equal(bd.wellKnownUrl('example.com'), 'https://example.com/.well-known/atproto-did')
  assert.ok(bd.dohUrl('example.com').includes('name=_atproto.example.com'))
})

test('reads DNS answers: match, missing, wrong, multiple, split strings, errors', () => {
  const ans = (...data) => ({ Status: 0, Answer: data.map(d => ({ type: 16, data: d })) })
  assert.equal(bd.checkDnsAnswer(ans(`"did=${DID}"`), DID).status, 'match')
  assert.equal(bd.checkDnsAnswer(ans(`"did=did:plc:abcdefghijkl" "mnopqrstuvwx"`), DID).status, 'match')
  assert.equal(bd.checkDnsAnswer({ Status: 3 }, DID).status, 'missing')
  assert.equal(bd.checkDnsAnswer(ans('"v=spf1 -all"'), DID).status, 'missing')
  assert.equal(bd.checkDnsAnswer(ans('"did=did:plc:zzzzzzzzzzzzzzzzzzzzzzzz"'), DID).status, 'wrong')
  assert.equal(bd.checkDnsAnswer(ans(`"did=${DID}"`, '"did=did:plc:zzzzzzzzzzzzzzzzzzzzzzzz"'), DID).status, 'multiple')
  assert.equal(bd.checkDnsAnswer({ Status: 2 }, DID).status, 'error')
  assert.equal(bd.checkDnsAnswer(null, DID).status, 'error')
})
