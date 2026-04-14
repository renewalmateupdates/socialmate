import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs Sendible (2026) — Full Comparison',
  description: 'Sendible starts at $29/mo for only 1 user and 6 profiles with no free plan. SocialMate is free forever with no profile limits and 12 AI tools included.',
  openGraph: {
    title:       'SocialMate vs Sendible (2026)',
    description: 'Sendible charges $29/mo for just 1 user and 6 profiles. SocialMate is free — no credit card, no profile cap, no agency pricing required.',
    url:         'https://socialmate.studio/vs/sendible',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/sendible' },
}

const COMPARISON = [
  { feature: 'Starting price',          sendible: '$29/month (Creator)',      socialmate: '$0 — free forever'       },
  { feature: 'Free plan',               sendible: '❌ None',                   socialmate: '✅ Free forever'         },
  { feature: 'Users on starting plan',  sendible: '1 user',                   socialmate: '2 users free'            },
  { feature: 'Profiles on starting plan', sendible: '6 profiles',             socialmate: 'No hard cap (free tier)' },
  { feature: 'Pricing model',           sendible: 'Agency-tiered',            socialmate: 'Flat rate'               },
  { feature: 'Discord support',         sendible: '❌',                        socialmate: '✅'                      },
  { feature: 'Telegram support',        sendible: '❌',                        socialmate: '✅'                      },
  { feature: 'Mastodon support',        sendible: '❌',                        socialmate: '✅'                      },
  { feature: 'Bluesky support',         sendible: '❌',                        socialmate: '✅'                      },
  { feature: 'AI writing tools',        sendible: 'Basic AI assist',          socialmate: '12 tools included'       },
  { feature: 'AI credits free tier',    sendible: 'N/A (no free plan)',       socialmate: '75/month free'            },
  { feature: 'Bulk scheduling',         sendible: 'Paid plans',               socialmate: '✅ Free'                  },
  { feature: 'Link in bio',             sendible: '❌',                        socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',         sendible: 'Paid plans',               socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',     sendible: 'Higher tiers',             socialmate: '✅ Free (3 accounts)'    },
  { feature: 'RSS import',              sendible: '✅ Paid plans',             socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',     sendible: '✅ Paid plans',             socialmate: '✅ Free'                  },
  { feature: 'Client workspaces',       sendible: 'White-label ($199+/mo)',   socialmate: 'Pro+: from $5/mo'        },
]

const FAQ = [
  {
    q: 'Does Sendible have a free plan?',
    a: 'No. Sendible has no free plan at all. Their cheapest option is the Creator plan at $29/month, which gives you 1 user and 6 social profiles. SocialMate is completely free to start with no credit card required.',
  },
  {
    q: 'Who is Sendible built for?',
    a: 'Sendible is primarily designed for agencies managing multiple client accounts. That means the pricing tiers, onboarding, and feature set are all built around agency workflows. If you are a solo creator, small team, or indie brand, you will be paying agency prices for features you do not need.',
  },
  {
    q: 'Which platforms does SocialMate support that Sendible does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which Sendible covers. If your community is on any of these growing platforms, Sendible simply is not an option.',
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. Free tier includes unlimited posts, 75 AI credits/month, bulk scheduling, link in bio, hashtag manager, competitor tracking, RSS import, and evergreen recycling. No credit card required and no free trial countdown.',
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

export default function VsSendiblePage() {
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
            SocialMate vs Sendible
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Sendible starts at $29/mo for 1 user and 6 profiles — with no free plan. SocialMate is free forever, no credit card required.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Sendible</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Agency tool with agency pricing</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Strong client reporting</li>
              <li>✅ White-label options for agencies</li>
              <li>❌ No free plan at all</li>
              <li>❌ $29/mo for only 1 user + 6 profiles</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Overkill complexity for solo users</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Full feature set. Zero dollars.</p>
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
              <span>Sendible</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.sendible}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from Sendible</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Sendible has no free plan — at all',
                desc: 'There is no trial that converts to free. Once your trial ends, you pay $29/month or you are locked out. SocialMate has no trial countdown — the free plan is permanent, with full access to bulk scheduling, AI tools, and more.',
              },
              {
                n: '2',
                title: '$29/mo is a lot for 1 user and 6 profiles',
                desc: 'Sendible\'s Creator plan gives you exactly 1 user seat and 6 social profiles. If you manage more than 6 accounts or want to add a collaborator, you move to the next tier. SocialMate gives you more flexibility at $0.',
              },
              {
                n: '3',
                title: 'Sendible is built for agencies — not for you',
                desc: 'Sendible\'s onboarding, pricing structure, and feature set are designed around agencies managing dozens of client accounts. If you are building your own brand or running a small team, the complexity and cost are not worth it.',
              },
              {
                n: '4',
                title: 'SocialMate covers platforms Sendible ignores',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not supported by Sendible. If any part of your audience lives on these platforms, you need a tool that covers them. SocialMate does — on the free plan.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Why pay $29/mo when $0 works?</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — bulk scheduling, 12 AI tools, 16 platforms, no credit card required.
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
