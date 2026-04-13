import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Iconosquare (2026) — Full Comparison',
  description: 'Iconosquare starts at $49/month and is an analytics tool, not a scheduler. No free plan, no Discord/Telegram/Mastodon/Bluesky. SocialMate is free forever with 12 AI tools and real scheduling.',
  openGraph: {
    title:       'SocialMate vs Iconosquare (2026)',
    description: 'Iconosquare is an analytics-first platform starting at $49/month with no free plan. SocialMate is free forever with built-in scheduling, AI tools, and 16 platforms.',
    url:         'https://socialmate.studio/vs/iconosquare',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/iconosquare' },
}

const COMPARISON = [
  { feature: 'Starting price',              iconosquare: '$49/month (Solo plan)',         socialmate: '$0 — free forever'        },
  { feature: 'Free plan',                   iconosquare: '❌ None',                        socialmate: '✅ Free forever'          },
  { feature: 'Primary purpose',             iconosquare: 'Analytics & reporting',         socialmate: 'Scheduling + analytics'   },
  { feature: 'Scheduling included',         iconosquare: 'Limited (add-on focus)',        socialmate: '✅ Core feature'          },
  { feature: 'Instagram support',           iconosquare: '✅ Primary platform',           socialmate: '✅ (approval pending)'    },
  { feature: 'Facebook support',            iconosquare: '✅',                             socialmate: '✅ (approval pending)'    },
  { feature: 'TikTok support',              iconosquare: '✅',                             socialmate: '✅ (approval pending)'    },
  { feature: 'Discord support',             iconosquare: '❌',                             socialmate: '✅'                       },
  { feature: 'Telegram support',            iconosquare: '❌',                             socialmate: '✅'                       },
  { feature: 'Mastodon support',            iconosquare: '❌',                             socialmate: '✅'                       },
  { feature: 'Bluesky support',             iconosquare: '❌',                             socialmate: '✅'                       },
  { feature: 'AI writing tools',            iconosquare: '❌',                             socialmate: '12 tools included'        },
  { feature: 'AI credits free tier',        iconosquare: 'N/A (no free plan)',            socialmate: '75/month free'            },
  { feature: 'Bulk scheduling',             iconosquare: '❌',                             socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                 iconosquare: '❌',                             socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',             iconosquare: 'Basic (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',         iconosquare: '❌',                             socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',         iconosquare: '✅ Deep analytics (paid)',      socialmate: '✅ Free (3 accounts)'     },
  { feature: 'RSS import',                  iconosquare: '❌',                             socialmate: '✅ Free'                  },
  { feature: 'Heavy reporting features',    iconosquare: '✅ Extensive',                  socialmate: 'Core analytics free'      },
]

const FAQ = [
  {
    q: 'Is Iconosquare a social media scheduler?',
    a: 'Not primarily. Iconosquare is an analytics-first platform. It does include some scheduling features, but its core offering is deep Instagram and Facebook reporting. If you need to actually schedule posts across multiple platforms, Iconosquare is not built for that. SocialMate covers both scheduling and analytics with no monthly fee.',
  },
  {
    q: 'Does Iconosquare have a free plan?',
    a: 'No. Iconosquare has no free plan of any kind. Their cheapest option is the Solo plan at $49/month. SocialMate is completely free to start — no credit card required, no trial countdown.',
  },
  {
    q: 'Which platforms does SocialMate support that Iconosquare does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which Iconosquare covers. Iconosquare is focused on Instagram, Facebook, and TikTok analytics. If your audience is on any other platform, Iconosquare cannot help you.',
  },
  {
    q: 'Who is Iconosquare actually built for?',
    a: 'Iconosquare is built for brands and agencies that need deep Instagram/Facebook analytics and can justify $49/month or more for reporting features. If you\'re a creator, small business, or anyone who needs multi-platform scheduling with AI tools, SocialMate is a better fit and costs nothing to start.',
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

export default function VsIconosquarePage() {
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
            SocialMate vs Iconosquare
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Iconosquare is an analytics tool that starts at $49/month with no free plan. SocialMate is a real scheduler with analytics — free forever.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Iconosquare</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Analytics-first, not a scheduler</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Deep Instagram/Facebook analytics</li>
              <li>✅ Competitor benchmarking reports</li>
              <li>❌ No free plan — $49/month minimum</li>
              <li>❌ Not built primarily for scheduling</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ No AI writing tools</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Schedule + analytics. $0.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Free forever — no trial countdown</li>
              <li>✅ Real scheduling across 16 platforms</li>
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
              <span>Iconosquare</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.iconosquare}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from Iconosquare</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'You need a scheduler, not just an analytics platform',
                desc: 'Iconosquare is built around reporting — follower growth, post performance, audience demographics. Those are useful features, but they are not a scheduling tool. If your primary need is to plan and publish content consistently across multiple platforms, Iconosquare is the wrong tool for the job. SocialMate is a full scheduler with analytics built in.',
              },
              {
                n: '2',
                title: '$49/month with no free plan is hard to justify for smaller teams',
                desc: 'Iconosquare\'s Solo plan starts at $49/month — before you can even evaluate whether the depth of analytics justifies that price. There is no free tier to test it against your workflow. SocialMate is free forever, no credit card required, so you can test everything before deciding whether to upgrade.',
              },
              {
                n: '3',
                title: 'Most creators never use the heavy reporting features',
                desc: 'Iconosquare\'s detailed reporting suite is valuable for enterprise marketing teams and agencies managing large brand accounts. But most creators and small businesses don\'t need audience demographic exports and executive-level dashboards. You pay for features you never open. SocialMate gives you the analytics that actually matter at no cost.',
              },
              {
                n: '4',
                title: 'SocialMate covers platforms Iconosquare ignores entirely',
                desc: 'Iconosquare is built around Instagram, Facebook, and TikTok. Discord, Telegram, Mastodon, and Bluesky are not on the roadmap. If any part of your audience is on these platforms — community servers, decentralized social, or the growing Bluesky network — Iconosquare offers nothing. SocialMate covers all of them, free.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Skip the $49/month analytics bill — start free today</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 12 AI tools, 16 platforms, analytics included. No credit card required.
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
            <Link href="/vs/later" className="hover:text-black dark:hover:text-white transition-colors">vs Later</Link>
            <Link href="/vs/sprout-social" className="hover:text-black dark:hover:text-white transition-colors">vs Sprout Social</Link>
            <Link href="/vs/hootsuite" className="hover:text-black dark:hover:text-white transition-colors">vs Hootsuite</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
