import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs Audiense (2026) — Full Comparison',
  description: 'Audiense costs $79+/month for Twitter audience analytics — no scheduling. SocialMate schedules 7 platforms with analytics included, free to start.',
  openGraph: {
    title:       'SocialMate vs Audiense (2026)',
    description: 'Audiense is $79+/month for audience insights only. SocialMate schedules + analyzes 7 platforms — free to start.',
    url:         'https://socialmate.studio/vs/audiense',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/audiense' },
}

const COMPARISON = [
  { feature: 'Starting price',               competitor: '$79/month',                  socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    competitor: '⚠️ Very limited free tier',   socialmate: '✅ 50 credits/month'     },
  { feature: 'Post scheduling',              competitor: '❌ No scheduling at all',     socialmate: '✅ Free across 7 platforms'},
  { feature: 'Twitter audience insights',    competitor: '✅ Enterprise-grade',         socialmate: '✅ Engagement tracking'  },
  { feature: 'TikTok scheduling',             competitor: '❌',                          socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Discord + Telegram',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Mastodon scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',              competitor: '❌ No AI content tools',     socialmate: '12 tools free'           },
  { feature: 'Content calendar',             competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Audience segmentation',         competitor: '✅ Deep (enterprise)',        socialmate: '🔜 Roadmap'              },
  { feature: 'Evergreen recycling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                   competitor: '❌',                          socialmate: '✅ Built in free'         },
  { feature: 'Best-times heatmap',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Team collaboration',            competitor: 'Enterprise pricing',          socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      competitor: '❌',                          socialmate: '✅ Tip jar + fan subs'   },
]

const FAQ = [
  {
    q: 'What is Audiense and what does it actually do?',
    a: 'Audiense is an enterprise-grade Twitter/X audience intelligence platform. It segments your audience into behavioral clusters, identifies influencers within your follower base, maps audience interests, and provides demographic breakdowns. It\'s designed for brands running large-scale campaigns. At $79+/month with no scheduling features, it\'s a pure audience research tool — you\'d still need a separate scheduler on top.',
  },
  {
    q: 'Does Audiense support post scheduling?',
    a: 'No. Audiense does not schedule posts. It\'s audience analytics only. If you\'re using Audiense, you\'re already paying for a separate scheduling tool on top of it. SocialMate combines scheduling across 7 platforms with analytics and best-times insights in one dashboard — free to start.',
  },
  {
    q: 'Who should use Audiense vs SocialMate?',
    a: 'Audiense is for enterprise marketing teams running Twitter/X audience research campaigns at scale — segmenting hundreds of thousands of followers, identifying micro-communities within an audience, powering paid ad targeting. SocialMate is for creators, small businesses, and agencies that need to publish content across 7 platforms, understand performance, and grow. Different tools for different jobs.',
  },
  {
    q: 'Can SocialMate replace Audiense for engagement analytics?',
    a: 'For content performance analytics (engagement rates, best posting times, top posts per platform), yes. SocialMate tracks this across all 7 platforms. For deep audience segmentation, behavioral clusters, and influencer mapping within your followers, Audiense has capabilities SocialMate doesn\'t replicate. If you need both, SocialMate handles the scheduling + performance analytics; Audiense handles deep research.',
  },
  {
    q: 'What makes SocialMate a better value than Audiense for most creators?',
    a: 'Audiense costs $79+/month for analytics only — no scheduling, no AI tools, Twitter-only. SocialMate is free to start and covers scheduling + analytics + AI across 7 platforms including TikTok and LinkedIn. For 99% of creators, the content performance data SocialMate provides is everything they actually need. Audiense\'s enterprise-level audience intelligence is overkill for individual creators and small teams.',
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

export default function VsAudiensePage() {
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
            SocialMate vs Audiense
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Audiense charges $79+/month for Twitter audience analytics with zero scheduling. SocialMate schedules 7 platforms and includes analytics — free to start.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Audiense</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Enterprise audience research, no scheduling</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Deep Twitter audience segmentation</li>
              <li>✅ Behavioral cluster mapping</li>
              <li>✅ Influencer identification within followers</li>
              <li>❌ No post scheduling whatsoever</li>
              <li>❌ Twitter/X only</li>
              <li>❌ $79+/month — requires a separate scheduler</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Schedule + analyze across 7 platforms. Free.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Schedule across X, TikTok, LinkedIn, Bluesky, Discord, Telegram, Mastodon</li>
              <li>✅ Content performance analytics built in</li>
              <li>✅ Best-times heatmap per platform</li>
              <li>✅ Pro plan for $5/month — no second tool needed</li>
              <li>✅ 15+ AI tools free</li>
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
              <span>Audiense</span>
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
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over Audiense</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '$79/month for a tool that can\'t post is hard to justify',
                desc: 'Audiense provides rich audience insights — but no scheduling. You\'re paying $79+/month for research, then spending more on a separate publisher. SocialMate combines scheduling + analytics for free, with Pro at $5/month. For creators and small businesses, that\'s a $940+/year saving while gaining scheduling capabilities Audiense will never have.',
              },
              {
                n: '2',
                title: 'Content performance is more actionable than audience research',
                desc: 'Knowing your audience segments is interesting. Knowing which posts got the most engagement, which posting times drive clicks, and which platform performs best for your content — that\'s what moves the needle. SocialMate\'s analytics focuses on content performance data you can act on immediately.',
              },
              {
                n: '3',
                title: 'Platform coverage beyond Twitter/X matters',
                desc: 'Audiense is Twitter/X only. If you want audience insights or scheduling for TikTok, LinkedIn, Bluesky, Discord, or Telegram, Audiense can\'t help. SocialMate covers all 7 from one dashboard with engagement data across every connected platform.',
              },
              {
                n: '4',
                title: 'SOMA turns insights into content automatically',
                desc: 'Understanding your audience is step one. Creating content for them is the work. SocialMate\'s SOMA AI system uses your voice profile to generate a full week of posts for every connected platform. The gap from "I know my audience" to "content is publishing" is closed automatically.',
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Analytics that actually help you post</p>
          <h2 className="text-3xl font-extrabold mb-4">Schedule + analyze across 7 platforms</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            SocialMate gives you scheduling and performance analytics in one platform.
            Free plan available. Pro is $5/month — no separate analytics tool needed.
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
