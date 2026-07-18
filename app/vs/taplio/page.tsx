'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',               taplio: '$39/month',                socialmate: '$0 — free forever'       },
  { feature: 'Platforms supported',           taplio: 'LinkedIn only',             socialmate: '7 platforms'             },
  { feature: 'Free plan',                    taplio: '❌ No free plan',            socialmate: '✅ 50 credits/month'     },
  { feature: 'LinkedIn scheduling',           taplio: '✅',                         socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            taplio: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'X / Twitter scheduling',        taplio: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             taplio: '❌',                         socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'Discord + Telegram',            taplio: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Mastodon',                      taplio: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',              taplio: '✅ (paid — carousel gen)',   socialmate: '15+ tools free'           },
  { feature: 'Content calendar',             taplio: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              taplio: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             taplio: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',           taplio: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                   taplio: '❌',                         socialmate: '✅ Built in free'         },
  { feature: 'Competitor tracking',           taplio: '✅ (LinkedIn only, paid)',   socialmate: '✅ Free (3 accounts)'    },
  { feature: 'Engagement analytics',          taplio: '✅ LinkedIn only',           socialmate: '✅ Multi-platform'       },
  { feature: 'Team collaboration',            taplio: '$59+/month',                socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      taplio: '❌',                         socialmate: '✅ Tip jar + fan subs'   },
]

const FAQ = [
  {
    q: 'Is Taplio worth $39/month for LinkedIn only?',
    a: 'Taplio provides solid LinkedIn-specific features — AI carousels, post analytics, lead tracking. But at $39/month, you\'re paying a significant premium for a single-platform tool. If LinkedIn is your only channel, Taplio has depth. If you post to multiple platforms at all, SocialMate costs nothing and covers 7 of them.',
  },
  {
    q: 'Can SocialMate replace Taplio for LinkedIn scheduling?',
    a: 'For scheduling LinkedIn posts, yes — SocialMate uses the official LinkedIn UGC Posts API and publishes on your behalf at any scheduled time. The main Taplio feature SocialMate doesn\'t replicate is AI LinkedIn carousel generation (PDF slide posts). If you use carousels heavily, that\'s a real Taplio differentiator. For text + link posts, SocialMate handles it free.',
  },
  {
    q: 'Does SocialMate support LinkedIn personal profiles and company pages?',
    a: 'SocialMate currently supports LinkedIn personal profiles via OAuth. Company page support is on the roadmap. Taplio supports both personal and company pages on paid plans.',
  },
  {
    q: 'What AI tools does SocialMate include for LinkedIn content?',
    a: 'SocialMate\'s 15+ AI tools include LinkedIn-specific capabilities: long-form post generation, hook writing (critical for LinkedIn\'s algorithm), content repurposing (turn a tweet thread into a LinkedIn post), caption rewriting with professional tone, and hashtag research optimized for LinkedIn reach.',
  },
  {
    q: 'Does SocialMate have LinkedIn analytics?',
    a: 'SocialMate tracks engagement across all connected platforms. LinkedIn API returns limited public analytics compared to native LinkedIn analytics. For deep LinkedIn-specific metrics (profile views, post impressions, follower demographics), LinkedIn\'s native analytics dashboard remains the best source.',
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

export default function VsTaplioPage() {
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
            SocialMate vs Taplio
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Taplio charges $39/month for LinkedIn-only scheduling. SocialMate covers LinkedIn plus 6 other platforms — starting completely free.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Taplio</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Deep LinkedIn focus, high price</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ AI carousel / PDF post generator</li>
              <li>✅ LinkedIn-specific analytics</li>
              <li>✅ Lead tracking and DM automation</li>
              <li>❌ LinkedIn only — no other platforms</li>
              <li>❌ $39/month minimum — no free plan</li>
              <li>❌ No Discord, Telegram, TikTok, Bluesky</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">LinkedIn + 6 more. Free to start.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ LinkedIn + Bluesky + X + TikTok + Discord + Telegram + Mastodon</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ Bulk scheduling and RSS import free</li>
              <li>✅ Pro plan for $5/month total</li>
              <li>✅ Creator Monetization Hub built in</li>
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
              <span>Taplio</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.taplio}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators choose SocialMate over Taplio</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '$39/month for one platform is hard to justify',
                desc: 'Taplio\'s entry price is $39/month. That\'s $468/year to schedule posts on LinkedIn. SocialMate schedules LinkedIn posts free, and for $5/month you get Pro features across 7 platforms including LinkedIn. If you post anywhere besides LinkedIn, Taplio forces you to pay for a second tool.',
              },
              {
                n: '2',
                title: 'Your audience isn\'t only on LinkedIn',
                desc: 'LinkedIn is powerful for B2B and professional content. But creators, builders, and consultants also run Discord communities, Telegram channels, X/Twitter accounts, and Bluesky feeds. Taplio can\'t reach any of those. SocialMate covers all 7 platforms from one composer.',
              },
              {
                n: '3',
                title: 'Taplio\'s AI carousel feature is real — but narrow',
                desc: 'If PDF carousels are your primary LinkedIn format, Taplio\'s AI carousel generator is a genuine differentiator. SocialMate doesn\'t replicate that specific format. But for text posts, long-form posts, link sharing, and cross-platform repurposing — SocialMate\'s 15+ AI tools cover everything else free.',
              },
              {
                n: '4',
                title: 'SOMA handles your LinkedIn content strategy end-to-end',
                desc: 'SocialMate\'s SOMA AI system generates a full week of content across all connected platforms including LinkedIn. You define your voice, your topics, your posting cadence — SOMA writes and schedules everything. No other tool does this for $5/month across 7 platforms.',
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
          <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-3">The obvious choice</p>
          <h2 className="text-3xl font-extrabold mb-4">Schedule LinkedIn posts free</h2>
          <p className="text-ink-body mb-6 max-w-lg mx-auto text-sm">
            SocialMate connects to LinkedIn via official OAuth. Post now or schedule for later — free on every plan.
            When you&apos;re ready to go further, Pro is $5/month for 7 platforms.
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
