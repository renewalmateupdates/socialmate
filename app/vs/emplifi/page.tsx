'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',               emplifi: '$200+/month (enterprise)',     socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    emplifi: '❌ No free plan',              socialmate: '✅ 50 credits/month'     },
  { feature: 'Target audience',              emplifi: 'Enterprise only',              socialmate: 'Creators, teams, agencies' },
  { feature: 'Discord scheduling',            emplifi: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           emplifi: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            emplifi: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             emplifi: '✅ (enterprise)',              socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           emplifi: '✅ (enterprise)',              socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',              emplifi: '✅ (enterprise paid)',         socialmate: '15+ tools free'           },
  { feature: 'Autonomous content system',     emplifi: '❌',                           socialmate: '✅ SOMA — learns your voice' },
  { feature: '8 autonomous AI agents',        emplifi: '❌',                           socialmate: '✅ Pro+'                  },
  { feature: 'Enterprise analytics',          emplifi: '✅ (deep BI-level)',           socialmate: '✅ Multi-platform (creator-level)' },
  { feature: 'Content calendar',             emplifi: '✅ (enterprise)',              socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              emplifi: '✅ (enterprise)',              socialmate: '✅ Free'                  },
  { feature: 'Link in bio (SIGIL)',           emplifi: '❌',                           socialmate: '✅ Built in free'         },
  { feature: 'Team collaboration',            emplifi: '✅ (enterprise-scale)',        socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      emplifi: '❌',                           socialmate: '✅ Tip jar + fan subs'   },
  { feature: 'SM-Give charity program',       emplifi: '❌',                           socialmate: '✅ 2% of revenue donated' },
]

const FAQ = [
  {
    q: 'What is Emplifi and who is it for?',
    a: "Emplifi (formerly Socialbakers, acquired by Astute) is an enterprise social media platform combining publishing, analytics, community management, and influencer marketing. It's designed for large brands and agencies with dedicated social media teams. Pricing starts around $200/month and scales up based on seats and features. It's a powerful tool — but it's not designed for individual creators, small businesses, or lean agencies.",
  },
  {
    q: 'Can SocialMate replace Emplifi?',
    a: "For enterprise-scale operations with hundreds of social accounts and large teams, Emplifi's depth is hard to replicate. But for creators, small agencies, and businesses who need reliable multi-platform scheduling, AI content tools, and team collaboration — SocialMate covers everything at a fraction of the cost. SocialMate's free plan alone does more than many paid tiers of tools in Emplifi's price range.",
  },
  {
    q: 'Does SocialMate support the same platforms as Emplifi?',
    a: "SocialMate has 7 live platforms: Discord, Telegram, Bluesky, TikTok, LinkedIn, X/Twitter, and Mastodon. Emplifi supports Facebook, Instagram, Twitter, LinkedIn, YouTube, TikTok, and more. The key difference: SocialMate supports Discord and Telegram — community platforms that Emplifi and most enterprise tools skip entirely.",
  },
  {
    q: 'What AI tools does SocialMate include?',
    a: "SocialMate's 15+ AI tools include caption generation, viral hook writing, content repurposing (6 formats), hashtag research, thread generation, post rewriting, post scoring, brand voice injection, SM Pulse (trend scan), SM Radar (content intelligence), and SOMA — an autonomous content agent that generates a full week of platform-native posts automatically.",
  },
  {
    q: 'Why choose SocialMate over an enterprise tool like Emplifi?',
    a: "Emplifi is built for social media teams at enterprise companies — it comes with enterprise complexity, enterprise onboarding, and enterprise pricing. SocialMate is self-serve: sign up, connect your accounts, start posting in minutes. Free forever. If you're a creator, solo founder, small business, or lean agency, you don't need enterprise infrastructure — you need something fast, affordable, and built for how you actually work.",
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

export default function VsEmplifPage() {
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
            SocialMate vs Emplifi
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Emplifi is $200+/month enterprise pricing — built for large social teams. SocialMate covers 7 platforms with AI built in. Starts free.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Emplifi</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Enterprise tool, enterprise price</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Deep enterprise analytics + BI integrations</li>
              <li>✅ Influencer marketing suite</li>
              <li>✅ Enterprise team workflows</li>
              <li>❌ $200+/month — no free plan, no self-serve</li>
              <li>❌ No Discord or Telegram scheduling</li>
              <li>❌ No autonomous content generation like SOMA</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Built for creators. Self-serve. Free.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Discord + Telegram + Bluesky + TikTok + LinkedIn + X + Mastodon</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ SOMA autonomous content agent</li>
              <li>✅ Pro plan for $5/month total</li>
              <li>✅ 8 autonomous AI agents</li>
              <li>✅ Ready in minutes — no demo required</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-muted uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Emplifi</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.emplifi}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators choose SocialMate over Emplifi</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Enterprise tools are not built for creators',
                desc: "Emplifi is designed for social media teams at large brands. That means enterprise onboarding, enterprise contracts, enterprise support — and enterprise pricing. If you're a creator, solo founder, small agency, or lean team, you don't need any of that. SocialMate is self-serve: sign up for free, connect your accounts, start posting today.",
              },
              {
                n: '2',
                title: 'Discord and Telegram — platforms enterprises skip',
                desc: "Emplifi focuses on Facebook, Instagram, LinkedIn, Twitter, and TikTok — the platforms Fortune 500 brands need. Discord and Telegram are creator platforms, not enterprise priorities. SocialMate treats them as first-class citizens: you can schedule posts, manage channels, and grow communities on both from day one.",
              },
              {
                n: '3',
                title: 'SOMA generates content autonomously — Emplifi cannot',
                desc: "Emplifi has publishing tools and some AI content features. SocialMate's SOMA goes further: it ingests your brand context, analyzes what you've already posted (via Project Memory), and autonomously generates a full week of platform-native content. You define the parameters once. SOMA runs perpetually. No enterprise tool does this for $5/month.",
              },
              {
                n: '4',
                title: '$200+/month vs. $5/month for equivalent creator workflows',
                desc: "Emplifi's pricing is calibrated for budgets with dedicated social media line items. SocialMate's Pro plan at $5/month covers 7 platforms, 500 AI credits, SOMA access, 8 AI agents, and 5 team seats. The creator-focused feature set at SocialMate is deeper than what Emplifi provides for creators — at 1/40th the price.",
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
          <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-3">Creator tools, not enterprise tools</p>
          <h2 className="text-3xl font-extrabold mb-4">Start scheduling in minutes. Free.</h2>
          <p className="text-ink-body mb-6 max-w-lg mx-auto text-sm">
            SocialMate is self-serve, free to start, and built for the creator workflow.
            7 platforms, 15+ AI tools, SOMA. No demo required.
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
