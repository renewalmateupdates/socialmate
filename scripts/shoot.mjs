// Design QA screenshots. Never call a section done from reading your own code —
// a picture is worth a thousand tokens.
//
//   node scripts/shoot.mjs <url> <outDir> [width,width,...] [--full]
//
// Uses the system Chrome via playwright-core so we don't pull ~120MB of bundled
// Chromium onto a dev machine just to look at a page.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const [url = 'http://localhost:3010/', outDir = './shots', widthArg = '1440'] = process.argv.slice(2)
const full = process.argv.includes('--full')
const widths = widthArg.split(',').map(Number).filter(Boolean)

mkdirSync(resolve(outDir), { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })

for (const width of widths) {
  const page = await browser.newPage({
    viewport: { width, height: width < 500 ? 780 : 900 },
    deviceScaleFactor: 1,
  })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })
  // Let the fonts settle so we're judging Clash, not the fallback metrics.
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(900)

  const file = resolve(outDir, `w${width}${full ? '-full' : ''}.png`)
  await page.screenshot({ path: file, fullPage: full })
  console.log(`${width}px -> ${file}`)
  await page.close()
}

await browser.close()
