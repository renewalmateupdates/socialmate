import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Crowdfire (2026) — Full Comparison',
  description: 'Crowdfire free plan allows only 1 social account and 10 scheduled posts per month. Plus plan is $7.48/month and still very limited. No Discord/Telegram/Mastodon support. SocialMate is free forever.',
  openGraph: {
    title:       'SocialMate vs Crowdfire (2026)',
    description: 'Crowdfire free plan caps at 10 posts/month across 1 account. SocialMate is free forever with unlimited posts, 16 platforms, and 12 AI tools.',
    url:         'https://socialmate.studio/vs/crowdfire',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/crowdfire' },
}

const COMPARISON = [
  { feature: 'Starting price',              crowdfire: '$0 (very limited) / $7.48 Plus', socialmate: '$0 — free forever'        },
  { feature: 'Free plan post limit',        crowdfire: '10 posts/month hard cap',         socialmate: 'Unlimited posts'          },
  { feature: 'Free plan accounts',          crowdfire: '1 social account only',           socialmate: 'Multiple accounts'        },
  { feature: 'Scheduled posts (free)',       crowdfire: '10/month maximum',               socialmate: 'Unlimited'                },
  { feature: 'Content curation',            crowdfire: '✅ (free tier)',                  socialmate: 'RSS import (free)'        },
  { feature: 'Analytics (free)',            crowdfire: '❌ Locked to paid',              socialmate: '✅ Free (30 days)'        },
  { feature: 'Discord support',             crowdfire: '❌',                              socialmate: '✅'                       },
  { feature: 'Telegram support',            crowdfire: '❌',                              socialmate: '✅'                       },
  { feature: 'Mastodon support',            crowdfire: '❌',                              socialmate: '✅'                       },
  { feature: 'Bluesky support',             crowdfire: '❌',                              socialmate: '✅'                       },
  { feature: 'AI writing tools',            crowdfire: '❌',                              socialmate: '12 tools included'        },
  { feature: 'AI credits free tier',        crowdfire: 'None',                           socialmate: '75/month free'            },
  { feature: 'Bulk scheduling',             crowdfire: '❌',                              socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                 crowdfire: '❌',                              socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',             crowdfire: 'Basic (paid)',                   socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',         crowdfire: '❌',                              socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',         crowdfire: '❌',                              socialmate: '✅ Free (3 accounts)'     },
  { feature: 'Team seats (free)',           crowdfire: '1 (solo only)',                  socialmate: '2 seats free'             },
  { feature: 'RSS import',                  crowdfire: '❌',                              socialmate: '✅ Free'                  },
]

const FAQ = [
  {
    q: 'What does Crowdfire\'s free plan actually include?',
    a: 'Crowdfire\'s free plan allows you to connect 1 social account and schedule up to 10 posts per month. That is the hard limit — once you hit 10 posts, you cannot schedule anything else until the next month. Analytics are locked to paid plans. For most people posting more than twice a week, the free plan is not usable.',
  },
  {
    q: 'Is Crowdfire\'s Plus plan ($7.48/month) worth it?',
    a: 'Crowdfire\'s Plus plan increases the account limit to 2 and raises the post cap, but still comes with restrictions that the base paid plan of most competitors does not have. You also get analytics on Plus, which are not available at all on the free tier. Whether it is worth it depends on whether Crowdfire\'s specific feature set matches your workflow. For most users, SocialMate\'s free plan covers more ground for $0.',
  },
  {
    q: 'Does Crowdfire support Discord, Telegram, or Mastodon?',
    a: 'No. Crowdfire does not support Discord, Telegram, or Mastodon. It also does not support Bluesky. Crowdfire is focused on mainstream social platforms like Instagram, Twitter/X, Facebook, and LinkedIn. SocialMate supports Discord, Telegram, Mastodon, and Bluesky on the free plan.',
  },
  {
    q: 'What is Crowdfire\'s content curation feature?',
    a: 'Crowdfire has a content curation feature that suggests articles and images to share based on topics you follow. It\'s one of its more distinctive features and can be useful for finding content to share. SocialMate handles content importing through RSS feeds, which you control directly rather than having content suggested to you.',
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

export default function VsCrowdfirePage() {
  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-950">
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
            SocialMate vs Crowdfire
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Crowdfire free plan caps at 10 posts/month across 1 account. SocialMate is free forever with unlimited posts and no account cap.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Crowdfire</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">10-post free plan cap</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Content curation feature</li>
              <li>✅ Affordable entry price ($7.48/month Plus)</li>
              <li>❌ Free plan: 1 account, 10 posts/month hard cap</li>
              <li>❌ Analytics locked to paid plans</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ No AI writing tools</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Unlimited posts. 16 platforms. $0.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Free forever — no post cap</li>
              <li>✅ Analytics included free (30 days)</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
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
              <span>Crowdfire</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.crowdfire}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from Crowdfire</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '10 posts per month is not enough for anyone posting regularly',
                desc: 'If you post once a day, Crowdfire\'s free plan runs out in 10 days. If you post three times a week, you hit the wall by day 25. The hard cap forces you to either pay or stop scheduling — that is not a free plan, it is a trial with a monthly reset. SocialMate\'s free plan has no post cap, so you can post as much as your strategy calls for.',
              },
              {
                n: '2',
                title: 'One social account on the free plan is not a real workflow',
                desc: 'Managing one account is fine if you are just starting out, but most creators and businesses operate across two or more platforms. Crowdfire\'s free plan locks you to a single account, which means you are already at the ceiling before you have set up your full presence. SocialMate allows multiple accounts on the free tier.',
              },
              {
                n: '3',
                title: 'Analytics locked behind a paywall means flying blind on the free plan',
                desc: 'Knowing what is working is as important as posting in the first place. Crowdfire locks all analytics to paid plans — on the free tier, you have no visibility into engagement, reach, or performance. SocialMate includes 30 days of analytics on the free plan so you can see what is landing without paying for the privilege.',
              },
              {
                n: '4',
                title: 'SocialMate covers community and decentralized platforms Crowdfire skips',
                desc: 'Crowdfire does not support Discord, Telegram, Mastodon, or Bluesky. If your audience or community lives on any of these platforms, Crowdfire cannot reach them. SocialMate supports all four on the free plan — community servers, messaging channels, the fediverse, and the growing Bluesky network are all covered.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">No 10-post cap here — start free today</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — unlimited posts, bulk scheduling, 12 AI tools, analytics included, 16 platforms. No credit card required.
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
            <Link href="/vs/hootsuite" className="hover:text-black dark:hover:text-white transition-colors">vs Hootsuite</Link>
            <Link href="/vs/metricool" className="hover:text-black dark:hover:text-white transition-colors">vs Metricool</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
