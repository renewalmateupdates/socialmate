import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Buffer (2026) — Full Comparison',
  description: "Buffer's free plan limits you to 3 channels and 10 queued posts total. SocialMate's free plan includes bulk scheduling, no channel cap, and 12 AI tools.",
  openGraph: {
    title:       'SocialMate vs Buffer (2026)',
    description: "Buffer free plan: 3 channels, 10 queued posts, no bulk scheduling. SocialMate free plan: no channel cap, bulk scheduler included, 12 AI tools.",
    url:         'https://socialmate.studio/vs/buffer',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/buffer' },
}

const COMPARISON = [
  { feature: 'Starting price',          buffer: '$6/month (Essentials)',     socialmate: '$0 — free forever'       },
  { feature: 'Free plan channels',      buffer: '3 channels',                socialmate: 'No hard cap'             },
  { feature: 'Free plan queue limit',   buffer: '10 posts per channel',      socialmate: 'Unlimited'               },
  { feature: 'Bulk scheduling',         buffer: '❌ Not available',           socialmate: '✅ Free'                  },
  { feature: 'Analytics',              buffer: 'Paid add-on',               socialmate: '✅ Built-in free'         },
  { feature: 'Engagement / Reply inbox', buffer: 'Paid add-on',             socialmate: '✅ Included'              },
  { feature: 'Discord support',         buffer: '❌',                         socialmate: '✅'                      },
  { feature: 'Telegram support',        buffer: '❌',                         socialmate: '✅'                      },
  { feature: 'Mastodon support',        buffer: '❌',                         socialmate: '✅'                      },
  { feature: 'Bluesky support',         buffer: '✅ (basic)',                 socialmate: '✅'                      },
  { feature: 'AI writing tools',        buffer: 'AI assistant (paid)',       socialmate: '12 tools included free'  },
  { feature: 'AI credits free tier',    buffer: 'None on free plan',         socialmate: '75/month free'            },
  { feature: 'Link in bio',             buffer: 'Start page (limited free)', socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',         buffer: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',     buffer: '❌',                         socialmate: '✅ Free (3 accounts)'    },
  { feature: 'RSS import',              buffer: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',     buffer: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Team seats (free)',        buffer: '1',                         socialmate: '2'                       },
  { feature: 'Client workspaces',       buffer: 'Not available',             socialmate: 'Pro+: from $5/mo'        },
]

const FAQ = [
  {
    q: "How limited is Buffer's free plan really?",
    a: "Buffer free limits you to 3 connected channels and only 10 queued posts per channel at any given time. That means if you post daily, you can only schedule 10 days out. There is no bulk scheduling, no AI tools, and no analytics on the free plan. SocialMate's free plan has none of these caps.",
  },
  {
    q: 'Did Buffer remove their analytics and reply tools?',
    a: 'Yes. Buffer separated their analytics (formerly Buffer Analyze) and engagement inbox (formerly Buffer Reply) into paid add-ons. If you want a complete tool in one product, you will pay extra — or choose SocialMate, where analytics and engagement are built in.',
  },
  {
    q: 'Does SocialMate have a post queue like Buffer?',
    a: "Yes. SocialMate has a full scheduling calendar and queue system. Unlike Buffer, there is no 10-post limit on the queue. You can schedule months of content at once using the bulk scheduler — free.",
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. Free tier includes unlimited posts, 75 AI credits/month, bulk scheduling, link in bio, hashtag manager, competitor tracking, RSS import, and evergreen recycling. No credit card required.',
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

export default function VsBufferPage() {
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
            SocialMate vs Buffer
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Buffer free plan: 3 channels, 10 queued posts, no bulk scheduling. SocialMate free plan: no caps, bulk scheduler, 12 AI tools included.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Buffer</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Simple scheduler, fragmented feature set</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Clean, simple UI</li>
              <li>✅ Reliable posting queue</li>
              <li>❌ Free plan capped at 3 channels + 10 posts</li>
              <li>❌ No bulk scheduling on any plan</li>
              <li>❌ Analytics and Reply tools are paid add-ons</li>
              <li>❌ No Discord, Telegram, or Mastodon support</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Everything in one. No add-ons. No caps.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Unlimited posts, no queue cap</li>
              <li>✅ Bulk scheduling free</li>
              <li>✅ Analytics built in — no add-on</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
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
              <span>Buffer</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.buffer}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from Buffer</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'The free plan queue limit is unusable for real content',
                desc: 'Buffer lets you queue only 10 posts per channel on the free plan. That is less than two weeks of daily posting. Once you hit the limit you either pay or manually delete old posts to make room. SocialMate has no queue limit at all.',
              },
              {
                n: '2',
                title: 'Buffer dropped bulk scheduling entirely',
                desc: "Buffer has never had a true bulk scheduler. If you want to upload 30 posts at once from a CSV or spreadsheet, you cannot do it in Buffer on any plan. SocialMate's bulk scheduler is free and supports mass CSV uploads.",
              },
              {
                n: '3',
                title: 'Analytics and Reply are separate paid products now',
                desc: 'Buffer spun off their analytics and engagement inbox into add-ons after years of being bundled. You now need to pay separately for features that used to be included. SocialMate keeps analytics and engagement built in at no extra cost.',
              },
              {
                n: '4',
                title: 'SocialMate covers platforms Buffer does not',
                desc: 'Discord, Telegram, and Mastodon are not supported by Buffer. If your community exists on any of these platforms, Buffer simply cannot help you. SocialMate covers all three on the free plan.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Done working around Buffer&apos;s limits?</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is unlimited posts, bulk scheduling, 12 AI tools, 16 platforms — completely free to start. No credit card required.
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
            <Link href="/vs/sendible" className="hover:text-black dark:hover:text-white transition-colors">vs Sendible</Link>
            <Link href="/vs/later" className="hover:text-black dark:hover:text-white transition-colors">vs Later</Link>
            <Link href="/vs/metricool" className="hover:text-black dark:hover:text-white transition-colors">vs Metricool</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
