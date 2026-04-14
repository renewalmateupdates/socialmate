import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs Metricool (2026) — Full Comparison',
  description: 'Metricool free tier caps at 50 scheduled posts per month. SocialMate has no post limits, no per-brand fees, and 12 AI tools included free.',
  openGraph: {
    title:       'SocialMate vs Metricool (2026)',
    description: 'Metricool limits free users to 50 posts/month and 1 brand. SocialMate is unlimited posts, unlimited scheduling, free forever.',
    url:         'https://socialmate.studio/vs/metricool',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/metricool' },
}

const COMPARISON = [
  { feature: 'Starting price',          metricool: '$22/month (Starter)',    socialmate: '$0 — free forever'       },
  { feature: 'Free plan post limit',    metricool: '50 posts/month',         socialmate: 'Unlimited'               },
  { feature: 'Free plan brands',        metricool: '1 brand',                socialmate: 'Multiple workspaces'     },
  { feature: 'Pricing model',           metricool: 'Per brand',              socialmate: 'Flat rate'               },
  { feature: 'Platforms supported',     metricool: '12+',                    socialmate: '16 (growing)'            },
  { feature: 'Discord support',         metricool: '❌',                      socialmate: '✅'                      },
  { feature: 'Telegram support',        metricool: '❌',                      socialmate: '✅'                      },
  { feature: 'Mastodon support',        metricool: '❌',                      socialmate: '✅'                      },
  { feature: 'Bluesky support',         metricool: '❌',                      socialmate: '✅'                      },
  { feature: 'AI writing tools',        metricool: 'Basic AI captions',      socialmate: '12 tools included'       },
  { feature: 'AI credits free tier',    metricool: 'Limited',                socialmate: '75/month free'            },
  { feature: 'Bulk scheduling',         metricool: 'Paid plans',             socialmate: '✅ Free'                  },
  { feature: 'Link in bio',             metricool: 'Paid plans only',        socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',         metricool: 'Paid plans',             socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',     metricool: 'Paid plans',             socialmate: '✅ Free (3 accounts)'    },
  { feature: 'RSS import',              metricool: 'Paid plans',             socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',     metricool: '❌',                      socialmate: '✅ Free'                  },
  { feature: 'Team seats (free)',        metricool: '1',                      socialmate: '2'                       },
  { feature: 'Client workspaces',       metricool: 'Agency plan ($83+/mo)', socialmate: 'Pro+: from $5/mo'        },
]

const FAQ = [
  {
    q: 'Does Metricool have a real free plan?',
    a: 'Metricool has a free tier but it caps at 50 scheduled posts per month and 1 brand. If you post daily across multiple platforms, you will hit that cap fast. SocialMate has no post limits on the free tier.',
  },
  {
    q: 'Does SocialMate have analytics like Metricool?',
    a: 'SocialMate has a built-in analytics dashboard tracking likes, replies, and reposts per platform. Metricool has deeper analytics, particularly for Instagram and TikTok. If deep Instagram analytics is your primary need, Metricool is strong there. If you want a full scheduling + AI suite without post limits, SocialMate is the better fit.',
  },
  {
    q: 'Which platforms does SocialMate support that Metricool does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — all platforms Metricool does not cover. If your audience is on decentralized or community platforms, SocialMate is the only option.',
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. Free tier includes unlimited posts, 75 AI credits/month, bulk scheduling, link in bio, hashtag manager, competitor tracking, RSS import, and evergreen recycling. No credit card required.',
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

export default function VsMetricoolPage() {
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
            SocialMate vs Metricool
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Metricool's free plan caps at 50 posts per month. SocialMate has no limits — and includes 12 AI tools at zero cost.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Metricool</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Strong analytics, limited free tier</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Deep Instagram &amp; TikTok analytics</li>
              <li>✅ Good calendar UI</li>
              <li>❌ 50 post/month cap on free plan</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Bulk scheduling locked to paid plans</li>
              <li>❌ AI tools limited on free</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Unlimited posts. 12 AI tools. $0.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Unlimited posts, no cap</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Bulk scheduling free</li>
              <li>✅ Competitor tracking free</li>
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
              <span>Metricool</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.metricool}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why teams switch from Metricool</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'The 50-post cap hits fast',
                desc: 'If you post once a day across just 2 platforms, you hit Metricool\'s free tier limit in 25 days. Then you\'re either paying $22/month or throttling your output. SocialMate has no post limits on any plan, including free.',
              },
              {
                n: '2',
                title: 'SocialMate covers platforms Metricool ignores',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are where some of the fastest-growing communities live. Metricool does not support any of them. If your audience is there, Metricool is not an option.',
              },
              {
                n: '3',
                title: '12 AI tools vs a basic AI assistant',
                desc: 'SocialMate includes caption generation, hashtag research, viral hook writing, content repurposing, thread generation, post scoring, trend scanning, competitor intelligence, and more — all on the free tier.',
              },
              {
                n: '4',
                title: 'Bulk scheduling and RSS import are not paid features here',
                desc: 'Metricool locks bulk scheduling and RSS import to paid plans. On SocialMate, both are free. Upload a month of content at once and auto-pull from any RSS feed without paying a cent.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Done hitting the 50-post cap?</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is unlimited posts, 12 AI tools, 16 platforms — completely free to start. No credit card required.
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
