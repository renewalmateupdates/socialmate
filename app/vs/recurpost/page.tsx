import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs RecurPost (2026) — Full Comparison',
  description: 'RecurPost free plan: 3 social accounts and a 100-post lifetime cap. SocialMate is free forever with unlimited posts, no account cap, and Discord/Bluesky/Telegram/Mastodon included.',
  openGraph: {
    title:       'SocialMate vs RecurPost (2026)',
    description: "RecurPost's free plan hits a 100-post lifetime cap — use it up once and it's gone. SocialMate is free forever with no lifetime limits.",
    url:         'https://socialmate.studio/vs/recurpost',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/recurpost' },
}

const COMPARISON = [
  { feature: 'Starting price',            recurpost: '$25/month (Personal)',       socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 recurpost: '✅ (100 posts lifetime cap)', socialmate: '✅ Unlimited posts free' },
  { feature: 'Free plan post limit',      recurpost: '100 posts — lifetime',       socialmate: 'No limit ever'           },
  { feature: 'Social accounts (free)',    recurpost: '3 accounts',                 socialmate: 'No hard cap (free tier)' },
  { feature: 'Bulk scheduling',           recurpost: 'Paid plans',                 socialmate: '✅ Free'                 },
  { feature: 'Discord support',           recurpost: '❌',                         socialmate: '✅'                      },
  { feature: 'Telegram support',          recurpost: '❌',                         socialmate: '✅'                      },
  { feature: 'Mastodon support',          recurpost: '❌',                         socialmate: '✅'                      },
  { feature: 'Bluesky support',           recurpost: '❌',                         socialmate: '✅'                      },
  { feature: 'AI writing tools',          recurpost: 'Limited AI assist',          socialmate: '12 tools included'       },
  { feature: 'AI credits free tier',      recurpost: 'Very limited',               socialmate: '75/month free'           },
  { feature: 'Link in bio',               recurpost: '❌',                         socialmate: '✅ Free'                 },
  { feature: 'Hashtag manager',           recurpost: 'Paid plans',                 socialmate: '✅ Free'                 },
  { feature: 'Evergreen recycling',       recurpost: '✅ Core feature',            socialmate: '✅ Free'                 },
  { feature: 'Competitor tracking',       recurpost: '❌',                         socialmate: '✅ Free (3 accounts)'   },
  { feature: 'RSS import',                recurpost: 'Paid plans',                 socialmate: '✅ Free'                 },
  { feature: 'Content libraries',         recurpost: '✅ Core feature',            socialmate: '✅ Free'                 },
  { feature: 'Analytics',                 recurpost: 'Basic free, paid for full',  socialmate: '✅ Free'                 },
]

const FAQ = [
  {
    q: "What is RecurPost's 100-post lifetime cap?",
    a: "RecurPost's free plan allows you to create up to 100 posts in total — not 100 per month, but 100 ever. Once you schedule 100 posts across all your accounts, the free plan is exhausted. SocialMate has no lifetime post limit.",
  },
  {
    q: "What is RecurPost's main feature?",
    a: 'RecurPost specializes in content recycling — it lets you build libraries of evergreen posts that automatically repeat on a schedule. This is a genuinely useful feature. SocialMate includes evergreen recycling on the free plan, with no post cap.',
  },
  {
    q: 'Which platforms does SocialMate support that RecurPost does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which RecurPost covers. If any part of your audience is on community or decentralized platforms, RecurPost cannot help.',
  },
  {
    q: 'Is SocialMate a good RecurPost alternative for evergreen content?',
    a: 'Yes. SocialMate includes evergreen recycling, content libraries, bulk scheduling, and 12 AI tools — all free, with no 100-post lifetime cap. RecurPost charges $25/month to remove that cap.',
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

export default function VsRecurPostPage() {
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
            SocialMate vs RecurPost
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            RecurPost free plan: 3 accounts and 100 posts lifetime — use them up and you are done. SocialMate is free forever with no lifetime limit on posts.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">RecurPost</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Good recycling — but free plan burns out</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Evergreen content recycling</li>
              <li>✅ Content libraries</li>
              <li>❌ 100-post lifetime cap on free plan</li>
              <li>❌ $25/month to remove the cap</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Bulk scheduling locked to paid plans</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">No lifetime cap. All platforms. $0.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Free forever — no lifetime post limit</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Evergreen recycling free</li>
              <li>✅ Bulk scheduling free</li>
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
              <span>RecurPost</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.recurpost}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from RecurPost</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'The 100-post lifetime cap is a fundamental free plan problem',
                desc: '100 posts is not a monthly limit — it is a total cap on your entire free account. Post consistently across 3 accounts for a few weeks and you exhaust it. This is a trial in disguise, not a free plan. SocialMate has no lifetime limit.',
              },
              {
                n: '2',
                title: '$25/month just to remove the cap — before you get any advanced features',
                desc: 'RecurPost charges $25/month on the Personal plan just to unlock unlimited posts. Advanced features like bulk scheduling and RSS import require higher tiers. SocialMate includes both for free.',
              },
              {
                n: '3',
                title: 'RecurPost recycling is great — SocialMate recycling is also free',
                desc: "RecurPost's main selling point is evergreen content recycling — automatically reposting your best content on a schedule. SocialMate includes the same feature at no cost, so you do not need to pay $25/month for what SocialMate gives you free.",
              },
              {
                n: '4',
                title: 'SocialMate covers platforms RecurPost does not',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not supported by RecurPost. SocialMate covers all four on the free plan, plus the full range of mainstream platforms.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">No lifetime caps — start free today</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — unlimited posts, evergreen recycling, 12 AI tools, 16 platforms. No credit card required.
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
            <Link href="/vs/postplanner" className="hover:text-black dark:hover:text-white transition-colors">vs Post Planner</Link>
            <Link href="/vs/meetedgar" className="hover:text-black dark:hover:text-white transition-colors">vs MeetEdgar</Link>
            <Link href="/vs/socialbee" className="hover:text-black dark:hover:text-white transition-colors">vs SocialBee</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
