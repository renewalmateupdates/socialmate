'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

const COMPARISON = [
  { feature: 'Price',                       tiktoknative: 'Free (built into TikTok)',  socialmate: '$0 — free forever'        },
  { feature: 'Schedule to TikTok',          tiktoknative: '✅',                         socialmate: '✅ (Production API live)' },
  { feature: 'Schedule to Discord',         tiktoknative: '❌',                         socialmate: '✅'                       },
  { feature: 'Schedule to LinkedIn',        tiktoknative: '❌',                         socialmate: '✅'                       },
  { feature: 'Schedule to Bluesky',         tiktoknative: '❌',                         socialmate: '✅'                       },
  { feature: 'Schedule to Telegram',        tiktoknative: '❌',                         socialmate: '✅'                       },
  { feature: 'Schedule to Mastodon',        tiktoknative: '❌',                         socialmate: '✅'                       },
  { feature: 'Schedule to X / Twitter',     tiktoknative: '❌',                         socialmate: '✅'                       },
  { feature: 'TikTok Script AI Generator',  tiktoknative: '❌',                         socialmate: '✅ 5 credits'              },
  { feature: 'AI caption tools',            tiktoknative: '❌',                         socialmate: '15+ tools free'            },
  { feature: 'Bulk scheduling',             tiktoknative: '❌',                         socialmate: '✅ Free'                   },
  { feature: 'Content calendar',            tiktoknative: 'TikTok-only calendar',       socialmate: '✅ All 7 platforms'        },
  { feature: 'Link in bio (SIGIL)',          tiktoknative: '❌',                         socialmate: '✅ Free'                   },
  { feature: 'Competitor tracking',         tiktoknative: '❌',                         socialmate: '✅ Free (3 accounts)'     },
  { feature: 'Analytics across platforms',  tiktoknative: 'TikTok analytics only',      socialmate: '✅ Multi-platform'        },
]

const FAQ = [
  {
    q: "Does TikTok have a built-in scheduler?",
    a: "Yes. TikTok Business Suite and TikTok Studio allow you to schedule posts up to 10 days in advance — but only to TikTok. You cannot use it to schedule content for Discord, LinkedIn, Bluesky, or any other platform.",
  },
  {
    q: 'Why use SocialMate instead of TikTok Studio?',
    a: "If TikTok is your only platform, TikTok Studio is a reasonable free option. But most creators who post on TikTok also have communities on Discord, LinkedIn, Bluesky, Telegram, and Mastodon. SocialMate lets you schedule to all 7 platforms simultaneously — plus you get a TikTok Script AI generator, 15+ other AI tools, bulk scheduling, and analytics.",
  },
  {
    q: 'Does SocialMate support TikTok scheduling?',
    a: "Yes. SocialMate received Production API approval from TikTok in May 2026. You can connect your TikTok account at /accounts and schedule TikTok posts from the same dashboard you use for all other platforms. The quota is free — 20 posts/month on the free plan, 60 on Pro, 200 on Agency.",
  },
  {
    q: 'Can SocialMate generate TikTok scripts?',
    a: "Yes. SocialMate has a dedicated TikTok Script Generator AI tool at /ai-features/tiktok-script. Enter your topic, video duration, and tone — it returns a hook, body sections, and CTA. Costs 5 credits (free users get 50 credits/month).",
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

export default function VsTiktokSchedulerPage() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-screen bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <nav className="border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold tracking-tight text-white">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-gray-400 hover:text-white transition-colors">{t('vs_shared.nav_login')}</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-amber-500 text-black rounded-xl hover:opacity-80 transition-all">{t('vs_shared.nav_start_free')}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-950/30 border border-blue-800 rounded-full px-4 py-1.5 text-xs font-bold text-blue-400 mb-4">
            Updated June 2026 — TikTok Production API Live
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-white">
            SocialMate vs TikTok Native Scheduler
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            TikTok Studio only schedules to TikTok. SocialMate schedules TikTok plus 6 other platforms — with a TikTok Script AI generator, bulk scheduling, and analytics. Free.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-amber-500 text-black font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
              {t('vs_shared.cta_try_free')}
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-gray-700 font-semibold rounded-2xl hover:border-gray-500 transition-all text-sm text-gray-200">
              {t('vs_shared.cta_see_pricing')}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">TikTok Native Scheduler</p>
            <p className="font-extrabold text-lg mb-2 text-white">Free TikTok-only scheduling</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>✅ Free and built into TikTok</li>
              <li>✅ Schedule up to 10 days in advance</li>
              <li>❌ TikTok only — no other platforms</li>
              <li>❌ No AI caption or script tools</li>
              <li>❌ No bulk scheduling</li>
              <li>❌ No link in bio, analytics, or competitor tracking</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">TikTok + 6 platforms. AI Script Generator. Free.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ TikTok scheduling (Production API approved)</li>
              <li>✅ Discord, LinkedIn, Bluesky, Telegram, Mastodon, X</li>
              <li>✅ TikTok Script AI Generator built in</li>
              <li>✅ 15+ AI tools, bulk scheduling</li>
              <li>✅ SIGIL link in bio, analytics, competitor tracking</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-white">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-400 uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>TikTok Scheduler</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-800 ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-400">{row.tiktoknative}</span>
                <span className="text-xs font-semibold text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div></div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-white">Why TikTok creators need more than TikTok Studio</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Your audience is not only on TikTok',
                desc: "TikTok creators often have Discord servers, LinkedIn profiles, Bluesky followings, and Telegram channels. TikTok Studio ignores all of them. SocialMate lets you announce your new TikTok video to all those communities simultaneously — without extra effort.",
              },
              {
                n: '2',
                title: 'TikTok Script Generator — free with SocialMate',
                desc: "SocialMate includes a dedicated TikTok Script AI generator. Enter your topic, preferred duration (30s, 60s, 3min), and tone — get a complete hook, body breakdown, and CTA. TikTok Studio has no equivalent AI tool.",
              },
              {
                n: '3',
                title: 'Bulk schedule a month of TikToks at once',
                desc: "TikTok Studio lets you schedule one post at a time, up to 10 days out. SocialMate's bulk scheduler lets you upload a CSV of months of content and schedule all of it in one session. For creators batching content on weekends, this is a game changer.",
              },
              {
                n: '4',
                title: 'Platform independence matters',
                desc: "Building your entire content workflow around a tool that TikTok can change, remove, or restrict at any time creates risk. SocialMate is an independent scheduler that calls TikTok's official Production API — your workflow stays stable regardless of what TikTok changes in their Studio.",
              },
            ].map((r) => (
              <div key={r.n} className="flex gap-4 p-5 bg-gray-800 border border-gray-700 rounded-2xl hover:border-gray-600 transition-all">
                <div className="w-8 h-8 bg-amber-500 text-black rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0">{r.n}</div>
                <div>
                  <p className="text-sm font-extrabold mb-1 text-gray-100">{r.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-white">{t('vs_shared.faq_heading')}</h2>
          <div className="space-y-4">
            {FAQ.map((faq, i) => (
              <div key={i} className="p-5 bg-gray-800 border border-gray-700 rounded-2xl">
                <p className="text-sm font-extrabold mb-2 text-gray-100">{faq.q}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">TikTok is just one platform. Reach all 7.</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            TikTok + 6 more platforms, AI Script Generator, bulk scheduling — completely free to start.
          </p>
          <Link href="/signup" className="inline-block bg-amber-500 text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-gray-600 text-xs mt-3">{t('vs_shared.cta_no_card')}</p>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
