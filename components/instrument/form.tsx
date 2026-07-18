import type { InputHTMLAttributes, ReactNode } from 'react'

/* ══════════════════════════════════════════════════════════════════════════════
   FORM PRIMITIVES
   ──────────────────────────────────────────────────────────────────────────────
   Shared by every auth surface so login, signup, forgot and reset are visibly
   the same product — and so a field only has to be got right once.

   Focus is deliberately visible: keyboard focus is part of the design language,
   not an accessibility tax.
   ══════════════════════════════════════════════════════════════════════════════ */

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block font-mono text-eyebrow uppercase text-ink-muted">
      {children}
    </label>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return (
    <input
      {...rest}
      className={
        'w-full rounded-xl border border-edge bg-void px-4 py-3 text-body text-ink-high ' +
        'transition-colors placeholder:text-ink-faint hover:border-edge-lit ' +
        'focus:border-amber focus:outline-none ' +
        className
      }
    />
  )
}

/**
 * Errors say what happened and how to fix it, in the interface's voice. They
 * don't apologize and they're never vague.
 *
 * `alert` is the one documented exception to the three-voice colour system —
 * failure is a functional axis that amber ("waiting") and jade ("succeeded")
 * cannot honestly carry.
 */
export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-xl border border-alert/40 bg-alert/10 px-4 py-3">
      <p className="text-small text-alert">{children}</p>
    </div>
  )
}

export function Submit({
  children,
  loading = false,
  loadingLabel,
  disabled = false,
}: {
  children: ReactNode
  loading?: boolean
  loadingLabel?: string
  disabled?: boolean
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="tap flex w-full items-center justify-center gap-2.5 rounded-xl bg-amber py-3.5 text-small font-semibold text-void transition-colors hover:bg-amber/90 disabled:opacity-50"
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-void/30 border-t-void" />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  )
}

/** Quiet secondary action. Real <a>/<button>, never a styled div. */
export function QuietLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-small text-ink-muted transition-colors hover:text-ink-high">
      {children}
    </a>
  )
}
