'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

const COMPARISON = [
  { feature: 'Price',                         tiktoknative: 'Free (built into TikTok)',       socialmate: '$0 — free forever'         },
  { feature: 'Platforms supported',           tiktoknative: 'TikTok only',                    socialmate: '7 platforms'                },
  { feature: 'Schedule to TikTok',            tiktoknative: '✅',                              socialmate: '✅ Free (20 videos/mo)'     },
  { feature: 'Schedule to LinkedIn',          tiktoknative: '❌',                              socialmate: '✅ Free'                    },
  { feature: 'Schedule to Bluesky',           tiktoknative: '❌',                              socialmate: '✅ Free'                    },
  { feature: 'Schedule to Discord',           tiktoknative: '❌',                              socialmate: '✅ Free'                    },
  { feature: 'Schedule to Telegram',          tiktoknative: '❌',                              socialmate: '✅ Free'                    },
  { feature: 'Schedule to Mastodon',          tiktoknative: '❌',                              socialmate: '✅ Free'                    },
  { feature: 'Schedule to X / Twitter',       tiktoknative: '❌',                              socialmate: '✅ (Pro+)'                  },
  { feature: 'Cross-post one video to all',   tiktoknative: '❌',                              socialmate: '✅ One publish, 7 platforms'},
  { feature: 'AI writing tools',              tiktoknative: '❌',                              socialmate: '15+ tools free'             },
  { feature: 'TikTok script generator',       tiktoknative: '❌',                              socialmate: '✅ 5 credits'               },
  { feature: 'Content calendar UI',           tiktoknative: '⚠️ TikTok Studio only',          socialmate: '✅ Full cross-platform view' },
  { feature: 'Bulk scheduling',               tiktoknative: '❌',                              socialmate: '✅ Free'                    },
  { feature: 'Analytics',                     tiktoknative: 'TikTok analytics only',           socialmate: '✅ Cross-platform analytics' },
  { feature: 'Link in bio (SIGIL)',            tiktoknative: '❌',                              socialmate: '✅ Free'                    },
  { feature: 'Clips repurposing',             tiktoknative: '❌',                              socialmate: '✅ Twitch + YouTube clips'   },
  { feature: 'Team collaboration',            tiktoknative: '❌',                              socialmate: '✅ Free (2 seats)'          },
]

