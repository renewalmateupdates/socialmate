'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',               competitor: '$12+/month',                 socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    competitor: '⚠️ Very limited free tier',   socialmate: '✅ 50 credits/month'     },
  { feature: 'Post scheduling',              competitor: '❌ No scheduling',            socialmate: '✅ Free across 7 platforms'},
  { feature: 'X / Twitter analytics',        competitor: '✅ Deep audience analytics',  socialmate: '✅ Engagement tracking'  },
  { feature: 'TikTok scheduling',             competitor: '❌',                          socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Discord + Telegram',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Mastodon scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',              competitor: '❌',                          socialmate: '15+ tools free'           },
  { feature: 'Content calendar',             competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                   competitor: '❌',                          socialmate: '✅ Built in free'         },
  { feature: 'Cross-platform analytics',      competitor: '❌ Twitter/X only',          socialmate: '✅ Multi-platform'       },
  { feature: 'Team collaboration',            competitor: 'Extra cost',                 socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      competitor: '❌',                          socialmate: '✅ Tip jar + fan subs'   },
]

const FAQ = [
  {
    q: 'What is Tweepsmap and what does it actually do?',
    a: 'Tweepsmap is a Twitter/X audience analytics tool. It maps your followers by location, analyzes your audience demographics, tracks follower growth, and gives insights into when your audience is most active. What it does not do: post scheduling. It\'s a pure analytics play — you\'d still need a separate scheduler. At $12+/month for analytics alone, you\'re paying for insights without the publishing workflow.',
  },
  {
    q: 'Can SocialMate replace Tweepsmap\'s analytics?',
    a: 'SocialMate includes engagement analytics across all connected platforms including X/Twitter. Best-times heatmaps, post performance tracking, and cross-platform comparison are all built in. For deep X-specific audience mapping (geographic distribution, follower demographics, audience interests), Tweepsmap has more granularity. But if you want scheduling + analytics in one tool, SocialMate covers both without paying separately.',
  },
  {
    q: 'Why pay for Tweepsmap analytics alone when scheduling costs extra?',
    a: 'Tweepsmap is analytics-only — you still need Buffer, Hootsuite, or another scheduler on top of it. That\'s two subscriptions, two logins, two tools to manage. SocialMate combines scheduling across 7 platforms and multi-platform analytics in one dashboard for free. Pro is $5/month for advanced features.',
  },
  {
    q: 'Does SocialMate show best posting times for X/Twitter?',
    a: 'Yes. SocialMate\'s analytics dashboard includes a best-times heatmap that shows when your connected audience engages most, per platform. The Smart Queue feature (Pro+) auto-schedules posts at those optimal times automatically. No manual analysis needed.',
  },
  {
    q: 'What platforms does SocialMate cover beyond Twitter/X?',
    a: 'SocialMate schedules TikTok (free, 20 videos/mo), LinkedIn, Bluesky, Discord, Telegram, Mastodon, and X/Twitter — 7 platforms total. Tweepsmap only covers Twitter/X. If your audience exists on any other platform, Tweepsmap can\'t help and you need a separate tool for each one.',
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

export default function VsTweepsmapPage() {
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
            SocialMate vs Tweepsmap
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Tweepsmap is Twitter/X analytics only — no scheduling at all. SocialMate schedules 7 platforms and includes cross-platform analytics, free to start.
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

        {/* VERDICT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Tweepsmap</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Twitter analytics only — no scheduling</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Deep Twitter audience mapping</li>
              <li>✅ Geographic follower distribution</li>
              <li>✅ Follower growth analytics</li>
              <li>❌ No post scheduling at all</li>
              <li>❌ Twitter/X only — no other platforms</li>
              <li>❌ Requires a separate scheduler tool</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Schedule + analyze. 7 platforms. Free.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Schedule across X, TikTok, LinkedIn, Bluesky, Discord, Telegram, Mastodon</li>
              <li>✅ Best-times heatmap per platform</li>
              <li>✅ Post performance tracking built in</li>
              <li>✅ Pro plan for $5/month total</li>
              <li>✅ No second tool needed</li>
              <li>✅ No credit card required to start</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Tweepsmap</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.competitor}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over Tweepsmap</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Analytics without scheduling is half a workflow',
                desc: 'Tweepsmap tells you when to post and who your audience is — but you still have to go post manually or pay for a second tool. SocialMate gives you scheduling + analytics in one platform. See your best times, schedule at those exact times, and watch engagement data come back — all without switching tabs.',
              },
              {
                n: '2',
                title: 'One tool instead of two subscriptions',
                desc: 'Tweepsmap for analytics + another scheduler for posting = two monthly bills, two logins, two workflows. SocialMate replaces both for $5/month Pro. Your entire posting workflow — compose, schedule, analyze, optimize — lives in one place.',
              },
              {
                n: '3',
                title: 'Cross-platform vs single-platform analytics',
                desc: 'Tweepsmap analytics only covers Twitter/X. SocialMate tracks engagement across all 7 connected platforms. See which platform drives the most engagement per post type, find your best times per network, and understand where your content resonates most — data Tweepsmap can never show you.',
              },
              {
                n: '4',
                title: 'TikTok and LinkedIn analytics matter too',
                desc: 'Twitter/X is one channel. TikTok, LinkedIn, and Bluesky are where creators are growing fastest in 2026. Understanding your TikTok performance, your LinkedIn engagement patterns, and your Bluesky community requires cross-platform analytics — which SocialMate provides and Tweepsmap can\'t.',
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

        {/* BOTTOM CTA */}
        <div className="text-center py-12 bg-black text-white rounded-3xl px-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Schedule + analytics in one</p>
          <h2 className="text-3xl font-extrabold mb-4">Stop paying for analytics without scheduling</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            SocialMate gives you post scheduling and engagement analytics across 7 platforms.
            Free plan available. Pro is $5/month — one tool, not two.
          </p>
          <Link href="/signup" className="inline-block px-8 py-3 bg-white text-black font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
            Start free — no credit card →
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link href="/vs" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            ← View all comparisons
          </Link>
        </div>

      </div>
      <PublicFooter />
    </div>
  )
}
