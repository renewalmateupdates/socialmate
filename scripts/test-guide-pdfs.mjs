#!/usr/bin/env node
/**
 * The free guide PDFs (lib/guide-pdfs.ts, Nov 20, 2026). They were shop
 * products until that day; now they download from public/downloads.
 *
 * Fails when a PDF or cover is missing, a file has no entry, a size label no
 * longer matches its file (a PDF replaced without updating the label), a guide
 * page has no pick, or anything still links to the shop's PDF listings, which
 * are drafts now and answer 404.
 *
 *   node scripts/test-guide-pdfs.mjs
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))
const ts = require('typescript')
const read = rel => readFileSync(join(root, rel), 'utf8')

function load(rel) {
  const { outputText } = ts.transpileModule(read(rel), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const mod = { exports: {} }
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, require)
  return mod.exports
}

const { PDFS, ALL_PDFS, pdfPickFor } = load('lib/guide-pdfs.ts')
const publicPath = p => join(root, 'public', p.replace(/^\//, ''))

test('every PDF and cover exists, and each size label matches its file', () => {
  for (const pdf of ALL_PDFS) {
    assert.ok(existsSync(publicPath(pdf.file)), `${pdf.file} is missing`)
    assert.ok(existsSync(publicPath(pdf.image)), `${pdf.image} is missing`)
    const mb = (statSync(publicPath(pdf.file)).size / 1e6).toFixed(1)
    assert.equal(pdf.size, `${mb} MB`, `${pdf.file} is ${mb} MB now`)
  }
})

test('every file in public/downloads has an entry', () => {
  const listed = new Set(ALL_PDFS.map(p => p.file))
  for (const f of readdirSync(join(root, 'public/downloads'))) {
    assert.ok(listed.has(`/downloads/${f}`), `public/downloads/${f} is not in lib/guide-pdfs.ts`)
  }
})

test('the Complete Edition comes first and keys are unique', () => {
  assert.equal(ALL_PDFS[0], PDFS.complete)
  assert.equal(new Set(ALL_PDFS.map(p => p.key)).size, ALL_PDFS.length)
})

test('every guide ends with its own PDF card, and every card has a pick', () => {
  const guides = readdirSync(join(root, 'app/guides'), { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(join(root, 'app/guides', d.name, 'page.tsx')))
    .map(d => d.name)
  assert.ok(guides.length >= 14, 'found the guide folders')
  for (const g of guides) {
    const src = read(`app/guides/${g}/page.tsx`)
    const cards = [...src.matchAll(/<GuidePdfCard guide="([^"]+)"/g)].map(m => m[1])
    assert.deepEqual(cards, [g], `app/guides/${g} shows one GuidePdfCard for itself`)
    const pick = pdfPickFor(g)
    assert.ok(pick, `${g} has a pick in lib/guide-pdfs.ts`)
    assert.equal(pick.bundle, pick.pdf === PDFS.complete ? null : PDFS.complete)
  }
})

test('the guides hub lists every PDF under #downloads', () => {
  const src = read('app/guides/page.tsx')
  assert.match(src, /id="downloads"/)
  assert.match(src, /ALL_PDFS\.filter\(/)
  assert.match(src, /href="#downloads"/, 'the hero links down to the downloads')
})

test('nothing links to the shop listings the PDFs used to have', () => {
  const offenders = []
  const walk = dir => {
    for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`
      if (e.isDirectory()) walk(rel)
      else if (/\.(tsx?|json)$/.test(e.name)) {
        const src = read(rel)
        if (/shop\.gilgameshenterprise\.com\/products|guides-and-digital-downloads|shopUrl\(/.test(src)) offenders.push(rel)
      }
    }
  }
  for (const dir of ['app', 'components', 'lib', 'messages']) walk(dir)
  assert.deepEqual(offenders, [])
})
