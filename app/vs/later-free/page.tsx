'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Free plan price',              competitor: '$0 (severely limited)',       socialmate: '$0 — genuinely useful'   },
  { feature: 'Platforms on free plan',        competitor: '1 social set only',           socialmate: 'All 7 platforms'         },
  { feature: 'Posts per month (free)',        competitor: '5 posts/month',               socialmate: '50 credits/month'        },
  { feature: 'TikTok scheduling (free)',       competitor: '❌ Not on free plan',         socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling (free)',     competitor: '❌ Not on free plan',         socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            competitor: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Discord scheduling',            competitor: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           competitor: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Mastodon scheduling',           competitor: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'AI writing tools (free)',        competitor: '❌ No AI on free plan',       socialmate: '✅ 15+ AI tools free'     },
  { feature: 'Content calendar (free)',        competitor: '❌ Locked behind paid',       socialmate: '✅ Free'                  },
  { feature: 'Analytics (free)',              competitor: '❌ Paid only',                socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             competitor: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',           competitor: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                   competitor: '✅ Later\'s strong suit',      socialmate: '✅ Built in free'         },
  { feature: 'Pro plan price',               competitor: '$18/month',                   socialmate: '$5/month'                },
  { feature: 'Team collaboration',            competitor: '$40+/month',                  socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      competitor: '❌',                           socialmate: '✅ Tip jar + fan subs'   },
]

const FAQ = [
  {
    q: 'What does Later\'s free plan actually include?',
    a: "Later's free plan allows 1 social set (one account per platform) and 5 scheduled posts per month. No AI tools, no calendar view, no analytics, no link in bio (on free). At 5 posts/month, you can post roughly once a week. That's enough to test the interface, not enough to build a consistent social media presence. It functions more as a free trial than a true free tier.",
  },
  {
    q: 'How is SocialMate\'s free plan different from Later\'s free plan?',
    a: "SocialMate's free plan gives you 50 credits/month across all 7 platforms — that's 50 posts, not 5. Plus 12 AI writing tools, a content calendar, basic analytics, and link in bio. No social set restriction — connect multiple accounts per platform. You can build a real publishing habit on SocialMate's free plan. Later's free plan is a preview; SocialMate's is a working product.",
  },
  {
    q: 'Does Later support TikTok on the free plan?',
    a: "No. Later's TikTok scheduling requires a paid plan. SocialMate includes TikTok scheduling on the free plan (20 videos/month) via the official Production API approved in May 2026. TikTok scheduling is a standard feature in SocialMate, not a premium upsell.",
  },
  {
    q: 'Where does Later outperform SocialMate?',
    a: "Later is known for its visual Instagram planning grid — drag-and-drop visual content calendar optimized for Instagram. If Instagram grid aesthetics are central to your workflow, Later's visual planner is a genuine differentiator. SocialMate doesn't replicate that specific Instagram-first visual planner. For cross-platform scheduling, AI content generation, and platforms Later ignores (TikTok free, Discord, Telegram, Bluesky), SocialMate leads.",
  },
  {
    q: 'How does SocialMate\'s $5/month Pro compare to Later\'s $18/month plan?',
    a: "SocialMate Pro ($5/month) gives you 500 AI credits/month, 5 seats, and full access across all 7 platforms. Later's entry paid plan ($18/month) upgrades your posting limit and unlocks analytics. SocialMate is 72% cheaper at the Pro tier while offering more platform coverage (TikTok, Discord, Telegram, Bluesky, Mastodon) and a more capable AI system.",
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

export default function VsLaterFreePage() {
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
            SocialMate vs Later Free Plan
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Later&apos;s free plan limits you to 1 social set and 5 posts per month. SocialMate&apos;s free plan covers all 7 platforms with 50 AI credits and no social set cap.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Later Free Plan</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">5 posts/month — more preview than product</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Visual Instagram grid planner</li>
              <li>✅ Good UX and design</li>
              <li>⚠️ 1 social set only</li>
              <li>❌ 5 posts/month — not enough for consistency</li>
              <li>❌ No AI tools on free plan</li>
              <li>❌ No TikTok, Discord, Telegram, Bluesky on free</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate Free Plan</p>
            <p className="font-extrabold text-lg mb-2">50 credits. 7 platforms. 15+ AI tools. All free.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ 50 credits/month — 10x more than Later</li>
              <li>✅ All 7 platforms on free (TikTok + LinkedIn included)</li>
              <li>✅ 15+ AI tools free — Later has none on free</li>
              <li>✅ Calendar, analytics, link in bio all free</li>
              <li>✅ No social set restriction</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Free plan comparison</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-muted uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Later Free</span>
              <span>SocialMate Free</span>
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
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators choose SocialMate over Later&apos;s free plan</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '5 posts/month isn\'t a free plan — it\'s a preview',
                desc: 'Posting once a week is not a content strategy. 5 posts/month on Later\'s free plan barely covers Monday through Friday. SocialMate\'s free tier gives 50 credits/month across all 7 platforms — enough to post daily on multiple platforms, test what works, and build a real presence before spending anything.',
              },
              {
                n: '2',
                title: 'TikTok scheduling free — Later locks it behind paid',
                desc: 'TikTok scheduling requires a paid Later plan. SocialMate includes TikTok on the free plan — 20 videos/month using the official Production API. If TikTok is where you want to grow, Later\'s free plan is a dead end. SocialMate starts you on TikTok for free.',
              },
              {
                n: '3',
                title: 'AI writing tools free vs nothing',
                desc: 'Later\'s free plan has zero AI tools. SocialMate\'s free plan includes all 15+ AI tools: hook writing, caption generation, hashtag suggestions, content repurposing, thread building, and more. Every free user gets AI assistance from day one.',
              },
              {
                n: '4',
                title: 'Discord and Telegram — channels Later doesn\'t cover at any price',
                desc: 'Later supports Instagram, TikTok, LinkedIn, Facebook, Pinterest, and Twitter. No Discord, no Telegram, no Bluesky. If you run a Discord community or Telegram channel, Later can\'t schedule into it at any tier. SocialMate covers both on the free plan.',
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
          <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-3">A free plan that actually works</p>
          <h2 className="text-3xl font-extrabold mb-4">50 credits. 7 platforms. 15+ AI tools. Free.</h2>
          <p className="text-ink-body mb-6 max-w-lg mx-auto text-sm">
            SocialMate&apos;s free plan includes TikTok, LinkedIn, Bluesky, Discord, Telegram, Mastodon, and X.
            When you&apos;re ready to scale, Pro is $5/month — not $18.
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
