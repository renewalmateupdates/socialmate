'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',            recurpost: '$25/month (Personal)',       socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 recurpost: '✅ (100 posts lifetime cap)', socialmate: '✅ 100 posts/month free' },
  { feature: 'Free plan post limit',      recurpost: '100 posts — lifetime',       socialmate: 'No limit ever'           },
  { feature: 'Social accounts (free)',    recurpost: '3 accounts',                 socialmate: 'No hard cap (free tier)' },
  { feature: 'Bulk scheduling',           recurpost: 'Paid plans',                 socialmate: '✅ Free'                 },
  { feature: 'Discord support',           recurpost: '❌',                         socialmate: '✅'                      },
  { feature: 'Telegram support',          recurpost: '❌',                         socialmate: '✅'                      },
  { feature: 'Mastodon support',          recurpost: '❌',                         socialmate: '✅'                      },
  { feature: 'Bluesky support',           recurpost: '❌',                         socialmate: '✅'                      },
  { feature: 'AI writing tools',          recurpost: 'Limited AI assist',          socialmate: '15+ tools included'       },
  { feature: 'AI credits free tier',      recurpost: 'Very limited',               socialmate: '50/month free'           },
  { feature: 'Link in bio',               recurpost: '❌',                         socialmate: '✅ Free'                 },
  { feature: 'Hashtag manager',           recurpost: 'Paid plans',                 socialmate: '✅ Free'                 },
  { feature: 'Evergreen recycling',       recurpost: '✅ Core feature',            socialmate: '✅ Free'                 },
  { feature: 'Competitor tracking',       recurpost: '❌',                         socialmate: '✅ Free (3 accounts)'   },
  { feature: 'RSS import',                recurpost: 'Paid plans',                 socialmate: '✅ Free'                 },
  { feature: 'Content libraries',         recurpost: '✅ Core feature',            socialmate: '✅ Free'                 },
  { feature: 'Analytics',                 recurpost: 'Basic free, paid for full',  socialmate: '✅ Free'                 },
]

const FAQ = [
  {
    q: "What is RecurPost's 100-post lifetime cap?",
    a: "RecurPost's free plan allows you to create up to 100 posts in total — not 100 per month, but 100 ever. Once you schedule 100 posts across all your accounts, the free plan is exhausted. SocialMate has no lifetime post limit.",
  },
  {
    q: "What is RecurPost's main feature?",
    a: 'RecurPost specializes in content recycling — it lets you build libraries of evergreen posts that automatically repeat on a schedule. This is a genuinely useful feature. SocialMate includes evergreen recycling on the free plan, with no post cap.',
  },
  {
    q: 'Which platforms does SocialMate support that RecurPost does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which RecurPost covers. If any part of your audience is on community or decentralized platforms, RecurPost cannot help.',
  },
  {
    q: 'Is SocialMate a good RecurPost alternative for evergreen content?',
    a: 'Yes. SocialMate includes evergreen recycling, content libraries, bulk scheduling, and 15+ AI tools — all free, with no 100-post lifetime cap. RecurPost charges $25/month to remove that cap.',
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

export default function VsRecurPostPage() {
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
            SocialMate vs RecurPost
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            RecurPost free plan: 3 accounts and 100 posts lifetime — use them up and you are done. SocialMate is free forever with no lifetime limit on posts.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">RecurPost</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Good recycling — but free plan burns out</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Evergreen content recycling</li>
              <li>✅ Content libraries</li>
              <li>❌ 100-post lifetime cap on free plan</li>
              <li>❌ $25/month to remove the cap</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Bulk scheduling locked to paid plans</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">No lifetime cap. All platforms. $0.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Free forever — no lifetime post limit</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Evergreen recycling free</li>
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
              <span>RecurPost</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.recurpost}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why people switch from RecurPost</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'The 100-post lifetime cap is a fundamental free plan problem',
                desc: '100 posts is not a monthly limit — it is a total cap on your entire free account. Post consistently across 3 accounts for a few weeks and you exhaust it. This is a trial in disguise, not a free plan. SocialMate has no lifetime limit.',
              },
              {
                n: '2',
                title: '$25/month just to remove the cap — before you get any advanced features',
                desc: 'RecurPost charges $25/month on the Personal plan just to unlock unlimited posts. Advanced features like bulk scheduling and RSS import require higher tiers. SocialMate includes both for free.',
              },
              {
                n: '3',
                title: 'RecurPost recycling is great — SocialMate recycling is also free',
                desc: "RecurPost's main selling point is evergreen content recycling — automatically reposting your best content on a schedule. SocialMate includes the same feature at no cost, so you do not need to pay $25/month for what SocialMate gives you free.",
              },
              {
                n: '4',
                title: 'SocialMate covers platforms RecurPost does not',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not supported by RecurPost. SocialMate covers all four on the free plan, plus the full range of mainstream platforms.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">No lifetime caps — start free today</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — 100 posts/month, evergreen recycling, 15+ AI tools, 7 platforms. No credit card required.
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
