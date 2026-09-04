'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Build a video out of stills, inside the studio.
 *
 * "Browse files" assumed the creator already had a finished video, which is the
 * one thing a studio should not assume. Plenty of TikTok posts are photos with
 * motion and a track over them, and making one previously meant leaving for
 * CapCut, exporting, and coming back to upload.
 *
 * The output is a real MP4 handed back as a File, so it enters the existing
 * pipeline exactly as an uploaded video does — trim, filters, cover frame,
 * safe-area guides and publishing all work on it without knowing it was made
 * from photos.
 */

const CANVAS_W = 720
const CANVAS_H = 1280
const FPS = 30
const MAX_SLIDES = 20
const MIN_TOTAL_S = 3

export type Fit = 'fill' | 'fit'
export interface Slide { id: string; url: string; name: string; seconds: number; fit: Fit }

interface Props {
  onComposed: (file: File) => void
  onCancel: () => void
}

/** TikTok rejects WebM, so composing is only possible where H.264 is available. */
function pickMp4Mime(): string | null {
  if (typeof MediaRecorder === 'undefined') return null
  const candidates = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4;codecs=avc1',
    'video/mp4',
  ]
  for (const m of candidates) if (MediaRecorder.isTypeSupported(m)) return m
  return null
}

/**
 * Two ways to put a photo in a 9:16 frame, because one is not enough.
 *
 * 'fill' covers the frame and crops the overflow. Right for a phone photo,
 * wrong for anything wide: a 16:9 screenshot keeps only the middle third of its
 * width, so a landing page becomes a slice of a headline.
 *
 * 'fit' scales the whole image to be visible and fills the space behind it with
 * a blown-up, blurred copy of itself. That is the standard treatment for
 * landscape footage in a vertical feed, and it reads as deliberate rather than
 * as a bad crop.
 */
function drawSlide(
  ctx: CanvasRenderingContext2D, img: HTMLImageElement, mode: Fit, scale: number, panX: number
) {
  const ir = img.width / img.height
  const cr = CANVAS_W / CANVAS_H

  const cover = (s: number, pan: number) => {
    let w: number, h: number
    if (ir > cr) { h = CANVAS_H * s; w = h * ir }
    else         { w = CANVAS_W * s; h = w / ir }
    const x = (CANVAS_W - w) / 2 + pan * (w - CANVAS_W) * 0.5
    const y = (CANVAS_H - h) / 2
    ctx.drawImage(img, x, y, w, h)
  }

  if (mode === 'fill') { cover(scale, panX); return }

  // Backdrop: the same image, oversized and blurred, so the bars are never
  // dead black. Drawn first, then cleared of the filter for the sharp pass.
  ctx.save()
  ctx.filter = 'blur(28px) brightness(0.55) saturate(1.2)'
  cover(scale * 1.25, panX * 0.35)
  ctx.restore()

  // Foreground: whole image visible, centred, with the same slow push applied.
  let w: number, h: number
  if (ir > cr) { w = CANVAS_W * scale; h = w / ir }
  else         { h = CANVAS_H * scale; w = h * ir }
  ctx.drawImage(img, (CANVAS_W - w) / 2, (CANVAS_H - h) / 2, w, h)
}

