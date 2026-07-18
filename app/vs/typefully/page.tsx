'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',         typefully: '$12.50/month',           socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              typefully: 'Limited free plan',      socialmate: '✅ Genuinely free'        },
  { feature: 'Platforms supported',    typefully: 'X/Twitter, LinkedIn',    socialmate: '7 live (free)'               },
  { feature: 'Thread editor',          typefully: '✅ Best-in-class',       socialmate: '✅ Free'                  },
  { feature: 'Team seats',             typefully: '1 on Creator',           socialmate: '2 seats free'            },
  { feature: 'AI writing tools',       typefully: 'AI assist (paid)',       socialmate: '15+ tools free'           },
  { feature: 'Analytics',             typefully: 'Creator+ plan',          socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',        typefully: '❌',                     socialmate: '✅ Free'                  },
  { feature: 'Link in bio',            typefully: '❌',                     socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',    typefully: '❌',                     socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',    typefully: '❌',                     socialmate: '✅ Free'                  },
  { feature: 'RSS import',             typefully: '❌',                     socialmate: '✅ Free'                  },
  { feature: 'Bluesky / Mastodon',     typefully: '❌',                     socialmate: '✅'                       },
  { feature: 'Discord / Telegram',     typefully: '❌',                     socialmate: '✅'                       },
  { feature: 'Client workspaces',      typefully: 'Team plan ($29/mo)',     socialmate: 'Pro+: from $5/mo'        },
  { feature: 'Hashtag manager',        typefully: '❌',                     socialmate: '✅ Free'                  },
]

const FAQ = [
  {
    q: 'What does Typefully cost in 2026?',
    a: 'Typefully\'s Creator plan is $12.50/month (billed annually) or $19/month monthly. The Team plan is $29/month per user. There is a free plan with limited features — you can schedule a few tweets but can\'t access analytics or advanced features.',
  },
  {
    q: 'What is Typefully best known for?',
    a: 'Typefully has one of the best-designed thread editors for X/Twitter. The distraction-free writing interface, easy reordering of thread segments, and thread preview are genuinely well-built for writers who produce long-form content on X.',
  },
  {
    q: 'Does SocialMate have a thread editor?',
    a: 'Yes — SocialMate supports X/Twitter thread scheduling with multi-tweet composition. While Typefully\'s dedicated thread editor is more refined for power users, SocialMate covers the core thread workflow for free.',
  },
  {
    q: 'Does Typefully support platforms besides X/Twitter?',
    a: 'Typefully added LinkedIn support. But it still doesn\'t cover Bluesky, Mastodon, Discord, Telegram, or the 14 other platforms SocialMate supports. If you\'re building presence beyond X and LinkedIn, you need another tool.',
  },
  {
    q: 'Who should use Typefully vs SocialMate?',
    a: 'Typefully is ideal if you\'re an X/Twitter writer who produces daily threads and wants a best-in-class writing experience for that one platform. SocialMate is the better choice if you need multiple platforms, AI writing tools, analytics, competitor tracking, and a free plan — all in one place.',
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

export default function VsTypefully() {
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
            ✍️ Typefully is a thread-first editor — SocialMate covers 7 platforms for free
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs Typefully (2026)
          </h1>
          <p className="text-ink-muted max-w-2xl mx-auto text-sm leading-relaxed">
            Typefully is beloved by X/Twitter writers for its focused, distraction-free thread editor.
            It&#39;s a beautiful product for a specific use case. But if you need multi-platform support,
            AI tools, and a genuinely free plan — SocialMate is the complete package.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-edge-lit bg-raised rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-2">Typefully</p>
            <p className="text-3xl font-extrabold text-ink-muted mb-1">$12.50/month</p>
            <p className="text-xs text-ink-muted">X/Twitter + LinkedIn · Limited free plan</p>
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
              <span className="text-xs font-bold text-ink-body uppercase tracking-wide">Feature</span>
              <span className="text-xs font-bold text-ink-body uppercase tracking-wide text-center">Typefully</span>
              <span className="text-xs font-bold text-ink-high uppercase tracking-wide text-center">SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-edge border-edge last:border-0 ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="text-xs font-semibold text-ink-body">{row.feature}</span>
                <span className="text-xs text-ink-muted text-center">{row.typefully}</span>
                <span className="text-xs font-bold text-ink-high text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        <div className="mb-12 bg-raised rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 text-ink-high">The honest take</h2>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            Typefully has one of the cleanest thread-writing experiences available. If you write multiple threads per week on X/Twitter and want a focused, distraction-free editor with great thread previews — Typefully genuinely excels at that.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            The limitation is scope. Typefully doesn&#39;t cover Bluesky, Mastodon, Discord, Telegram, or any of the 14+ other platforms that SocialMate supports. There are also no bulk scheduling, competitor tracking, hashtag manager, or RSS import features.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            SocialMate is the better choice for creators who post across multiple channels or want AI tools built in. Typefully wins if X/Twitter thread writing is your singular focus and you want the best possible editor for that one workflow.
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
