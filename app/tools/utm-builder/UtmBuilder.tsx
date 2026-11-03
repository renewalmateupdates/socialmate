'use client'
import { useMemo, useState } from 'react'
import { buildUtmUrl, linksPerPlatform, PLATFORM_SOURCES } from '@/lib/tools/utm'
import CopyButton from '../CopyButton'
import ScheduleThis from '../ScheduleThis'

const input = 'mt-2 min-h-[44px] w-full rounded-xl border border-edge bg-void px-4 text-body text-ink-high placeholder:text-ink-faint transition-colors hover:border-edge-lit focus:border-amber focus:outline-none'
const label = 'block font-mono text-eyebrow uppercase text-ink-muted'

export default function UtmBuilder() {
  const [url, setUrl] = useState('')
  const [source, setSource] = useState('')
  const [medium, setMedium] = useState('social')
  const [campaign, setCampaign] = useState('')
  const [term, setTerm] = useState('')
  const [content, setContent] = useState('')
  const [lowercase, setLowercase] = useState(true)
  const [perPlatform, setPerPlatform] = useState(false)
  const [platforms, setPlatforms] = useState<string[]>(['bluesky', 'linkedin', 'x'])

  const single = useMemo(
    () => buildUtmUrl({ url, source, medium, campaign, term, content }, lowercase),
    [url, source, medium, campaign, term, content, lowercase],
  )
  const many = useMemo(
    () => linksPerPlatform({ url, medium, campaign, term, content }, platforms, lowercase),
    [url, medium, campaign, term, content, platforms, lowercase],
  )
  const toggle = (id: string) => setPlatforms(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]))
  const manyOk = many.filter(m => m.result.url)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-edge bg-panel p-5 sm:p-6">
        <label htmlFor="utm-url" className={label}>Page to link to</label>
        <input id="utm-url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/shop" className={input} inputMode="url" />

        <div className="mt-5 flex flex-wrap gap-2" role="radiogroup" aria-label="Mode">
          {[
            [false, 'One link'],
            [true, 'One link per platform'],
          ].map(([value, text]) => (
            <button
              key={String(value)}
              type="button"
              role="radio"
              aria-checked={perPlatform === value}
              onClick={() => setPerPlatform(value as boolean)}
              className={`tap min-h-[44px] rounded-xl border px-3 text-small transition-colors ${
                perPlatform === value ? 'border-amber/60 bg-amber/10 text-ink-high' : 'border-edge text-ink-muted hover:border-edge-lit hover:text-ink-high'
              }`}
            >
              {text as string}
            </button>
          ))}
        </div>

        {perPlatform ? (
          <fieldset className="mt-5">
            <legend className={label}>Platforms (each becomes the source)</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {PLATFORM_SOURCES.map(p => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={platforms.includes(p.id)}
                  onClick={() => toggle(p.id)}
                  className={`tap min-h-[44px] rounded-xl border px-3 text-small transition-colors ${
                    platforms.includes(p.id) ? 'border-amber/60 bg-amber/10 text-ink-high' : 'border-edge text-ink-muted hover:border-edge-lit hover:text-ink-high'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </fieldset>
        ) : (
          <div className="mt-5">
            <label htmlFor="utm-source" className={label}>Source (where the link is posted)</label>
            <input id="utm-source" value={source} onChange={e => setSource(e.target.value)} placeholder="bluesky, newsletter, linkedin" className={input} list="utm-sources" />
            <datalist id="utm-sources">
              {PLATFORM_SOURCES.map(p => <option key={p.id} value={p.source} />)}
              <option value="newsletter" />
            </datalist>
          </div>
        )}

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="utm-medium" className={label}>Medium</label>
            <input id="utm-medium" value={medium} onChange={e => setMedium(e.target.value)} placeholder="social" className={input} list="utm-mediums" />
            <datalist id="utm-mediums">
              <option value="social" /><option value="email" /><option value="paid-social" /><option value="referral" />
            </datalist>
          </div>
          <div>
            <label htmlFor="utm-campaign" className={label}>Campaign</label>
            <input id="utm-campaign" value={campaign} onChange={e => setCampaign(e.target.value)} placeholder="spring-sale" className={input} />
          </div>
          <div>
            <label htmlFor="utm-content" className={label}>Content (optional)</label>
            <input id="utm-content" value={content} onChange={e => setContent(e.target.value)} placeholder="video-post" className={input} />
          </div>
          <div>
            <label htmlFor="utm-term" className={label}>Term (optional)</label>
            <input id="utm-term" value={term} onChange={e => setTerm(e.target.value)} placeholder="keyword" className={input} />
          </div>
        </div>

        <label className="mt-5 flex min-h-[44px] cursor-pointer items-center gap-3 text-small text-ink-body">
          <input type="checkbox" checked={lowercase} onChange={e => setLowercase(e.target.checked)} className="h-4 w-4 accent-[var(--color-amber)]" />
          Make everything lowercase (recommended)
        </label>
      </div>

      <div className="flex flex-col gap-3" aria-live="polite">
        <p className="font-mono text-eyebrow uppercase text-ink-muted">Your link{perPlatform ? 's' : ''}</p>
        {perPlatform ? (
          !url.trim() || many.length === 0 || manyOk.length === 0 ? (
            <Empty text={many[0]?.result.error ?? (platforms.length ? 'Paste the page you want to link to.' : 'Pick at least one platform.')} />
          ) : (
            <>
              {manyOk.length > 1 && (
                <div className="flex justify-end">
                  <CopyButton text={manyOk.map(m => `${m.label}: ${m.result.url}`).join('\n')} label="Copy all" />
                </div>
              )}
              {manyOk.map(m => (
                <article key={m.id} className="rounded-2xl border border-edge bg-panel p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-small font-medium text-ink-high">{m.label}</p>
                      <p className="mt-1 break-all font-mono text-small text-ink-body">{m.result.url}</p>
                    </div>
                    <CopyButton text={m.result.url ?? ''} className="shrink-0" />
                  </div>
                </article>
              ))}
              <Warnings items={manyOk[0].result.warnings} />
            </>
          )
        ) : single.url ? (
          <>
            <article className="rounded-2xl border border-edge bg-panel p-4">
              <p className="break-all font-mono text-small text-ink-high">{single.url}</p>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <CopyButton text={single.url} label="Copy link" />
                <ScheduleThis text={single.url} tool="utm-builder" label="Post this link" />
              </div>
            </article>
            <Warnings items={single.warnings} />
          </>
        ) : (
          <Empty text={url.trim() ? (single.error ?? '') : 'Your tagged link shows up here, ready to copy.'} />
        )}
      </div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-edge p-6 text-center">
      <p className="text-small text-ink-muted">{text}</p>
    </div>
  )
}

function Warnings({ items }: { items: string[] }) {
  if (!items.length) return null
  return (
    <ul className="space-y-1">
      {items.map(w => <li key={w} className="text-small text-ink-muted">{w}</li>)}
    </ul>
  )
}
