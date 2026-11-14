'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, ImageUp, Move, RotateCcw } from 'lucide-react'
import {
  CENTER, IMAGE_PRESETS, containRect, coverCrop, cropAxis, dragFocus, exportFileName,
  type Focus, type ImagePreset,
} from '@/lib/tools/image-sizes'
import { canvasToBlob, downloadBlob } from '../image-export'
import UseInPost from '../UseInPost'

type Mode = 'crop' | 'fit'
type Backdrop = 'blur' | 'dark' | 'light'
type Format = 'jpg' | 'png'

interface Source {
  img: HTMLImageElement
  url: string
  name: string
  w: number
  h: number
}

interface Framing { mode: Mode; focus: Focus }

/** Previews are drawn at most this many pixels on the long side, then scaled by CSS. */
const PREVIEW_PX = 640

const BACKDROPS: { id: Backdrop; label: string }[] = [
  { id: 'blur',  label: 'Blurred' },
  { id: 'dark',  label: 'Dark' },
  { id: 'light', label: 'White' },
]

/** Draws `src` into a width x height canvas, cropped or fitted. Used for previews and the real export alike. */
function drawFramed(canvas: HTMLCanvasElement, src: Source, outW: number, outH: number, framing: Framing, backdrop: Backdrop) {
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  if (framing.mode === 'crop') {
    const c = coverCrop(src.w, src.h, outW, outH, framing.focus)
    ctx.drawImage(src.img, c.x, c.y, c.w, c.h, 0, 0, outW, outH)
    return
  }

  if (backdrop === 'blur') {
    const c = coverCrop(src.w, src.h, outW, outH)
    const canBlur = 'filter' in ctx
    if (canBlur) ctx.filter = `blur(${Math.round(Math.max(outW, outH) * 0.03)}px)`
    // Drawn a little oversized so the blur's soft edge stays off the canvas.
    const grow = 0.08
    ctx.drawImage(src.img, c.x, c.y, c.w, c.h, -outW * grow, -outH * grow, outW * (1 + grow * 2), outH * (1 + grow * 2))
    if (canBlur) ctx.filter = 'none'
    ctx.fillStyle = canBlur ? 'rgba(13,11,10,0.35)' : 'rgba(13,11,10,0.7)'
    ctx.fillRect(0, 0, outW, outH)
  } else {
    ctx.fillStyle = backdrop === 'dark' ? '#0D0B0A' : '#FFFFFF'
    ctx.fillRect(0, 0, outW, outH)
  }
  const r = containRect(src.w, src.h, outW, outH)
  ctx.drawImage(src.img, 0, 0, src.w, src.h, r.x, r.y, r.w, r.h)
}

/** True when the export would be bigger than the part of the photo it uses, so it will look soft. */
function upscaled(src: Source, p: ImagePreset, framing: Framing): boolean {
  if (framing.mode === 'crop') return coverCrop(src.w, src.h, p.width, p.height).w < p.width * 0.98
  const r = containRect(src.w, src.h, p.width, p.height)
  return r.w > src.w * 1.02
}

