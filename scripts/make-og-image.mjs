#!/usr/bin/env node
/**
 * Draws public/og-image.png, the share card every page without its own image
 * uses (the root layout, the blog, the affiliate and guide pages).
 *
 *   node scripts/make-og-image.mjs
 *
 * The prices, the free post cap and the platform names come from lib/plan.ts
 * and lib/site-facts.ts, never typed here. The old hand-made card kept saying
 * "Pro $5/mo, Agency $20/mo" for three months after the August repricing.
 * The values used are saved to scripts/og-image-facts.json, and
 * scripts/test-og-image-facts.mjs fails when they no longer match the code,
 * so the next price or platform change says "run this again".
 *
 * Needs Google Chrome installed (playwright-core drives it) and a network
 * connection for the Poppins font.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))
const ts = require('typescript')

export const OG_WIDTH = 1270
export const OG_HEIGHT = 760
export const FACTS_PATH = join(root, 'scripts', 'og-image-facts.json')

// Loads lib/*.ts as the app would; plan.ts and site-facts.ts import nothing at runtime but each other.
const cache = new Map()
function load(rel) {
  if (cache.has(rel)) return cache.get(rel).exports
  const { outputText } = ts.transpileModule(readFileSync(join(root, rel), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  })
  const mod = { exports: {} }
  cache.set(rel, mod)
  const localRequire = (id) => {
    if (id.startsWith('./')) return load(join(dirname(rel), `${id.slice(2)}.ts`).replace(/\\/g, '/'))
    if (id.startsWith('@/lib/')) return load(`lib/${id.slice('@/lib/'.length)}.ts`)
    return require(id)
  }
  new Function('module', 'exports', 'require', outputText)(mod, mod.exports, localRequire)
  return mod.exports
}

/** What the card says, straight from the code. */
export function currentFacts() {
  const { PLAN_PRICES, PLAN_POST_LIMITS } = load('lib/plan.ts')
  const { LIVE_PLATFORM_NAMES } = load('lib/site-facts.ts')
  return {
    freePosts: PLAN_POST_LIMITS.free,
    proMonthly: PLAN_PRICES.pro.monthly,
    agencyMonthly: PLAN_PRICES.agency.monthly,
    platforms: [...LIVE_PLATFORM_NAMES],
  }
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function cardHtml(f) {
  const chips = f.platforms.map(p => `<span class="chip">${esc(p)}</span>`).join('')
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${OG_WIDTH}px; height: ${OG_HEIGHT}px; overflow: hidden; }
  body { font-family: 'Poppins', sans-serif; color: #F7F3EF; position: relative;
    background:
      radial-gradient(ellipse 820px 520px at 980px 200px, rgba(212,160,23,0.15), transparent 70%),
      radial-gradient(ellipse 600px 400px at 120px 760px, rgba(212,160,23,0.06), transparent 70%),
      #0D0B0A; }
  .grid { position: absolute; inset: 0;
    background-image: radial-gradient(rgba(247,243,239,0.07) 1.2px, transparent 1.4px);
    background-size: 26px 26px;
    -webkit-mask-image: radial-gradient(ellipse 900px 600px at 900px 260px, #000 20%, transparent 75%); }
  .top { position: absolute; left: 72px; right: 72px; top: 76px; display: flex; align-items: center; justify-content: space-between; }
  .mark { display: flex; align-items: center; gap: 16px; }
  .dots { position: relative; width: 98px; height: 50px; }
  .dots span { position: absolute; border-radius: 50%; }
  .d1 { width: 44px; height: 44px; left: 0; top: 6px; background: #3B3B3B; }
  .d2 { width: 52px; height: 52px; left: 24px; top: -1px; background: #6E6E6E; }
  .d3 { width: 44px; height: 44px; left: 56px; top: 6px; background: #CFCFCF; }
  .name { font-weight: 800; font-size: 34px; letter-spacing: -0.5px; }
  .url { font-weight: 600; font-size: 24px; color: #D4A017; }
  .main { position: absolute; left: 72px; right: 72px; top: 196px; }
  h1 { font-weight: 800; font-size: 104px; line-height: 1.02; letter-spacing: -3px; }
  h1 .gold { color: #EAC020; }
  .sub { margin-top: 22px; font-weight: 500; font-size: 28px; color: #D6CFC7; }
  .chips { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; }
  .chip { font-weight: 500; font-size: 22px; color: #D6CFC7; padding: 7px 18px; border-radius: 999px;
    border: 1.5px solid #3D352F; background: rgba(31,27,24,0.85); }
  .foot { position: absolute; left: 72px; right: 72px; bottom: 72px; padding-top: 22px;
    border-top: 1px solid #2C2622; display: flex; justify-content: space-between;
    font-weight: 600; font-size: 24px; color: #9A9089; }
  .foot b { color: #F7F3EF; font-weight: 600; }
</style></head><body>
  <div class="grid"></div>
  <div class="top">
    <div class="mark"><div class="dots"><span class="d1"></span><span class="d2"></span><span class="d3"></span></div><div class="name">SocialMate</div></div>
    <div class="url">socialmate.studio</div>
  </div>
  <div class="main">
    <h1>Post everywhere.<br><span class="gold">All at once.</span></h1>
    <p class="sub">Schedule to ${f.platforms.length} platforms from one calendar.</p>
    <div class="chips">${chips}</div>
  </div>
  <div class="foot">
    <span>Free: <b>${esc(f.freePosts)} posts a month</b>, no credit card</span>
    <span>Pro <b>$${esc(f.proMonthly)}/mo</b> &nbsp;|&nbsp; Agency <b>$${esc(f.agencyMonthly)}/mo</b></span>
  </div>
</body></html>`
}

async function main() {
  const facts = currentFacts()
  const dir = mkdtempSync(join(tmpdir(), 'og-image-'))
  const htmlPath = join(dir, 'card.html')
  writeFileSync(htmlPath, cardHtml(facts))
  const { chromium } = require('playwright-core')
  const browser = await chromium.launch({ channel: 'chrome' })
  try {
    const page = await browser.newPage({ viewport: { width: OG_WIDTH, height: OG_HEIGHT }, deviceScaleFactor: 1 })
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    if (!(await page.evaluate(() => document.fonts.check('800 104px Poppins')))) {
      throw new Error('Poppins did not load (no network?). Not writing a card in the fallback font.')
    }
    const box = await page.evaluate(() => {
      const r = document.querySelector('.chips').getBoundingClientRect()
      return { right: r.right, bottom: r.bottom }
    })
    if (box.right > OG_WIDTH - 72 || box.bottom > OG_HEIGHT - 130) {
      throw new Error(`The platform row no longer fits (${JSON.stringify(box)}); shrink the chips before shipping.`)
    }
    await page.screenshot({ path: join(root, 'public', 'og-image.png'), clip: { x: 0, y: 0, width: OG_WIDTH, height: OG_HEIGHT } })
  } finally {
    await browser.close()
    rmSync(dir, { recursive: true, force: true })
  }
  writeFileSync(FACTS_PATH, JSON.stringify(facts, null, 2) + '\n')
  console.log('Wrote public/og-image.png and scripts/og-image-facts.json:', JSON.stringify(facts))
}

// Runs only when called directly, so the test can import currentFacts() without drawing anything.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((err) => { console.error(err.message || err); process.exit(1) })
}
