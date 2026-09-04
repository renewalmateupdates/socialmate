'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * A real timeline, in place of two disconnected range sliders.
 *
 * Trimming used to mean dragging a "Trim Start" slider and a "Trim End" slider
 * that sat under a thin bar showing the result. You could not see the video you
 * were cutting, so finding the moment to cut on meant scrubbing, reading a
 * timestamp, then moving a slider to that number. Every editor people actually
 * use — CapCut, Premiere, the iOS trimmer — shows frames and lets you drag the
 * ends of the clip directly, because that is the whole task.
 *
 * Frames are extracted once on load from the local blob URL, so there is no
 * network cost and nothing is uploaded to produce them.
 */

const FRAME_COUNT = 14
const FRAME_W = 96   // extraction size; displayed responsively
const FRAME_H = 170

interface Props {
  videoUrl: string
  duration: number
  currentTime: number
  trimStart: number
  trimEnd: number
  minDuration: number
  onSeek: (t: number) => void
  onTrimChange: (start: number, end: number) => void
  /** Frames are handed back so the cover picker can reuse them. */
  onFramesReady?: (frames: { time: number; url: string }[]) => void
}

type Drag = 'start' | 'end' | 'playhead' | null

export default function FilmstripTimeline({
  videoUrl, duration, currentTime, trimStart, trimEnd, minDuration,
  onSeek, onTrimChange, onFramesReady,
}: Props) {
  const [frames, setFrames] = useState<{ time: number; url: string }[]>([])
  const [extracting, setExtracting] = useState(true)
  const [drag, setDrag] = useState<Drag>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  // ── Frame extraction ──────────────────────────────────────────────────────
  // One offscreen video, seeked to each timestamp in turn. Sequential rather
  // than parallel because a single element can only hold one seek at a time.
  useEffect(() => {
    if (!videoUrl || !duration) return
    let cancelled = false
    const video = document.createElement('video')
    video.src = videoUrl
    video.muted = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'

    const canvas = document.createElement('canvas')
    canvas.width = FRAME_W
    canvas.height = FRAME_H
    const ctx = canvas.getContext('2d')

    const seekTo = (t: number) => new Promise<void>(resolve => {
      const done = () => { video.removeEventListener('seeked', done); resolve() }
      video.addEventListener('seeked', done)
      video.currentTime = t
      // A seek that never lands must not hang the strip forever.
      setTimeout(() => { video.removeEventListener('seeked', done); resolve() }, 2000)
    })

    const run = async () => {
      await new Promise<void>(resolve => {
        if (video.readyState >= 1) return resolve()
        video.addEventListener('loadedmetadata', () => resolve(), { once: true })
        setTimeout(resolve, 4000)
      })
      if (cancelled || !ctx) return

      const out: { time: number; url: string }[] = []
      for (let i = 0; i < FRAME_COUNT; i++) {
        if (cancelled) return
        // Sample from the middle of each slice, not the edges — the first and
        // last frames of a clip are often black.
        const t = ((i + 0.5) / FRAME_COUNT) * duration
        await seekTo(t)
        if (cancelled) return
        try {
          ctx.drawImage(video, 0, 0, FRAME_W, FRAME_H)
          out.push({ time: t, url: canvas.toDataURL('image/jpeg', 0.6) })
          // Paint progressively so the strip fills in rather than appearing
          // all at once after several seconds of nothing.
          setFrames(Array.from(out))
        } catch {
          // A frame that will not draw is not worth failing the whole strip for.
        }
      }
      if (!cancelled) {
        setExtracting(false)
        onFramesReady?.(out)
      }
    }
    void run()

    return () => { cancelled = true; video.src = '' }
    // onFramesReady deliberately omitted: a parent that rebuilds the callback
    // each render would otherwise re-extract every frame on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl, duration])

  // ── Pointer handling ──────────────────────────────────────────────────────
  const timeAt = useCallback((clientX: number) => {
    const el = trackRef.current
    if (!el || !duration) return 0
    const r = el.getBoundingClientRect()
    const pct = Math.min(Math.max((clientX - r.left) / r.width, 0), 1)
    return pct * duration
  }, [duration])

  useEffect(() => {
    if (!drag) return
    const move = (e: PointerEvent) => {
      const t = timeAt(e.clientX)
      if (drag === 'start') {
        onTrimChange(Math.min(t, trimEnd - minDuration), trimEnd)
        onSeek(Math.min(t, trimEnd - minDuration))
      } else if (drag === 'end') {
        onTrimChange(trimStart, Math.max(t, trimStart + minDuration))
      } else {
        onSeek(Math.min(Math.max(t, trimStart), trimEnd))
      }
    }
    const up = () => setDrag(null)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [drag, timeAt, onSeek, onTrimChange, trimStart, trimEnd, minDuration])

  const pct = (t: number) => (duration ? (t / duration) * 100 : 0)

  return (
    <div className="select-none">
      <div
        ref={trackRef}
        className="relative h-[68px] rounded-xl overflow-hidden bg-raised border border-edge cursor-pointer"
        onPointerDown={e => { setDrag('playhead'); onSeek(Math.min(Math.max(timeAt(e.clientX), trimStart), trimEnd)) }}
      >
        {/* Frames */}
        <div className="absolute inset-0 flex">
          {frames.map((f, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={f.url}
              alt=""
              draggable={false}
              className="h-full flex-1 object-cover pointer-events-none"
              style={{ minWidth: 0 }}
            />
          ))}
          {frames.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                {extracting ? 'Reading frames' : 'No preview'}
              </span>
            </div>
          )}
        </div>

        {/* Dimmed regions outside the cut */}
        <div className="absolute inset-y-0 left-0 bg-void/72 pointer-events-none" style={{ width: `${pct(trimStart)}%` }} />
        <div className="absolute inset-y-0 right-0 bg-void/72 pointer-events-none" style={{ width: `${100 - pct(trimEnd)}%` }} />

        {/* Kept region outline */}
        <div
          className="absolute inset-y-0 border-y-2 border-amber pointer-events-none"
          style={{ left: `${pct(trimStart)}%`, width: `${pct(trimEnd) - pct(trimStart)}%` }}
        />

        {/* Trim handles */}
        {([['start', trimStart], ['end', trimEnd]] as const).map(([which, t]) => (
          <div
            key={which}
            role="slider"
            tabIndex={0}
            aria-label={which === 'start' ? 'Clip start' : 'Clip end'}
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={Number(t.toFixed(1))}
            onPointerDown={e => { e.stopPropagation(); setDrag(which) }}
            className="absolute inset-y-0 w-4 -ml-2 flex items-center justify-center cursor-ew-resize touch-none group"
            style={{ left: `${pct(t)}%` }}
          >
            <span className="h-full w-1.5 rounded-full bg-amber shadow-[0_0_0_1px_rgba(0,0,0,0.45)] group-hover:w-2 transition-all" />
          </div>
        ))}

        {/* Playhead */}
        <div
          className="absolute inset-y-0 w-px bg-white pointer-events-none shadow-[0_0_6px_rgba(255,255,255,0.7)]"
          style={{ left: `${pct(currentTime)}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[10px] tabular-nums text-ink-faint">
        <span>0:00</span>
        <span className="text-amber-ink">
          clip {(trimEnd - trimStart).toFixed(1)}s
        </span>
        <span>{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>
      </div>
    </div>
  )
}