export default function PhotoComposer({ onComposed, onCancel }: Props) {
  const [slides, setSlides]     = useState<Slide[]>([])
  const [audio, setAudio]       = useState<{ url: string; name: string } | null>(null)
  const [kenBurns, setKenBurns] = useState(true)
  const [crossfade, setCrossfade] = useState(true)
  const [building, setBuilding] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError]       = useState<string | null>(null)

  const imgInputRef = useRef<HTMLInputElement>(null)
  const audInputRef = useRef<HTMLInputElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const audioElRef  = useRef<HTMLAudioElement>(null)

  const total = slides.reduce((n, s) => n + s.seconds, 0)

  // Object URLs are revoked on unmount rather than per-change, so a slide that
  // is still on screen never has its source pulled out from under it.
  useEffect(() => {
    return () => {
      slides.forEach(s => URL.revokeObjectURL(s.url))
      if (audio) URL.revokeObjectURL(audio.url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addImages = useCallback((files: FileList | null) => {
    if (!files?.length) return
    setError(null)
    const picked = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!picked.length) { setError('Those files are not images.'); return }
    setSlides(prev => {
      const room = MAX_SLIDES - prev.length
      if (room <= 0) { setError(`${MAX_SLIDES} photos is the limit.`); return prev }
      const next: Slide[] = picked.slice(0, room).map((f, i) => ({
        id: `${Date.now()}-${i}-${f.name}`,
        url: URL.createObjectURL(f),
        name: f.name,
        seconds: 2.5,
        // Provisional. Corrected below once the real dimensions are known.
        fit: 'fill' as Fit,
      }))

      // A wide image cropped to 9:16 loses two thirds of its width, which is
      // wrong for anything with layout in it — a screenshot, a chart, a
      // landscape shot. Anything meaningfully wider than tall defaults to fit,
      // and the creator can still override it per photo.
      next.forEach(slide => {
        const probe = new Image()
        probe.onload = () => {
          if (probe.width / probe.height > 1.2) {
            setSlides(cur => cur.map(x => (x.id === slide.id ? { ...x, fit: 'fit' } : x)))
          }
        }
        probe.src = slide.url
      })

      return prev.concat(next)
    })
  }, [])

  const move = (i: number, dir: -1 | 1) => setSlides(prev => {
    const j = i + dir
    if (j < 0 || j >= prev.length) return prev
    const copy = prev.slice()
    const tmp = copy[i]; copy[i] = copy[j]; copy[j] = tmp
    return copy
  })

  const remove = (i: number) => setSlides(prev => prev.filter((_, k) => k !== i))

  const setSeconds = (i: number, secs: number) =>
    setSlides(prev => prev.map((s, k) => (k === i ? { ...s, seconds: secs } : s)))

  const build = useCallback(async () => {
    setError(null)
    if (slides.length === 0) { setError('Add at least one photo.'); return }
    if (total < MIN_TOTAL_S) { setError(`TikTok needs at least ${MIN_TOTAL_S} seconds. Add another photo or lengthen one.`); return }

    const mime = pickMp4Mime()
    if (!mime) {
      setError('This browser cannot make MP4 video, which TikTok requires. Chrome or Edge can.')
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return

    setBuilding(true)
    setProgress(0)

    try {
      // Decode every image up front. Drawing an image mid-render that has not
      // finished decoding silently produces a blank frame.
      const imgs = await Promise.all(slides.map(s => new Promise<HTMLImageElement>((res, rej) => {
        const im = new Image()
        im.onload = () => res(im)
        im.onerror = () => rej(new Error(`Could not read ${s.name}`))
        im.src = s.url
      })))

      const ctx = canvas.getContext('2d')!
      const stream = canvas.captureStream(FPS)

      // Optional music bed. Their own file — TikTok does not let anyone pull
      // audio out of its sound library, so this is the honest version of it.
      let audioCtx: AudioContext | null = null
      if (audio && audioElRef.current) {
        try {
          audioCtx = new AudioContext()
          const src = audioCtx.createMediaElementSource(audioElRef.current)
          const dest = audioCtx.createMediaStreamDestination()
          src.connect(dest)
          src.connect(audioCtx.destination)
          dest.stream.getAudioTracks().forEach(t => stream.addTrack(t))
        } catch (e) {
          console.warn('[composer] audio track failed, building silent', e)
        }
      }

      const chunks: Blob[] = []
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 })
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
      const done = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/mp4' }))
        recorder.onerror = () => reject(new Error('Recording failed partway through'))
      })

      // Slide boundaries in seconds, computed once.
      const starts: number[] = []
      let acc = 0
      for (const s of slides) { starts.push(acc); acc += s.seconds }
      const FADE = crossfade ? 0.45 : 0

      recorder.start(100)
      if (audio && audioElRef.current) {
        audioElRef.current.currentTime = 0
        void audioElRef.current.play().catch(() => {})
      }

      const t0 = performance.now()
      await new Promise<void>(resolve => {
        const frame = () => {
          const t = (performance.now() - t0) / 1000
          if (t >= total) { resolve(); return }

          let i = 0
          while (i < starts.length - 1 && t >= starts[i + 1]) i++
          const local = t - starts[i]
          const dur = slides[i].seconds

          ctx.fillStyle = '#000'
          ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

          // Slow push in with a touch of drift, so a still does not sit dead.
          const p = dur > 0 ? local / dur : 0
          const scale = kenBurns ? 1.02 + 0.09 * p : 1.02
          const pan   = kenBurns ? (i % 2 === 0 ? -1 : 1) * (p - 0.5) * 0.4 : 0
          ctx.globalAlpha = 1
          drawSlide(ctx, imgs[i], slides[i].fit, scale, pan)

          // Crossfade into the next still over the tail of this one.
          if (FADE > 0 && i < slides.length - 1 && local > dur - FADE) {
            const a = (local - (dur - FADE)) / FADE
            ctx.globalAlpha = Math.min(Math.max(a, 0), 1)
            drawSlide(ctx, imgs[i + 1], slides[i + 1].fit, 1.02, 0)
            ctx.globalAlpha = 1
          }

          setProgress(Math.min(t / total, 1))
          requestAnimationFrame(frame)
        }
        requestAnimationFrame(frame)
      })

      recorder.stop()
      audioElRef.current?.pause()
      const blob = await done
      void audioCtx?.close()

      if (blob.size < 1024) throw new Error('The video came out empty. Try again.')
      onComposed(new File([blob], `socialmate-photos-${Date.now()}.mp4`, { type: 'video/mp4' }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not build the video.')
    } finally {
      setBuilding(false)
    }
  }, [slides, total, kenBurns, crossfade, audio, onComposed])

  return (
    <div className="w-full max-w-2xl mx-auto p-5">
      <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="hidden" />
      {audio && <audio ref={audioElRef} src={audio.url} className="hidden" />}

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#fe2c55]">Photo video</p>
          <h3 className="text-lg font-extrabold text-ink-high mt-1">Build one from photos</h3>
        </div>
        <button onClick={onCancel} className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink-high transition-colors">
          Back
        </button>
      </div>

      {/* Slides */}
      {slides.length === 0 ? (
        <button
          onClick={() => imgInputRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-edge hover:border-[#fe2c55]/60 hover:bg-panel/40 transition-all py-12 flex flex-col items-center gap-2"
        >
          <span className="text-sm font-bold text-ink-high">Add photos</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            up to {MAX_SLIDES} &middot; jpg or png
          </span>
        </button>
      ) : (
        <div className="space-y-2">
          {slides.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl border border-edge bg-panel/60 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.url} alt="" className="h-16 w-10 rounded-md object-cover shrink-0" />
              <span className="font-mono text-[10px] tabular-nums text-ink-faint w-5 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs text-ink-body">{s.name}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="range" min={1} max={8} step={0.5} value={s.seconds}
                    onChange={e => setSeconds(i, Number(e.target.value))}
                    className="flex-1 accent-[#fe2c55]" aria-label={`Seconds for photo ${i + 1}`}
                  />
                  <span className="font-mono text-[10px] tabular-nums text-ink-faint w-8 text-right">{s.seconds}s</span>
                  <button
                    onClick={() => setSlides(cur => cur.map((x, k) =>
                      (k === i ? { ...x, fit: x.fit === 'fill' ? 'fit' : 'fill' } : x)))}
                    title={s.fit === 'fill'
                      ? 'Filling the frame and cropping the edges. Click to show the whole image instead.'
                      : 'Showing the whole image on a blurred backdrop. Click to fill the frame instead.'}
                    className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] px-2 py-1 rounded-md border border-edge text-ink-muted hover:text-ink-high hover:border-edge-lit transition-colors"
                  >
                    {s.fit === 'fill' ? 'Fill' : 'Fit'}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"
                  className="px-2 py-0.5 rounded-md border border-edge text-ink-muted disabled:opacity-30 hover:text-ink-high text-[10px]">↑</button>
                <button onClick={() => move(i, 1)} disabled={i === slides.length - 1} aria-label="Move down"
                  className="px-2 py-0.5 rounded-md border border-edge text-ink-muted disabled:opacity-30 hover:text-ink-high text-[10px]">↓</button>
              </div>
              <button onClick={() => remove(i)} aria-label="Remove"
                className="shrink-0 px-2 py-1 rounded-md text-ink-faint hover:text-alert transition-colors text-xs">✕</button>
            </div>
          ))}
          <button
            onClick={() => imgInputRef.current?.click()}
            className="w-full rounded-xl border border-dashed border-edge py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink-high hover:border-edge-lit transition-colors"
          >
            Add more
          </button>
        </div>
      )}

      <input ref={imgInputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => { addImages(e.target.files); e.target.value = '' }} />
      <input ref={audInputRef} type="file" accept="audio/*" className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) setAudio({ url: URL.createObjectURL(f), name: f.name })
          e.target.value = ''
        }} />

      {slides.length > 0 && (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              onClick={() => setKenBurns(v => !v)}
              className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                kenBurns ? 'border-[#fe2c55]/50 bg-[#fe2c55]/10' : 'border-edge bg-panel/60'}`}
            >
              <p className="text-xs font-bold text-ink-high">Motion {kenBurns ? 'on' : 'off'}</p>
              <p className="text-[11px] text-ink-muted mt-0.5">Slow push so stills do not sit dead</p>
            </button>
            <button
              onClick={() => setCrossfade(v => !v)}
              className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                crossfade ? 'border-[#fe2c55]/50 bg-[#fe2c55]/10' : 'border-edge bg-panel/60'}`}
            >
              <p className="text-xs font-bold text-ink-high">Crossfade {crossfade ? 'on' : 'off'}</p>
              <p className="text-[11px] text-ink-muted mt-0.5">Blend between photos instead of cutting</p>
            </button>
          </div>

          {/* Audio. Deliberately their own file — see the note below it. */}
          <div className="mt-2 rounded-xl border border-edge bg-panel/60 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-ink-high">
                  {audio ? audio.name : 'Add a music bed'}
                </p>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  Your own audio file. TikTok sounds get added in the TikTok app after posting.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {audio && (
                  <button onClick={() => setAudio(null)}
                    className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink-high">
                    Remove
                  </button>
                )}
                <button onClick={() => audInputRef.current?.click()}
                  className="font-mono text-[10px] uppercase tracking-[0.14em] px-3 py-2 rounded-lg border border-edge text-ink-muted hover:text-ink-high hover:border-edge-lit transition-colors">
                  {audio ? 'Change' : 'Choose'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              {slides.length} photo{slides.length === 1 ? '' : 's'} &middot; {total.toFixed(1)}s
            </p>
            <button
              onClick={build}
              disabled={building}
              className="bg-[#fe2c55] text-white font-bold px-6 py-3 rounded-2xl text-sm hover:brightness-110 disabled:opacity-60 transition-all shadow-[0_10px_30px_-8px_rgba(254,44,85,0.7)]"
            >
              {building ? `Building ${Math.round(progress * 100)}%` : 'Make the video'}
            </button>
          </div>

          {building && (
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-raised">
              <div className="h-full bg-[#fe2c55] transition-[width]" style={{ width: `${progress * 100}%` }} />
            </div>
          )}
        </>
      )}

      {error && <p className="mt-3 text-xs text-alert">{error}</p>}
    </div>
  )
}
