'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',         postcron: '$8/month',                socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              postcron: '❌ No free plan',          socialmate: '✅ Genuinely free'        },
  { feature: 'Platforms supported',    postcron: '6 platforms',              socialmate: '7 live (free)'           },
  { feature: 'Team seats',             postcron: 'Extra cost',               socialmate: '2 seats free'            },
  { feature: 'AI writing tools',       postcron: '❌ No AI tools',          socialmate: '15+ tools free'           },
  { feature: 'Bulk scheduling',        postcron: '✅ CSV upload',           socialmate: '✅ Free'                  },
  { feature: 'Link in bio',            postcron: '❌',                      socialmate: '✅ Free'                  },
  { feature: 'Analytics',             postcron: 'Business plan only',      socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',    postcron: '❌',                      socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',    postcron: '❌',                      socialmate: '✅ Free'                  },
  { feature: 'RSS import',             postcron: '✅ (paid)',               socialmate: '✅ Free'                  },
  { feature: 'Watermark on images',    postcron: '✅ Free posts only',      socialmate: '❌ No watermarks'        },
  { feature: 'Bluesky / Mastodon',     postcron: '❌',                      socialmate: '✅'                       },
  { feature: 'Discord / Telegram',     postcron: '❌',                      socialmate: '✅'                       },
  { feature: 'Client workspaces',      postcron: 'Agency plan ($79/mo)',    socialmate: 'Pro+: from $5/mo'        },
  { feature: 'Hashtag manager',        postcron: '❌',                      socialmate: '✅ Free'                  },
]

const FAQ = [
  {
    q: 'What does Postcron cost in 2026?',
    a: 'Postcron\'s Personal plan starts at $8/month for basic scheduling. The Business plan is $29/month and includes analytics. The Agency plan is $79/month. There is no free plan, and free trial posts include a Postcron watermark on images.',
  },
  {
    q: 'Is Postcron still actively developed?',
    a: 'Postcron has been around since 2012 and remains operational, but it hasn\'t kept pace with the AI-powered features that newer tools have added. It\'s a reliable, basic scheduling tool without the modern AI tools, competitor tracking, or platform diversity of newer alternatives.',
  },
  {
    q: 'What does Postcron do that SocialMate doesn\'t?',
    a: 'Postcron has a CSV bulk upload feature for mass-scheduling posts that is straightforward and reliable. SocialMate also supports bulk scheduling with a similar interface, so this isn\'t a meaningful differentiator.',
  },
  {
    q: 'Does Postcron support modern platforms like Bluesky?',
    a: 'No — Postcron supports the traditional platforms (Facebook, Instagram, Twitter, LinkedIn, Pinterest, Google My Business) but hasn\'t added support for Bluesky, Mastodon, Discord, Telegram, or other emerging platforms. SocialMate supports 7 platforms including all of these.',
  },
  {
    q: 'Why should I switch from Postcron to SocialMate?',
    a: 'SocialMate is free, has no watermarks, supports 7 platforms (vs 6), includes 15+ AI tools Postcron lacks, and ships features like competitor tracking, evergreen recycling, and hashtag collections. At every price point, SocialMate offers more.',
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

export default function VsPostcron() {
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
            💸 Postcron starts at $8/month — no free plan, no AI tools, adds watermarks
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs Postcron (2026)
          </h1>
          <p className="text-ink-muted max-w-2xl mx-auto text-sm leading-relaxed">
            Postcron is one of the older social scheduling tools on the market.
            It works, but it hasn&#39;t evolved. No AI tools. No emerging platform support.
            Watermarks on free trial posts. SocialMate ships everything Postcron has — and much more — for free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-amber bg-amber/10 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-amber uppercase tracking-widest mb-2">Postcron</p>
            <p className="text-3xl font-extrabold text-amber mb-1">$8/month</p>
            <p className="text-xs text-amber">6 platforms · No AI · Watermarks on trials</p>
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
              <span className="text-xs font-bold text-ink-body uppercase tracking-wide text-center">Postcron</span>
              <span className="text-xs font-bold text-ink-high uppercase tracking-wide text-center">{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-edge border-edge last:border-0 ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="text-xs font-semibold text-ink-body">{row.feature}</span>
                <span className="text-xs text-ink-muted text-center">{row.postcron}</span>
                <span className="text-xs font-bold text-ink-high text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        <div className="mb-12 bg-raised rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 text-ink-high">The honest take</h2>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            Postcron is functional. It schedules posts. It has CSV bulk upload. It&#39;s been doing that reliably since 2012. If all you need is basic scheduling and you&#39;re used to the interface, there&#39;s nothing wrong with it.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            But the social media landscape has moved on. AI writing tools are table stakes in 2026. Emerging platforms like Bluesky and Mastodon are where audiences are migrating. Postcron hasn&#39;t kept up — no AI, limited platforms, and no free plan.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            SocialMate is what Postcron would look like if it were built today. Everything Postcron does — and 15+ AI tools, competitor tracking, evergreen recycling, hashtag collections, and 10 more platforms — for $0.
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
