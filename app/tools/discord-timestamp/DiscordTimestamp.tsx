'use client'
import { useEffect, useState } from 'react'
import { DISCORD_STYLES, discordTag, previewDiscord, unixFromLocal } from '@/lib/tools/discord-timestamp'
import CopyButton from '../CopyButton'

function pad(n: number) { return String(n).padStart(2, '0') }

/** The next quarter hour, as values for the date and time inputs. */
function nextQuarterHour(): { date: string; time: string } {
  const d = new Date(Date.now() + 15 * 60_000)
  d.setMinutes(Math.floor(d.getMinutes() / 15) * 15, 0, 0)
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` }
}

// Rendered client-only (see DiscordTimestampLoader), so these can read the
// viewer's clock and time zone straight away: the server cannot know either.
export default function DiscordTimestamp() {
  const [start] = useState(nextQuarterHour)
  const [date, setDate] = useState(start.date)
  const [time, setTime] = useState(start.time)
  const [now, setNow] = useState(() => Date.now())
  const [zone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone)

  // Keeps the "in 3 hours" previews current.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const unix = unixFromLocal(date, time)
  const setToNow = () => {
    const d = new Date()
    setDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`)
    setTime(`${pad(d.getHours())}:${pad(d.getMinutes())}`)
    setNow(Date.now())
  }

  const inputCls =
    'min-h-[44px] w-full rounded-xl border border-edge bg-void px-4 text-body text-ink-high transition-colors hover:border-edge-lit focus:border-amber focus:outline-none [color-scheme:dark]'

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      {/* ── When ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-edge bg-panel p-5 sm:p-6">
        <p className="font-mono text-eyebrow uppercase text-ink-muted">When</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <label htmlFor="ts-date" className="text-small text-ink-muted">Date</label>
            <input id="ts-date" type="date" value={date} onChange={e => setDate(e.target.value)} className={`mt-1.5 ${inputCls}`} />
          </div>
          <div>
            <label htmlFor="ts-time" className="text-small text-ink-muted">Time</label>
            <input id="ts-time" type="time" value={time} onChange={e => setTime(e.target.value)} className={`mt-1.5 ${inputCls}`} />
          </div>
        </div>
        <button
          type="button"
          onClick={setToNow}
          className="tap mt-3 min-h-[44px] rounded-xl border border-edge px-4 text-small text-ink-body transition-colors hover:border-edge-lit hover:bg-raised"
        >
          Use right now
        </button>
        <p className="mt-5 text-small text-ink-muted">
          Read as your time zone{zone ? <>: <span className="font-mono text-ink-body">{zone}</span></> : null}.
          Everyone who sees the message gets it in theirs.
        </p>
        {unix !== null && (
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-edge pt-5">
            <span className="text-small text-ink-muted">Unix time</span>
            <code className="font-mono text-mono text-ink-high">{unix}</code>
            <CopyButton text={String(unix)} />
          </div>
        )}
      </div>

      {/* ── Codes ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3" aria-live="polite">
        {unix === null ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-edge p-6 text-center">
            <p className="text-small text-ink-muted">Pick a date and time to get the codes.</p>
          </div>
        ) : (
          <>
            <article className="rounded-2xl border border-amber/40 bg-amber/[0.06] p-5">
              <p className="font-mono text-eyebrow uppercase text-amber">The usual announcement</p>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <code className="break-all font-mono text-mono text-ink-high">
                    {discordTag(unix, 'F')} ({discordTag(unix, 'R')})
                  </code>
                  <p className="mt-2 text-small text-ink-body">
                    {previewDiscord(unix, 'F', now)} ({previewDiscord(unix, 'R', now)})
                  </p>
                </div>
                <CopyButton text={`${discordTag(unix, 'F')} (${discordTag(unix, 'R')})`} className="shrink-0" />
              </div>
            </article>
            {DISCORD_STYLES.map(({ style, label }) => (
              <article key={style} className="rounded-2xl border border-edge bg-panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-eyebrow uppercase text-ink-muted">{label}</p>
                    <code className="mt-2 block break-all font-mono text-mono text-ink-high">{discordTag(unix, style)}</code>
                    <p className="mt-1.5 text-small text-ink-body">{previewDiscord(unix, style, now)}</p>
                  </div>
                  <CopyButton text={discordTag(unix, style)} className="shrink-0" />
                </div>
              </article>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
