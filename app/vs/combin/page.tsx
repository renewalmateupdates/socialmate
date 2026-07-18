'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',               combin: '$15/month',                    socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    combin: '❌ No free plan',               socialmate: '✅ 50 credits/month'     },
  { feature: 'Platforms supported',           combin: 'Instagram only',               socialmate: '7 platforms'             },
  { feature: 'Post scheduling',              combin: '✅ (Instagram only)',           socialmate: '✅ 7 platforms free'      },
  { feature: 'Discord scheduling',            combin: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           combin: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            combin: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             combin: '❌',                            socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           combin: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Instagram growth automation',   combin: '✅ (core feature)',             socialmate: '❌ Not built for this'   },
  { feature: 'AI writing tools',              combin: '❌',                            socialmate: '15+ tools free'           },
  { feature: 'Autonomous content system',     combin: '❌',                            socialmate: '✅ SOMA — learns your voice' },
  { feature: '8 autonomous AI agents',        combin: '❌',                            socialmate: '✅ Pro+'                  },
  { feature: 'Content calendar',             combin: '✅ (Instagram only)',           socialmate: '✅ Free — all platforms'  },
  { feature: 'Bulk scheduling',              combin: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             combin: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Link in bio (SIGIL)',           combin: '❌',                            socialmate: '✅ Built in free'         },
  { feature: 'Team collaboration',            combin: '❌',                            socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      combin: '❌',                            socialmate: '✅ Tip jar + fan subs'   },
]

const FAQ = [
  {
    q: 'What does Combin actually do?',
    a: "Combin is an Instagram growth and management tool. It helps you find relevant Instagram users (by hashtag, location, or competitors' followers), manage your own follower list, schedule Instagram posts, and analyze account performance. It's useful if Instagram is your primary platform and you want to grow your Instagram following specifically. The key limitation: it only works with Instagram.",
  },
  {
    q: 'Is SocialMate comparable to Combin?',
    a: "SocialMate covers the Instagram scheduling part of what Combin does, but SocialMate's Instagram support relies on workarounds since Meta's Instagram API is restrictive. Where SocialMate excels is everything outside Instagram: Discord, Telegram, Bluesky, TikTok, LinkedIn, X/Twitter, and Mastodon — all of which Combin doesn't support at all. If Instagram is your only platform, Combin is more Instagram-specialized. If you post anywhere else, SocialMate is the answer.",
  },
  {
    q: 'Does SocialMate help grow followers like Combin?',
    a: "Combin's growth features include finding and engaging with potential followers based on hashtags, locations, and competitor accounts. SocialMate's Trend Scout agent analyzes competitors and surfaces trending content angles automatically. SocialMate's Growth Scout agent reads competitor activity and your own posts to generate actionable insights. These are AI-powered content strategy tools — not Instagram automation, which Meta's API policies prohibit.",
  },
  {
    q: 'What platforms does SocialMate actually support for scheduling?',
    a: "SocialMate has 7 live platforms: Discord, Telegram, Bluesky, TikTok, LinkedIn, X/Twitter, and Mastodon. Each platform connects via official OAuth or API. Posts are published natively — not via browser automation or unofficial methods. Instagram and Facebook are on the roadmap pending Meta API approval.",
  },
  {
    q: 'Why does SocialMate support Discord and Telegram but Combin does not?',
    a: "Combin was built for Instagram growth — it's Instagram-native by design. SocialMate was built in 2026 for the modern creator landscape, where community platforms like Discord (200M+ active users) and Telegram (950M+ users) are just as important as traditional social networks. Most scheduling tools skip community platforms entirely. SocialMate treats them as first-class citizens.",
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

export default function VsCombinPage() {
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
            SocialMate vs Combin
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Combin is Instagram-only at $15/month. SocialMate schedules to 7 platforms with 15+ AI tools and autonomous content generation — starting free.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Combin</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Instagram-only growth tool</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Instagram follower growth tools</li>
              <li>✅ Hashtag + competitor audience research</li>
              <li>✅ Instagram scheduling</li>
              <li>❌ Instagram only — no other platforms</li>
              <li>❌ No free plan</li>
              <li>❌ No AI writing, SOMA, or agents</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">7 platforms. AI. Free to start.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Discord + Telegram + Bluesky + TikTok + LinkedIn + X + Mastodon</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ SOMA autonomous content agent</li>
              <li>✅ Pro plan for $5/month total</li>
              <li>✅ Competitor tracking + Trend Scout agent</li>
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
              <span>Combin</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.combin}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators choose SocialMate over Combin</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Instagram is one platform. Your audience is on seven.',
                desc: "Combin bets everything on Instagram. In 2026, creators live across Discord, Telegram, TikTok, LinkedIn, Bluesky, X, and Mastodon simultaneously. Paying $15/month for a single-platform tool when SocialMate covers all 7 for free makes the choice straightforward.",
              },
              {
                n: '2',
                title: 'No AI tools at all — SocialMate has 12',
                desc: "Combin has zero AI content assistance. SocialMate includes caption generation, hook writing, content repurposing (6 formats), hashtag research, thread generation, and SOMA — which autonomously generates and schedules a full week of content from your brand context. These tools save hours every week.",
              },
              {
                n: '3',
                title: "Discord and Telegram — Combin can't touch these",
                desc: "If you run a Discord server or Telegram channel, Combin offers you nothing. SocialMate schedules natively to both. You can announce new content drops, share updates, and keep your community engaged — all from the same scheduler you use for LinkedIn and TikTok.",
              },
              {
                n: '4',
                title: 'Growth intelligence without the single-platform lock-in',
                desc: "Combin's growth features are Instagram-specific. SocialMate's Trend Scout agent analyzes competitor content across multiple platforms and surfaces the content angles gaining traction right now. The Growth Scout agent reads your own post performance and competitor activity to generate actionable growth insights — platform-agnostic, not Instagram-exclusive.",
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
          <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-3">Beyond Instagram</p>
          <h2 className="text-3xl font-extrabold mb-4">Schedule everywhere. Free.</h2>
          <p className="text-ink-body mb-6 max-w-lg mx-auto text-sm">
            SocialMate covers 7 platforms including Discord and Telegram — with 15+ AI tools and SOMA built in.
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
