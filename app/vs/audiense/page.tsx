'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',               competitor: '$79/month',                  socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    competitor: '⚠️ Very limited free tier',   socialmate: '✅ 50 credits/month'     },
  { feature: 'Post scheduling',              competitor: '❌ No scheduling at all',     socialmate: '✅ Free across 7 platforms'},
  { feature: 'Twitter audience insights',    competitor: '✅ Enterprise-grade',         socialmate: '✅ Engagement tracking'  },
  { feature: 'TikTok scheduling',             competitor: '❌',                          socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Discord + Telegram',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Mastodon scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',              competitor: '❌ No AI content tools',     socialmate: '15+ tools free'           },
  { feature: 'Content calendar',             competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Audience segmentation',         competitor: '✅ Deep (enterprise)',        socialmate: '🔜 Roadmap'              },
  { feature: 'Evergreen recycling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                   competitor: '❌',                          socialmate: '✅ Built in free'         },
  { feature: 'Best-times heatmap',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Team collaboration',            competitor: 'Enterprise pricing',          socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      competitor: '❌',                          socialmate: '✅ Tip jar + fan subs'   },
]

const FAQ = [
  {
    q: 'What is Audiense and what does it actually do?',
    a: 'Audiense is an enterprise-grade Twitter/X audience intelligence platform. It segments your audience into behavioral clusters, identifies influencers within your follower base, maps audience interests, and provides demographic breakdowns. It\'s designed for brands running large-scale campaigns. At $79+/month with no scheduling features, it\'s a pure audience research tool — you\'d still need a separate scheduler on top.',
  },
  {
    q: 'Does Audiense support post scheduling?',
    a: 'No. Audiense does not schedule posts. It\'s audience analytics only. If you\'re using Audiense, you\'re already paying for a separate scheduling tool on top of it. SocialMate combines scheduling across 7 platforms with analytics and best-times insights in one dashboard — free to start.',
  },
  {
    q: 'Who should use Audiense vs SocialMate?',
    a: 'Audiense is for enterprise marketing teams running Twitter/X audience research campaigns at scale — segmenting hundreds of thousands of followers, identifying micro-communities within an audience, powering paid ad targeting. SocialMate is for creators, small businesses, and agencies that need to publish content across 7 platforms, understand performance, and grow. Different tools for different jobs.',
  },
  {
    q: 'Can SocialMate replace Audiense for engagement analytics?',
    a: 'For content performance analytics (engagement rates, best posting times, top posts per platform), yes. SocialMate tracks this across all 7 platforms. For deep audience segmentation, behavioral clusters, and influencer mapping within your followers, Audiense has capabilities SocialMate doesn\'t replicate. If you need both, SocialMate handles the scheduling + performance analytics; Audiense handles deep research.',
  },
  {
    q: 'What makes SocialMate a better value than Audiense for most creators?',
    a: 'Audiense costs $79+/month for analytics only — no scheduling, no AI tools, Twitter-only. SocialMate is free to start and covers scheduling + analytics + AI across 7 platforms including TikTok and LinkedIn. For 99% of creators, the content performance data SocialMate provides is everything they actually need. Audiense\'s enterprise-level audience intelligence is overkill for individual creators and small teams.',
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

export default function VsAudiensePage() {
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
            SocialMate vs Audiense
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Audiense charges $79+/month for Twitter audience analytics with zero scheduling. SocialMate schedules 7 platforms and includes analytics — free to start.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Audiense</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Enterprise audience research, no scheduling</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Deep Twitter audience segmentation</li>
              <li>✅ Behavioral cluster mapping</li>
              <li>✅ Influencer identification within followers</li>
              <li>❌ No post scheduling whatsoever</li>
              <li>❌ Twitter/X only</li>
              <li>❌ $79+/month — requires a separate scheduler</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Schedule + analyze across 7 platforms. Free.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Schedule across X, TikTok, LinkedIn, Bluesky, Discord, Telegram, Mastodon</li>
              <li>✅ Content performance analytics built in</li>
              <li>✅ Best-times heatmap per platform</li>
              <li>✅ Pro plan for $5/month — no second tool needed</li>
              <li>✅ 15+ AI tools free</li>
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
              <span>Audiense</span>
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
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators choose SocialMate over Audiense</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '$79/month for a tool that can\'t post is hard to justify',
                desc: 'Audiense provides rich audience insights — but no scheduling. You\'re paying $79+/month for research, then spending more on a separate publisher. SocialMate combines scheduling + analytics for free, with Pro at $5/month. For creators and small businesses, that\'s a $940+/year saving while gaining scheduling capabilities Audiense will never have.',
              },
              {
                n: '2',
                title: 'Content performance is more actionable than audience research',
                desc: 'Knowing your audience segments is interesting. Knowing which posts got the most engagement, which posting times drive clicks, and which platform performs best for your content — that\'s what moves the needle. SocialMate\'s analytics focuses on content performance data you can act on immediately.',
              },
              {
                n: '3',
                title: 'Platform coverage beyond Twitter/X matters',
                desc: 'Audiense is Twitter/X only. If you want audience insights or scheduling for TikTok, LinkedIn, Bluesky, Discord, or Telegram, Audiense can\'t help. SocialMate covers all 7 from one dashboard with engagement data across every connected platform.',
              },
              {
                n: '4',
                title: 'SOMA turns insights into content automatically',
                desc: 'Understanding your audience is step one. Creating content for them is the work. SocialMate\'s SOMA AI system uses your voice profile to generate a full week of posts for every connected platform. The gap from "I know my audience" to "content is publishing" is closed automatically.',
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
          <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-3">Analytics that actually help you post</p>
          <h2 className="text-3xl font-extrabold mb-4">Schedule + analyze across 7 platforms</h2>
          <p className="text-ink-body mb-6 max-w-lg mx-auto text-sm">
            SocialMate gives you scheduling and performance analytics in one platform.
            Free plan available. Pro is $5/month — no separate analytics tool needed.
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
