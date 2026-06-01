'use client'
﻿import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

export const metadata: Metadata = {
  title: 'SocialMate vs Keystroke (2026) — Full Comparison',
  description: 'Keystroke is a $29/month LinkedIn-only scheduler with basic AI. SocialMate gives you 7 platforms, 15+ AI tools, and SOMA — starting free.',
  openGraph: {
    title:       'SocialMate vs Keystroke (2026)',
    description: 'Keystroke is $29/month for LinkedIn-only scheduling. SocialMate covers LinkedIn plus 6 more platforms — free to start.',
    url:         'https://socialmate.studio/vs/keystroke',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/keystroke' },
}

const COMPARISON = [
  { feature: 'Starting price',               keystroke: '$29/month',                 socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    keystroke: '❌ No free plan',            socialmate: '✅ 50 credits/month'     },
  { feature: 'Platforms supported',           keystroke: 'LinkedIn only',             socialmate: '7 platforms'             },
  { feature: 'LinkedIn scheduling',           keystroke: '✅ (only platform)',        socialmate: '✅ Free'                  },
  { feature: 'Discord scheduling',            keystroke: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           keystroke: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            keystroke: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             keystroke: '❌',                         socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'X / Twitter scheduling',        keystroke: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Mastodon scheduling',           keystroke: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',              keystroke: '✅ (basic)',                 socialmate: '15+ tools free'           },
  { feature: 'Autonomous content system',     keystroke: '❌',                         socialmate: '✅ SOMA — learns your voice' },
  { feature: '8 autonomous AI agents',        keystroke: '❌',                         socialmate: '✅ Pro+'                  },
  { feature: 'Content calendar',             keystroke: '✅',                         socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              keystroke: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             keystroke: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Link in bio (SIGIL)',           keystroke: '❌',                         socialmate: '✅ Built in free'         },
  { feature: 'Team collaboration',            keystroke: '✅ ($49+)',                  socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      keystroke: '❌',                         socialmate: '✅ Tip jar + fan subs'   },
  { feature: 'SM-Give charity program',       keystroke: '❌',                         socialmate: '✅ 2% of revenue donated' },
]

const FAQ = [
  {
    q: 'What is Keystroke and who is it for?',
    a: "Keystroke is a LinkedIn-focused scheduling and content tool. It's designed for professionals and B2B creators who post primarily on LinkedIn. Features include LinkedIn post scheduling, basic AI writing assistance, content analytics, and some hashtag research. At $29/month minimum with no free plan, it's priced for committed LinkedIn power users.",
  },
  {
    q: 'Can SocialMate replace Keystroke for LinkedIn scheduling?',
    a: "For LinkedIn scheduling, yes. SocialMate connects to LinkedIn personal profiles via official OAuth and publishes using the UGC Posts API — the same mechanism LinkedIn's own tools use. LinkedIn scheduling is free on all SocialMate plans. The main feature Keystroke has that SocialMate doesn't is deep LinkedIn-specific analytics and LinkedIn carousel generation. For text and link posts, SocialMate handles everything Keystroke does at zero cost.",
  },
  {
    q: 'Why pay $29/month for LinkedIn when SocialMate is free?',
    a: "Keystroke's pricing makes sense if LinkedIn is your only publishing channel and you need every LinkedIn-specific feature possible. For most creators who post to LinkedIn among other platforms, paying $29/month for a single-platform tool is hard to justify when SocialMate schedules to 7 platforms for free. The Pro upgrade at $5/month adds SOMA, 500 AI credits, and 8 agents — still less than Keystroke's base price.",
  },
  {
    q: 'Does SocialMate have AI for LinkedIn content?',
    a: "Yes. SocialMate's 15+ AI tools include LinkedIn-optimized content generation: long-form post writing, hook generation (critical for LinkedIn's algorithm), content repurposing from other platforms into LinkedIn format, caption rewriting with professional tone, and SOMA — which generates a full week of LinkedIn-native posts automatically when LinkedIn is part of your project.",
  },
  {
    q: 'What makes SocialMate better for creators who use multiple platforms?',
    a: "Keystroke is a LinkedIn-only tool. The moment you want to cross-post to X/Twitter, TikTok, Bluesky, Discord, or Telegram, Keystroke can't help you. SocialMate is built for multi-platform creators: compose once, select platforms, schedule across all of them. SOMA generates platform-native posts that match each platform's character limits, tone, and format. You get a full week of content for every connected platform in one generation run.",
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

export default function VsKeystrokePage() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-screen bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* NAV */}
      <nav className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold tracking-tight dark:text-white">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{t('vs_shared.nav_login')}</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all">{t('vs_shared.nav_start_free')}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* HERO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 mb-4">
            Updated May 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-white">
            SocialMate vs Keystroke
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Keystroke charges $29/month for LinkedIn-only scheduling. SocialMate covers LinkedIn plus 6 other platforms — with 15+ AI tools — starting completely free.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-black text-white font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
              {t('vs_shared.cta_try_free')}
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-gray-200 dark:border-gray-700 font-semibold rounded-2xl hover:border-gray-400 transition-all text-sm dark:text-gray-200">
              {t('vs_shared.cta_see_pricing')}
            </Link>
          </div>
        </div>

        {/* VERDICT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Keystroke</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">LinkedIn-only, basic AI</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ LinkedIn scheduling + analytics</li>
              <li>✅ Basic AI writing assistance</li>
              <li>✅ LinkedIn hashtag research</li>
              <li>❌ LinkedIn only — no other platforms</li>
              <li>❌ $29/month — no free plan</li>
              <li>❌ No SOMA, no AI agents, no Discord/Telegram</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">LinkedIn + 6 more. Free to start.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ LinkedIn + Discord + Telegram + Bluesky + TikTok + X + Mastodon</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ SOMA autonomous content agent</li>
              <li>✅ Pro plan for $5/month total</li>
              <li>✅ 8 autonomous AI agents</li>
              <li>✅ No credit card required to start</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Keystroke</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.keystroke}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over Keystroke</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '$29/month for one platform when SocialMate is free for seven',
                desc: "Keystroke's minimum is $29/month for LinkedIn-only scheduling. SocialMate's free plan schedules LinkedIn plus Bluesky, Discord, Telegram, TikTok, X/Twitter, and Mastodon — at zero cost. For $5/month Pro, you get SOMA, 500 AI credits, and 8 agents. Keystroke's pricing is hard to justify when the alternative covers 7x the platforms for less.",
              },
              {
                n: '2',
                title: 'SOMA handles LinkedIn content autonomously',
                desc: "Keystroke helps you schedule LinkedIn posts you write. SOMA generates them for you. Give SOMA your brand context, connect LinkedIn, and it creates a full week of LinkedIn-native posts — long-form text formatted for the algorithm, hooks optimized for engagement, topics you haven't covered yet. Schedule once, generate perpetually.",
              },
              {
                n: '3',
                title: 'Your LinkedIn audience also lives on other platforms',
                desc: "LinkedIn is great for B2B and thought leadership. But your followers also have Discord servers, TikTok feeds, and Bluesky accounts. Keystroke can only reach them on LinkedIn. SocialMate reaches them everywhere — and lets you cross-post the same core content adapted to each platform's native format.",
              },
              {
                n: '4',
                title: '8 AI agents that Keystroke will never build',
                desc: "SocialMate's Agents Hub runs autonomously: the Newsletter Agent drafts your weekly newsletter from posts, the Caption Agent watches RSS feeds and creates drafts from new articles, the Repurpose Agent takes your best posts and turns them into new formats, the Inbox Agent suggests replies to mentions. Keystroke has basic AI writing — not an autonomous agent system.",
              },
            ].map((r) => (
              <div key={r.n} className="flex gap-4 p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0">{r.n}</div>
                <div>
                  <p className="text-sm font-extrabold mb-1 dark:text-gray-100">{r.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">{t('vs_shared.faq_heading')}</h2>
          <div className="space-y-4">
            {FAQ.map((faq, i) => (
              <div key={i} className="p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl">
                <p className="text-sm font-extrabold mb-2 dark:text-gray-100">{faq.q}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="text-center py-12 bg-black text-white rounded-3xl px-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">The obvious choice</p>
          <h2 className="text-3xl font-extrabold mb-4">Schedule LinkedIn posts free</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            SocialMate connects to LinkedIn via official OAuth. Post now or schedule for later — free on every plan.
            Pro is $5/month for 7 platforms, SOMA, and 8 AI agents.
          </p>
          <Link href="/signup" className="inline-block px-8 py-3 bg-white text-black font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
            Start free — no credit card →
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link href="/vs" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            ← View all comparisons
          </Link>
        </div>

      </div>
      <PublicFooter />
    </div>
  )
}
