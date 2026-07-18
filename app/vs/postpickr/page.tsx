'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



export const headers = () => [{ key: 'X-Robots-Tag', value: 'index, follow' }]

const COMPARISON = [
  { feature: 'Starting price',            postpickr: '€8/month (~$9)',          socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 postpickr: '❌ Trial only',             socialmate: '✅ Free forever'         },
  { feature: 'Platforms supported',       postpickr: '8 platforms (no TikTok)',  socialmate: '7 (TikTok + LinkedIn included)' },
  { feature: 'Discord support',           postpickr: '❌',                        socialmate: '✅'                      },
  { feature: 'Telegram support',          postpickr: '❌',                        socialmate: '✅'                      },
  { feature: 'Bluesky support',           postpickr: '❌',                        socialmate: '✅'                      },
  { feature: 'Mastodon support',          postpickr: '❌',                        socialmate: '✅'                      },
  { feature: 'TikTok support',            postpickr: '❌',                        socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn support',          postpickr: '✅',                        socialmate: '✅'                      },
  { feature: 'AI writing tools',          postpickr: 'Basic AI assist',          socialmate: '12 tools included free'  },
  { feature: 'AI credits free tier',      postpickr: 'N/A (no free plan)',       socialmate: '50/month free'            },
  { feature: 'Bulk scheduling',           postpickr: '✅ (paid)',                 socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',       postpickr: '✅ (paid)',                 socialmate: '✅ Free'                  },
  { feature: 'Link in bio',               postpickr: '❌',                        socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',           postpickr: 'Basic',                    socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',       postpickr: '❌',                        socialmate: '✅ Free (3 accounts)'    },
  { feature: 'Team seats',                postpickr: '1 user on starter',        socialmate: '2 users free'            },
  { feature: 'Client workspaces',         postpickr: 'Higher tiers only',        socialmate: 'Agency: from $20/mo'     },
  { feature: 'Analytics',                 postpickr: 'Basic stats',              socialmate: '✅ Built-in free'         },
  { feature: 'SOMA (AI content system)',  postpickr: '❌',                        socialmate: '✅ Included'             },
]

const FAQ = [
  {
    q: 'Is PostPickr available outside Europe?',
    a: 'PostPickr is an Italian-made tool primarily marketed to European businesses. It works globally but the product direction and pricing (in euros) reflect a European-first focus. SocialMate is available worldwide with pricing in USD.',
  },
  {
    q: 'Does PostPickr support TikTok scheduling?',
    a: 'No. As of 2026, PostPickr does not support TikTok scheduling. SocialMate has full TikTok Production API integration — connect at /accounts and schedule videos directly from TikTok Studio.',
  },
  {
    q: 'Does SocialMate have a free plan compared to PostPickr?',
    a: 'Yes. SocialMate has a genuinely free plan with no trial expiry — includes 100 posts/month, 50 AI credits/month, bulk scheduling, link in bio, evergreen recycling, hashtag manager, and competitor tracking. PostPickr has no permanent free plan.',
  },
  {
    q: 'What platforms does SocialMate support that PostPickr does not?',
    a: 'SocialMate supports Discord, Telegram, Bluesky, Mastodon, and TikTok — none of which PostPickr covers. If your audience is on community or decentralized platforms, PostPickr cannot reach them.',
  },
  {
    q: 'How does SocialMate compare on pricing?',
    a: 'PostPickr starts at €8/month (~$9) with no free plan. SocialMate is free forever with a Pro plan at $5/month and Agency at $20/month. SocialMate Pro is actually cheaper than PostPickr\'s entry plan while offering significantly more platforms and AI tools.',
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

export default function VsPostPickrPage() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen bg-raised bg-panel">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* NAV */}
      <nav className="border-b border-edge bg-panel bg-panel sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-void rounded-lg flex items-center justify-center text-ink-high text-xs font-bold">S</div>
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
            SocialMate vs PostPickr
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            PostPickr starts at €8/month with no free plan and no TikTok, Discord, Telegram, or Bluesky support. SocialMate covers 7 platforms and starts completely free.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">PostPickr</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">European scheduler, limited platform reach</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Clean scheduling interface</li>
              <li>✅ Content recycling on paid plans</li>
              <li>❌ No free plan — €8/month minimum</li>
              <li>❌ No TikTok, Discord, Telegram, Bluesky</li>
              <li>❌ Limited AI tools</li>
              <li>❌ No link in bio or competitor tracking</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">7 platforms. 12 AI tools. $0.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Free forever — no trial countdown</li>
              <li>✅ TikTok + LinkedIn + Discord + Telegram</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ Bulk scheduling and evergreen recycling free</li>
              <li>✅ Link in bio and competitor tracking</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="bg-panel border border-edge rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-muted uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>PostPickr</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.postpickr}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators choose SocialMate over PostPickr</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'PostPickr misses where audiences actually are in 2026',
                desc: 'TikTok, Discord, Telegram, Bluesky, and Mastodon are where active communities live in 2026. PostPickr supports none of these platforms. If your audience is on TikTok or in Discord servers, you cannot reach them through PostPickr at all. SocialMate covers all seven live platforms including TikTok with Production API access.',
              },
              {
                n: '2',
                title: 'You should not pay to try a scheduling tool',
                desc: 'PostPickr has no free plan. After the trial, you either pay or lose access. SocialMate has no trial countdown — the free tier is permanent. You get 100 posts/month, 50 AI credits/month, and full scheduling features without ever entering a credit card.',
              },
              {
                n: '3',
                title: 'SocialMate Pro costs less than PostPickr\'s starter plan',
                desc: 'PostPickr\'s entry plan is €8/month (~$9 USD). SocialMate Pro is $5/month and includes 500 AI credits, 5 team seats, Smart Queue, Brand Voice, and A/B testing. For less money, SocialMate delivers significantly more value — and the free plan already covers most use cases.',
              },
              {
                n: '4',
                title: 'SOMA turns SocialMate into an autonomous content system',
                desc: 'PostPickr does not have an autonomous AI content generation system. SocialMate\'s SOMA learns your brand voice, ingests your source materials, and generates a full week of platform-native posts on a schedule — automatically. No other tool in this category offers this at $5/month.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">7 platforms, 12 AI tools, starts free — no PostPickr fees</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — TikTok, LinkedIn, Discord, Telegram, Bluesky, Mastodon, X/Twitter. No credit card required.
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
