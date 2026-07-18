'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',            contentstudio: '$25/month (Starter)',         socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 contentstudio: '❌ None',                      socialmate: '✅ Free forever'         },
  { feature: 'Users on starting plan',    contentstudio: '1 user',                      socialmate: '2 users free'            },
  { feature: 'Social accounts (starter)', contentstudio: '5 accounts',                 socialmate: 'No hard cap (free tier)' },
  { feature: 'UI complexity',             contentstudio: 'High — steep learning curve', socialmate: 'Clean, intuitive'        },
  { feature: 'Content discovery',         contentstudio: '✅ Built-in',                 socialmate: 'RSS import'              },
  { feature: 'Discord support',           contentstudio: '❌',                           socialmate: '✅'                      },
  { feature: 'Telegram support',          contentstudio: '❌',                           socialmate: '✅'                      },
  { feature: 'Mastodon support',          contentstudio: '❌',                           socialmate: '✅'                      },
  { feature: 'Bluesky support',           contentstudio: '❌',                           socialmate: '✅'                      },
  { feature: 'AI writing tools',          contentstudio: 'AI Writer add-on',            socialmate: '15+ tools included'       },
  { feature: 'AI credits free tier',      contentstudio: 'N/A (no free plan)',          socialmate: '50/month free'           },
  { feature: 'Bulk scheduling',           contentstudio: 'Paid plans',                  socialmate: '✅ Free'                 },
  { feature: 'Link in bio',               contentstudio: '❌',                           socialmate: '✅ Free'                 },
  { feature: 'Hashtag manager',           contentstudio: 'Paid plans',                  socialmate: '✅ Free'                 },
  { feature: 'Evergreen recycling',       contentstudio: 'Paid plans',                  socialmate: '✅ Free'                 },
  { feature: 'Competitor tracking',       contentstudio: 'Higher tiers',                socialmate: '✅ Free (3 accounts)'   },
  { feature: 'RSS import',                contentstudio: '✅ Paid plans',               socialmate: '✅ Free'                 },
]

const FAQ = [
  {
    q: 'Does ContentStudio have a free plan?',
    a: 'No. ContentStudio has no free plan. Their Starter plan begins at $25/month for 1 user and 5 social accounts. SocialMate is completely free to start with no credit card required.',
  },
  {
    q: 'Is ContentStudio hard to learn?',
    a: 'ContentStudio is feature-rich but also significantly more complex than most scheduling tools. New users often report a steep learning curve before they feel comfortable with the interface. SocialMate is designed to be intuitive from day one — you can schedule your first post in under five minutes.',
  },
  {
    q: 'Which platforms does SocialMate support that ContentStudio does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky. ContentStudio does not cover any of these platforms. If your audience is on community platforms or decentralized networks, ContentStudio offers no path to reach them.',
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

export default function VsContentStudioPage() {
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
            SocialMate vs ContentStudio
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            ContentStudio has no free plan, starts at $25/month, and has a complex UI that takes time to master. SocialMate is free forever and ready to use in minutes.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">ContentStudio</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Feature-rich but expensive and complex</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Built-in content discovery</li>
              <li>✅ Automation campaigns</li>
              <li>❌ No free plan — $25/month minimum</li>
              <li>❌ Complex UI with steep learning curve</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Best features locked to higher tiers</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">All platforms. All tools. $0.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Free forever — no trial countdown</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Bulk scheduling free</li>
              <li>✅ Clean, intuitive interface</li>
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
              <span>ContentStudio</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.contentstudio}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why people switch from ContentStudio</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'No free plan means you pay before knowing if it fits',
                desc: 'ContentStudio offers no free tier — just a 14-day trial. Once it ends, you\'re paying $25/month or losing access. SocialMate has a permanent free plan with no expiry. Use it as long as you need, at no cost.',
              },
              {
                n: '2',
                title: 'ContentStudio\'s UI has a steep learning curve',
                desc: 'ContentStudio packs in a lot of features — content discovery, automation, campaigns, analytics — but the interface can be overwhelming for new users. Many spend hours in the documentation before feeling productive. SocialMate is designed to be self-explanatory.',
              },
              {
                n: '3',
                title: 'SocialMate covers platforms ContentStudio skips entirely',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not supported by ContentStudio. If your audience exists on any of these platforms, ContentStudio can\'t help you. SocialMate covers all four for free.',
              },
              {
                n: '4',
                title: 'Key features are locked to higher ContentStudio tiers',
                desc: 'Bulk scheduling, AI writing, and advanced analytics are available only on more expensive ContentStudio plans. You end up paying more for features that SocialMate includes in its free tier.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Skip the $25/month — start free today</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 15+ AI tools, 7 platforms, no complex setup. No credit card required.
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
