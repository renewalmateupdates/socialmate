'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',          metricool: '$22/month (Starter)',    socialmate: '$0 — free forever'       },
  { feature: 'Free plan post limit',    metricool: '50 posts/month',         socialmate: '100 / month'               },
  { feature: 'Free plan brands',        metricool: '1 brand',                socialmate: 'Multiple workspaces'     },
  { feature: 'Pricing model',           metricool: 'Per brand',              socialmate: 'Flat rate'               },
  { feature: 'Platforms supported',     metricool: '12+',                    socialmate: '16 (growing)'            },
  { feature: 'Discord support',         metricool: '❌',                      socialmate: '✅'                      },
  { feature: 'Telegram support',        metricool: '❌',                      socialmate: '✅'                      },
  { feature: 'Mastodon support',        metricool: '❌',                      socialmate: '✅'                      },
  { feature: 'Bluesky support',         metricool: '❌',                      socialmate: '✅'                      },
  { feature: 'AI writing tools',        metricool: 'Basic AI captions',      socialmate: '15+ tools included'       },
  { feature: 'AI credits free tier',    metricool: 'Limited',                socialmate: '50/month free'            },
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
    a: 'Yes. Free tier includes 100 posts/month, 50 AI credits/month, bulk scheduling, link in bio, hashtag manager, competitor tracking, RSS import, and evergreen recycling. No credit card required.',
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
            SocialMate vs Metricool
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Metricool's free plan caps at 50 posts per month. SocialMate has no limits — and includes 15+ AI tools at zero cost.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Metricool</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Strong analytics, limited free tier</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Deep Instagram &amp; TikTok analytics</li>
              <li>✅ Good calendar UI</li>
              <li>❌ 50 post/month cap on free plan</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Bulk scheduling locked to paid plans</li>
              <li>❌ AI tools limited on free</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Unlimited posts. 15+ AI tools. $0.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Unlimited posts, no cap</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Bulk scheduling free</li>
              <li>✅ Competitor tracking free</li>
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
              <span>Metricool</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.metricool}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why teams switch from Metricool</h2>
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
                title: '15+ AI tools vs a basic AI assistant',
                desc: 'SocialMate includes caption generation, hashtag research, viral hook writing, content repurposing, thread generation, post scoring, trend scanning, competitor intelligence, and more — all on the free tier.',
              },
              {
                n: '4',
                title: 'Bulk scheduling and RSS import are not paid features here',
                desc: 'Metricool locks bulk scheduling and RSS import to paid plans. On SocialMate, both are free. Upload a month of content at once and auto-pull from any RSS feed without paying a cent.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Done hitting the 50-post cap?</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate gives you 100 posts/month, 15+ AI tools, 7 platforms — completely free to start. No credit card required.
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
