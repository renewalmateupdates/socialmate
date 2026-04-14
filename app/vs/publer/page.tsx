import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs Publer (2026) — Full Comparison',
  description: 'Publer free plan limits you to 3 accounts and 10 posts per account. SocialMate is unlimited posts, no per-account fees, and 12 AI tools free.',
  openGraph: {
    title:       'SocialMate vs Publer (2026)',
    description: 'Publer caps free users at 3 accounts and 10 scheduled posts each. SocialMate is unlimited, free, with 12 AI tools built in.',
    url:         'https://socialmate.studio/vs/publer',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/publer' },
}

const COMPARISON = [
  { feature: 'Starting price',           publer: '$12/month (Professional)',  socialmate: '$0 — free forever'       },
  { feature: 'Free plan accounts',        publer: '3 social accounts',         socialmate: 'Multiple per platform'   },
  { feature: 'Free plan post limit',      publer: '10 posts per account',      socialmate: 'Unlimited'               },
  { feature: 'Pricing model',             publer: 'Per workspace',             socialmate: 'Flat rate'               },
  { feature: 'Platforms supported',       publer: '12+',                       socialmate: '16 (growing)'            },
  { feature: 'Discord support',           publer: '❌',                         socialmate: '✅'                      },
  { feature: 'Telegram support',          publer: '❌',                         socialmate: '✅'                      },
  { feature: 'Mastodon support',          publer: '❌',                         socialmate: '✅'                      },
  { feature: 'Bluesky support',           publer: '❌',                         socialmate: '✅'                      },
  { feature: 'AI writing tools',          publer: 'AI Assist (paid)',           socialmate: '12 tools included'       },
  { feature: 'Bulk scheduling',           publer: 'Paid plans',                socialmate: '✅ Free'                  },
  { feature: 'RSS import',                publer: 'Paid plans',                socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',       publer: 'Paid plans',                socialmate: '✅ Free'                  },
  { feature: 'Link in bio',               publer: 'Basic (Bio.fm)',             socialmate: '✅ Built in free'         },
  { feature: 'Hashtag manager',           publer: 'Limited free',              socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',       publer: '❌',                         socialmate: '✅ Free (3 accounts)'    },
  { feature: 'Team seats (free)',          publer: '1',                         socialmate: '2'                       },
  { feature: 'Client workspaces',         publer: '$24+/month',                socialmate: 'Pro+: from $5/mo'        },
]

const FAQ = [
  {
    q: 'Does Publer have a usable free plan?',
    a: 'Publer\'s free plan allows 3 social accounts with 10 scheduled posts per account. That\'s 30 total scheduled posts — less than one post per day. For any consistent publishing schedule, you\'ll hit the cap quickly and need to upgrade to $12/month or higher.',
  },
  {
    q: 'How does SocialMate compare to Publer for AI tools?',
    a: 'Publer includes AI Assist on paid plans. SocialMate includes 12 AI tools on the free tier: caption generation, hashtag research, viral hook writing, content repurposing, thread generation, post scoring, trend scanning, and more.',
  },
  {
    q: 'What platforms does SocialMate have that Publer does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky. Publer does not support any of these. If your community is on decentralized or messaging platforms, SocialMate is the only scheduling tool that covers them.',
  },
  {
    q: 'Can I import RSS feeds on SocialMate for free?',
    a: 'Yes. RSS import is available on SocialMate\'s free tier. On Publer, RSS feed automation is locked to paid plans. If you want to auto-share blog posts or podcast episodes, SocialMate handles it without upgrading.',
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

export default function VsPublerPage() {
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
            SocialMate vs Publer
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Publer's free tier caps at 10 posts per account. SocialMate is unlimited — with 12 AI tools and no credit card needed.
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

        {/* VERDICT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Publer</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Clean UI, tight free tier</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Clean scheduling calendar</li>
              <li>✅ Good for Instagram + Facebook</li>
              <li>❌ 10 posts/account cap on free plan</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ AI tools require paid plan</li>
              <li>❌ RSS import requires paid plan</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Unlimited. 12 AI tools. Free.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Unlimited scheduled posts</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ RSS import free</li>
              <li>✅ Bulk scheduling free</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Feature comparison</h2>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span>Feature</span>
              <span>Publer</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.publer}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why teams switch from Publer</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '10 posts per account is not a real free plan',
                desc: 'Publer\'s free tier gives you 10 scheduled posts per account. If you manage 3 accounts, that\'s 30 total posts in your queue at any time. For a weekly posting schedule across platforms, you\'ll burn through that in 2–3 weeks. SocialMate has no queue limits.',
              },
              {
                n: '2',
                title: 'The communities are on Discord and Telegram now',
                desc: 'A growing slice of engaged audiences lives on Discord servers and Telegram channels. Publer does not support either. SocialMate does — alongside Mastodon and Bluesky — so you can reach your whole audience from one tool.',
              },
              {
                n: '3',
                title: 'AI tools should not be a paid upgrade',
                desc: 'Publer\'s AI Assist is locked to paid plans. SocialMate includes 12 AI tools on the free tier — caption generation, hashtag research, post scoring, trend scanning, content repurposing, and more. You should not have to pay extra to write better content.',
              },
              {
                n: '4',
                title: 'RSS import, bulk scheduling, and evergreen recycling — all free',
                desc: 'Publer locks these to paid plans. SocialMate includes all three at zero cost. Build your content pipeline once and let it run without a monthly bill.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Ready to stop counting posts?</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            Unlimited posts, 12 AI tools, 16 platforms. SocialMate is free forever — no credit card required.
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
