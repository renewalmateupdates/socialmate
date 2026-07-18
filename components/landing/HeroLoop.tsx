import LoopFrame from './LoopFrame'

/* ══════════════════════════════════════════════════════════════════════════════
   THE HERO SET PIECE
   ──────────────────────────────────────────────────────────────────────────────
   The product running, before signup. Code-drawn DOM — no screenshots, no video
   files, no image bytes. That is also why it doubles as an asset factory:
   scripts/record-hero.ts loads this in isolation and exports hero.mp4 / hero.gif,
   so shipping a feature and re-running the script produces new marketing clips.

   All timing lives in globals.css on a single 14s clock. This file is structure
   and copy only — if you need to retime a beat, do it there.

   The demo posts below are real copy. If they were "Check out our product!" the
   whole illusion would collapse, so they are written the way the product's actual
   users write.
   ══════════════════════════════════════════════════════════════════════════════ */

const METER_BARS = [0.35, 0.8, 0.5, 1, 0.65, 0.9, 0.45]

const DRAFTS = [
  { platform: 'BLUESKY',  text: 'Six tabs open just to post once. That was the whole problem.' },
  { platform: 'X',        text: 'Launch week. Everything we shipped, in one thread ↓' },
  { platform: 'LINKEDIN', text: 'Built this between shifts. It is live now.' },
]

export default function HeroLoop() {
  return (
    <LoopFrame>
      <div className="relative">
        {/* The one place a glow is allowed: ambient light behind the panel that
            earns it. Never behind a headline. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-8 -z-10"
          style={{ background: 'radial-gradient(closest-side, var(--glow-violet), transparent 72%)' }}
        />

        <div
          className="overflow-hidden rounded-2xl border border-edge bg-panel shadow-2xl shadow-black/40"
          role="img"
          aria-label="SocialMate composing three posts with SOMA, scheduling them to a queue, and publishing one to Bluesky."
        >
          {/* The panel is a single image with a text alternative on the wrapper,
              so everything inside it is presentational. Marking the subtree
              aria-hidden is the correct semantics — and it's also what stops
              axe flagging the deliberately dimmed draft cards, which are
              decoration, not content anyone needs read to them. */}
          <div aria-hidden="true">
          {/* ── Chrome ──────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 border-b border-edge bg-void/50 px-4 py-3">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-edge-lit" />
              <span className="h-2 w-2 rounded-full bg-edge-lit" />
              <span className="h-2 w-2 rounded-full bg-edge-lit" />
            </span>
            <span className="font-mono text-eyebrow text-ink-faint">socialmate.studio/soma</span>
          </div>

          {/* ── Beats 1–3: prompt, generation, drafts ───────────────────── */}
          <div className="border-b border-edge px-5 py-5">
            <p className="font-mono text-eyebrow uppercase text-violet">SOMA</p>

            {/* The typed line is a fixed 37ch of nowrap mono, so this box has to
                be allowed to shrink and clip below that. Otherwise it dictates
                the whole panel's minimum width and blows out narrow screens. */}
            <div className="mt-3 min-w-0 overflow-hidden rounded-xl border border-edge bg-void px-4 py-3">
              <span className="hero-anim hero-type font-mono text-mono text-ink-body">
                launch week thread, 3 posts, my voice
              </span>
            </div>

            {/* Beat 2. A level meter reading a signal — instrument language.
                A spinner would have been a surrender. */}
            <div className="mt-4 flex h-4 items-end gap-1" aria-hidden="true">
              {METER_BARS.map((h, i) => (
                <span
                  key={i}
                  className="hero-anim hero-meter w-1 rounded-full bg-violet"
                  style={{ height: `${h * 100}%` }}
                />
              ))}
              <span className="hero-anim hero-gen-label ml-2 self-center font-mono text-eyebrow uppercase text-violet">
                generating
              </span>
            </div>

            {/* Beat 3. The slots are permanent and only their contents
                materialize — an empty tray that is visibly a tray reads as
                instrument, where an unexplained gap for the first four seconds
                just reads as broken.
                Third slot is desktop-only: mobile gets reduced choreography,
                not a shrunken desktop. */}
            <p className="mt-5 font-mono text-eyebrow uppercase text-ink-muted">Drafts</p>
            <div className="hero-drafts mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DRAFTS.map((d, i) => (
                <div
                  key={d.platform}
                  className={[
                    'min-h-20 rounded-lg border border-edge bg-void/40 p-3',
                    i === 2 ? 'hidden sm:block' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <div className="hero-anim hero-card">
                    <p className="font-mono text-eyebrow uppercase text-ink-faint">{d.platform}</p>
                    <p className="mt-2 text-small leading-snug text-ink-muted line-clamp-3">{d.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Beats 4–5: the queue, then the one that goes live ───────── */}
          <div className="px-5 py-5">
            <p className="font-mono text-eyebrow uppercase text-ink-muted">Queue</p>

            <div className="mt-3 space-y-2">
              {/* Beat 5 lives on the first slot — the soonest one publishing
                  first is the only version that is actually true. */}
              <div className="hero-anim hero-publish flex items-center gap-3 rounded-lg border px-3 py-2.5">
                <span className="font-mono text-mono text-ink-high">09:15</span>
                <span className="flex-1 truncate text-small text-ink-muted">Bluesky</span>
                <span className="relative inline-flex w-24 justify-end">
                  <span className="hero-anim hero-queued-tag absolute right-0 font-mono text-eyebrow uppercase text-amber">
                    Queued
                  </span>
                  <span className="hero-anim hero-published-tag absolute right-0 font-mono text-eyebrow uppercase text-jade">
                    Published
                  </span>
                </span>
              </div>

              {[
                { time: '14:00', platform: 'X' },
                { time: '18:30', platform: 'LinkedIn' },
              ].map(slot => (
                <div
                  key={slot.time}
                  className="hero-anim hero-slot flex items-center gap-3 rounded-lg border px-3 py-2.5"
                >
                  <span className="font-mono text-mono text-ink-high">{slot.time}</span>
                  <span className="flex-1 truncate text-small text-ink-muted">{slot.platform}</span>
                  <span className="hero-anim hero-slot-label inline-flex w-24 justify-end font-mono text-eyebrow uppercase text-amber">
                    Queued
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Beat 6: credits ────────────────────────────────────────── */}
          <div className="flex items-center justify-between border-t border-edge px-5 py-3">
            <span className="font-mono text-eyebrow uppercase text-ink-muted">Credits</span>
            <span className="relative inline-flex w-16 justify-end">
              <span className="hero-anim hero-credit-before absolute right-0 font-mono text-mono text-ink-muted">500</span>
              <span className="hero-anim hero-credit-after absolute right-0 font-mono text-mono text-violet">492</span>
            </span>
          </div>
          </div>
        </div>
      </div>
    </LoopFrame>
  )
}
