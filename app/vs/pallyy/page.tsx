import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Pallyy (2026) — Full Comparison',
  description: 'Pallyy free plan allows only 15 posts/month and paid plans start at $18/month per social set — costs multiply per brand. No Mastodon/Bluesky/Discord/Telegram, link-in-bio locked to paid. SocialMate is free forever.',
  openGraph: {
    title:       'SocialMate vs Pallyy (2026)',
    description: 'Pallyy free plan caps at 15 posts/month and paid plans charge per social set. SocialMate is free forever with unlimited posts and flat pricing.',
    url:         'https://socialmate.studio/vs/pallyy',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/pallyy' },
}

const COMPARISON = [
  { feature: 'Starting price',              pallyy: '$0 (limited) / $18/month per set', socialmate: '$0 — free forever'        },
  { feature: 'Free plan post limit',        pallyy: '15 posts/month hard cap',           socialmate: 'Unlimited posts'          },
  { feature: 'Pricing model',               pallyy: 'Per social set',                    socialmate: 'Flat rate'                },
  { feature: 'Multi-brand cost',            pallyy: '$18 × number of brands',            socialmate: 'Included free'            },
  { feature: 'Link in bio (free)',          pallyy: '❌ Paid only',                       socialmate: '✅ Free'                  },
  { feature: 'Bluesky support',             pallyy: '❌',                                 socialmate: '✅'                       },
  { feature: 'Discord support',             pallyy: '❌',                                 socialmate: '✅'                       },
  { feature: 'Telegram support',            pallyy: '❌',                                 socialmate: '✅'                       },
  { feature: 'Mastodon support',            pallyy: '❌',                                 socialmate: '✅'                       },
  { feature: 'Instagram support',           pallyy: '✅ Strong (grid planner)',           socialmate: '✅ (approval pending)'    },
  { feature: 'TikTok support',              pallyy: '✅',                                 socialmate: '✅ (approval pending)'    },
  { feature: 'AI writing tools',            pallyy: 'Basic AI (paid)',                   socialmate: '12 tools included'        },
  { feature: 'AI credits free tier',        pallyy: 'None',                              socialmate: '75/month free'            },
  { feature: 'Bulk scheduling',             pallyy: 'Paid plans only',                   socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',             pallyy: 'Paid plans',                        socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',         pallyy: '❌',                                 socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',         pallyy: '❌',                                 socialmate: '✅ Free (3 accounts)'     },
  { feature: 'RSS import',                  pallyy: '❌',                                 socialmate: '✅ Free'                  },
  { feature: 'Team seats (free)',           pallyy: '1 user',                            socialmate: '2 seats free'             },
]

const FAQ = [
  {
    q: 'What does Pallyy\'s free plan actually allow?',
    a: 'Pallyy\'s free plan allows 15 posts per month across your connected accounts. Once you hit 15 posts, scheduling stops until the next month. Link in bio is not included on the free plan. There is no analytics access and most features require the paid plan at $18/month per social set.',
  },
  {
    q: 'How does Pallyy\'s per-social-set pricing work?',
    a: 'Pallyy charges $18/month per "social set" — their term for a group of accounts for one brand. If you manage one brand, that is $18/month. If you manage three brands, that is $54/month. The costs multiply directly with the number of clients or brands you manage. SocialMate uses flat pricing with no per-brand fees, so managing ten brands costs the same as managing one.',
  },
  {
    q: 'Does Pallyy support Bluesky, Mastodon, Discord, or Telegram?',
    a: 'No. Pallyy does not support Bluesky, Mastodon, Discord, or Telegram. It is focused on Instagram, TikTok, Facebook, Twitter/X, LinkedIn, and Google Business Profile. SocialMate supports all four of those platforms on the free plan.',
  },
  {
    q: 'Is Pallyy good for Instagram?',
    a: 'Pallyy has a solid visual grid planner for Instagram, which makes it genuinely useful for Instagram-heavy workflows. If Instagram is your primary platform and you only manage one brand, the $18/month can be reasonable. But if you need multi-platform support or manage multiple brands, the per-set pricing and limited platform coverage make SocialMate the stronger choice.',
  },
]

export default function VsPallyyPage() {
  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-950">
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
            SocialMate vs Pallyy
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Pallyy caps free users at 15 posts/month and charges $18/month per social set. SocialMate is free forever with unlimited posts and flat pricing.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Pallyy</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">15 posts/month free cap</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Good Instagram grid planner</li>
              <li>✅ Clean scheduling interface</li>
              <li>❌ Free plan: 15 posts/month hard cap</li>
              <li>❌ $18/month per social set — multiplies per brand</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Link in bio locked to paid plans</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Unlimited posts. Flat pricing. $0.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Free forever — no post cap</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Link in bio included free</li>
              <li>✅ No per-brand pricing</li>
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
              <span>Pallyy</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.pallyy}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from Pallyy</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '15 posts/month runs out in less than a week for daily posters',
                desc: 'If you post once a day, Pallyy\'s free plan runs out in 15 days. If you post twice a day, it is gone in a week. The cap forces you to either significantly reduce your posting frequency or pay the monthly fee. SocialMate has no post cap on the free plan — post as much as your strategy calls for with no wall in sight.',
              },
              {
                n: '2',
                title: 'Per-social-set pricing makes Pallyy expensive for multi-brand work',
                desc: 'Pallyy charges $18/month per social set. Managing two brands means $36/month. Three brands means $54/month. Agencies managing five or more clients quickly find themselves paying more than many enterprise tools charge. SocialMate uses flat pricing — the cost does not multiply with the number of brands you manage.',
              },
              {
                n: '3',
                title: 'Link in bio should not be a paid feature in 2026',
                desc: 'Pallyy locks link in bio functionality to paid plans. Most creators need a link in bio page — it is a basic requirement for Instagram, TikTok, and other platforms that do not allow links in posts. SocialMate includes a full link in bio page builder on the free tier, with no upgrade required.',
              },
              {
                n: '4',
                title: 'SocialMate covers platforms Pallyy does not support at all',
                desc: 'Pallyy does not support Discord, Telegram, Mastodon, or Bluesky. If any of your audience lives in Discord communities, Telegram channels, the fediverse, or the Bluesky network, Pallyy cannot reach them. SocialMate supports all four on the free plan with no additional cost.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">No 15-post cap. No per-brand fees. Start free.</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — unlimited posts, link in bio, bulk scheduling, 12 AI tools, 16 platforms. No credit card required.
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
            <Link href="/vs/metricool" className="hover:text-black dark:hover:text-white transition-colors">vs Metricool</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
