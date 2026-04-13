import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Postcron (2026) — Full Comparison',
  description: 'Postcron starts at $8/month for basic scheduling. SocialMate starts at $0 with 16 platforms and 12 AI tools. See the full comparison.',
  openGraph: {
    title:       'SocialMate vs Postcron (2026)',
    description: 'Postcron charges $8–$79/month. SocialMate is free with 16 platforms and 12 AI tools.',
    url:         'https://socialmate.studio/vs/postcron',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/postcron' },
}

const COMPARISON = [
  { feature: 'Starting price',         postcron: '$8/month',                socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              postcron: '❌ No free plan',          socialmate: '✅ Genuinely free'        },
  { feature: 'Platforms supported',    postcron: '6 platforms',              socialmate: '16 (free)'               },
  { feature: 'Team seats',             postcron: 'Extra cost',               socialmate: '2 seats free'            },
  { feature: 'AI writing tools',       postcron: '❌ No AI tools',          socialmate: '12 tools free'           },
  { feature: 'Bulk scheduling',        postcron: '✅ CSV upload',           socialmate: '✅ Free'                  },
  { feature: 'Link in bio',            postcron: '❌',                      socialmate: '✅ Free'                  },
  { feature: 'Analytics',             postcron: 'Business plan only',      socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',    postcron: '❌',                      socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',    postcron: '❌',                      socialmate: '✅ Free'                  },
  { feature: 'RSS import',             postcron: '✅ (paid)',               socialmate: '✅ Free'                  },
  { feature: 'Watermark on images',    postcron: '✅ Free posts only',      socialmate: '❌ No watermarks'        },
  { feature: 'Bluesky / Mastodon',     postcron: '❌',                      socialmate: '✅'                       },
  { feature: 'Discord / Telegram',     postcron: '❌',                      socialmate: '✅'                       },
  { feature: 'Client workspaces',      postcron: 'Agency plan ($79/mo)',    socialmate: 'Pro+: from $5/mo'        },
  { feature: 'Hashtag manager',        postcron: '❌',                      socialmate: '✅ Free'                  },
]

const FAQ = [
  {
    q: 'What does Postcron cost in 2026?',
    a: 'Postcron\'s Personal plan starts at $8/month for basic scheduling. The Business plan is $29/month and includes analytics. The Agency plan is $79/month. There is no free plan, and free trial posts include a Postcron watermark on images.',
  },
  {
    q: 'Is Postcron still actively developed?',
    a: 'Postcron has been around since 2012 and remains operational, but it hasn\'t kept pace with the AI-powered features that newer tools have added. It\'s a reliable, basic scheduling tool without the modern AI tools, competitor tracking, or platform diversity of newer alternatives.',
  },
  {
    q: 'What does Postcron do that SocialMate doesn\'t?',
    a: 'Postcron has a CSV bulk upload feature for mass-scheduling posts that is straightforward and reliable. SocialMate also supports bulk scheduling with a similar interface, so this isn\'t a meaningful differentiator.',
  },
  {
    q: 'Does Postcron support modern platforms like Bluesky?',
    a: 'No — Postcron supports the traditional platforms (Facebook, Instagram, Twitter, LinkedIn, Pinterest, Google My Business) but hasn\'t added support for Bluesky, Mastodon, Discord, Telegram, or other emerging platforms. SocialMate supports 16 platforms including all of these.',
  },
  {
    q: 'Why should I switch from Postcron to SocialMate?',
    a: 'SocialMate is free, has no watermarks, supports 16 platforms (vs 6), includes 12 AI tools Postcron lacks, and ships features like competitor tracking, evergreen recycling, and hashtag collections. At every price point, SocialMate offers more.',
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

export default function VsPostcron() {
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
            💸 Postcron starts at $8/month — no free plan, no AI tools, adds watermarks
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-gray-100">
            SocialMate vs Postcron (2026)
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            Postcron is one of the older social scheduling tools on the market.
            It works, but it hasn&#39;t evolved. No AI tools. No emerging platform support.
            Watermarks on free trial posts. SocialMate ships everything Postcron has — and much more — for free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-orange-200 bg-orange-50 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">Postcron</p>
            <p className="text-3xl font-extrabold text-orange-600 mb-1">$8/month</p>
            <p className="text-xs text-orange-400">6 platforms · No AI · Watermarks on trials</p>
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
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Postcron</span>
              <span className="text-xs font-bold text-black dark:text-gray-100 uppercase tracking-wide text-center">SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-gray-50 dark:border-gray-700 last:border-0 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-750'}`}>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{row.feature}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 text-center">{row.postcron}</span>
                <span className="text-xs font-bold text-black dark:text-gray-100 text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 dark:text-gray-100">The honest take</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Postcron is functional. It schedules posts. It has CSV bulk upload. It&#39;s been doing that reliably since 2012. If all you need is basic scheduling and you&#39;re used to the interface, there&#39;s nothing wrong with it.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            But the social media landscape has moved on. AI writing tools are table stakes in 2026. Emerging platforms like Bluesky and Mastodon are where audiences are migrating. Postcron hasn&#39;t kept up — no AI, limited platforms, and no free plan.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            SocialMate is what Postcron would look like if it were built today. Everything Postcron does — and 12 AI tools, competitor tracking, evergreen recycling, hashtag collections, and 10 more platforms — for $0.
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
            <Link href="/vs/recurpost" className="hover:text-black dark:hover:text-white transition-colors">vs RecurPost</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
