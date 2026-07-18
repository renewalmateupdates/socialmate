'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

const COMPARISON = [
  { feature: 'Price',                     creatorstudio: 'Free',                   socialmate: '$0 — free forever'        },
  { feature: 'Instagram scheduling',      creatorstudio: '✅',                      socialmate: 'Coming soon'              },
  { feature: 'Facebook scheduling',       creatorstudio: '✅',                      socialmate: 'Coming soon'              },
  { feature: 'TikTok scheduling',         creatorstudio: '❌',                      socialmate: '✅ (Production API live)'  },
  { feature: 'Discord scheduling',        creatorstudio: '❌',                      socialmate: '✅'                        },
  { feature: 'Telegram scheduling',       creatorstudio: '❌',                      socialmate: '✅'                        },
  { feature: 'Bluesky scheduling',        creatorstudio: '❌',                      socialmate: '✅'                        },
  { feature: 'Mastodon scheduling',       creatorstudio: '❌',                      socialmate: '✅'                        },
  { feature: 'LinkedIn scheduling',       creatorstudio: '❌',                      socialmate: '✅'                        },
  { feature: 'X / Twitter scheduling',    creatorstudio: '❌',                      socialmate: '✅'                        },
  { feature: 'AI writing tools',          creatorstudio: '❌',                      socialmate: '15+ tools free'            },
  { feature: 'Bulk scheduling',           creatorstudio: '❌',                      socialmate: '✅ Free'                   },
  { feature: 'Link in bio (SIGIL)',        creatorstudio: '❌',                      socialmate: '✅ Free'                   },
  { feature: 'Competitor tracking',       creatorstudio: '❌',                      socialmate: '✅ Free (3 accounts)'     },
  { feature: 'Analytics beyond Meta',     creatorstudio: '❌',                      socialmate: '✅ Multi-platform'        },
]

const FAQ = [
  {
    q: "Is Meta Creator Studio still available in 2026?",
    a: "Meta has been transitioning users from Creator Studio to Meta Business Suite and Meta Business Center. The functionality exists but the platform has been fragmented. Regardless of the Meta rebranding, the core limitation remains: it only works for Instagram and Facebook.",
  },
  {
    q: 'Why should I use SocialMate instead of Creator Studio?',
    a: "If your audience is only on Instagram and Facebook, Creator Studio is free and works fine. But most creators also have communities on Discord, Telegram, Bluesky, TikTok, LinkedIn, and Mastodon. SocialMate covers all of these in one dashboard with bulk scheduling and 15+ AI writing tools — also free to start.",
  },
  {
    q: 'Does SocialMate support Instagram?',
    a: "Instagram requires Meta App Review for API access. We are working toward it — it is on the roadmap. For now, SocialMate covers 7 platforms where the APIs are open or approved. If Instagram is your only platform, Creator Studio works for that use case.",
  },
  {
    q: 'What platforms does SocialMate cover that Creator Studio does not?',
    a: "TikTok, Discord, Telegram, Bluesky, Mastodon, LinkedIn, and X/Twitter. That is 7 platforms where Creator Studio has zero coverage. If any of your audience lives on these platforms, you need SocialMate.",
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

export default function VsCreatorstudioPage() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-screen bg-panel">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <nav className="border-b border-edge bg-panel sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold tracking-tight text-ink-high">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-ink-body hover:text-ink-high transition-colors">{t('vs_shared.nav_login')}</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-amber/10 text-ink-high rounded-xl hover:opacity-80 transition-all">{t('vs_shared.nav_start_free')}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-raised border border-edge-lit rounded-full px-4 py-1.5 text-xs font-bold text-ink-muted mb-4">
            Updated June 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs Meta Creator Studio
          </h1>
          <p className="text-lg text-ink-body max-w-2xl mx-auto">
            Creator Studio only covers Instagram and Facebook. SocialMate covers 7 platforms — Discord, TikTok, Telegram, Bluesky, LinkedIn, Mastodon, and X — with 15+ AI tools. Also free.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-amber/10 text-ink-high font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
              {t('vs_shared.cta_try_free')}
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-edge font-semibold rounded-2xl hover:border-edge transition-all text-sm text-ink-high">
              {t('vs_shared.cta_see_pricing')}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-panel border-2 border-edge rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Meta Creator Studio</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Instagram + Facebook only. Nothing more.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Free (Meta-owned tool)</li>
              <li>✅ Works for Instagram and Facebook</li>
              <li>❌ Zero support for TikTok, Discord, Telegram</li>
              <li>❌ No Bluesky, Mastodon, LinkedIn, or X</li>
              <li>❌ No AI writing tools</li>
              <li>❌ No bulk scheduling</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">7 platforms. AI tools. Actually free.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ TikTok, Discord, Telegram, Bluesky, LinkedIn</li>
              <li>✅ Mastodon, X/Twitter, and more coming</li>
              <li>✅ 15+ AI writing tools on free tier</li>
              <li>✅ Bulk scheduling, competitor tracking, analytics</li>
              <li>✅ SIGIL link in bio — free</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-body uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Creator Studio</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-body">{row.creatorstudio}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div></div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why Meta-only is not enough in 2026</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Your audience is not only on Meta platforms',
                desc: "In 2026, creators have communities spread across TikTok, Discord, Telegram, Bluesky, LinkedIn, and Mastodon. Creator Studio sees none of these. If you only schedule for Instagram and Facebook, you are leaving most of your audience without fresh content.",
              },
              {
                n: '2',
                title: 'No AI tools, no bulk scheduling',
                desc: "Creator Studio does not have AI writing tools. You still write every caption manually for every post. SocialMate's 15+ AI tools generate captions, hashtags, threads, hooks, and repurposed content — then schedule it all in bulk across 7 platforms.",
              },
              {
                n: '3',
                title: 'Meta platform risk',
                desc: "Building your entire content workflow on a tool controlled by one platform (Meta) creates dependency risk. Meta has changed, restricted, or deprecated tools without warning. SocialMate is an independent multi-platform OS that does not rely on Meta\'s infrastructure.",
              },
              {
                n: '4',
                title: 'The open social web is where discovery is happening',
                desc: "Bluesky, Mastodon, and Discord are where tech-forward audiences are moving. These are open platforms with real algorithmic reach for new creators. Creator Studio cannot touch any of them. SocialMate covers all three — for free.",
              },
            ].map((r) => (
              <div key={r.n} className="flex gap-4 p-5 bg-raised border border-edge rounded-2xl hover:border-edge transition-all">
                <div className="w-8 h-8 bg-amber/10 text-ink-high rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0">{r.n}</div>
                <div>
                  <p className="text-sm font-extrabold mb-1 text-ink-high">{r.title}</p>
                  <p className="text-xs text-ink-body leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.faq_heading')}</h2>
          <div className="space-y-4">
            {FAQ.map((faq, i) => (
              <div key={i} className="p-5 bg-raised border border-edge rounded-2xl">
                <p className="text-sm font-extrabold mb-2 text-ink-high">{faq.q}</p>
                <p className="text-xs text-ink-body leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-void text-ink-high rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Post beyond Meta. Reach your full audience.</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            7 platforms, 15+ AI tools, bulk scheduling — free to start. No credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-amber/10 text-ink-high font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-ink-muted text-xs mt-3">{t('vs_shared.cta_no_card')}</p>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
