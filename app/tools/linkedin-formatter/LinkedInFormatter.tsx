'use client'
import { useRef, useState } from 'react'
import { Bold, Italic, List, ListOrdered, ArrowRight, CheckSquare, Eraser } from 'lucide-react'
import {
  styleText, plainText, toList, linkedinLength, seeMoreCut, LINKEDIN_POST_LIMIT,
  type TextStyle, type ListKind,
} from '@/lib/tools/linkedin-format'
import CopyButton from '../CopyButton'
import ScheduleThis from '../ScheduleThis'

const SAMPLE = `I almost didn't post this.

Three things I learned shipping a product with no team:
Ship the smallest version that helps one person.
Talk to users before you build the next thing.
Write down what broke, so you only break it once.

Which one would you add to?`

type Edit = (selected: string) => string

const STYLE_BUTTONS: { style: TextStyle; label: string; icon: typeof Bold; className?: string }[] = [
  { style: 'bold', label: 'Bold', icon: Bold },
  { style: 'italic', label: 'Italic', icon: Italic },
  { style: 'boldItalic', label: 'Bold italic', icon: Italic, className: 'stroke-[3]' },
]

const LIST_BUTTONS: { kind: ListKind; label: string; icon: typeof List }[] = [
  { kind: 'dot', label: 'Bullets', icon: List },
  { kind: 'number', label: 'Numbers', icon: ListOrdered },
  { kind: 'arrow', label: 'Arrows', icon: ArrowRight },
  { kind: 'check', label: 'Checks', icon: CheckSquare },
]

export default function LinkedInFormatter() {
  const [text, setText] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [hint, setHint] = useState('')
  const area = useRef<HTMLTextAreaElement>(null)

  /**
   * Applies an edit to the selection, or to whole lines for lists. With
   * nothing selected, a style asks for a selection (styling a whole post is
   * almost never what people want) and a list applies to every line.
   */
  const apply = (edit: Edit, wholeLines: boolean) => {
    const el = area.current
    if (!el) return
    let start = el.selectionStart
    let end = el.selectionEnd
    if (start === end) {
      if (!wholeLines) {
        setHint('Select the words you want to change first.')
        el.focus()
        return
      }
      start = 0
      end = text.length
    }
    if (wholeLines) {
      start = text.lastIndexOf('\n', start - 1) + 1
      const next = text.indexOf('\n', end)
      end = next === -1 ? text.length : next
    }
    const replaced = edit(text.slice(start, end))
    const next = text.slice(0, start) + replaced + text.slice(end)
    setText(next)
    setHint('')
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start, start + replaced.length)
    })
  }

  const length = linkedinLength(text)
  const over = length > LINKEDIN_POST_LIMIT
  const cut = seeMoreCut(text)
  const folded = !expanded && cut < text.trimEnd().length

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ── Editor ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-edge bg-panel p-5 sm:p-6">
        <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Formatting">
          {STYLE_BUTTONS.map(({ style, label, icon: Icon, className }) => (
            <button
              key={style}
              type="button"
              onClick={() => apply((s) => styleText(s, style), false)}
              className="tap inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-edge px-3 text-small text-ink-body transition-colors hover:border-edge-lit hover:bg-raised"
            >
              <Icon className={`h-4 w-4 ${className ?? ''}`} strokeWidth={style === 'bold' ? 2.75 : 2} aria-hidden="true" />
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => apply(plainText, false)}
            className="tap inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-edge px-3 text-small text-ink-body transition-colors hover:border-edge-lit hover:bg-raised"
          >
            <Eraser className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Plain
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2" role="toolbar" aria-label="Lists">
          {LIST_BUTTONS.map(({ kind, label, icon: Icon }) => (
            <button
              key={kind}
              type="button"
              onClick={() => apply((s) => toList(s, kind), true)}
              className="tap inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-edge px-3 text-small text-ink-body transition-colors hover:border-edge-lit hover:bg-raised"
            >
              <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 min-h-[20px] text-small text-ink-muted" aria-live="polite">
          {hint || 'Select words, then pick a style. Lists apply to the selected lines, or to every line.'}
        </p>

        <label htmlFor="li-text" className="mt-4 block font-mono text-eyebrow uppercase text-ink-muted">Your post</label>
        <textarea
          id="li-text"
          ref={area}
          value={text}
          onChange={(e) => { setText(e.target.value); setHint('') }}
          placeholder="Write or paste your LinkedIn post."
          className="mt-3 min-h-[280px] w-full resize-y rounded-xl border border-edge bg-void px-4 py-3 text-body text-ink-high placeholder:text-ink-faint transition-colors hover:border-edge-lit focus:border-amber focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className={`font-mono text-mono ${over ? 'text-alert' : 'text-ink-muted'}`}>
            {length.toLocaleString()}/{LINKEDIN_POST_LIMIT.toLocaleString()}
            {over && ' · too long for LinkedIn'}
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
            {text && <CopyButton text={text} label="Copy post" />}
            {text && <ScheduleThis text={text} tool="linkedin-formatter" />}
          </div>
        </div>
      </div>

      {/* ── Preview ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-eyebrow uppercase text-ink-muted">Preview</p>
        {text.trim() ? (
          <article className="rounded-2xl border border-edge bg-panel p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-raised" aria-hidden="true" />
              <div>
                <p className="text-small font-medium text-ink-high">You</p>
                <p className="text-eyebrow text-ink-muted">Now</p>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap break-words text-body text-ink-high">
              {folded ? text.slice(0, cut).trimEnd() : text}
              {folded && (
                <>
                  {'… '}
                  <button type="button" onClick={() => setExpanded(true)} className="text-ink-muted hover:text-ink-high hover:underline">
                    see more
                  </button>
                </>
              )}
            </p>
            {expanded && cut < text.trimEnd().length && (
              <button type="button" onClick={() => setExpanded(false)} className="tap mt-3 min-h-[44px] text-small text-ink-muted hover:text-ink-high">
                Show the fold again
              </button>
            )}
          </article>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-edge p-6 text-center">
            <p className="text-small text-ink-muted">Your post shows up here, cut where LinkedIn adds “see more”.</p>
          </div>
        )}
        <p className="text-small text-ink-muted">
          The fold is approximate: LinkedIn shows about the first two or three lines on a computer, and a little less
          on a phone. Make the opening lines earn the click.
        </p>
      </div>
    </div>
  )
}
