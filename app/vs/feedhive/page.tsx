'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',          feedhive: '$19/month (Creator)',        socialmate: '$0 — free forever'        },
  { feature: 'Free plan',               feedhive: '❌ None',                     socialmate: '✅ Free forever'          },
  { feature: 'Platforms supported',     feedhive: '~6 (no Discord/Telegram)',   socialmate: '7 live platforms'         },
  { feature: 'Discord support',         feedhive: '❌',                          socialmate: '✅'                       },
  { feature: 'Telegram support',        feedhive: '❌',                          socialmate: '✅'                       },
  { feature: 'Mastodon support',        feedhive: '❌',                          socialmate: '✅'                       },
  { feature: 'Bluesky support',         feedhive: '❌',                          socialmate: '✅'                       },
  { feature: 'TikTok support',          feedhive: '❌',                          socialmate: '✅'                       },
  { feature: 'AI writing tools',        feedhive: 'AI Inspiration (limited)',   socialmate: '15+ tools included'        },
  { feature: 'AI credits free tier',    feedhive: 'N/A (no free plan)',         socialmate: '50/month free'            },
  { feature: 'Autonomous AI content',   feedhive: '❌',                          socialmate: '✅ SOMA'                  },
  { feature: 'Bulk scheduling',         feedhive: 'Paid plans',                 socialmate: '✅ Free'                  },
  { feature: 'Link in bio (SIGIL)',      feedhive: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',     feedhive: 'Paid plans',                 socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',     feedhive: '❌',                          socialmate: '✅ Free (3 accounts)'    },
  { feature: 'Team seats',              feedhive: '1 user on Creator',          socialmate: '2 seats free'             },
  { feature: 'Client workspaces',       feedhive: 'Higher tier required',       socialmate: 'Pro+: from $5/mo'         },
  { feature: 'White label',             feedhive: '❌',                          socialmate: '✅ Add-on available'      },
]

const FAQ = [
  {
    q: 'Does FeedHive have a free plan?',
    a: 'No. FeedHive has no free plan. Their Creator plan starts at $19/month for a single user. SocialMate is completely free to start — no credit card, no time limit, no catch.',
  },
  {
    q: 'Which platforms does SocialMate support that FeedHive does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, Bluesky, and TikTok — none of which FeedHive covers. If any part of your audience is on community platforms, group chats, or decentralized networks, FeedHive simply cannot reach them. SocialMate covers all five for free.',
  },
  {
    q: 'How does SocialMate\'s AI compare to FeedHive\'s?',
    a: 'FeedHive offers AI-assisted post ideas primarily for Twitter/LinkedIn. SocialMate has 12 dedicated AI tools (captions, hooks, rewrites, hashtags, threads, repurposing, and more) powered by Google Gemini — plus SOMA, an autonomous AI content system that learns your brand voice and generates a full week of content automatically. FeedHive has no equivalent to SOMA.',
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. The free tier includes unlimited posts, 50 AI credits per month, bulk scheduling, SIGIL (link in bio), hashtag manager, competitor tracking (3 accounts), RSS import, and evergreen recycling. No credit card required and no trial countdown.',
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

export default function VsFeedHivePage() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-screen bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* NAV */}
      <nav className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold tracking-tight dark:text-white">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{t('vs_shared.nav_login')}</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all">{t('vs_shared.nav_start_free')}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* HERO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 mb-4">
            Updated May 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-white">
            SocialMate vs FeedHive
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            FeedHive has AI features but no free plan, no Discord or Telegram, and misses TikTok and Bluesky entirely. SocialMate covers all 7 platforms — starting free.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-black text-white font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
              {t('vs_shared.cta_try_free')}
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-gray-200 dark:border-gray-700 font-semibold rounded-2xl hover:border-gray-400 transition-all text-sm dark:text-gray-200">
              {t('vs_shared.cta_see_pricing')}
            </Link>
          </div>
        </div>

        {/* VERDICT BANNER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">FeedHive</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">AI-assisted scheduling with major platform gaps</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ AI post idea generation</li>
              <li>✅ Content recycling on paid plans</li>
              <li>❌ No free plan — $19/month minimum</li>
              <li>❌ No Discord, Telegram, or Mastodon</li>
              <li>❌ No Bluesky or TikTok support</li>
              <li>❌ No autonomous AI content system</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">7 platforms. 15+ AI tools. $0.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Free forever — no trial countdown</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky, TikTok</li>
              <li>✅ SOMA: autonomous AI content OS</li>
              <li>✅ Bulk scheduling free</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>FeedHive</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.feedhive}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from FeedHive</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'No free plan means you commit $19/month before you know if it fits',
                desc: "FeedHive has no free tier — only a trial. Once the trial ends, you're paying $19/month or walking away. SocialMate's free plan is permanent. Use it indefinitely at no cost, upgrade only when you decide you want more.",
              },
              {
                n: '2',
                title: 'FeedHive misses five major platforms your audience uses',
                desc: 'Discord, Telegram, Mastodon, Bluesky, and TikTok are all missing from FeedHive. If you run a Discord community, send updates to a Telegram channel, or post on TikTok — FeedHive leaves you with a gap. SocialMate covers all seven live platforms from one dashboard.',
              },
              {
                n: '3',
                title: 'SOMA vs FeedHive AI: autonomous vs assisted',
                desc: "FeedHive offers AI-assisted post idea generation — you still do the work. SocialMate's SOMA is a fully autonomous AI content OS: it learns your brand Voice DNA through a 40-question interview, generates a full week of platform-native content, and schedules it automatically. It gets smarter every run through post-publish feedback loops. FeedHive has nothing comparable.",
              },
              {
                n: '4',
                title: 'Flat pricing beats per-feature upgrades',
                desc: "FeedHive's feature gates push you toward higher tiers as you grow. SocialMate Pro is $5/month — flat — with 15+ AI tools, 7 platforms, SOMA, team seats, and client workspaces. The Agency plan is $20/month. What competitors charge $99/month for, we give for $5.",
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
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">{t('vs_shared.faq_heading')}</h2>
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">7 platforms. 15+ AI tools. Free forever.</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate covers everything FeedHive does — plus Discord, Telegram, Mastodon, Bluesky, TikTok, and SOMA. No credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-gray-600 text-xs mt-3">{t('vs_shared.cta_no_card')}</p>
        </div>
      </div>
      {/* FOOTER */}
      <PublicFooter />
    </div>
  )
}
