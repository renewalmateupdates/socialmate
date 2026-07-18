'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',         hopperhq: '$19/month (1 social set)', socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              hopperhq: '❌ No free plan',           socialmate: '✅ Genuinely free'        },
  { feature: 'Platforms supported',    hopperhq: '8 (Instagram-focused)',    socialmate: '7 live (free)'               },
  { feature: 'Instagram grid preview', hopperhq: '✅ Core feature',          socialmate: '🔜 Coming soon'          },
  { feature: 'Team seats',             hopperhq: 'Extra cost per user',      socialmate: '2 seats free'            },
  { feature: 'AI writing tools',       hopperhq: 'AI Caption (paid)',        socialmate: '15+ tools free'           },
  { feature: 'Bulk scheduling',        hopperhq: '✅',                       socialmate: '✅ Free'                  },
  { feature: 'Link in bio',            hopperhq: '✅ (paid)',                 socialmate: '✅ Free'                  },
  { feature: 'Analytics',             hopperhq: '✅ (paid)',                 socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',    hopperhq: '❌',                       socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',    hopperhq: '❌',                       socialmate: '✅ Free'                  },
  { feature: 'RSS import',             hopperhq: '❌',                       socialmate: '✅ Free'                  },
  { feature: 'Bluesky / Mastodon',     hopperhq: '❌',                       socialmate: '✅'                       },
  { feature: 'Discord / Telegram',     hopperhq: '❌',                       socialmate: '✅'                       },
  { feature: 'Client workspaces',      hopperhq: 'Extra cost per client',    socialmate: 'Pro+: from $5/mo'        },
  { feature: 'Hashtag manager',        hopperhq: '❌',                       socialmate: '✅ Free'                  },
]

const FAQ = [
  {
    q: 'What does Hopper HQ cost in 2026?',
    a: 'Hopper HQ\'s pricing starts at $19/month per "social set" (one Instagram account + connected accounts). Costs add up quickly when managing multiple clients or multiple brand accounts, as each requires an additional social set.',
  },
  {
    q: 'What makes Hopper HQ unique?',
    a: 'Hopper HQ is particularly strong for Instagram-first workflows. Their visual grid preview — which shows exactly how your Instagram feed will look before you post — is a standout feature for visual brands and photographers.',
  },
  {
    q: 'Does SocialMate have an Instagram grid preview?',
    a: 'Instagram grid preview is on SocialMate\'s roadmap as Instagram support is added. Currently, SocialMate focuses on Bluesky, Mastodon, Discord, Telegram, and X/Twitter as primary scheduling platforms.',
  },
  {
    q: 'How does Hopper HQ pricing scale for agencies?',
    a: 'Hopper HQ pricing is per-social-set, which means agency costs scale significantly with each client. Managing 10 clients could mean $190+/month just for access. SocialMate\'s Agency plan at $20/month supports up to 5 client workspaces flat.',
  },
  {
    q: 'What does SocialMate offer that Hopper HQ doesn\'t?',
    a: 'SocialMate offers 12 AI writing tools, competitor tracking, hashtag collections, evergreen recycling, RSS import, and support for platforms like Bluesky, Mastodon, Discord, and Telegram — all for free. Hopper HQ is primarily focused on Instagram.',
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

export default function VsHopperHq() {
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
          <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber text-amber text-xs font-bold px-4 py-2 rounded-full mb-6">
            💸 Hopper HQ starts at $19/month per social set — no free plan
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs Hopper HQ (2026)
          </h1>
          <p className="text-ink-muted max-w-2xl mx-auto text-sm leading-relaxed">
            Hopper HQ is an Instagram-focused scheduling tool with a clean visual grid preview.
            If your world revolves around Instagram aesthetics, it&#39;s a solid pick.
            For multi-platform creators who need more, SocialMate offers broader coverage at no cost.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-amber bg-amber/10 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-amber uppercase tracking-widest mb-2">Hopper HQ</p>
            <p className="text-3xl font-extrabold text-amber mb-1">$19/month</p>
            <p className="text-xs text-amber">Per social set · No free plan · Scales per client</p>
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
              <span className="text-xs font-bold text-ink-body uppercase tracking-wide text-center">Hopper HQ</span>
              <span className="text-xs font-bold text-ink-high uppercase tracking-wide text-center">{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-edge border-edge last:border-0 ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="text-xs font-semibold text-ink-body">{row.feature}</span>
                <span className="text-xs text-ink-muted text-center">{row.hopperhq}</span>
                <span className="text-xs font-bold text-ink-high text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        <div className="mb-12 bg-raised rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 text-ink-high">The honest take</h2>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            Hopper HQ is clean, simple, and great for Instagram-first creators who care about feed aesthetics. The grid preview is a real differentiator for visual brands.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            But the per-social-set pricing model gets expensive fast — especially for agencies managing multiple clients. And with no support for emerging platforms like Bluesky, Mastodon, or Discord, it&#39;s a limiting choice for creators building audience across channels.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            SocialMate is the better choice if you value breadth, AI tools, and a free starting point. Instagram grid preview is coming — and when it lands, SocialMate will offer everything Hopper HQ does, for less.
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
