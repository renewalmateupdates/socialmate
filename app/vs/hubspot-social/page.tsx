'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price (social only)',  competitor: '$800+/month (Marketing Hub)', socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    competitor: '❌ Social requires paid plan', socialmate: '✅ 50 credits/month'     },
  { feature: 'TikTok scheduling',             competitor: '❌ No TikTok',               socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           competitor: '✅ (paid, part of CRM)',      socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Discord scheduling',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Mastodon scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Social-first tool',             competitor: '❌ Social is a secondary feature', socialmate: '✅ Built for social first' },
  { feature: 'AI writing tools',              competitor: '✅ (enterprise AI add-on)',   socialmate: '15+ tools free'           },
  { feature: 'Content calendar',             competitor: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'CRM integration',               competitor: '✅ Deep CRM + social',       socialmate: '🔜 Roadmap'              },
  { feature: 'Evergreen recycling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                   competitor: '❌',                          socialmate: '✅ Built in free'         },
  { feature: 'Team collaboration',            competitor: '✅ (enterprise seats)',       socialmate: 'Free (2 seats)'          },
  { feature: 'Suitable for solo creators',    competitor: '❌ Enterprise pricing',       socialmate: '✅ Built for individuals' },
  { feature: 'Creator Monetization Hub',      competitor: '❌',                          socialmate: '✅ Tip jar + fan subs'   },
]

const FAQ = [
  {
    q: 'What is HubSpot Social and how much does it actually cost?',
    a: 'HubSpot\'s social media tools are bundled inside HubSpot Marketing Hub — there\'s no social-only plan. The Starter Marketing Hub is $800+/month (billed annually). You\'re not paying for social scheduling; you\'re buying a full marketing platform where social is a secondary feature. For creators and small businesses who primarily need social scheduling, you\'re paying enterprise CRM pricing for one use case.',
  },
  {
    q: 'Does HubSpot support TikTok scheduling?',
    a: 'No. HubSpot Marketing Hub does not support TikTok scheduling. This is a significant platform gap — TikTok is the highest organic reach platform in 2026. SocialMate schedules TikTok for free (20 videos/month) using the official Production API approved in May 2026. No enterprise contract required.',
  },
  {
    q: 'When does HubSpot Social make sense vs SocialMate?',
    a: 'HubSpot Social makes sense if you\'re already paying for HubSpot CRM and want social scheduling that integrates directly with your contact database, deal pipeline, and marketing automation. If your primary need is social scheduling and AI content tools, paying $800+/month for that use case is not cost-effective. SocialMate covers the social scheduling job for $5/month.',
  },
  {
    q: 'Can SocialMate serve agency and team use cases at lower cost than HubSpot?',
    a: 'SocialMate\'s Agency plan ($20/month) includes 5 client workspaces, 15 team seats, 2,000 AI credits/month, and white label options. For agencies managing client social media, SocialMate delivers the core scheduling + AI workflow at $20/month vs HubSpot\'s enterprise-tier pricing. The tradeoff: no CRM or marketing automation. Pure social scheduling.',
  },
  {
    q: 'What social platforms does HubSpot support vs SocialMate?',
    a: 'HubSpot supports Facebook, Instagram, LinkedIn, X/Twitter, and YouTube. No TikTok, no Discord, no Telegram, no Bluesky, no Mastodon. SocialMate covers X/Twitter, LinkedIn, TikTok, Bluesky, Discord, Telegram, and Mastodon — 7 platforms. Facebook and Instagram are on SocialMate\'s roadmap pending Meta App Review.',
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

export default function VsHubSpotSocialPage() {
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
            SocialMate vs HubSpot Social
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            HubSpot social scheduling is buried inside an $800+/month marketing platform. SocialMate delivers social scheduling across 7 platforms for $5/month — or completely free.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">HubSpot Social</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Enterprise CRM with social as a feature</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Deep CRM + social integration</li>
              <li>✅ Marketing automation + workflows</li>
              <li>✅ Enterprise-grade team features</li>
              <li>❌ $800+/month — social is a bundled feature</li>
              <li>❌ No TikTok scheduling</li>
              <li>❌ No Discord, Telegram, Bluesky, Mastodon</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Social-first. 7 platforms. $5/month.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Built exclusively for social scheduling</li>
              <li>✅ TikTok free — HubSpot has none</li>
              <li>✅ X + LinkedIn + Bluesky + Discord + Telegram + Mastodon</li>
              <li>✅ 15+ AI tools free</li>
              <li>✅ Pro $5/month — 160x cheaper than HubSpot</li>
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
              <span>HubSpot Social</span>
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
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators choose SocialMate over HubSpot Social</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'You need social scheduling — not an enterprise CRM',
                desc: 'HubSpot is an enterprise sales and marketing platform. Social media scheduling is one tab inside a $800+/month product suite designed for sales teams, marketing ops, and CRM-heavy workflows. If you\'re a creator or small business that primarily needs to schedule social posts, you\'re paying for a jet when you need a bicycle.',
              },
              {
                n: '2',
                title: 'TikTok is missing from HubSpot — present in SocialMate for free',
                desc: 'HubSpot supports LinkedIn, Facebook, Instagram, X, and YouTube — but not TikTok. SocialMate includes TikTok scheduling free (20 videos/month) via the official Production API. If TikTok is in your content strategy, HubSpot forces you to handle it manually or pay for a separate tool.',
              },
              {
                n: '3',
                title: '160x cheaper at the Pro tier',
                desc: 'HubSpot Marketing Hub Starter: $800+/month. SocialMate Pro: $5/month. Same core social scheduling result. Different scope — HubSpot is a full marketing suite; SocialMate is a focused social scheduler with AI tools. If social scheduling is the job, don\'t pay enterprise pricing for it.',
              },
              {
                n: '4',
                title: 'Discord and Telegram — channels HubSpot doesn\'t touch',
                desc: 'HubSpot has no Discord or Telegram support. If you run a community on either platform alongside your marketing channels, HubSpot can\'t help. SocialMate schedules Discord and Telegram posts alongside your social media — a combination no other affordable tool offers.',
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
          <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-3">Social scheduling without the enterprise price</p>
          <h2 className="text-3xl font-extrabold mb-4">Get the scheduling. Skip the $800/month bill.</h2>
          <p className="text-ink-body mb-6 max-w-lg mx-auto text-sm">
            SocialMate schedules 7 platforms including TikTok and LinkedIn.
            Free plan available. Pro is $5/month — not $800.
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
