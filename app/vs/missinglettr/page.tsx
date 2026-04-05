import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs MissingLettr (2026) — Full Comparison',
  description: 'MissingLettr auto-creates drip campaigns but has no free plan and starts at $19/month. SocialMate is free forever with bulk scheduling, Discord/Bluesky/Telegram/Mastodon, and 12 AI tools.',
  openGraph: {
    title:       'SocialMate vs MissingLettr (2026)',
    description: 'MissingLettr charges $19/month with no free plan. Its drip campaign feature is clever but paywalled. SocialMate is free forever.',
    url:         'https://socialmate.studio/vs/missinglettr',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/missinglettr' },
}

const COMPARISON = [
  { feature: 'Starting price',            missinglettr: '$19/month (Solo)',             socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 missinglettr: '❌ None',                       socialmate: '✅ Free forever'         },
  { feature: 'Users on starting plan',    missinglettr: '1 user',                       socialmate: '2 users free'            },
  { feature: 'Social accounts (starter)', missinglettr: '4 accounts',                  socialmate: 'No hard cap (free tier)' },
  { feature: 'Auto drip campaigns',       missinglettr: '✅ Core feature',              socialmate: 'Evergreen recycling'     },
  { feature: 'Evergreen recycling',       missinglettr: 'Limited',                      socialmate: '✅ Free'                 },
  { feature: 'Discord support',           missinglettr: '❌',                            socialmate: '✅'                      },
  { feature: 'Telegram support',          missinglettr: '❌',                            socialmate: '✅'                      },
  { feature: 'Mastodon support',          missinglettr: '❌',                            socialmate: '✅'                      },
  { feature: 'Bluesky support',           missinglettr: '❌',                            socialmate: '✅'                      },
  { feature: 'AI writing tools',          missinglettr: 'Basic AI assist',              socialmate: '12 tools included'       },
  { feature: 'AI credits free tier',      missinglettr: 'N/A (no free plan)',           socialmate: '75/month free'           },
  { feature: 'Bulk scheduling',           missinglettr: 'Limited',                      socialmate: '✅ Free'                 },
  { feature: 'Link in bio',               missinglettr: '❌',                            socialmate: '✅ Free'                 },
  { feature: 'Hashtag manager',           missinglettr: 'Limited',                      socialmate: '✅ Free'                 },
  { feature: 'Competitor tracking',       missinglettr: '❌',                            socialmate: '✅ Free (3 accounts)'   },
  { feature: 'RSS import',                missinglettr: '✅ Auto-campaigns from RSS',   socialmate: '✅ Free'                 },
  { feature: 'Analytics',                 missinglettr: 'Basic',                        socialmate: 'Free dashboard'          },
]

const FAQ = [
  {
    q: 'Does MissingLettr have a free plan?',
    a: 'No. MissingLettr has no free plan. Their Solo plan starts at $19/month and supports 1 user and 4 social accounts. SocialMate is completely free to start with no credit card required.',
  },
  {
    q: 'What is MissingLettr\'s drip campaign feature?',
    a: 'MissingLettr automatically turns blog posts or RSS content into a series of scheduled social posts spread out over weeks or months. It\'s a clever repurposing tool. SocialMate\'s evergreen recycling and RSS import achieve a similar result — keeping your best content in circulation — without the paywall.',
  },
  {
    q: 'Which platforms does SocialMate support that MissingLettr does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky. MissingLettr does not support any of these platforms. If any part of your audience lives on these networks, MissingLettr can\'t reach them.',
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. The free tier includes unlimited posts, 75 AI credits/month, bulk scheduling, link in bio, hashtag manager, competitor tracking, RSS import, and evergreen recycling. No credit card required and no trial countdown.',
  },
]

export default function VsMissingLettrPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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
            SocialMate vs MissingLettr
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            MissingLettr auto-creates campaigns from your blog posts, but has no free plan and starts at $19/month. SocialMate gives you evergreen recycling and RSS import for free.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">MissingLettr</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Clever drip campaigns — but no free plan</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Auto-drip campaigns from blog content</li>
              <li>✅ RSS-to-social automation</li>
              <li>❌ No free plan — $19/month minimum</li>
              <li>❌ Very limited platform coverage</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Minimal AI and analytics features</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">All platforms. All tools. $0.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Free forever — no trial countdown</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Evergreen recycling + RSS import free</li>
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
              <span>MissingLettr</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.missinglettr}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people choose SocialMate over MissingLettr</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'MissingLettr\'s best use case is covered by SocialMate for free',
                desc: 'MissingLettr\'s main value is turning blog content into social campaigns automatically. SocialMate\'s RSS import and evergreen recycling cover the same core need — keeping your best content circulating across platforms — without any paywall.',
              },
              {
                n: '2',
                title: 'No free plan means you commit money before testing fit',
                desc: 'MissingLettr has no free tier. You can trial it briefly, but then you\'re paying $19/month or you\'re out. SocialMate is free indefinitely, so you can evaluate it on your own schedule without spending a cent.',
              },
              {
                n: '3',
                title: 'MissingLettr skips the platforms your community uses',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not supported by MissingLettr. Its platform coverage is narrow. SocialMate covers all four community and decentralized platforms on the free tier.',
              },
              {
                n: '4',
                title: 'SocialMate gives you 12 AI tools — MissingLettr gives you basic assist',
                desc: 'MissingLettr\'s AI features are minimal. SocialMate includes 12 AI-powered tools on the free tier — caption generation, hashtag research, content gap analysis, best-time suggestions, and more — without any add-on cost.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Skip the $19/month — start free today</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 12 AI tools, 16 platforms, RSS import and evergreen recycling included. No credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            Create free account →
          </Link>
          <p className="text-gray-600 text-xs mt-3">No card required · Free forever</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="font-bold text-sm tracking-tight dark:text-gray-100">SocialMate</span>
          </Link>
          <div className="flex items-center gap-6 text-xs text-gray-400 dark:text-gray-500">
            <Link href="/pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
            <Link href="/vs/meetedgar" className="hover:text-black dark:hover:text-white transition-colors">vs MeetEdgar</Link>
            <Link href="/vs/buffer" className="hover:text-black dark:hover:text-white transition-colors">vs Buffer</Link>
            <Link href="/vs/socialbee" className="hover:text-black dark:hover:text-white transition-colors">vs SocialBee</Link>
            <Link href="/vs/loomly" className="hover:text-black dark:hover:text-white transition-colors">vs Loomly</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
