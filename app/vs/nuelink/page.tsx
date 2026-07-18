'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',            nuelink: '$15/month (Individual)',      socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 nuelink: '❌ None',                     socialmate: '✅ Free forever'         },
  { feature: 'Free trial',                nuelink: '7-day trial only',            socialmate: 'Free forever, no trial'  },
  { feature: 'Social accounts (starter)', nuelink: '5 channels',                  socialmate: 'No hard cap (free tier)' },
  { feature: 'Bulk scheduling',           nuelink: '✅ All plans',                socialmate: '✅ Free'                 },
  { feature: 'Discord support',           nuelink: '❌',                          socialmate: '✅'                      },
  { feature: 'Telegram support',          nuelink: '❌',                          socialmate: '✅'                      },
  { feature: 'Mastodon support',          nuelink: '❌',                          socialmate: '✅'                      },
  { feature: 'Bluesky support',           nuelink: '❌',                          socialmate: '✅'                      },
  { feature: 'AI writing tools',          nuelink: 'Basic AI captions',           socialmate: '15+ tools included'       },
  { feature: 'AI credits free tier',      nuelink: 'N/A (no free plan)',          socialmate: '50/month free'           },
  { feature: 'Link in bio',               nuelink: '❌',                          socialmate: '✅ Free'                 },
  { feature: 'Hashtag manager',           nuelink: 'Paid plans',                  socialmate: '✅ Free'                 },
  { feature: 'Evergreen recycling',       nuelink: '✅ Paid plans',               socialmate: '✅ Free'                 },
  { feature: 'Competitor tracking',       nuelink: '❌',                          socialmate: '✅ Free (3 accounts)'   },
  { feature: 'RSS import',                nuelink: '✅ All plans',                socialmate: '✅ Free'                 },
  { feature: 'Analytics',                 nuelink: 'Limited on starter',          socialmate: '✅ Free'                 },
  { feature: 'Team collaboration',        nuelink: 'Higher tiers',                socialmate: '✅ Free (2 seats)'      },
]

const FAQ = [
  {
    q: 'Does Nuelink have a free plan?',
    a: 'No. Nuelink offers only a 7-day free trial — one of the shortest in the industry. After the trial, you pay $15/month or lose access. SocialMate is completely free to start with no credit card and no expiry date.',
  },
  {
    q: 'What makes Nuelink stand out?',
    a: 'Nuelink has a genuinely clean and minimal interface, and includes bulk scheduling and RSS import on all plans. These are useful features. SocialMate offers the same scheduling capabilities along with a much deeper AI toolkit — all for free.',
  },
  {
    q: 'Which platforms does SocialMate support that Nuelink does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which Nuelink covers. If your audience includes community or decentralized platforms, Nuelink cannot help.',
  },
  {
    q: 'Is SocialMate a good Nuelink alternative for solo creators?',
    a: 'Yes. SocialMate gives you bulk scheduling, RSS import, 15+ AI tools, competitor tracking, link in bio, evergreen recycling, and team collaboration — all on the free plan. Nuelink charges $15/month with only a 7-day trial.',
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

export default function VsNuelinkPage() {
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
            SocialMate vs Nuelink
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Nuelink has a clean UI and no free plan — just a 7-day trial before you pay $15/month. SocialMate is free forever with more features at $0.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Nuelink</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Clean UI — but no free plan</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Clean, minimal interface</li>
              <li>✅ Bulk scheduling and RSS on all plans</li>
              <li>❌ No free plan — 7-day trial only</li>
              <li>❌ $15/month minimum</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Limited AI tools</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">More features. All platforms. $0.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Free forever — no trial countdown</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Bulk scheduling and RSS free</li>
              <li>✅ Competitor tracking and analytics free</li>
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
              <span>Nuelink</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.nuelink}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why people choose SocialMate over Nuelink</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'A 7-day trial is barely enough to learn the tool',
                desc: 'Nuelink gives you 7 days to evaluate before you start paying. Building real posting habits and testing your actual workflow in a week is difficult. SocialMate gives you unlimited time on the free plan to decide if it fits your needs.',
              },
              {
                n: '2',
                title: '15+ AI tools vs basic AI captions',
                desc: "Nuelink includes basic AI caption generation. SocialMate includes 12 AI-powered tools — caption generation, hashtag research, competitor analysis, content gap analysis, trend scanning, best-time suggestions, evergreen recycling suggestions, and more — all on the free plan.",
              },
              {
                n: '3',
                title: 'Competitor tracking and analytics free vs locked',
                desc: 'Nuelink limits analytics on the starter plan and does not include competitor tracking at all. SocialMate includes both — analytics and competitor tracking for 3 accounts — free. Understanding performance should not require an upgrade.',
              },
              {
                n: '4',
                title: 'SocialMate covers platforms Nuelink does not',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not supported by Nuelink. SocialMate covers all four on the free plan — because your audience is not all on Instagram and LinkedIn.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Skip the $15/month — start free today</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 15+ AI tools, 7 platforms, competitor tracking. No credit card required.
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
