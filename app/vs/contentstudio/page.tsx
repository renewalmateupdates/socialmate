import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs ContentStudio (2026) — Full Comparison',
  description: 'ContentStudio starts at $25/month with no free plan and a complex UI. SocialMate is free forever with bulk scheduling, Discord/Bluesky/Telegram/Mastodon, and 12 AI tools included.',
  openGraph: {
    title:       'SocialMate vs ContentStudio (2026)',
    description: 'ContentStudio charges $25/month with no free plan and a UI that takes time to learn. SocialMate is free forever and ready in minutes.',
    url:         'https://socialmate.studio/vs/contentstudio',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/contentstudio' },
}

const COMPARISON = [
  { feature: 'Starting price',            contentstudio: '$25/month (Starter)',         socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 contentstudio: '❌ None',                      socialmate: '✅ Free forever'         },
  { feature: 'Users on starting plan',    contentstudio: '1 user',                      socialmate: '2 users free'            },
  { feature: 'Social accounts (starter)', contentstudio: '5 accounts',                 socialmate: 'No hard cap (free tier)' },
  { feature: 'UI complexity',             contentstudio: 'High — steep learning curve', socialmate: 'Clean, intuitive'        },
  { feature: 'Content discovery',         contentstudio: '✅ Built-in',                 socialmate: 'RSS import'              },
  { feature: 'Discord support',           contentstudio: '❌',                           socialmate: '✅'                      },
  { feature: 'Telegram support',          contentstudio: '❌',                           socialmate: '✅'                      },
  { feature: 'Mastodon support',          contentstudio: '❌',                           socialmate: '✅'                      },
  { feature: 'Bluesky support',           contentstudio: '❌',                           socialmate: '✅'                      },
  { feature: 'AI writing tools',          contentstudio: 'AI Writer add-on',            socialmate: '12 tools included'       },
  { feature: 'AI credits free tier',      contentstudio: 'N/A (no free plan)',          socialmate: '75/month free'           },
  { feature: 'Bulk scheduling',           contentstudio: 'Paid plans',                  socialmate: '✅ Free'                 },
  { feature: 'Link in bio',               contentstudio: '❌',                           socialmate: '✅ Free'                 },
  { feature: 'Hashtag manager',           contentstudio: 'Paid plans',                  socialmate: '✅ Free'                 },
  { feature: 'Evergreen recycling',       contentstudio: 'Paid plans',                  socialmate: '✅ Free'                 },
  { feature: 'Competitor tracking',       contentstudio: 'Higher tiers',                socialmate: '✅ Free (3 accounts)'   },
  { feature: 'RSS import',                contentstudio: '✅ Paid plans',               socialmate: '✅ Free'                 },
]

const FAQ = [
  {
    q: 'Does ContentStudio have a free plan?',
    a: 'No. ContentStudio has no free plan. Their Starter plan begins at $25/month for 1 user and 5 social accounts. SocialMate is completely free to start with no credit card required.',
  },
  {
    q: 'Is ContentStudio hard to learn?',
    a: 'ContentStudio is feature-rich but also significantly more complex than most scheduling tools. New users often report a steep learning curve before they feel comfortable with the interface. SocialMate is designed to be intuitive from day one — you can schedule your first post in under five minutes.',
  },
  {
    q: 'Which platforms does SocialMate support that ContentStudio does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky. ContentStudio does not cover any of these platforms. If your audience is on community platforms or decentralized networks, ContentStudio offers no path to reach them.',
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. The free tier includes unlimited posts, 75 AI credits/month, bulk scheduling, link in bio, hashtag manager, competitor tracking, RSS import, and evergreen recycling. No credit card required and no trial countdown.',
  },
]

export default function VsContentStudioPage() {
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
            SocialMate vs ContentStudio
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            ContentStudio has no free plan, starts at $25/month, and has a complex UI that takes time to master. SocialMate is free forever and ready to use in minutes.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">ContentStudio</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Feature-rich but expensive and complex</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Built-in content discovery</li>
              <li>✅ Automation campaigns</li>
              <li>❌ No free plan — $25/month minimum</li>
              <li>❌ Complex UI with steep learning curve</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Best features locked to higher tiers</li>
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
              <li>✅ Clean, intuitive interface</li>
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
              <span>ContentStudio</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.contentstudio}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from ContentStudio</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'No free plan means you pay before knowing if it fits',
                desc: 'ContentStudio offers no free tier — just a 14-day trial. Once it ends, you\'re paying $25/month or losing access. SocialMate has a permanent free plan with no expiry. Use it as long as you need, at no cost.',
              },
              {
                n: '2',
                title: 'ContentStudio\'s UI has a steep learning curve',
                desc: 'ContentStudio packs in a lot of features — content discovery, automation, campaigns, analytics — but the interface can be overwhelming for new users. Many spend hours in the documentation before feeling productive. SocialMate is designed to be self-explanatory.',
              },
              {
                n: '3',
                title: 'SocialMate covers platforms ContentStudio skips entirely',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not supported by ContentStudio. If your audience exists on any of these platforms, ContentStudio can\'t help you. SocialMate covers all four for free.',
              },
              {
                n: '4',
                title: 'Key features are locked to higher ContentStudio tiers',
                desc: 'Bulk scheduling, AI writing, and advanced analytics are available only on more expensive ContentStudio plans. You end up paying more for features that SocialMate includes in its free tier.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Skip the $25/month — start free today</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 12 AI tools, 16 platforms, no complex setup. No credit card required.
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
            <Link href="/vs/socialpilot" className="hover:text-black dark:hover:text-white transition-colors">vs SocialPilot</Link>
            <Link href="/vs/loomly" className="hover:text-black dark:hover:text-white transition-colors">vs Loomly</Link>
            <Link href="/vs/sendible" className="hover:text-black dark:hover:text-white transition-colors">vs Sendible</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
