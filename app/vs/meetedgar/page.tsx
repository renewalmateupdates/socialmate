'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',            meetedgar: '$29.99/month (Eddie)',    socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 meetedgar: '❌ None',                  socialmate: '✅ Free forever'         },
  { feature: 'Evergreen recycling',       meetedgar: '✅ Core feature (paid)',   socialmate: '✅ Free'                  },
  { feature: 'Users on starting plan',    meetedgar: '1 user',                  socialmate: '2 users free'            },
  { feature: 'Pricing model',             meetedgar: 'Per plan tier',           socialmate: 'Flat rate'               },
  { feature: 'Bluesky support',           meetedgar: '❌',                       socialmate: '✅'                      },
  { feature: 'Discord support',           meetedgar: '❌',                       socialmate: '✅'                      },
  { feature: 'Telegram support',          meetedgar: '❌',                       socialmate: '✅'                      },
  { feature: 'Mastodon support',          meetedgar: '❌',                       socialmate: '✅'                      },
  { feature: 'Instagram support',         meetedgar: '✅',                       socialmate: '✅'                      },
  { feature: 'LinkedIn support',          meetedgar: '✅',                       socialmate: '✅'                      },
  { feature: 'TikTok support',            meetedgar: '✅',                       socialmate: '✅'                      },
  { feature: 'AI writing tools',          meetedgar: 'Basic AI captions',       socialmate: '15+ tools included'       },
  { feature: 'AI credits free tier',      meetedgar: 'N/A (no free plan)',      socialmate: '50/month free'            },
  { feature: 'Bulk scheduling',           meetedgar: 'Paid plans',              socialmate: '✅ Free'                  },
  { feature: 'Link in bio',               meetedgar: '❌',                       socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',           meetedgar: '❌',                       socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',       meetedgar: '❌',                       socialmate: '✅ Free (3 accounts)'    },
]

const FAQ = [
  {
    q: 'Does MeetEdgar have a free plan?',
    a: 'No. MeetEdgar has no free plan of any kind. Their cheapest option is the Eddie plan at $29.99/month. SocialMate is completely free to start, including evergreen recycling, with no credit card required.',
  },
  {
    q: 'Does SocialMate have evergreen recycling like MeetEdgar?',
    a: 'Yes. SocialMate includes evergreen recycling on the free plan — you can mark posts to be automatically reshared on a recurring schedule, just like MeetEdgar\'s core feature. The difference is SocialMate does not charge $29.99/month for it.',
  },
  {
    q: 'Which platforms does SocialMate support that MeetEdgar does not?',
    a: 'SocialMate supports Bluesky, Discord, Telegram, and Mastodon — none of which MeetEdgar covers. MeetEdgar focuses on Instagram, Facebook, Twitter/X, LinkedIn, Pinterest, and TikTok. If your audience is on any decentralized or community platform, MeetEdgar cannot reach them.',
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. The free tier includes 100 posts/month, evergreen recycling, 50 AI credits/month, bulk scheduling, link in bio, hashtag manager, and competitor tracking. No credit card required and no trial expiry.',
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

export default function VsMeetEdgarPage() {
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
            Updated April 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs MeetEdgar
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            MeetEdgar charges $29.99/month for evergreen recycling with no free plan. SocialMate does evergreen recycling free — plus 15 more platforms.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">MeetEdgar</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Evergreen recycling only — at a price</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Solid evergreen content recycling</li>
              <li>✅ Category-based queue management</li>
              <li>❌ No free plan — $29.99/month minimum</li>
              <li>❌ No Bluesky, Discord, Telegram, Mastodon</li>
              <li>❌ Limited AI tools</li>
              <li>❌ No hashtag manager or competitor tracking</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Evergreen recycling. 7 platforms. $0.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Evergreen recycling on free plan</li>
              <li>✅ Bluesky, Discord, Telegram, Mastodon</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ Bulk scheduling free</li>
              <li>✅ Hashtag manager and competitor tracking</li>
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
              <span>MeetEdgar</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.meetedgar}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why people switch from MeetEdgar</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Evergreen recycling should not cost $30/month',
                desc: 'MeetEdgar built its entire product around one feature: recycling evergreen content. That feature is genuinely useful. But charging $29.99/month for it — with no free tier — means you are paying a subscription just to repost old content. SocialMate includes evergreen recycling at $0.',
              },
              {
                n: '2',
                title: 'MeetEdgar misses the platforms your audience is migrating to',
                desc: 'MeetEdgar supports Instagram, Facebook, Twitter/X, LinkedIn, Pinterest, and TikTok — the mainstream six. It has no support for Bluesky, Discord, Telegram, or Mastodon. As audiences fragment across newer platforms, a tool that cannot reach them becomes a liability.',
              },
              {
                n: '3',
                title: 'No free plan means no risk-free evaluation',
                desc: 'MeetEdgar offers a trial but no permanent free tier. When the trial ends, you pay or you stop. If the tool is not the right fit, you find out after paying. SocialMate\'s free plan is permanent — try it indefinitely without a card on file.',
              },
              {
                n: '4',
                title: 'SocialMate brings 15+ AI tools MeetEdgar does not have',
                desc: 'SocialMate includes caption generation, viral hook writing, hashtag research, thread generation, content repurposing, post scoring, and more — all on the free tier. MeetEdgar offers basic AI caption help. If AI-assisted content creation matters to your workflow, SocialMate is the stronger choice.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Get evergreen recycling free — no $30/month required</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — evergreen recycling, bulk scheduling, 15+ AI tools, 7 platforms. No credit card required.
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
