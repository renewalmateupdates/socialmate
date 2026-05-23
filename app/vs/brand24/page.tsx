import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs Brand24 (2026) — Full Comparison',
  description: 'Brand24 charges $79/month for social monitoring only — no scheduling. SocialMate gives you scheduling across 7 platforms, 12 AI tools, and monitoring features — starting free.',
  openGraph: {
    title:       'SocialMate vs Brand24 (2026)',
    description: 'Brand24 is $79/month for monitoring only. SocialMate schedules, monitors, and creates content across 7 platforms — free to start.',
    url:         'https://socialmate.studio/vs/brand24',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/brand24' },
}

const COMPARISON = [
  { feature: 'Starting price',               brand24: '$79/month',                   socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    brand24: '❌ 14-day trial only',         socialmate: '✅ 50 credits/month'     },
  { feature: 'Post scheduling',              brand24: '❌ Monitoring only',           socialmate: '✅ Full scheduling suite' },
  { feature: 'Platforms supported',           brand24: 'Monitoring only (20+ sources)', socialmate: '7 platforms — scheduling + monitoring' },
  { feature: 'Discord scheduling',            brand24: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           brand24: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            brand24: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             brand24: '❌',                           socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           brand24: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Brand mention monitoring',      brand24: '✅ (core feature)',            socialmate: '✅ Competitor tracking'  },
  { feature: 'AI writing tools',              brand24: '❌',                           socialmate: '12 tools free'           },
  { feature: 'Autonomous content system',     brand24: '❌',                           socialmate: '✅ SOMA — learns your voice' },
  { feature: '8 autonomous AI agents',        brand24: '❌',                           socialmate: '✅ Pro+'                  },
  { feature: 'Content calendar',             brand24: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              brand24: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Link in bio (SIGIL)',           brand24: '❌',                           socialmate: '✅ Built in free'         },
  { feature: 'Team collaboration',            brand24: '✅ ($149+)',                   socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      brand24: '❌',                           socialmate: '✅ Tip jar + fan subs'   },
  { feature: 'SM-Give charity program',       brand24: '❌',                           socialmate: '✅ 2% of revenue donated' },
]

const FAQ = [
  {
    q: 'What does Brand24 actually do?',
    a: "Brand24 is a social listening and monitoring platform. It tracks mentions of your brand, competitors, or keywords across social media, forums, blogs, news, and podcasts. It shows sentiment analysis, reach estimates, and influence scores for mentions. What it does NOT do is schedule social media posts. Brand24 is a monitoring tool, not a scheduler.",
  },
  {
    q: 'Can SocialMate replace Brand24 for monitoring?',
    a: "SocialMate includes competitor tracking — you can track up to 3 competitor accounts and receive alerts when they post. This covers the core use case most creators need from monitoring tools: keeping an eye on what competitors are doing. Brand24's monitoring is more comprehensive (tracking mentions across the entire web, not just social accounts), so if you need deep web-wide monitoring, Brand24 is more specialized. But if you need both scheduling AND basic monitoring, SocialMate does both for less.",
  },
  {
    q: 'Why does SocialMate cost less than Brand24 if it does more?',
    a: "Brand24 is priced for marketing teams and PR agencies who need comprehensive brand monitoring. $79/month for monitoring alone reflects that enterprise positioning. SocialMate is built for individual creators, small businesses, and agencies who need scheduling + AI tools + basic monitoring — priced at $0 to start and $5/month for Pro. Different markets, different pricing models.",
  },
  {
    q: 'Does SocialMate have social listening features?',
    a: "SocialMate includes SM Radar — a 20-credit AI-powered content intelligence report that analyzes your niche for content gaps, competitor weak spots, best formats, hook styles, and one concrete opportunity for this week. It also includes SM Pulse for trending topic scans in your niche. These are AI-generated insights rather than real-time web monitoring, but they serve the core use case: knowing what to post and how to beat competitors on content.",
  },
  {
    q: 'Does SocialMate support the same platforms as Brand24?',
    a: "Brand24 monitors mentions across 20+ web sources including social platforms, news sites, blogs, forums, and podcasts. SocialMate schedules and publishes posts to 7 live social platforms: Discord, Telegram, Bluesky, TikTok, LinkedIn, X/Twitter, and Mastodon. They serve different functions — Brand24 listens, SocialMate publishes. For creators who need to post content, SocialMate is the correct tool.",
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

export default function VsBrand24Page() {
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
            Updated May 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 dark:text-white">
            SocialMate vs Brand24
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Brand24 charges $79/month for monitoring only — no scheduling. SocialMate schedules, creates, and monitors content across 7 platforms. Starts free.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Brand24</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Monitoring only, high price</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Comprehensive web-wide mention tracking</li>
              <li>✅ Sentiment analysis + influence scores</li>
              <li>✅ 20+ monitored sources (news, forums, podcasts)</li>
              <li>❌ $79/month — no free plan</li>
              <li>❌ Cannot schedule or publish posts</li>
              <li>❌ No AI writing or content generation</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Schedule + create + monitor. Free.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Full scheduling to 7 platforms</li>
              <li>✅ Competitor tracking + post alerts</li>
              <li>✅ 12 AI tools including SM Pulse + SM Radar</li>
              <li>✅ SOMA autonomous content generation</li>
              <li>✅ Pro plan for $5/month total</li>
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
              <span>Brand24</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.brand24}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over Brand24</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: "Brand24 monitors — it can't publish",
                desc: "Brand24 is excellent at what it does: tracking mentions and sentiment across the web. But it literally cannot schedule or publish a single social media post. If you need to both publish content and keep an eye on what's happening, you'd need Brand24 plus a separate scheduler. SocialMate handles both from one platform.",
              },
              {
                n: '2',
                title: '$79/month for monitoring vs. $0 for everything',
                desc: "Brand24's lowest plan is $79/month for just monitoring. SocialMate's free plan includes scheduling to 7 platforms, 12 AI tools, competitor tracking, and a link-in-bio page. Pro is $5/month. You're comparing $79/month for one narrow function against $5/month for a full creator platform.",
              },
              {
                n: '3',
                title: 'SM Radar gives you actionable content intelligence',
                desc: "SocialMate's SM Radar (20 credits) runs an AI content intelligence report on your niche: content gaps, competitor weak spots, best-performing formats, hook styles, and one specific opportunity for this week. It's not web-wide brand mention tracking, but for creators focused on what to post, it's directly useful — and it's built right into the platform.",
              },
              {
                n: '4',
                title: 'Competitor tracking is built into the free plan',
                desc: "SocialMate includes competitor tracking for up to 3 accounts on the free plan. You get alerts when competitors post, and the Trend Scout agent automatically analyzes competitor activity to surface trending content angles. This gives you the core insight loop most creators need from monitoring tools — all within a platform that also schedules and creates content.",
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">The obvious choice</p>
          <h2 className="text-3xl font-extrabold mb-4">Schedule, create, and monitor — free</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            SocialMate schedules posts to 7 platforms, tracks competitors, and uses AI to generate what to post next.
            Start free. Pro is $5/month.
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
