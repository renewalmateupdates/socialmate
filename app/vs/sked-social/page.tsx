import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Sked Social (2026) — Full Comparison',
  description: 'Sked Social starts at $25/month. SocialMate starts at $0. Compare features, platforms, and pricing for social media scheduling.',
  openGraph: {
    title:       'SocialMate vs Sked Social (2026)',
    description: 'Sked Social charges $25–$135+/month. SocialMate is free with 16 platforms and 12 AI tools.',
    url:         'https://socialmate.studio/vs/sked-social',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/sked-social' },
}

const COMPARISON = [
  { feature: 'Starting price',         skedsocial: '$25/month',              socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              skedsocial: '7-day trial only',       socialmate: '✅ Genuinely free'        },
  { feature: 'Platforms supported',    skedsocial: '8 (Instagram-focused)',  socialmate: '16 (free)'               },
  { feature: 'Team seats',             skedsocial: '1 on Fundamentals',      socialmate: '2 seats free'            },
  { feature: 'AI writing tools',       skedsocial: 'AI Assist (paid)',       socialmate: '12 tools free'           },
  { feature: 'Instagram Stories',      skedsocial: '✅',                     socialmate: '🔜 Coming soon'          },
  { feature: 'Visual content calendar',skedsocial: '✅',                     socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',        skedsocial: '✅ (paid)',              socialmate: '✅ Free'                  },
  { feature: 'Link in bio',            skedsocial: '✅ (paid)',              socialmate: '✅ Free'                  },
  { feature: 'Analytics',             skedsocial: 'Essential+ plan',        socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',    skedsocial: '❌',                     socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',    skedsocial: '❌',                     socialmate: '✅ Free'                  },
  { feature: 'RSS import',             skedsocial: '❌',                     socialmate: '✅ Free'                  },
  { feature: 'Bluesky / Mastodon',     skedsocial: '❌',                     socialmate: '✅'                       },
  { feature: 'Discord / Telegram',     skedsocial: '❌',                     socialmate: '✅'                       },
  { feature: 'Client workspaces',      skedsocial: 'Agency plan only',       socialmate: 'Pro+: from $5/mo'        },
]

const FAQ = [
  {
    q: 'What does Sked Social cost in 2026?',
    a: 'Sked Social\'s Fundamentals plan starts at $25/month for 1 user and up to 6 social profiles. The Essential plan is $75/month and the Professional plan is $135/month. There is no free plan, only a 7-day trial.',
  },
  {
    q: 'What is Sked Social best known for?',
    a: 'Sked Social is popular with Instagram-focused creators and agencies. Their auto-publish for Instagram Stories and drag-and-drop visual calendar are well-regarded. They also have solid collaboration tools for agency workflows.',
  },
  {
    q: 'How does Sked Social compare for agencies?',
    a: 'Sked Social\'s agency plan has collaboration features and client management, but the pricing is significantly higher than SocialMate. SocialMate\'s Agency plan at $20/month covers client workspaces and 15 team seats — a fraction of Sked\'s comparable tier.',
  },
  {
    q: 'Does SocialMate support Instagram?',
    a: 'Instagram is on SocialMate\'s near-term roadmap. In the meantime, SocialMate covers 16 platforms including Bluesky, Discord, Telegram, Mastodon, and X/Twitter, with Instagram coming soon.',
  },
  {
    q: 'What does SocialMate offer that Sked doesn\'t?',
    a: 'SocialMate includes 12 AI writing tools, competitor tracking, hashtag collections, evergreen recycling, and RSS import — all for free. Sked Social charges for analytics, doesn\'t offer AI writing tools on base plans, and has no evergreen recycling.',
  },
]

export default function VsSkedSocial() {
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
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-4 py-2 rounded-full mb-6">
            💸 Sked Social starts at $25/month — no free plan
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-gray-100">
            SocialMate vs Sked Social (2026)
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            Sked Social is a capable scheduling platform popular with Instagram-focused agencies.
            It&#39;s polished and reliable. But the pricing climbs steeply, and platform breadth is limited.
            Here&#39;s how it compares to SocialMate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-orange-200 bg-orange-50 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">Sked Social</p>
            <p className="text-3xl font-extrabold text-orange-600 mb-1">$25/month</p>
            <p className="text-xs text-orange-400">1 user · 6 profiles · No free plan</p>
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
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Sked Social</span>
              <span className="text-xs font-bold text-black dark:text-gray-100 uppercase tracking-wide text-center">SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-gray-50 dark:border-gray-700 last:border-0 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-750'}`}>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{row.feature}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 text-center">{row.skedsocial}</span>
                <span className="text-xs font-bold text-black dark:text-gray-100 text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 dark:text-gray-100">The honest take</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Sked Social is a solid tool for agencies that live in Instagram and need auto-publish for Stories. The collaboration features are genuinely well-built for small agency teams.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            The problem is depth vs. breadth. Sked Social is deep on Instagram workflows but narrow on platform support and feature set relative to its price. SocialMate ships AI tools, competitor tracking, evergreen recycling, and 16-platform support — for free.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            For most creators and small agencies, SocialMate is the better value. If Instagram is literally your only platform and you need Story auto-publish today, Sked Social is worth a trial while Instagram support lands in SocialMate.
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
            <Link href="/vs/later" className="hover:text-black dark:hover:text-white transition-colors">vs Later</Link>
            <Link href="/vs/pallyy" className="hover:text-black dark:hover:text-white transition-colors">vs Pallyy</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
