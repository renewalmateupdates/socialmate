import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs Loomly (2026) — Full Comparison',
  description: 'Loomly has no free plan and starts at $32/month. SocialMate is free forever with bulk scheduling, Discord/Bluesky/Telegram/Mastodon, and 12 AI tools included.',
  openGraph: {
    title:       'SocialMate vs Loomly (2026)',
    description: 'Loomly charges $32/month with no free plan and per-workspace pricing. SocialMate is free forever — no credit card, no per-brand fees.',
    url:         'https://socialmate.studio/vs/loomly',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/loomly' },
}

const COMPARISON = [
  { feature: 'Starting price',            loomly: '$32/month (Base)',           socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 loomly: '❌ None',                     socialmate: '✅ Free forever'         },
  { feature: 'Users on starting plan',    loomly: '2 users',                    socialmate: '2 users free'            },
  { feature: 'Social accounts (starter)', loomly: '10 accounts',                socialmate: 'No hard cap (free tier)' },
  { feature: 'Pricing model',             loomly: 'Per workspace (base)',       socialmate: 'Flat rate'               },
  { feature: 'Multi-brand cost',          loomly: 'Extra per workspace',        socialmate: 'Included free'           },
  { feature: 'Discord support',           loomly: '❌',                          socialmate: '✅'                      },
  { feature: 'Telegram support',          loomly: '❌',                          socialmate: '✅'                      },
  { feature: 'Mastodon support',          loomly: '❌',                          socialmate: '✅'                      },
  { feature: 'Bluesky support',           loomly: '❌',                          socialmate: '✅'                      },
  { feature: 'AI writing tools',          loomly: 'Basic AI assist',            socialmate: '12 tools included'       },
  { feature: 'AI credits free tier',      loomly: 'N/A (no free plan)',         socialmate: '75/month free'            },
  { feature: 'Bulk scheduling',           loomly: 'Paid plans',                 socialmate: '✅ Free'                  },
  { feature: 'Link in bio',               loomly: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',           loomly: 'Paid plans',                 socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',       loomly: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',       loomly: 'Higher tiers',               socialmate: '✅ Free (3 accounts)'    },
  { feature: 'RSS import',                loomly: 'Paid plans',                 socialmate: '✅ Free'                  },
  { feature: 'Content approval workflows', loomly: '✅ Strong',                 socialmate: '✅ Free'                  },
]

const FAQ = [
  {
    q: 'Does Loomly have a free plan?',
    a: 'No. Loomly has no free plan of any kind. Their cheapest option is the Base plan at $32/month, which supports 2 users and 10 social accounts. SocialMate is completely free to start with no credit card required.',
  },
  {
    q: 'Why does Loomly get expensive for multiple brands?',
    a: 'Loomly charges per "base" — their term for a workspace. Each brand or client you manage requires its own base, and costs stack quickly. SocialMate uses flat-rate pricing with no per-workspace fees, so managing multiple brands does not multiply your bill.',
  },
  {
    q: 'Which platforms does SocialMate support that Loomly does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which Loomly covers. If your audience is on decentralized or community-first platforms, Loomly is not an option.',
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. The free tier includes unlimited posts, 75 AI credits/month, bulk scheduling, link in bio, hashtag manager, competitor tracking, RSS import, and evergreen recycling. No credit card required and no trial countdown.',
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

export default function VsLoomlyPage() {
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
            SocialMate vs Loomly
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Loomly has no free plan and charges per workspace — costs multiply fast. SocialMate is free forever with no per-brand fees.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Loomly</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Good for approvals, costly for growth</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Strong content approval workflows</li>
              <li>✅ Clean calendar UI</li>
              <li>❌ No free plan — $32/month minimum</li>
              <li>❌ Per-workspace pricing inflates multi-brand costs</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Bulk scheduling locked to paid plans</li>
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
              <li>✅ No per-workspace fees</li>
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
              <span>Loomly</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.loomly}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from Loomly</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'No free plan means you pay before you know if it fits',
                desc: 'Loomly offers no free tier — just a 15-day trial. Once it ends, you are paying $32/month or starting over. SocialMate has a permanent free plan with no trial expiry, so you can evaluate it at your own pace without spending a cent.',
              },
              {
                n: '2',
                title: 'Per-workspace pricing punishes multi-brand users',
                desc: 'Loomly\'s "base" model means each additional brand or client workspace adds to your bill. If you manage three brands, you are paying for three bases. SocialMate\'s flat-rate pricing covers all your workspaces without multiplication.',
              },
              {
                n: '3',
                title: 'Approval workflows are great — but not everyone needs them',
                desc: 'Loomly\'s standout feature is content approval, which is valuable for agencies with client sign-off requirements. Solo creators and small teams pay for that complexity whether they use it or not. SocialMate gives you approvals without the price premium.',
              },
              {
                n: '4',
                title: 'SocialMate covers the platforms Loomly skips',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not supported by Loomly. If any part of your audience is on these platforms — community servers, group chats, the fediverse, or the Bluesky timeline — Loomly is not an option. SocialMate covers all of them, free.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Skip the $32/month — start free today</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 12 AI tools, 16 platforms, no per-workspace fees. No credit card required.
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
