'use client'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Download } from 'lucide-react'
import {
  IMAGE_PRESETS, QUOTE_MAX_CHARS, QUOTE_SIZES, exportFileName, fitQuote, presetById,
  type ImagePreset, type QuoteSize,
} from '@/lib/tools/image-sizes'
import { canvasToBlob, downloadBlob, pageFont } from '../image-export'
import UseInPost from '../UseInPost'

type Layout = 'bold' | 'centered' | 'bar'
type Theme = 'dark' | 'light' | 'gold'

const LAYOUTS: { id: Layout; label: string }[] = [
  { id: 'bold',     label: 'Bold' },
  { id: 'centered', label: 'Centered' },
  { id: 'bar',      label: 'Bar' },
]

const THEMES: Record<Theme, { label: string; bg: [string, string]; ink: string; muted: string; mark: string; accent: string; swatch: string }> = {
  dark:  { label: 'Dark',  bg: ['#0D0B0A', '#1F1B18'], ink: '#F7F3EF', muted: '#9A9089', mark: '#D4A017', accent: '#EAC020', swatch: 'bg-[#0D0B0A]' },
  light: { label: 'Light', bg: ['#FBF8F3', '#EFE7DA'], ink: '#1A1612', muted: '#6B6058', mark: '#D4A017', accent: '#8A6508', swatch: 'bg-[#FBF8F3]' },
  gold:  { label: 'Gold',  bg: ['#EAC020', '#C8940F'], ink: '#0D0B0A', muted: '#3B2E08', mark: 'rgba(13,11,10,0.8)', accent: '#0D0B0A', swatch: 'bg-[#D4A017]' },
}

const SAMPLE = {
  text: 'Power to the people. Tear down the gatekeeping walls, then build the door.',
  author: 'SocialMate',
  handle: 'socialmate.studio',
}

const SERIF = 'Georgia, "Times New Roman", serif'

// The visitor's own light or dark preference, which the colors follow until
// they pick one. The server renders dark, the site's own look.
const LIGHT_QUERY = '(prefers-color-scheme: light)'
function subscribeScheme(onChange: () => void) {
  try {
    const mq = window.matchMedia(LIGHT_QUERY)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  } catch {
    return () => {}
  }
}
const prefersLight = () => { try { return window.matchMedia(LIGHT_QUERY).matches } catch { return false } }

interface CardInput {
  text: string
  author: string
  handle: string
  layout: Layout
  theme: Theme
  size: QuoteSize
  preset: ImagePreset
}

