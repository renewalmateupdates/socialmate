'use client'

import { useRef, useState } from 'react'

/* ══════════════════════════════════════════════════════════════════════════════
   THE DEMO, WITH CHAPTERS
   ──────────────────────────────────────────────────────────────────────────────
   A four-minute walkthrough built from real screens of the live app. Joshua's
   brief (Nov 13 answers): a premium demo with clickable chapters, no founder
   face on the homepage.

   It costs nothing until someone asks for it. preload="none" means the browser
   fetches no video bytes on page load, and the poster is a lazy <img>, so a
   visitor who never presses play pays for neither. Self-hosted rather than a
   YouTube embed: no third-party scripts or cookies on the homepage, and the
   chapter buttons can seek the player directly.

   Chapter times come from the render's timeline (Videos/SocialMate demo,
   render_demo.py). Re-render the video and these must be re-read from its
   chapters.txt, or the buttons land a few seconds off.
   ══════════════════════════════════════════════════════════════════════════════ */

export type DemoChapter = { start: number; label: string }

function stamp(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

export default function DemoVideo({
  src,
  poster,
  chapters,
  playLabel,
  chaptersLabel,
}: {
  src: string
  poster: string
  chapters: DemoChapter[]
  playLabel: string
  chaptersLabel: string
}) {
  const video = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(-1)

  function playFrom(start: number) {
    const v = video.current
    if (!v) return
    setStarted(true)
    const go = () => {
      v.currentTime = start
      // play() rejects if the browser blocks it; the native controls are
      // showing by then, so the visitor can press play themselves.
      v.play().catch(() => {})
    }
    // With preload="none" nothing is known about the file yet, and a seek before
    // the metadata arrives is dropped by some browsers. Load first, then seek.
    if (v.readyState >= 1) go()
    else {
      v.addEventListener('loadedmetadata', go, { once: true })
      v.load()
    }
  }

  function onTime() {
    const v = video.current
    if (!v) return
    let i = -1
    for (let k = 0; k < chapters.length; k++) if (v.currentTime >= chapters[k].start) i = k
    if (i !== current) setCurrent(i)
  }

  return (
    // items-start: the chapter list is taller than the player on wide screens,
    // and a stretched grid row would grow the player's box past the video.
    <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-10">
      <div className="relative min-w-0 overflow-hidden rounded-2xl border border-edge bg-panel shadow-2xl shadow-black/40">
        <div className="relative aspect-video w-full">
          <video
            ref={video}
            className="absolute inset-0 h-full w-full bg-void"
            src={src}
            preload="none"
            playsInline
            controls={started}
            onPlay={() => setStarted(true)}
            onTimeUpdate={onTime}
          />
          {!started && (
            <button
              type="button"
              onClick={() => playFrom(0)}
              aria-label={playLabel}
              className="group absolute inset-0 block w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- a static poster below the fold; next/image adds nothing but a client bundle here */}
              <img
                src={poster}
                alt=""
                width={1280}
                height={720}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute inset-0 bg-void/30 transition-colors group-hover:bg-void/10" aria-hidden="true" />
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber shadow-2xl shadow-black/50 transition-transform group-hover:scale-105 group-focus-visible:scale-105"
              >
                <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 fill-void"><path d="M8 5.5v13l11-6.5z" /></svg>
              </span>
            </button>
          )}
        </div>
      </div>

      <nav aria-label={chaptersLabel} className="min-w-0">
        <p className="font-mono text-eyebrow uppercase text-ink-muted">{chaptersLabel}</p>
        <ol className="mt-4 grid gap-px sm:grid-cols-2 lg:grid-cols-1">
          {chapters.map((c, i) => {
            const on = i === current
            return (
              <li key={c.start}>
                <button
                  type="button"
                  onClick={() => playFrom(c.start)}
                  aria-current={on ? 'step' : undefined}
                  className={`flex min-h-11 w-full items-baseline gap-3 border-b border-edge py-2.5 text-left transition-colors hover:text-ink-high ${on ? 'text-ink-high' : 'text-ink-body'}`}
                >
                  {/* amber = in flight. The chapter that is playing is the only
                      thing on this list that is happening right now. */}
                  <span className={`w-10 shrink-0 font-mono text-eyebrow tabular-nums ${on ? 'text-amber' : 'text-ink-muted'}`}>
                    {stamp(c.start)}
                  </span>
                  <span className="text-small leading-snug">{c.label}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
