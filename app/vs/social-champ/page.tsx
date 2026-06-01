'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',              champ: '$29/mo (Champion)',           socialmate: '$0 — free forever'          },
  { feature: 'Pro plan',                    champ: '$29/mo',                      socialmate: '$5/mo'                      },
  { feature: 'TikTok scheduling',           champ: '✅',                          socialmate: '✅ Full (Production API)'    },
  { feature: 'Bluesky support',             champ: '❌',                          socialmate: '✅'                          },
  { feature: 'Discord scheduling',          champ: '❌',                          socialmate: '✅ Free'                     },
  { feature: 'Telegram scheduling',         champ: '❌',                          socialmate: '✅ Free'                     },
  { feature: 'AI writing tools',            champ: 'AI caption assist',          socialmate: '20+ social-specific tools'  },
  { feature: 'Autonomous content (SOMA)',   champ: '❌',                          socialmate: '✅ (Autopilot/Full Send)'    },
  { feature: 'Trading bot (Enki)',          champ: '❌',                          socialmate: '✅ Free paper trading'       },
  { feature: 'Bulk scheduling',             champ: '✅',                          socialmate: '✅ Free'                     },
  { feature: 'Analytics dashboard',         champ: '✅',                          socialmate: '✅ Full analytics + Content DNA' },
  { feature: 'Free plan available',         champ: '✅ Very limited',             socialmate: '✅ Full scheduling + AI'     },
  { feature: 'No per-channel fees',         champ: '✅',                          socialmate: '✅'                          },
  { feature: 'Link in bio',                 champ: '❌',                          socialmate: '✅ Free'                     },
  { feature: 'Social inbox',                champ: '✅ (paid)',                   socialmate: '✅ 4 platforms'              },
  { feature: 'Team seats (entry plan)',     champ: '1',                          socialmate: '2 free'                     },
]

const FAQ = [
  {
    q: "What is Social Champ?",
    a: "Social Champ is a social media scheduling tool often marketed as a cheaper alternative to Buffer and Hootsuite. It supports several mainstream platforms and has basic AI features. However, its Champion plan starts at $29/month — nearly 6x more expensive than SocialMate Pro at $5/month.",
  },
  {
    q: "Does Social Champ support Discord or Telegram?",
    a: "No. Social Champ does not support Discord or Telegram scheduling. If your community is on either platform, you would need a separate tool. SocialMate includes both on its free plan.",
  },
  {
    q: "Does Social Champ support Bluesky?",
    a: "No. Social Champ does not currently support Bluesky. SocialMate supports Bluesky natively, including full analytics sync via the public AT Protocol API.",
  },
  {
    q: "How is SocialMate cheaper than Social Champ?",
    a: "SocialMate is free to start and $5/month for Pro. Social Champ's entry paid plan is $29/month. SocialMate at $5/month includes more platforms (Discord, Telegram, Bluesky), 20+ AI tools, SOMA autonomous content system, and an Enki trading bot — none of which Social Champ offers.",
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

export default function VsSocialChampPage() {
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
            SocialMate vs Social Champ
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Social Champ starts at $29/month and still lacks Discord, Telegram, and Bluesky. SocialMate Pro is $5/month and covers all three — plus SOMA, Enki, and 20+ AI tools.
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
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Social Champ</p>
            <p className="font-extrabold text-lg mb-2">Budget Buffer alternative — but still pricey.</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>✅ Bulk scheduling</li>
              <li>✅ Basic AI caption assistance</li>
              <li>❌ $29/mo entry paid plan</li>
              <li>❌ No Discord, Telegram, or Bluesky</li>
              <li>❌ No autonomous AI content (SOMA)</li>
              <li>❌ No trading bot</li>
            </ul>
          </div>
          <div className="bg-amber-400 text-black rounded-2xl p-6">
            <p className="text-xs font-bold text-black/60 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">5x cheaper. More platforms. More AI.</p>
            <ul className="space-y-1 text-xs text-black/80">
              <li>✅ 7 live platforms including Discord, Telegram + LinkedIn</li>
              <li>✅ 20+ AI content and writing tools</li>
              <li>✅ SOMA: autonomous weekly content generation</li>
              <li>✅ Enki: paper + live trading bot</li>
              <li>✅ Pro plan: $5/month</li>
              <li>✅ Free plan with full scheduling</li>
            </ul>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-400 uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Social Champ</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-800 ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-400">{row.champ}</span>
                <span className="text-xs font-semibold text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">Why creators switch from Social Champ to SocialMate</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: "Social Champ is 6x more expensive than SocialMate Pro",
                desc: "Social Champ's Champion plan is $29/month. SocialMate Pro is $5/month. Both include bulk scheduling and analytics. SocialMate adds Discord, Telegram, Bluesky, 20+ AI tools, SOMA, and Enki — none of which Social Champ has.",
              },
              {
                n: '2',
                title: 'No Discord, Telegram, or Bluesky on Social Champ',
                desc: "Discord and Telegram are among the fastest-growing community platforms online. Bluesky reached 30 million users in 2026. Social Champ does not support any of them. SocialMate supports all three on the free plan.",
              },
              {
                n: '3',
                title: 'SocialMate has SOMA — Social Champ has no autonomous content',
                desc: "Social Champ has basic AI caption suggestions. SocialMate's SOMA learns your entire brand voice, ingests your source material, and generates a full week of platform-native posts autonomously — with Autopilot mode that schedules them without any manual review.",
              },
              {
                n: '4',
                title: 'Free plan actually works for real scheduling',
                desc: "Social Champ's free plan is very limited. SocialMate's free plan includes 50 AI credits/month, unlimited post scheduling, bulk scheduler, link in bio, competitor tracking, and 2 team seats — everything a solo creator needs to run a real content operation.",
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Pay 6x less. Get more platforms. More AI.</h2>
          <p className="text-black/70 text-sm mb-6 max-w-lg mx-auto">
            SocialMate Pro is $5/month. Discord, Telegram, Bluesky, TikTok, Mastodon, X — plus 20+ AI tools and SOMA autonomous content.
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
