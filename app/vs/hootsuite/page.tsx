import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Hootsuite (2026) — Full Comparison',
  description: 'Hootsuite starts at $99/month. SocialMate starts at $0. See the full feature comparison and decide for yourself.',
  openGraph: {
    title:       'SocialMate vs Hootsuite (2026)',
    description: 'Hootsuite charges $99–$249+/month. SocialMate is free with 16 platforms and 12 AI tools.',
    url:         'https://socialmate.studio/vs/hootsuite',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/hootsuite' },
}

const COMPARISON = [
  { feature: 'Starting price',         hootsuite: '$99/month',            socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              hootsuite: '❌ No free plan',       socialmate: '✅ Genuinely free'        },
  { feature: 'Posts per month (free)', hootsuite: '—',                     socialmate: 'Unlimited'                },
  { feature: 'Platforms',              hootsuite: '20+ (paid)',            socialmate: '16 (free)'               },
  { feature: 'Team seats',             hootsuite: '1 user on Standard',   socialmate: '2 seats free'            },
  { feature: 'AI writing tools',       hootsuite: 'OwlyWriter AI (paid)', socialmate: '12 tools free'           },
  { feature: 'AI credits',            hootsuite: 'Limited/paid',         socialmate: '75/month free'            },
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

export default function VsHootsuite() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight dark:text-gray-100">SocialMate</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Features',  href: '/features'  },
              { label: 'Pricing',   href: '/pricing'   },
              { label: 'Roadmap',   href: '/roadmap'   },
              { label: 'vs Buffer', href: '/vs/buffer' },
            ].map(l => (
              <Link key={l.label} href={l.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all hidden sm:block">Sign in</Link>
            <Link href="/signup" className="bg-black text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
              Get started free →
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">

        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-4 py-2 rounded-full mb-6">
            💸 Hootsuite starts at $99/month — no free plan
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-gray-100">
            SocialMate vs Hootsuite (2026)
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            Hootsuite is the market leader in enterprise social media management.
            They're also one of the most expensive tools in the category.
            Here's what you actually need to know before deciding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-orange-200 bg-orange-50 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">Hootsuite</p>
            <p className="text-3xl font-extrabold text-orange-600 mb-1">$99/month</p>
            <p className="text-xs text-orange-400">1 user · 10 accounts · No free plan</p>
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
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Hootsuite</span>
              <span className="text-xs font-bold text-black dark:text-gray-100 uppercase tracking-wide text-center">SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-gray-50 dark:border-gray-700 last:border-0 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-750'}`}>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{row.feature}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 text-center">{row.hootsuite}</span>
                <span className="text-xs font-bold text-black dark:text-gray-100 text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 dark:text-gray-100">The honest take</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Hootsuite is a powerful product. If you're running social media for a large organization with compliance requirements, Salesforce integration needs, and a team of 20+ — Hootsuite is a legitimate choice at their price point.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            For everyone else — individual creators, small businesses, startups, lean agencies — you're paying for infrastructure you don't need. SocialMate covers scheduling, AI tools, analytics, team collaboration, link in bio, and competitor tracking at $0/month to start.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            The $99/month Hootsuite charges for its entry plan would cover 19 months of SocialMate's Pro plan, or 59 months free.
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
            <Link href="/vs/buffer" className="hover:text-black dark:hover:text-white transition-colors">vs Buffer</Link>
            <Link href="/vs/later" className="hover:text-black dark:hover:text-white transition-colors">vs Later</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
