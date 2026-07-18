'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',               shield: '$8/month',                  socialmate: '$0 — free forever'       },
  { feature: 'Post scheduling',              shield: '❌ Analytics only',          socialmate: '✅ All 7 platforms'      },
  { feature: 'LinkedIn analytics',           shield: '✅ Deep LinkedIn metrics',   socialmate: '✅ Cross-platform'       },
  { feature: 'LinkedIn scheduling',          shield: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',           shield: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'X / Twitter scheduling',       shield: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',            shield: '❌',                         socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'Discord + Telegram',           shield: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',             shield: '❌',                         socialmate: '15+ tools free'           },
  { feature: 'Content calendar',            shield: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',             shield: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'RSS import',                   shield: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',          shield: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                  shield: '❌',                         socialmate: '✅ Built in free'         },
  { feature: 'Competitor tracking',          shield: '✅ LinkedIn profiles',       socialmate: '✅ Free (3 accounts)'    },
  { feature: 'Engagement analytics',         shield: '✅ LinkedIn-focused',        socialmate: '✅ Multi-platform'       },
  { feature: 'Content DNA insights',         shield: '✅ (best post patterns)',    socialmate: '✅ /analytics/dna'       },
  { feature: 'Team collaboration',           shield: '$24+/month',                socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',     shield: '❌',                         socialmate: '✅ Tip jar + fan subs'   },
]

const FAQ = [
  {
    q: 'What is Shield App and who is it for?',
    a: 'Shield App is a LinkedIn analytics tool that tracks post performance, profile views, follower growth, and content patterns on LinkedIn. It\'s designed for LinkedIn power users who want deeper analytics than LinkedIn\'s native dashboard. It does not schedule posts — for scheduling, Shield users need a separate tool.',
  },
  {
    q: 'Does SocialMate replace Shield App?',
    a: 'For scheduling and basic analytics, yes. SocialMate\'s Content DNA dashboard shows best-performing post patterns, optimal posting times, engagement by platform, and cross-platform breakdown. Shield App offers deeper LinkedIn-specific data like post impressions, SSI score tracking, and audience demographics. If deep LinkedIn analytics are your priority, Shield\'s metrics are more granular. For everything else, SocialMate covers it at $0.',
  },
  {
    q: 'Why would I pay for Shield if it can\'t schedule posts?',
    a: 'Shield fills a specific analytics gap: LinkedIn\'s native analytics only retains 60 days of data. Shield stores your full history. If you\'re a LinkedIn-first creator who needs historical post performance, Shield adds value alongside your scheduler. But at $8+/month on top of a scheduling tool, the combined cost exceeds SocialMate Pro ($5/month) which does both.',
  },
  {
    q: 'What LinkedIn analytics does SocialMate show?',
    a: 'SocialMate tracks published posts, engagement, scheduling patterns, and cross-platform performance. The /analytics/dna page shows best-performing content patterns, top 5 posts, best times, and format breakdowns. For LinkedIn specifically, SocialMate reads post-level engagement returned by the LinkedIn API after publishing.',
  },
  {
    q: 'Can I use SocialMate and Shield App together?',
    a: 'Yes — they don\'t conflict. Use SocialMate to schedule and publish across all 7 platforms, and Shield App to analyze deep LinkedIn-specific metrics if you need the granular data. But most creators will find SocialMate\'s built-in analytics sufficient, especially since it covers all platforms in one dashboard.',
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

export default function VsShieldAppPage() {
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
            SocialMate vs Shield App
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Shield App tracks LinkedIn analytics — but it can&apos;t schedule posts. SocialMate does both, plus six more platforms, starting free.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Shield App</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">LinkedIn analytics — no scheduling</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Deep LinkedIn post analytics</li>
              <li>✅ Historical data beyond LinkedIn&apos;s 60-day limit</li>
              <li>✅ Content patterns + best-time insights</li>
              <li>❌ Cannot schedule or publish posts</li>
              <li>❌ LinkedIn only — no other platforms</li>
              <li>❌ Requires a separate scheduling tool</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Scheduling + analytics. 7 platforms. Free.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Schedules LinkedIn posts via official API</li>
              <li>✅ Content DNA analytics dashboard</li>
              <li>✅ Bluesky, X, TikTok, Discord, Telegram, Mastodon</li>
              <li>✅ 12 AI writing tools free</li>
              <li>✅ No separate analytics tool needed</li>
              <li>✅ Pro plan $5/month for everything</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-muted uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Shield App</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.shield}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators choose SocialMate over Shield App</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Shield can\'t schedule a single post',
                desc: 'Shield App is a read-only analytics tool. It shows you what\'s working — but you still need another tool to actually publish content. That means a second login, a second monthly fee, and two separate workflows. SocialMate handles scheduling and analytics in one place.',
              },
              {
                n: '2',
                title: 'You\'re paying $8+/month on top of your scheduler',
                desc: 'Most Shield users also pay for Buffer, Publer, or another scheduling tool. Combined, that\'s $20–$50+/month for what SocialMate does for $5. If you\'re not at a scale where granular LinkedIn SSI tracking changes your strategy, SocialMate\'s Content DNA dashboard is the better economics.',
              },
              {
                n: '3',
                title: 'Content DNA gives you the same strategic insights',
                desc: 'SocialMate\'s /analytics/dna page shows your best-performing post formats, optimal posting times by platform, top 5 posts by engagement, and content pattern breakdowns. It\'s built for creators who want actionable insights, not raw data dumps.',
              },
              {
                n: '4',
                title: 'Your content doesn\'t live only on LinkedIn',
                desc: 'The best creators repurpose content — a LinkedIn post becomes a tweet, a Bluesky thread, a Discord update. Shield App only sees LinkedIn. SocialMate sees the full picture across all 7 platforms and shows you what\'s landing everywhere.',
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
          <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-3">Schedule + analyze — together</p>
          <h2 className="text-3xl font-extrabold mb-4">One tool for LinkedIn scheduling and analytics</h2>
          <p className="text-ink-body mb-6 max-w-lg mx-auto text-sm">
            Stop paying for a scheduler and an analytics tool separately.
            SocialMate connects to LinkedIn via official OAuth, schedules posts, and tracks performance — all free to start.
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
