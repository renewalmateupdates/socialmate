import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs Plann (2026) — Full Comparison',
  description: "Plann is an Instagram-centric visual planner at $13/mo+. SocialMate covers 7 platforms including Discord and Telegram, has 20+ AI tools, SOMA autonomous content, and a $0 free plan.",
  openGraph: {
    title:       'SocialMate vs Plann (2026)',
    description: "Plann is built for Instagram feeds. SocialMate is a full Creator OS — Discord, Telegram, Bluesky, TikTok, SOMA, Enki, 20+ AI tools — starting at $0.",
    url:         'https://socialmate.studio/vs/plann',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/plann' },
}

const COMPARISON = [
  { feature: 'Starting price',              plann: '$13/mo (Solo)',               socialmate: '$0 — free forever'         },
  { feature: 'Primary focus',               plann: 'Instagram / visual planning', socialmate: '6-platform Creator OS'     },
  { feature: 'TikTok scheduling',           plann: '✅ Basic',                    socialmate: '✅ Full (Production API)'   },
  { feature: 'Bluesky support',             plann: '❌',                           socialmate: '✅'                         },
  { feature: 'Discord scheduling',          plann: '❌',                           socialmate: '✅ Free'                    },
  { feature: 'Telegram scheduling',         plann: '❌',                           socialmate: '✅ Free'                    },
  { feature: 'AI writing tools',            plann: 'Basic captions',              socialmate: '20+ social-specific tools' },
  { feature: 'Autonomous content (SOMA)',   plann: '❌',                           socialmate: '✅ (Autopilot/Full Send)'   },
  { feature: 'Trading bot (Enki)',          plann: '❌',                           socialmate: '✅ Free paper trading'      },
  { feature: 'Bulk scheduling',             plann: '❌',                           socialmate: '✅ Free'                    },
  { feature: 'Analytics dashboard',         plann: '✅ (paid plans)',              socialmate: '✅ Full analytics + Content DNA' },
  { feature: 'Free plan available',         plann: '✅ Very limited',              socialmate: '✅ Full scheduling + AI'    },
  { feature: 'No per-channel fees',         plann: '✅',                           socialmate: '✅'                         },
  { feature: 'Link in bio',                 plann: '✅',                           socialmate: '✅ Free'                    },
  { feature: 'Social inbox',                plann: '❌',                           socialmate: '✅ 4 platforms'             },
  { feature: 'Team seats (entry plan)',     plann: '1',                           socialmate: '2 free'                    },
]

