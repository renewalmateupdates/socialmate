import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs Hopper HQ (2026) — Full Comparison',
  description: 'Hopper HQ starts at $19/month for 1 social set. SocialMate starts at $0. See the full feature and pricing comparison.',
  openGraph: {
    title:       'SocialMate vs Hopper HQ (2026)',
    description: 'Hopper HQ charges $19+/month per social set. SocialMate is free with 16 platforms and 12 AI tools.',
    url:         'https://socialmate.studio/vs/hopper-hq',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/hopper-hq' },
}

const COMPARISON = [
  { feature: 'Starting price',         hopperhq: '$19/month (1 social set)', socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              hopperhq: '❌ No free plan',           socialmate: '✅ Genuinely free'        },
  { feature: 'Platforms supported',    hopperhq: '8 (Instagram-focused)',    socialmate: '16 (free)'               },
  { feature: 'Instagram grid preview', hopperhq: '✅ Core feature',          socialmate: '🔜 Coming soon'          },
  { feature: 'Team seats',             hopperhq: 'Extra cost per user',      socialmate: '2 seats free'            },
  { feature: 'AI writing tools',       hopperhq: 'AI Caption (paid)',        socialmate: '12 tools free'           },
  { feature: 'Bulk scheduling',        hopperhq: '✅',                       socialmate: '✅ Free'                  },
  { feature: 'Link in bio',            hopperhq: '✅ (paid)',                 socialmate: '✅ Free'                  },
  { feature: 'Analytics',             hopperhq: '✅ (paid)',                 socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',    hopperhq: '❌',                       socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',    hopperhq: '❌',                       socialmate: '✅ Free'                  },
  { feature: 'RSS import',             hopperhq: '❌',                       socialmate: '✅ Free'                  },
  { feature: 'Bluesky / Mastodon',     hopperhq: '❌',                       socialmate: '✅'                       },
  { feature: 'Discord / Telegram',     hopperhq: '❌',                       socialmate: '✅'                       },
  { feature: 'Client workspaces',      hopperhq: 'Extra cost per client',    socialmate: 'Pro+: from $5/mo'        },
  { feature: 'Hashtag manager',        hopperhq: '❌',                       socialmate: '✅ Free'                  },
]

const FAQ = [
  {
    q: 'What does Hopper HQ cost in 2026?',
    a: 'Hopper HQ\'s pricing starts at $19/month per "social set" (one Instagram account + connected accounts). Costs add up quickly when managing multiple clients or multiple brand accounts, as each requires an additional social set.',
  },
  {
    q: 'What makes Hopper HQ unique?',
    a: 'Hopper HQ is particularly strong for Instagram-first workflows. Their visual grid preview — which shows exactly how your Instagram feed will look before you post — is a standout feature for visual brands and photographers.',
  },
  {
    q: 'Does SocialMate have an Instagram grid preview?',
    a: 'Instagram grid preview is on SocialMate\'s roadmap as Instagram support is added. Currently, SocialMate focuses on Bluesky, Mastodon, Discord, Telegram, and X/Twitter as primary scheduling platforms.',
  },
  {
    q: 'How does Hopper HQ pricing scale for agencies?',
    a: 'Hopper HQ pricing is per-social-set, which means agency costs scale significantly with each client. Managing 10 clients could mean $190+/month just for access. SocialMate\'s Agency plan at $20/month supports up to 5 client workspaces flat.',
  },
  {
    q: 'What does SocialMate offer that Hopper HQ doesn\'t?',
    a: 'SocialMate offers 12 AI writing tools, competitor tracking, hashtag collections, evergreen recycling, RSS import, and support for platforms like Bluesky, Mastodon, Discord, and Telegram — all for free. Hopper HQ is primarily focused on Instagram.',
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

export default function VsHopperHq() {
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
            💸 Hopper HQ starts at $19/month per social set — no free plan
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-gray-100">
            SocialMate vs Hopper HQ (2026)
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            Hopper HQ is an Instagram-focused scheduling tool with a clean visual grid preview.
            If your world revolves around Instagram aesthetics, it&#39;s a solid pick.
            For multi-platform creators who need more, SocialMate offers broader coverage at no cost.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-orange-200 bg-orange-50 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">Hopper HQ</p>
            <p className="text-3xl font-extrabold text-orange-600 mb-1">$19/month</p>
            <p className="text-xs text-orange-400">Per social set · No free plan · Scales per client</p>
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
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Hopper HQ</span>
              <span className="text-xs font-bold text-black dark:text-gray-100 uppercase tracking-wide text-center">SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-gray-50 dark:border-gray-700 last:border-0 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-750'}`}>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{row.feature}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 text-center">{row.hopperhq}</span>
                <span className="text-xs font-bold text-black dark:text-gray-100 text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 dark:text-gray-100">The honest take</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Hopper HQ is clean, simple, and great for Instagram-first creators who care about feed aesthetics. The grid preview is a real differentiator for visual brands.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            But the per-social-set pricing model gets expensive fast — especially for agencies managing multiple clients. And with no support for emerging platforms like Bluesky, Mastodon, or Discord, it&#39;s a limiting choice for creators building audience across channels.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            SocialMate is the better choice if you value breadth, AI tools, and a free starting point. Instagram grid preview is coming — and when it lands, SocialMate will offer everything Hopper HQ does, for less.
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

      <PublicFooter />
    </div>
  )
}
