'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',         onlypult: '$25/month',               socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              onlypult: '7-day trial only',        socialmate: '✅ Genuinely free'        },
  { feature: 'Profiles on entry plan', onlypult: '3 profiles',              socialmate: 'Unlimited profiles free' },
  { feature: 'Platforms supported',    onlypult: '12 (paid)',               socialmate: '7 live (free)'               },
  { feature: 'Team seats',             onlypult: '1 on Start plan',         socialmate: '2 seats free'            },
  { feature: 'AI writing tools',       onlypult: '❌ No AI tools',          socialmate: '15+ tools free'           },
  { feature: 'Bulk scheduling',        onlypult: '✅',                      socialmate: '✅ Free'                  },
  { feature: 'Link in bio',            onlypult: '❌',                      socialmate: '✅ Free'                  },
  { feature: 'Analytics',             onlypult: 'SMM plan+ ($55/mo)',      socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',    onlypult: '❌',                      socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',    onlypult: '❌',                      socialmate: '✅ Free'                  },
  { feature: 'RSS import',             onlypult: '❌',                      socialmate: '✅ Free'                  },
  { feature: 'TikTok on free plan',     onlypult: '❌',                      socialmate: '✅ (20 videos/month)'    },
  { feature: 'TikTok Script Generator',onlypult: '❌',                      socialmate: '✅'                       },
  { feature: 'Bluesky / Mastodon',     onlypult: '❌',                      socialmate: '✅'                       },
  { feature: 'Discord / Telegram',     onlypult: '❌',                      socialmate: '✅'                       },
  { feature: 'GIF export',             onlypult: '❌',                      socialmate: '✅'                       },
  { feature: 'Client workspaces',      onlypult: 'Agency plan ($97/mo)',    socialmate: 'Pro+: from $5/mo'        },
  { feature: 'Hashtag manager',        onlypult: '❌',                      socialmate: '✅ Free'                  },
]

const FAQ = [
  {
    q: 'What does Onlypult cost in 2026?',
    a: 'Onlypult\'s Start plan is $25/month for 3 profiles and 1 user. The SMM plan is $55/month with analytics included. The Agency plan is $97/month. There is no free plan — only a 7-day trial.',
  },
  {
    q: 'What is Onlypult good at?',
    a: 'Onlypult has a clean, straightforward interface and supports Instagram, TikTok, and other visual platforms well. For users who primarily need to schedule image and video content, it\'s a capable tool with a simple UX.',
  },
  {
    q: 'Does Onlypult have AI tools?',
    a: 'No — Onlypult does not include AI writing tools as of 2026. SocialMate includes 15+ AI tools for free: caption generation, rewriting, hook writing, thread creation, and more, all powered by Google Gemini.',
  },
  {
    q: 'How does Onlypult compare for agencies?',
    a: 'Onlypult\'s Agency plan at $97/month supports multiple accounts and users. SocialMate\'s Agency plan is $20/month with client workspaces, 15 team seats, and 2,000 AI credits. The value difference is significant.',
  },
  {
    q: 'Why should I choose SocialMate over Onlypult?',
    a: 'SocialMate is free to start, includes 15+ AI tools, supports 7 platforms (including Bluesky, Mastodon, Discord, Telegram), and offers features like competitor tracking, evergreen recycling, and hashtag collections that Onlypult doesn\'t have at any price point.',
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

export default function VsOnlypult() {
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
            💸 Onlypult starts at $25/month — no free plan, no TikTok free, no AI tools
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs Onlypult (2026)
          </h1>
          <p className="text-ink-muted max-w-2xl mx-auto text-sm leading-relaxed">
            Onlypult is a straightforward social media scheduler with a clean interface.
            But it lacks AI tools, advanced features, and a free plan.
            SocialMate gives you more — for nothing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-amber bg-amber/10 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-amber uppercase tracking-widest mb-2">Onlypult</p>
            <p className="text-3xl font-extrabold text-amber mb-1">$25/month</p>
            <p className="text-xs text-amber">3 profiles · No AI tools · No free plan</p>
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
              <span className="text-xs font-bold text-ink-body uppercase tracking-wide text-center">Onlypult</span>
              <span className="text-xs font-bold text-ink-high uppercase tracking-wide text-center">{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-edge border-edge last:border-0 ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="text-xs font-semibold text-ink-body">{row.feature}</span>
                <span className="text-xs text-ink-muted text-center">{row.onlypult}</span>
                <span className="text-xs font-bold text-ink-high text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        <div className="mb-12 bg-raised rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 text-ink-high">The honest take</h2>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            Onlypult is a clean, simple tool that does basic scheduling well. There&#39;s nothing wrong with it. But it hasn&#39;t kept pace with the AI-powered features that modern content creators expect.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            No AI writing tools. No competitor tracking. No evergreen recycling. No hashtag manager. And you pay $25/month just to get started with 3 profiles.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            SocialMate ships all of those features for free. If you&#39;re paying $25/month for scheduling alone, you&#39;re leaving a lot of value on the table.
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
