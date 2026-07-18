'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',              kontentino: '$99/mo',                socialmate: '$0 — free forever'          },
  { feature: 'Agency plan',                 kontentino: '$99/mo+',               socialmate: '$20/mo'                     },
  { feature: 'Primary focus',               kontentino: 'Enterprise collaboration', socialmate: '6-platform Creator OS'   },
  { feature: 'TikTok scheduling',           kontentino: '✅',                    socialmate: '✅ Full (Production API)'    },
  { feature: 'Bluesky support',             kontentino: '❌',                    socialmate: '✅'                          },
  { feature: 'Discord scheduling',          kontentino: '❌',                    socialmate: '✅ Free'                     },
  { feature: 'Telegram scheduling',         kontentino: '❌',                    socialmate: '✅ Free'                     },
  { feature: 'Client approval workflows',   kontentino: '✅ Core feature',       socialmate: '✅ Built-in free'            },
  { feature: 'AI writing tools',            kontentino: 'Basic AI assist',       socialmate: '20+ social-specific tools'  },
  { feature: 'Autonomous content (SOMA)',   kontentino: '❌',                    socialmate: '✅ (Autopilot/Full Send)'    },
  { feature: 'Trading bot (Enki)',          kontentino: '❌',                    socialmate: '✅ Free paper trading'       },
  { feature: 'Bulk scheduling',             kontentino: '✅',                    socialmate: '✅ Free'                     },
  { feature: 'Analytics dashboard',         kontentino: '✅',                    socialmate: '✅ Full analytics + Content DNA' },
  { feature: 'Free plan available',         kontentino: '❌',                    socialmate: '✅ Full scheduling + AI'     },
  { feature: 'No per-channel fees',         kontentino: '✅',                    socialmate: '✅'                          },
  { feature: 'Client workspaces',           kontentino: '✅',                    socialmate: '✅ Agency plan $20/mo'       },
]

