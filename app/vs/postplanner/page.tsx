'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',            postplanner: '$9/month (Starter)',       socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 postplanner: '✅ (10 posts/month cap)',   socialmate: '✅ 100 posts/month free' },
  { feature: 'Free plan post limit',      postplanner: '10 posts/month',           socialmate: 'No limit'                },
  { feature: 'Social accounts (free)',    postplanner: '3 accounts',               socialmate: 'No hard cap (free tier)' },
  { feature: 'Bulk scheduling',           postplanner: 'Paid plans',               socialmate: '✅ Free'                 },
  { feature: 'Discord support',           postplanner: '❌',                       socialmate: '✅'                      },
  { feature: 'Telegram support',          postplanner: '❌',                       socialmate: '✅'                      },
  { feature: 'Mastodon support',          postplanner: '❌',                       socialmate: '✅'                      },
  { feature: 'Bluesky support',           postplanner: '❌',                       socialmate: '✅'                      },
  { feature: 'AI writing tools',          postplanner: 'Basic caption help',       socialmate: '15+ tools included'       },
  { feature: 'AI credits free tier',      postplanner: 'Very limited',             socialmate: '50/month free'           },
  { feature: 'Link in bio',               postplanner: '❌',                       socialmate: '✅ Free'                 },
  { feature: 'Hashtag manager',           postplanner: 'Paid plans',               socialmate: '✅ Free'                 },
  { feature: 'Evergreen recycling',       postplanner: '✅ Paid plans',            socialmate: '✅ Free'                 },
  { feature: 'Competitor tracking',       postplanner: '❌',                       socialmate: '✅ Free (3 accounts)'   },
  { feature: 'RSS import',                postplanner: 'Paid plans',               socialmate: '✅ Free'                 },
  { feature: 'Content discovery',         postplanner: '✅ Core feature',          socialmate: '✅ RSS import'           },
  { feature: 'Analytics',                 postplanner: 'Paid plans',               socialmate: '✅ Free'                 },
]

const FAQ = [
  {
    q: "Is Post Planner's free plan actually usable?",
    a: "Post Planner does have a free plan, but it caps at 10 posts per month across 3 social accounts. That is about 2-3 posts per week — not enough to maintain a consistent social presence. SocialMate's free plan has no post limit.",
  },
  {
    q: "What is Post Planner's main selling point?",
    a: 'Post Planner focuses on content discovery — surfacing viral and trending content from the web for you to reshare. If you want a tool that helps you find content to curate, Post Planner has that built in. SocialMate focuses on scheduling and creating original content with AI tools.',
  },
  {
    q: 'Which platforms does SocialMate support that Post Planner does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which Post Planner covers. If your audience is on community or decentralized platforms, Post Planner cannot help.',
  },
  {
    q: 'Is SocialMate a good Post Planner alternative for creators who post frequently?',
    a: 'Yes. SocialMate has no post limit on the free plan, plus bulk scheduling, 15+ AI tools, evergreen recycling, competitor tracking, and analytics — all free. Post Planner charges $9/month and caps free usage at 10 posts.',
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

export default function VsPostPlannerPage() {
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
            SocialMate vs Post Planner
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Post Planner has a free plan — but 10 posts per month is barely a schedule. SocialMate is free forever with 100 posts a month and no card.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Post Planner</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Free plan exists — but nearly useless</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Content discovery and curation</li>
              <li>✅ Evergreen recycling on paid plans</li>
              <li>❌ Free plan: 10 posts/month cap</li>
              <li>❌ $9/month to get anything useful</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Analytics locked to paid plans</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Unlimited posts. All platforms. $0.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Free forever — no post cap</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Bulk scheduling free</li>
              <li>✅ Analytics free</li>
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
              <span>Post Planner</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.postplanner}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why people switch from Post Planner</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '10 posts per month is not a social media strategy',
                desc: "Post Planner's free plan caps at 10 posts per month. If you post once every 3 days — a modest pace — you hit the limit in a month. Any real posting schedule requires a paid plan. SocialMate has no post limit on the free tier.",
              },
              {
                n: '2',
                title: 'Analytics require a paid plan',
                desc: 'Post Planner locks analytics behind paid plans. You cannot see how your posts perform on the free tier. SocialMate includes analytics on the free plan — because knowing what works is part of posting, not an upgrade.',
              },
              {
                n: '3',
                title: 'Content discovery is only valuable if you can actually post what you find',
                desc: "Post Planner's content curation feature is genuinely useful — but limited posting caps mean you hit your limit quickly. SocialMate gives you RSS import for automated content sharing alongside unlimited original posts.",
              },
              {
                n: '4',
                title: 'SocialMate covers platforms Post Planner does not',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not supported by Post Planner. SocialMate covers all four, plus Instagram, LinkedIn, Facebook, Pinterest, Reddit, and more — all on the free plan.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">No 10-post cap — start free today</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — 100 posts/month, bulk scheduling, 15+ AI tools, 7 platforms. No credit card required.
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
