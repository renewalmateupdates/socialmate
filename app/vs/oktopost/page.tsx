import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Oktopost (2026) — Full Comparison',
  description: 'Oktopost is an enterprise B2B platform starting at $500+/month. SocialMate starts at $0. See the full feature comparison.',
  openGraph: {
    title:       'SocialMate vs Oktopost (2026)',
    description: 'Oktopost is built for enterprise B2B teams with a $500+/month price tag. SocialMate is free with 16 platforms and 12 AI tools.',
    url:         'https://socialmate.studio/vs/oktopost',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/oktopost' },
}

const COMPARISON = [
  { feature: 'Starting price',         oktopost: '$500+/month (enterprise)', socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              oktopost: '❌ No free plan',           socialmate: '✅ Genuinely free'        },
  { feature: 'Target audience',        oktopost: 'Enterprise B2B teams',     socialmate: 'Creators, SMBs, agencies' },
  { feature: 'Platforms supported',    oktopost: 'LinkedIn-focused',         socialmate: '16 platforms'            },
  { feature: 'Team seats',             oktopost: 'Unlimited (enterprise)',   socialmate: '2 seats free'            },
  { feature: 'AI writing tools',       oktopost: 'Limited',                  socialmate: '12 tools free'           },
  { feature: 'Employee advocacy',      oktopost: '✅ Core feature',          socialmate: '❌'                       },
  { feature: 'B2B analytics',          oktopost: '✅ Deep attribution',      socialmate: 'Basic analytics free'    },
  { feature: 'Bulk scheduling',        oktopost: '✅',                       socialmate: '✅ Free'                  },
  { feature: 'Link in bio',            oktopost: '❌',                       socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',    oktopost: '❌',                       socialmate: '✅ Free'                  },
  { feature: 'RSS import',             oktopost: '✅',                       socialmate: '✅ Free'                  },
  { feature: 'Bluesky / Mastodon',     oktopost: '❌',                       socialmate: '✅'                       },
  { feature: 'Discord / Telegram',     oktopost: '❌',                       socialmate: '✅'                       },
  { feature: 'Client workspaces',      oktopost: 'Enterprise only',          socialmate: 'Pro+: from $5/mo'        },
  { feature: 'Salesforce integration', oktopost: '✅',                       socialmate: '❌'                       },
]

const FAQ = [
  {
    q: 'What is Oktopost and who is it for?',
    a: 'Oktopost is an enterprise B2B social media management platform with a strong focus on employee advocacy and LinkedIn marketing. It\'s designed for large organizations with dedicated social media teams and starts around $500/month or more.',
  },
  {
    q: 'Should creators and small businesses use Oktopost?',
    a: 'No — Oktopost is explicitly built for enterprise B2B companies. The pricing, feature set, and onboarding are all tuned for large teams. Creators, freelancers, and small businesses would find SocialMate a much better fit.',
  },
  {
    q: 'Does SocialMate support LinkedIn?',
    a: 'LinkedIn support is on SocialMate\'s roadmap and coming soon. In the meantime, SocialMate covers 16 platforms including Bluesky, Discord, Telegram, Mastodon, and X/Twitter — all channels most B2B creators are building on in 2026.',
  },
  {
    q: 'What does Oktopost do better than SocialMate?',
    a: 'Oktopost has deep employee advocacy features — turning your entire company\'s employees into brand amplifiers on LinkedIn. This is a genuine enterprise use case that SocialMate doesn\'t cover. If that\'s your primary need, Oktopost is purpose-built for it.',
  },
  {
    q: 'Why is there such a large price difference?',
    a: 'Oktopost targets enterprise buyers who pay per seat with full procurement processes. SocialMate is bootstrapped and targets individual creators through agencies — completely different markets. The price difference reflects this.',
  },
]

export default function VsOktopost() {
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
            🏢 Oktopost is enterprise-only — $500+/month, no free plan
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-gray-100">
            SocialMate vs Oktopost (2026)
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            Oktopost is an enterprise B2B social platform built around employee advocacy and LinkedIn.
            If you&#39;re a creator, small business, or lean agency, this comparison will quickly show
            why Oktopost probably isn&#39;t the right fit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-orange-200 bg-orange-50 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">Oktopost</p>
            <p className="text-3xl font-extrabold text-orange-600 mb-1">$500+/month</p>
            <p className="text-xs text-orange-400">Enterprise only · No free plan · Quote-based</p>
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
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Oktopost</span>
              <span className="text-xs font-bold text-black dark:text-gray-100 uppercase tracking-wide text-center">SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-gray-50 dark:border-gray-700 last:border-0 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-750'}`}>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{row.feature}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 text-center">{row.oktopost}</span>
                <span className="text-xs font-bold text-black dark:text-gray-100 text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 dark:text-gray-100">The honest take</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Oktopost and SocialMate are not really competing for the same customers. Oktopost is a specialized enterprise tool for large B2B organizations running structured employee advocacy programs on LinkedIn. It solves a real problem — getting employees to amplify brand content — and it does it well.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            SocialMate targets creators, small businesses, and lean agencies who need to publish great content across multiple platforms without spending a fortune.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            If you searched &#34;Oktopost alternative&#34; because $500/month felt steep, SocialMate is the answer. Start free and scale to $20/month for an Agency account.
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
            <Link href="/vs/sprout-social" className="hover:text-black dark:hover:text-white transition-colors">vs Sprout Social</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
