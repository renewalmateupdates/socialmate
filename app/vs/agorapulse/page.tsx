import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Agorapulse (2026) — Full Comparison',
  description: 'Agorapulse starts at $49/month with no free plan and is built for agencies. SocialMate is free forever with bulk scheduling, Discord/Bluesky/Telegram/Mastodon, and 12 AI tools included.',
  openGraph: {
    title:       'SocialMate vs Agorapulse (2026)',
    description: 'Agorapulse charges $49/month with no free plan and heavy agency features you may not need. SocialMate is free forever — no credit card, no agency overhead.',
    url:         'https://socialmate.studio/vs/agorapulse',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/agorapulse' },
}

const COMPARISON = [
  { feature: 'Starting price',            agorapulse: '$49/month (Standard)',        socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 agorapulse: '❌ None',                      socialmate: '✅ Free forever'         },
  { feature: 'Users on starting plan',    agorapulse: '2 users',                     socialmate: '2 users free'            },
  { feature: 'Social accounts (starter)', agorapulse: '10 accounts',                 socialmate: 'No hard cap (free tier)' },
  { feature: 'Target audience',           agorapulse: 'Agencies',                    socialmate: 'Creators & small teams'  },
  { feature: 'Pricing complexity',        agorapulse: 'Per-user + per-profile',      socialmate: 'Flat rate'               },
  { feature: 'Discord support',           agorapulse: '❌',                           socialmate: '✅'                      },
  { feature: 'Telegram support',          agorapulse: '❌',                           socialmate: '✅'                      },
  { feature: 'Mastodon support',          agorapulse: '❌',                           socialmate: '✅'                      },
  { feature: 'Bluesky support',           agorapulse: '❌',                           socialmate: '✅'                      },
  { feature: 'AI writing tools',          agorapulse: 'AI Compose add-on',           socialmate: '12 tools included'       },
  { feature: 'AI credits free tier',      agorapulse: 'N/A (no free plan)',          socialmate: '75/month free'           },
  { feature: 'Bulk scheduling',           agorapulse: 'Paid plans',                  socialmate: '✅ Free'                 },
  { feature: 'Link in bio',               agorapulse: '❌',                           socialmate: '✅ Free'                 },
  { feature: 'Hashtag manager',           agorapulse: 'Paid plans',                  socialmate: '✅ Free'                 },
  { feature: 'Evergreen recycling',       agorapulse: '❌',                           socialmate: '✅ Free'                 },
  { feature: 'Competitor tracking',       agorapulse: 'Higher tiers',                socialmate: '✅ Free (3 accounts)'   },
  { feature: 'Inbox / social listening',  agorapulse: '✅ Strong',                   socialmate: 'Basic'                   },
  { feature: 'Content approval',          agorapulse: '✅ Strong',                   socialmate: '✅ Free'                 },
]

const FAQ = [
  {
    q: 'Does Agorapulse have a free plan?',
    a: 'No. Agorapulse has no free plan. Their Standard plan starts at $49/month for 2 users and 10 social profiles. SocialMate is completely free to start with no credit card required.',
  },
  {
    q: 'Why is Agorapulse so expensive compared to other tools?',
    a: 'Agorapulse is built primarily for agencies and enterprise teams, and its pricing reflects that. It bundles in social inbox management, team reporting, and client access features that most solo creators and small businesses simply don\'t need. You end up paying for an agency toolkit when you just want to schedule posts.',
  },
  {
    q: 'Which platforms does SocialMate support that Agorapulse does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which Agorapulse covers. If any part of your audience lives on community platforms or decentralized networks, Agorapulse can\'t reach them.',
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. The free tier includes unlimited posts, 75 AI credits/month, bulk scheduling, link in bio, hashtag manager, competitor tracking, RSS import, and evergreen recycling. No credit card required and no trial countdown.',
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

export default function VsAgorapulsePage() {
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
            SocialMate vs Agorapulse
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Agorapulse has no free plan and starts at $49/month — built for agencies, not solo creators. SocialMate is free forever with no agency overhead.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Agorapulse</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Powerful for agencies, overkill for everyone else</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Strong social inbox management</li>
              <li>✅ Team collaboration and approval flows</li>
              <li>❌ No free plan — $49/month minimum</li>
              <li>❌ Per-user pricing gets expensive fast</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Bulk scheduling locked to paid plans</li>
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
              <li>✅ No per-user fees</li>
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
              <span>Agorapulse</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.agorapulse}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from Agorapulse</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'No free plan means you commit $49/month before you know if it fits',
                desc: 'Agorapulse offers no free tier — just a 30-day trial. Once that ends, you\'re paying $49/month or losing access entirely. SocialMate has a permanent free plan with no expiry, so you can use it indefinitely at no cost.',
              },
              {
                n: '2',
                title: 'Agency features drive up the price for non-agency users',
                desc: 'Agorapulse is built around agency workflows — client access, shared inboxes, team reporting. These are valuable for agencies but are priced in for everyone. Solo creators and small teams pay for a toolset designed for a 10-person agency.',
              },
              {
                n: '3',
                title: 'SocialMate covers the platforms Agorapulse misses',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not in Agorapulse\'s platform list. If any part of your audience is on community platforms, group chats, or the decentralized web, Agorapulse simply can\'t reach them. SocialMate covers all four for free.',
              },
              {
                n: '4',
                title: 'Per-user pricing inflates costs as your team grows',
                desc: 'Agorapulse charges per user on top of base plan pricing. Add a second team member and your bill jumps. SocialMate\'s flat-rate model means adding team members doesn\'t multiply your monthly cost.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Skip the $49/month — start free today</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 12 AI tools, 16 platforms, no agency overhead. No credit card required.
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
            <Link href="/vs/buffer" className="hover:text-black dark:hover:text-white transition-colors">vs Buffer</Link>
            <Link href="/vs/hootsuite" className="hover:text-black dark:hover:text-white transition-colors">vs Hootsuite</Link>
            <Link href="/vs/sprout-social" className="hover:text-black dark:hover:text-white transition-colors">vs Sprout Social</Link>
            <Link href="/vs/loomly" className="hover:text-black dark:hover:text-white transition-colors">vs Loomly</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