const FAQ = [
  {
    q: "What is TikTok's native scheduler?",
    a: "TikTok Studio (at studio.tiktok.com) includes a native scheduler that lets you upload videos and schedule them to post at a future time. It's free and built directly into TikTok. The limitation: it only works for TikTok. You cannot post to any other platform from TikTok Studio.",
  },
  {
    q: 'Why would I use SocialMate instead of TikTok Studio for scheduling?',
    a: "If TikTok is your only platform, TikTok Studio is fine — it's free and built in. But most TikTok creators also want to cross-post their videos to LinkedIn, Bluesky, Discord, Telegram, Mastodon, and X. With SocialMate, one scheduled post goes to all 7 platforms at once. You also get 15+ AI tools, a TikTok script generator, a bulk scheduler, and a cross-platform content calendar — all from one place.",
  },
  {
    q: 'Does SocialMate use the official TikTok API?',
    a: "Yes. SocialMate's TikTok integration uses the official TikTok Content Posting API — Production API approved May 17, 2026. This is the same API used by enterprise tools. Videos publish directly from your SocialMate account to your TikTok profile using the FILE_UPLOAD method. TikTok pulls the video from Supabase storage at publish time.",
  },
  {
    q: "Can SocialMate post TikTok videos to other platforms at the same time?",
    a: "Yes — that's the core advantage over TikTok's native scheduler. When you schedule a TikTok post in SocialMate, you can simultaneously select LinkedIn, Discord, Telegram, Bluesky, Mastodon, and X. One scheduling action, one time selection, all 7 platforms publish together.",
  },
  {
    q: 'How many TikTok videos can I schedule free?',
    a: "SocialMate's free plan includes 20 TikTok videos per month. Pro ($5/month) allows 60/month. Agency ($20/month) allows 200/month. TikTok's API has no per-post charge — the cost is only Supabase storage and egress, which SocialMate absorbs.",
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

export default function VsTikTokNativePage() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-screen bg-panel">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* NAV */}
      <nav className="border-b border-edge bg-panel sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold tracking-tight text-ink-high">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-ink-body hover:text-ink-high transition-colors">{t('vs_shared.nav_login')}</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-amber/10 text-ink-high rounded-xl hover:opacity-80 transition-all">{t('vs_shared.nav_start_free')}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* HERO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-raised border border-edge-lit rounded-full px-4 py-1.5 text-xs font-bold text-ink-muted mb-4">
            Updated June 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs TikTok&apos;s Native Scheduler
          </h1>
          <p className="text-lg text-ink-body max-w-2xl mx-auto">
            TikTok Studio lets you schedule TikTok posts. SocialMate schedules TikTok plus 6 other platforms simultaneously — LinkedIn, Discord, Bluesky, Telegram, Mastodon, and X. Free.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-amber/10 text-ink-high font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
              {t('vs_shared.cta_try_free')}
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-edge font-semibold rounded-2xl hover:border-edge transition-all text-sm text-ink-high">
              {t('vs_shared.cta_see_pricing')}
            </Link>
          </div>
        </div>

        {/* VERDICT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-panel border-2 border-edge rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">TikTok Native Scheduler (TikTok Studio)</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">TikTok-only, no cross-platform posting</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Free — built into TikTok Studio</li>
              <li>✅ Native TikTok integration</li>
              <li>✅ No setup required if you have a TikTok account</li>
              <li>❌ TikTok only — no other platforms</li>
              <li>❌ No AI tools, no bulk scheduling</li>
              <li>❌ No cross-platform content calendar</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">TikTok + 6 more platforms. One post. Free.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Official TikTok Production API — fully approved</li>
              <li>✅ Cross-post to 6 other platforms simultaneously</li>
              <li>✅ TikTok script generator (AI-powered, 5 credits)</li>
              <li>✅ 15+ AI tools for content creation</li>
              <li>✅ Full cross-platform content calendar</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-body uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>TikTok Native</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-body">{row.tiktoknative}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div></div>
        </div>

        {/* WHY */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why TikTok creators add SocialMate</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Your TikTok audience is on other platforms too',
                desc: "TikTok has massive reach — but your followers also exist on LinkedIn, Discord, Bluesky, and Telegram. TikTok Studio only posts to TikTok. SocialMate lets you publish the same video content to all 7 platforms in one action, reaching your full audience wherever they are.",
              },
              {
                n: '2',
                title: 'AI tools for TikTok content TikTok Studio does not have',
                desc: "SocialMate includes a TikTok Script Generator that writes hook, body, and CTA for any topic and duration — 5 credits. Plus 14 other AI tools: hashtag generator, caption writer, content repurposer, and SOMA which writes your entire week of content automatically. TikTok Studio has none of these.",
              },
              {
                n: '3',
                title: 'One content calendar for all your platforms',
                desc: "Managing TikTok posts in TikTok Studio and LinkedIn posts in LinkedIn and Discord announcements in Discord means three separate apps, three separate workflows. SocialMate puts your full content calendar — all 7 platforms — in one view so you can see and manage everything at once.",
              },
              {
                n: '4',
                title: 'Bulk scheduling + SOMA automation',
                desc: "TikTok Studio lets you schedule one video at a time. SocialMate's bulk scheduler lets you upload and schedule dozens of posts at once. SOMA's Autopilot mode generates and schedules a full week of TikTok content automatically, so your channel keeps posting even when you're not working.",
              },
            ].map((r) => (
              <div key={r.n} className="flex gap-4 p-5 bg-raised border border-edge rounded-2xl hover:border-edge transition-all">
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
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.faq_heading')}</h2>
          <div className="space-y-4">
            {FAQ.map((faq, i) => (
              <div key={i} className="p-5 bg-raised border border-edge rounded-2xl">
                <p className="text-sm font-extrabold mb-2 text-ink-high">{faq.q}</p>
                <p className="text-xs text-ink-body leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-void text-ink-high rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Schedule TikTok + 6 other platforms — free</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            Official TikTok Production API. Plus LinkedIn, Discord, Telegram, Bluesky, Mastodon, and X. 15+ AI tools. No credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-amber/10 text-ink-high font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-ink-muted text-xs mt-3">{t('vs_shared.cta_no_card')}</p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/vs" className="text-xs text-ink-body hover:text-ink-body transition-colors">
            ← View all comparisons
          </Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
