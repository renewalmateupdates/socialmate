import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Buffer (2026) — Full Comparison',
  description: 'Buffer removed their free plan. SocialMate supports 16 platforms with 12 AI tools and a genuine free tier. See the full comparison.',
  openGraph: {
    title:       'SocialMate vs Buffer (2026)',
    description: 'Buffer removed their free plan and charges per channel. SocialMate offers more features at $0/month.',
    url:         'https://socialmate.studio/vs/buffer',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/buffer' },
}

const COMPARISON = [
  { feature: 'Starting price',         buffer: '$6/channel/month',  socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              buffer: '❌ Removed',         socialmate: '✅ Genuinely free'        },
  { feature: 'Pricing model',          buffer: 'Per channel',        socialmate: 'Flat rate'                },
  { feature: 'Platforms supported',    buffer: '8–10',               socialmate: '16 (growing)'            },
  { feature: 'Posts per month (free)', buffer: '10 per channel',     socialmate: 'Unlimited'               },
  { feature: 'Team seats (free)',      buffer: '1',                  socialmate: '2'                       },
  { feature: 'AI writing tools',       buffer: '1 (AI Assistant)',   socialmate: '12 tools included'       },
  { feature: 'AI credits',            buffer: 'Paid add-on',        socialmate: '75/month free'            },
  { feature: 'Bulk scheduling',        buffer: 'Paid plans only',    socialmate: '✅ Free'                  },
  { feature: 'Link in bio',            buffer: 'Separate product',   socialmate: '✅ Built in, free'        },
  { feature: 'Competitor tracking',    buffer: '❌',                  socialmate: '✅ Free (3 accounts)'    },
  { feature: 'Evergreen recycling',    buffer: 'Paid add-on',        socialmate: '✅ Free'                  },
  { feature: 'RSS import',             buffer: '❌',                  socialmate: '✅ Free'                  },
  { feature: 'Client workspaces',      buffer: 'Not available',      socialmate: 'Pro+: from $5/mo'        },
  { feature: 'Hashtag manager',        buffer: '❌',                  socialmate: '✅ Free'                  },
  { feature: 'Analytics',             buffer: 'Basic (free)',        socialmate: '30-day history (free)'   },
  { feature: 'Bluesky support',        buffer: '✅',                  socialmate: '✅'                       },
  { feature: 'Mastodon support',       buffer: '❌',                  socialmate: '✅'                       },
  { feature: 'Discord support',        buffer: '❌',                  socialmate: '✅'                       },
  { feature: 'Telegram support',       buffer: '❌',                  socialmate: '✅'                       },
]

const FAQ = [
  {
    q: 'Why did Buffer remove their free plan?',
    a: 'Buffer moved to a paid-only model in 2023, citing the need for sustainable revenue. Their cheapest plan starts at $6/month per channel, which adds up quickly for anyone managing multiple platforms.',
  },
  {
    q: 'How is SocialMate able to offer a free plan?',
    a: 'SocialMate\'s free tier is subsidized by Pro ($5/month) and Agency ($20/month) subscribers. The freemium model works because it drives enough paid conversions to fund operations without charging free users.',
  },
  {
    q: 'Is SocialMate missing any Buffer features?',
    a: 'Buffer has been building their product for over a decade and has deep integrations, mobile apps, and a polished UX. SocialMate is newer and growing. For individual creators and small businesses, SocialMate covers everything that matters. For large teams with complex workflows, evaluate both.',
  },
  {
    q: 'Can I migrate from Buffer to SocialMate?',
    a: 'Yes. Connect your social accounts to SocialMate, import your draft content, and set up your posting schedule. SocialMate\'s Bulk Scheduler can help you batch-schedule a month of content at once.',
  },
  {
    q: 'What about Buffer\'s team features?',
    a: 'SocialMate includes team collaboration on the free plan (2 seats), content approval workflows, and client workspaces on Pro+. For most teams, SocialMate\'s team features cover the same ground.',
  },
]