const FAQ = [
  {
    q: "What is Kontentino?",
    a: "Kontentino is an enterprise-grade social media collaboration tool popular with larger agencies and marketing teams. It features content calendars, client approval workflows, and team management. It starts at $99/month, targeting mid-to-large agencies with complex approval needs.",
  },
  {
    q: "How does SocialMate Agency compare to Kontentino for agencies?",
    a: "SocialMate Agency is $20/month vs Kontentino at $99/month — 5x cheaper. Both offer client approval workflows and team collaboration. SocialMate adds Discord, Telegram, Bluesky, 20+ AI tools, and SOMA autonomous content — none of which Kontentino provides.",
  },
  {
    q: "Does Kontentino support Discord, Telegram, or Bluesky?",
    a: "No. Kontentino focuses on mainstream platforms like Facebook, Instagram, LinkedIn, and Twitter. Discord, Telegram, and Bluesky are not supported. SocialMate covers all three, which is increasingly important for community-driven brands and tech-forward agencies.",
  },
  {
    q: "Is SocialMate suitable for enterprise agency use?",
    a: "SocialMate's Agency plan at $20/month supports 15 seats, 5 client workspaces, 2,000 AI credits/month, approval workflows, and 7 live platforms. For bootstrapped or growing agencies, it provides enterprise-level workflows at a fraction of the cost. Larger enterprises needing SOC2 compliance or dedicated account managers should evaluate accordingly.",
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

export default function VsKontentinoPage() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-ink-high">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* NAV */}
      <nav className="border-b border-edge bg-[#0a0a0a] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold tracking-tight">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-ink-body hover:text-ink-high transition-colors">{t('vs_shared.nav_login')}</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-amber/10 text-ink-high rounded-xl hover:bg-amber/10 transition-all">{t('vs_shared.nav_start_free')}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* HERO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber rounded-full px-4 py-1.5 text-xs font-bold text-amber mb-4">
            Updated May 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            SocialMate vs Kontentino
          </h1>
          <p className="text-lg text-ink-body max-w-2xl mx-auto">
            Kontentino is an enterprise collaboration tool at $99/month. SocialMate Agency is $20/month — same approval workflows, more platforms, 20+ AI tools, and SOMA autonomous content.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-amber/10 text-ink-high font-bold rounded-2xl hover:bg-amber/10 transition-all text-sm">
              {t('vs_shared.cta_try_free')}
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-edge font-semibold rounded-2xl hover:border-edge transition-all text-sm text-ink-high">
              {t('vs_shared.cta_see_pricing')}
            </Link>
          </div>
        </div>

        {/* VERDICT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-panel border-2 border-edge rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wide mb-2">Kontentino</p>
            <p className="font-extrabold text-lg mb-2">Enterprise collaboration. Enterprise price tag.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Client approval workflows</li>
              <li>✅ Calendar-based team planning</li>
              <li>❌ $99/mo+ starting price</li>
              <li>❌ No Discord, Telegram, or Bluesky</li>
              <li>❌ No autonomous AI content (SOMA)</li>
              <li>❌ No free plan</li>
            </ul>
          </div>
          <div className="bg-amber/10 text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-high uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Agency OS. 5x cheaper. More of everything.</p>
            <ul className="space-y-1 text-xs text-ink-high">
              <li>✅ Full client approval workflows (free)</li>
              <li>✅ 7 platforms including Discord + Telegram + Bluesky</li>
              <li>✅ 20+ AI content tools</li>
              <li>✅ SOMA: autonomous weekly content generation</li>
              <li>✅ Agency plan: $20/month</li>
              <li>✅ Free plan available</li>
            </ul>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-body uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Kontentino</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-body">{row.kontentino}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">Why agencies choose SocialMate over Kontentino</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: "Kontentino costs 5x more than SocialMate Agency",
                desc: "Kontentino starts at $99/month. SocialMate Agency is $20/month — that is $79/month saved, every month. Both include client approval workflows. SocialMate adds 7 platforms, 20+ AI tools, SOMA, and Enki that Kontentino does not have at any price.",
              },
              {
                n: '2',
                title: 'SocialMate covers Discord, Telegram, and Bluesky — Kontentino does not',
                desc: "Many agencies now manage clients with Discord servers, Telegram channels, or growing Bluesky audiences. Kontentino does not support any of these. SocialMate covers all three — letting agencies offer more platform coverage to clients without extra tools.",
              },
              {
                n: '3',
                title: 'SOMA gives agencies autonomous content generation — Kontentino has none',
                desc: "Kontentino is a collaboration and approval tool. It has no autonomous content system. SocialMate's SOMA can generate a full week of platform-native posts automatically, reducing the writing workload for agency teams and getting more content to clients faster.",
              },
              {
                n: '4',
                title: 'SocialMate has a free plan — Kontentino requires payment to start',
                desc: "Kontentino has no free plan. You must pay to even evaluate the product. SocialMate is free to start, letting agencies test the platform with real clients before committing to a paid plan.",
              },
            ].map((r) => (
              <div key={r.n} className="flex gap-4 p-5 bg-panel border border-edge rounded-2xl hover:border-edge transition-all">
                <div className="w-8 h-8 bg-amber/10 text-ink-high rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0">{r.n}</div>
                <div>
                  <p className="text-sm font-extrabold mb-1 text-ink-high">{r.title}</p>
                  <p className="text-xs text-ink-body leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">{t('vs_shared.faq_heading')}</h2>
          <div className="space-y-4">
            {FAQ.map((faq, i) => (
              <div key={i} className="p-5 bg-panel border border-edge rounded-2xl">
                <p className="text-sm font-extrabold mb-2 text-ink-high">{faq.q}</p>
                <p className="text-xs text-ink-body leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-amber/10 text-ink-high rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Agency-grade tools at $20/month — not $99</h2>
          <p className="text-ink-high text-sm mb-6 max-w-lg mx-auto">
            SocialMate Agency: 5 client workspaces, 15 seats, approval workflows, 7 platforms, 20+ AI tools, SOMA autonomous content — all for $20/month.
          </p>
          <Link href="/signup" className="inline-block bg-void text-ink-high font-bold px-8 py-3.5 rounded-2xl hover:opacity-80 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-ink-high text-xs mt-3">{t('vs_shared.cta_no_card')}</p>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
