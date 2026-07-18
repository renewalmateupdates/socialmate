# DESIGN-NOTES

Working notes for the SocialMate public surface. Tried, cut, and why — so the next
pass doesn't relitigate decisions that were already made on purpose.

---

## The thesis

**A dark, warm instrument. Not a dark, cool brochure.**

Most premium dark SaaS is blue-black with one bright accent: cold, technical,
interchangeable. This goes the other way — a warm near-black base, gold as the
primary voice, and a mono face doing real work throughout. The reference is a
mixing desk: matte housing, warm metal, illuminated state, everything labeled in
mono, nothing decorative.

If a decision doesn't serve "warm instrument," it's the wrong decision.

---

## Color is a language, not a palette

Three colors, each carrying **one fixed meaning on every page, without exception**:

| Token | Means | Appears on |
|---|---|---|
| `amber` `#F0A62E` | queued · scheduled · in-flight · waiting | Primary CTAs, the scheduling story, hero |
| `violet` `#9D6BFF` | AI · SOMA · generation · credits | Anything SOMA touches, AI tools, credit UI |
| `jade` `#4FD787` | published · live · succeeded · included | Confirmation only |

**This restriction is the design.** By the time a reader reaches the price beat,
jade already means *shipped* — taught by the hero loop, reinforced by the platform
list and the free-tier checks, never explained in words. That's design doing work
copy can't.

Rules that must hold:

- Green never appears as decoration.
- Amber never means success.
- Violet never touches a non-AI feature.
- If a section wants color and none of the three fits, **it gets neutral.**

Break it once and this reads as a startup template with a palette applied.

### Measured contrast (not eyeballed)

All against `--color-void #0D0B0A`:

| Pair | Ratio | |
|---|---|---|
| `ink-high` #F7F3EF | **17.79** | AA |
| `ink-body` #D6CFC7 | **12.73** | AA |
| `ink-muted` #9A9089 | **6.29** | AA |
| `amber` on void | **9.54** | AA (safe even at body size) |
| `void` on `amber` (CTA text) | **9.54** | AA |
| `violet` on void | **5.59** | AA |
| `jade` on void | **10.66** | AA |
| `ink-faint` #6B625B | 3.29 | **AA-large only** |

`ink-faint` is decorative only. It must never carry a meaningful label — eyebrows
and anything load-bearing use `ink-muted` or mono.

---

## Type

Self-hosted via `next/font/local`, ~124KB total for three families.

- **Clash Display** — headlines only (variable, 29KB)
- **Switzer** — body (variable, 43KB)
- **JetBrains Mono** — the instrument (latin subset, 22KB × 2 weights)

Mono is not garnish. Timestamps, credit counts, prices, platform labels, the
queue grid, eyebrows. It's what makes the site read as equipment rather than
marketing. Lean on it harder than feels safe.

**Big type gets negative tracking, small type gets positive.** Display at default
tracking is the most common tell of amateur work; the hero carries `-0.035em`.

### Why JetBrains Mono is subset

The full family is 92KB *per weight* because it ships Cyrillic, Greek, and
ligatures we will never render in a timestamp. The latin subset is 22KB. Four
times smaller for a face used only on labels and numerals.

---

## Things that were cut, and why

### The ambient aurora
Four drifting `blur(80px)` blobs behind the whole site, plus three radial glows
behind the hero headline. **Removed entirely.**

This was the single loudest "AI-generated premium dark SaaS" tell on the page —
"a gradient blob behind the hero headline" is a disqualifying pattern. It was also
four large-area blur compositing passes on first paint.

Glow survives in exactly **one** place: a soft violet bloom behind the SOMA panel,
because that's atmosphere with a reason. Never behind a headline.

We knowingly traded immediate flashiness for restraint. In a naive side-by-side
the old version looks busier. That's the point: restraint reads as more expensive
to someone already paying $99/month.

