'use client'
import { useMemo, useState } from 'react'
import { countAll, textStats } from '@/lib/tools/char-count'
import CopyButton from '../CopyButton'
import ScheduleThis from '../ScheduleThis'

export default function CharacterCounter() {
  const [text, setText] = useState('')
  const rows = useMemo(() => countAll(text), [text])
  const stats = useMemo(() => textStats(text), [text])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-edge bg-panel p-5 sm:p-6">
        <label htmlFor="cc-text" className="block font-mono text-eyebrow uppercase text-ink-muted">Your post</label>
        <textarea
          id="cc-text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write or paste your post. Every platform's count updates as you type."
          className="mt-3 min-h-[280px] w-full resize-y rounded-xl border border-edge bg-void px-4 py-3 text-body text-ink-high placeholder:text-ink-faint transition-colors hover:border-edge-lit focus:border-amber focus:outline-none"
        />
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ['Characters', stats.characters],
            ['No spaces', stats.charactersNoSpaces],
            ['Words', stats.words],
            ['Lines', stats.lines],
            ['Hashtags', stats.hashtags],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-xl border border-edge px-3 py-2">
              <dt className="font-mono text-eyebrow uppercase text-ink-muted">{label}</dt>
              <dd className="mt-1 font-mono text-body text-ink-high">{(value as number).toLocaleString()}</dd>
            </div>
          ))}
        </dl>
        {text && (
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <CopyButton text={text} label="Copy text" />
            <ScheduleThis text={text} tool="character-counter" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2" aria-live="polite">
        <p className="font-mono text-eyebrow uppercase text-ink-muted">Fits on</p>
        {rows.map(r => {
          const pct = Math.min(100, (r.count / r.limit) * 100)
          return (
            <div key={r.id} className="rounded-2xl border border-edge bg-panel px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-small font-medium text-ink-high">
                  {r.label}
                  {!r.inSocialMate && (
                    <span className="ml-2 rounded-md border border-edge px-1.5 py-0.5 font-mono text-eyebrow text-ink-muted">
                      not in SocialMate yet
                    </span>
                  )}
                </p>
                <p className={`shrink-0 font-mono text-small ${r.fits ? 'text-jade' : 'text-alert'}`}>
                  {r.count.toLocaleString()}/{r.limit.toLocaleString()}
                </p>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-raised" aria-hidden="true">
                <div className={`h-full rounded-full ${r.fits ? 'bg-jade' : 'bg-alert'}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-small text-ink-muted">
                {r.fits ? `${r.left.toLocaleString()} left. ` : `${Math.abs(r.left).toLocaleString()} over. `}
                {r.how}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
