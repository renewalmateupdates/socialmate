import Link from 'next/link'

// Static login skeleton — served as both the route's loading state AND the
// Suspense fallback around LoginInner. LoginInner uses useSearchParams(), which
// bails the page out of prerendering; with an EMPTY Suspense fallback the
// server was shipping blank HTML for /login, so nothing painted until the full
// JS bundle downloaded and hydrated. On mobile networks that was a 20s blank
// screen (Speed Insights: mobile /login FCP 20.4s, RES 33). This skeleton is
// pure static JSX, so it prerenders into the HTML and paints immediately.
//
// It deliberately mirrors AuthShell's grid, header and field rhythm. A skeleton
// that doesn't match the real layout just trades a blank screen for a visible
// jump at hydration.
export default function LoginSkeleton() {
  return (
    <div className="dark grid min-h-dvh bg-void font-body lg:grid-cols-[1fr_minmax(0,45%)]">
      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between px-gutter py-6">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-body font-medium tracking-tight text-ink-high">
              SocialMate
            </span>
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-gutter py-10">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-display-md text-ink-high">Welcome back</h1>
            <p className="mt-3 text-body text-ink-muted">Sign in to your SocialMate account</p>

            <div className="mt-9">
              {/* Google button */}
              <div className="h-11 animate-pulse rounded-xl bg-panel" />

              <div className="my-7 flex items-center gap-4">
                <span className="h-px flex-1 bg-edge" />
                <span className="font-mono text-eyebrow uppercase text-ink-faint">or</span>
                <span className="h-px flex-1 bg-edge" />
              </div>

              {/* Segmented control */}
              <div className="mb-6 h-10 animate-pulse rounded-xl bg-panel" />

              {/* Email + password */}
              <div className="mb-2 h-3 w-12 animate-pulse rounded bg-panel" />
              <div className="mb-5 h-12 animate-pulse rounded-xl bg-panel" />
              <div className="mb-2 h-3 w-16 animate-pulse rounded bg-panel" />
              <div className="mb-5 h-12 animate-pulse rounded-xl bg-panel" />

              <div className="h-12 animate-pulse rounded-xl bg-amber/25" />
            </div>
          </div>
        </main>
      </div>

      {/* Aside placeholder — keeps the split from collapsing on first paint. */}
      <div className="hidden lg:block lg:border-l lg:border-edge lg:bg-panel" />
    </div>
  )
}
