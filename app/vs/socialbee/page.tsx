import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs SocialBee (2026) — Full Comparison',
  description: 'SocialBee starts at $29/month with no free plan. Content categories are useful but paywalled. SocialMate is free forever with bulk scheduling, AI tools, and Discord/Bluesky/Telegram/Mastodon.',
  openGraph: {
    title:       'SocialMate vs SocialBee (2026)',
    description: 'SocialBee charges $29/month with no free plan. Its best feature — content categories — is paywalled. SocialMate is free forever.',
    url:         'https://socialmate.studio/vs/socialbee',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/socialbee' },
}

const COMPARISON = [
  { feature: 'Starting price',            socialbee: '$29/month (Bootstrap)',        socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 socialbee: '❌ None',                       socialmate: '✅ Free forever'         },
  { feature: 'Users on starting plan',    socialbee: '1 user',                       socialmate: '2 users free'            },
  { feature: 'Social accounts (starter)', socialbee: '5 accounts',                  socialmate: 'No hard cap (free tier)' },
  { feature: 'Content categories',        socialbee: '✅ Paid plans',                socialmate: '✅ Free'                 },
  { feature: 'Evergreen recycling',       socialbee: '✅ Paid plans',                socialmate: '✅ Free'                 },
  { feature: 'Discord support',           socialbee: '❌',                            socialmate: '✅'                      },
  { feature: 'Telegram support',          socialbee: '❌',                            socialmate: '✅'                      },
  { feature: 'Mastodon support',          socialbee: '❌',                            socialmate: '✅'                      },
  { feature: 'Bluesky support',           socialbee: '❌',                            socialmate: '✅'                      },
  { feature: 'AI writing tools',          socialbee: 'AI Copilot add-on',            socialmate: '12 tools included'       },
  { feature: 'AI credits free tier',      socialbee: 'N/A (no free plan)',           socialmate: '75/month free'           },
  { feature: 'Bulk scheduling',           socialbee: 'Paid plans',                   socialmate: '✅ Free'                 },
  { feature: 'Link in bio',               socialbee: '❌',                            socialmate: '✅ Free'                 },
  { feature: 'Hashtag manager',           socialbee: 'Paid plans',                   socialmate: '✅ Free'                 },
  { feature: 'Competitor tracking',       socialbee: 'Higher tiers',                 socialmate: '✅ Free (3 accounts)'   },
  { feature: 'RSS import',                socialbee: 'Paid plans',                   socialmate: '✅ Free'                 },
  { feature: 'Content approval',          socialbee: 'Higher tiers',                 socialmate: '✅ Free'                 },
]

const FAQ = [
  {
    q: 'Does SocialBee have a free plan?',
    a: 'No. SocialBee has no free plan. Their Bootstrap plan starts at $29/month and supports 1 user and 5 social profiles. SocialMate is completely free to start with no credit card required.',
  },
  {
    q: 'What is SocialBee\'s content category feature?',
    a: 'Content categories let you organize your posts by type — educational, promotional, entertaining — and schedule them in rotation. It\'s a genuinely useful feature for maintaining content variety. On SocialMate, content categorization and evergreen recycling are included in the free tier.',
  },
  {
    q: 'Which platforms does SocialMate support that SocialBee does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky. SocialBee does not support any of these platforms. If your audience is on community platforms or decentralized networks, SocialBee cannot reach them.',
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. The free tier includes unlimited posts, 75 AI credits/month, bulk scheduling, link in bio, hashtag manager, competitor tracking, RSS import, and evergreen recycling. No credit card required and no trial countdown.',
  },
]

export default function VsSocialBeePage() {
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
            SocialMate vs SocialBee
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            SocialBee has no free plan and starts at $29/month — and its best features like content categories are locked behind paid tiers. SocialMate gives you all of that for free.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialBee</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Content categories are great — but paywalled</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Content category system</li>
              <li>✅ Evergreen content recycling</li>
              <li>❌ No free plan — $29/month minimum</li>
              <li>❌ Best features locked to higher tiers</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Bulk scheduling behind paywall</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">All platforms. All tools. $0.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Free forever — no trial countdown</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Bulk scheduling free</li>
              <li>✅ Evergreen recycling free</li>
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
              <span>SocialBee</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.socialbee}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from SocialBee</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'No free plan means you\'re paying before you know it fits',
                desc: 'SocialBee offers no free tier — just a 14-day trial. Once it ends, you\'re paying $29/month or losing access. SocialMate has a permanent free plan that never expires, so you can use it indefinitely and upgrade only when it makes sense.',
              },
              {
                n: '2',
                title: 'SocialBee\'s signature feature is paywalled on lower tiers',
                desc: 'The content category system — SocialBee\'s main differentiator — is limited or unavailable on the base Bootstrap plan. You end up paying for a plan specifically to access the feature that attracted you in the first place. SocialMate includes category management and evergreen recycling in the free tier.',
              },
              {
                n: '3',
                title: 'SocialMate covers platforms SocialBee ignores entirely',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are absent from SocialBee\'s platform list. If your community lives on Discord, your audience uses Telegram, or you\'re building on Bluesky or Mastodon, SocialBee can\'t help you. SocialMate covers all four for free.',
              },
              {
                n: '4',
                title: 'Bulk scheduling is locked to paid plans on SocialBee',
                desc: 'Uploading and scheduling many posts at once is one of the biggest time-savers in social media management. On SocialBee, bulk scheduling requires a paid plan. SocialMate includes bulk scheduling in the free tier.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Skip the $29/month — start free today</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 12 AI tools, 16 platforms, evergreen recycling included. No credit card required.
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
            <Link href="/vs/buffer" className="hover:text-black dark:hover:text-white transition-colors">vs Buffer</Link>
            <Link href="/vs/meetedgar" className="hover:text-black dark:hover:text-white transition-colors">vs MeetEdgar</Link>
            <Link href="/vs/loomly" className="hover:text-black dark:hover:text-white transition-colors">vs Loomly</Link>
            <Link href="/vs/sendible" className="hover:text-black dark:hover:text-white transition-colors">vs Sendible</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
