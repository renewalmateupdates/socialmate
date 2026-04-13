import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Typefully (2026) — Full Comparison',
  description: 'Typefully starts at $12.50/month and focuses on X/Twitter threads and LinkedIn. SocialMate starts at $0 with 16 platforms and 12 AI tools.',
  openGraph: {
    title:       'SocialMate vs Typefully (2026)',
    description: 'Typefully charges $12.50–$29/month and is thread-focused. SocialMate is free with 16 platforms and 12 AI tools.',
    url:         'https://socialmate.studio/vs/typefully',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/typefully' },
}

const COMPARISON = [
  { feature: 'Starting price',         typefully: '$12.50/month',           socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              typefully: 'Limited free plan',      socialmate: '✅ Genuinely free'        },
  { feature: 'Platforms supported',    typefully: 'X/Twitter, LinkedIn',    socialmate: '16 (free)'               },
  { feature: 'Thread editor',          typefully: '✅ Best-in-class',       socialmate: '✅ Free'                  },
  { feature: 'Team seats',             typefully: '1 on Creator',           socialmate: '2 seats free'            },
  { feature: 'AI writing tools',       typefully: 'AI assist (paid)',       socialmate: '12 tools free'           },
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

export default function VsTypefully() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
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
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-4 py-2 rounded-full mb-6">
            ✍️ Typefully is a thread-first editor — SocialMate covers 16 platforms for free
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-gray-100">
            SocialMate vs Typefully (2026)
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            Typefully is beloved by X/Twitter writers for its focused, distraction-free thread editor.
            It&#39;s a beautiful product for a specific use case. But if you need multi-platform support,
            AI tools, and a genuinely free plan — SocialMate is the complete package.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-indigo-200 bg-indigo-50 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Typefully</p>
            <p className="text-3xl font-extrabold text-indigo-600 mb-1">$12.50/month</p>
            <p className="text-xs text-indigo-400">X/Twitter + LinkedIn · Limited free plan</p>
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
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Typefully</span>
              <span className="text-xs font-bold text-black dark:text-gray-100 uppercase tracking-wide text-center">SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-gray-50 dark:border-gray-700 last:border-0 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-750'}`}>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{row.feature}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 text-center">{row.typefully}</span>
                <span className="text-xs font-bold text-black dark:text-gray-100 text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 dark:text-gray-100">The honest take</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Typefully has one of the cleanest thread-writing experiences available. If you write multiple threads per week on X/Twitter and want a focused, distraction-free editor with great thread previews — Typefully genuinely excels at that.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            The limitation is scope. Typefully doesn&#39;t cover Bluesky, Mastodon, Discord, Telegram, or any of the 14+ other platforms that SocialMate supports. There are also no bulk scheduling, competitor tracking, hashtag manager, or RSS import features.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            SocialMate is the better choice for creators who post across multiple channels or want AI tools built in. Typefully wins if X/Twitter thread writing is your singular focus and you want the best possible editor for that one workflow.
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
            <Link href="/vs/hypefury" className="hover:text-black dark:hover:text-white transition-colors">vs Hypefury</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
