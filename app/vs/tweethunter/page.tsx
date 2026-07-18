'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',               competitor: '$49/month',                    socialmate: '$0 — free forever'       },
  { feature: 'Platforms supported',           competitor: 'X / Twitter only',             socialmate: '7 platforms'             },
  { feature: 'Free plan',                    competitor: '❌ No free plan',               socialmate: '✅ 50 credits/month'     },
  { feature: 'X / Twitter scheduling',        competitor: '✅',                            socialmate: '✅ Free (5 tweets/mo)'   },
  { feature: 'LinkedIn scheduling',           competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             competitor: '❌',                            socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'Bluesky scheduling',            competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Discord + Telegram',            competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Mastodon',                      competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Thread scheduling',             competitor: '✅ (X threads only)',           socialmate: '✅ Multi-platform threads'},
  { feature: 'AI writing tools',              competitor: '✅ (paid — X focused)',         socialmate: '15+ tools free'           },
  { feature: 'Content calendar',             competitor: '✅ (paid)',                     socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',           competitor: '✅ (paid)',                    socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                   competitor: '❌',                            socialmate: '✅ Built in free'         },
  { feature: 'Analytics',                     competitor: '✅ X only',                    socialmate: '✅ Multi-platform'       },
  { feature: 'Team collaboration',            competitor: '$79+/month',                   socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      competitor: '❌',                            socialmate: '✅ Tip jar + fan subs'   },
]

const FAQ = [
  {
    q: 'Is TweetHunter worth $49/month for X/Twitter only?',
    a: 'TweetHunter has strong X-specific features — viral tweet inspiration, engagement analytics, and DM automation. But at $49/month minimum, you\'re paying nearly $600/year for a single-platform tool. SocialMate covers X plus 6 other platforms starting free. If X is your only channel, TweetHunter has depth. If you post anywhere else, you\'ll need a second tool.',
  },
  {
    q: 'Can SocialMate replace TweetHunter for X/Twitter scheduling?',
    a: 'For scheduling X/Twitter posts and threads, yes. SocialMate posts directly to X via the official API and supports multi-part threads. The main TweetHunter-specific feature SocialMate doesn\'t replicate is its viral tweet database (inspiration from top-performing tweets). For core scheduling, thread queuing, and evergreen recycling, SocialMate handles it free.',
  },
  {
    q: 'Does SocialMate support Twitter threads?',
    a: 'Yes. SocialMate\'s compose thread builder lets you create numbered thread parts with individual character counters and auto-split logic. Threads submit as sequential posts. This works across X, Bluesky, and Mastodon simultaneously — TweetHunter can only post X threads.',
  },
  {
    q: 'What AI tools does SocialMate include for X content?',
    a: 'SocialMate\'s 15+ AI tools include hook writing (critical for X engagement), thread generation, caption rewriting for punchy X tone, hashtag research, and content repurposing (turn a LinkedIn post into an X thread). SOMA can generate a full week of X content automatically based on your voice profile.',
  },
  {
    q: 'Does SocialMate have analytics for X/Twitter?',
    a: 'SocialMate tracks engagement across connected platforms. X/Twitter API access provides engagement data on posts published through SocialMate. For deep X-specific metrics like profile impressions and audience demographics, X\'s native analytics remains more detailed. SocialMate adds value in cross-platform comparison — seeing how your X content performs vs Bluesky or LinkedIn.',
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

export default function VsTweetHunterPage() {
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
            SocialMate vs TweetHunter
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            TweetHunter charges $49/month for X/Twitter-only scheduling. SocialMate covers X plus 6 other platforms — starting completely free.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">TweetHunter</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Deep X/Twitter focus, premium price</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Viral tweet inspiration database</li>
              <li>✅ X-specific engagement analytics</li>
              <li>✅ DM automation for X</li>
              <li>❌ X/Twitter only — no other platforms</li>
              <li>❌ $49/month minimum — no free plan</li>
              <li>❌ No LinkedIn, TikTok, Discord, Bluesky</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">X + 6 more platforms. Free to start.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ X + LinkedIn + TikTok + Bluesky + Discord + Telegram + Mastodon</li>
              <li>✅ Thread builder across multiple platforms</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ Pro plan for $5/month total</li>
              <li>✅ SOMA AI content system built in</li>
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
              <span>TweetHunter</span>
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
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators choose SocialMate over TweetHunter</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '$49/month for one platform is hard to justify',
                desc: 'TweetHunter\'s entry price is $49/month — nearly $600/year — locked to X/Twitter alone. SocialMate schedules X posts free, and for $5/month you unlock Pro features across 7 platforms. If you post anywhere besides X, TweetHunter forces you to pay for a second tool on top.',
              },
              {
                n: '2',
                title: 'Audiences live on more than just X',
                desc: 'X/Twitter is powerful for real-time conversation and building a following, but creators also run Discord communities, Telegram channels, LinkedIn profiles, and TikTok accounts. TweetHunter can\'t touch any of those. SocialMate schedules all 7 from one composer with one subscription.',
              },
              {
                n: '3',
                title: 'TikTok and LinkedIn are where the growth is',
                desc: 'TikTok\'s organic reach is unmatched in 2026 — the algorithm still surfaces content to non-followers. LinkedIn is exploding for B2B and professional creators. TweetHunter ignores both. SocialMate schedules TikTok (free, 20 videos/mo) and LinkedIn (live via official API) with no extra cost.',
              },
              {
                n: '4',
                title: 'SOMA handles your X content strategy end-to-end',
                desc: 'SocialMate\'s SOMA AI system generates a full week of cross-platform content including X posts and threads. Define your voice, topics, and cadence — SOMA writes and schedules everything. No other tool does this for $5/month across 7 platforms including X.',
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
          <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-3">7 platforms for $5/month</p>
          <h2 className="text-3xl font-extrabold mb-4">Schedule X posts — and 6 more platforms</h2>
          <p className="text-ink-body mb-6 max-w-lg mx-auto text-sm">
            SocialMate posts to X/Twitter via the official API. Schedule threads, set post times, recycle evergreen content.
            When you&apos;re ready to go further, Pro is $5/month for all 7 platforms.
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
