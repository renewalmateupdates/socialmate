import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Sprinklr (2026) — Full Comparison',
  description: 'Sprinklr starts at $299/month and is enterprise-only. SocialMate is free forever with bulk scheduling, Discord/Bluesky/Telegram/Mastodon, and 12 AI tools included.',
  openGraph: {
    title:       'SocialMate vs Sprinklr (2026)',
    description: 'Sprinklr is built for enterprise at $299+/month — far too much for creators and small teams. SocialMate is free forever with no enterprise overhead.',
    url:         'https://socialmate.studio/vs/sprinklr',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/sprinklr' },
}

const COMPARISON = [
  { feature: 'Starting price',            sprinklr: '$299/month (Advanced)',         socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 sprinklr: '❌ None',                        socialmate: '✅ Free forever'         },
  { feature: 'Target audience',           sprinklr: 'Enterprise only',               socialmate: 'Creators & small teams'  },
  { feature: 'Minimum contract',          sprinklr: 'Annual (typically $3,500+/yr)', socialmate: 'No contract'             },
  { feature: 'Social accounts (starter)', sprinklr: '5 accounts',                   socialmate: 'No hard cap (free tier)' },
  { feature: 'Pricing model',             sprinklr: 'Per-seat enterprise',           socialmate: 'Flat rate'               },
  { feature: 'Discord support',           sprinklr: '❌',                             socialmate: '✅'                      },
  { feature: 'Telegram support',          sprinklr: '❌',                             socialmate: '✅'                      },
  { feature: 'Mastodon support',          sprinklr: '❌',                             socialmate: '✅'                      },
  { feature: 'Bluesky support',           sprinklr: '❌',                             socialmate: '✅'                      },
  { feature: 'AI writing tools',          sprinklr: 'Enterprise AI suite',           socialmate: '12 tools included free'  },
  { feature: 'AI credits free tier',      sprinklr: 'N/A (no free plan)',            socialmate: '75/month free'           },
  { feature: 'Bulk scheduling',           sprinklr: 'Enterprise plans',              socialmate: '✅ Free'                 },
  { feature: 'Link in bio',               sprinklr: '❌',                             socialmate: '✅ Free'                 },
  { feature: 'Hashtag manager',           sprinklr: 'Enterprise plans',              socialmate: '✅ Free'                 },
  { feature: 'Evergreen recycling',       sprinklr: 'Limited',                       socialmate: '✅ Free'                 },
  { feature: 'Competitor tracking',       sprinklr: '✅ Enterprise-grade',           socialmate: '✅ Free (3 accounts)'   },
  { feature: 'Setup complexity',          sprinklr: 'Very high (onboarding req.)',   socialmate: 'Self-serve in minutes'   },
]

const FAQ = [
  {
    q: 'Is Sprinklr worth the price for small teams?',
    a: 'Almost never. Sprinklr is designed for large enterprise marketing departments with dedicated social media teams, multi-brand governance requirements, and complex reporting needs. For a small business or solo creator, you\'d be paying $299/month (or more) for capabilities you\'ll use a fraction of. SocialMate covers the features real small teams need for free.',
  },
  {
    q: 'Does Sprinklr have a free plan or trial?',
    a: 'Sprinklr does not have a meaningful free plan for its core publishing platform. Its enterprise offering typically requires a sales call and an annual contract. SocialMate is completely free to start with no credit card required.',
  },
  {
    q: 'What platforms does SocialMate support that Sprinklr does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — community and decentralized platforms that Sprinklr does not cover. If your audience is on any of these platforms, Sprinklr simply cannot reach them.',
  },
  {
    q: 'Who should actually use Sprinklr?',
    a: 'Sprinklr makes sense for Fortune 500 companies with large in-house social media teams, complex approval workflows across multiple brands, and enterprise-grade reporting requirements. If that\'s not you, SocialMate is almost certainly a better fit — and it\'s free.',
  },
]

export default function VsSprinklrPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* NAV */}
      <nav className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="font-bold tracking-tight dark:text-white">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Log in</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all">Start free →</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* HERO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 mb-4">
            Updated April 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-white">
            SocialMate vs Sprinklr
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Sprinklr is enterprise-only and starts at $299/month — completely overkill for creators, small businesses, and independent teams. SocialMate is free forever.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-black text-white font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
              Try SocialMate free →
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-gray-200 dark:border-gray-700 font-semibold rounded-2xl hover:border-gray-400 transition-all text-sm dark:text-gray-200">
              See pricing
            </Link>
          </div>
        </div>

        {/* VERDICT BANNER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Sprinklr</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Enterprise powerhouse, priced to match</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Enterprise-grade social listening</li>
              <li>✅ Unified customer experience platform</li>
              <li>❌ No free plan — $299/month minimum</li>
              <li>❌ Requires annual contract</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Complex onboarding, not self-serve</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">All platforms. All tools. $0.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Free forever — no trial countdown</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Bulk scheduling free</li>
              <li>✅ No contract or onboarding required</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Feature comparison</h2>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span>Feature</span>
              <span>Sprinklr</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.sprinklr}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over Sprinklr</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '$299/month is enterprise pricing for non-enterprise needs',
                desc: 'Sprinklr\'s pricing is designed for large companies with dedicated social teams and complex governance requirements. A creator posting across four platforms or a small business managing two brands doesn\'t need — and can\'t justify — that level of investment. SocialMate delivers the scheduling and AI tools you actually need for free.',
              },
              {
                n: '2',
                title: 'Sprinklr requires onboarding — SocialMate is self-serve',
                desc: 'Getting started with Sprinklr involves a sales call, onboarding sessions, and often a dedicated customer success manager. That\'s months before you\'re fully set up. SocialMate takes minutes to set up and you can start scheduling posts the same day.',
              },
              {
                n: '3',
                title: 'Sprinklr misses the platforms where communities actually live',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not supported by Sprinklr. If your audience is in Discord servers, Telegram groups, or on decentralized networks, Sprinklr offers zero help. SocialMate covers all of these platforms on the free tier.',
              },
              {
                n: '4',
                title: 'Annual contracts lock you in before you know if it works',
                desc: 'Sprinklr typically requires an annual contract, meaning you\'re committing thousands of dollars upfront. If it doesn\'t fit your workflow, you\'re stuck. SocialMate has no contract, no commitment, and no credit card requirement — use it at your own pace.',
              },
            ].map((r) => (
              <div key={r.n} className="flex gap-4 p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-gray-300 dark:hover:border-gray-600 transition-all">
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
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Frequently asked questions</h2>
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Skip the $299/month — start free today</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 12 AI tools, 16 platforms, no enterprise contract. No credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
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
            <Link href="/vs/sprout-social" className="hover:text-black dark:hover:text-white transition-colors">vs Sprout Social</Link>
            <Link href="/vs/hootsuite" className="hover:text-black dark:hover:text-white transition-colors">vs Hootsuite</Link>
            <Link href="/vs/agorapulse" className="hover:text-black dark:hover:text-white transition-colors">vs Agorapulse</Link>
            <Link href="/vs/loomly" className="hover:text-black dark:hover:text-white transition-colors">vs Loomly</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
