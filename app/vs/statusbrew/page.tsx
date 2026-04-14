import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs Statusbrew (2026) — Full Comparison',
  description: 'Statusbrew starts at $69/month with no free plan — built for enterprise teams and agencies. SocialMate is free forever with bulk scheduling, AI tools, and Discord/Bluesky included.',
  openGraph: {
    title:       'SocialMate vs Statusbrew (2026)',
    description: 'Statusbrew charges $69/month minimum with no free plan and enterprise-focused features. SocialMate is free forever for creators and small teams.',
    url:         'https://socialmate.studio/vs/statusbrew',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/statusbrew' },
}

const COMPARISON = [
  { feature: 'Starting price',            statusbrew: '$69/month (Lite)',          socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 statusbrew: '❌ None',                   socialmate: '✅ Free forever'         },
  { feature: 'Free trial',                statusbrew: '14-day trial only',         socialmate: 'Free forever, no trial'  },
  { feature: 'Users on starting plan',    statusbrew: '1 user',                    socialmate: '2 users free'            },
  { feature: 'Social accounts (starter)', statusbrew: '5 profiles',                socialmate: 'No hard cap (free tier)' },
  { feature: 'Target audience',           statusbrew: 'Enterprises, agencies',     socialmate: 'Creators, small teams'   },
  { feature: 'Discord support',           statusbrew: '❌',                        socialmate: '✅'                      },
  { feature: 'Telegram support',          statusbrew: '❌',                        socialmate: '✅'                      },
  { feature: 'Mastodon support',          statusbrew: '❌',                        socialmate: '✅'                      },
  { feature: 'Bluesky support',           statusbrew: '❌',                        socialmate: '✅'                      },
  { feature: 'AI writing tools',          statusbrew: 'AI assist (higher tiers)',  socialmate: '12 tools included'       },
  { feature: 'AI credits free tier',      statusbrew: 'N/A (no free plan)',        socialmate: '75/month free'           },
  { feature: 'Bulk scheduling',           statusbrew: '✅ All plans',              socialmate: '✅ Free'                 },
  { feature: 'Link in bio',               statusbrew: '❌',                        socialmate: '✅ Free'                 },
  { feature: 'Hashtag manager',           statusbrew: 'Paid plans',                socialmate: '✅ Free'                 },
  { feature: 'Evergreen recycling',       statusbrew: '❌',                        socialmate: '✅ Free'                 },
  { feature: 'Competitor tracking',       statusbrew: 'Higher tiers',              socialmate: '✅ Free (3 accounts)'   },
  { feature: 'Unified social inbox',      statusbrew: '✅ Strong',                 socialmate: '✅ Free'                 },
]

const FAQ = [
  {
    q: 'Does Statusbrew have a free plan?',
    a: 'No. Statusbrew has no free plan — only a 14-day trial. After the trial, the cheapest plan is $69/month for a single user. SocialMate is completely free to start with no credit card and no expiry date.',
  },
  {
    q: 'Who is Statusbrew built for?',
    a: 'Statusbrew is designed for enterprises and agencies that need a unified social inbox, team workflows, and client management features. Solo creators and small teams pay a significant premium for features they are unlikely to use.',
  },
  {
    q: 'Which platforms does SocialMate support that Statusbrew does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which Statusbrew covers. If your audience is on community platforms or decentralized networks, Statusbrew cannot help.',
  },
  {
    q: 'Is SocialMate a good Statusbrew alternative for small teams?',
    a: 'Yes. SocialMate gives you bulk scheduling, 12 AI tools, competitor tracking, evergreen recycling, link in bio, and analytics — all free, for teams of up to 2 users. Statusbrew charges $69/month for a single user with no free plan.',
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

export default function VsStatusbrewPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
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
            SocialMate vs Statusbrew
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Statusbrew starts at $69/month for one user with no free plan — built for enterprise teams. SocialMate is free forever for creators and small teams.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Statusbrew</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Enterprise features — enterprise pricing</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Strong unified social inbox</li>
              <li>✅ Bulk scheduling on all plans</li>
              <li>❌ No free plan — $69/month minimum</li>
              <li>❌ Single user on the starter plan</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ AI tools require higher tier</li>
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
              <li>✅ 2 team seats on free plan</li>
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
              <span>Statusbrew</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.statusbrew}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over Statusbrew</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '$69/month for a single user — before adding a second seat',
                desc: "Statusbrew's starter Lite plan costs $69/month for just one user. Adding a second team member means upgrading. SocialMate's free plan includes 2 team seats, and the Pro plan at $5/month covers more accounts with 500 AI credits.",
              },
              {
                n: '2',
                title: 'Enterprise features create complexity for creators',
                desc: "Statusbrew is designed for enterprise social teams with complex inbox routing, escalation workflows, and client management. If you just need to schedule posts, track analytics, and use AI tools — that complexity is overhead you pay for but don't need.",
              },
              {
                n: '3',
                title: 'No free plan means no way to evaluate before committing',
                desc: "Statusbrew offers a 14-day trial. Once it ends, you commit to $69/month or start over. SocialMate's free plan never expires — take as long as you need to evaluate whether it fits your workflow.",
              },
              {
                n: '4',
                title: 'SocialMate covers platforms Statusbrew does not',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not supported by Statusbrew. SocialMate covers all four on the free plan — along with Instagram, LinkedIn, Facebook, Twitter/X, Pinterest, Reddit, TikTok, and more.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Skip the $69/month — start free today</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 12 AI tools, 16 platforms, 2 team seats. No credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            Create free account →
          </Link>
          <p className="text-gray-600 text-xs mt-3">No card required · Free forever</p>
        </div>
      </div>
      {/* FOOTER */}
      <PublicFooter />
    </div>
  )
}
