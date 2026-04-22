'use client'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

const FEATURES = [
  { icon: '🧠', label: 'Voice identity profile — SOMA learns your tone' },
  { icon: '📥', label: 'Weekly content ingestion — themes, hooks, ideas' },
  { icon: '✨', label: 'AI content generation — ready-to-approve posts' },
  { icon: '📅', label: 'Smart scheduling — posts at your best times' },
  { icon: '🔥', label: 'Autopilot mode — fully automated on Pro+ (add-on)' },
]

export default function SomaUpgradePage() {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 md:ml-56 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg">

          {/* Card */}
          <div className="rounded-2xl border border-amber-500/20 bg-gray-900 shadow-2xl overflow-hidden">

            {/* Top glow bar */}
            <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

            <div className="p-8 sm:p-10">
              {/* Icon + heading */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4">
                  <span className="text-3xl">⚡</span>
                </div>
                <h1 className="text-2xl font-extrabold text-white mb-2">
                  SOMA is a Pro feature
                </h1>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Self-Optimizing Media Agent is available on Pro and Agency plans.
                  Upgrade to unlock AI-powered content intelligence.
                </p>
              </div>

              {/* Feature list */}
              <ul className="space-y-3 mb-8">
                {FEATURES.map((f) => (
                  <li key={f.label} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">{f.icon}</span>
                    <span className="text-sm text-gray-300">{f.label}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/pricing"
                className="block w-full text-center bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-extrabold text-sm px-6 py-3.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-amber-500/20"
              >
                Upgrade to Pro — $5/mo →
              </Link>

              <p className="text-center text-xs text-gray-500 mt-4">
                Already on Pro?{' '}
                <Link href="/settings" className="text-amber-400 hover:underline">
                  Check your settings
                </Link>
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
