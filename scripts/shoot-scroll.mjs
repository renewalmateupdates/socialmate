// Walk a page top to bottom in viewport-sized chunks so each screenful can be
// judged on its own. A single full-page PNG of a long landing page scales down
// too far to see type or spacing honestly.
//
//   node scripts/shoot-scroll.mjs <url> <outDir> [width] [height]
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const [url = 'http://localhost:3010/', outDir = './scroll', w = '1440', h = '900'] =
  process.argv.slice(2)
const width = Number(w)
const height = Number(h)

const dir = resolve(outDir)
mkdirSync(dir, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width, height } })
await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })
await page.evaluate(() => { try { localStorage.setItem('sm-cookie-consent', 'accepted') } catch {} })
await page.reload({ waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(500)

const total = await page.evaluate(() => document.body.scrollHeight)
const screens = Math.min(Math.ceil(total / height), 12)

for (let i = 0; i < screens; i++) {
  await page.evaluate(y => window.scrollTo(0, y), i * height)
  // Let scroll-reveal settle before judging the frame.
  await page.waitForTimeout(700)
  const file = resolve(dir, `s${String(i).padStart(2, '0')}.png`)
  await page.screenshot({ path: file })
  console.log(`screen ${i} @ ${i * height}px -> ${file}`)
}

console.log(`page height: ${total}px across ${screens} screens`)
await browser.close()
