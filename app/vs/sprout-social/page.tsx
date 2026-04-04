import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Sprout Social (2026) — Full Comparison',
  description: 'Sprout Social starts at $249/month for just 5 social profiles with no free plan. SocialMate is free forever — bulk scheduling, 12 AI tools, and 16 platforms included at $0.',
  openGraph: {
    title:       'SocialMate vs Sprout Social (2026)',
    description: 'Sprout Social costs $249/mo for 5 profiles and zero free plan. SocialMate is free forever — no credit card, no profile cap, bulk scheduling included.',
    url:         'https://socialmate.studio/vs/sprout-social',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/sprout-social' },
}

const COMPARISON = [
  { feature: 'Starting price',          sprout: '$249/month (Standard)',      socialmate: '$0 — free forever'       },
  { feature: 'Free plan',               sprout: '❌ None',                     socialmate: '✅ Free forever'         },
  { feature: 'Profiles on base plan',   sprout: '5 profiles',                 socialmate: 'No hard cap (free tier)' },
  { feature: 'Users on base plan',      sprout: '1 user',                     socialmate: '2 users free'            },
  { feature: 'Pricing model',           sprout: 'Per user + per profile',     socialmate: 'Flat rate'               },
  { feature: 'Additional profiles',     sprout: '$25/profile/month extra',    socialmate: 'Included'                },
  { feature: 'Discord support',         sprout: '❌',                          socialmate: '✅'                      },
  { feature: 'Telegram support',        sprout: '❌',                          socialmate: '✅'                      },
  { feature: 'Mastodon support',        sprout: '❌',                          socialmate: '✅'                      },
  { feature: 'Bluesky support',         sprout: '❌',                          socialmate: '✅'                      },
  { feature: 'AI writing tools',        sprout: 'AI Assist (paid add-on)',    socialmate: '12 tools included'       },
  { feature: 'AI credits free tier',    sprout: 'N/A (no free plan)',         socialmate: '75/month free'            },
  { feature: 'Bulk scheduling',         sprout: '✅ Paid plans',               socialmate: '✅ Free'                  },
  { feature: 'Link in bio',             sprout: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',         sprout: '✅ Paid plans',               socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',     sprout: 'Advanced ($499+/mo)',        socialmate: '✅ Free (3 accounts)'    },
  { feature: 'RSS import',              sprout: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Client workspaces',       sprout: 'Agency plan required',       socialmate: 'Pro+: from $5/mo'        },
]

const FAQ = [
  {
    q: 'Why does Sprout Social cost so much?',
    a: 'Sprout Social is built for enterprise marketing teams with large budgets and dedicated social media departments. Their Standard plan starts at $249/month for a single user and just 5 profiles. Each additional profile costs $25/month on top of that. For small creators, solo users, or lean teams, the pricing is impossible to justify. SocialMate has no starting cost — the free plan is permanent.',
  },
  {
    q: 'Does Sprout Social have a free plan or trial?',
    a: 'Sprout Social offers a 30-day free trial, but there is no ongoing free plan. Once the trial ends, you pay $249/month or lose access. SocialMate is free forever with no trial countdown — you never get locked out.',
  },
  {
    q: 'Which platforms does SocialMate support that Sprout Social does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which Sprout Social covers. If your audience is on community or decentralized platforms, Sprout Social is not a viable option regardless of budget.',
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. The free tier includes unlimited posts, 75 AI credits per month, bulk scheduling, link in bio, hashtag manager, competitor tracking (3 accounts), RSS import, and evergreen recycling. No credit card required and no trial countdown.',
  },
]

export default function VsSproutSocialPage() {
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
            SocialMate vs Sprout Social
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Sprout Social starts at $249/month for 5 profiles — no free plan, no mercy. SocialMate is free forever with no credit card required.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Sprout Social</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Enterprise tool with enterprise pricing</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Deep reporting and analytics suite</li>
              <li>✅ Strong inbox and engagement tools</li>
              <li>❌ $249/month for just 5 profiles</li>
              <li>❌ No free plan whatsoever</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Built for large teams, not solo creators</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Enterprise features. Zero dollars.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Free forever — no trial countdown</li>
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
              <span>Sprout Social</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.sprout}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from Sprout Social</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '$249/month is a full marketing budget, not a line item',
                desc: 'Sprout Social\'s Standard plan costs $2,988 per year for a single user with just 5 social profiles. That\'s more than most small brands spend on their entire content operation. SocialMate gives you the same scheduling, AI, and analytics capabilities starting at $0.',
              },
              {
                n: '2',
                title: 'The "affordable" plan still locks out most features',
                desc: 'Even at $249/month, competitor analytics, premium reporting, and AI tools are either paywalled at a higher tier or sold as add-ons. You end up paying enterprise prices to discover you need to upgrade again. SocialMate puts 12 AI tools and competitor tracking on the free plan.',
              },
              {
                n: '3',
                title: 'Sprout Social ignores the platforms your audience actually uses',
                desc: 'Discord communities, Telegram channels, Mastodon users, and Bluesky early adopters are not reachable through Sprout Social. SocialMate supports all four — plus every major platform — from the free tier.',
              },
              {
                n: '4',
                title: 'No free plan means no risk-free evaluation',
                desc: 'Sprout Social\'s 30-day trial ends and you either commit $249/month or walk. There is no middle ground. SocialMate has no expiring trial — start free, use it indefinitely, upgrade only when you want to.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Why pay $249/mo when $0 works?</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 12 AI tools, 16 platforms, no credit card required.
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
            <Link href="/vs/sendible" className="hover:text-black dark:hover:text-white transition-colors">vs Sendible</Link>
            <Link href="/vs/socialpilot" className="hover:text-black dark:hover:text-white transition-colors">vs SocialPilot</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
