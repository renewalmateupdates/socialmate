'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



// Buffer facts checked against buffer.com/pricing, buffer.com/pricing.md and
// support.buffer.com "Supported channels" on Oct 31, 2026. "Not listed" means
// Buffer's own plan pages do not mention it, not that we know it is missing.
// SocialMate numbers come from lib/plan.ts, lib/post-limits.ts and the bulk
// scheduler's PLAN_MAX_ROWS.
const COMPARISON = [
  { feature: 'How you pay',                  buffer: 'Per channel',                            socialmate: 'One flat monthly price'                  },
  { feature: 'Cheapest paid plan',           buffer: '$6/channel/mo ($5 billed yearly)',       socialmate: '$8/mo Pro ($80/yr)'                      },
  { feature: '7 accounts, cheapest plan',    buffer: '$42/mo ($35 billed yearly)',             socialmate: '$8/mo (Pro)'                             },
  { feature: 'Free plan accounts',           buffer: '3 channels',                             socialmate: '1 per platform (X needs Pro)'            },
  { feature: 'Free plan posting limit',      buffer: '10 queued posts per channel',            socialmate: '250 posts/month, up to 2 weeks ahead'    },
  { feature: 'Bulk scheduling',              buffer: 'Paid plans',                             socialmate: 'Free (10 per batch), Pro (50)'           },
  { feature: 'Analytics',                    buffer: 'Basic free (30 days), full on paid',     socialmate: 'Included free'                           },
  { feature: 'Comment / reply inbox',        buffer: 'All plans',                              socialmate: 'Free (Bluesky, Mastodon, Telegram, Discord)' },
  { feature: 'AI writing tools',             buffer: 'AI Assistant on all plans',              socialmate: '15+ tools, 50 credits/month free'        },
  { feature: 'Discord',                      buffer: '❌',                                      socialmate: '✅'                                       },
  { feature: 'Telegram',                     buffer: '❌',                                      socialmate: '✅'                                       },
  { feature: 'Bluesky',                      buffer: '✅',                                      socialmate: '✅'                                       },
  { feature: 'Mastodon',                     buffer: '✅',                                      socialmate: '✅'                                       },
  { feature: 'LinkedIn',                     buffer: '✅ Profiles and Pages',                   socialmate: '✅ Personal profiles'                     },
  { feature: 'TikTok',                       buffer: 'Reminder to post in the app',            socialmate: '✅ Posts directly'                        },
  { feature: 'X / Twitter',                  buffer: '✅',                                      socialmate: '✅ Pro and up'                            },
  { feature: 'Instagram / Facebook / Threads', buffer: '✅',                                    socialmate: '❌'                                       },
  { feature: 'Pinterest / YouTube Shorts',   buffer: '✅',                                      socialmate: '❌'                                       },
  { feature: 'Hashtag manager',              buffer: 'Paid plans',                             socialmate: '✅ Free'                                  },
  { feature: 'Link in bio',                  buffer: 'Start Page, all plans',                  socialmate: '✅ Free'                                  },
  { feature: 'Competitor tracking',          buffer: 'Not listed',                             socialmate: '✅ Free (3 accounts)'                     },
  { feature: 'RSS import',                   buffer: 'Not listed',                             socialmate: '✅ Free'                                  },
  { feature: 'Evergreen recycling',          buffer: 'Not listed',                             socialmate: '✅ Free'                                  },
  { feature: 'Team members',                 buffer: 'Free 1, Team plan unlimited',            socialmate: 'Free 2, Pro 5, Agency 15'                },
  { feature: 'Client workspaces',            buffer: 'Not listed',                             socialmate: 'Agency: 5 workspaces, $29/mo'            },
]