const FAQ = [
  {
    q: "What is Plann and who is it for?",
    a: "Plann is a visual content planner built primarily for Instagram. It lets you drag-and-drop posts to plan your feed grid, schedule to Instagram and a few other platforms, and get basic analytics. It's popular with Instagram-first creators and brands who care about feed aesthetics.",
  },
  {
    q: "Does Plann support Discord or Telegram?",
    a: "No. Plann does not support Discord or Telegram scheduling. If your audience is on those platforms, Plann cannot help you reach them. SocialMate supports both on the free plan.",
  },
  {
    q: "Is SocialMate cheaper than Plann?",
    a: "Yes. SocialMate is free to start and $5/month for Pro. Plann starts at $13/month. For $5/month, SocialMate gives you more platforms, more AI tools, an autonomous content system (SOMA), and features Plann does not have at any price.",
  },
  {
    q: "Can SocialMate plan my Instagram feed visually like Plann?",
    a: "SocialMate focuses on scheduling and content creation across all platforms rather than a visual feed grid for Instagram specifically. If you need a drag-and-drop Instagram grid planner, Plann does that well. But for multi-platform scheduling, AI tools, and automation, SocialMate is the better choice.",
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function VsPlannPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* NAV */}
      <nav className="border-b border-gray-800 bg-[#0a0a0a] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold tracking-tight">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-gray-400 hover:text-white transition-colors">Log in</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-amber-400 text-black rounded-xl hover:bg-amber-300 transition-all">Start free →</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* HERO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 text-xs font-bold text-amber-400 mb-4">
            Updated May 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            SocialMate vs Plann
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Plann is a visual planner built around Instagram. SocialMate is a full Creator OS covering 7 platforms — including Discord and Telegram — starting completely free.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-amber-400 text-black font-bold rounded-2xl hover:bg-amber-300 transition-all text-sm">
              Try SocialMate free →
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-gray-700 font-semibold rounded-2xl hover:border-gray-500 transition-all text-sm text-gray-200">
              See pricing
            </Link>
          </div>
        </div>

        {/* VERDICT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Plann</p>
            <p className="font-extrabold text-lg mb-2">Great Instagram grid planner. Very platform-limited.</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>✅ Beautiful Instagram visual planner</li>
              <li>✅ Feed grid drag-and-drop preview</li>
              <li>❌ No Discord, Telegram, or Bluesky</li>
              <li>❌ $13/mo starting price</li>
              <li>❌ No autonomous AI content system</li>
              <li>❌ No social inbox for replies</li>
            </ul>
          </div>
          <div className="bg-amber-400 text-black rounded-2xl p-6">
            <p className="text-xs font-bold text-black/60 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">7 platforms. 15+ AI tools. Free to start.</p>
            <ul className="space-y-1 text-xs text-black/80">
              <li>✅ Bluesky, Discord, Telegram, Mastodon, X, TikTok, LinkedIn</li>
              <li>✅ 20+ AI writing and content tools</li>
              <li>✅ SOMA autonomous weekly content generation</li>
              <li>✅ Enki autonomous trading bot</li>
              <li>✅ Full analytics + social inbox</li>
              <li>✅ Free forever — no credit card</li>
            </ul>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">Feature comparison</h2>
          <div className="overflow-x-auto"><div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-400 uppercase tracking-wide">
              <span>Feature</span>
              <span>Plann</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-800 ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-400">{row.plann}</span>
                <span className="text-xs font-semibold text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">Why creators switch from Plann to SocialMate</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Instagram-only tools leave half your audience unreachable',
                desc: "If your audience is on Discord, Telegram, Bluesky, or TikTok, Plann cannot reach them. SocialMate covers all six live platforms in one dashboard — no need for separate tools per platform.",
              },
              {
                n: '2',
                title: "SocialMate costs less than half of Plann's starting price",
                desc: "Plann's Solo plan starts at $13/month. SocialMate Pro is $5/month and includes far more platforms, 20+ AI tools, and an autonomous content system. Free plan covers all core scheduling features.",
              },
              {
                n: '3',
                title: 'SOMA generates a full week of content automatically',
                desc: "Plann has no autonomous content system. SocialMate's SOMA learns your brand voice, ingests your source material, and generates a full week of platform-native posts. Autopilot mode schedules everything without manual review.",
              },
              {
                n: '4',
                title: 'SocialMate has a social inbox — Plann does not',
                desc: "Plann has no unified inbox for replies and mentions. SocialMate's social inbox covers Bluesky, Mastodon, Telegram, and Discord — letting you respond to your audience without leaving the platform.",
              },
            ].map((r) => (
              <div key={r.n} className="flex gap-4 p-5 bg-gray-900 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all">
                <div className="w-8 h-8 bg-amber-400 text-black rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0">{r.n}</div>
                <div>
                  <p className="text-sm font-extrabold mb-1 text-gray-100">{r.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQ.map((faq, i) => (
              <div key={i} className="p-5 bg-gray-900 border border-gray-800 rounded-2xl">
                <p className="text-sm font-extrabold mb-2 text-gray-100">{faq.q}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-amber-400 text-black rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Beyond Instagram — reach every platform from one place</h2>
          <p className="text-black/70 text-sm mb-6 max-w-lg mx-auto">
            SocialMate covers Bluesky, Discord, Telegram, TikTok, Mastodon, and X. 20+ AI tools. SOMA autonomous content. All starting at $0.
          </p>
          <Link href="/signup" className="inline-block bg-black text-white font-bold px-8 py-3.5 rounded-2xl hover:opacity-80 transition-all text-sm">
            Create free account →
          </Link>
          <p className="text-black/50 text-xs mt-3">No card required · Free forever</p>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
