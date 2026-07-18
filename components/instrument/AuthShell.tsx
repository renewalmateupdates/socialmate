import Link from 'next/link'
import type { ReactNode } from 'react'

/* ══════════════════════════════════════════════════════════════════════════════
   AUTH SHELL
   ──────────────────────────────────────────────────────────────────────────────
   Split layout: form on one side, a quiet fragment of the hero language on the
   other. The aside is hidden below lg — on a phone the form should have the whole
   screen, and a decorative panel above the fold would just push the fields down.

   Every auth surface (login, signup, forgot, reset) composes from this so the
   first screen of the product is unmistakably the same product as the landing
   page.
   ══════════════════════════════════════════════════════════════════════════════ */

/** The quiet fragment. One row moves, slowly. Nothing else. */
function AuthAside({ note }: { note?: ReactNode }) {
  return (
    <div className="auth-clock relative hidden lg:flex lg:flex-col lg:justify-center lg:border-l lg:border-edge lg:bg-panel lg:px-14">
      {/* Ambient light, once, behind the panel that earns it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(60% 45% at 70% 40%, var(--glow-amber), transparent 70%)' }}
      />

      <p className="font-mono text-eyebrow uppercase text-ink-muted">Queue</p>

      <div className="mt-6 max-w-sm space-y-2" aria-hidden="true">
        <div className="auth-anim auth-publish flex items-center gap-3 rounded-lg border px-3.5 py-3">
          <span className="font-mono text-mono text-ink-high">09:15</span>
          <span className="flex-1 truncate text-small text-ink-muted">Bluesky</span>
          <span className="relative inline-flex w-24 justify-end">
            <span className="auth-anim auth-tag-queued absolute right-0 font-mono text-eyebrow uppercase text-amber">
              Queued
            </span>
            <span className="auth-anim auth-tag-published absolute right-0 font-mono text-eyebrow uppercase text-jade">
              Published
            </span>
          </span>
        </div>

        {[
          { time: '14:00', platform: 'X' },
          { time: '18:30', platform: 'LinkedIn' },
        ].map(row => (
          <div
            key={row.time}
            className="flex items-center gap-3 rounded-lg border px-3.5 py-3"
            style={{ borderColor: 'var(--color-amber)', backgroundColor: 'var(--glow-amber)' }}
          >
            <span className="font-mono text-mono text-ink-high">{row.time}</span>
            <span className="flex-1 truncate text-small text-ink-muted">{row.platform}</span>
            <span className="inline-flex w-24 justify-end font-mono text-eyebrow uppercase text-amber">
              Queued
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10 max-w-sm">
        {note ?? (
          <p className="font-display text-title text-balance text-ink-high">
            One compose box, one schedule, and a queue that tells you what actually
            went live.
          </p>
        )}
      </div>
    </div>
  )
}

export default function AuthShell({
  children,
  headline,
  sub,
  altHref,
  altLabel,
  asideNote,
}: {
  children: ReactNode
  headline: string
  sub?: string
  /** Top-right escape hatch, e.g. login ↔ signup. */
  altHref?: string
  altLabel?: string
  /** Replaces the aside's closing line. Signup uses it for what you actually get. */
  asideNote?: ReactNode
}) {
  return (
    <div className="dark grid min-h-dvh bg-void font-body text-ink-body lg:grid-cols-[1fr_minmax(0,45%)]">
      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between px-gutter py-6">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-body font-medium tracking-tight text-ink-high">
              SocialMate
            </span>
          </Link>
          {altHref && altLabel && (
            <Link
              href={altHref}
              className="text-small text-ink-muted transition-colors hover:text-ink-high"
            >
              {altLabel}
            </Link>
          )}
        </header>

        <main className="flex flex-1 items-center justify-center px-gutter py-10">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-display-md text-balance text-ink-high">{headline}</h1>
            {sub && <p className="mt-3 text-body text-ink-muted">{sub}</p>}
            <div className="mt-9">{children}</div>
          </div>
        </main>
      </div>

      <AuthAside note={asideNote} />
    </div>
  )
}
