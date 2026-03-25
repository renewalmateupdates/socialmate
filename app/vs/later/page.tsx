import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Later (2026) — Full Comparison',
  description: 'Later focuses on Instagram and visual content. SocialMate supports 16 platforms with 12 AI tools and a genuine free tier. See the comparison.',
  openGraph: {
    title:       'SocialMate vs Later (2026)',
    description: 'Later is Instagram-focused and starts at $18/month. SocialMate supports 16 platforms and starts free.',
    url:         'https://socialmate.studio/vs/later',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/later' },
}

const COMPARISON = [
  { feature: 'Starting price',         later: '$18/month',              socialmate: '$0 — free forever'    },
  { feature: 'Free plan',              later: '❌ No free plan',         socialmate: '✅ Genuinely free'     },
  { feature: 'Platform focus',         later: 'Instagram-first',        socialmate: 'All platforms equal'   },
  { feature: 'Platforms supported',    later: '6 (Instagram, TikTok, Pinterest, Facebook, LinkedIn, Twitter)', socialmate: '16 (growing)'    },
  { feature: 'Mastodon/Bluesky',       later: '❌',                      socialmate: '✅'                    },
  { feature: 'Discord/Telegram',       later: '❌',                      socialmate: '✅'                    },
  { feature: 'AI writing tools',       later: 'Basic AI',               socialmate: '12 tools free'        },
  { feature: 'AI credits',            later: 'Limited on paid',        socialmate: '100/month free'        },
  { feature: 'Link in bio',            later: '✅ (paid plans)',         socialmate: '✅ Free'               },
  { feature: 'Bulk scheduling',        later: '✅ (paid)',               socialmate: '✅ Free'               },
  { feature: 'Competitor tracking',    later: '❌',                      socialmate: '✅ Free'               },
  { feature: 'Hashtag manager',        later: '✅ (paid)',               socialmate: '✅ Free'               },
  { feature: 'Evergreen recycling',    later: '❌',                      socialmate: '✅ Free'               },
  { feature: 'RSS import',             later: '❌',                      socialmate: '✅ Free'               },
  { feature: 'Team seats (free)',      later: '0',                      socialmate: '2'                     },
  { feature: 'Client workspaces',      later: 'Agency plan only',       socialmate: 'Pro+: from $5/mo'     },
  { feature: 'Visual grid preview',    later: '✅ (Instagram grid)',     socialmate: '—'                     },
]

export default function VsLater() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight dark:text-gray-100">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all hidden sm:block">Sign in</Link>
            <Link href="/signup" className="bg-black text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
              Get started free →
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">

        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-gray-100">SocialMate vs Later (2026)</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            Later built their product around Instagram and visual content. If you're managing multiple platforms — especially
            ones Later doesn't support like Bluesky, Discord, or Telegram — you need a different tool.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border border-gray-200 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Later</p>
            <p className="text-3xl font-extrabold text-gray-700 mb-1">$18/month</p>
            <p className="text-xs text-gray-400">Instagram-focused · 6 platforms</p>
          </div>
          <div className="border-2 border-green-200 bg-green-50 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">SocialMate</p>
            <p className="text-3xl font-extrabold text-green-700 mb-1">$0/month</p>
            <p className="text-xs text-green-600">16 platforms · 12 AI tools · Free forever</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-gray-100">Feature comparison</h2>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 px-5 py-3">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wide">Feature</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Later</span>
              <span className="text-xs font-bold text-black dark:text-gray-100 uppercase tracking-wide text-center">SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-gray-50 dark:border-gray-700 last:border-0 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-750'}`}>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{row.feature}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 text-center">{row.later}</span>
                <span className="text-xs font-bold text-black dark:text-gray-100 text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 dark:text-gray-100">When Later makes sense</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Later has excellent Instagram grid preview tools. If your strategy is heavily Instagram-focused and visual grid planning is a core part of your workflow, Later's interface is purpose-built for that use case.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            If you manage multiple platforms — especially newer ones like Bluesky, Mastodon, or community platforms like Discord and Telegram — Later doesn't support them. SocialMate does, and it's free to start.
          </p>
        </div>

        <div className="bg-black text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3 dark:text-gray-100">Try SocialMate free</h2>
          <p className="text-gray-400 text-sm mb-6">16 platforms · 12 AI tools · Free forever. No card required.</p>
          <Link href="/signup"
            className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            Create free account →
          </Link>
        </div>
      </div>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="font-bold text-sm">SocialMate</span>
          </Link>
          <div className="flex items-center gap-6 text-xs text-gray-400 dark:text-gray-500">
            <Link href="/vs/buffer" className="hover:text-black">vs Buffer</Link>
            <Link href="/vs/hootsuite" className="hover:text-black">vs Hootsuite</Link>
            <Link href="/vs/zoho-social" className="hover:text-black">vs Zoho Social</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
