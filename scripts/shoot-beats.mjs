// Verify the hero loop beat by beat.
//
// Seeks every running CSS animation to an exact time with the Web Animations API
// (rather than screenshotting at random and hoping), so each beat can actually be
// inspected. Same seeking approach the recorder uses for deterministic frames.
//
//   node scripts/shoot-beats.mjs <url> <outDir> [width]
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const [url = 'http://localhost:3010/', outDir = './beats', width = '1440'] = process.argv.slice(2)
const BEATS = [
  { t: 1.4,  name: '1-typing' },
  { t: 3.4,  name: '2-generating' },
  { t: 5.2,  name: '3-drafts' },
  { t: 7.6,  name: '4-queued' },
  { t: 9.4,  name: '5-published' },
  { t: 11.0, name: '6-credits' },
]

mkdirSync(resolve(outDir), { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } })
await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })
await page.evaluate(() => document.fonts.ready)

// Dismiss the cookie banner so it doesn't sit on top of the panel.
await page.evaluate(() => {
  try { localStorage.setItem('sm-cookie-consent', 'accepted') } catch {}
})
await page.reload({ waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

const panel = page.locator('.hero-clock').first()
await panel.waitFor({ state: 'visible', timeout: 15_000 })

for (const beat of BEATS) {
  await page.evaluate((tMs) => {
    for (const a of document.getAnimations()) {
      a.pause()
      try { a.currentTime = tMs } catch {}
    }
  }, beat.t * 1000)
  await page.waitForTimeout(120)

  const file = resolve(outDir, `${beat.name}.png`)
  await panel.screenshot({ path: file })
  console.log(`t=${beat.t}s ${beat.name} -> ${file}`)
}

await browser.close()
