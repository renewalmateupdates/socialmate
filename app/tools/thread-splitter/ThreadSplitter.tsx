'use client'
import { useMemo, useState } from 'react'
import { splitThread, measure, THREAD_PLATFORMS, type Numbering, type ThreadPlatform } from '@/lib/tools/thread-splitter'
import CopyButton from '../CopyButton'

const NUMBERING: { value: Numbering; label: string }[] = [
  { value: 'suffix', label: '1/5 at the end' },
  { value: 'prefix', label: '1/5 at the start' },
  { value: 'none',   label: 'No numbers' },
]

const SAMPLE = `Most people quit posting because it takes too long, not because they run out of ideas.

Here is what changed it for me. I write once a week, in one sitting, about whatever I learned. Then I split it into a thread and schedule the parts.

The thread does better than the long post ever did. People read the first line, and if it is good, they keep going. Every part is a fresh chance to stop someone scrolling.

Try it with something you already wrote. Paste it here and see how it breaks.`

export default function ThreadSplitter() {
  const [text, setText] = useState('')
  const [platform, setPlatform] = useState<ThreadPlatform>('x')
  const [numbering, setNumbering] = useState<Numbering>('suffix')

  const parts = useMemo(() => splitThread(text, platform, numbering), [text, platform, numbering])
  const limit = THREAD_PLATFORMS[platform].limit
  const total = useMemo(() => measure(text.trim(), platform), [text, platform])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ── Input ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-edge bg-panel p-5 sm:p-6">
        <fieldset>
          <legend className="font-mono text-eyebrow uppercase text-ink-muted">Platform</legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(Object.keys(THREAD_PLATFORMS) as ThreadPlatform[]).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                aria-pressed={platform === p}
                className={`tap min-h-[44px] rounded-xl border px-3 text-small transition-colors ${
                  platform === p
                    ? 'border-amber/60 bg-amber/10 text-ink-high'
                    : 'border-edge text-ink-muted hover:border-edge-lit hover:text-ink-high'
                }`}
              >
                {THREAD_PLATFORMS[p].label}
                <span className="ml-1.5 font-mono text-eyebrow text-ink-muted">{THREAD_PLATFORMS[p].limit}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-small text-ink-muted">{THREAD_PLATFORMS[platform].how}</p>
        </fieldset>

        <label htmlFor="thread-text" className="mt-6 block font-mono text-eyebrow uppercase text-ink-muted">Your text</label>
        <textarea
          id="thread-text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste a long post, a blog paragraph, or notes. Blank lines start a new paragraph."
          className="mt-3 min-h-[260px] w-full resize-y rounded-xl border border-edge bg-void px-4 py-3 text-body text-ink-high placeholder:text-ink-faint transition-colors hover:border-edge-lit focus:border-amber focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-mono text-ink-muted">
            {total.toLocaleString()} counted · {parts.length} {parts.length === 1 ? 'post' : 'posts'}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {!text && (
              <button
                type="button"
                onClick={() => setText(SAMPLE)}
                className="tap min-h-[44px] rounded-xl px-3 text-small text-ink-muted transition-colors hover:text-ink-high"
              >
                Try an example
              </button>
            )}
            <label className="sr-only" htmlFor="thread-numbering">Numbering</label>
            <select
              id="thread-numbering"
              value={numbering}
              onChange={e => setNumbering(e.target.value as Numbering)}
              className="min-h-[44px] rounded-xl border border-edge bg-void px-3 text-small text-ink-body focus:border-amber focus:outline-none"
            >
              {NUMBERING.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Output ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3" aria-live="polite">
        {parts.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-edge p-6 text-center">
            <p className="text-small text-ink-muted">Your thread shows up here, one post per card, ready to copy.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-eyebrow uppercase text-ink-muted">
                {parts.length} {parts.length === 1 ? 'post' : 'posts'} for {THREAD_PLATFORMS[platform].label}
              </p>
              {parts.length > 1 && <CopyButton text={parts.map(p => p.text).join('\n\n')} label="Copy all" />}
            </div>
            {parts.map((part, i) => (
              <article key={i} className="rounded-2xl border border-edge bg-panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="whitespace-pre-wrap break-words text-body text-ink-high">{part.text}</p>
                  <CopyButton text={part.text} className="shrink-0" />
                </div>
                <p className={`mt-3 font-mono text-eyebrow ${part.length <= limit ? 'text-jade' : 'text-alert'}`}>
                  {part.length}/{limit}
                </p>
              </article>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
