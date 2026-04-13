import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Zoho Social (2026) — Full Comparison',
  description: 'Zoho Social has no free plan and starts at $15/month — and is built for teams already inside the Zoho ecosystem. SocialMate is free forever with 16 platforms, 12 AI tools, Discord, Telegram, Mastodon, Bluesky, and no CRM dependency.',
  openGraph: {
    title:       'SocialMate vs Zoho Social (2026)',
    description: 'Zoho Social is a Zoho ecosystem add-on with no free plan. SocialMate is free forever — no Zoho required, no trial countdown, 16 platforms included.',
    url:         'https://socialmate.studio/vs/zoho-social',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/zoho-social' },
}

const COMPARISON = [
  { feature: 'Starting price',              zoho: '$15/month (Standard)',       socialmate: '$0 — free forever'        },
  { feature: 'Free plan',                   zoho: '❌ Trial only (15 days)',     socialmate: '✅ Free forever'          },
  { feature: 'Professional plan',           zoho: '$40/month',                  socialmate: 'Pro from $12/month'       },
  { feature: 'Platforms supported',         zoho: '9',                          socialmate: '16 (growing)'             },
  { feature: 'Discord support',             zoho: '❌',                          socialmate: '✅'                       },
  { feature: 'Telegram support',            zoho: '❌',                          socialmate: '✅'                       },
  { feature: 'Mastodon support',            zoho: '❌',                          socialmate: '✅'                       },
  { feature: 'Bluesky support',             zoho: '❌',                          socialmate: '✅'                       },
  { feature: 'AI writing tools',            zoho: 'Basic (Zia AI)',             socialmate: '12 tools included'        },
  { feature: 'AI credits (free tier)',       zoho: 'N/A — no free plan',        socialmate: '75/month free'            },
  { feature: 'Bulk scheduling',             zoho: '✅ Paid plans only',         socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                 zoho: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',             zoho: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',         zoho: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'RSS import',                  zoho: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',         zoho: 'Monitor feature (paid)',     socialmate: '✅ Free (3 accounts)'     },
  { feature: 'Team seats (starter)',        zoho: '1 user',                     socialmate: '2 users free'             },
  { feature: 'Zoho CRM integration',        zoho: '✅ Native',                  socialmate: '— (not Zoho-dependent)'  },
  { feature: 'Standalone value',            zoho: 'Best inside Zoho ecosystem', socialmate: '✅ Works independently'  },
]

const FAQ = [
  {
    q: 'Does Zoho Social have a free plan?',
    a: 'No. Zoho Social offers a 15-day trial but no permanent free tier. After the trial ends, the cheapest option is the Standard plan at $15/month. SocialMate has a genuine free plan with no expiry and no credit card required.',
  },
  {
    q: 'Why is Zoho Social tied to the Zoho ecosystem?',
    a: 'Zoho Social was built as a companion to Zoho CRM and Zoho Desk. Its standout integrations — connecting social conversations to CRM contacts, tracking leads from social posts — all depend on other Zoho products. If you are not already using Zoho CRM, you are paying for integrations you cannot use. SocialMate works as a standalone tool with no ecosystem dependency.',
  },
  {
    q: 'Which platforms does SocialMate support that Zoho Social does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which Zoho Social covers. Zoho Social supports 9 platforms, SocialMate supports 16. If any part of your audience is on community-first or decentralized platforms, Zoho Social cannot help.',
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. The free tier includes unlimited post scheduling, 75 AI credits per month, bulk scheduling, link in bio, hashtag manager, competitor tracking, RSS import, and evergreen recycling. No credit card required, no 15-day countdown.',
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

export default function VsZohoSocialPage() {
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
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Blog</Link>
            <Link href="/pricing" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all">Try free →</Link>
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
            SocialMate vs Zoho Social
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Zoho Social is powerful if you live in Zoho CRM — overkill if you just want to schedule posts. SocialMate is free forever with no ecosystem lock-in.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-black text-white font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
              Try SocialMate free →
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-gray-200 dark:border-gray-700 font-semibold rounded-2xl hover:border-gray-400 transition-all text-sm dark:text-gray-200">
              See pricing
            </Link>
          </div>
          <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
            {['16 platforms', '12 AI tools free', 'No Zoho required', 'Free forever'].map((pill) => (
              <span key={pill} className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* VERDICT BANNER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Zoho Social</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Great inside Zoho — expensive outside it</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Native Zoho CRM / Zoho Desk integration</li>
              <li>✅ Solid analytics and monitoring features</li>
              <li>❌ No free plan — $15/month minimum</li>
              <li>❌ Only 9 platforms supported</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ No link-in-bio, hashtag manager, or evergreen recycling</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">All platforms. All tools. $0.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Free forever — no trial countdown</li>
              <li>✅ 16 platforms including Discord and Telegram</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ Link in bio, hashtag manager, evergreen recycling</li>
              <li>✅ No Zoho account needed</li>
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
              <span>Zoho Social</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.zoho}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from Zoho Social</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'No free plan means paying before you know if it fits',
                desc: 'Zoho Social has no permanent free tier — only a 15-day trial. After that, you are at $15/month minimum or starting from scratch. SocialMate is free forever with no trial expiry, so you can use it at full capacity without spending anything.',
              },
              {
                n: '2',
                title: "It's an ecosystem product — and you're paying for the ecosystem",
                desc: "Zoho Social's best features — CRM contact linking, lead tracking from social activity, Zoho Desk ticket creation — only work if you are also paying for Zoho CRM and Zoho Desk. Standalone, you are paying $15–$40/month for a tool with 9 platforms and basic scheduling. SocialMate is built as a standalone product with no ecosystem tax.",
              },
              {
                n: '3',
                title: 'Missing the platforms where your audience actually is',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not supported by Zoho Social. Community servers, group channels, the fediverse, and the Bluesky timeline are growing — Zoho Social cannot reach them. SocialMate covers all four on the free plan.',
              },
              {
                n: '4',
                title: 'Key tools are missing entirely, not just locked to paid tiers',
                desc: 'Link in bio, hashtag manager, and evergreen recycling are not features Zoho Social offers at any price tier. These are standard tools for solo creators and small teams managing content at scale. SocialMate includes all three on the free plan.',
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
            SocialMate is free forever — 16 platforms, 12 AI tools, bulk scheduling, link in bio, hashtag manager. No Zoho account. No credit card required.
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
