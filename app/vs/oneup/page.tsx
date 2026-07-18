'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',               oneup: '$18/month',                    socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    oneup: '❌ 7-day trial only',           socialmate: '✅ 50 credits/month'     },
  { feature: 'Platforms supported',           oneup: '7 platforms (no Discord/Telegram)', socialmate: '7 platforms (Discord + Telegram included)' },
  { feature: 'Discord scheduling',            oneup: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           oneup: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            oneup: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             oneup: '✅ (paid)',                     socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           oneup: '✅',                            socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',              oneup: '❌ No AI tools',               socialmate: '15+ tools free'           },
  { feature: 'Autonomous content system',     oneup: '❌',                            socialmate: '✅ SOMA — learns your voice' },
  { feature: '8 autonomous AI agents',        oneup: '❌',                            socialmate: '✅ Pro+'                  },
  { feature: 'Recurring posts',               oneup: '✅ (strength)',                 socialmate: '✅ Free'                  },
  { feature: 'Content calendar',             oneup: '✅',                            socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              oneup: '✅ (paid)',                     socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             oneup: '✅',                            socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',           oneup: '✅ (strength)',                 socialmate: '✅ Free'                  },
  { feature: 'Link in bio (SIGIL)',           oneup: '❌',                            socialmate: '✅ Built in free'         },
  { feature: 'Team collaboration',            oneup: '✅ ($36+)',                     socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      oneup: '❌',                            socialmate: '✅ Tip jar + fan subs'   },
  { feature: 'SM-Give charity program',       oneup: '❌',                            socialmate: '✅ 2% of revenue donated' },
]

const FAQ = [
  {
    q: 'Is OneUp a good social media scheduler?',
    a: "OneUp is a solid, straightforward scheduler with strong recurring post and evergreen recycling features. It's affordable compared to Hootsuite or Sprout Social. The main gaps are no AI tools, no Discord/Telegram support, and no free plan — just a 7-day trial. If you need a simple scheduler without AI and don't use community platforms, OneUp works. If you want AI tools, autonomous content generation, or Discord/Telegram scheduling, SocialMate is the better fit.",
  },
  {
    q: 'Does SocialMate support evergreen recycling like OneUp?',
    a: "Yes. SocialMate includes evergreen recycling on the free plan — mark any post as evergreen and SocialMate will automatically requeue it when your schedule is empty. OneUp's evergreen recycling is one of its strongest features, and SocialMate matches it for free.",
  },
  {
    q: 'What AI tools does SocialMate include that OneUp lacks?',
    a: "OneUp has no AI tools. SocialMate's 15+ AI tools include caption generation, viral hook writing, content repurposing (6 formats), hashtag research, thread generation, post rewriting, post scoring, brand voice injection, SM Pulse (trend scan), and SM Radar (content intelligence). Plus SOMA — an autonomous content agent that generates a full week of posts from your brand context.",
  },
  {
    q: 'Why does SocialMate include Discord and Telegram but OneUp does not?',
    a: "Most social schedulers were built before Discord and Telegram became major creator platforms. SocialMate was built in 2026 with community platforms as a core requirement. Discord has 200M+ active users and is the primary community platform for streamers, developers, and NFT communities. Telegram has 950M+ users and growing. These aren't niche platforms anymore — and SocialMate is one of the few tools that schedules to both.",
  },
  {
    q: 'Is $18/month for OneUp worth it compared to SocialMate free?',
    a: "OneUp's $18/month plan gives you unlimited posts, recurring schedules, and CSV bulk upload. SocialMate's free plan gives you the same core scheduling features plus 15+ AI tools, Discord/Telegram/Bluesky support, and a full link-in-bio page (SIGIL). For $5/month, SocialMate Pro adds 500 AI credits/month, 5 seats, SOMA access, and 8 autonomous agents. The value comparison strongly favors SocialMate at every price point.",
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

export default function VsOneUpPage() {
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
            SocialMate vs OneUp
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            OneUp is $18/month with no AI tools and no Discord or Telegram support. SocialMate is free — with 15+ AI tools and all 7 platforms.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">OneUp</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Simple scheduler, no AI</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Strong recurring + evergreen recycling</li>
              <li>✅ Clean, simple UI</li>
              <li>✅ CSV bulk import</li>
              <li>❌ No free plan — 7-day trial only</li>
              <li>❌ Zero AI tools</li>
              <li>❌ No Discord, Telegram, or Bluesky</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">7 platforms. 15+ AI tools. Free.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Discord + Telegram + Bluesky + TikTok + LinkedIn + X + Mastodon</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ SOMA autonomous content agent</li>
              <li>✅ Pro plan for $5/month total</li>
              <li>✅ Evergreen recycling + recurring posts free</li>
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
              <span>OneUp</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.oneup}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators choose SocialMate over OneUp</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'OneUp has zero AI tools — SocialMate has 12',
                desc: "OneUp is a clean scheduling tool. That is its entire value proposition. SocialMate does the same scheduling but adds caption AI, hook writing, content repurposing, hashtag research, post scoring, SOMA autonomous generation, and 8 AI agents that run on autopilot. If you ever want AI assistance in your content workflow, OneUp will never give it to you.",
              },
              {
                n: '2',
                title: 'No free plan vs. genuinely free forever',
                desc: "OneUp gives you a 7-day trial. After that, you pay $18/month minimum. SocialMate is free forever with no post caps and no time limits. The free plan includes Discord, Telegram, Bluesky, Mastodon, TikTok, and LinkedIn scheduling — plus 15+ AI tools and a full link-in-bio page. That's more than OneUp's paid plan for $0.",
              },
              {
                n: '3',
                title: 'Discord and Telegram scheduling are unique to SocialMate',
                desc: "If any part of your audience lives in a Discord server or Telegram channel, OneUp can't help you. SocialMate schedules posts natively to both platforms. You can queue community updates, announcements, and content drops to Discord and Telegram alongside all your other channels — from one composer.",
              },
              {
                n: '4',
                title: 'SOMA generates a full week of content autonomously',
                desc: "OneUp schedules what you give it. SocialMate's SOMA creates what to post. Ingest your brand context once — your story, your audience, your platforms — and SOMA generates a full week of platform-native posts tailored to each channel's format. Then it schedules them automatically. OneUp has no equivalent capability.",
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
          <h2 className="text-3xl font-extrabold mb-4">More platforms. More AI. Free.</h2>
          <p className="text-ink-body mb-6 max-w-lg mx-auto text-sm">
            SocialMate has everything OneUp offers — plus 15+ AI tools, Discord, Telegram, Bluesky, and SOMA.
            Start free. Pro is $5/month.
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