### Blue as a fourth color
Blue appeared in the hero glow, "coming soon" badges, the Clips card, the
link-in-bio badge, and the white-label stat. The system is three colors. Every
blue is now amber, violet, jade, or neutral.

### Purple on Clips / streamers
Purple means AI. Clips is not AI. That section is neutral now.

### The global card hover lift
`.lm-card:hover { transform: translateY(-4px) }` applied to every card including
non-clickable ones. A card that isn't clickable doesn't move. Replaced by `.tap`,
which is opt-in and only correct when the whole card is genuinely a link.

### Reveal on eight sections
Scroll-fade on nearly every section. If everything animates, the animation means
nothing. Now used on **two** elements on the landing page.

### Emoji platform icons
Real SVG marks already existed in `PlatformIcon`; emoji were the fallback. Emoji
were the thing that made the page read "vibe-coded."

**Platform marks render in `mono` (currentColor), not brand colors.** Logos are
data; color on this page is reserved for state. Seven full-color brand marks in a
row would fight the three-voice system for no benefit.

### The fabricated `aggregateRating`
`ratingValue: '4.8', ratingCount: '30'` sat in the JSON-LD. There is no review
system, so the number was invented. Removed — it's both a "zero fake proof"
violation and a Google structured-data policy risk. It goes back when there are
real reviews to count.

`UserStatsCounter` stayed: it pulls real numbers from `/api/stats/public` and
renders **nothing** at zero rather than inventing social proof.

### Ad-hoc spacing
`py-16 / py-20 / pt-24` mixed with `bg-white/[0.02]`, `bg-black/30`, `bg-black/40`
and a purple gradient. Now one `--spacing-section` token
(`clamp(96px, 12vw, 160px)`) and three surfaces. Cramped is the fastest way to
look cheap.

---

## The hero set piece

One 14s loop, one master clock. All timing lives in `globals.css`; `HeroLoop.tsx`
is structure and copy only.

| Beat | | Color |
|---|---|---|
| 1 | 0.0–2.6s cursor types into SOMA, irregular cadence | neutral |
| 2 | 2.6–4.2s SOMA ignites — a level meter | violet |
| 3 | 4.2–6.3s three drafts materialize, staggered | neutral |
| 4 | 6.3–8.4s slots light, mono timestamps | amber |
| 5 | 8.4–10.2s **one slot pulses amber → jade. Published.** | jade |
| 6 | 10.2–11.5s credits tick 500 → 492 | violet |
| 7 | 11.5–14.0s hold, then clear | — |

**Beat 5 is the emotional beat of the entire page.** Everything before it is
setup. It gets one restrained pulse and total silence around it.

### Why CSS keyframes and not Framer Motion

The brief allowed "a single timeline driver or Framer variants." This loop is
deterministic and non-interactive, so a JS animation library would add ~50KB gzip
to the landing bundle to do what the compositor already does for free, against a
hard Lighthouse 95+ requirement. Every element shares
`animation-duration: var(--hero-dur)` and `infinite`, so they cannot drift apart
no matter how long the tab is open. Framer earns its weight on interactive UI,
not on a loop.

The only JS is `LoopFrame.tsx`: ~15 lines of IntersectionObserver that pause the
loop off-screen.

### Decisions inside the loop

- **A spinner is a surrender.** Beat 2 is a level meter reading a signal, which is
  instrument language and fits the mixing-desk thesis.