/** Draws the card at full size. The preview is this same canvas, scaled by CSS. */
function drawQuote(canvas: HTMLCanvasElement, input: CardInput, fonts: { display: string; body: string }) {
  const { preset, layout } = input
  const W = preset.width
  const H = preset.height
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const t = THEMES[input.theme]
  const s = Math.min(W, H)

  // Top to bottom only: every row is one color, which keeps the PNG small
  // (a diagonal gradient made a 1600x900 card over 1 MB, past Bluesky's limit).
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, t.bg[0])
  grad.addColorStop(1, t.bg[1])
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  const pad = Math.round(s * 0.09)
  const text = input.text.trim() || 'Your quote goes here.'
  const author = input.author.trim()
  const handle = input.handle.trim()

  const family = layout === 'centered' ? SERIF : layout === 'bar' ? fonts.body : fonts.display
  const weight = layout === 'centered' ? 'italic 400' : layout === 'bar' ? '500' : '600'
  const lineHeight = layout === 'centered' ? 1.32 : 1.2
  const share = QUOTE_SIZES.find(q => q.id === input.size)?.share ?? QUOTE_SIZES[1].share

  const authorPx = Math.round(s * 0.04)
  const handlePx = Math.round(s * 0.033)
  const footerH = (author ? authorPx * 1.4 : 0) + (handle ? handlePx * 1.4 : 0)
  const markPx = Math.round(s * 0.24)
  const markH = layout === 'bold' ? markPx * 0.42 : layout === 'centered' ? s * 0.05 : 0
  const barW = Math.max(4, Math.round(s * 0.012))
  const textX = layout === 'bar' ? pad + barW + Math.round(s * 0.045) : pad
  const maxWidth = W - textX - pad
  const gapAbove = markH ? s * 0.04 : 0
  const gapBelow = footerH ? s * 0.05 : 0
  const maxHeight = H - pad * 2 - markH - gapAbove - footerH - gapBelow

  const measureAt = (px: number) => {
    ctx.font = `${weight} ${px}px ${family}`
    return (str: string) => ctx.measureText(str).width
  }
  const fit = fitQuote(text, maxWidth, maxHeight, s * share, s * 0.028, lineHeight, measureAt)
  const lineStep = fit.px * lineHeight
  const textH = fit.lines.length * lineStep
  const groupH = markH + gapAbove + textH + gapBelow + footerH
  let y = Math.max(pad, (H - groupH) / 2)

  ctx.textBaseline = 'top'
  const centerX = W / 2

  // Above the text: a big quote mark, or a short rule.
  if (layout === 'bold') {
    ctx.font = `700 ${markPx}px ${fonts.display}`
    ctx.fillStyle = t.mark
    ctx.textAlign = 'left'
    ctx.fillText('“', pad - s * 0.01, y - markPx * 0.12)
  } else if (layout === 'centered') {
    ctx.fillStyle = t.mark
    const ruleW = s * 0.1
    ctx.fillRect(centerX - ruleW / 2, y + markH / 2 - s * 0.003, ruleW, Math.max(2, s * 0.006))
  }
  y += markH + gapAbove

  if (layout === 'bar') {
    ctx.fillStyle = t.mark
    ctx.fillRect(pad, y + fit.px * 0.08, barW, Math.max(textH - fit.px * 0.2, fit.px))
  }

  ctx.font = `${weight} ${fit.px}px ${family}`
  ctx.fillStyle = t.ink
  ctx.textAlign = layout === 'centered' ? 'center' : 'left'
  const lineX = layout === 'centered' ? centerX : textX
  for (const line of fit.lines) {
    ctx.fillText(line, lineX, y + (lineStep - fit.px) / 2)
    y += lineStep
  }
  y += gapBelow

  // Who said it: a short amber rule, then the name and handle.
  if (author || handle) {
    const footX = layout === 'centered' ? centerX : textX
    if (author) {
      ctx.font = `600 ${authorPx}px ${fonts.body}`
      ctx.fillStyle = t.accent
      if (layout === 'centered') {
        ctx.textAlign = 'center'
        ctx.fillText(author, footX, y)
      } else {
        ctx.textAlign = 'left'
        const rule = authorPx * 0.9
        ctx.fillRect(footX, y + authorPx * 0.52, rule, Math.max(2, authorPx * 0.09))
        ctx.fillText(author, footX + rule + authorPx * 0.45, y)
      }
      y += authorPx * 1.4
    }
    if (handle) {
      ctx.font = `400 ${handlePx}px ${fonts.body}`
      ctx.fillStyle = t.muted
      ctx.textAlign = layout === 'centered' ? 'center' : 'left'
      ctx.fillText(handle, footX, y)
    }
  }
  ctx.textAlign = 'left'
}

const label = 'block font-mono text-eyebrow uppercase text-ink-muted'
const field = 'mt-2 min-h-[44px] w-full rounded-xl border border-edge bg-void px-4 text-body text-ink-high placeholder:text-ink-faint transition-colors hover:border-edge-lit focus:border-amber focus:outline-none'
const chip = (on: boolean) =>
  `tap min-h-[44px] rounded-xl border px-3 text-small transition-colors ${
    on ? 'border-amber/60 bg-amber/10 text-ink-high' : 'border-edge text-ink-muted hover:border-edge-lit hover:text-ink-high'
  }`

