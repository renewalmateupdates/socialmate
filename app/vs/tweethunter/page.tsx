import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs TweetHunter (2026) — Full Comparison',
  description: 'TweetHunter costs $49/month for X/Twitter-only scheduling. SocialMate schedules X, LinkedIn, TikTok, Bluesky, Discord, Telegram, and Mastodon — starting free.',
  openGraph: {
    title:       'SocialMate vs TweetHunter (2026)',
    description: 'TweetHunter is $49/month for X/Twitter alone. SocialMate is free — and covers 7 platforms including X and LinkedIn.',
    url:         'https://socialmate.studio/vs/tweethunter',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/tweethunter' },
}

const COMPARISON = [
  { feature: 'Starting price',               competitor: '$49/month',                    socialmate: '$0 — free forever'       },
  { feature: 'Platforms supported',           competitor: 'X / Twitter only',             socialmate: '7 platforms'             },
  { feature: 'Free plan',                    competitor: '❌ No free plan',               socialmate: '✅ 50 credits/month'     },
  { feature: 'X / Twitter scheduling',        competitor: '✅',                            socialmate: '✅ Free (5 tweets/mo)'   },
  { feature: 'LinkedIn scheduling',           competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             competitor: '❌',                            socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'Bluesky scheduling',            competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Discord + Telegram',            competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Mastodon',                      competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Thread scheduling',             competitor: '✅ (X threads only)',           socialmate: '✅ Multi-platform threads'},
  { feature: 'AI writing tools',              competitor: '✅ (paid — X focused)',         socialmate: '12 tools free'           },
  { feature: 'Content calendar',             competitor: '✅ (paid)',                     socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             competitor: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',           competitor: '✅ (paid)',                    socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                   competitor: '❌',                            socialmate: '✅ Built in free'         },
  { feature: 'Analytics',                     competitor: '✅ X only',                    socialmate: '✅ Multi-platform'       },
  { feature: 'Team collaboration',            competitor: '$79+/month',                   socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      competitor: '❌',                            socialmate: '✅ Tip jar + fan subs'   },
]

const FAQ = [
  {
    q: 'Is TweetHunter worth $49/month for X/Twitter only?',
    a: 'TweetHunter has strong X-specific features — viral tweet inspiration, engagement analytics, and DM automation. But at $49/month minimum, you\'re paying nearly $600/year for a single-platform tool. SocialMate covers X plus 6 other platforms starting free. If X is your only channel, TweetHunter has depth. If you post anywhere else, you\'ll need a second tool.',
  },
  {
    q: 'Can SocialMate replace TweetHunter for X/Twitter scheduling?',
    a: 'For scheduling X/Twitter posts and threads, yes. SocialMate posts directly to X via the official API and supports multi-part threads. The main TweetHunter-specific feature SocialMate doesn\'t replicate is its viral tweet database (inspiration from top-performing tweets). For core scheduling, thread queuing, and evergreen recycling, SocialMate handles it free.',
  },
  {
    q: 'Does SocialMate support Twitter threads?',
    a: 'Yes. SocialMate\'s compose thread builder lets you create numbered thread parts with individual character counters and auto-split logic. Threads submit as sequential posts. This works across X, Bluesky, and Mastodon simultaneously — TweetHunter can only post X threads.',
  },
  {
    q: 'What AI tools does SocialMate include for X content?',
    a: 'SocialMate\'s 15+ AI tools include hook writing (critical for X engagement), thread generation, caption rewriting for punchy X tone, hashtag research, and content repurposing (turn a LinkedIn post into an X thread). SOMA can generate a full week of X content automatically based on your voice profile.',
  },
  {
    q: 'Does SocialMate have analytics for X/Twitter?',
    a: 'SocialMate tracks engagement across connected platforms. X/Twitter API access provides engagement data on posts published through SocialMate. For deep X-specific metrics like profile impressions and audience demographics, X\'s native analytics remains more detailed. SocialMate adds value in cross-platform comparison — seeing how your X content performs vs Bluesky or LinkedIn.',
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

export default function VsTweetHunterPage() {
  return (
    <div className="dark min-h-screen bg-gray-950">
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
            Updated May 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-white">
            SocialMate vs TweetHunter
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            TweetHunter charges $49/month for X/Twitter-only scheduling. SocialMate covers X plus 6 other platforms — starting completely free.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">TweetHunter</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Deep X/Twitter focus, premium price</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Viral tweet inspiration database</li>
              <li>✅ X-specific engagement analytics</li>
              <li>✅ DM automation for X</li>
              <li>❌ X/Twitter only — no other platforms</li>
              <li>❌ $49/month minimum — no free plan</li>
              <li>❌ No LinkedIn, TikTok, Discord, Bluesky</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">X + 6 more platforms. Free to start.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ X + LinkedIn + TikTok + Bluesky + Discord + Telegram + Mastodon</li>
              <li>✅ Thread builder across multiple platforms</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ Pro plan for $5/month total</li>
              <li>✅ SOMA AI content system built in</li>
              <li>✅ No credit card required to start</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Feature comparison</h2>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span>Feature</span>
              <span>TweetHunter</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.competitor}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over TweetHunter</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '$49/month for one platform is hard to justify',
                desc: 'TweetHunter\'s entry price is $49/month — nearly $600/year — locked to X/Twitter alone. SocialMate schedules X posts free, and for $5/month you unlock Pro features across 7 platforms. If you post anywhere besides X, TweetHunter forces you to pay for a second tool on top.',
              },
              {
                n: '2',
                title: 'Audiences live on more than just X',
                desc: 'X/Twitter is powerful for real-time conversation and building a following, but creators also run Discord communities, Telegram channels, LinkedIn profiles, and TikTok accounts. TweetHunter can\'t touch any of those. SocialMate schedules all 7 from one composer with one subscription.',
              },
              {
                n: '3',
                title: 'TikTok and LinkedIn are where the growth is',
                desc: 'TikTok\'s organic reach is unmatched in 2026 — the algorithm still surfaces content to non-followers. LinkedIn is exploding for B2B and professional creators. TweetHunter ignores both. SocialMate schedules TikTok (free, 20 videos/mo) and LinkedIn (live via official API) with no extra cost.',
              },
              {
                n: '4',
                title: 'SOMA handles your X content strategy end-to-end',
                desc: 'SocialMate\'s SOMA AI system generates a full week of cross-platform content including X posts and threads. Define your voice, topics, and cadence — SOMA writes and schedules everything. No other tool does this for $5/month across 7 platforms including X.',
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

        {/* BOTTOM CTA */}
        <div className="text-center py-12 bg-black text-white rounded-3xl px-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">7 platforms for $5/month</p>
          <h2 className="text-3xl font-extrabold mb-4">Schedule X posts — and 6 more platforms</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            SocialMate posts to X/Twitter via the official API. Schedule threads, set post times, recycle evergreen content.
            When you&apos;re ready to go further, Pro is $5/month for all 7 platforms.
          </p>
          <Link href="/signup" className="inline-block px-8 py-3 bg-white text-black font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
            Start free — no credit card →
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link href="/vs" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            ← View all comparisons
          </Link>
        </div>

      </div>
      <PublicFooter />
    </div>
  )
}
