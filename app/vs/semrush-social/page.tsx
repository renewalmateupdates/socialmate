'use client'
﻿import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

export const metadata: Metadata = {
  title: 'SocialMate vs SEMrush Social (2026) — Full Comparison',
  description: 'SEMrush Social is an expensive add-on to an already costly SEO platform. SocialMate is a standalone social scheduler for 7 platforms — free to start.',
  openGraph: {
    title:       'SocialMate vs SEMrush Social (2026)',
    description: 'SEMrush Social requires paying for SEMrush first. SocialMate is standalone social scheduling for 7 platforms — free to start.',
    url:         'https://socialmate.studio/vs/semrush-social',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/semrush-social' },
}

const COMPARISON = [
  { feature: 'Starting price',               competitor: '$130+/month (SEMrush) + social add-on', socialmate: '$0 — free forever' },
  { feature: 'Free plan',                    competitor: '❌ No free social scheduling',  socialmate: '✅ 50 credits/month'     },
  { feature: 'Standalone social tool',        competitor: '❌ Add-on to SEMrush plan',    socialmate: '✅ Standalone product'   },
  { feature: 'TikTok scheduling',             competitor: '❌ No TikTok',                 socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           competitor: '✅ (with SEMrush plan)',        socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Discord scheduling',            competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Mastodon scheduling',           competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',              competitor: '✅ (SEMrush AI, paid)',         socialmate: '15+ tools free'           },
  { feature: 'SEO / keyword tools',           competitor: '✅ Industry-leading',           socialmate: '🔜 Roadmap'              },
  { feature: 'Content calendar',             competitor: '✅ (paid)',                    socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              competitor: '✅ (paid)',                    socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',           competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                   competitor: '❌',                            socialmate: '✅ Built in free'         },
  { feature: 'Team collaboration',            competitor: '✅ (enterprise seats)',         socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      competitor: '❌',                            socialmate: '✅ Tip jar + fan subs'   },
]

const FAQ = [
  {
    q: 'What is SEMrush Social and how much does it actually cost?',
    a: 'SEMrush Social is a social media scheduling and analytics module built into the SEMrush platform. To access it, you need an active SEMrush subscription starting at $130/month (Pro), plus the Social Media add-on. Total cost can exceed $200+/month. For creators or businesses that only need social scheduling, you\'re paying primarily for SEO tools you may not need.',
  },
  {
    q: 'Does SEMrush Social support TikTok?',
    a: 'No. SEMrush Social does not support TikTok scheduling. Given TikTok\'s role as the highest organic reach platform in 2026, this is a meaningful gap. SocialMate includes TikTok scheduling free (20 videos/month) via the official Production API approved in May 2026. No SEO subscription required.',
  },
  {
    q: 'When does SEMrush Social make sense vs SocialMate?',
    a: 'SEMrush Social makes sense if you\'re already paying for SEMrush for SEO purposes and want your social scheduling in the same platform. The integration between keyword research, competitive analysis, and social content can be valuable for content marketers. If your primary need is social scheduling and you don\'t use SEMrush for SEO, SocialMate at $5/month is the clear choice.',
  },
  {
    q: 'Can SocialMate compete with SEMrush\'s AI content tools?',
    a: 'SocialMate\'s 15+ AI tools cover social content creation: hook writing, caption generation, content repurposing, hashtag research, thread building, and the SOMA autonomous content system. SEMrush has AI writing tools optimized for SEO content. Different tools for different jobs. For social-first content, SocialMate\'s AI tools are purpose-built and free.',
  },
  {
    q: 'What social platforms does SEMrush Social support?',
    a: 'SEMrush Social supports Facebook, Instagram, LinkedIn, Pinterest, X/Twitter, and Google Business. No TikTok, no Discord, no Telegram, no Bluesky, no Mastodon. SocialMate covers X/Twitter, LinkedIn, TikTok, Bluesky, Discord, Telegram, and Mastodon — the platforms where creators and communities actually live in 2026.',
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

export default function VsSEMrushSocialPage() {
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
            SocialMate vs SEMrush Social
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            SEMrush Social requires a $130+/month SEMrush subscription. SocialMate is a standalone social scheduler for 7 platforms — $5/month Pro or completely free.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SEMrush Social</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">SEO platform with social as an add-on</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Deep SEO + keyword research</li>
              <li>✅ Competitive analysis</li>
              <li>✅ Social + SEO in one platform (if you need both)</li>
              <li>❌ $130+/month just to access social tools</li>
              <li>❌ No TikTok scheduling</li>
              <li>❌ No Discord, Telegram, Bluesky, Mastodon</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Standalone social scheduling. 7 platforms. Free.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ No SEO subscription required</li>
              <li>✅ TikTok free — SEMrush has none</li>
              <li>✅ X + LinkedIn + Bluesky + Discord + Telegram + Mastodon</li>
              <li>✅ 15+ AI tools free</li>
              <li>✅ Pro $5/month — 96% cheaper than SEMrush entry</li>
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
              <span>SEMrush Social</span>
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
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over SEMrush Social</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Don\'t pay for an SEO platform to get social scheduling',
                desc: 'SEMrush is a best-in-class SEO tool. But if you only need social scheduling, you\'re paying $130+/month for keyword research, site audit, competitor analysis, and backlink tracking — features you may never use — just to access the social tab. SocialMate is purpose-built for social scheduling at $5/month.',
              },
              {
                n: '2',
                title: 'TikTok is absent from SEMrush — it\'s free in SocialMate',
                desc: 'SEMrush Social doesn\'t support TikTok. SocialMate does — free, 20 videos/month, direct publish via the official Production API. If TikTok is part of your content strategy, you need a separate tool alongside SEMrush. Or you use SocialMate for everything.',
              },
              {
                n: '3',
                title: 'Discord and Telegram support — completely absent from SEMrush',
                desc: 'SEMrush has no Discord or Telegram scheduling. If you run a Discord community or Telegram channel, SEMrush Social ignores your biggest community channels entirely. SocialMate schedules Discord and Telegram alongside your social accounts — uniquely, among affordable schedulers.',
              },
              {
                n: '4',
                title: 'SOMA is a smarter content workflow than SEMrush\'s social tools',
                desc: 'SEMrush\'s social tools focus on scheduling and basic analytics. SocialMate\'s SOMA AI system generates fully written posts based on your voice profile across all 7 platforms — including LinkedIn content and TikTok ideas. The AI does the creative lifting, not just the timing.',
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Social scheduling without the SEO tax</p>
          <h2 className="text-3xl font-extrabold mb-4">7 platforms. $5/month. No SEMrush required.</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            SocialMate is a standalone social scheduler with TikTok, LinkedIn, Discord, and more.
            Free plan available. Pro is $5/month.
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
