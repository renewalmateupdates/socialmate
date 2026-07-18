'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',              canva: '$15/mo (Pro)',               socialmate: '$0 — free forever'          },
  { feature: 'Primary use case',            canva: 'Graphic design',             socialmate: 'Social media scheduling + AI' },
  { feature: 'TikTok scheduling',           canva: '✅ Basic',                   socialmate: '✅ Full (Production API)'    },
  { feature: 'Bluesky support',             canva: '❌',                          socialmate: '✅'                          },
  { feature: 'Discord scheduling',          canva: '❌',                          socialmate: '✅ Free'                     },
  { feature: 'Telegram scheduling',         canva: '❌',                          socialmate: '✅ Free'                     },
  { feature: 'AI writing tools',            canva: 'Magic Write (design-focused)', socialmate: '20+ social-specific tools'  },
  { feature: 'Autonomous content (SOMA)',   canva: '❌',                          socialmate: '✅ (Autopilot/Full Send)'    },
  { feature: 'Trading bot (Enki)',          canva: '❌',                          socialmate: '✅ Free paper trading'       },
  { feature: 'Bulk scheduling',             canva: '❌',                          socialmate: '✅ Free'                     },
  { feature: 'Analytics dashboard',         canva: 'Basic',                      socialmate: '✅ Full analytics + Content DNA' },
  { feature: 'Team approval workflows',     canva: '✅ (Pro)',                    socialmate: '✅ Free'                     },
  { feature: 'Free plan available',         canva: '✅ (design only)',            socialmate: '✅ Full scheduling + AI'     },
  { feature: 'No per-channel fees',         canva: '✅',                          socialmate: '✅'                          },
  { feature: 'Link in bio',                 canva: '❌',                          socialmate: '✅ Free'                     },
  { feature: 'Social inbox',                canva: '❌',                          socialmate: '✅ Bluesky, Mastodon, Telegram, Discord' },
]

