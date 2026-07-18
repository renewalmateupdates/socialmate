'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',                   planly: '$15/month',              socialmate: '$0 — free forever'          },
  { feature: 'TikTok on free plan',              planly: '❌',                      socialmate: '✅ Free'                    },
  { feature: 'TikTok videos/month (free)',       planly: '—',                       socialmate: '20/month'                   },
  { feature: 'TikTok videos/month (paid)',       planly: 'Unlimited',               socialmate: '60 Pro / 200 Agency'        },
  { feature: 'Discord support',                  planly: '❌',                      socialmate: '✅'                         },
  { feature: 'Telegram support',                 planly: '❌',                      socialmate: '✅'                         },
  { feature: 'Mastodon support',                 planly: '❌',                      socialmate: '✅'                         },
  { feature: 'Bluesky support',                  planly: '❌',                      socialmate: '✅'                         },
  { feature: 'AI writing tools',                 planly: 'Basic',                   socialmate: '15+ tools including TikTok Script Generator' },
  { feature: 'AI credits free tier',             planly: 'None',                    socialmate: '50/month free'              },
  { feature: 'Bulk scheduling',                  planly: 'Paid',                    socialmate: '✅ Free'                    },
  { feature: 'Link in bio',                      planly: '❌',                      socialmate: '✅ Free'                    },
  { feature: 'Autonomous content system',        planly: '❌',                      socialmate: 'SOMA (autopilot)'           },
  { feature: 'Team seats (free)',                planly: '1',                        socialmate: '2'                          },
  { feature: 'Evergreen recycling',              planly: '❌',                      socialmate: '✅ Free'                    },
  { feature: 'RSS import',                       planly: '❌',                      socialmate: '✅ Free'                    },
]

const FAQ = [
  {
    q: 'Does Planly support TikTok on the free plan?',
    a: "No. Planly's free plan does not include TikTok scheduling. You need to upgrade to a paid plan starting at $15/month to access TikTok. SocialMate includes TikTok scheduling on the free plan — 20 videos per month at zero cost — using the officially approved Production API.",
  },
  {
    q: 'Can SocialMate replace Planly?',
    a: 'Yes for most use cases. SocialMate covers TikTok, Instagram scheduling plans, plus platforms Planly does not support at all: Discord, Telegram, Mastodon, and Bluesky. SocialMate also includes 15+ AI tools on the free tier, bulk scheduling, link in bio, and RSS import — all free. The main gap is Instagram (in-progress API application) and Facebook (planned).',
  },
  {
    q: 'Is Planly better for TikTok than SocialMate?',
    a: 'Planly offers unlimited TikTok posts on paid plans, while SocialMate caps at 60/month on Pro and 200/month on Agency. If you are a high-volume TikTok creator posting 3+ times per day, Planly\'s unlimited tier may suit you — but it starts at $15/month. For most creators posting 1-2 times per day, SocialMate\'s free 20/month or Pro 60/month is more than enough, and you also get Discord, Telegram, Mastodon, and Bluesky scheduling that Planly cannot provide.',
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

export default function VsPlanlyPage() {
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
            Updated May 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs Planly
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Planly starts at $15/month and locks TikTok behind paid plans. SocialMate includes TikTok scheduling free — Production API approved — plus Discord, Telegram, and Mastodon that Planly doesn&apos;t support.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Planly</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Good for TikTok — if you pay</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Supports TikTok, Instagram, Facebook, Twitter, LinkedIn, Pinterest</li>
              <li>✅ Unlimited TikTok on paid plans</li>
              <li>❌ TikTok requires $15/month plan</li>
              <li>❌ No Discord, Telegram, Mastodon, or Bluesky</li>
              <li>❌ No free AI tools</li>
              <li>❌ No bulk scheduling on free plan</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">TikTok free. 7 platforms. 15+ AI tools.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ TikTok scheduling free (Production API approved)</li>
              <li>✅ 20 TikTok videos/month on free plan</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ 15+ AI tools on free tier</li>
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
              <span>Planly</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.planly}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators choose SocialMate over Planly</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'TikTok should not require a $15/month plan',
                desc: "Planly locks TikTok behind its paid tier. SocialMate's TikTok Production API is approved and live — free for all users. 20 videos per month on the free plan, 60 on Pro ($5/month). For a daily TikTok posting schedule, you don't need to pay $15/month before you've made a single dollar.",
              },
              {
                n: '2',
                title: 'Your audience is on Discord and Telegram too',
                desc: 'Planly supports the mainstream platforms — TikTok, Instagram, Facebook, Twitter, LinkedIn, Pinterest. It does not support Discord, Telegram, Mastodon, or Bluesky. If any part of your community lives on these platforms, Planly cannot reach them. SocialMate covers all six simultaneously.',
              },
              {
                n: '3',
                title: '15+ AI tools vs basic AI on paid plans',
                desc: "SocialMate includes 15+ AI tools on the free tier — caption generation, hashtag research, TikTok script generator, viral hook writer, thread builder, content repurposer, and more. Planly's AI tools are basic and require a paid plan. You should be able to write better content without paying for the privilege.",
              },
              {
                n: '4',
                title: 'SOMA — the autonomous content system Planly does not have',
                desc: 'SocialMate includes SOMA: an autonomous AI content system that ingests your source material, learns your brand voice, and generates a full week of platform-native posts on a schedule. Planly has no equivalent. For creators who want to batch content and let AI handle distribution, SOMA is a category-defining tool.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Free TikTok scheduling. 7 platforms. Zero cost to start.</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            TikTok Production API approved. Schedule videos for free — plus Discord, Telegram, Mastodon, Bluesky, and X — all from one dashboard.
          </p>
          <Link href="/signup" className="inline-block bg-panel text-ink-high font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-ink-muted text-xs mt-3">No card required · TikTok free on all plans</p>
        </div>
      </div>
      {/* FOOTER */}
      <PublicFooter />
    </div>
  )
}
