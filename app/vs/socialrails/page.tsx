import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs SocialRails (2026) — Full Comparison',
  description: 'SocialRails starts at $29/month with no free plan and no Discord or Telegram. SocialMate is free forever with 16 platforms — including Discord and Telegram — plus 12 AI tools, link in bio, and a hashtag manager.',
  openGraph: {
    title:       'SocialMate vs SocialRails (2026)',
    description: '$29/month minimum for a tool that still skips Discord and Telegram. SocialMate is free forever with more platforms and more tools.',
    url:         'https://socialmate.studio/vs/socialrails',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/socialrails' },
}

const COMPARISON = [
  { feature: 'Starting price',              socialrails: '$29/month',               socialmate: '$0 — free forever'        },
  { feature: 'Free plan',                   socialrails: '❌ None',                  socialmate: '✅ Free forever'          },
  { feature: 'Platforms supported',         socialrails: '9',                        socialmate: '16 (growing)'             },
  { feature: 'Discord support',             socialrails: '❌',                        socialmate: '✅'                       },
  { feature: 'Telegram support',            socialrails: '❌',                        socialmate: '✅'                       },
  { feature: 'Mastodon support',            socialrails: '✅',                        socialmate: '✅'                       },
  { feature: 'Bluesky support',             socialrails: '✅',                        socialmate: '✅'                       },
  { feature: 'AI writing tools',            socialrails: 'Limited',                  socialmate: '12 tools included'        },
  { feature: 'AI credits',                  socialrails: 'Add-on (extra cost)',       socialmate: '75/month free'            },
  { feature: 'Bulk scheduling',             socialrails: '✅ Paid only',             socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                 socialrails: '❌',                        socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',             socialrails: '❌',                        socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',         socialrails: '✅ Paid plans',            socialmate: '✅ Free'                  },
  { feature: 'RSS import',                  socialrails: '❌',                        socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',         socialrails: '❌',                        socialmate: '✅ Free (3 accounts)'     },
  { feature: 'Analytics',                   socialrails: 'Basic',                    socialmate: '30-day history free'      },
  { feature: 'Team seats (starter)',        socialrails: '0',                        socialmate: '2 users free'             },
  { feature: 'Client workspaces',           socialrails: 'Higher tiers',             socialmate: 'Pro+: from $5/mo'        },
]

const FAQ = [
  {
    q: 'Does SocialRails have a free plan?',
    a: 'No. SocialRails has no free tier of any kind. Their entry plan starts at $29/month. SocialMate is completely free to start — no credit card, no trial, no expiry.',
  },
  {
    q: 'SocialRails supports Mastodon and Bluesky — does SocialMate?',
    a: 'Yes, SocialMate supports both Mastodon and Bluesky. SocialRails deserves credit for supporting decentralized platforms — but SocialMate matches both and adds Discord and Telegram on top, all on the free plan. You get more platform coverage at zero cost.',
  },
  {
    q: 'Why is AI an add-on on SocialRails but free on SocialMate?',
    a: 'SocialRails offers limited AI functionality and requires an additional purchase to unlock more credits or tools. SocialMate includes 12 AI writing tools and 75 AI credits per month on the free tier — no add-on purchase required.',
  },
  {
    q: 'Is SocialMate genuinely free or does it get limited quickly?',
    a: 'The free tier is designed to be fully usable without upgrading. It includes unlimited post scheduling, 75 AI credits/month, bulk scheduling, link in bio, hashtag manager, competitor tracking (3 accounts), RSS import, and evergreen recycling. No credit card required.',
  },
]

export default function VsSocialRailsPage() {
  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-950">
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
            SocialMate vs SocialRails
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            SocialRails starts at $29/month with no free plan and still skips Discord and Telegram. SocialMate is free forever with more platforms and more tools included.
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
            {['16 platforms', 'Discord + Telegram', '12 AI tools free', 'Free forever'].map((pill) => (
              <span key={pill} className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* VERDICT BANNER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialRails</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Decent for fediverse — pricey for what you get</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Mastodon and Bluesky support</li>
              <li>✅ Evergreen recycling (paid)</li>
              <li>❌ No free plan — $29/month minimum</li>
              <li>❌ No Discord or Telegram</li>
              <li>❌ AI is a paid add-on</li>
              <li>❌ No link in bio, hashtag manager, or competitor tracking</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">All platforms. All tools. $0.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Free forever — no trial countdown</li>
              <li>✅ Mastodon, Bluesky, Discord, and Telegram</li>
              <li>✅ 12 AI tools included on free tier</li>
              <li>✅ Link in bio, hashtag manager, evergreen recycling</li>
              <li>✅ Competitor tracking and RSS import free</li>
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
              <span>SocialRails</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.socialrails}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from SocialRails</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '$29/month is a steep floor with no free option',
                desc: 'SocialRails has no free plan whatsoever. You pay $29/month from day one with no way to evaluate the tool on a live account before committing. SocialMate is free forever — you can use it fully, indefinitely, without entering a credit card.',
              },
              {
                n: '2',
                title: 'Discord and Telegram are missing — and they matter',
                desc: 'SocialRails supports Mastodon and Bluesky, which is legitimately good. But Discord servers and Telegram channels are where a large portion of online communities actually live. SocialMate supports all four decentralized and community platforms: Mastodon, Bluesky, Discord, and Telegram — all on the free plan.',
              },
              {
                n: '3',
                title: 'AI is an add-on, not a feature',
                desc: "SocialRails treats AI as a premium add-on — you get limited functionality and need to pay more to unlock AI credits. SocialMate includes 12 AI writing tools and 75 free AI credits per month in the base free tier. You don't pay extra to use AI.",
              },
              {
                n: '4',
                title: 'Missing tools that should be standard',
                desc: 'Link in bio, hashtag manager, competitor tracking, and RSS import are absent from SocialRails at any tier. These are not niche features — they are part of day-to-day content management for most creators and marketers. SocialMate includes all of them on the free plan.',
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
            SocialMate is free forever — 16 platforms including Discord and Telegram, 12 AI tools, link in bio, hashtag manager. No credit card required.
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
            <Link href="/vs/metricool" className="hover:text-black dark:hover:text-white transition-colors">vs Metricool</Link>
            <Link href="/vs/publer" className="hover:text-black dark:hover:text-white transition-colors">vs Publer</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
