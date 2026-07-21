'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',           vistasoical: '$39/month (3 profiles)',     socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                vistasoical: '❌ (15-day trial only)',      socialmate: '✅ Free forever'          },
  { feature: 'TikTok support',           vistasoical: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Discord support',          vistasoical: '❌',                         socialmate: '✅'                       },
  { feature: 'Telegram support',         vistasoical: '❌',                         socialmate: '✅'                       },
  { feature: 'Mastodon / Bluesky',       vistasoical: '❌',                         socialmate: '✅'                       },
  { feature: 'AI writing tools',         vistasoical: 'Basic',                      socialmate: '15+ tools free'            },
  { feature: 'AI credits free tier',     vistasoical: 'None',                       socialmate: '50/month free'            },
  { feature: 'Bulk scheduling',          vistasoical: '✅',                         socialmate: '✅ Free'                  },
  { feature: 'Link in bio',              vistasoical: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Team seats free tier',     vistasoical: '0',                          socialmate: '2'                        },
  { feature: 'Autonomous AI content',    vistasoical: '❌',                         socialmate: 'SOMA'                     },
  { feature: 'Minimum monthly cost',     vistasoical: '$39',                        socialmate: '$0'                       },
]

const FAQ = [
  {
    q: 'Is Vista Social worth $39/month?',
    a: "Vista Social is a capable tool for managing Instagram, TikTok, Facebook, Twitter, LinkedIn, YouTube, and Pinterest. It has solid review management and a unified inbox. At $39/month for 3 profiles, it is priced for agencies and small businesses with established budgets. For creators and solo founders just starting out, $39/month before you've validated your content strategy is a significant ask. SocialMate starts free and covers most of the same scheduling workflows at a fraction of the cost.",
  },
  {
    q: 'Does Vista Social have a free plan?',
    a: "No. Vista Social offers a 15-day free trial, but there is no permanent free plan. After the trial, you must subscribe at $39/month or higher. SocialMate offers a free plan with no time limit — all core scheduling features, TikTok included, 50 AI credits per month, 2 team seats, and link in bio. No credit card required.",
  },
  {
    q: 'Is SocialMate a good Vista Social alternative?',
    a: "Yes for creators and small teams. SocialMate covers TikTok scheduling free (Production API approved), plus Discord, Telegram, Mastodon, and Bluesky — platforms Vista Social does not support. SocialMate includes 15+ AI tools on the free tier vs Vista Social's basic AI behind a paywall. The gap: Vista Social has stronger review management and YouTube/Pinterest support. If review monitoring is your primary need, Vista Social is worth evaluating. If you want cross-platform scheduling with open-web coverage and a $0 starting point, SocialMate wins.",
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

export default function VsVistaSocialPage() {
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
            SocialMate vs Vista Social
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Vista Social starts at $39/month with no free plan — just a 15-day trial. SocialMate is free forever, includes TikTok, and covers Discord, Telegram, Mastodon, and Bluesky that Vista Social doesn&apos;t support.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Vista Social</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Solid tool, steep price, no free plan</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Strong review management</li>
              <li>✅ TikTok, Instagram, Facebook, Twitter, LinkedIn, YouTube, Pinterest</li>
              <li>❌ Starts at $39/month — no free plan</li>
              <li>❌ No Discord, Telegram, Mastodon, or Bluesky</li>
              <li>❌ AI tools behind paywall</li>
              <li>❌ 0 team seats on entry plan</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Free forever. TikTok included. 15+ AI tools.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Free plan — no trial expiry</li>
              <li>✅ TikTok scheduling free (Production API approved)</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ 2 team seats free</li>
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
              <span>Vista Social</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.vistasoical}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why teams switch from Vista Social</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '$39/month is a high floor for a scheduling tool',
                desc: "Vista Social's entry plan is $39/month for 3 profiles. That is more than 7× the cost of SocialMate Pro ($5/month), which connects up to 3 accounts on each of its 7 platforms. For creators, small businesses, and solo founders watching every dollar, $39/month before you've validated your content ROI is difficult to justify.",
              },
              {
                n: '2',
                title: "A 15-day trial is not a free plan",
                desc: 'Vista Social advertises a free trial — but it expires. SocialMate has a permanent free tier with no posting caps, no credit card required, and no expiry date. You can stay on the free plan indefinitely and upgrade only when the value is obvious.',
              },
              {
                n: '3',
                title: 'Discord and Telegram are real platforms now',
                desc: 'Vista Social covers the mainstream social networks but skips Discord, Telegram, Mastodon, and Bluesky entirely. For any community builder, streamer, or creator with an audience on these platforms, Vista Social is a dead end. SocialMate covers all six live platforms from the same dashboard.',
              },
              {
                n: '4',
                title: 'AI tools should not require a premium plan',
                desc: "Vista Social has basic AI capabilities, but they are not the focus of the product. SocialMate includes 15+ AI tools — caption generation, TikTok script generator, viral hook writer, content repurposer, hashtag research, and more — all on the free tier. You shouldn't have to pay $39/month to write better captions.",
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Why pay $39 when $0 gets you started?</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — TikTok included, 15+ AI tools, 7 platforms, 2 team seats. No trial. No expiry. No credit card.
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
