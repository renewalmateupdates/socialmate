'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',               competitor: '$18/month',                  socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    competitor: '❌ No free plan',             socialmate: '✅ 50 credits/month'     },
  { feature: 'TikTok scheduling',             competitor: '⚠️ Limited/add-on',          socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           competitor: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Discord scheduling',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Mastodon scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',              competitor: '✅ (paid)',                  socialmate: '15+ tools free'           },
  { feature: 'Content calendar',             competitor: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              competitor: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                   competitor: '❌',                          socialmate: '✅ Built in free'         },
  { feature: 'Analytics',                     competitor: '✅ Basic',                   socialmate: '✅ Multi-platform'       },
  { feature: 'Team collaboration',            competitor: '$29+/month',                 socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      competitor: '❌',                          socialmate: '✅ Tip jar + fan subs'   },
  { feature: 'AI content system (SOMA)',       competitor: '❌',                          socialmate: '✅ Full week auto-gen'   },
]

const FAQ = [
  {
    q: 'What is Postly and how does it compare to SocialMate?',
    a: 'Postly is a social media scheduling tool targeting small businesses and marketing teams. It supports Facebook, Instagram, Twitter, LinkedIn, Reddit, and has limited TikTok functionality. At $18/month minimum with no free plan, it\'s positioned as a budget-friendly scheduler. SocialMate undercuts it on price ($5/month Pro vs $18/month) while offering more platform coverage and a genuine free tier.',
  },
  {
    q: 'Does Postly support TikTok properly?',
    a: 'Postly\'s TikTok support is limited and often requires manual posting reminders rather than direct publish. SocialMate uses the official TikTok Content Posting API (Production-approved May 2026) for direct video uploads with metadata — privacy settings, cover frame, caption. This is a direct publish flow, not a reminder system.',
  },
  {
    q: 'Does SocialMate support the platforms Postly covers?',
    a: 'SocialMate covers Twitter/X, LinkedIn, and Bluesky — all platforms Postly targets — plus Discord, Telegram, TikTok, and Mastodon which Postly doesn\'t support. The main platforms Postly covers that SocialMate doesn\'t yet are Facebook and Instagram (requiring Meta App Review, on SocialMate\'s roadmap).',
  },
  {
    q: 'How does SocialMate\'s free plan compare to Postly\'s pricing?',
    a: 'Postly has no free plan — you start at $18/month. SocialMate gives you 50 credits/month free, scheduling across all 7 platforms with no credit card required. Pro is $5/month, Agency is $20/month. You get more platforms and pay less at every tier.',
  },
  {
    q: 'Does SocialMate have bulk scheduling like Postly?',
    a: 'Yes. SocialMate supports bulk scheduling via CSV upload and the Smart Queue feature (Pro+) which automatically fills a 14–30 day schedule at platform-optimal posting times. Evergreen content recycling automatically re-queues top-performing posts. Both features are available free or at low cost.',
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

export default function VsPostlyPage() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-screen bg-panel">
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
            Updated May 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs Postly
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Postly starts at $18/month with limited TikTok support and no Discord or Telegram. SocialMate covers 7 platforms with proper TikTok direct publishing — free to start.
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

        {/* VERDICT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-panel border-2 border-edge rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Postly</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Budget scheduler, limited TikTok</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Facebook + Instagram support</li>
              <li>✅ Basic scheduling features</li>
              <li>⚠️ TikTok limited / reminder-based</li>
              <li>❌ No free plan — starts at $18/month</li>
              <li>❌ No Discord or Telegram</li>
              <li>❌ No Bluesky or Mastodon</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Real TikTok publishing + 6 more. Free.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ TikTok direct publish (Production API — approved May 2026)</li>
              <li>✅ X + LinkedIn + Bluesky + Discord + Telegram + Mastodon</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ Pro plan for $5/month — 72% less than Postly</li>
              <li>✅ SOMA AI content system</li>
              <li>✅ No credit card required to start</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-muted uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Postly</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.competitor}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators choose SocialMate over Postly</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Real TikTok publishing vs reminder-based workarounds',
                desc: 'Postly\'s TikTok support relies on push reminders — it notifies you to manually post at a scheduled time. SocialMate uses TikTok\'s official Content Posting API to directly publish your video with caption, privacy settings, and cover frame. Production API approved by TikTok in May 2026. No manual steps.',
              },
              {
                n: '2',
                title: 'Free tier that actually works',
                desc: 'Postly has no free plan. SocialMate gives you 50 credits/month free across all 7 platforms — enough to test the tool thoroughly, build habits, and schedule real content before committing to paid. Pro is $5/month when you\'re ready to scale.',
              },
              {
                n: '3',
                title: 'Discord and Telegram included at no extra cost',
                desc: 'Most communities in 2026 run on Discord or Telegram. Postly ignores both. SocialMate schedules Discord messages and Telegram posts alongside your social media — so your community announcements, content drops, and engagement all happen from one queue.',
              },
              {
                n: '4',
                title: 'AI-first workflow from day one',
                desc: '12 AI writing tools free, SOMA for autonomous weekly content generation, hashtag research, hook writing, and content repurposing. Postly has basic AI assist on paid plans. SocialMate\'s AI stack is deeper, free earlier, and integrated into every workflow.',
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

        {/* BOTTOM CTA */}
        <div className="text-center py-12 bg-void text-ink-high rounded-3xl px-8">
          <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-3">Real TikTok publishing, free</p>
          <h2 className="text-3xl font-extrabold mb-4">Schedule TikTok + 6 more platforms</h2>
          <p className="text-ink-body mb-6 max-w-lg mx-auto text-sm">
            SocialMate uses TikTok&apos;s official Production API for direct video publishing. No reminders, no manual steps.
            Free plan available. Pro is $5/month.
          </p>
          <Link href="/signup" className="inline-block px-8 py-3 bg-panel text-ink-high font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
            Start free — no credit card →
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link href="/vs" className="text-xs text-ink-body hover:text-ink-muted dark:hover:text-ink-body transition-colors">
            ← View all comparisons
          </Link>
        </div>

      </div>
      <PublicFooter />
    </div>
  )
}
