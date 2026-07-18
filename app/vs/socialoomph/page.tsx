'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',               competitor: '$15/month',                  socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    competitor: '❌ No free plan',             socialmate: '✅ 50 credits/month'     },
  { feature: 'TikTok scheduling',             competitor: '❌ No TikTok',               socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           competitor: '❌ No LinkedIn',             socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Discord scheduling',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Mastodon scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'X / Twitter scheduling',        competitor: '✅ (paid)',                  socialmate: '✅ Free (5 tweets/mo)'   },
  { feature: 'Facebook scheduling',           competitor: '✅ (paid)',                  socialmate: '🔜 Roadmap'              },
  { feature: 'AI writing tools',              competitor: '❌ No AI tools',             socialmate: '15+ AI tools free'        },
  { feature: 'Content calendar',             competitor: '✅ Basic',                   socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              competitor: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             competitor: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',           competitor: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                   competitor: '❌',                          socialmate: '✅ Built in free'         },
  { feature: 'Modern UI',                     competitor: '❌ Dated interface',         socialmate: '✅ Modern, mobile-ready'  },
  { feature: 'Team collaboration',            competitor: '$50+/month',                 socialmate: 'Free (2 seats)'          },
  { feature: 'AI content system (SOMA)',       competitor: '❌',                          socialmate: '✅ Full week auto-gen'   },
]

const FAQ = [
  {
    q: 'What is SocialOomph and is it still worth using in 2026?',
    a: 'SocialOomph is one of the oldest social media scheduling tools on the market. It supports Twitter/X, Facebook, Reddit, and a few others — but has not kept pace with newer platforms. No TikTok, no LinkedIn, no Bluesky, no Discord, no Telegram. Its interface is dated and its AI tools are nonexistent. At $15+/month, you\'re paying for legacy features when modern alternatives like SocialMate offer more for free.',
  },
  {
    q: 'Does SocialOomph support LinkedIn or TikTok?',
    a: 'No. SocialOomph does not support LinkedIn or TikTok — two of the most important platforms for professional and creator growth in 2026. SocialMate supports both: LinkedIn via official OAuth (live May 2026) and TikTok via the Production API (approved May 2026, 20 videos/month free). SocialOomph users wanting these platforms need a separate tool.',
  },
  {
    q: 'Does SocialOomph have AI writing tools?',
    a: 'No. SocialOomph has no AI writing assistance. SocialMate includes 15+ AI tools free: caption writing, hook generation, thread builder, content repurposing, hashtag research, and the full SOMA autonomous content system. If you\'re still writing every post from scratch with no AI assist, you\'re spending hours that competitors aren\'t.',
  },
  {
    q: 'Can SocialMate replace SocialOomph for Twitter/X scheduling?',
    a: 'Yes. SocialMate schedules X/Twitter posts via the official API with thread support, evergreen recycling, and queue management. SocialOomph\'s main differentiator on X is its queue drip system — SocialMate\'s Smart Queue feature (Pro+) does the equivalent, filling your schedule at optimal times automatically.',
  },
  {
    q: 'How does SocialMate\'s pricing compare to SocialOomph?',
    a: 'SocialOomph starts at $15/month with no free plan. SocialMate has a genuine free tier (50 credits/month across all 7 platforms) and Pro is $5/month. SocialMate is cheaper at every tier while covering dramatically more platforms and including AI tools that SocialOomph doesn\'t have at any price.',
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

export default function VsSocialOomphPage() {
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
            SocialMate vs SocialOomph
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            SocialOomph is a legacy scheduler with no TikTok, no LinkedIn, and no AI tools. SocialMate covers 7 modern platforms with 15+ AI tools — starting free.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialOomph</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Legacy scheduler, dated platforms</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Long queue / drip posting</li>
              <li>✅ X/Twitter and Facebook support</li>
              <li>✅ RSS import</li>
              <li>❌ No TikTok or LinkedIn</li>
              <li>❌ No AI writing tools</li>
              <li>❌ $15/month minimum — dated interface</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Modern AI-powered scheduler. Free to start.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ TikTok + LinkedIn + X + Bluesky + Discord + Telegram + Mastodon</li>
              <li>✅ 15+ AI tools free — SocialOomph has zero</li>
              <li>✅ SOMA autonomous content system</li>
              <li>✅ Pro plan for $5/month — cheaper than SocialOomph</li>
              <li>✅ Modern mobile-ready UI</li>
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
              <span>SocialOomph</span>
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
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators switch from SocialOomph to SocialMate</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'TikTok and LinkedIn don\'t exist in SocialOomph\'s world',
                desc: 'SocialOomph supports Twitter/X, Facebook, and Reddit — platforms from a previous era of social media dominance. It has no TikTok, no LinkedIn, no Bluesky. In 2026, leaving TikTok and LinkedIn unscheduled means leaving significant audience reach on the table. SocialMate covers both, free.',
              },
              {
                n: '2',
                title: 'Zero AI tools vs 12 free AI tools',
                desc: 'SocialOomph has no AI writing assistance at any price tier. SocialMate includes 15+ AI tools free: hook writing, caption rewriting, thread generation, content repurposing, hashtag suggestions, and the SOMA system that generates a full week of posts across all your platforms. The time savings alone justify switching.',
              },
              {
                n: '3',
                title: 'Cheaper and more modern at every tier',
                desc: 'SocialOomph starts at $15/month with no free plan and a dated interface. SocialMate has a genuine free tier and Pro costs $5/month — cheaper than SocialOomph\'s entry price with far more platform coverage, AI tools, and a modern mobile-ready UI.',
              },
              {
                n: '4',
                title: 'Discord and Telegram scheduling for community builders',
                desc: 'SocialOomph doesn\'t support Discord or Telegram. SocialMate does — uniquely among affordable schedulers. If you build community on Discord while posting on X and TikTok, SocialMate is the only tool that covers the full stack from one queue.',
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
          <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-3">Modern + cheaper + more platforms</p>
          <h2 className="text-3xl font-extrabold mb-4">Upgrade from SocialOomph for free</h2>
          <p className="text-ink-body mb-6 max-w-lg mx-auto text-sm">
            SocialMate is free to start. 7 platforms, 15+ AI tools, SOMA content system.
            Pro is $5/month — less than SocialOomph&apos;s entry price.
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