const FAQ = [
  {
    q: "Can Canva really schedule social media posts?",
    a: "Yes, Canva added a Content Planner feature in their Pro plan. But it's a bolt-on — built for design teams who want to publish their graphics, not a real scheduling platform. It doesn't support Bluesky, Discord, Telegram, bulk scheduling, AI caption tools, or an engagement inbox.",
  },
  {
    q: "Is SocialMate better than Canva for social media scheduling?",
    a: "If your goal is to schedule and manage social media content across many platforms, SocialMate is purpose-built for that. Canva is a design tool first. SocialMate supports 7 live platforms (Bluesky, Discord, Telegram, Mastodon, X/Twitter, TikTok, and LinkedIn), has 15+ AI writing tools, and an autonomous content system (SOMA). Canva Pro is $15/month for tools primarily built around graphic design.",
  },
  {
    q: "What does Canva not support that SocialMate does?",
    a: "Canva does not support Discord, Telegram, or Bluesky scheduling. It has no autonomous content system, no trading bot, no social inbox for replies, no bulk scheduling via CSV, and no per-post performance alerts. SocialMate covers all of these on the free plan or Pro at $5/month.",
  },
  {
    q: "Do I need Canva if I use SocialMate?",
    a: "You can still use Canva for creating graphics — it excels there. But for scheduling, AI content generation, audience engagement, and analytics, SocialMate is the better and more affordable choice. The two tools complement each other rather than compete directly.",
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

export default function VsCanvaPage() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-ink-high">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* NAV */}
      <nav className="border-b border-edge bg-[#0a0a0a] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold tracking-tight">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-ink-body hover:text-ink-high transition-colors">{t('vs_shared.nav_login')}</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-amber/10 text-ink-high rounded-xl hover:bg-amber/10 transition-all">{t('vs_shared.nav_start_free')}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* HERO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber rounded-full px-4 py-1.5 text-xs font-bold text-amber mb-4">
            Updated May 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            SocialMate vs Canva
          </h1>
          <p className="text-lg text-ink-body max-w-2xl mx-auto">
            Canva is a design tool that added scheduling as an afterthought. SocialMate is a Creator OS built for scheduling, AI content, and platform growth — starting at $0.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-amber/10 text-ink-high font-bold rounded-2xl hover:bg-amber/10 transition-all text-sm">
              {t('vs_shared.cta_try_free')}
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-edge font-semibold rounded-2xl hover:border-edge transition-all text-sm text-ink-high">
              {t('vs_shared.cta_see_pricing')}
            </Link>
          </div>
        </div>

        {/* VERDICT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-panel border-2 border-edge rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wide mb-2">Canva</p>
            <p className="font-extrabold text-lg mb-2">World-class design. Scheduling as an add-on.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Best-in-class graphic design tools</li>
              <li>✅ Templates for every social format</li>
              <li>❌ Scheduling is bolt-on, not purpose-built</li>
              <li>❌ No Discord, Telegram, or Bluesky</li>
              <li>❌ No autonomous AI content (SOMA)</li>
              <li>❌ $15/mo just for design + basic scheduling</li>
            </ul>
          </div>
          <div className="bg-amber/10 text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-high uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Purpose-built Creator OS. Free to start.</p>
            <ul className="space-y-1 text-xs text-ink-high">
              <li>✅ 7 live platforms including Discord, Telegram + LinkedIn</li>
              <li>✅ 20+ AI content tools</li>
              <li>✅ SOMA: autonomous weekly content generation</li>
              <li>✅ Enki: autonomous trading bot</li>
              <li>✅ Full analytics, inbox, and link in bio</li>
              <li>✅ Free plan — no credit card required</li>
            </ul>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-body uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Canva</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-body">{row.canva}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">Why creators choose SocialMate over Canva for scheduling</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: "Canva's scheduling is a design tool feature, not a scheduling platform",
                desc: "Canva Content Planner is great if you want to push a Canva graphic to Instagram. But it does not have bulk scheduling, CSV imports, queue management, or platform-specific character limits. It was designed for design teams, not content operations.",
              },
              {
                n: '2',
                title: 'No Discord, Telegram, or Bluesky — major platforms left out',
                desc: "If your community lives on Discord, Telegram, or Bluesky, Canva cannot help you post there at all. SocialMate supports all three on the free plan alongside TikTok, Mastodon, and X/Twitter.",
              },
              {
                n: '3',
                title: 'SocialMate has 20+ AI content tools — not just design magic',
                desc: "Canva's AI tools are focused on design: Magic Write, text effects, background removal. SocialMate's 20+ AI tools are focused on content: caption generation, hook writing, thread builder, hashtag suggestions, content repurposing, and SOMA autonomous weekly generation.",
              },
              {
                n: '4',
                title: 'SocialMate Pro is 3x cheaper than Canva Pro',
                desc: "Canva Pro costs $15/month. SocialMate Pro costs $5/month — and includes features Canva does not have at any price: SOMA autonomous content, Enki trading bot, social inbox, posting streaks, and full analytics.",
              },
            ].map((r) => (
              <div key={r.n} className="flex gap-4 p-5 bg-panel border border-edge rounded-2xl hover:border-edge transition-all">
                <div className="w-8 h-8 bg-amber/10 text-ink-high rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0">{r.n}</div>
                <div>
                  <p className="text-sm font-extrabold mb-1 text-ink-high">{r.title}</p>
                  <p className="text-xs text-ink-body leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6">{t('vs_shared.faq_heading')}</h2>
          <div className="space-y-4">
            {FAQ.map((faq, i) => (
              <div key={i} className="p-5 bg-panel border border-edge rounded-2xl">
                <p className="text-sm font-extrabold mb-2 text-ink-high">{faq.q}</p>
                <p className="text-xs text-ink-body leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-amber/10 text-ink-high rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Ready for a scheduling platform — not a design tool?</h2>
          <p className="text-ink-high text-sm mb-6 max-w-lg mx-auto">
            SocialMate is purpose-built for social media. 7 platforms, 20+ AI tools, SOMA autonomous content — all starting at $0.
          </p>
          <Link href="/signup" className="inline-block bg-void text-ink-high font-bold px-8 py-3.5 rounded-2xl hover:opacity-80 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-ink-high text-xs mt-3">{t('vs_shared.cta_no_card')}</p>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