export default function QuoteCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('')
  const [handle, setHandle] = useState('')
  const [layout, setLayout] = useState<Layout>('bold')
  const [pickedTheme, setTheme] = useState<Theme | null>(null)
  const systemLight = useSyncExternalStore(subscribeScheme, prefersLight, () => false)
  const theme: Theme = pickedTheme ?? (systemLight ? 'light' : 'dark')
  const [size, setSize] = useState<QuoteSize>('m')
  const [presetId, setPresetId] = useState('x')
  const [fontsReady, setFontsReady] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const preset = presetById(presetId)

  // The site's fonts may still be loading on first paint; redraw once they are.
  useEffect(() => {
    let live = true
    document.fonts?.ready.then(() => { if (live) setFontsReady(n => n + 1) }).catch(() => {})
    return () => { live = false }
  }, [])

  const draw = useCallback((canvas: HTMLCanvasElement) => {
    const fonts = {
      display: pageFont('--font-display', 'system-ui, sans-serif'),
      body: pageFont('--font-body', 'system-ui, sans-serif'),
    }
    drawQuote(canvas, { text, author, handle, layout, theme, size, preset }, fonts)
  }, [text, author, handle, layout, theme, size, preset])

  useEffect(() => {
    if (canvasRef.current) draw(canvasRef.current)
  }, [draw, fontsReady])

  const makeImage = useCallback(async () => {
    const canvas = document.createElement('canvas')
    draw(canvas)
    const blob = await canvasToBlob(canvas, 'image/png')
    return blob ? { blob, name: exportFileName('quote-card', preset, 'png') } : null
  }, [draw, preset])

  const download = async () => {
    setBusy(true)
    setError('')
    const made = await makeImage()
    setBusy(false)
    if (!made) { setError('This browser could not make the image. Try another browser.'); return }
    downloadBlob(made.blob, made.name)
  }

  const empty = !text.trim()

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-edge bg-panel p-5 sm:p-6">
        <label htmlFor="quote-text" className={label}>Quote</label>
        <textarea
          id="quote-text"
          value={text}
          maxLength={QUOTE_MAX_CHARS}
          onChange={e => setText(e.target.value)}
          placeholder="Type or paste the line you want people to remember."
          className="mt-2 min-h-[140px] w-full resize-y rounded-xl border border-edge bg-void px-4 py-3 text-body text-ink-high placeholder:text-ink-faint transition-colors hover:border-edge-lit focus:border-amber focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="font-mono text-mono text-ink-muted">{text.length}/{QUOTE_MAX_CHARS}</span>
          {empty && (
            <button
              type="button"
              onClick={() => { setText(SAMPLE.text); setAuthor(SAMPLE.author); setHandle(SAMPLE.handle) }}
              className="tap min-h-[44px] rounded-xl px-3 text-small text-ink-muted transition-colors hover:text-ink-high"
            >
              Try an example
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="quote-author" className={label}>Name (optional)</label>
            <input id="quote-author" value={author} maxLength={60} onChange={e => setAuthor(e.target.value)} placeholder="Who said it" className={field} />
          </div>
          <div>
            <label htmlFor="quote-handle" className={label}>Handle (optional)</label>
            <input id="quote-handle" value={handle} maxLength={60} onChange={e => setHandle(e.target.value)} placeholder="@you.bsky.social" className={field} />
          </div>
        </div>

        <fieldset className="mt-6">
          <legend className={label}>Style</legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {LAYOUTS.map(l => (
              <button key={l.id} type="button" aria-pressed={layout === l.id} onClick={() => setLayout(l.id)} className={chip(layout === l.id)}>
                {l.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className={label}>Colors</legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(Object.keys(THEMES) as Theme[]).map(id => (
              <button key={id} type="button" aria-pressed={theme === id} onClick={() => setTheme(id)} className={`${chip(theme === id)} inline-flex items-center justify-center gap-2`}>
                <span className={`h-3.5 w-3.5 rounded-full border border-edge-lit ${THEMES[id].swatch}`} aria-hidden="true" />
                {THEMES[id].label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className={label}>Text size</legend>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {QUOTE_SIZES.map(q => (
              <button key={q.id} type="button" aria-pressed={size === q.id} onClick={() => setSize(q.id)} className={chip(size === q.id)}>
                {q.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-small text-ink-muted">Long quotes shrink to fit the card.</p>
        </fieldset>

        <fieldset className="mt-5">
          <legend className={label}>Size</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {IMAGE_PRESETS.map(p => (
              <button key={p.id} type="button" aria-pressed={presetId === p.id} aria-label={`${p.label} ${p.use}, ${p.width} by ${p.height}`} onClick={() => setPresetId(p.id)} className={`${chip(presetId === p.id)} flex flex-col items-start justify-center py-1.5 text-left`}>
                <span>{p.label}</span>
                <span className="font-mono text-eyebrow text-ink-muted">{p.width}×{p.height}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {/* ── Preview and export ────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-edge bg-panel p-4 sm:p-6">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Quote card preview, ${preset.width} by ${preset.height}`}
            className="h-auto w-auto rounded-lg shadow-lg"
            style={{ maxWidth: '100%', maxHeight: '70vh' }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-eyebrow uppercase text-ink-muted">
            {preset.label} {preset.use.toLowerCase()} · {preset.width}×{preset.height} PNG
          </p>
          <div className="flex flex-wrap items-start gap-2">
            <UseInPost tool="quote-card" makeImage={makeImage} disabled={empty} />
            <button
              type="button"
              onClick={download}
              disabled={busy || empty}
              className="tap inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-amber px-4 text-small font-medium text-void transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Download className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              {busy ? 'Making…' : 'Download PNG'}
            </button>
          </div>
        </div>
        {error && <p role="alert" className="text-small text-alert">{error}</p>}
        <p className="text-small text-ink-muted">Made in your browser. Your words and the image never leave this device unless you choose Use in a post.</p>
      </div>
    </div>
  )
}
