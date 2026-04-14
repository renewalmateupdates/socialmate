import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs Fedica (2026) — Full Comparison',
  description: 'Fedica is a Twitter/X-only analytics tool starting at $15/month with no multi-platform support. SocialMate is free forever with 16 platforms, AI tools, and scheduling built in.',
  openGraph: {
    title:       'SocialMate vs Fedica (2026)',
    description: 'Fedica focuses on Twitter/X analytics. If you post on Bluesky, Discord, Instagram, or Mastodon — it cannot help. SocialMate covers 16 platforms free.',
    url:         'https://socialmate.studio/vs/fedica',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/fedica' },
}

const COMPARISON = [
  { feature: 'Starting price',            fedica: '$15/month (Tweepsmap)',        socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 fedica: '❌ None',                      socialmate: '✅ Free forever'         },
  { feature: 'Primary focus',             fedica: 'Twitter/X analytics only',    socialmate: 'Scheduling + analytics'  },
  { feature: 'Platform support',          fedica: 'Twitter/X primary',           socialmate: '16 platforms'            },
  { feature: 'Instagram support',         fedica: 'Limited',                      socialmate: '✅'                      },
  { feature: 'Discord support',           fedica: '❌',                           socialmate: '✅'                      },
  { feature: 'Telegram support',          fedica: '❌',                           socialmate: '✅'                      },
  { feature: 'Mastodon support',          fedica: '❌',                           socialmate: '✅'                      },
  { feature: 'Bluesky support',           fedica: '❌',                           socialmate: '✅'                      },
  { feature: 'Post scheduling',           fedica: 'Basic scheduling',             socialmate: '✅ Full scheduling free' },
  { feature: 'Bulk scheduling',           fedica: '❌',                           socialmate: '✅ Free'                 },
  { feature: 'AI writing tools',          fedica: '❌',                           socialmate: '12 tools included'       },
  { feature: 'AI credits free tier',      fedica: 'N/A (no free plan)',           socialmate: '75/month free'           },
  { feature: 'Link in bio',               fedica: '❌',                           socialmate: '✅ Free'                 },
  { feature: 'Hashtag manager',           fedica: 'Twitter/X hashtags only',     socialmate: '✅ Free, all platforms'  },
  { feature: 'Evergreen recycling',       fedica: '❌',                           socialmate: '✅ Free'                 },
  { feature: 'Audience analytics',        fedica: '✅ Deep Twitter/X analytics', socialmate: '✅ Free multi-platform'  },
  { feature: 'Competitor tracking',       fedica: 'Twitter/X only',              socialmate: '✅ Free (3 accounts)'   },
]

const FAQ = [
  {
    q: 'What is Fedica (formerly Tweepsmap)?',
    a: 'Fedica, formerly known as Tweepsmap, is an analytics tool focused primarily on Twitter/X. It offers audience segmentation, follower analytics, and geographic data for Twitter/X accounts. It is not a general-purpose scheduling tool.',
  },
  {
    q: 'Does Fedica support multiple platforms?',
    a: 'Fedica is primarily a Twitter/X analytics tool. If you want to schedule and analyze content across Instagram, LinkedIn, Bluesky, Discord, Telegram, Mastodon, and more — Fedica is not the right tool. SocialMate supports 16 platforms.',
  },
  {
    q: 'Is SocialMate a good Fedica alternative for multi-platform creators?',
    a: 'Yes. SocialMate gives you scheduling, analytics, AI tools, bulk scheduling, evergreen recycling, and competitor tracking across 16 platforms — all free. Fedica charges $15/month and focuses primarily on Twitter/X analytics.',
  },
  {
    q: 'What if I just want Twitter/X analytics?',
    a: 'If Twitter/X is your only platform and you need deep audience segmentation and geographic analytics, Fedica has specialized tools for that. But if you want to schedule content and track performance across multiple platforms including Bluesky, Discord, and Mastodon — SocialMate is the better fit.',
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

export default function VsFedicaPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* NAV */}
      <nav className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="font-bold tracking-tight dark:text-white">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Log in</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all">Start free →</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* HERO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 mb-4">
            Updated April 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-white">
            SocialMate vs Fedica
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Fedica is a Twitter/X analytics tool — not a multi-platform scheduler. If you post beyond Twitter, it cannot help. SocialMate covers 16 platforms for free.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-black text-white font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
              Try SocialMate free →
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-gray-200 dark:border-gray-700 font-semibold rounded-2xl hover:border-gray-400 transition-all text-sm dark:text-gray-200">
              See pricing
            </Link>
          </div>
        </div>

        {/* VERDICT BANNER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Fedica</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Deep Twitter/X analytics — single-platform</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Deep Twitter/X audience analytics</li>
              <li>✅ Geographic follower segmentation</li>
              <li>❌ No free plan — $15/month minimum</li>
              <li>❌ Primarily Twitter/X only</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ No AI writing tools</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">16 platforms. All tools. $0.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Free forever — no trial countdown</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Full scheduling + analytics free</li>
              <li>✅ Bulk scheduling free</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Feature comparison</h2>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span>Feature</span>
              <span>Fedica</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.fedica}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over Fedica</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Fedica is an analytics tool — SocialMate is a scheduler with analytics',
                desc: 'Fedica was built for Twitter/X audience research. It is not primarily a scheduling platform. If you want to create, schedule, and publish content across multiple platforms with analytics included, SocialMate is the right tool.',
              },
              {
                n: '2',
                title: 'Single-platform focus in a multi-platform world',
                desc: 'In 2026, audiences are spread across Twitter/X, Bluesky, Instagram, LinkedIn, Discord, Mastodon, Telegram, and more. A Twitter/X-only tool leaves the rest of your audience unserved. SocialMate schedules across 16 platforms from one dashboard.',
              },
              {
                n: '3',
                title: 'No AI tools, no bulk scheduling, no evergreen recycling',
                desc: 'Fedica does not include AI writing tools, bulk scheduling, or evergreen content recycling. SocialMate includes all three on the free plan — because efficient content creation and reuse should not cost extra.',
              },
              {
                n: '4',
                title: 'No free plan at all',
                desc: 'Fedica offers no free tier. SocialMate is completely free to start — no credit card, no trial countdown, no catch. You can use the full free plan indefinitely while you build your audience.',
              },
            ].map((r) => (
              <div key={r.n} className="flex gap-4 p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0">{r.n}</div>
                <div>
                  <p className="text-sm font-extrabold mb-1 dark:text-gray-100">{r.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQ.map((faq, i) => (
              <div key={i} className="p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl">
                <p className="text-sm font-extrabold mb-2 dark:text-gray-100">{faq.q}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-black text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Go beyond Twitter/X — start free today</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — 16 platforms, bulk scheduling, 12 AI tools, analytics. No credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            Create free account →
          </Link>
          <p className="text-gray-600 text-xs mt-3">No card required · Free forever</p>
        </div>
      </div>
      {/* FOOTER */}
      <PublicFooter />
    </div>
  )
}