- **Typing uses `width` in `ch`, not `clip-path`.** Clip-path stranded the caret at
  the end of the line; a width reveal puts the caret at the reveal edge for free
  (it's a `border-right` on the same element). The text is monospace so `ch` is
  exact, and it's 14 discrete jumps, not a continuous width animation.
  `.hero-type` also sets `letter-spacing: 0` — the mono scale's 0.02em tracking
  accumulated to more than a full character over 37 chars and clipped the last
  letter off.
- **Keyframes advance a word at a time with uneven gaps.** An evenly-timed cursor
  is the tell that it's a CSS demo.
- **Draft slots are permanent; only their contents animate.** Fading cards to
  `opacity: 0` left a six-second hole in the middle of the panel. They now settle
  to a dim resting state (0.22) — and "spent drafts sitting under the queue they
  became" is the truer story anyway.
- **Stagger via `animation-delay` is safe here.** Same duration + same iteration
  count makes it a permanent phase offset, not a race. Every staggered element is
  hidden at 0% and 100%, so the offset is invisible at the loop seam.
- **60ms stagger.** 200ms reads as slow and cheap; 0 is a wall.

### Reduced motion

Not "animation off" — animation becomes instant. The loop resolves to its finished
composition: prompt written, queue populated, one post live, credits spent. Draft
slots render at their resting opacity rather than hidden, because three empty
boxes read as unfinished and this is the *entire* design for those users.

---

## The asset factory

`scripts/record-hero.mjs` is why the hero is code and not a screen recording. Ship
a feature, re-run it, get new clips. No OBS, no editing, forever.

It **seeks** the Web Animations API to an exact time and screenshots, rather than
capturing live video. The loop runs on one CSS clock, so seeking gives frame-exact
output where the last frame meets the first perfectly. A live recording of the
same animation would jitter and the seam would show.

Two traps worth remembering:

1. **Never pass `animations: 'disabled'` to `page.screenshot()` here.** It resets
   every animation to its initial state and silently discards the seek, which
   renders each beat's start and end tags on top of each other.
2. The floating app widgets are removed before capture (`#app-widgets`), along
   with the Next dev indicator. A Product Hunt clip should not ship with a cookie
   banner across the bottom.

Output: `public/demo/hero.mp4` (~0.15MB) and `public/demo/hero.gif` (~0.34MB,
budget is 5MB). GIF runs at half the frame rate and 720px wide — nobody can tell
in a Discord embed and it saves megabytes.

Named `.mjs` rather than `.ts` so it runs on bare `node` with no ts-node/tsx step.

---

## Implementation traps

### Tailwind v4 tree-shakes custom `--font-*` theme keys
`@theme` generates the `.font-display` / `.font-body` utilities but drops the
variables they point at (only `--font-mono` survived, because it overrides a
built-in key). Both declarations are required: `@theme` drives utility generation,
and a second declaration gives them a value.

### Those font variables must live on `body`, not `:root`
`next/font/local` emits `--font-clash` etc onto the `<body>` className, so a
`:root` definition resolves them as unset and falls back to system-ui.

They can't move to `<html>` either — the anti-flash theme script mutates that
element before hydration, so adding a React-rendered className there causes a
hydration mismatch. `<html>` carries `suppressHydrationWarning` for that script,
which is correct rather than a papering-over: server and client are *supposed* to
differ on that one element.

### Token names are deliberately not `--surface` / `--border` / `--text-muted`
Those already exist further down `globals.css` driving the app interior's 29
sidebar themes. Redefining them would break the dashboard. Hence `--color-void`,
`--color-edge`, `--color-ink-muted`.

---

## Chanel's rule

Looked at the finished hero and removed one thing: the sub-headline used to name
all seven platforms ("One compose box for Bluesky, Discord, Telegram, Mastodon, X,
TikTok and LinkedIn…") while the mono platform row directly beneath it lists those
same seven marks. Same information, twice, two rows apart.

The prose was the accessory — a list is better at *which*, so the sentence now
does the job the list can't: what the thing is for.

---

## Still open

- Pricing, features, about, and the auth screens are **not yet** on this system.
  They still use the old palette and Inter-era type scale. Auth matters most: the
  drop from a composed landing page into a bootstrap form is where trust dies.
- The `/vs/*` pages (~76) and `/for/*` pages are untouched.
- Lighthouse has not been run against a production build yet.
