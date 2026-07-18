'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',            missinglettr: '$19/month (Solo)',             socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 missinglettr: '❌ None',                       socialmate: '✅ Free forever'         },
  { feature: 'Users on starting plan',    missinglettr: '1 user',                       socialmate: '2 users free'            },
  { feature: 'Social accounts (starter)', missinglettr: '4 accounts',                  socialmate: 'No hard cap (free tier)' },
  { feature: 'Auto drip campaigns',       missinglettr: '✅ Core feature',              socialmate: 'Evergreen recycling'     },
  { feature: 'Evergreen recycling',       missinglettr: 'Limited',                      socialmate: '✅ Free'                 },
  { feature: 'Discord support',           missinglettr: '❌',                            socialmate: '✅'                      },
  { feature: 'Telegram support',          missinglettr: '❌',                            socialmate: '✅'                      },
  { feature: 'Mastodon support',          missinglettr: '❌',                            socialmate: '✅'                      },
  { feature: 'Bluesky support',           missinglettr: '❌',                            socialmate: '✅'                      },
  { feature: 'AI writing tools',          missinglettr: 'Basic AI assist',              socialmate: '15+ tools included'       },
  { feature: 'AI credits free tier',      missinglettr: 'N/A (no free plan)',           socialmate: '50/month free'           },
  { feature: 'Bulk scheduling',           missinglettr: 'Limited',                      socialmate: '✅ Free'                 },
  { feature: 'Link in bio',               missinglettr: '❌',                            socialmate: '✅ Free'                 },
  { feature: 'Hashtag manager',           missinglettr: 'Limited',                      socialmate: '✅ Free'                 },
  { feature: 'Competitor tracking',       missinglettr: '❌',                            socialmate: '✅ Free (3 accounts)'   },
  { feature: 'RSS import',                missinglettr: '✅ Auto-campaigns from RSS',   socialmate: '✅ Free'                 },
  { feature: 'Analytics',                 missinglettr: 'Basic',                        socialmate: 'Free dashboard'          },
]

const FAQ = [
  {
    q: 'Does MissingLettr have a free plan?',
    a: 'No. MissingLettr has no free plan. Their Solo plan starts at $19/month and supports 1 user and 4 social accounts. SocialMate is completely free to start with no credit card required.',
  },
  {
    q: 'What is MissingLettr\'s drip campaign feature?',
    a: 'MissingLettr automatically turns blog posts or RSS content into a series of scheduled social posts spread out over weeks or months. It\'s a clever repurposing tool. SocialMate\'s evergreen recycling and RSS import achieve a similar result — keeping your best content in circulation — without the paywall.',
  },
  {
    q: 'Which platforms does SocialMate support that MissingLettr does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky. MissingLettr does not support any of these platforms. If any part of your audience lives on these networks, MissingLettr can\'t reach them.',
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. The free tier includes 100 posts/month, 50 AI credits/month, bulk scheduling, link in bio, hashtag manager, competitor tracking, RSS import, and evergreen recycling. No credit card required and no trial countdown.',
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

export default function VsMissingLettrPage() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-screen bg-panel">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* NAV */}
      <nav className="border-b border-edge bg-panel bg-panel sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold tracking-tight text-ink-high">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-ink-muted hover:text-ink-high dark:hover:text-ink-high transition-colors">{t('vs_shared.nav_login')}</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-void text-ink-high rounded-xl hover:opacity-80 transition-all">{t('vs_shared.nav_start_free')}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* HERO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-raised bg-raised border border-edge-lit border-edge-lit rounded-full px-4 py-1.5 text-xs font-bold text-ink-muted mb-4">
            Updated April 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs MissingLettr
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            MissingLettr auto-creates campaigns from your blog posts, but has no free plan and starts at $19/month. SocialMate gives you evergreen recycling and RSS import for free.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-void text-ink-high font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
              {t('vs_shared.cta_try_free')}
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-edge font-semibold rounded-2xl hover:border-edge transition-all text-sm text-ink-high">
              {t('vs_shared.cta_see_pricing')}
            </Link>
          </div>
        </div>

        {/* VERDICT BANNER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-panel border-2 border-edge rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">MissingLettr</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Clever drip campaigns — but no free plan</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Auto-drip campaigns from blog content</li>
              <li>✅ RSS-to-social automation</li>
              <li>❌ No free plan — $19/month minimum</li>
              <li>❌ Very limited platform coverage</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Minimal AI and analytics features</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">All platforms. All tools. $0.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Free forever — no trial countdown</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Evergreen recycling + RSS import free</li>
              <li>✅ Bulk scheduling free</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-muted uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>MissingLettr</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.missinglettr}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why people choose SocialMate over MissingLettr</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'MissingLettr\'s best use case is covered by SocialMate for free',
                desc: 'MissingLettr\'s main value is turning blog content into social campaigns automatically. SocialMate\'s RSS import and evergreen recycling cover the same core need — keeping your best content circulating across platforms — without any paywall.',
              },
              {
                n: '2',
                title: 'No free plan means you commit money before testing fit',
                desc: 'MissingLettr has no free tier. You can trial it briefly, but then you\'re paying $19/month or you\'re out. SocialMate is free indefinitely, so you can evaluate it on your own schedule without spending a cent.',
              },
              {
                n: '3',
                title: 'MissingLettr skips the platforms your community uses',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not supported by MissingLettr. Its platform coverage is narrow. SocialMate covers all four community and decentralized platforms on the free tier.',
              },
              {
                n: '4',
                title: 'SocialMate gives you 15+ AI tools — MissingLettr gives you basic assist',
                desc: 'MissingLettr\'s AI features are minimal. SocialMate includes 12 AI-powered tools on the free tier — caption generation, hashtag research, content gap analysis, best-time suggestions, and more — without any add-on cost.',
              },
            ].map((r) => (
              <div key={r.n} className="flex gap-4 p-5 bg-panel border border-edge border-edge rounded-2xl hover:border-edge dark:hover:border-edge transition-all">
                <div className="w-8 h-8 bg-void text-ink-high rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0">{r.n}</div>
                <div>
                  <p className="text-sm font-extrabold mb-1 text-ink-high">{r.title}</p>
                  <p className="text-xs text-ink-muted leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.faq_heading')}</h2>
          <div className="space-y-4">
            {FAQ.map((faq, i) => (
              <div key={i} className="p-5 bg-panel border border-edge border-edge rounded-2xl">
                <p className="text-sm font-extrabold mb-2 text-ink-high">{faq.q}</p>
                <p className="text-xs text-ink-muted leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-void text-ink-high rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Skip the $19/month — start free today</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 15+ AI tools, 7 platforms, RSS import and evergreen recycling included. No credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-panel text-ink-high font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-ink-muted text-xs mt-3">{t('vs_shared.cta_no_card')}</p>
        </div>
      </div>
      {/* FOOTER */}
      <PublicFooter />
    </div>
  )
}
