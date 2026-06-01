'use client'
﻿import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

export const metadata: Metadata = {
  title: 'SocialMate vs Gain (2026) — Full Comparison',
  description: "Gain is an agency approval platform at $99/mo+. SocialMate's Agency plan is $20/mo with approval workflows, Discord/Telegram, 20+ AI tools, SOMA, and Enki.",
  openGraph: {
    title:       'SocialMate vs Gain (2026)',
    description: "Gain: $99/mo+ for client approvals, no Discord/Telegram/Bluesky, no AI content. SocialMate Agency: $20/mo — full approval workflows + 7 platforms + SOMA + Enki.",
    url:         'https://socialmate.studio/vs/gain-app',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/gain-app' },
}

const COMPARISON = [
  { feature: 'Starting price',              gain: '$99/mo',                      socialmate: '$0 — free forever'          },
  { feature: 'Agency plan',                 gain: '$99/mo+',                     socialmate: '$20/mo'                     },
  { feature: 'Primary focus',               gain: 'Client approval workflows',   socialmate: '6-platform Creator OS'      },
  { feature: 'TikTok scheduling',           gain: '✅',                          socialmate: '✅ Full (Production API)'    },
  { feature: 'Bluesky support',             gain: '❌',                          socialmate: '✅'                          },
  { feature: 'Discord scheduling',          gain: '❌',                          socialmate: '✅ Free'                     },
  { feature: 'Telegram scheduling',         gain: '❌',                          socialmate: '✅ Free'                     },
  { feature: 'Client approval workflows',   gain: '✅ Core feature',             socialmate: '✅ Built-in free'            },
  { feature: 'AI writing tools',            gain: '❌',                          socialmate: '20+ social-specific tools'  },
  { feature: 'Autonomous content (SOMA)',   gain: '❌',                          socialmate: '✅ (Autopilot/Full Send)'    },
  { feature: 'Trading bot (Enki)',          gain: '❌',                          socialmate: '✅ Free paper trading'       },
  { feature: 'Bulk scheduling',             gain: '✅',                          socialmate: '✅ Free'                     },
  { feature: 'Analytics dashboard',         gain: '✅',                          socialmate: '✅ Full analytics + Content DNA' },
  { feature: 'Free plan available',         gain: '❌',                          socialmate: '✅ Full scheduling + AI'     },
  { feature: 'No per-channel fees',         gain: '✅',                          socialmate: '✅'                          },
  { feature: 'Client workspaces',           gain: '✅',                          socialmate: '✅ Agency plan $20/mo'       },
]

const FAQ = [
  {
    q: "What is Gain and who is it for?",
    a: "Gain is a social media collaboration and approval platform built for agencies that need structured client sign-off workflows. It lets clients review and approve posts before they go live. It starts at $99/month, making it one of the more expensive tools in its category.",
  },
  {
    q: "Does SocialMate have client approval workflows like Gain?",
    a: "Yes. SocialMate has built-in team approval workflows — Editor and Client roles submit posts as pending_approval, owners see a pending count badge, and can approve or reject with a reason. Approved posts auto-schedule. This is included in SocialMate's free plan.",
  },
  {
    q: "How much cheaper is SocialMate Agency than Gain?",
    a: "SocialMate's Agency plan is $20/month. Gain starts at $99/month — that is 5x more expensive. SocialMate Agency includes 5 client workspaces, 15 seats, 2,000 AI credits/month, approval workflows, Discord/Telegram/Bluesky scheduling, and SOMA autonomous content. Gain has none of the platform breadth or AI tools.",
  },
  {
    q: "Does Gain support Discord, Telegram, or Bluesky?",
    a: "No. Gain does not support Discord, Telegram, or Bluesky. These are significant gaps for agencies managing community-forward brands. SocialMate covers all three on the free plan.",
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

export default function VsGainAppPage() {
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
            SocialMate vs Gain
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Gain charges $99/month for client approval workflows. SocialMate&apos;s Agency plan is $20/month — and includes approvals, 7 platforms, 20+ AI tools, SOMA, and Enki.
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
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Gain</p>
            <p className="font-extrabold text-lg mb-2">Solid approval workflows. Very expensive.</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>✅ Client approval and sign-off workflows</li>
              <li>✅ Email-based client reviews</li>
              <li>❌ $99/mo+ starting price</li>
              <li>❌ No Discord, Telegram, or Bluesky</li>
              <li>❌ No AI content tools</li>
              <li>❌ No free plan</li>
            </ul>
          </div>
          <div className="bg-amber-400 text-black rounded-2xl p-6">
            <p className="text-xs font-bold text-black/60 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Full agency platform. 5x cheaper than Gain.</p>
            <ul className="space-y-1 text-xs text-black/80">
              <li>✅ Client approval workflows (free)</li>
              <li>✅ 7 platforms including Discord + Telegram</li>
              <li>✅ 20+ AI content and writing tools</li>
              <li>✅ SOMA: autonomous weekly content generation</li>
              <li>✅ Agency plan: $20/month</li>
              <li>✅ Free plan available</li>
            </ul>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-400 uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Gain</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-800 ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-400">{row.gain}</span>
                <span className="text-xs font-semibold text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">Why agencies choose SocialMate over Gain</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: "Gain is 5x more expensive than SocialMate Agency",
                desc: "Gain starts at $99/month. SocialMate's Agency plan is $20/month and includes 5 client workspaces, 15 seats, 2,000 AI credits/month, client approval workflows, Discord/Telegram scheduling, and SOMA. You get more features at a fraction of the price.",
              },
              {
                n: '2',
                title: 'SocialMate has client approvals built in — at no extra cost',
                desc: "Editor and Client roles in SocialMate submit posts as pending_approval. Owners see a pending count badge in their sidebar and can approve, reject with feedback, or auto-schedule approved posts. The entire workflow is built into the platform — free.",
              },
              {
                n: '3',
                title: 'Gain has no AI content tools — SocialMate has 20+',
                desc: "Gain is a collaboration and approval tool. It has no AI writing, caption generation, content repurposing, or autonomous content system. SocialMate's SOMA can generate a full week of content autonomously, meaning your team spends less time writing and more time on strategy.",
              },
              {
                n: '4',
                title: 'Gain does not cover Discord, Telegram, or Bluesky',
                desc: "Community-forward brands live on Discord and Telegram. Gain cannot post to either. SocialMate covers both natively, plus Bluesky — platforms where organic reach is still high and competitors have not caught up.",
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Agency tools at $20/mo — not $99/mo</h2>
          <p className="text-black/70 text-sm mb-6 max-w-lg mx-auto">
            SocialMate Agency includes client workspaces, approval workflows, 7 platforms, 20+ AI tools, and SOMA. Everything Gain does — plus much more — at $20/month.
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
