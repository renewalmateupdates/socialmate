'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',              socialrails: '$29/month',               socialmate: '$0 — free forever'        },
  { feature: 'Free plan',                   socialrails: '❌ None',                  socialmate: '✅ Free forever'          },
  { feature: 'Platforms supported',         socialrails: '9',                        socialmate: '16 (growing)'             },
  { feature: 'Discord support',             socialrails: '❌',                        socialmate: '✅'                       },
  { feature: 'Telegram support',            socialrails: '❌',                        socialmate: '✅'                       },
  { feature: 'Mastodon support',            socialrails: '✅',                        socialmate: '✅'                       },
  { feature: 'Bluesky support',             socialrails: '✅',                        socialmate: '✅'                       },
  { feature: 'AI writing tools',            socialrails: 'Limited',                  socialmate: '15+ tools included'        },
  { feature: 'AI credits',                  socialrails: 'Add-on (extra cost)',       socialmate: '50/month free'            },
  { feature: 'Bulk scheduling',             socialrails: '✅ Paid only',             socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                 socialrails: '❌',                        socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',             socialrails: '❌',                        socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',         socialrails: '✅ Paid plans',            socialmate: '✅ Free'                  },
  { feature: 'RSS import',                  socialrails: '❌',                        socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',         socialrails: '❌',                        socialmate: '✅ Free (3 accounts)'     },
  { feature: 'Analytics',                   socialrails: 'Basic',                    socialmate: '30-day history free'      },
  { feature: 'Team seats (starter)',        socialrails: '0',                        socialmate: '2 users free'             },
  { feature: 'Client workspaces',           socialrails: 'Higher tiers',             socialmate: 'Pro+: from $5/mo'        },
]

const FAQ = [
  {
    q: 'Does SocialRails have a free plan?',
    a: 'No. SocialRails has no free tier of any kind. Their entry plan starts at $29/month. SocialMate is completely free to start — no credit card, no trial, no expiry.',
  },
  {
    q: 'SocialRails supports Mastodon and Bluesky — does SocialMate?',
    a: 'Yes, SocialMate supports both Mastodon and Bluesky. SocialRails deserves credit for supporting decentralized platforms — but SocialMate matches both and adds Discord and Telegram on top, all on the free plan. You get more platform coverage at zero cost.',
  },
  {
    q: 'Why is AI an add-on on SocialRails but free on SocialMate?',
    a: 'SocialRails offers limited AI functionality and requires an additional purchase to unlock more credits or tools. SocialMate includes 12 AI writing tools and 50 AI credits per month on the free tier — no add-on purchase required.',
  },
  {
    q: 'Is SocialMate genuinely free or does it get limited quickly?',
    a: 'The free tier is designed to be fully usable without upgrading. It includes unlimited post scheduling, 50 AI credits/month, bulk scheduling, link in bio, hashtag manager, competitor tracking (3 accounts), RSS import, and evergreen recycling. No credit card required.',
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

export default function VsSocialRailsPage() {
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
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-xs font-semibold text-ink-muted hover:text-ink-high dark:hover:text-ink-high transition-colors">Blog</Link>
            <Link href="/pricing" className="text-xs font-semibold text-ink-muted hover:text-ink-high dark:hover:text-ink-high transition-colors">Pricing</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-void text-ink-high rounded-xl hover:opacity-80 transition-all">Try free →</Link>
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
            SocialMate vs SocialRails
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            SocialRails starts at $29/month with no free plan and still skips Discord and Telegram. SocialMate is free forever with more platforms and more tools included.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-void text-ink-high font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
              {t('vs_shared.cta_try_free')}
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-edge font-semibold rounded-2xl hover:border-edge transition-all text-sm text-ink-high">
              {t('vs_shared.cta_see_pricing')}
            </Link>
          </div>
          <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
            {['7 platforms', 'Discord + Telegram', '15+ AI tools free', 'Free forever'].map((pill) => (
              <span key={pill} className="text-xs font-semibold bg-raised text-ink-muted px-3 py-1 rounded-full">
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* VERDICT BANNER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-panel border-2 border-edge rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialRails</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Decent for fediverse — pricey for what you get</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Mastodon and Bluesky support</li>
              <li>✅ Evergreen recycling (paid)</li>
              <li>❌ No free plan — $29/month minimum</li>
              <li>❌ No Discord or Telegram</li>
              <li>❌ AI is a paid add-on</li>
              <li>❌ No link in bio, hashtag manager, or competitor tracking</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">All platforms. All tools. $0.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Free forever — no trial countdown</li>
              <li>✅ Mastodon, Bluesky, Discord, and Telegram</li>
              <li>✅ 15+ AI tools included on free tier</li>
              <li>✅ Link in bio, hashtag manager, evergreen recycling</li>
              <li>✅ Competitor tracking and RSS import free</li>
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
              <span>SocialRails</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.socialrails}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why people switch from SocialRails</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '$29/month is a steep floor with no free option',
                desc: 'SocialRails has no free plan whatsoever. You pay $29/month from day one with no way to evaluate the tool on a live account before committing. SocialMate is free forever — you can use it fully, indefinitely, without entering a credit card.',
              },
              {
                n: '2',
                title: 'Discord and Telegram are missing — and they matter',
                desc: 'SocialRails supports Mastodon and Bluesky, which is legitimately good. But Discord servers and Telegram channels are where a large portion of online communities actually live. SocialMate supports all four decentralized and community platforms: Mastodon, Bluesky, Discord, and Telegram — all on the free plan.',
              },
              {
                n: '3',
                title: 'AI is an add-on, not a feature',
                desc: "SocialRails treats AI as a premium add-on — you get limited functionality and need to pay more to unlock AI credits. SocialMate includes 12 AI writing tools and 75 free AI credits per month in the base free tier. You don't pay extra to use AI.",
              },
              {
                n: '4',
                title: 'Missing tools that should be standard',
                desc: 'Link in bio, hashtag manager, competitor tracking, and RSS import are absent from SocialRails at any tier. These are not niche features — they are part of day-to-day content management for most creators and marketers. SocialMate includes all of them on the free plan.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Skip the $29/month — start free today</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — 7 platforms including Discord and Telegram, 15+ AI tools, link in bio, hashtag manager. No credit card required.
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
