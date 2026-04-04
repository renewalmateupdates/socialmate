import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Planable (2026) — Full Comparison',
  description: "Planable's free plan is a 50-post lifetime cap — not monthly. Once you hit 50, you must pay. SocialMate is unlimited posts, free forever.",
  openGraph: {
    title:       'SocialMate vs Planable (2026)',
    description: "Planable gives you 50 posts total on the free plan — ever. SocialMate has no post limits and no credit card required.",
    url:         'https://socialmate.studio/vs/planable',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/planable' },
}

const COMPARISON = [
  { feature: 'Starting price',            planable: '$11/month per workspace',  socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 planable: '50 posts LIFETIME total',  socialmate: 'Unlimited forever'       },
  { feature: 'Post limits',               planable: '50 posts then forced pay', socialmate: 'None'                    },
  { feature: 'Pricing model',             planable: 'Per workspace',            socialmate: 'Flat rate'               },
  { feature: 'Platforms supported',       planable: '8+',                       socialmate: '16 (growing)'            },
  { feature: 'Discord support',           planable: '❌',                        socialmate: '✅'                      },
  { feature: 'Telegram support',          planable: '❌',                        socialmate: '✅'                      },
  { feature: 'Mastodon support',          planable: '❌',                        socialmate: '✅'                      },
  { feature: 'Bluesky support',           planable: '❌',                        socialmate: '✅'                      },
  { feature: 'AI writing tools',          planable: 'Basic AI (paid)',           socialmate: '12 tools included'       },
  { feature: 'Approval workflows',        planable: '✅ (paid plans)',           socialmate: 'In development'          },
  { feature: 'Bulk scheduling',           planable: 'Paid plans',               socialmate: '✅ Free'                  },
  { feature: 'RSS import',                planable: '❌',                        socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',       planable: '❌',                        socialmate: '✅ Free'                  },
  { feature: 'Link in bio',               planable: '❌',                        socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',       planable: '❌',                        socialmate: '✅ Free (3 accounts)'    },
  { feature: 'Hashtag manager',           planable: '❌',                        socialmate: '✅ Free'                  },
  { feature: 'Team seats (free)',          planable: '1',                        socialmate: '2'                       },
  { feature: 'Client workspaces',         planable: '$11+/workspace/month',     socialmate: 'Pro+: from $5/mo'        },
]

const FAQ = [
  {
    q: "Is Planable's free plan actually free?",
    a: "Planable's free plan gives you 50 posts total — not per month, not per year. Lifetime. After 50 posts, you must upgrade to $11/month per workspace. For most users this means the free plan runs out in the first month of use. SocialMate is genuinely free with no post limits ever.",
  },
  {
    q: 'Planable is known for team collaboration — does SocialMate have that?',
    a: "Planable does have strong approval workflows, which is a real differentiator for agency teams. SocialMate has team seats and workspaces today. Content approval workflows are on the roadmap. If approval workflows are your primary need right now, Planable is worth evaluating. If you want unlimited posting across more platforms with AI tools at no cost, SocialMate wins.",
  },
  {
    q: 'Does SocialMate support the platforms I need?',
    a: "SocialMate supports Bluesky, Discord, Mastodon, Telegram, LinkedIn, YouTube, and Pinterest today — with Instagram, TikTok, Reddit, and Facebook in review. Planable covers primarily the Meta/LinkedIn/Twitter stack. If your audience is on Discord, Telegram, or decentralized platforms, SocialMate is the only option.",
  },
  {
    q: 'How many workspaces does SocialMate include?',
    a: 'The free plan includes a personal workspace. Pro ($5/month) adds client workspaces. Agency ($20/month) is unlimited workspaces. Planable charges $11/workspace/month. If you manage 5 clients, Planable costs $55/month. On SocialMate Agency, it is $20 flat for all of them.',
  },
]

export default function VsPlanablePage() {
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
            SocialMate vs Planable
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Planable gives you 50 posts total — ever — before forcing you to pay. SocialMate is unlimited, free forever.
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

        {/* VERDICT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Planable</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Best-in-class approvals, no real free tier</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Strong approval workflow for agencies</li>
              <li>✅ Clean content calendar UI</li>
              <li>❌ 50 post LIFETIME cap on free plan</li>
              <li>❌ $11/workspace/month — adds up fast</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ No RSS import, evergreen, or link in bio</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Unlimited. All platforms. $0.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Unlimited posts, no lifetime cap</li>
              <li>✅ Flat-rate workspaces ($20/mo for unlimited)</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ RSS import, evergreen, link in bio — all free</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Feature comparison</h2>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span>Feature</span>
              <span>Planable</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.planable}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why teams switch from Planable</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: "50 posts for life is not a free plan",
                desc: "Planable's free plan gives you 50 total posts across your lifetime account. Post twice a day and you run out in 25 days. Most users hit the cap in their first month and are forced to upgrade. SocialMate's free tier has no post limits — ever.",
              },
              {
                n: '2',
                title: 'Per-workspace billing punishes agency growth',
                desc: "Planable charges $11/month per workspace. Manage 10 clients and you're paying $110/month. SocialMate Agency is $20/month flat for unlimited workspaces. As your client roster grows, your bill stays the same.",
              },
              {
                n: '3',
                title: 'Missing the fastest-growing platforms',
                desc: 'Planable covers the legacy social stack — Facebook, Instagram, LinkedIn. SocialMate adds Discord, Telegram, Mastodon, and Bluesky — where creator communities and enthusiast audiences are growing the fastest right now.',
              },
              {
                n: '4',
                title: 'No RSS import, no evergreen recycling, no link in bio',
                desc: 'Planable is primarily a scheduling and collaboration tool. SocialMate is a full content operations platform: RSS import, evergreen content recycling, link in bio builder, competitor tracking, hashtag manager, and 12 AI tools — all included free.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">50 posts is not enough. SocialMate is.</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            Unlimited posts, 12 AI tools, 16 platforms — free forever. No lifetime caps, no credit card required.
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
            <Link href="/vs/metricool" className="hover:text-black dark:hover:text-white transition-colors">vs Metricool</Link>
            <Link href="/vs/publer" className="hover:text-black dark:hover:text-white transition-colors">vs Publer</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
