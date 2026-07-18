'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',         hootsuite: '$99/month',            socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              hootsuite: '❌ No free plan',       socialmate: '✅ Genuinely free'        },
  { feature: 'Posts per month (free)', hootsuite: '—',                     socialmate: '100 / month'                },
  { feature: 'Platforms',              hootsuite: '20+ (paid)',            socialmate: '7 live (free)'               },
  { feature: 'Team seats',             hootsuite: '1 user on Standard',   socialmate: '2 seats free'            },
  { feature: 'AI writing tools',       hootsuite: 'OwlyWriter AI (paid)', socialmate: '15+ tools free'           },
  { feature: 'AI credits',            hootsuite: 'Limited/paid',         socialmate: '50/month free'            },
  { feature: 'Bulk scheduling',        hootsuite: 'Advanced plan only',   socialmate: '✅ Free'                  },
  { feature: 'Link in bio',            hootsuite: '❌',                    socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',    hootsuite: 'Streams (paid)',        socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',    hootsuite: '❌',                    socialmate: '✅ Free'                  },
  { feature: 'RSS import',             hootsuite: '❌',                    socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',        hootsuite: '❌',                    socialmate: '✅ Free'                  },
  { feature: 'Client workspaces',      hootsuite: 'Enterprise only',      socialmate: 'Pro+: from $5/mo'        },
  { feature: 'Mastodon/Bluesky',       hootsuite: '❌',                    socialmate: '✅'                       },
  { feature: 'Discord/Telegram',       hootsuite: '❌',                    socialmate: '✅'                       },
  { feature: 'Analytics (30 days)',    hootsuite: 'Basic on paid plans',  socialmate: '✅ Free'                  },
]

const FAQ = [
  {
    q: 'Is Hootsuite really $99/month?',
    a: 'Hootsuite\'s Professional plan starts at $99/month (billed annually) for 1 user and up to 10 social accounts. The Team plan is $249/month. There is no free plan.',
  },
  {
    q: 'What does SocialMate not have that Hootsuite does?',
    a: 'Hootsuite has deeper enterprise features: Salesforce integration, compliance monitoring, and dedicated account management. For individual creators, small businesses, and agencies, SocialMate covers everything that matters.',
  },
  {
    q: 'Can SocialMate really handle team workflows?',
    a: 'Yes. SocialMate includes content approval workflows, team roles, client workspaces, and team seats on every plan. The free plan includes 2 seats. Pro includes 5. Agency includes 15.',
  },
  {
    q: 'Why is SocialMate so much cheaper?',
    a: 'SocialMate is bootstrapped and built lean. We don\'t have the overhead of a large enterprise SaaS. We pass those savings to users — especially free users — because we believe the market needs a genuinely free alternative.',
  },
  {
    q: 'What about Hootsuite\'s certification courses?',
    a: 'Hootsuite Academy is a real differentiator for teams that want structured social media training. SocialMate doesn\'t offer certification courses. If you need that specifically, factor it in. For scheduling, AI tools, and publishing — SocialMate is a better value at every price point.',
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

export default function VsHootsuite() {
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
            💸 Hootsuite starts at $99/month — no free plan
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs Hootsuite (2026)
          </h1>
          <p className="text-ink-muted max-w-2xl mx-auto text-sm leading-relaxed">
            Hootsuite is the market leader in enterprise social media management.
            They're also one of the most expensive tools in the category.
            Here's what you actually need to know before deciding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-amber bg-amber/10 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-amber uppercase tracking-widest mb-2">Hootsuite</p>
            <p className="text-3xl font-extrabold text-amber mb-1">$99/month</p>
            <p className="text-xs text-amber">1 user · 10 accounts · No free plan</p>
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
              <span className="text-xs font-bold text-ink-body uppercase tracking-wide text-center">Hootsuite</span>
              <span className="text-xs font-bold text-ink-high uppercase tracking-wide text-center">{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-edge border-edge last:border-0 ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="text-xs font-semibold text-ink-body">{row.feature}</span>
                <span className="text-xs text-ink-muted text-center">{row.hootsuite}</span>
                <span className="text-xs font-bold text-ink-high text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        <div className="mb-12 bg-raised rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 text-ink-high">The honest take</h2>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            Hootsuite is a powerful product. If you're running social media for a large organization with compliance requirements, Salesforce integration needs, and a team of 20+ — Hootsuite is a legitimate choice at their price point.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            For everyone else — individual creators, small businesses, startups, lean agencies — you're paying for infrastructure you don't need. SocialMate covers scheduling, AI tools, analytics, team collaboration, link in bio, and competitor tracking at $0/month to start.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            The $99/month Hootsuite charges for its entry plan would cover 19 months of SocialMate's Pro plan, or 59 months free.
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