const FAQ = [
  {
    q: "How limited is Buffer's free plan?",
    a: "Buffer's free plan connects up to 3 channels and holds 10 scheduled posts per channel at a time, refilling as they go out. It includes Buffer's AI Assistant, a comment inbox and 30 days of basic analytics. SocialMate's free plan allows 1 account on each platform (X needs Pro), 250 posts a month scheduled up to 2 weeks ahead, and 50 AI credits a month.",
  },
  {
    q: 'How much does Buffer cost for several accounts?',
    a: 'Buffer bills per channel. Essentials is $6 a month per channel billed monthly, or $5 billed yearly, and Team is $12 or $10. Rates drop past 10 channels. SocialMate Pro is $8 a month flat ($80 a year) for up to 5 accounts on each platform, and Agency is $29 a month for up to 10 per platform plus 5 client workspaces.',
  },
  {
    q: 'Does SocialMate post to Instagram or Facebook?',
    a: 'No. SocialMate posts to Bluesky, Discord, Telegram, Mastodon, LinkedIn, TikTok and X (X on Pro and up). Buffer supports Instagram, Facebook, Threads, Pinterest and YouTube Shorts, so if you need those, Buffer is the better fit.',
  },
  {
    q: 'Is SocialMate actually free?',
    a: 'Yes. The free plan includes 250 posts a month, 50 AI credits a month, bulk scheduling (10 posts per batch), link in bio, a hashtag manager, competitor tracking for 3 accounts, RSS import and evergreen recycling. No credit card required.',
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

export default function VsBufferPage() {
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
            Updated October 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs Buffer
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Buffer bills per channel: $6 a month for each account, or $5 billed yearly. SocialMate Pro is $8 a month flat, and it posts to Discord and Telegram, which Buffer doesn&apos;t.
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

        {/* VERDICT BANNER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-panel border-2 border-edge rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Buffer</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Polished scheduler, priced per channel</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Clean, simple UI</li>
              <li>✅ Instagram, Facebook, Threads, Pinterest and YouTube Shorts</li>
              <li>✅ AI Assistant and comment inbox on every plan</li>
              <li>❌ Every account is billed as its own channel</li>
              <li>❌ Free plan: 3 channels, 10 queued posts each</li>
              <li>❌ No Discord or Telegram</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">One flat price, plus Discord and Telegram</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ $8/mo Pro, not billed per account</li>
              <li>✅ 250 posts a month on the free plan</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky, LinkedIn, TikTok</li>
              <li>✅ 15+ AI tools, 50 credits a month free</li>
              <li>✅ Analytics and bulk scheduling on the free plan</li>
              <li>❌ No Instagram, Facebook, Pinterest or YouTube</li>
            </ul>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-muted uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Buffer</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.buffer}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Where SocialMate and Buffer differ</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Per-channel pricing adds up',
                desc: 'Buffer Essentials is $6 a month per channel, or $5 billed yearly. Seven accounts comes to $42 a month, or $35 billed yearly. SocialMate Pro is $8 a month for up to 5 accounts on each platform.',
              },
              {
                n: '2',
                title: 'Discord and Telegram',
                desc: "Buffer doesn't publish to Discord or Telegram. If your community lives there, SocialMate schedules to both, on the free plan.",
              },
              {
                n: '3',
                title: 'The free plans are shaped differently',
                desc: "Buffer's free plan holds 10 queued posts per channel across 3 channels. SocialMate's free plan allows 250 posts a month scheduled up to 2 weeks ahead, 1 account on each platform, plus bulk scheduling and 50 AI credits a month.",
              },
              {
                n: '4',
                title: 'When Buffer is the better pick',
                desc: "If you need Instagram, Facebook, Threads, Pinterest or YouTube Shorts, use Buffer. SocialMate doesn't post to those.",
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

        {/* CTA */}
        <div className="bg-void text-ink-high rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Done paying per channel?</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SocialMate&apos;s free plan gives you 250 posts a month, bulk scheduling and 15+ AI tools across 6 platforms, with X on Pro. No credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-panel text-ink-high font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-ink-muted text-xs mt-3">{t('vs_shared.cta_no_card')}</p>
        </div>
      </div>
      {/* FOOTER */}
      <PublicFooter />
    </div>
  )
}
