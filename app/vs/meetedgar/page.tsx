import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs MeetEdgar (2026) — Full Comparison',
  description: 'MeetEdgar starts at $29.99/month with no free plan. SocialMate has evergreen recycling free, supports Bluesky/Discord/Telegram/Mastodon, and costs $0 to start.',
  openGraph: {
    title:       'SocialMate vs MeetEdgar (2026)',
    description: 'MeetEdgar charges $29.99/month and skips Bluesky, Discord, Telegram, and Mastodon. SocialMate does evergreen recycling free on 16 platforms.',
    url:         'https://socialmate.studio/vs/meetedgar',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/meetedgar' },
}

const COMPARISON = [
  { feature: 'Starting price',            meetedgar: '$29.99/month (Eddie)',    socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 meetedgar: '❌ None',                  socialmate: '✅ Free forever'         },
  { feature: 'Evergreen recycling',       meetedgar: '✅ Core feature (paid)',   socialmate: '✅ Free'                  },
  { feature: 'Users on starting plan',    meetedgar: '1 user',                  socialmate: '2 users free'            },
  { feature: 'Pricing model',             meetedgar: 'Per plan tier',           socialmate: 'Flat rate'               },
  { feature: 'Bluesky support',           meetedgar: '❌',                       socialmate: '✅'                      },
  { feature: 'Discord support',           meetedgar: '❌',                       socialmate: '✅'                      },
  { feature: 'Telegram support',          meetedgar: '❌',                       socialmate: '✅'                      },
  { feature: 'Mastodon support',          meetedgar: '❌',                       socialmate: '✅'                      },
  { feature: 'Instagram support',         meetedgar: '✅',                       socialmate: '✅'                      },
  { feature: 'LinkedIn support',          meetedgar: '✅',                       socialmate: '✅'                      },
  { feature: 'TikTok support',            meetedgar: '✅',                       socialmate: '✅'                      },
  { feature: 'AI writing tools',          meetedgar: 'Basic AI captions',       socialmate: '12 tools included'       },
  { feature: 'AI credits free tier',      meetedgar: 'N/A (no free plan)',      socialmate: '75/month free'            },
  { feature: 'Bulk scheduling',           meetedgar: 'Paid plans',              socialmate: '✅ Free'                  },
  { feature: 'Link in bio',               meetedgar: '❌',                       socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',           meetedgar: '❌',                       socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',       meetedgar: '❌',                       socialmate: '✅ Free (3 accounts)'    },
]

const FAQ = [
  {
    q: 'Does MeetEdgar have a free plan?',
    a: 'No. MeetEdgar has no free plan of any kind. Their cheapest option is the Eddie plan at $29.99/month. SocialMate is completely free to start, including evergreen recycling, with no credit card required.',
  },
  {
    q: 'Does SocialMate have evergreen recycling like MeetEdgar?',
    a: 'Yes. SocialMate includes evergreen recycling on the free plan — you can mark posts to be automatically reshared on a recurring schedule, just like MeetEdgar\'s core feature. The difference is SocialMate does not charge $29.99/month for it.',
  },
  {
    q: 'Which platforms does SocialMate support that MeetEdgar does not?',
    a: 'SocialMate supports Bluesky, Discord, Telegram, and Mastodon — none of which MeetEdgar covers. MeetEdgar focuses on Instagram, Facebook, Twitter/X, LinkedIn, Pinterest, and TikTok. If your audience is on any decentralized or community platform, MeetEdgar cannot reach them.',
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. The free tier includes unlimited posts, evergreen recycling, 75 AI credits/month, bulk scheduling, link in bio, hashtag manager, and competitor tracking. No credit card required and no trial expiry.',
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

export default function VsMeetEdgarPage() {
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
            SocialMate vs MeetEdgar
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            MeetEdgar charges $29.99/month for evergreen recycling with no free plan. SocialMate does evergreen recycling free — plus 15 more platforms.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">MeetEdgar</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Evergreen recycling only — at a price</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Solid evergreen content recycling</li>
              <li>✅ Category-based queue management</li>
              <li>❌ No free plan — $29.99/month minimum</li>
              <li>❌ No Bluesky, Discord, Telegram, Mastodon</li>
              <li>❌ Limited AI tools</li>
              <li>❌ No hashtag manager or competitor tracking</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Evergreen recycling. 16 platforms. $0.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Evergreen recycling on free plan</li>
              <li>✅ Bluesky, Discord, Telegram, Mastodon</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ Bulk scheduling free</li>
              <li>✅ Hashtag manager and competitor tracking</li>
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
              <span>MeetEdgar</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.meetedgar}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from MeetEdgar</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Evergreen recycling should not cost $30/month',
                desc: 'MeetEdgar built its entire product around one feature: recycling evergreen content. That feature is genuinely useful. But charging $29.99/month for it — with no free tier — means you are paying a subscription just to repost old content. SocialMate includes evergreen recycling at $0.',
              },
              {
                n: '2',
                title: 'MeetEdgar misses the platforms your audience is migrating to',
                desc: 'MeetEdgar supports Instagram, Facebook, Twitter/X, LinkedIn, Pinterest, and TikTok — the mainstream six. It has no support for Bluesky, Discord, Telegram, or Mastodon. As audiences fragment across newer platforms, a tool that cannot reach them becomes a liability.',
              },
              {
                n: '3',
                title: 'No free plan means no risk-free evaluation',
                desc: 'MeetEdgar offers a trial but no permanent free tier. When the trial ends, you pay or you stop. If the tool is not the right fit, you find out after paying. SocialMate\'s free plan is permanent — try it indefinitely without a card on file.',
              },
              {
                n: '4',
                title: 'SocialMate brings 12 AI tools MeetEdgar does not have',
                desc: 'SocialMate includes caption generation, viral hook writing, hashtag research, thread generation, content repurposing, post scoring, and more — all on the free tier. MeetEdgar offers basic AI caption help. If AI-assisted content creation matters to your workflow, SocialMate is the stronger choice.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Get evergreen recycling free — no $30/month required</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — evergreen recycling, bulk scheduling, 12 AI tools, 16 platforms. No credit card required.
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
            <Link href="/vs/later" className="hover:text-black dark:hover:text-white transition-colors">vs Later</Link>
            <Link href="/vs/loomly" className="hover:text-black dark:hover:text-white transition-colors">vs Loomly</Link>
            <Link href="/vs/coschedule" className="hover:text-black dark:hover:text-white transition-colors">vs CoSchedule</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
