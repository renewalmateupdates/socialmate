// Mirrors AuthShell's grid, header and field rhythm. A skeleton that doesn't
// match the real layout just trades a blank screen for a visible jump — and the
// previous version had the panel on the opposite side from the real page.
export default function SignupLoading() {
  return (
    <div className="dark grid min-h-dvh bg-void font-body lg:grid-cols-[1fr_minmax(0,45%)]">
      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between px-gutter py-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-panel" />
            <div className="h-4 w-24 animate-pulse rounded bg-panel" />
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-gutter py-10">
          <div className="w-full max-w-sm">
            <div className="h-9 w-64 animate-pulse rounded-lg bg-panel" />
            <div className="mt-4 h-4 w-48 animate-pulse rounded bg-panel" />

            <div className="mt-9">
              <div className="h-11 animate-pulse rounded-xl bg-panel" />

              <div className="my-7 flex items-center gap-4">
                <span className="h-px flex-1 bg-edge" />
                <span className="font-mono text-eyebrow uppercase text-ink-faint">or</span>
                <span className="h-px flex-1 bg-edge" />
              </div>

              <div className="mb-2 h-3 w-12 animate-pulse rounded bg-panel" />
              <div className="mb-5 h-12 animate-pulse rounded-xl bg-panel" />
              <div className="mb-2 h-3 w-20 animate-pulse rounded bg-panel" />
              <div className="mb-5 h-12 animate-pulse rounded-xl bg-panel" />
              <div className="mb-2 h-3 w-28 animate-pulse rounded bg-panel" />
              <div className="mb-6 h-12 animate-pulse rounded-xl bg-panel" />

              <div className="h-12 animate-pulse rounded-xl bg-amber/25" />
            </div>
          </div>
        </main>
      </div>

      <div className="hidden lg:block lg:border-l lg:border-edge lg:bg-panel" />
    </div>
  )
}