export default function VsBuffer() {
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

        {/* HERO */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-4 py-2 rounded-full mb-6">
            ⚠️ Buffer removed their free plan in 2023
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-gray-100">
            SocialMate vs Buffer (2026)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            Buffer was the go-to free social media scheduler for years. Then they removed the free plan,
            switched to per-channel pricing, and left individual creators and small businesses looking for an alternative.
            Here's how SocialMate compares.
          </p>
        </div>

        {/* PRICE CALLOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-red-200 bg-red-50 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Buffer</p>
            <p className="text-3xl font-extrabold text-red-600 mb-1">$6/channel/mo</p>
            <p className="text-xs text-red-400">10 channels = $60/month · No free plan</p>
          </div>
          <div className="border-2 border-green-200 bg-green-50 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">SocialMate</p>
            <p className="text-3xl font-extrabold text-green-700 mb-1">$0/month</p>
            <p className="text-xs text-green-600">All 16 platforms · Unlimited posts · 12 AI tools</p>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-gray-100">Feature comparison</h2>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 px-5 py-3">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wide">Feature</span>
              <span className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wide text-center">Buffer</span>
              <span className="text-xs font-bold text-black dark:text-gray-100 uppercase tracking-wide text-center">SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-gray-50 dark:border-gray-700 last:border-0 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-750'}`}>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{row.feature}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 text-center">{row.buffer}</span>
                <span className="text-xs font-bold text-black dark:text-gray-100 text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5 REASONS */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-gray-100">5 reasons to switch from Buffer to SocialMate</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'No per-channel fees',
                desc: 'Buffer charges $6/month for every social account you connect. SocialMate charges nothing for platform connections. Managing 10 platforms on Buffer costs $60/month. On SocialMate, it\'s $0.',
              },
              {
                n: '2',
                title: '12 AI tools vs 1',
                desc: 'Buffer includes a basic AI Assistant. SocialMate includes 12 AI tools: caption generation, hashtag sets, viral hooks, post rewriting, thread generation, content repurposing, post scoring, trend analysis, competitive intelligence, and more.',
              },
              {
                n: '3',
                title: 'More platforms, including ones Buffer doesn\'t support',
                desc: 'SocialMate supports Discord, Telegram, and Mastodon — platforms where communities are actively growing. Buffer doesn\'t support them. If your audience is on decentralized or niche platforms, SocialMate is the only option.',
              },
              {
                n: '4',
                title: 'Link in bio included',
                desc: 'Buffer has a separate link in bio product (Start Page) that works differently from their main scheduling tool. SocialMate includes a full bio link page builder on every plan, including free.',
              },
              {
                n: '5',
                title: 'Evergreen recycling, RSS import, hashtag manager — all free',
                desc: 'These are features Buffer either doesn\'t have or locks behind paid plans. On SocialMate, they\'re included on the free tier.',
              },
            ].map((r, i) => (
              <div key={i} className="flex gap-4 p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0">{r.n}</div>
                <div>
                  <p className="text-sm font-extrabold mb-1 dark:text-gray-100">{r.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
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

        {/* CTA */}
        <div className="bg-black text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Ready to switch from Buffer?</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            Create your free account in 60 seconds. All 16 platforms, 12 AI tools, unlimited posts — no credit card required.
          </p>
          <Link href="/signup"
            className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            Create free account →
          </Link>
          <p className="text-gray-600 text-xs mt-3">No card required · Free forever</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="font-bold text-sm tracking-tight dark:text-gray-100">SocialMate</span>
          </Link>
          <div className="flex items-center gap-6 text-xs text-gray-400 dark:text-gray-500">
            <Link href="/pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
            <Link href="/vs/hootsuite" className="hover:text-black dark:hover:text-white transition-colors">vs Hootsuite</Link>
            <Link href="/vs/later" className="hover:text-black dark:hover:text-white transition-colors">vs Later</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
