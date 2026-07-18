'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',         hypefury: '$19/month',               socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              hypefury: '7-day trial only',        socialmate: '✅ Genuinely free'        },
  { feature: 'Platforms supported',    hypefury: 'X, LinkedIn, Instagram',  socialmate: '7 live (free)'               },
  { feature: 'X/Twitter threads',      hypefury: '✅ Core feature',         socialmate: '✅ Free'                  },
  { feature: 'Team seats',             hypefury: '1 on Standard',           socialmate: '2 seats free'            },
  { feature: 'AI writing tools',       hypefury: 'AI ghostwriter (paid)',   socialmate: '15+ tools free'           },
  { feature: 'Auto-retweet',           hypefury: '✅',                      socialmate: '❌'                       },
  { feature: 'Evergreen recycling',    hypefury: '✅ (paid)',               socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',        hypefury: '✅ (paid)',               socialmate: '✅ Free'                  },
  { feature: 'Link in bio',            hypefury: '❌',                      socialmate: '✅ Free'                  },
  { feature: 'Analytics',             hypefury: 'Basic (paid)',            socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',    hypefury: '❌',                      socialmate: '✅ Free'                  },
  { feature: 'Bluesky / Mastodon',     hypefury: '❌',                      socialmate: '✅'                       },
  { feature: 'Discord / Telegram',     hypefury: '❌',                      socialmate: '✅'                       },
  { feature: 'Client workspaces',      hypefury: '❌',                      socialmate: 'Pro+: from $5/mo'        },
  { feature: 'RSS import',             hypefury: '❌',                      socialmate: '✅ Free'                  },
]

const FAQ = [
  {
    q: 'What does Hypefury cost in 2026?',
    a: 'Hypefury\'s Standard plan is $19/month and the Premium plan is $49/month. There is no free plan — only a 7-day trial. Pricing is per account (not per user), and each additional account costs extra.',
  },
  {
    q: 'What is Hypefury best at?',
    a: 'Hypefury is designed specifically for X/Twitter power users and ghostwriters. Features like auto-retweet (boosting a tweet\'s own virality), Twitter thread scheduling, and "evergreen" tweet recycling are tightly optimized for the X algorithm.',
  },
  {
    q: 'Does SocialMate support X/Twitter threads?',
    a: 'Yes — SocialMate supports X/Twitter thread scheduling. You can write, schedule, and publish multi-tweet threads. Free plan includes 50 tweets/month, Pro includes 200, and Agency includes 500.',
  },
  {
    q: 'Does SocialMate have auto-retweet?',
    a: 'No — SocialMate doesn\'t include auto-retweet as it can trigger spam flags on X. We focus on authentic scheduling and organic growth tools instead.',
  },
  {
    q: 'Who should choose Hypefury vs SocialMate?',
    a: 'If you\'re an X/Twitter ghostwriter or personal brand builder who lives primarily on X and needs deep Twitter-specific optimization like auto-retweet, Hypefury may suit your workflow. If you need to be active on multiple platforms, want AI tools, and want to start free — SocialMate is the clear choice.',
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

export default function VsHypefury() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-screen bg-panel">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <header className="sticky top-0 z-50 bg-panel bg-panel backdrop-blur-sm border-b border-edge">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold text-base tracking-tight text-ink-high">
              SocialMate
              <span className="text-[10px] font-semibold bg-raised text-ink-high px-1.5 py-0.5 rounded-full align-super ml-1">Beta</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {[
              { label: 'Features',    href: '/features'    },
              { label: 'Pricing',     href: '/pricing'     },
              { label: 'Studio Stax', href: '/studio-stax' },
              { label: 'Roadmap',     href: '/roadmap'     },
              { label: 'Our Story',   href: '/story'       },
              { label: 'Blog',        href: '/blog'        },
            ].map(l => (
              <Link key={l.label} href={l.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-ink-muted hover:text-ink-high dark:hover:text-ink-high hover:bg-raised dark:hover:bg-raised transition-all">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <Link href="/give" className="text-sm font-semibold text-alert hover:text-alert transition-all">❤️ Give</Link>
            <Link href="/partners" className="text-sm font-semibold text-amber hover:text-amber transition-all">Partners</Link>
            <Link href="/login" className="text-sm font-semibold text-ink-muted hover:text-ink-high dark:hover:text-ink-high transition-all">{t('vs_shared.nav_sign_in')}</Link>
            <Link href="/signup" className="bg-void bg-panel text-ink-high text-sm font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
              {t('vs_shared.nav_get_started')}
            </Link>
          </div>
          <div className="flex md:hidden items-center gap-2">
            <Link href="/login" className="text-sm font-semibold text-ink-muted hover:text-ink-high dark:hover:text-ink-high transition-all px-2 py-1">{t('vs_shared.nav_sign_in')}</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">

        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-raised border border-edge-lit text-ink-muted text-xs font-bold px-4 py-2 rounded-full mb-6">
            🐦 Hypefury is built for X/Twitter — SocialMate covers 7 platforms for free
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs Hypefury (2026)
          </h1>
          <p className="text-ink-muted max-w-2xl mx-auto text-sm leading-relaxed">
            Hypefury is a popular X/Twitter growth tool for personal brands and ghostwriters.
            If X is your only platform, it&#39;s a reasonable choice. But for creators building
            presence across multiple channels, SocialMate offers far more — for free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-edge-lit bg-raised rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-2">Hypefury</p>
            <p className="text-3xl font-extrabold text-ink-muted mb-1">$19/month</p>
            <p className="text-xs text-ink-muted">X/Twitter focused · No free plan</p>
          </div>
          <div className="border-2 border-jade/40 bg-jade/10 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-jade uppercase tracking-widest mb-2">SocialMate</p>
            <p className="text-3xl font-extrabold text-jade mb-1">$0/month</p>
            <p className="text-xs text-jade">7 platforms · 15+ AI tools · Free forever</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised bg-raised border-b border-edge border-edge px-5 py-3">
              <span className="text-xs font-bold text-ink-body uppercase tracking-wide">{t('vs_shared.table_feature')}</span>
              <span className="text-xs font-bold text-ink-body uppercase tracking-wide text-center">Hypefury</span>
              <span className="text-xs font-bold text-ink-high uppercase tracking-wide text-center">{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-edge border-edge last:border-0 ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="text-xs font-semibold text-ink-body">{row.feature}</span>
                <span className="text-xs text-ink-muted text-center">{row.hypefury}</span>
                <span className="text-xs font-bold text-ink-high text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        <div className="mb-12 bg-raised rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 text-ink-high">The honest take</h2>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            Hypefury is a well-designed tool for X/Twitter-first creators. If you&#39;re building a personal brand on X and want features like auto-retweet and a ghostwriter-friendly interface, it&#39;s optimized for exactly that workflow.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            But X/Twitter is increasingly one channel among many. Most creators today need to be on Bluesky, Mastodon, Discord, and other platforms as audiences diversify. Hypefury doesn&#39;t support those.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            SocialMate covers X/Twitter (threads, scheduling, quota management) plus 15 other platforms, 15+ AI tools, and competitor tracking — for free. If you&#39;re paying $19/month for Hypefury and also managing other platforms, SocialMate consolidates everything.
          </p>
        </div>

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

        <div className="bg-void text-ink-high rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3 text-ink-high">Start for free today</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            7 platforms, 15+ AI tools, 100 posts/month, link in bio, competitor tracking — all free. No card required.
          </p>
          <Link href="/signup"
            className="inline-block bg-panel text-ink-high font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
