/**
 * THE ASSET FACTORY
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the reason the hero is code and not a screen recording. Ship a
 * feature, re-run this, get new marketing clips. No OBS, no editing, forever.
 *
 *   node scripts/record-hero.mjs [--fps 30] [--url http://localhost:3010/demo/hero]
 *
 * Outputs to public/demo/:
 *   hero.mp4  — Product Hunt, X, LinkedIn
 *   hero.gif  — Reddit and Discord, kept under 5MB
 *
 * Frames are produced by SEEKING the Web Animations API to an exact time and
 * screenshotting, rather than capturing a live video. That matters: the loop is
 * driven by one 14s CSS clock, so seeking gives frame-exact, dropped-frame-free
 * output where the last frame meets the first perfectly. A live screen recording
 * of the same animation would jitter and the loop seam would show.
 *
 * ffmpeg comes from @ffmpeg-installer (a dev dependency), so this works without
 * a system ffmpeg install.
 */
import { chromium } from 'playwright-core'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback
}

const FPS = Number(flag('fps', '30'))
const URL = flag('url', 'http://localhost:3010/demo/hero')
const LOOP_SECONDS = Number(flag('duration', '14')) // must match --hero-dur
const WIDTH = 1200
const HEIGHT = 750

const frameDir = resolve('.hero-frames')
const outDir = resolve('public/demo')
const ffmpeg = ffmpegInstaller.path

rmSync(frameDir, { recursive: true, force: true })
mkdirSync(frameDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

const totalFrames = Math.round(LOOP_SECONDS * FPS)
console.log(`Recording ${totalFrames} frames at ${FPS}fps (${LOOP_SECONDS}s loop) from ${URL}`)

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 2, // retina source; ffmpeg scales down for crisp output
})

await page.goto(URL, { waitUntil: 'networkidle', timeout: 60_000 })

// Strip the floating app widgets. They belong in the product, not in a clip that
// goes out to Product Hunt with a cookie banner across the bottom of it.
await page.evaluate(() => {
  try { localStorage.setItem('cookie_consent', 'accepted') } catch {}
})
await page.reload({ waitUntil: 'networkidle' })
await page.evaluate(() => {
  document.getElementById('app-widgets')?.remove()
  // The dev-server build indicator is dev-only, but recordings are made against
  // the dev server, so it would otherwise sit in the corner of every clip.
  document.querySelectorAll('nextjs-portal').forEach(el => el.remove())
})
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(400)

// Freeze every animation so nothing advances between screenshots.
await page.evaluate(() => {
  for (const a of document.getAnimations()) a.pause()
})

for (let i = 0; i < totalFrames; i++) {
  const tMs = (i / FPS) * 1000
  await page.evaluate(t => {
    for (const a of document.getAnimations()) {
      try { a.currentTime = t } catch {}
    }
  }, tMs)

  // NOT animations:'disabled' — that resets every animation to its initial state
  // and silently throws away the seek above, which renders each beat's start and
  // end tags on top of each other.
  await page.screenshot({
    path: resolve(frameDir, `f${String(i).padStart(4, '0')}.png`),
  })

  if (i % 60 === 0) process.stdout.write(`  frame ${i}/${totalFrames}\r`)
}
console.log(`  frame ${totalFrames}/${totalFrames} — captured        `)
await browser.close()

const pattern = resolve(frameDir, 'f%04d.png')
const mp4 = resolve(outDir, 'hero.mp4')
const gif = resolve(outDir, 'hero.gif')
const palette = resolve(frameDir, 'palette.png')

const run = (label, cmdArgs) => {
  process.stdout.write(`${label}… `)
  execFileSync(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', ...cmdArgs])
  console.log('done')
}

// H.264, yuv420p so it plays everywhere including Safari and Twitter.
run('Encoding hero.mp4', [
  '-framerate', String(FPS), '-i', pattern,
  '-vf', `scale=${WIDTH}:-2:flags=lanczos`,
  '-c:v', 'libx264', '-profile:v', 'high', '-crf', '20', '-preset', 'slow',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  mp4,
])

// GIF at half rate and 720px wide — a 30fps full-width GIF is many megabytes and
// nobody can tell the difference in a Discord embed.
const GIF_FPS = Math.round(FPS / 2)
run('Building GIF palette', [
  '-framerate', String(FPS), '-i', pattern,
  '-vf', `fps=${GIF_FPS},scale=720:-1:flags=lanczos,palettegen=stats_mode=diff`,
  palette,
])
run('Encoding hero.gif', [
  '-framerate', String(FPS), '-i', pattern, '-i', palette,
  '-lavfi', `fps=${GIF_FPS},scale=720:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3`,
  '-loop', '0',
  gif,
])

rmSync(frameDir, { recursive: true, force: true })

const mb = p => (statSync(p).size / 1024 / 1024).toFixed(2)
console.log('')
for (const p of [mp4, gif]) {
  if (!existsSync(p)) continue
  const size = mb(p)
  const warn = p === gif && Number(size) > 5 ? '  ⚠ over the 5MB budget' : ''
  console.log(`${p.replace(process.cwd(), '.')} — ${size} MB${warn}`)
}
