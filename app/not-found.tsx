import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="dark min-h-screen bg-void flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <img src="/logo.png" alt="SocialMate" className="w-14 h-14 rounded-2xl mx-auto mb-8" />
        <p className="font-display text-7xl font-semibold text-amber mb-4">404</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-high mb-3">You took a wrong turn.</h1>
        <p className="text-sm text-ink-muted leading-relaxed mb-10">
          This page doesn&apos;t exist — but the rest of the product does.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/"
            className="w-full sm:w-auto bg-gradient-to-b from-amber-bright to-amber hover:to-amber-bright text-void text-sm font-semibold px-6 py-3 rounded-xl transition-colors text-center">
            Go home →
          </Link>
          <Link href="/dashboard"
            className="w-full sm:w-auto border border-edge hover:border-edge-lit text-ink-body hover:text-ink-high text-sm font-semibold px-6 py-3 rounded-xl transition-colors text-center bg-panel">
            Open the app →
          </Link>
        </div>
      </div>
    </div>
  )
}
