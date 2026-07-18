'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',          socialpilot: '$25.50/month (annual)', socialmate: '$0 — free forever'       },
  { feature: 'Free plan',               socialpilot: '❌ None',                socialmate: '✅ Free forever'         },
  { feature: 'Users on base plan',      socialpilot: '1 user',                socialmate: '2 users free'            },
  { feature: 'Accounts on base plan',   socialpilot: '10 accounts',           socialmate: 'No hard cap (free tier)' },
  { feature: 'Pricing model',           socialpilot: 'Per user tiered',       socialmate: 'Flat rate'               },
  { feature: 'Discord support',         socialpilot: '❌',                     socialmate: '✅'                      },
  { feature: 'Telegram support',        socialpilot: '❌',                     socialmate: '✅'                      },
  { feature: 'Mastodon support',        socialpilot: '❌',                     socialmate: '✅'                      },
  { feature: 'Bluesky support',         socialpilot: '❌',                     socialmate: '✅'                      },
  { feature: 'AI writing tools',        socialpilot: 'AI Assistant (basic)',  socialmate: '15+ tools included'       },
  { feature: 'AI credits free tier',    socialpilot: 'N/A (no free plan)',    socialmate: '50/month free'            },
  { feature: 'Bulk scheduling',         socialpilot: '✅ Paid plans',          socialmate: '✅ Free'                  },
  { feature: 'Link in bio',             socialpilot: '❌',                     socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',         socialpilot: '✅ Paid plans',          socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',     socialpilot: '❌',                     socialmate: '✅ Free (3 accounts)'    },
  { feature: 'RSS import',              socialpilot: '✅ Paid plans',          socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',     socialpilot: '✅ Higher plans',        socialmate: '✅ Free'                  },
  { feature: 'Client workspaces',       socialpilot: 'Agency plan ($85+/mo)', socialmate: 'Pro+: from $5/mo'        },
]

const FAQ = [
  {
    q: 'Does SocialPilot have a free plan?',
    a: 'No. SocialPilot has no free plan at all — not even a limited one. Their cheapest option is the Professional plan at $25.50/month billed annually (or $30/month billed monthly), which gives 1 user and 10 social accounts. SocialMate is completely free to start with no credit card required.',
  },
  {
    q: 'Is SocialPilot really "affordable"?',
    a: 'SocialPilot markets itself as a budget-friendly tool, and compared to Sprout Social it is. But $25.50/month with no free tier to try it first is still a real commitment. SocialMate lets you use the full core feature set at $0 indefinitely — so you can decide if you want to upgrade based on actual usage, not a 14-day trial.',
  },
  {
    q: 'Which platforms does SocialMate support that SocialPilot does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which SocialPilot covers. SocialPilot is heavily focused on Instagram, Facebook, Twitter/X, and LinkedIn. If your community lives on newer or decentralized platforms, SocialPilot simply does not reach them.',
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. The free tier includes 100 posts/month, 50 AI credits per month, bulk scheduling, link in bio, hashtag manager, competitor tracking (3 accounts), RSS import, and evergreen recycling. No credit card required and no countdown timer before the free plan expires.',
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

export default function VsSocialPilotPage() {
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
            SocialMate vs SocialPilot
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            SocialPilot calls itself affordable — but there is no free plan. SocialMate is free forever, with Discord, Bluesky, Telegram, and Mastodon supported natively.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialPilot</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Affordable pricing, zero free tier</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Decent bulk scheduling tools</li>
              <li>✅ Client management for agencies</li>
              <li>❌ No free plan at all</li>
              <li>❌ $25.50/mo minimum commitment</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Heavy Instagram/Facebook focus</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Truly free. Every platform.</p>
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
              <span>SocialPilot</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.socialpilot}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why people switch from SocialPilot</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '"Affordable" still means $25.50/month before you post a single thing',
                desc: 'SocialPilot requires a paid plan from day one. There is no free tier, no permanent trial, no way to evaluate the tool without a credit card on file. SocialMate is free forever — use bulk scheduling, AI tools, and all core features with zero financial commitment.',
              },
              {
                n: '2',
                title: 'SocialPilot is built around Instagram and Facebook',
                desc: 'SocialPilot\'s platform support is weighted toward Meta properties and Twitter/X. Discord, Telegram, Mastodon, and Bluesky are not supported at all. If any part of your audience is on community or decentralized platforms, you need a different tool — like SocialMate.',
              },
              {
                n: '3',
                title: '15+ AI tools vs a basic AI assistant',
                desc: 'SocialMate includes caption generation, viral hook writing, hashtag research, thread creation, post scoring, content repurposing, trend scanning, and more — all on the free tier. SocialPilot has a basic AI assistant that does not come close to matching that depth.',
              },
              {
                n: '4',
                title: 'Competitor tracking and link in bio are missing entirely',
                desc: 'SocialPilot does not include competitor tracking or a link-in-bio tool. SocialMate offers both on the free plan. Tracking up to 3 competitor accounts and publishing a branded link page costs you nothing.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">No free plan? No deal.</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 15+ AI tools, 7 platforms including Discord and Bluesky. No credit card required.
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
