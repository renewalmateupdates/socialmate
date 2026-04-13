import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Hypefury (2026) — Full Comparison',
  description: 'Hypefury starts at $19/month and focuses on X/Twitter and LinkedIn. SocialMate starts at $0 with 16 platforms. See the full comparison.',
  openGraph: {
    title:       'SocialMate vs Hypefury (2026)',
    description: 'Hypefury charges $19–$49/month and is X/Twitter-focused. SocialMate is free with 16 platforms and 12 AI tools.',
    url:         'https://socialmate.studio/vs/hypefury',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/hypefury' },
}

const COMPARISON = [
  { feature: 'Starting price',         hypefury: '$19/month',               socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              hypefury: '7-day trial only',        socialmate: '✅ Genuinely free'        },
  { feature: 'Platforms supported',    hypefury: 'X, LinkedIn, Instagram',  socialmate: '16 (free)'               },
  { feature: 'X/Twitter threads',      hypefury: '✅ Core feature',         socialmate: '✅ Free'                  },
  { feature: 'Team seats',             hypefury: '1 on Standard',           socialmate: '2 seats free'            },
  { feature: 'AI writing tools',       hypefury: 'AI ghostwriter (paid)',   socialmate: '12 tools free'           },
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
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight text-gray-900 dark:text-gray-100">
              SocialMate
              <span className="text-[10px] font-semibold bg-pink-500 text-white px-1.5 py-0.5 rounded-full align-super ml-1">Beta</span>
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
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <Link href="/give" className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition-all">❤️ Give</Link>
            <Link href="/partners" className="text-sm font-semibold text-amber-500 hover:text-amber-400 transition-all">Partners</Link>
            <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-all">Sign in</Link>
            <Link href="/signup" className="bg-black dark:bg-white text-white dark:text-black text-sm font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
              Get started free →
            </Link>
          </div>
          <div className="flex md:hidden items-center gap-2">
            <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-all px-2 py-1">Sign in</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">

        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold px-4 py-2 rounded-full mb-6">
            🐦 Hypefury is built for X/Twitter — SocialMate covers 16 platforms for free
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-gray-100">
            SocialMate vs Hypefury (2026)
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            Hypefury is a popular X/Twitter growth tool for personal brands and ghostwriters.
            If X is your only platform, it&#39;s a reasonable choice. But for creators building
            presence across multiple channels, SocialMate offers far more — for free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-sky-200 bg-sky-50 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-2">Hypefury</p>
            <p className="text-3xl font-extrabold text-sky-600 mb-1">$19/month</p>
            <p className="text-xs text-sky-400">X/Twitter focused · No free plan</p>
          </div>
          <div className="border-2 border-green-200 bg-green-50 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">SocialMate</p>
            <p className="text-3xl font-extrabold text-green-700 mb-1">$0/month</p>
            <p className="text-xs text-green-600">16 platforms · 12 AI tools · Free forever</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-gray-100">Feature comparison</h2>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 px-5 py-3">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wide">Feature</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Hypefury</span>
              <span className="text-xs font-bold text-black dark:text-gray-100 uppercase tracking-wide text-center">SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-gray-50 dark:border-gray-700 last:border-0 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-750'}`}>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{row.feature}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 text-center">{row.hypefury}</span>
                <span className="text-xs font-bold text-black dark:text-gray-100 text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 dark:text-gray-100">The honest take</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Hypefury is a well-designed tool for X/Twitter-first creators. If you&#39;re building a personal brand on X and want features like auto-retweet and a ghostwriter-friendly interface, it&#39;s optimized for exactly that workflow.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            But X/Twitter is increasingly one channel among many. Most creators today need to be on Bluesky, Mastodon, Discord, and other platforms as audiences diversify. Hypefury doesn&#39;t support those.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            SocialMate covers X/Twitter (threads, scheduling, quota management) plus 15 other platforms, 12 AI tools, and competitor tracking — for free. If you&#39;re paying $19/month for Hypefury and also managing other platforms, SocialMate consolidates everything.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-gray-100">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQ.map((faq, i) => (
              <div key={i} className="p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl">
                <p className="text-sm font-extrabold mb-2 dark:text-gray-100">{faq.q}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3 dark:text-gray-100">Start for free today</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            16 platforms, 12 AI tools, unlimited posts, link in bio, competitor tracking — all free. No card required.
          </p>
          <Link href="/signup"
            className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            Create free account →
          </Link>
        </div>
      </div>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="font-bold text-sm tracking-tight dark:text-gray-100">SocialMate</span>
          </Link>
          <div className="flex items-center gap-6 text-xs text-gray-400 dark:text-gray-500">
            <Link href="/pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
            <Link href="/vs/tweetdeck" className="hover:text-black dark:hover:text-white transition-colors">vs TweetDeck</Link>
            <Link href="/vs/buffer" className="hover:text-black dark:hover:text-white transition-colors">vs Buffer</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
