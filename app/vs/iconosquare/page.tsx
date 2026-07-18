'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',              iconosquare: '$49/month (Solo plan)',         socialmate: '$0 — free forever'        },
  { feature: 'Free plan',                   iconosquare: '❌ None',                        socialmate: '✅ Free forever'          },
  { feature: 'Primary purpose',             iconosquare: 'Analytics & reporting',         socialmate: 'Scheduling + analytics'   },
  { feature: 'Scheduling included',         iconosquare: 'Limited (add-on focus)',        socialmate: '✅ Core feature'          },
  { feature: 'Instagram support',           iconosquare: '✅ Primary platform',           socialmate: '✅ (approval pending)'    },
  { feature: 'Facebook support',            iconosquare: '✅',                             socialmate: '✅ (approval pending)'    },
  { feature: 'TikTok support',              iconosquare: '✅',                             socialmate: '✅ Live'                  },
  { feature: 'Discord support',             iconosquare: '❌',                             socialmate: '✅'                       },
  { feature: 'Telegram support',            iconosquare: '❌',                             socialmate: '✅'                       },
  { feature: 'Mastodon support',            iconosquare: '❌',                             socialmate: '✅'                       },
  { feature: 'Bluesky support',             iconosquare: '❌',                             socialmate: '✅'                       },
  { feature: 'AI writing tools',            iconosquare: '❌',                             socialmate: '15+ tools included'        },
  { feature: 'AI credits free tier',        iconosquare: 'N/A (no free plan)',            socialmate: '50/month free'            },
  { feature: 'Bulk scheduling',             iconosquare: '❌',                             socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                 iconosquare: '❌',                             socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',             iconosquare: 'Basic (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',         iconosquare: '❌',                             socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',         iconosquare: '✅ Deep analytics (paid)',      socialmate: '✅ Free (3 accounts)'     },
  { feature: 'RSS import',                  iconosquare: '❌',                             socialmate: '✅ Free'                  },
  { feature: 'Heavy reporting features',    iconosquare: '✅ Extensive',                  socialmate: 'Core analytics free'      },
]

const FAQ = [
  {
    q: 'Is Iconosquare a social media scheduler?',
    a: 'Not primarily. Iconosquare is an analytics-first platform. It does include some scheduling features, but its core offering is deep Instagram and Facebook reporting. If you need to actually schedule posts across multiple platforms, Iconosquare is not built for that. SocialMate covers both scheduling and analytics with no monthly fee.',
  },
  {
    q: 'Does Iconosquare have a free plan?',
    a: 'No. Iconosquare has no free plan of any kind. Their cheapest option is the Solo plan at $49/month. SocialMate is completely free to start — no credit card required, no trial countdown.',
  },
  {
    q: 'Which platforms does SocialMate support that Iconosquare does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which Iconosquare covers. Iconosquare is focused on Instagram, Facebook, and TikTok analytics. If your audience is on any other platform, Iconosquare cannot help you.',
  },
  {
    q: 'Who is Iconosquare actually built for?',
    a: 'Iconosquare is built for brands and agencies that need deep Instagram/Facebook analytics and can justify $49/month or more for reporting features. If you\'re a creator, small business, or anyone who needs multi-platform scheduling with AI tools, SocialMate is a better fit and costs nothing to start.',
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

export default function VsIconosquarePage() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-dvh bg-panel">
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
            SocialMate vs Iconosquare
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Iconosquare is an analytics tool that starts at $49/month with no free plan. SocialMate is a real scheduler with analytics — free forever.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Iconosquare</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Analytics-first, not a scheduler</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Deep Instagram/Facebook analytics</li>
              <li>✅ Competitor benchmarking reports</li>
              <li>❌ No free plan — $49/month minimum</li>
              <li>❌ Not built primarily for scheduling</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ No AI writing tools</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Schedule + analytics. $0.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Free forever — no trial countdown</li>
              <li>✅ Real scheduling across 7 platforms</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
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
              <span>Iconosquare</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.iconosquare}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why people switch from Iconosquare</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'You need a scheduler, not just an analytics platform',
                desc: 'Iconosquare is built around reporting — follower growth, post performance, audience demographics. Those are useful features, but they are not a scheduling tool. If your primary need is to plan and publish content consistently across multiple platforms, Iconosquare is the wrong tool for the job. SocialMate is a full scheduler with analytics built in.',
              },
              {
                n: '2',
                title: '$49/month with no free plan is hard to justify for smaller teams',
                desc: 'Iconosquare\'s Solo plan starts at $49/month — before you can even evaluate whether the depth of analytics justifies that price. There is no free tier to test it against your workflow. SocialMate is free forever, no credit card required, so you can test everything before deciding whether to upgrade.',
              },
              {
                n: '3',
                title: 'Most creators never use the heavy reporting features',
                desc: 'Iconosquare\'s detailed reporting suite is valuable for enterprise marketing teams and agencies managing large brand accounts. But most creators and small businesses don\'t need audience demographic exports and executive-level dashboards. You pay for features you never open. SocialMate gives you the analytics that actually matter at no cost.',
              },
              {
                n: '4',
                title: 'SocialMate covers platforms Iconosquare ignores entirely',
                desc: 'Iconosquare is built around Instagram, Facebook, and TikTok. Discord, Telegram, Mastodon, and Bluesky are not on the roadmap. If any part of your audience is on these platforms — community servers, decentralized social, or the growing Bluesky network — Iconosquare offers nothing. SocialMate covers all of them, free.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Skip the $49/month analytics bill — start free today</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 15+ AI tools, 7 platforms, analytics included. No credit card required.
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
