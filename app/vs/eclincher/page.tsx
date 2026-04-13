import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs eClincher (2026) — Full Comparison',
  description: 'eClincher starts at $65/month. SocialMate starts at $0. Compare features, pricing, and platforms side by side.',
  openGraph: {
    title:       'SocialMate vs eClincher (2026)',
    description: 'eClincher charges $65–$425/month. SocialMate is free with 16 platforms and 12 AI tools.',
    url:         'https://socialmate.studio/vs/eclincher',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/eclincher' },
}

const COMPARISON = [
  { feature: 'Starting price',         eclincher: '$65/month',              socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              eclincher: '14-day trial only',      socialmate: '✅ Genuinely free'        },
  { feature: 'Platforms supported',    eclincher: '10+ (paid)',              socialmate: '16 (free)'               },
  { feature: 'Team seats',             eclincher: '1 user on Basic',        socialmate: '2 seats free'            },
  { feature: 'AI writing tools',       eclincher: 'AI Assist (paid)',       socialmate: '12 tools free'           },
  { feature: 'Bulk scheduling',        eclincher: '✅ All plans',           socialmate: '✅ Free'                  },
  { feature: 'Link in bio',            eclincher: '❌',                     socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',    eclincher: 'Premier+ only',          socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',    eclincher: '✅ Auto post queues',    socialmate: '✅ Free'                  },
  { feature: 'RSS import',             eclincher: '✅',                     socialmate: '✅ Free'                  },
  { feature: 'Unified inbox',          eclincher: '✅ All plans',           socialmate: '🔜 Coming soon'          },
  { feature: 'Analytics',             eclincher: 'Basic (paid)',           socialmate: '✅ Free'                  },
  { feature: 'Bluesky / Mastodon',     eclincher: '❌',                     socialmate: '✅'                       },
  { feature: 'Discord / Telegram',     eclincher: '❌',                     socialmate: '✅'                       },
  { feature: 'Client workspaces',      eclincher: 'Agency plan ($425/mo)', socialmate: 'Pro+: from $5/mo'        },
  { feature: 'White label',            eclincher: 'Agency plan only',       socialmate: '$20/mo add-on'           },
]

const FAQ = [
  {
    q: 'What does eClincher cost in 2026?',
    a: 'eClincher\'s Basic plan starts at $65/month for 1 user and 10 social profiles. The Premier plan is $175/month, and the Agency plan is $425/month. There is no free plan — only a 14-day trial.',
  },
  {
    q: 'What does eClincher have that SocialMate doesn\'t?',
    a: 'eClincher has a robust unified social inbox and a longer track record with enterprise clients. If real-time DM management across multiple platforms is your primary need, eClincher\'s inbox features are more mature.',
  },
  {
    q: 'Does SocialMate support auto queues like eClincher?',
    a: 'Yes — SocialMate includes evergreen recycling which re-queues your best-performing posts automatically. This covers the core use case of eClincher\'s auto-post queue feature.',
  },
  {
    q: 'Is eClincher good for agencies?',
    a: 'eClincher has an agency plan with white label and client management. However, at $425/month it\'s a significant commitment. SocialMate\'s Agency plan is $20/month with client workspaces, and white label starts at $20/month as an add-on.',
  },
  {
    q: 'Why is SocialMate so much cheaper than eClincher?',
    a: 'SocialMate is bootstrapped with lean infrastructure. We don\'t have enterprise sales teams or heavy overhead. We pass those savings to users — which is why the free tier is genuinely usable, not a bait-and-switch.',
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

export default function VsEclincher() {
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
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-4 py-2 rounded-full mb-6">
            💸 eClincher starts at $65/month — no free plan
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-gray-100">
            SocialMate vs eClincher (2026)
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            eClincher is a well-established social media management platform with solid
            auto-post queue and inbox features. But at $65/month to start with no free plan,
            it&#39;s a steep entry point for independent creators and small teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-orange-200 bg-orange-50 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">eClincher</p>
            <p className="text-3xl font-extrabold text-orange-600 mb-1">$65/month</p>
            <p className="text-xs text-orange-400">1 user · 10 profiles · No free plan</p>
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
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">eClincher</span>
              <span className="text-xs font-bold text-black dark:text-gray-100 uppercase tracking-wide text-center">SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-gray-50 dark:border-gray-700 last:border-0 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-750'}`}>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{row.feature}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 text-center">{row.eclincher}</span>
                <span className="text-xs font-bold text-black dark:text-gray-100 text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 dark:text-gray-100">The honest take</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            eClincher is a serious tool with a strong feature set. Their unified inbox and auto-post queues are genuinely well-built, and the platform has been around long enough to have worked out most bugs.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            But $65/month just to get started — with no free tier — is a hard sell when SocialMate covers scheduling, AI writing, analytics, evergreen recycling, and link in bio at $0. For solo creators and growing teams, the value math doesn&#39;t work in eClincher&#39;s favor.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            If you&#39;re an enterprise-level agency needing deep inbox management and are already paying $400+/month for social tools, eClincher may fit. For everyone else, SocialMate gets you there for free.
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
            <Link href="/vs/hootsuite" className="hover:text-black dark:hover:text-white transition-colors">vs Hootsuite</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
