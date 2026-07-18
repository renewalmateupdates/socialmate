'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',          sendible: '$29/month (Creator)',      socialmate: '$0 — free forever'       },
  { feature: 'Free plan',               sendible: '❌ None',                   socialmate: '✅ Free forever'         },
  { feature: 'Users on starting plan',  sendible: '1 user',                   socialmate: '2 users free'            },
  { feature: 'Profiles on starting plan', sendible: '6 profiles',             socialmate: 'No hard cap (free tier)' },
  { feature: 'Pricing model',           sendible: 'Agency-tiered',            socialmate: 'Flat rate'               },
  { feature: 'Discord support',         sendible: '❌',                        socialmate: '✅'                      },
  { feature: 'Telegram support',        sendible: '❌',                        socialmate: '✅'                      },
  { feature: 'Mastodon support',        sendible: '❌',                        socialmate: '✅'                      },
  { feature: 'Bluesky support',         sendible: '❌',                        socialmate: '✅'                      },
  { feature: 'AI writing tools',        sendible: 'Basic AI assist',          socialmate: '15+ tools included'       },
  { feature: 'AI credits free tier',    sendible: 'N/A (no free plan)',       socialmate: '50/month free'            },
  { feature: 'Bulk scheduling',         sendible: 'Paid plans',               socialmate: '✅ Free'                  },
  { feature: 'Link in bio',             sendible: '❌',                        socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',         sendible: 'Paid plans',               socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',     sendible: 'Higher tiers',             socialmate: '✅ Free (3 accounts)'    },
  { feature: 'RSS import',              sendible: '✅ Paid plans',             socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',     sendible: '✅ Paid plans',             socialmate: '✅ Free'                  },
  { feature: 'Client workspaces',       sendible: 'White-label ($199+/mo)',   socialmate: 'Pro+: from $5/mo'        },
]

const FAQ = [
  {
    q: 'Does Sendible have a free plan?',
    a: 'No. Sendible has no free plan at all. Their cheapest option is the Creator plan at $29/month, which gives you 1 user and 6 social profiles. SocialMate is completely free to start with no credit card required.',
  },
  {
    q: 'Who is Sendible built for?',
    a: 'Sendible is primarily designed for agencies managing multiple client accounts. That means the pricing tiers, onboarding, and feature set are all built around agency workflows. If you are a solo creator, small team, or indie brand, you will be paying agency prices for features you do not need.',
  },
  {
    q: 'Which platforms does SocialMate support that Sendible does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which Sendible covers. If your community is on any of these growing platforms, Sendible simply is not an option.',
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. Free tier includes 100 posts/month, 50 AI credits/month, bulk scheduling, link in bio, hashtag manager, competitor tracking, RSS import, and evergreen recycling. No credit card required and no free trial countdown.',
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

export default function VsSendiblePage() {
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
            SocialMate vs Sendible
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Sendible starts at $29/mo for 1 user and 6 profiles — with no free plan. SocialMate is free forever, no credit card required.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Sendible</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Agency tool with agency pricing</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Strong client reporting</li>
              <li>✅ White-label options for agencies</li>
              <li>❌ No free plan at all</li>
              <li>❌ $29/mo for only 1 user + 6 profiles</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Overkill complexity for solo users</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Full feature set. Zero dollars.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Free forever — no trial countdown</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Bulk scheduling free</li>
              <li>✅ 2 team seats on free plan</li>
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
              <span>Sendible</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.sendible}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why people switch from Sendible</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Sendible has no free plan — at all',
                desc: 'There is no trial that converts to free. Once your trial ends, you pay $29/month or you are locked out. SocialMate has no trial countdown — the free plan is permanent, with full access to bulk scheduling, AI tools, and more.',
              },
              {
                n: '2',
                title: '$29/mo is a lot for 1 user and 6 profiles',
                desc: 'Sendible\'s Creator plan gives you exactly 1 user seat and 6 social profiles. If you manage more than 6 accounts or want to add a collaborator, you move to the next tier. SocialMate gives you more flexibility at $0.',
              },
              {
                n: '3',
                title: 'Sendible is built for agencies — not for you',
                desc: 'Sendible\'s onboarding, pricing structure, and feature set are designed around agencies managing dozens of client accounts. If you are building your own brand or running a small team, the complexity and cost are not worth it.',
              },
              {
                n: '4',
                title: 'SocialMate covers platforms Sendible ignores',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not supported by Sendible. If any part of your audience lives on these platforms, you need a tool that covers them. SocialMate does — on the free plan.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Why pay $29/mo when $0 works?</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 15+ AI tools, 7 platforms, no credit card required.
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
