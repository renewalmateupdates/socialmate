'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',              ripl: '$15/mo',                     socialmate: '$0 — free forever'          },
  { feature: 'Primary focus',               ripl: 'Animated video posts',       socialmate: '6-platform Creator OS'      },
  { feature: 'TikTok scheduling',           ripl: '✅',                         socialmate: '✅ Full (Production API)'    },
  { feature: 'Bluesky support',             ripl: '❌',                         socialmate: '✅'                          },
  { feature: 'Discord scheduling',          ripl: '❌',                         socialmate: '✅ Free'                     },
  { feature: 'Telegram scheduling',         ripl: '❌',                         socialmate: '✅ Free'                     },
  { feature: 'AI writing tools',            ripl: 'Basic captions',            socialmate: '20+ social-specific tools'  },
  { feature: 'Autonomous content (SOMA)',   ripl: '❌',                         socialmate: '✅ (Autopilot/Full Send)'    },
  { feature: 'Trading bot (Enki)',          ripl: '❌',                         socialmate: '✅ Free paper trading'       },
  { feature: 'Animated video creation',     ripl: '✅ Core feature',            socialmate: 'Creator Studio (filters/trim/export)' },
  { feature: 'Bulk scheduling',             ripl: '❌',                         socialmate: '✅ Free'                     },
  { feature: 'Analytics dashboard',         ripl: 'Basic',                     socialmate: '✅ Full analytics + Content DNA' },
  { feature: 'Free plan available',         ripl: '✅ Limited',                 socialmate: '✅ Full scheduling + AI'     },
  { feature: 'No per-channel fees',         ripl: '✅',                         socialmate: '✅'                          },
  { feature: 'Link in bio',                 ripl: '❌',                         socialmate: '✅ Free'                     },
  { feature: 'Social inbox',                ripl: '❌',                         socialmate: '✅ 4 platforms'              },
]

const FAQ = [
  {
    q: "What is Ripl and who is it for?",
    a: "Ripl is a mobile-first tool that lets small businesses create branded animated video posts and publish them to social media. It's popular with local businesses wanting to create professional-looking video content without design skills. It's not a full scheduling platform.",
  },
  {
    q: "Does Ripl support Discord, Telegram, or Bluesky?",
    a: "No. Ripl is focused on a handful of mainstream platforms (Facebook, Instagram, X, LinkedIn, YouTube). It does not support Discord, Telegram, or Bluesky. SocialMate supports all three on the free plan.",
  },
  {
    q: "Is SocialMate better for content scheduling than Ripl?",
    a: "Yes, if your goal is multi-platform content scheduling. Ripl is designed primarily for creating animated video posts. SocialMate is a full Creator OS with scheduling, 20+ AI tools, autonomous content generation (SOMA), an analytics dashboard, social inbox, and link in bio — all starting free.",
  },
  {
    q: "Can SocialMate create video content like Ripl?",
    a: "SocialMate has a Creator Studio with video trimming, CSS filters, caption overlay, and GIF export. It's not a dedicated animated video maker like Ripl, but it covers the basics. For serious video animation, Ripl has an edge. For everything else — scheduling, AI content, analytics, and community management — SocialMate wins.",
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

export default function VsRiplPage() {
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
            SocialMate vs Ripl
          </h1>
          <p className="text-lg text-ink-body max-w-2xl mx-auto">
            Ripl creates animated video posts for small businesses. SocialMate is a full Creator OS — 7 platforms, 20+ AI tools, autonomous content, and a $0 free plan.
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
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wide mb-2">Ripl</p>
            <p className="font-extrabold text-lg mb-2">Great animated video maker. Limited scheduling.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Branded animated video templates</li>
              <li>✅ Easy for non-designers</li>
              <li>❌ No Discord, Telegram, or Bluesky</li>
              <li>❌ $15/mo for limited platforms</li>
              <li>❌ No autonomous AI content system</li>
              <li>❌ No bulk scheduling</li>
            </ul>
          </div>
          <div className="bg-amber/10 text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-high uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Full Creator OS. 7 platforms. Starts free.</p>
            <ul className="space-y-1 text-xs text-ink-high">
              <li>✅ Bluesky, Discord, Telegram, Mastodon, X, TikTok</li>
              <li>✅ 20+ AI writing and content tools</li>
              <li>✅ SOMA: autonomous weekly content generation</li>
              <li>✅ Creator Studio: trim, filters, GIF export</li>
              <li>✅ Full analytics + social inbox</li>
              <li>✅ Free forever — no credit card</li>
            </ul>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-body uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Ripl</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-body">{row.ripl}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">Why small businesses choose SocialMate over Ripl</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Ripl is a video creator — not a scheduling platform',
                desc: "Ripl's core value is creating animated video posts, not managing a multi-platform content calendar. If you need bulk scheduling, queue management, analytics, or AI content tools, Ripl does not provide them in any meaningful depth.",
              },
              {
                n: '2',
                title: "Ripl costs $15/month for platforms SocialMate covers free",
                desc: "SocialMate's free plan covers 7 live platforms. Ripl costs $15/month for a smaller set of platforms and without Discord, Telegram, or Bluesky. SocialMate Pro at $5/month includes more platforms, more AI tools, and autonomous content.",
              },
              {
                n: '3',
                title: 'SOMA generates content — Ripl requires you to create everything manually',
                desc: "Ripl has no autonomous content system. Every post starts from a blank canvas or template. SocialMate's SOMA learns your brand voice, ingests your source material, and generates a full week of platform-native posts automatically.",
              },
              {
                n: '4',
                title: 'SocialMate covers Discord, Telegram, and Bluesky — Ripl does not',
                desc: "Many small businesses have active Discord servers or Telegram communities. Ripl cannot post to either. SocialMate supports both natively on the free plan, letting you reach your full audience without switching tools.",
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Need more than animated videos? Start free.</h2>
          <p className="text-ink-high text-sm mb-6 max-w-lg mx-auto">
            SocialMate covers 7 platforms, gives you 20+ AI tools, and lets SOMA generate your content on autopilot. All starting at $0.
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
