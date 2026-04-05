import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Nuelink (2026) — Full Comparison',
  description: 'Nuelink starts at $15/month with a clean UI but no free plan at all. SocialMate is free forever with bulk scheduling, AI tools, and Discord/Bluesky/Telegram/Mastodon included.',
  openGraph: {
    title:       'SocialMate vs Nuelink (2026)',
    description: 'Nuelink has a clean interface but zero free plan. SocialMate gives you the same core scheduling features plus AI tools for $0.',
    url:         'https://socialmate.studio/vs/nuelink',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/nuelink' },
}

const COMPARISON = [
  { feature: 'Starting price',            nuelink: '$15/month (Individual)',      socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 nuelink: '❌ None',                     socialmate: '✅ Free forever'         },
  { feature: 'Free trial',                nuelink: '7-day trial only',            socialmate: 'Free forever, no trial'  },
  { feature: 'Social accounts (starter)', nuelink: '5 channels',                  socialmate: 'No hard cap (free tier)' },
  { feature: 'Bulk scheduling',           nuelink: '✅ All plans',                socialmate: '✅ Free'                 },
  { feature: 'Discord support',           nuelink: '❌',                          socialmate: '✅'                      },
  { feature: 'Telegram support',          nuelink: '❌',                          socialmate: '✅'                      },
  { feature: 'Mastodon support',          nuelink: '❌',                          socialmate: '✅'                      },
  { feature: 'Bluesky support',           nuelink: '❌',                          socialmate: '✅'                      },
  { feature: 'AI writing tools',          nuelink: 'Basic AI captions',           socialmate: '12 tools included'       },
  { feature: 'AI credits free tier',      nuelink: 'N/A (no free plan)',          socialmate: '75/month free'           },
  { feature: 'Link in bio',               nuelink: '❌',                          socialmate: '✅ Free'                 },
  { feature: 'Hashtag manager',           nuelink: 'Paid plans',                  socialmate: '✅ Free'                 },
  { feature: 'Evergreen recycling',       nuelink: '✅ Paid plans',               socialmate: '✅ Free'                 },
  { feature: 'Competitor tracking',       nuelink: '❌',                          socialmate: '✅ Free (3 accounts)'   },
  { feature: 'RSS import',                nuelink: '✅ All plans',                socialmate: '✅ Free'                 },
  { feature: 'Analytics',                 nuelink: 'Limited on starter',          socialmate: '✅ Free'                 },
  { feature: 'Team collaboration',        nuelink: 'Higher tiers',                socialmate: '✅ Free (2 seats)'      },
]

const FAQ = [
  {
    q: 'Does Nuelink have a free plan?',
    a: 'No. Nuelink offers only a 7-day free trial — one of the shortest in the industry. After the trial, you pay $15/month or lose access. SocialMate is completely free to start with no credit card and no expiry date.',
  },
  {
    q: 'What makes Nuelink stand out?',
    a: 'Nuelink has a genuinely clean and minimal interface, and includes bulk scheduling and RSS import on all plans. These are useful features. SocialMate offers the same scheduling capabilities along with a much deeper AI toolkit — all for free.',
  },
  {
    q: 'Which platforms does SocialMate support that Nuelink does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which Nuelink covers. If your audience includes community or decentralized platforms, Nuelink cannot help.',
  },
  {
    q: 'Is SocialMate a good Nuelink alternative for solo creators?',
    a: 'Yes. SocialMate gives you bulk scheduling, RSS import, 12 AI tools, competitor tracking, link in bio, evergreen recycling, and team collaboration — all on the free plan. Nuelink charges $15/month with only a 7-day trial.',
  },
]

export default function VsNuelinkPage() {
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
            SocialMate vs Nuelink
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Nuelink has a clean UI and no free plan — just a 7-day trial before you pay $15/month. SocialMate is free forever with more features at $0.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Nuelink</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Clean UI — but no free plan</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Clean, minimal interface</li>
              <li>✅ Bulk scheduling and RSS on all plans</li>
              <li>❌ No free plan — 7-day trial only</li>
              <li>❌ $15/month minimum</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Limited AI tools</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">More features. All platforms. $0.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Free forever — no trial countdown</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Bulk scheduling and RSS free</li>
              <li>✅ Competitor tracking and analytics free</li>
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
              <span>Nuelink</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.nuelink}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people choose SocialMate over Nuelink</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'A 7-day trial is barely enough to learn the tool',
                desc: 'Nuelink gives you 7 days to evaluate before you start paying. Building real posting habits and testing your actual workflow in a week is difficult. SocialMate gives you unlimited time on the free plan to decide if it fits your needs.',
              },
              {
                n: '2',
                title: '12 AI tools vs basic AI captions',
                desc: "Nuelink includes basic AI caption generation. SocialMate includes 12 AI-powered tools — caption generation, hashtag research, competitor analysis, content gap analysis, trend scanning, best-time suggestions, evergreen recycling suggestions, and more — all on the free plan.",
              },
              {
                n: '3',
                title: 'Competitor tracking and analytics free vs locked',
                desc: 'Nuelink limits analytics on the starter plan and does not include competitor tracking at all. SocialMate includes both — analytics and competitor tracking for 3 accounts — free. Understanding performance should not require an upgrade.',
              },
              {
                n: '4',
                title: 'SocialMate covers platforms Nuelink does not',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not supported by Nuelink. SocialMate covers all four on the free plan — because your audience is not all on Instagram and LinkedIn.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Skip the $15/month — start free today</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 12 AI tools, 16 platforms, competitor tracking. No credit card required.
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
            <Link href="/vs/socialbee" className="hover:text-black dark:hover:text-white transition-colors">vs SocialBee</Link>
            <Link href="/vs/fedica" className="hover:text-black dark:hover:text-white transition-colors">vs Fedica</Link>
            <Link href="/vs/statusbrew" className="hover:text-black dark:hover:text-white transition-colors">vs Statusbrew</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
