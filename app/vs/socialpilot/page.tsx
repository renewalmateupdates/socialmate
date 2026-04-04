import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs SocialPilot (2026) — Full Comparison',
  description: 'SocialPilot has no free plan — cheapest option is $25.50/month for 1 user and 10 accounts. SocialMate is free forever with Discord, Bluesky, Telegram, and Mastodon support.',
  openGraph: {
    title:       'SocialMate vs SocialPilot (2026)',
    description: 'SocialPilot calls itself affordable but has zero free tier. SocialMate is genuinely free — no credit card, unlimited posts, 12 AI tools, and alternative platform support.',
    url:         'https://socialmate.studio/vs/socialpilot',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/socialpilot' },
}

const COMPARISON = [
  { feature: 'Starting price',          socialpilot: '$25.50/month (annual)', socialmate: '$0 — free forever'       },
  { feature: 'Free plan',               socialpilot: '❌ None',                socialmate: '✅ Free forever'         },
  { feature: 'Users on base plan',      socialpilot: '1 user',                socialmate: '2 users free'            },
  { feature: 'Accounts on base plan',   socialpilot: '10 accounts',           socialmate: 'No hard cap (free tier)' },
  { feature: 'Pricing model',           socialpilot: 'Per user tiered',       socialmate: 'Flat rate'               },
  { feature: 'Discord support',         socialpilot: '❌',                     socialmate: '✅'                      },
  { feature: 'Telegram support',        socialpilot: '❌',                     socialmate: '✅'                      },
  { feature: 'Mastodon support',        socialpilot: '❌',                     socialmate: '✅'                      },
  { feature: 'Bluesky support',         socialpilot: '❌',                     socialmate: '✅'                      },
  { feature: 'AI writing tools',        socialpilot: 'AI Assistant (basic)',  socialmate: '12 tools included'       },
  { feature: 'AI credits free tier',    socialpilot: 'N/A (no free plan)',    socialmate: '75/month free'            },
  { feature: 'Bulk scheduling',         socialpilot: '✅ Paid plans',          socialmate: '✅ Free'                  },
  { feature: 'Link in bio',             socialpilot: '❌',                     socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',         socialpilot: '✅ Paid plans',          socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',     socialpilot: '❌',                     socialmate: '✅ Free (3 accounts)'    },
  { feature: 'RSS import',              socialpilot: '✅ Paid plans',          socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',     socialpilot: '✅ Higher plans',        socialmate: '✅ Free'                  },
  { feature: 'Client workspaces',       socialpilot: 'Agency plan ($85+/mo)', socialmate: 'Pro+: from $5/mo'        },
]

const FAQ = [
  {
    q: 'Does SocialPilot have a free plan?',
    a: 'No. SocialPilot has no free plan at all — not even a limited one. Their cheapest option is the Professional plan at $25.50/month billed annually (or $30/month billed monthly), which gives 1 user and 10 social accounts. SocialMate is completely free to start with no credit card required.',
  },
  {
    q: 'Is SocialPilot really "affordable"?',
    a: 'SocialPilot markets itself as a budget-friendly tool, and compared to Sprout Social it is. But $25.50/month with no free tier to try it first is still a real commitment. SocialMate lets you use the full core feature set at $0 indefinitely — so you can decide if you want to upgrade based on actual usage, not a 14-day trial.',
  },
  {
    q: 'Which platforms does SocialMate support that SocialPilot does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which SocialPilot covers. SocialPilot is heavily focused on Instagram, Facebook, Twitter/X, and LinkedIn. If your community lives on newer or decentralized platforms, SocialPilot simply does not reach them.',
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. The free tier includes unlimited posts, 75 AI credits per month, bulk scheduling, link in bio, hashtag manager, competitor tracking (3 accounts), RSS import, and evergreen recycling. No credit card required and no countdown timer before the free plan expires.',
  },
]

export default function VsSocialPilotPage() {
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
            SocialMate vs SocialPilot
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            SocialPilot calls itself affordable — but there is no free plan. SocialMate is free forever, with Discord, Bluesky, Telegram, and Mastodon supported natively.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialPilot</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Affordable pricing, zero free tier</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Decent bulk scheduling tools</li>
              <li>✅ Client management for agencies</li>
              <li>❌ No free plan at all</li>
              <li>❌ $25.50/mo minimum commitment</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Heavy Instagram/Facebook focus</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Truly free. Every platform.</p>
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
              <span>SocialPilot</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.socialpilot}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from SocialPilot</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '"Affordable" still means $25.50/month before you post a single thing',
                desc: 'SocialPilot requires a paid plan from day one. There is no free tier, no permanent trial, no way to evaluate the tool without a credit card on file. SocialMate is free forever — use bulk scheduling, AI tools, and all core features with zero financial commitment.',
              },
              {
                n: '2',
                title: 'SocialPilot is built around Instagram and Facebook',
                desc: 'SocialPilot\'s platform support is weighted toward Meta properties and Twitter/X. Discord, Telegram, Mastodon, and Bluesky are not supported at all. If any part of your audience is on community or decentralized platforms, you need a different tool — like SocialMate.',
              },
              {
                n: '3',
                title: '12 AI tools vs a basic AI assistant',
                desc: 'SocialMate includes caption generation, viral hook writing, hashtag research, thread creation, post scoring, content repurposing, trend scanning, and more — all on the free tier. SocialPilot has a basic AI assistant that does not come close to matching that depth.',
              },
              {
                n: '4',
                title: 'Competitor tracking and link in bio are missing entirely',
                desc: 'SocialPilot does not include competitor tracking or a link-in-bio tool. SocialMate offers both on the free plan. Tracking up to 3 competitor accounts and publishing a branded link page costs you nothing.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">No free plan? No deal.</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 12 AI tools, 16 platforms including Discord and Bluesky. No credit card required.
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
            <Link href="/vs/metricool" className="hover:text-black dark:hover:text-white transition-colors">vs Metricool</Link>
            <Link href="/vs/sendible" className="hover:text-black dark:hover:text-white transition-colors">vs Sendible</Link>
            <Link href="/vs/sprout-social" className="hover:text-black dark:hover:text-white transition-colors">vs Sprout Social</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
