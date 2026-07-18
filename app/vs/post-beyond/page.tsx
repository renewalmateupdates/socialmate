'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',               postbeyond: '$1,000+/month (enterprise)', socialmate: '$0 — free forever'    },
  { feature: 'Free plan',                    postbeyond: '❌ No free plan',             socialmate: '✅ 50 credits/month'  },
  { feature: 'Target audience',              postbeyond: 'Large enterprises only',      socialmate: 'Creators, teams, agencies' },
  { feature: 'Discord scheduling',            postbeyond: '❌',                           socialmate: '✅ Free'               },
  { feature: 'Telegram scheduling',           postbeyond: '❌',                           socialmate: '✅ Free'               },
  { feature: 'Bluesky scheduling',            postbeyond: '❌',                           socialmate: '✅ Free'               },
  { feature: 'TikTok scheduling',             postbeyond: '❌',                           socialmate: '✅ Free (20 videos/mo)' },
  { feature: 'LinkedIn scheduling',           postbeyond: '✅ (advocacy focus)',          socialmate: '✅ Free'               },
  { feature: 'Employee advocacy',             postbeyond: '✅ (core feature)',             socialmate: '❌ Not built for this' },
  { feature: 'AI writing tools',              postbeyond: '❌',                           socialmate: '15+ tools free'         },
  { feature: 'Autonomous content system',     postbeyond: '❌',                           socialmate: '✅ SOMA'               },
  { feature: '8 autonomous AI agents',        postbeyond: '❌',                           socialmate: '✅ Pro+'               },
  { feature: 'Content calendar',             postbeyond: '✅ (enterprise)',              socialmate: '✅ Free'               },
  { feature: 'RSS / blog import',             postbeyond: '❌',                           socialmate: '✅ Free'               },
  { feature: 'Evergreen recycling',           postbeyond: '❌',                           socialmate: '✅ Free'               },
  { feature: 'Link in bio (SIGIL)',           postbeyond: '❌',                           socialmate: '✅ Built in free'      },
  { feature: 'Team collaboration',            postbeyond: '✅ (enterprise-scale)',        socialmate: 'Free (2 seats)'        },
  { feature: 'Creator Monetization Hub',      postbeyond: '❌',                           socialmate: '✅ Tip jar + fan subs' },
  { feature: 'SM-Give charity program',       postbeyond: '❌',                           socialmate: '✅ 2% of revenue donated' },
]

const FAQ = [
  {
    q: 'What is PostBeyond and who is it for?',
    a: "PostBeyond is an employee advocacy platform designed for large enterprises. The idea: your company creates curated content, employees share it to their personal social accounts, and your brand's reach amplifies through the employee network. It's used by Fortune 500 companies to activate their workforce as brand advocates. PostBeyond is not a general-purpose social media scheduler — it's a specialized enterprise tool with pricing to match (typically $1,000+/month based on employee count).",
  },
  {
    q: 'Is SocialMate comparable to PostBeyond?',
    a: "They serve different audiences. PostBeyond is built for enterprises running employee advocacy programs at scale. SocialMate is built for creators, streamers, small businesses, and agencies who need to schedule content across multiple platforms with AI assistance. If your goal is to publish, schedule, and grow your own social presence — SocialMate is the right choice. If your goal is to coordinate hundreds of employees sharing company content, PostBeyond is the specialized tool for that.",
  },
  {
    q: 'Can SocialMate handle team-based content workflows?',
    a: "Yes. SocialMate includes role-based team access (Owner, Admin, Editor, Viewer, Client), content approval workflows where editors submit posts for owner approval, and client workspaces for agencies. The approval workflow is built into the free plan. This covers the content coordination use case most teams need without paying enterprise-tier pricing.",
  },
  {
    q: 'What AI tools does SocialMate include?',
    a: "SocialMate's 15+ AI tools include caption generation, viral hook writing, content repurposing (6 formats), hashtag research, thread generation, post rewriting, post scoring, brand voice injection, SM Pulse (trend scan), SM Radar (content intelligence), and SOMA — an autonomous content agent that generates a full week of platform-native posts from your brand context.",
  },
  {
    q: 'Does SocialMate support LinkedIn like PostBeyond?',
    a: "Yes. SocialMate connects to LinkedIn personal profiles via OAuth and publishes posts using the official UGC Posts API. LinkedIn is one of 7 live platforms — alongside Discord, Telegram, Bluesky, TikTok, X/Twitter, and Mastodon. LinkedIn scheduling is free on all plans.",
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

export default function VsPostBeyondPage() {
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
            SocialMate vs PostBeyond
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            PostBeyond is enterprise employee advocacy at $1,000+/month. SocialMate is purpose-built for creators and small teams — 7 platforms, 15+ AI tools, free to start.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">PostBeyond</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Enterprise advocacy, enterprise price</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Employee advocacy at scale</li>
              <li>✅ LinkedIn sharing coordination for large teams</li>
              <li>✅ Analytics on employee content sharing</li>
              <li>❌ $1,000+/month — not for individuals or small teams</li>
              <li>❌ Not a general social media scheduler</li>
              <li>❌ No AI writing, SOMA, or autonomous agents</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Built for creators and teams. Free.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ 7 platforms: Discord, Telegram, Bluesky, TikTok, LinkedIn, X, Mastodon</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ SOMA autonomous content agent</li>
              <li>✅ Team approval workflows free</li>
              <li>✅ Pro plan for $5/month total</li>
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
              <span>PostBeyond</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.postbeyond}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators choose SocialMate over PostBeyond</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: "PostBeyond is for Fortune 500 companies — not you",
                desc: "PostBeyond's pricing model is based on employee count, typically starting at several thousand dollars per month for enterprise deployments. It's designed for companies with hundreds of employees who need to coordinate brand advocacy across their workforce. If you're a creator, freelancer, agency, or small business — PostBeyond is simply not built for you.",
              },
              {
                n: '2',
                title: 'SocialMate does actual social scheduling — PostBeyond does not',
                desc: "PostBeyond is an advocacy platform that helps companies push curated content to employees who then share it to their personal accounts. It doesn't schedule original posts to brand channels. SocialMate schedules, composes, and publishes content to 7 platforms — Discord, Telegram, Bluesky, TikTok, LinkedIn, X, and Mastodon — all from one composer.",
              },
              {
                n: '3',
                title: 'AI tools that PostBeyond will never build',
                desc: "PostBeyond's value is in advocacy coordination — not AI content creation. SocialMate's 15+ AI tools, SOMA autonomous content system, and 8 AI agents are purpose-built for the creator workflow: generate a hook, repurpose a thread, schedule a full week of content, auto-respond to mentions. This entire capability layer doesn't exist in PostBeyond.",
              },
              {
                n: '4',
                title: 'Discord and Telegram — platforms enterprises skip',
                desc: "PostBeyond focuses on LinkedIn, where most employee advocacy happens. SocialMate was built to cover the platforms where creators actually live: Discord servers, Telegram channels, Bluesky feeds, and TikTok profiles. These aren't enterprise platforms — they're creator platforms, and SocialMate treats them as first-class citizens.",
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
          <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-3">Built for creators, not enterprises</p>
          <h2 className="text-3xl font-extrabold mb-4">Schedule posts. Generate content. Free.</h2>
          <p className="text-ink-body mb-6 max-w-lg mx-auto text-sm">
            SocialMate is a full creator OS. 7 platforms, 15+ AI tools, SOMA, and 8 agents — all for $0 to start.
            Pro is $5/month.
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
