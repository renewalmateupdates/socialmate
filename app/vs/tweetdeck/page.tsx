'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',         tweetdeck: '$8/month (X Premium)',  socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              tweetdeck: '❌ Requires X Premium',  socialmate: '✅ Genuinely free'        },
  { feature: 'Platforms supported',    tweetdeck: 'X/Twitter only',         socialmate: '7 platforms'            },
  { feature: 'Post scheduling',        tweetdeck: 'X only',                 socialmate: '✅ All platforms'        },
  { feature: 'Team seats',             tweetdeck: '❌ No team features',    socialmate: '2 seats free'            },
  { feature: 'AI writing tools',       tweetdeck: '❌ None',                socialmate: '15+ tools free'           },
  { feature: 'Bulk scheduling',        tweetdeck: '❌',                     socialmate: '✅ Free'                  },
  { feature: 'Link in bio',            tweetdeck: '❌',                     socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',    tweetdeck: 'Streams (X only)',       socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',    tweetdeck: '❌',                     socialmate: '✅ Free'                  },
  { feature: 'RSS import',             tweetdeck: '❌',                     socialmate: '✅ Free'                  },
  { feature: 'Analytics dashboard',    tweetdeck: '❌',                     socialmate: '✅ Free'                  },
  { feature: 'Bluesky / Mastodon',     tweetdeck: '❌',                     socialmate: '✅'                       },
  { feature: 'Discord / Telegram',     tweetdeck: '❌',                     socialmate: '✅'                       },
  { feature: 'Client workspaces',      tweetdeck: '❌',                     socialmate: 'Pro+: from $5/mo'        },
  { feature: 'Mobile app',             tweetdeck: 'X app only',             socialmate: '✅ Mobile-optimized web' },
]

const FAQ = [
  {
    q: 'Does TweetDeck still exist in 2026?',
    a: 'TweetDeck was rebranded to XPro and is now only available to X Premium subscribers, which starts at $8/month. It remains a powerful dashboard for managing X/Twitter activity specifically.',
  },
  {
    q: 'Can TweetDeck post to other platforms?',
    a: 'No. TweetDeck/XPro is exclusive to X/Twitter. If you manage any other social media channel — Bluesky, Mastodon, LinkedIn, Discord, Telegram — you need a separate tool.',
  },
  {
    q: 'Why switch from TweetDeck to SocialMate?',
    a: 'If you\'re active on more than just X/Twitter, SocialMate lets you manage all your platforms from one dashboard. You also get AI writing tools, bulk scheduling, analytics, and a link-in-bio builder — none of which TweetDeck/XPro offers.',
  },
  {
    q: 'Is SocialMate good for X/Twitter power users?',
    a: 'Yes. SocialMate supports X/Twitter scheduling, thread support, and per-tweet quota management. The Free plan includes 50 tweets/month, Pro bumps that to 200, and Agency to 500.',
  },
  {
    q: 'What does TweetDeck do better than SocialMate?',
    a: 'TweetDeck/XPro has deep real-time X monitoring — custom columns for searches, notifications, lists, and live tweet streams. If you primarily live on X/Twitter and want a command-center feel, it\'s a solid choice for that specific use case.',
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

export default function VsTweetdeck() {
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
            🐦 TweetDeck requires an X Premium subscription — X/Twitter only
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs TweetDeck (2026)
          </h1>
          <p className="text-ink-muted max-w-2xl mx-auto text-sm leading-relaxed">
            TweetDeck (now XPro) is a powerful real-time dashboard for X/Twitter power users.
            But it only works on one platform. If you manage more than just X,
            you need a multi-platform alternative.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-edge-lit bg-raised rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-2">TweetDeck / XPro</p>
            <p className="text-3xl font-extrabold text-ink-muted mb-1">$8/month</p>
            <p className="text-xs text-ink-muted">X Premium required · X/Twitter only</p>
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
              <span className="text-xs font-bold text-ink-body uppercase tracking-wide text-center">TweetDeck</span>
              <span className="text-xs font-bold text-ink-high uppercase tracking-wide text-center">SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-edge border-edge last:border-0 ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="text-xs font-semibold text-ink-body">{row.feature}</span>
                <span className="text-xs text-ink-muted text-center">{row.tweetdeck}</span>
                <span className="text-xs font-bold text-ink-high text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        <div className="mb-12 bg-raised rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 text-ink-high">The honest take</h2>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            TweetDeck/XPro is genuinely great if X/Twitter is your primary channel. The multi-column interface, real-time streams, and list management are best-in-class for monitoring X conversations.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            But the modern creator rarely lives on just one platform. If you also post to Bluesky, Mastodon, Discord, Telegram — or any of the 7 platforms SocialMate supports — you'll be juggling tools. That's where SocialMate wins: one dashboard for everything.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            And SocialMate is free. TweetDeck now costs $8/month just to access.
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
