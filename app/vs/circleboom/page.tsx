'use client'
﻿import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

export const metadata: Metadata = {
  title: 'SocialMate vs Circleboom (2026) — Full Comparison',
  description: 'Circleboom costs $24.99/month and focuses on Twitter/X tools. SocialMate covers 7 platforms including TikTok, LinkedIn, Discord, and Telegram — starting free.',
  openGraph: {
    title:       'SocialMate vs Circleboom (2026)',
    description: 'Circleboom starts at $24.99/month. SocialMate is free — covers 7 platforms, TikTok free, LinkedIn live.',
    url:         'https://socialmate.studio/vs/circleboom',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/circleboom' },
}

const COMPARISON = [
  { feature: 'Starting price',               competitor: '$24.99/month',               socialmate: '$0 — free forever'       },
  { feature: 'Platforms supported',           competitor: 'Twitter, Instagram, LinkedIn, Facebook, Pinterest, Google Business', socialmate: '7 platforms (Discord + Telegram unique)' },
  { feature: 'Free plan',                    competitor: '❌ No free plan',             socialmate: '✅ 50 credits/month'     },
  { feature: 'TikTok scheduling',             competitor: '❌ No TikTok',               socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           competitor: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Discord scheduling',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Mastodon scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',              competitor: '✅ (paid)',                  socialmate: '15+ tools free'           },
  { feature: 'Content calendar',             competitor: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              competitor: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             competitor: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',           competitor: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                   competitor: '❌',                          socialmate: '✅ Built in free'         },
  { feature: 'Twitter analytics',             competitor: '✅ Deep Twitter analytics',  socialmate: '✅ Multi-platform'       },
  { feature: 'Team collaboration',            competitor: '$49.99+/month',              socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      competitor: '❌',                          socialmate: '✅ Tip jar + fan subs'   },
  { feature: 'AI content system (SOMA)',       competitor: '❌',                          socialmate: '✅ Full week auto-gen'   },
]

const FAQ = [
  {
    q: 'What is Circleboom and who is it for?',
    a: 'Circleboom is primarily a Twitter/X management tool with additional scheduling for Instagram, LinkedIn, Facebook, Pinterest, and Google Business profiles. It has a strong focus on Twitter audience management — unfollow tools, fake follower detection, follower analytics. At $24.99/month minimum with no free plan, it targets social media managers who rely heavily on Twitter/X.',
  },
  {
    q: 'Does Circleboom support TikTok?',
    a: 'No. Circleboom does not support TikTok scheduling. This is a significant gap in 2026 — TikTok is the highest-reach platform for organic content. SocialMate includes TikTok scheduling free (20 videos/month on the free plan), making it a better choice for creators who want TikTok without paying extra.',
  },
  {
    q: 'Does SocialMate have Discord and Telegram support like no other tool?',
    a: 'Yes — Discord and Telegram scheduling is a SocialMate exclusive among affordable schedulers. Circleboom, Buffer, Hootsuite, and most competitors don\'t support Discord or Telegram at all. If you run a Discord community or Telegram channel alongside your social accounts, SocialMate is the only scheduler that covers everything from one place.',
  },
  {
    q: 'Can SocialMate replace Circleboom for Twitter/X management?',
    a: 'For scheduling X/Twitter posts, yes. For deep Twitter audience management tools (unfollow inactive accounts, fake follower audits, follower analytics), Circleboom has more X-specific depth. SocialMate focuses on cross-platform scheduling and content creation, not follower management. If you need both, SocialMate handles scheduling while native X analytics handles the rest.',
  },
  {
    q: 'How does SocialMate\'s pricing compare to Circleboom?',
    a: 'Circleboom starts at $24.99/month with no free plan. SocialMate has a genuine free tier with 50 credits/month and schedules across 7 platforms. Pro is $5/month — 80% less than Circleboom\'s entry price for significantly more platform coverage including TikTok, Discord, and Telegram.',
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

export default function VsCircleboomPage() {
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
            SocialMate vs Circleboom
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Circleboom starts at $24.99/month and doesn&apos;t support TikTok, Discord, or Telegram. SocialMate covers all 7 platforms — starting completely free.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Circleboom</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Twitter-focused management tool</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Deep Twitter/X audience management</li>
              <li>✅ Fake follower detection</li>
              <li>✅ Multi-platform scheduling (some)</li>
              <li>❌ No TikTok scheduling</li>
              <li>❌ No Discord or Telegram</li>
              <li>❌ $24.99/month minimum — no free plan</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">7 platforms including TikTok. Free to start.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ X + LinkedIn + TikTok + Bluesky + Discord + Telegram + Mastodon</li>
              <li>✅ TikTok free (20 videos/mo) — Circleboom has none</li>
              <li>✅ Discord + Telegram — unique in the market</li>
              <li>✅ Pro plan for $5/month total</li>
              <li>✅ 15+ AI tools free</li>
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
              <span>Circleboom</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.competitor}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over Circleboom</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'No TikTok is a dealbreaker in 2026',
                desc: 'TikTok scheduling is missing from Circleboom entirely. In 2026, TikTok remains the highest-reach platform for organic content discovery. SocialMate includes TikTok free (20 videos/month) using the official Production API — approved May 2026. No extra cost, no workarounds.',
              },
              {
                n: '2',
                title: 'Discord and Telegram are where communities live',
                desc: 'Circleboom doesn\'t support Discord or Telegram. SocialMate does — uniquely among affordable schedulers. If you run a Discord server or Telegram channel alongside your social media presence, SocialMate is the only tool that covers all of it from a single dashboard.',
              },
              {
                n: '3',
                title: '80% cheaper for more platform coverage',
                desc: 'Circleboom starts at $24.99/month with no free plan. SocialMate\'s Pro plan is $5/month — covering 7 platforms vs Circleboom\'s mix. The free tier gives you 50 credits/month at zero cost. You pay 5x less and get more platforms.',
              },
              {
                n: '4',
                title: 'SOMA generates content across all your platforms automatically',
                desc: 'SocialMate\'s SOMA AI system writes a full week of posts for every connected platform — including X, LinkedIn, and TikTok. Define your voice once and SOMA handles the rest. Circleboom has AI writing tools but no autonomous content generation system.',
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">TikTok + Discord + 5 more</p>
          <h2 className="text-3xl font-extrabold mb-4">Schedule all 7 platforms free</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            SocialMate covers X, LinkedIn, TikTok, Bluesky, Discord, Telegram, and Mastodon.
            Free plan available. Pro is $5/month — 80% less than Circleboom.
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
