import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs Unum (2026) — Full Comparison',
  description: "Unum is an Instagram visual planner at $8/mo. SocialMate covers 7 platforms including Discord and Telegram, has 20+ AI tools, SOMA autonomous content, Enki trading bot, and a free plan.",
  openGraph: {
    title:       'SocialMate vs Unum (2026)',
    description: "Unum: $8/mo, Instagram/TikTok/X only, no SOMA or AI content system. SocialMate: free — 7 platforms, 20+ AI tools, SOMA, Enki, full Creator OS.",
    url:         'https://socialmate.studio/vs/unum',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/unum' },
}

const COMPARISON = [
  { feature: 'Starting price',              unum: '$8/mo (Pro)',               socialmate: '$0 — free forever'          },
  { feature: 'Primary focus',               unum: 'Instagram visual planning', socialmate: '6-platform Creator OS'      },
  { feature: 'TikTok scheduling',           unum: '✅',                        socialmate: '✅ Full (Production API)'    },
  { feature: 'Bluesky support',             unum: '❌',                        socialmate: '✅'                          },
  { feature: 'Discord scheduling',          unum: '❌',                        socialmate: '✅ Free'                     },
  { feature: 'Telegram scheduling',         unum: '❌',                        socialmate: '✅ Free'                     },
  { feature: 'Mastodon support',            unum: '❌',                        socialmate: '✅ Free'                     },
  { feature: 'AI writing tools',            unum: 'Basic captions',           socialmate: '20+ social-specific tools'  },
  { feature: 'Autonomous content (SOMA)',   unum: '❌',                        socialmate: '✅ (Autopilot/Full Send)'    },
  { feature: 'Trading bot (Enki)',          unum: '❌',                        socialmate: '✅ Free paper trading'       },
  { feature: 'Bulk scheduling',             unum: '❌',                        socialmate: '✅ Free'                     },
  { feature: 'Analytics dashboard',         unum: '✅ Basic',                  socialmate: '✅ Full analytics + Content DNA' },
  { feature: 'Free plan available',         unum: '✅ Limited',                socialmate: '✅ Full scheduling + AI'     },
  { feature: 'No per-channel fees',         unum: '✅',                        socialmate: '✅'                          },
  { feature: 'Link in bio',                 unum: '✅',                        socialmate: '✅ Free + click analytics'   },
  { feature: 'Social inbox',                unum: '❌',                        socialmate: '✅ 4 platforms'              },
]

const FAQ = [
  {
    q: "What is Unum?",
    a: "Unum is a visual content planning app focused on Instagram aesthetics. It lets you preview your Instagram grid before publishing, plan your visual story, and schedule posts to Instagram, TikTok, and X. It's popular with lifestyle brands and visual creators who prioritize Instagram feed design.",
  },
  {
    q: "Does Unum support Discord, Telegram, or Bluesky?",
    a: "No. Unum is focused on Instagram, TikTok, and X. It does not support Discord, Telegram, Mastodon, or Bluesky. SocialMate covers all four of these platforms on the free plan.",
  },
  {
    q: "Is SocialMate more expensive than Unum?",
    a: "No. SocialMate is free to start. Unum Pro starts at $8/month. SocialMate Pro is $5/month — cheaper than Unum — and includes more platforms, 20+ AI tools, autonomous content generation (SOMA), a trading bot (Enki), full analytics, and a social inbox. None of these are available in Unum.",
  },
  {
    q: "Can SocialMate plan Instagram visuals like Unum?",
    a: "SocialMate focuses on scheduling and content creation across all platforms rather than a dedicated Instagram grid preview. If you need drag-and-drop Instagram feed planning, Unum does that well. But for multi-platform scheduling, AI content tools, and automation, SocialMate is the better and more affordable choice.",
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

export default function VsUnumPage() {
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
            SocialMate vs Unum
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Unum is an Instagram visual planner. SocialMate is a full Creator OS — 7 platforms including Discord and Telegram, 20+ AI tools, SOMA autonomous content, and a $0 free plan.
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
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Unum</p>
            <p className="font-extrabold text-lg mb-2">Clean Instagram grid planner. Platform-limited.</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>✅ Instagram grid visual preview</li>
              <li>✅ Clean, minimal UI</li>
              <li>❌ Instagram, TikTok, X only</li>
              <li>❌ No Discord, Telegram, Bluesky, or Mastodon</li>
              <li>❌ No autonomous AI content system</li>
              <li>❌ No social inbox</li>
            </ul>
          </div>
          <div className="bg-amber-400 text-black rounded-2xl p-6">
            <p className="text-xs font-bold text-black/60 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">7 platforms. Full Creator OS. Cheaper than Unum.</p>
            <ul className="space-y-1 text-xs text-black/80">
              <li>✅ Bluesky, Discord, Telegram, Mastodon, X, TikTok, LinkedIn</li>
              <li>✅ 20+ AI writing and content tools</li>
              <li>✅ SOMA: autonomous weekly content generation</li>
              <li>✅ Enki: autonomous trading bot</li>
              <li>✅ Full analytics + social inbox</li>
              <li>✅ Free forever — Pro $5/month</li>
            </ul>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">Feature comparison</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-400 uppercase tracking-wide">
              <span>Feature</span>
              <span>Unum</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-800 ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-400">{row.unum}</span>
                <span className="text-xs font-semibold text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">Why creators choose SocialMate over Unum</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'SocialMate is cheaper than Unum and covers 3x more platforms',
                desc: "Unum Pro is $8/month. SocialMate Pro is $5/month — and covers Bluesky, Discord, Telegram, Mastodon, X, and TikTok. You get more platforms at a lower price, with 20+ AI tools that Unum does not have.",
              },
              {
                n: '2',
                title: 'Unum is Instagram-first — SocialMate is platform-agnostic',
                desc: "Unum was designed around Instagram aesthetics and grid planning. If your audience has grown beyond Instagram — to Discord, Telegram, Bluesky, or TikTok — Unum cannot serve those platforms. SocialMate covers all of them in one dashboard.",
              },
              {
                n: '3',
                title: 'SOMA generates content autonomously — Unum requires manual creation',
                desc: "Unum has no autonomous content system. Every post starts from scratch. SocialMate's SOMA learns your brand voice, ingests your source material, and generates a full week of platform-native posts. Autopilot mode schedules everything without manual review.",
              },
              {
                n: '4',
                title: 'SocialMate has full analytics — Unum has basic stats',
                desc: "Unum has basic analytics. SocialMate's analytics dashboard includes an SVG area chart, posting streaks (GitHub-style 365-day heatmap), Content DNA engagement fingerprint, best-times heatmap, and per-post performance alerts — all included free.",
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">More than an Instagram planner — free to start</h2>
          <p className="text-black/70 text-sm mb-6 max-w-lg mx-auto">
            SocialMate covers 7 platforms, gives you 20+ AI tools, SOMA autonomous content, and Enki. All starting at $0 — cheaper than Unum Pro.
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
