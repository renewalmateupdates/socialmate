import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs SocialRails (2026) — Full Comparison',
  description: 'SocialRails supports 9 platforms and charges from $29/month. SocialMate supports 16 platforms with 12 AI tools and starts free.',
  openGraph: {
    title:       'SocialMate vs SocialRails (2026)',
    description: 'SocialRails starts at $29/month for 9 platforms. SocialMate has 16 platforms, 12 AI tools, and starts free.',
    url:         'https://socialmate.studio/vs/socialrails',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/socialrails' },
}

const COMPARISON = [
  { feature: 'Starting price',         socialrails: '$29/month',           socialmate: '$0 — free forever'    },
  { feature: 'Free plan',              socialrails: '❌ No free plan',      socialmate: '✅ Genuinely free'     },
  { feature: 'Platforms supported',    socialrails: '9',                   socialmate: '16 (growing)'          },
  { feature: 'Mastodon support',       socialrails: '✅',                   socialmate: '✅'                    },
  { feature: 'Bluesky support',        socialrails: '✅',                   socialmate: '✅'                    },
  { feature: 'Discord support',        socialrails: '❌',                   socialmate: '✅'                    },
  { feature: 'Telegram support',       socialrails: '❌',                   socialmate: '✅'                    },
  { feature: 'AI writing tools',       socialrails: 'Limited',             socialmate: '12 tools free'         },
  { feature: 'AI credits',            socialrails: 'Add-on',              socialmate: '100/month free'        },
  { feature: 'Bulk scheduling',        socialrails: '✅',                   socialmate: '✅ Free'               },
  { feature: 'Link in bio',            socialrails: '❌',                   socialmate: '✅ Free'               },
  { feature: 'Competitor tracking',    socialrails: '❌',                   socialmate: '✅ Free'               },
  { feature: 'Evergreen recycling',    socialrails: '✅ (paid)',            socialmate: '✅ Free'               },
  { feature: 'RSS import',             socialrails: '❌',                   socialmate: '✅ Free'               },
  { feature: 'Hashtag manager',        socialrails: '❌',                   socialmate: '✅ Free'               },
  { feature: 'Team seats (free)',      socialrails: '0',                   socialmate: '2'                     },
  { feature: 'Client workspaces',      socialrails: 'Higher tiers',        socialmate: 'Pro+: from $5/mo'     },
  { feature: 'Analytics',             socialrails: 'Basic',               socialmate: '30-day history free'   },
]

export default function VsSocialRails() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight text-gray-900 dark:text-gray-100">
              SocialMate
              <span className="text-[10px] font-semibold bg-pink-500 text-white px-1.5 py-0.5 rounded-full align-super ml-1">Beta</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {[
              { label: 'Features',    href: '/features'    },
              { label: 'Pricing',     href: '/pricing'     },
              { label: 'Studio Stax', href: '/studio-stax' },
              { label: 'Roadmap',     href: '/roadmap'     },
              { label: 'Our Story',   href: '/story'       },
              { label: 'Blog',        href: '/blog'        },
            ].map(l => (
              <Link key={l.label} href={l.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <Link href="/give" className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition-all">❤️ Give</Link>
            <Link href="/partners" className="text-sm font-semibold text-amber-500 hover:text-amber-400 transition-all">Partners</Link>
            <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-all">Sign in</Link>
            <Link href="/signup" className="bg-black dark:bg-white text-white dark:text-black text-sm font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
              Get started free →
            </Link>
          </div>
          <div className="flex md:hidden items-center gap-2">
            <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-all px-2 py-1">Sign in</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">

        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-gray-100">SocialMate vs SocialRails (2026)</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            SocialRails is a newer scheduling tool with decent Bluesky and Mastodon support.
            But it starts at $29/month and lacks several features SocialMate includes free.
            Here's an honest, feature-by-feature comparison.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border border-gray-200 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">SocialRails</p>
            <p className="text-3xl font-extrabold text-gray-700 mb-1">$29/month</p>
            <p className="text-xs text-gray-400">9 platforms · No free plan</p>
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
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">SocialRails</span>
              <span className="text-xs font-bold text-black dark:text-gray-100 uppercase tracking-wide text-center">SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-gray-50 dark:border-gray-700 last:border-0 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-750'}`}>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{row.feature}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 text-center">{row.socialrails}</span>
                <span className="text-xs font-bold text-black dark:text-gray-100 text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 dark:text-gray-100">The comparison in plain terms</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            SocialRails and SocialMate both target users who want to post to decentralized platforms. The difference is in price, platform depth, and included features.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            SocialMate is free to start, supports 16 platforms including Discord and Telegram (which SocialRails doesn't), and includes 12 AI tools, link in bio, competitor tracking, hashtag manager, RSS import, and evergreen recycling — all on the free plan. SocialRails charges $29/month for fewer features.
          </p>
        </div>

        <div className="bg-black text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3 dark:text-gray-100">Switch to SocialMate — it's free</h2>
          <p className="text-gray-400 text-sm mb-6">16 platforms, 12 AI tools, free forever. No card required.</p>
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
            <Link href="/vs/later" className="hover:text-black">vs Later</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
