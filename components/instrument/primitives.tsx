import Link from 'next/link'
import type { ReactNode } from 'react'

/* ══════════════════════════════════════════════════════════════════════════════
   INSTRUMENT PRIMITIVES
   ──────────────────────────────────────────────────────────────────────────────
   Every public-surface component composes from these. The point is that no page
   file ever writes an arbitrary value: spacing comes from py-section, type comes
   from the scale, color comes from the three voices plus the neutral ramp.

   If you find yourself reaching for px-[37px] or text-[#f59e0b], the token is
   missing — add it to @theme in globals.css rather than working around it.
   ══════════════════════════════════════════════════════════════════════════════ */

const WIDTHS = {
  narrow: 'max-w-3xl',
  default: 'max-w-5xl',
  wide: 'max-w-6xl',
} as const

/**
 * One section token. Never deviate.
 * Cramped is the fastest way to look cheap. When a section feels too empty,
 * it is probably right.
 */
export function Section({
  children,
  width = 'default',
  tone = 'base',
  divide = false,
  className = '',
  id,
}: {
  children: ReactNode
  width?: keyof typeof WIDTHS
  tone?: 'base' | 'raised'
  divide?: boolean
  className?: string
  id?: string
}) {
  return (
    <section
      id={id}
      className={[
        'py-section',
        tone === 'raised' ? 'bg-surface' : 'bg-void',
        divide ? 'border-t border-edge' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className={`mx-auto w-full ${WIDTHS[width]} px-gutter`}>{children}</div>
    </section>
  )
}

/**
 * Mono, uppercase, wide-tracked. Structural devices encode something true or
 * they don't exist — an eyebrow that just says "Features" above a features grid
 * is saying nothing, so cut it rather than fill it.
 *
 * Uses ink-muted, never ink-faint: faint measures 3.29:1 and is decorative only.
 */
export function Eyebrow({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'amber' | 'violet' | 'jade' }) {
  const tones = {
    muted: 'text-ink-muted',
    amber: 'text-amber',
    violet: 'text-violet',
    jade: 'text-jade',
  }
  return (
    <p className={`font-mono text-eyebrow uppercase ${tones[tone]}`}>{children}</p>
  )
}

/**
 * Headline. Clash Display with negative tracking baked into the scale tokens —
 * display type at default tracking is the most common tell of amateur work.
 */
export function Display({
  children,
  size = 'lg',
  as: Tag = 'h2',
  className = '',
}: {
  children: ReactNode
  size?: 'xl' | 'lg' | 'md'
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
}) {
  const sizes = { xl: 'text-display-xl', lg: 'text-display-lg', md: 'text-display-md' }
  return (
    <Tag className={`font-display ${sizes[size]} text-ink-high text-balance ${className}`}>
      {children}
    </Tag>
  )
}

/**
 * The instrument voice. Timestamps, credit counts, prices, platform labels,
 * the calendar grid. Lean on this harder than feels safe — it is what makes the
 * site read as equipment rather than marketing.
 */
export function Mono({
  children,
  tone = 'body',
  className = '',
}: {
  children: ReactNode
  tone?: 'body' | 'muted' | 'high' | 'amber' | 'violet' | 'jade'
  className?: string
}) {
  const tones = {
    body: 'text-ink-body',
    muted: 'text-ink-muted',
    high: 'text-ink-high',
    amber: 'text-amber',
    violet: 'text-violet',
    jade: 'text-jade',
  }
  return <span className={`font-mono text-mono ${tones[tone]} ${className}`}>{children}</span>
}

/**
 * Prose. Switzer, neutral enough to disappear.
 */
export function Body({
  children,
  size = 'base',
  className = '',
}: {
  children: ReactNode
  size?: 'lg' | 'base' | 'small'
  className?: string
}) {
  const sizes = { lg: 'text-body-lg', base: 'text-body', small: 'text-small' }
  return <p className={`${sizes[size]} text-ink-body text-pretty ${className}`}>{children}</p>
}

/**
 * The button word and the toast word are the same word. Always.
 * Real <a>/<button> elements so keyboard and screen readers get the right thing.
 */
export function Button({
  children,
  href,
  variant = 'primary',
  type,
  onClick,
  className = '',
}: {
  children: ReactNode
  href?: string
  variant?: 'primary' | 'secondary' | 'quiet'
  type?: 'button' | 'submit'
  onClick?: () => void
  className?: string
}) {
  const base =
    'tap inline-flex items-center justify-center gap-2 rounded-xl font-body font-medium text-small'
  const variants = {
    // Amber is the primary brand voice. void-on-amber measures 9.54:1.
    primary: 'bg-amber text-void px-6 py-3.5 hover:bg-amber/90 font-semibold',
    secondary: 'border border-edge-lit text-ink-high px-6 py-3.5 hover:border-ink-muted hover:bg-surface',
    quiet: 'text-ink-muted hover:text-ink-high px-2 py-2',
  }
  const cls = `${base} ${variants[variant]} ${className}`

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type ?? 'button'} onClick={onClick} className={cls}>
      {children}
    </button>
  )
}

/**
 * A card that isn't clickable doesn't move. `interactive` is opt-in, and it is
 * only correct when the whole card is genuinely a link or button.
 */
export function Card({
  children,
  interactive = false,
  className = '',
}: {
  children: ReactNode
  interactive?: boolean
  className?: string
}) {
  return (
    <div
      className={[
        'rounded-2xl border border-edge bg-surface p-6',
        interactive ? 'tap hover:border-edge-lit hover:bg-raised' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}

/**
 * A labelled figure. Mono numeral, quiet label, no gradient accent.
 */
export function Readout({
  value,
  label,
  tone = 'high',
}: {
  value: string
  label: string
  tone?: 'high' | 'amber' | 'violet' | 'jade'
}) {
  const tones = {
    high: 'text-ink-high',
    amber: 'text-amber',
    violet: 'text-violet',
    jade: 'text-jade',
  }
  return (
    <div>
      <p className={`font-mono text-3xl font-semibold tracking-tight ${tones[tone]}`}>{value}</p>
      <p className="mt-2 font-body text-small text-ink-muted">{label}</p>
    </div>
  )
}
