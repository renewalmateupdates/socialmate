'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',         smarterqueue: '$16.99/month',         socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              smarterqueue: 'Free plan (1 profile)', socialmate: '✅ Genuinely free'        },
  { feature: 'Profiles on free plan',  smarterqueue: '1 profile only',       socialmate: 'Unlimited profiles'      },
  { feature: 'Platforms supported',    smarterqueue: '7 (paid)',              socialmate: '7 live (free)'               },
  { feature: 'Team seats',             smarterqueue: '1 on Solo plan',        socialmate: '2 seats free'            },
  { feature: 'AI writing tools',       smarterqueue: '❌ No AI tools',        socialmate: '15+ tools free'           },
  { feature: 'Evergreen recycling',    smarterqueue: '✅ Core feature',       socialmate: '✅ Free'                  },
  { feature: 'Category-based queues',  smarterqueue: '✅ Core feature',       socialmate: '✅ Drafts + queue'       },
  { feature: 'Bulk scheduling',        smarterqueue: '✅ (paid)',             socialmate: '✅ Free'                  },
  { feature: 'Link in bio',            smarterqueue: '❌',                    socialmate: '✅ Free'                  },
  { feature: 'Analytics',             smarterqueue: 'Basic (paid)',          socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',    smarterqueue: '❌',                    socialmate: '✅ Free'                  },
  { feature: 'RSS import',             smarterqueue: '✅ (paid)',             socialmate: '✅ Free'                  },
  { feature: 'Bluesky / Mastodon',     smarterqueue: '❌',                    socialmate: '✅'                       },
  { feature: 'Discord / Telegram',     smarterqueue: '❌',                    socialmate: '✅'                       },
  { feature: 'Client workspaces',      smarterqueue: 'Agency plan ($82/mo)', socialmate: 'Pro+: from $5/mo'        },
]

const FAQ = [
  {
    q: 'What does SmarterQueue cost in 2026?',
    a: 'SmarterQueue\'s Solo plan starts at $16.99/month for 1 user and 4 profiles. The Business plan is $39.99/month, and the Agency plan is $82.99/month. There is a limited free plan, but it only allows 1 social profile.',
  },
  {
    q: 'What is SmarterQueue known for?',
    a: 'SmarterQueue is known for its category-based evergreen recycling system. You can organize posts into content categories with defined posting schedules, and SmarterQueue automatically cycles through your evergreen content. It\'s a strong choice for content-heavy accounts.',
  },
  {
    q: 'Does SocialMate have evergreen recycling?',
    a: 'Yes — SocialMate includes evergreen recycling on all plans including free. Posts can be automatically re-queued so your best content stays in rotation without manual effort.',
  },
  {
    q: 'Does SmarterQueue have AI writing tools?',
    a: 'No — SmarterQueue does not include AI writing tools as of 2026. SocialMate includes 12 AI-powered tools for free: caption generation, rewriting, hook creation, thread generation, and more, all powered by Google Gemini.',
  },
  {
    q: 'Is SmarterQueue worth the cost over SocialMate?',
    a: 'SmarterQueue\'s category-based queue system is more structured than SocialMate\'s current evergreen recycling. If that specific workflow is critical to you, it\'s worth considering. But SocialMate offers 15+ AI tools, competitor tracking, 7 platforms, and more — all free — which SmarterQueue can\'t match at any price.',
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

export default function VsSmarterqueue() {
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
          <div className="inline-flex items-center gap-2 bg-violet/10 border border-violet/40 text-violet text-xs font-bold px-4 py-2 rounded-full mb-6">
            ♻️ SmarterQueue specializes in evergreen recycling — SocialMate has that too, for free
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs SmarterQueue (2026)
          </h1>
          <p className="text-ink-muted max-w-2xl mx-auto text-sm leading-relaxed">
            SmarterQueue built its reputation on category-based evergreen recycling.
            It&#39;s a well-designed tool for content-heavy accounts. But SocialMate now
            ships evergreen recycling for free — plus 15+ AI tools and 7 platforms SmarterQueue doesn&#39;t support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-violet/40 bg-violet/10 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-violet uppercase tracking-widest mb-2">SmarterQueue</p>
            <p className="text-3xl font-extrabold text-violet mb-1">$16.99/month</p>
            <p className="text-xs text-violet">Solo plan · 4 profiles · Limited free plan</p>
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
              <span className="text-xs font-bold text-ink-body uppercase tracking-wide text-center">SmarterQueue</span>
              <span className="text-xs font-bold text-ink-high uppercase tracking-wide text-center">{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-edge border-edge last:border-0 ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="text-xs font-semibold text-ink-body">{row.feature}</span>
                <span className="text-xs text-ink-muted text-center">{row.smarterqueue}</span>
                <span className="text-xs font-bold text-ink-high text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        <div className="mb-12 bg-raised rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 text-ink-high">The honest take</h2>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            SmarterQueue is genuinely good at what it does. The category-based queue system — where different content types post on different schedules — is a thoughtful design that keeps feeds varied and consistent.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            But SmarterQueue has no AI writing tools, no link in bio, no competitor tracking, and doesn&#39;t support emerging platforms like Bluesky or Mastodon. In 2026, those gaps matter.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            SocialMate covers evergreen recycling and then some — plus 15+ AI tools, 7 platforms, and a full feature set at $0. If SmarterQueue&#39;s evergreen system has been your main reason to stay, there&#39;s no longer a reason to pay for it.
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