function PresetCard({ preset, src, framing, backdrop, format, onFraming }: {
  preset: ImagePreset
  src: Source
  framing: Framing
  backdrop: Backdrop
  format: Format
  onFraming: (f: Framing) => void
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const drag = useRef<{ id: number; x: number; y: number; focus: Focus } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const scale = PREVIEW_PX / Math.max(preset.width, preset.height)
  const pw = Math.round(preset.width * scale)
  const ph = Math.round(preset.height * scale)
  const axis = framing.mode === 'crop' ? cropAxis(src.w, src.h, preset.width, preset.height) : null

  useEffect(() => {
    if (ref.current) drawFramed(ref.current, src, pw, ph, framing, backdrop)
  }, [src, pw, ph, framing, backdrop])

  const makeImage = useCallback(async () => {
    const canvas = document.createElement('canvas')
    drawFramed(canvas, src, preset.width, preset.height, framing, backdrop)
    const type = format === 'png' ? 'image/png' : 'image/jpeg'
    const blob = await canvasToBlob(canvas, type, 0.9)
    return blob ? { blob, name: exportFileName('image-resizer', preset, format) } : null
  }, [src, preset, framing, backdrop, format])

  const download = async () => {
    setBusy(true)
    setError('')
    const made = await makeImage()
    setBusy(false)
    if (!made) { setError('This browser could not make the image. Try a smaller photo or another browser.'); return }
    downloadBlob(made.blob, made.name)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!axis) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, focus: framing.focus }
  }
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const shown = e.currentTarget.getBoundingClientRect().width
    onFraming({ mode: 'crop', focus: dragFocus(d.focus, e.clientX - d.x, e.clientY - d.y, src.w, src.h, preset.width, preset.height, shown) })
  }
  const endDrag = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (drag.current?.id === e.pointerId) drag.current = null
  }
  const onKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!axis) return
    const step = e.shiftKey ? 0.2 : 0.05
    const move: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    const m = move[e.key]
    if (!m) return
    e.preventDefault()
    const clamp = (n: number) => Math.min(1, Math.max(0, n))
    onFraming({ mode: 'crop', focus: { x: clamp(framing.focus.x + m[0]), y: clamp(framing.focus.y + m[1]) } })
  }

  const soft = upscaled(src, preset, framing)

  return (
    <article className="flex flex-col rounded-2xl border border-edge bg-panel p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-body font-medium text-ink-high">{preset.label} <span className="text-small font-normal text-ink-muted">{preset.use}</span></p>
        <span className="shrink-0 font-mono text-eyebrow text-ink-muted">{preset.width}×{preset.height}</span>
      </div>

      <div className="mt-3 flex h-[260px] items-center justify-center rounded-xl bg-void p-2">
        <canvas
          ref={ref}
          tabIndex={axis ? 0 : -1}
          role="img"
          aria-label={`${preset.label} ${preset.width} by ${preset.height} preview${axis ? '. Drag or use the arrow keys to move the crop.' : ''}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
          className={`h-auto w-auto rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber ${axis ? (axis === 'x' ? 'cursor-ew-resize' : 'cursor-ns-resize') : ''}`}
          // A sideways crop still lets the page scroll up and down from the preview on a phone.
          style={{ maxWidth: '100%', maxHeight: '244px', touchAction: axis === 'x' ? 'pan-y' : axis === 'y' ? 'pan-x' : 'auto' }}
        />
      </div>

      <p className="mt-2 flex min-h-[20px] items-center gap-1.5 text-small text-ink-muted">
        {axis ? <><Move className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" /> Drag the picture to move the crop</> : framing.mode === 'fit' ? 'Whole picture, with a background' : 'Already this shape, nothing cut off'}
      </p>
      {soft && <p className="mt-1 text-small text-ink-faint">Your picture is smaller than this size, so it will look a little soft.</p>}

      <div className="mt-3 flex flex-wrap items-start gap-2">
        <div className="inline-flex overflow-hidden rounded-xl border border-edge" role="radiogroup" aria-label={`${preset.label} framing`}>
          {(['crop', 'fit'] as Mode[]).map(m => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={framing.mode === m}
              onClick={() => onFraming({ ...framing, mode: m })}
              className={`tap min-h-[42px] px-3.5 text-small transition-colors ${framing.mode === m ? 'bg-amber/15 text-ink-high' : 'text-ink-muted hover:text-ink-high'}`}
            >
              {m === 'crop' ? 'Fill' : 'Fit'}
            </button>
          ))}
        </div>
        {axis && (framing.focus.x !== 0.5 || framing.focus.y !== 0.5) && (
          <button
            type="button"
            onClick={() => onFraming({ ...framing, focus: CENTER })}
            aria-label="Center the crop"
            title="Center the crop"
            className="tap inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-raised hover:text-ink-high"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
        )}
        <div className="ml-auto flex flex-wrap items-start gap-2">
          <UseInPost tool="image-resizer" makeImage={makeImage} label="Use in post" />
          <button
            type="button"
            onClick={download}
            disabled={busy}
            className="tap inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-amber px-3 text-small font-medium text-void transition-opacity hover:opacity-90 disabled:opacity-40"
            aria-label={`Download ${preset.label} ${preset.width} by ${preset.height}`}
          >
            <Download className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            {busy ? 'Making…' : format.toUpperCase()}
          </button>
        </div>
      </div>
      {error && <p role="alert" className="mt-2 text-small text-alert">{error}</p>}
    </article>
  )
}

const label = 'block font-mono text-eyebrow uppercase text-ink-muted'
const chip = (on: boolean) =>
  `tap min-h-[44px] rounded-xl border px-3 text-small transition-colors ${
    on ? 'border-amber/60 bg-amber/10 text-ink-high' : 'border-edge text-ink-muted hover:border-edge-lit hover:text-ink-high'
  }`

const freshFramings = (): Record<string, Framing> =>
  Object.fromEntries(IMAGE_PRESETS.map(p => [p.id, { mode: 'crop' as Mode, focus: CENTER }]))

export default function ImageResizer() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [src, setSrc] = useState<Source | null>(null)
  const [framings, setFramings] = useState<Record<string, Framing>>(freshFramings)
  const [backdrop, setBackdrop] = useState<Backdrop>('blur')
  const [format, setFormat] = useState<Format>('jpg')
  const [error, setError] = useState('')
  const [over, setOver] = useState(false)

  // Let go of the old picture's memory when a new one replaces it.
  useEffect(() => () => { if (src) URL.revokeObjectURL(src.url) }, [src])

  const open = (file: File | undefined) => {
    setError('')
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('That is not an image. Try a JPG, PNG or WebP.'); return }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) {
        URL.revokeObjectURL(url)
        setError('This browser could not open that image. Try a JPG, PNG or WebP.')
        return
      }
      setSrc({ img, url, name: file.name, w: img.naturalWidth, h: img.naturalHeight })
      setFramings(freshFramings())
      // A PNG may have see-through parts that JPG would fill with black.
      setFormat(file.type === 'image/png' ? 'png' : 'jpg')
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      setError('This browser could not open that image. Try a JPG, PNG or WebP.')
    }
    img.src = url
  }

  const pick = () => inputRef.current?.click()

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/heic"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={e => { open(e.target.files?.[0]); e.target.value = '' }}
      />

      {!src ? (
        <button
          type="button"
          onClick={pick}
          onDragOver={e => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={e => { e.preventDefault(); setOver(false); open(e.dataTransfer.files?.[0]) }}
          className={`tap flex min-h-[260px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
            over ? 'border-amber bg-amber/5' : 'border-edge bg-panel hover:border-edge-lit'
          }`}
        >
          <ImageUp className="h-8 w-8 text-amber" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-body-lg font-medium text-ink-high">Choose a picture</span>
          <span className="text-small text-ink-muted">or drop one here. JPG, PNG or WebP. It stays on this device.</span>
        </button>
      ) : (
        <div className="flex flex-col gap-4 rounded-2xl border border-edge bg-panel p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- a local object URL, nothing for next/image to optimize */}
            <img src={src.url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0">
              <p className="truncate text-body text-ink-high">{src.name || 'Your picture'}</p>
              <p className="font-mono text-eyebrow text-ink-muted">{src.w}×{src.h}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <span className={label}>Fit background</span>
              <div className="mt-2 flex gap-1.5" role="radiogroup" aria-label="Fit background">
                {BACKDROPS.map(b => (
                  <button key={b.id} type="button" role="radio" aria-checked={backdrop === b.id} onClick={() => setBackdrop(b.id)} className={chip(backdrop === b.id)}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className={label}>Format</span>
              <div className="mt-2 flex gap-1.5" role="radiogroup" aria-label="Format">
                {(['jpg', 'png'] as Format[]).map(f => (
                  <button key={f} type="button" role="radio" aria-checked={format === f} onClick={() => setFormat(f)} className={chip(format === f)}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={pick}
              className="tap inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-edge px-3 text-small text-ink-body transition-colors hover:border-edge-lit hover:bg-raised"
            >
              <ImageUp className="h-4 w-4" strokeWidth={2} aria-hidden="true" /> New picture
            </button>
          </div>
        </div>
      )}

      {error && <p role="alert" className="mt-3 text-small text-alert">{error}</p>}

      {src && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {IMAGE_PRESETS.map(p => (
            <PresetCard
              key={p.id}
              preset={p}
              src={src}
              framing={framings[p.id]}
              backdrop={backdrop}
              format={format}
              onFraming={f => setFramings(prev => ({ ...prev, [p.id]: f }))}
            />
          ))}
        </div>
      )}

      <p className="mt-4 text-small text-ink-muted">
        Resized in your browser. Your picture is never uploaded unless you choose Use in post. JPG keeps photos small;
        PNG keeps see-through parts and sharp text.
      </p>
    </div>
  )
}
