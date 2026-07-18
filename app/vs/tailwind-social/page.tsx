'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',              tailwind: '$12.99/month (Pro)',            socialmate: '$0 — free forever'        },
  { feature: 'Free plan with auto-publish', tailwind: '❌ Manual posting only',        socialmate: '✅ Free auto-publish'     },
  { feature: 'Primary platform focus',      tailwind: 'Pinterest + Instagram',         socialmate: '7 platforms'             },
  { feature: 'Pinterest support',           tailwind: '✅ Core feature',               socialmate: '✅ (approval pending)'    },
  { feature: 'Instagram support',           tailwind: '✅',                             socialmate: '✅ (approval pending)'    },
  { feature: 'TikTok / video platforms',    tailwind: '❌',                             socialmate: '✅ Live'                  },
  { feature: 'Bluesky support',             tailwind: '❌',                             socialmate: '✅'                       },
  { feature: 'Discord support',             tailwind: '❌',                             socialmate: '✅'                       },
  { feature: 'Telegram support',            tailwind: '❌',                             socialmate: '✅'                       },
  { feature: 'Mastodon support',            tailwind: '❌',                             socialmate: '✅'                       },
  { feature: 'AI writing tools',            tailwind: '❌',                             socialmate: '15+ tools included'        },
  { feature: 'AI credits free tier',        tailwind: 'N/A (no free auto-publish)',    socialmate: '50/month free'            },
  { feature: 'SmartSchedule feature',       tailwind: '✅ (paid plan)',                socialmate: 'Best-time AI (free tier)' },
  { feature: 'Bulk scheduling',             tailwind: 'Paid plans only',               socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                 tailwind: '❌',                             socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',             tailwind: 'Hashtag finder (paid)',         socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',         tailwind: '❌',                             socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',         tailwind: '❌',                             socialmate: '✅ Free (3 accounts)'     },
  { feature: 'RSS import',                  tailwind: '❌',                             socialmate: '✅ Free'                  },
]

const FAQ = [
  {
    q: 'Is Tailwind App the same as the Tailwind CSS framework?',
    a: 'No. Tailwind App (tailwindapp.com) is a social media scheduling tool focused on Pinterest and Instagram. It has nothing to do with Tailwind CSS, the utility-first CSS framework. This comparison covers only the social media scheduling product.',
  },
  {
    q: 'Does Tailwind App have a free plan?',
    a: 'Tailwind App has a free account option, but it does not include automatic publishing. Free users can draft and plan content but must manually click to post. If you want automatic scheduling — the core feature of any scheduling tool — you need the paid plan starting at $12.99/month. SocialMate\'s free plan includes automatic publishing with no manual step.',
  },
  {
    q: 'Why is Tailwind App limited to Pinterest and Instagram?',
    a: 'Tailwind was originally built specifically for Pinterest before expanding to Instagram. It has not expanded beyond those two platforms and does not support video-first platforms, community tools like Discord, or decentralized platforms like Mastodon and Bluesky. If your content strategy includes more than Pinterest and Instagram, Tailwind App cannot support it.',
  },
  {
    q: 'Is SocialMate better than Tailwind App for creators?',
    a: 'For most creators, yes. SocialMate covers 7 platforms with real auto-publishing on the free plan, includes 12 AI writing tools, and adds features like bulk scheduling, link in bio, and evergreen recycling — all free. Tailwind App is useful if Pinterest is your primary and almost exclusive platform. For anyone posting across multiple channels, SocialMate is the better fit.',
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

export default function VsTailwindSocialPage() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-dvh bg-panel">
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
            Updated April 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs Tailwind App
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Tailwind App (tailwindapp.com) is a Pinterest-focused scheduler with no free auto-publish. SocialMate covers 7 platforms and is free forever.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Tailwind App</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Pinterest-only focus</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Strong Pinterest scheduling with SmartSchedule</li>
              <li>✅ Good Instagram grid planning</li>
              <li>❌ No free auto-publish — must pay $12.99/month</li>
              <li>❌ Pinterest and Instagram only</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ No AI writing tools</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">7 platforms. AI tools. $0.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Free forever with real auto-publishing</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Bulk scheduling free</li>
              <li>✅ Link in bio included free</li>
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
              <span>Tailwind App</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.tailwind}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why people switch from Tailwind App</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Free plan requires manual publishing — that defeats the purpose',
                desc: 'The entire point of a scheduling tool is that it posts for you. Tailwind App\'s free tier lets you plan content but still requires you to manually hit publish every time. If you want actual auto-publishing on Tailwind, you need to pay $12.99/month. SocialMate\'s free plan publishes automatically — no manual step, no paywall.',
              },
              {
                n: '2',
                title: 'Pinterest-only focus is too narrow for most content strategies',
                desc: 'Tailwind App was built for Pinterest. If Pinterest is your one and only platform, it does the job well. But most creators and businesses post to multiple places. Tailwind App does not support TikTok, YouTube, Discord, Bluesky, Mastodon, Telegram, or most other platforms. SocialMate covers 7 platforms from a single dashboard.',
              },
              {
                n: '3',
                title: 'No AI writing tools means more manual work',
                desc: 'Tailwind App does not include AI caption generation, hashtag assistance, or any writing tools. Every piece of copy comes entirely from you. SocialMate includes 15+ AI tools on the free tier — caption generation, viral hook writing, post scoring, hashtag sets, and more — saving hours every week.',
              },
              {
                n: '4',
                title: 'SocialMate includes features Tailwind App charges for or skips',
                desc: 'Bulk scheduling, link in bio, evergreen content recycling, competitor tracking, and RSS import are all included free on SocialMate. Tailwind App charges for its SmartSchedule feature and does not offer most of these tools at any price point. If your workflow involves more than just pinning, SocialMate covers more ground for less money.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">More than Pinterest — start free today</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — 7 platforms, bulk scheduling, 15+ AI tools, real auto-publishing. No credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-panel text-ink-high font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-ink-muted text-xs mt-3">{t('vs_shared.cta_no_card')}</p>
        </div>
      </div>
      {/* FOOTER */}
      <PublicFooter />
    </div>
  )
}
