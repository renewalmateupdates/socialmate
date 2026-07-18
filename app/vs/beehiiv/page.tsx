'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

const COMPARISON = [
  { feature: 'Starting price',            beehiiv: '$42/month (Scale plan)',       socialmate: '$0 — free forever'        },
  { feature: 'Primary focus',             beehiiv: 'Newsletter publishing',        socialmate: 'Social media scheduling'  },
  { feature: 'Social media scheduling',   beehiiv: '❌ Not included',              socialmate: '✅ 7 platforms'            },
  { feature: 'Newsletter / email',        beehiiv: '✅ Core feature',              socialmate: '❌ Not included'           },
  { feature: 'Free plan',                 beehiiv: 'Up to 2,500 subscribers',      socialmate: '✅ Full free plan'         },
  { feature: 'AI writing tools',          beehiiv: 'AI writer (paid add-on)',      socialmate: '15+ tools free'            },
  { feature: 'Discord scheduling',        beehiiv: '❌',                            socialmate: '✅'                       },
  { feature: 'Telegram scheduling',       beehiiv: '❌',                            socialmate: '✅'                       },
  { feature: 'Bluesky scheduling',        beehiiv: '❌',                            socialmate: '✅'                       },
  { feature: 'TikTok scheduling',         beehiiv: '❌',                            socialmate: '✅'                       },
  { feature: 'LinkedIn scheduling',       beehiiv: '❌',                            socialmate: '✅'                       },
  { feature: 'Bulk scheduling',           beehiiv: '❌',                            socialmate: '✅ Free'                   },
  { feature: 'Link in bio (SIGIL)',        beehiiv: '❌',                            socialmate: '✅ Free'                   },
  { feature: 'Competitor tracking',       beehiiv: '❌',                            socialmate: '✅ Free (3 accounts)'     },
  { feature: 'Post analytics',            beehiiv: 'Email open/click rates',       socialmate: 'Social engagement analytics' },
]

const FAQ = [
  {
    q: "Is beehiiv a social media tool?",
    a: "No. beehiiv is a newsletter platform. It helps you write, send, and monetize email newsletters. It does not schedule social media posts to Bluesky, Discord, Telegram, TikTok, or LinkedIn. If you need to grow on social media, beehiiv is not the right tool — SocialMate is.",
  },
  {
    q: 'Why are creators comparing beehiiv and SocialMate?',
    a: 'Many creators use both: beehiiv to build an email newsletter list, and SocialMate to post across social media and drive traffic to that newsletter. They serve different channels. However, if you are on a tight budget and choosing your first tool, SocialMate is free and gets you distribution across 7 platforms immediately.',
  },
  {
    q: 'Can SocialMate replace beehiiv?',
    a: "Not for email newsletters — that is not what SocialMate does. But for growing a social media audience across Discord, Telegram, TikTok, LinkedIn, Bluesky, Mastodon, and X, SocialMate is the right tool. Many creators use both — social media to grow, newsletters to monetize.",
  },
  {
    q: 'Does beehiiv include social media scheduling?',
    a: "beehiiv does not schedule posts to social media platforms. You would need a separate tool for that. SocialMate fills that gap and is free to start — no credit card required.",
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

export default function VsBeehiivPage() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-screen bg-panel">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <nav className="border-b border-edge bg-panel sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold tracking-tight text-ink-high">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-ink-body hover:text-ink-high transition-colors">{t('vs_shared.nav_login')}</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-amber/10 text-ink-high rounded-xl hover:opacity-80 transition-all">{t('vs_shared.nav_start_free')}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-raised border border-edge-lit rounded-full px-4 py-1.5 text-xs font-bold text-ink-muted mb-4">
            Updated June 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs beehiiv
          </h1>
          <p className="text-lg text-ink-body max-w-2xl mx-auto">
            beehiiv is a newsletter platform at $42+/month. SocialMate is a 7-platform social media scheduler with 15+ AI tools — free to start. Different jobs, clear winner for social.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-amber/10 text-ink-high font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
              {t('vs_shared.cta_try_free')}
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-edge font-semibold rounded-2xl hover:border-edge transition-all text-sm text-ink-high">
              {t('vs_shared.cta_see_pricing')}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-panel border-2 border-edge rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">beehiiv</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Great newsletter tool. Not a social scheduler.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Newsletter publishing and monetization</li>
              <li>✅ Email subscriber growth tools</li>
              <li>❌ $42+/month for Scale features</li>
              <li>❌ No social media scheduling</li>
              <li>❌ No Discord, Telegram, Bluesky, TikTok</li>
              <li>❌ Not designed for social content workflows</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">7-platform social OS. Starts free.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Schedule to 7 platforms simultaneously</li>
              <li>✅ 15+ AI writing tools free</li>
              <li>✅ Discord, Telegram, Bluesky, TikTok, LinkedIn</li>
              <li>✅ Bulk scheduling, SIGIL link in bio</li>
              <li>✅ Competitor tracking and analytics built in</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-body uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>beehiiv</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-body">{row.beehiiv}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div></div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Build your audience on social first, then monetize with a newsletter</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Social comes before email in most creator funnels',
                desc: 'You cannot build an email list from nobody. Most successful newsletter creators first build an audience on social — then convert followers to subscribers. SocialMate helps you build that social foundation across 7 platforms for free.',
              },
              {
                n: '2',
                title: 'beehiiv at $42/month vs SocialMate at $0',
                desc: "beehiiv's Scale plan costs $42/month. SocialMate's free plan covers 100 posts a month across 7 platforms, 50 AI credits/month, bulk scheduling, and link in bio. If you are just getting started, start with what is free.",
              },
              {
                n: '3',
                title: 'SocialMate drives traffic to your beehiiv newsletter',
                desc: "The best setup for many creators: use SocialMate to post consistently across all platforms, include your beehiiv newsletter link in your SIGIL link in bio, and grow both simultaneously. They complement each other.",
              },
              {
                n: '4',
                title: 'AI tools built for social, not email',
                desc: "beehiiv's AI helps with email subject lines. SocialMate's 15+ AI tools generate Twitter threads, Bluesky posts, Discord announcements, TikTok captions, LinkedIn hooks, and more — built for the platforms where audiences actually discover new creators.",
              },
            ].map((r) => (
              <div key={r.n} className="flex gap-4 p-5 bg-raised border border-edge rounded-2xl hover:border-edge transition-all">
                <div className="w-8 h-8 bg-amber/10 text-ink-high rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0">{r.n}</div>
                <div>
                  <p className="text-sm font-extrabold mb-1 text-ink-high">{r.title}</p>
                  <p className="text-xs text-ink-body leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.faq_heading')}</h2>
          <div className="space-y-4">
            {FAQ.map((faq, i) => (
              <div key={i} className="p-5 bg-raised border border-edge rounded-2xl">
                <p className="text-sm font-extrabold mb-2 text-ink-high">{faq.q}</p>
                <p className="text-xs text-ink-body leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-void text-ink-high rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Build your social audience first — free</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            7 platforms, 15+ AI tools, bulk scheduling. Completely free to start. No credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-amber/10 text-ink-high font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-ink-muted text-xs mt-3">{t('vs_shared.cta_no_card')}</p>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
