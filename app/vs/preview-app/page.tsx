'use client'
﻿import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

export const metadata: Metadata = {
  title: 'SocialMate vs Preview App (2026) — Full Comparison',
  description: "Preview App is Instagram/Pinterest focused at $8/mo+. SocialMate covers 7 platforms including Discord and Telegram, has 20+ AI tools, SOMA autonomous content, and a free plan.",
  openGraph: {
    title:       'SocialMate vs Preview App (2026)',
    description: "Preview App: Instagram/Pinterest only, $8/mo+. SocialMate: 7 platforms, 20+ AI tools, SOMA, Enki, free plan — $5/mo Pro.",
    url:         'https://socialmate.studio/vs/preview-app',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/preview-app' },
}

const COMPARISON = [
  { feature: 'Starting price',              preview: '$8/mo (Pro)',               socialmate: '$0 — free forever'          },
  { feature: 'Primary focus',               preview: 'Instagram / Pinterest feed', socialmate: '6-platform Creator OS'      },
  { feature: 'TikTok scheduling',           preview: '❌',                         socialmate: '✅ Full (Production API)'    },
  { feature: 'Bluesky support',             preview: '❌',                         socialmate: '✅'                          },
  { feature: 'Discord scheduling',          preview: '❌',                         socialmate: '✅ Free'                     },
  { feature: 'Telegram scheduling',         preview: '❌',                         socialmate: '✅ Free'                     },
  { feature: 'X/Twitter scheduling',        preview: '❌',                         socialmate: '✅'                          },
  { feature: 'AI writing tools',            preview: 'Basic caption suggestions', socialmate: '20+ social-specific tools'  },
  { feature: 'Autonomous content (SOMA)',   preview: '❌',                         socialmate: '✅ (Autopilot/Full Send)'    },
  { feature: 'Trading bot (Enki)',          preview: '❌',                         socialmate: '✅ Free paper trading'       },
  { feature: 'Bulk scheduling',             preview: '❌',                         socialmate: '✅ Free'                     },
  { feature: 'Analytics dashboard',         preview: '✅ Basic',                   socialmate: '✅ Full analytics + Content DNA' },
  { feature: 'Free plan available',         preview: '✅ Very limited',            socialmate: '✅ Full scheduling + AI'     },
  { feature: 'No per-channel fees',         preview: '✅',                         socialmate: '✅'                          },
  { feature: 'Link in bio',                 preview: '✅',                         socialmate: '✅ Free'                     },
  { feature: 'Social inbox',                preview: '❌',                         socialmate: '✅ 4 platforms'              },
]

const FAQ = [
  {
    q: "What is Preview App?",
    a: "Preview App is a visual content planner designed primarily for Instagram and Pinterest. It lets you plan your feed grid, schedule posts visually, and get basic hashtag and analytics tools. It's popular with lifestyle bloggers and Instagram creators who prioritize feed aesthetics.",
  },
  {
    q: "Does Preview App support TikTok, Discord, or Telegram?",
    a: "No. Preview App is focused on Instagram and Pinterest. It does not support TikTok, Discord, Telegram, Bluesky, or X/Twitter. If your audience extends beyond Instagram, you would need additional tools. SocialMate supports all of these on the free plan.",
  },
  {
    q: "Is SocialMate cheaper than Preview App?",
    a: "SocialMate is free to start. Preview App's Pro plan starts at $8/month. SocialMate Pro is $5/month and includes far more platforms, 20+ AI tools, autonomous content generation (SOMA), analytics, and a social inbox — none of which Preview App offers.",
  },
  {
    q: "What makes SocialMate a better choice for most creators?",
    a: "Preview App is ideal if Instagram feed aesthetics are your primary concern. SocialMate is better if you want to reach audiences on multiple platforms, use AI tools to create content faster, and eventually automate your content schedule via SOMA. SocialMate covers the full creator workflow, not just Instagram planning.",
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

export default function VsPreviewAppPage() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* NAV */}
      <nav className="border-b border-gray-800 bg-[#0a0a0a] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold tracking-tight">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-gray-400 hover:text-white transition-colors">{t('vs_shared.nav_login')}</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-amber-400 text-black rounded-xl hover:bg-amber-300 transition-all">{t('vs_shared.nav_start_free')}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* HERO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 text-xs font-bold text-amber-400 mb-4">
            Updated May 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            SocialMate vs Preview App
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Preview App is an Instagram/Pinterest visual planner. SocialMate is a full Creator OS covering 7 platforms — including TikTok, Discord, and Telegram — starting completely free.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-amber-400 text-black font-bold rounded-2xl hover:bg-amber-300 transition-all text-sm">
              {t('vs_shared.cta_try_free')}
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-gray-700 font-semibold rounded-2xl hover:border-gray-500 transition-all text-sm text-gray-200">
              {t('vs_shared.cta_see_pricing')}
            </Link>
          </div>
        </div>

        {/* VERDICT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Preview App</p>
            <p className="font-extrabold text-lg mb-2">Best-in-class Instagram feed planner. Very limited scope.</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>✅ Beautiful Instagram grid drag-and-drop</li>
              <li>✅ Pinterest scheduling</li>
              <li>❌ No TikTok, Discord, Telegram, Bluesky, or X</li>
              <li>❌ No autonomous AI content system</li>
              <li>❌ No bulk scheduling</li>
              <li>❌ No social inbox</li>
            </ul>
          </div>
          <div className="bg-amber-400 text-black rounded-2xl p-6">
            <p className="text-xs font-bold text-black/60 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">7 platforms. Full Creator OS. Free to start.</p>
            <ul className="space-y-1 text-xs text-black/80">
              <li>✅ TikTok, Discord, Telegram, Bluesky, Mastodon, X, LinkedIn</li>
              <li>✅ 20+ AI writing and content tools</li>
              <li>✅ SOMA: autonomous weekly content generation</li>
              <li>✅ Enki: autonomous trading bot</li>
              <li>✅ Full analytics + social inbox</li>
              <li>✅ Free forever — no credit card</li>
            </ul>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-400 uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Preview App</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-800 ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-400">{row.preview}</span>
                <span className="text-xs font-semibold text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">Why creators switch from Preview App to SocialMate</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Preview App only covers Instagram and Pinterest',
                desc: "Preview App does not support TikTok, X/Twitter, Discord, Telegram, or Bluesky. If your content strategy extends beyond Instagram aesthetics, you immediately need additional tools. SocialMate covers 7 live platforms from a single dashboard.",
              },
              {
                n: '2',
                title: "SocialMate is cheaper — and does far more",
                desc: "Preview App Pro starts at $8/month. SocialMate is free to start and $5/month for Pro — which includes more platforms, 20+ AI tools, autonomous content generation (SOMA), full analytics, and a social inbox. Preview App has none of these.",
              },
              {
                n: '3',
                title: 'No AI content generation in Preview App',
                desc: "Preview App has basic hashtag and caption suggestions. SocialMate has 20+ AI tools: caption generation, hook writing, content repurposing, thread builder, hashtag suggestions, and SOMA that generates a full week of content autonomously.",
              },
              {
                n: '4',
                title: 'SocialMate has a social inbox — Preview App does not',
                desc: "Preview App has no unified inbox. SocialMate's inbox covers Bluesky, Mastodon, Telegram, and Discord — letting you reply to mentions and comments without leaving the dashboard.",
              },
            ].map((r) => (
              <div key={r.n} className="flex gap-4 p-5 bg-gray-900 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all">
                <div className="w-8 h-8 bg-amber-400 text-black rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0">{r.n}</div>
                <div>
                  <p className="text-sm font-extrabold mb-1 text-gray-100">{r.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{r.desc}</p>
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
              <div key={i} className="p-5 bg-gray-900 border border-gray-800 rounded-2xl">
                <p className="text-sm font-extrabold mb-2 text-gray-100">{faq.q}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-amber-400 text-black rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Beyond Instagram — schedule everywhere for free</h2>
          <p className="text-black/70 text-sm mb-6 max-w-lg mx-auto">
            SocialMate covers TikTok, Discord, Telegram, Bluesky, Mastodon, and X — with 20+ AI tools and SOMA autonomous content. All starting at $0.
          </p>
          <Link href="/signup" className="inline-block bg-black text-white font-bold px-8 py-3.5 rounded-2xl hover:opacity-80 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-black/50 text-xs mt-3">{t('vs_shared.cta_no_card')}</p>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
