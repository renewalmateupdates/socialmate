'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',               storychief: '$99/month',                 socialmate: '$0 — free forever'       },
  { feature: 'Platforms supported',           storychief: '8 platforms (no Discord/Telegram)', socialmate: '7 platforms (Discord + Telegram included)' },
  { feature: 'Free plan',                    storychief: '❌ No free plan',            socialmate: '✅ 50 credits/month'     },
  { feature: 'Discord scheduling',            storychief: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           storychief: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            storychief: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             storychief: '❌',                         socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           storychief: '✅',                         socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',              storychief: '✅ (paid add-on)',           socialmate: '15+ tools free'           },
  { feature: 'Autonomous content system',     storychief: '❌',                         socialmate: '✅ SOMA — learns your voice' },
  { feature: '8 autonomous AI agents',        storychief: '❌',                         socialmate: '✅ Pro+'                  },
  { feature: 'Content calendar',             storychief: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              storychief: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             storychief: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',           storychief: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Link in bio (SIGIL)',           storychief: '❌',                         socialmate: '✅ Built in free'         },
  { feature: 'Team collaboration',            storychief: '✅ (paid, $99+)',            socialmate: 'Free (2 seats)'          },
  { feature: 'Client workspaces',             storychief: '✅ ($99+)',                  socialmate: '✅ Agency $20/month'     },
  { feature: 'Creator Monetization Hub',      storychief: '❌',                         socialmate: '✅ Tip jar + fan subs'   },
  { feature: 'SM-Give charity program',       storychief: '❌',                         socialmate: '✅ 2% of revenue donated' },
]

const FAQ = [
  {
    q: 'Is StoryChief worth $99/month for content marketing?',
    a: "StoryChief combines content creation, multi-channel distribution, and SEO analysis in one platform. If you're running a full editorial team producing blog content + social simultaneously, StoryChief's workflow makes sense. But at $99/month minimum with no free plan, it's priced for marketing departments — not solo creators or small teams. SocialMate gives you the scheduling layer for free and adds Discord, Telegram, and Bluesky that StoryChief doesn't touch.",
  },
  {
    q: 'Can SocialMate replace StoryChief for social media scheduling?',
    a: "For the social scheduling piece, yes. SocialMate handles multi-platform publishing, content calendars, bulk scheduling, AI writing tools, and analytics for free. StoryChief's differentiator is its blog publishing + SEO content hub — if you're writing blog posts that also syndicate to social, StoryChief bundles that workflow. If you primarily schedule social posts (not full blog publishing), SocialMate covers everything StoryChief does and adds 3 more platforms.",
  },
  {
    q: 'Does StoryChief support Discord and Telegram?',
    a: "No. StoryChief focuses on mainstream platforms like Facebook, Instagram, LinkedIn, Twitter, and Pinterest. Discord and Telegram are community platforms that most traditional social schedulers skip entirely. SocialMate was built with Discord and Telegram as first-class platforms — you can schedule posts, manage channels, and track engagement on both.",
  },
  {
    q: 'What AI tools does SocialMate include?',
    a: "SocialMate's 15+ AI tools include caption generation, viral hook writing, content repurposing (6 formats), hashtag research, thread generation, post rewriting, post scoring, brand voice injection, SM Pulse (trend scan), SM Radar (content intelligence), and SOMA — an autonomous content system that learns your voice and generates a full week of platform-native posts automatically.",
  },
  {
    q: 'What is SOMA and how does it compare to StoryChief AI?',
    a: "SOMA is SocialMate's autonomous content agent. You ingest your brand context (about your brand, your audience, your goals), set a posting schedule per platform, and SOMA generates a full week of posts automatically — tailored to each platform's format and character limits. StoryChief has AI writing assistance built into their editor, but it doesn't autonomously plan and schedule a week of content from a single brief. SOMA does.",
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

export default function VsStoryChiefPage() {
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
            SocialMate vs StoryChief
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            StoryChief charges $99/month for content marketing. SocialMate covers 7 platforms including Discord and Telegram — starting completely free.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">StoryChief</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Full content hub, high price</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Blog publishing + social syndication in one</li>
              <li>✅ SEO content analysis built in</li>
              <li>✅ Editorial workflow for teams</li>
              <li>❌ $99/month minimum — no free plan</li>
              <li>❌ No Discord, Telegram, or Bluesky</li>
              <li>❌ No autonomous AI content agent</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">7 platforms. AI built in. Free to start.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Discord + Telegram + Bluesky + TikTok + LinkedIn + X + Mastodon</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ SOMA autonomous content agent learns your voice</li>
              <li>✅ Pro plan for $5/month total</li>
              <li>✅ 8 autonomous AI agents</li>
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
              <span>StoryChief</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.storychief}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators choose SocialMate over StoryChief</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '$99/month is too much for social scheduling alone',
                desc: "StoryChief bundles blog publishing, SEO analysis, and social scheduling into one platform. That bundle is powerful if you need all three. But most creators just need reliable social scheduling with AI tools — and paying $99/month for that is hard to justify when SocialMate does it free.",
              },
              {
                n: '2',
                title: 'Discord and Telegram are SocialMate-exclusive',
                desc: "StoryChief supports Facebook, Instagram, LinkedIn, Twitter, and Pinterest. No Discord. No Telegram. If you run a community on either platform — and millions of creators do — you need a separate tool. SocialMate built Discord and Telegram scheduling first, not as an afterthought.",
              },
              {
                n: '3',
                title: 'SOMA does what StoryChief AI cannot',
                desc: "StoryChief has AI writing inside its editor. SocialMate's SOMA is something different: you ingest your brand context once, set your platforms and schedule, and SOMA autonomously generates and publishes a full week of content across all your platforms. StoryChief doesn't have anything like autonomous multi-platform content generation.",
              },
              {
                n: '4',
                title: '8 AI agents run your social strategy on autopilot',
                desc: "SocialMate's Agents Hub includes a Newsletter Agent, Caption Agent, Trend Scout, Repurpose Agent, Growth Scout, Inbox Agent, Client Report Agent, and Email Outreach Agent. These run on their own schedules, generating drafts and executing tasks without manual input. No equivalent exists in StoryChief.",
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
          <h2 className="text-3xl font-extrabold mb-4">Schedule to 7 platforms free</h2>
          <p className="text-ink-body mb-6 max-w-lg mx-auto text-sm">
            SocialMate connects to Discord, Telegram, Bluesky, TikTok, LinkedIn, X, and Mastodon.
            Start for free. When you&apos;re ready for AI agents and SOMA, Pro is $5/month.
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
