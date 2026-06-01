'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',               postoplan: '$19/month',                 socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    postoplan: '✅ Limited free plan',       socialmate: '✅ 50 credits/month'     },
  { feature: 'Platforms supported',           postoplan: '10+ (no Discord/Telegram)', socialmate: '7 (Discord + Telegram included)' },
  { feature: 'Discord scheduling',            postoplan: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           postoplan: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            postoplan: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             postoplan: '✅ (paid)',                  socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           postoplan: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',              postoplan: '❌',                         socialmate: '15+ tools free'           },
  { feature: 'Autonomous content system',     postoplan: '❌',                         socialmate: '✅ SOMA — learns your voice' },
  { feature: '8 autonomous AI agents',        postoplan: '❌',                         socialmate: '✅ Pro+'                  },
  { feature: 'Content calendar',             postoplan: '✅',                         socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              postoplan: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             postoplan: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',           postoplan: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Link in bio (SIGIL)',           postoplan: '❌',                         socialmate: '✅ Built in free'         },
  { feature: 'Team collaboration',            postoplan: '✅ ($39+)',                  socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      postoplan: '❌',                         socialmate: '✅ Tip jar + fan subs'   },
  { feature: 'SM-Give charity program',       postoplan: '❌',                         socialmate: '✅ 2% of revenue donated' },
]

const FAQ = [
  {
    q: 'What is Postoplan and how does it compare?',
    a: "Postoplan is a social media scheduling tool with a content idea library and AI-suggested post times. It supports Facebook, Instagram, Twitter, LinkedIn, TikTok, Google My Business, and a few others. The free plan is heavily limited — one connected account, a small number of posts. The paid plan starts at $19/month. Key gaps: no Discord, no Telegram, no Bluesky, and no AI content creation tools.",
  },
  {
    q: 'What does SocialMate have that Postoplan does not?',
    a: "SocialMate adds Discord and Telegram scheduling (Postoplan can't reach community platforms), 15+ AI tools (Postoplan has zero AI writing), SOMA autonomous content generation, 8 AI agents that run on autopilot, evergreen recycling, RSS import, and a link-in-bio page (SIGIL). On pricing, SocialMate Pro at $5/month does more than Postoplan's paid plans at nearly 4x the price.",
  },
  {
    q: 'Does Postoplan have a free plan?',
    a: "Postoplan has a limited free plan, but it's restricted to one connected account and a small number of scheduled posts. In practice it's more of a trial than a genuinely free tier. SocialMate's free plan includes 7 platforms, 50 AI credits/month, and no post caps — it's actually usable as a long-term free tier.",
  },
  {
    q: 'Why does SocialMate support Discord and Telegram?',
    a: "Most scheduling tools were built when Discord and Telegram didn't exist as serious creator platforms. SocialMate was built in 2026 for the full creator landscape: Discord servers host communities for streamers, developers, artists, and creators. Telegram channels are used by newsletters, crypto communities, and international audiences. Scheduling content to these platforms alongside LinkedIn and TikTok is a unique capability that almost no competitor offers.",
  },
  {
    q: 'What AI tools does SocialMate include?',
    a: "SocialMate's 15+ AI tools include caption generation, viral hook writing, content repurposing (6 formats), hashtag research, thread generation, post rewriting, post scoring, brand voice injection, SM Pulse (trend scan), SM Radar (content intelligence report), and SOMA — an autonomous content agent that generates a full week of platform-native posts automatically.",
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

export default function VsPostoplanPage() {
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
            SocialMate vs Postoplan
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Postoplan is $19/month with no Discord, Telegram, or AI tools. SocialMate covers 7 platforms with 15+ AI tools built in — starting completely free.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Postoplan</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Basic scheduler, no AI</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Content idea library built in</li>
              <li>✅ Multiple platform support</li>
              <li>✅ Limited free plan (1 account)</li>
              <li>❌ No Discord, Telegram, or Bluesky</li>
              <li>❌ Zero AI writing tools</li>
              <li>❌ No autonomous content system or agents</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">7 platforms. 15+ AI tools. Free.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Discord + Telegram + Bluesky + TikTok + LinkedIn + X + Mastodon</li>
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
              <span>Postoplan</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.postoplan}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over Postoplan</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'SocialMate is genuinely free — not a 1-account trial',
                desc: "Postoplan's free plan restricts you to one account and a handful of posts. It's a trial, not a real free tier. SocialMate's free plan has no post caps, supports 7 platforms, and includes 50 AI credits per month. The free tier is intentionally usable — not a funnel.",
              },
              {
                n: '2',
                title: 'Discord and Telegram scheduling you won\'t find in Postoplan',
                desc: "Postoplan covers the standard social media platforms. Discord and Telegram — where millions of creators run their communities — are not on that list. SocialMate schedules to both natively. If your audience lives in a Discord server or Telegram channel, SocialMate is one of the only tools that reaches them.",
              },
              {
                n: '3',
                title: 'Postoplan has zero AI tools — SocialMate has 12',
                desc: "Postoplan's content idea library suggests topics but doesn't write anything. SocialMate's 15+ AI tools write captions, craft hooks, repurpose content into 6 formats, generate hashtag sets, score posts for quality, and run SOMA — which autonomously generates a full week of posts from your brand context.",
              },
              {
                n: '4',
                title: '$19/month for less vs. $5/month for more',
                desc: "Postoplan's paid plan starts at $19/month with limited AI and no community platform support. SocialMate Pro is $5/month and includes 500 AI credits, SOMA access, 5 team seats, and 8 autonomous agents. At every price point, SocialMate delivers more value.",
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">More platforms. More AI. Actually free.</p>
          <h2 className="text-3xl font-extrabold mb-4">Switch from Postoplan today</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            SocialMate covers 7 platforms including Discord and Telegram — with 15+ AI tools and SOMA built in.
            Start free. Pro is $5/month.
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
