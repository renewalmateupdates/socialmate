import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs Taplio (2026) — Full Comparison',
  description: 'Taplio costs $39–$79/month for LinkedIn-only scheduling. SocialMate schedules LinkedIn, Bluesky, X, TikTok, Discord, Telegram, and Mastodon — starting free.',
  openGraph: {
    title:       'SocialMate vs Taplio (2026)',
    description: 'Taplio is $39/month for LinkedIn alone. SocialMate is free — and covers 7 platforms including LinkedIn.',
    url:         'https://socialmate.studio/vs/taplio',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/taplio' },
}

const COMPARISON = [
  { feature: 'Starting price',               taplio: '$39/month',                socialmate: '$0 — free forever'       },
  { feature: 'Platforms supported',           taplio: 'LinkedIn only',             socialmate: '7 platforms'             },
  { feature: 'Free plan',                    taplio: '❌ No free plan',            socialmate: '✅ 50 credits/month'     },
  { feature: 'LinkedIn scheduling',           taplio: '✅',                         socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            taplio: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'X / Twitter scheduling',        taplio: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             taplio: '❌',                         socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'Discord + Telegram',            taplio: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Mastodon',                      taplio: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',              taplio: '✅ (paid — carousel gen)',   socialmate: '15+ tools free'           },
  { feature: 'Content calendar',             taplio: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              taplio: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             taplio: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',           taplio: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                   taplio: '❌',                         socialmate: '✅ Built in free'         },
  { feature: 'Competitor tracking',           taplio: '✅ (LinkedIn only, paid)',   socialmate: '✅ Free (3 accounts)'    },
  { feature: 'Engagement analytics',          taplio: '✅ LinkedIn only',           socialmate: '✅ Multi-platform'       },
  { feature: 'Team collaboration',            taplio: '$59+/month',                socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      taplio: '❌',                         socialmate: '✅ Tip jar + fan subs'   },
]

const FAQ = [
  {
    q: 'Is Taplio worth $39/month for LinkedIn only?',
    a: 'Taplio provides solid LinkedIn-specific features — AI carousels, post analytics, lead tracking. But at $39/month, you\'re paying a significant premium for a single-platform tool. If LinkedIn is your only channel, Taplio has depth. If you post to multiple platforms at all, SocialMate costs nothing and covers 7 of them.',
  },
  {
    q: 'Can SocialMate replace Taplio for LinkedIn scheduling?',
    a: 'For scheduling LinkedIn posts, yes — SocialMate uses the official LinkedIn UGC Posts API and publishes on your behalf at any scheduled time. The main Taplio feature SocialMate doesn\'t replicate is AI LinkedIn carousel generation (PDF slide posts). If you use carousels heavily, that\'s a real Taplio differentiator. For text + link posts, SocialMate handles it free.',
  },
  {
    q: 'Does SocialMate support LinkedIn personal profiles and company pages?',
    a: 'SocialMate currently supports LinkedIn personal profiles via OAuth. Company page support is on the roadmap. Taplio supports both personal and company pages on paid plans.',
  },
  {
    q: 'What AI tools does SocialMate include for LinkedIn content?',
    a: 'SocialMate\'s 15+ AI tools include LinkedIn-specific capabilities: long-form post generation, hook writing (critical for LinkedIn\'s algorithm), content repurposing (turn a tweet thread into a LinkedIn post), caption rewriting with professional tone, and hashtag research optimized for LinkedIn reach.',
  },
  {
    q: 'Does SocialMate have LinkedIn analytics?',
    a: 'SocialMate tracks engagement across all connected platforms. LinkedIn API returns limited public analytics compared to native LinkedIn analytics. For deep LinkedIn-specific metrics (profile views, post impressions, follower demographics), LinkedIn\'s native analytics dashboard remains the best source.',
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

export default function VsTaplioPage() {
  return (
    <div className="dark min-h-screen bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* NAV */}
      <nav className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
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
            SocialMate vs Taplio
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Taplio charges $39/month for LinkedIn-only scheduling. SocialMate covers LinkedIn plus 6 other platforms — starting completely free.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Taplio</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Deep LinkedIn focus, high price</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ AI carousel / PDF post generator</li>
              <li>✅ LinkedIn-specific analytics</li>
              <li>✅ Lead tracking and DM automation</li>
              <li>❌ LinkedIn only — no other platforms</li>
              <li>❌ $39/month minimum — no free plan</li>
              <li>❌ No Discord, Telegram, TikTok, Bluesky</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">LinkedIn + 6 more. Free to start.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ LinkedIn + Bluesky + X + TikTok + Discord + Telegram + Mastodon</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ Bulk scheduling and RSS import free</li>
              <li>✅ Pro plan for $5/month total</li>
              <li>✅ Creator Monetization Hub built in</li>
              <li>✅ No credit card required to start</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Feature comparison</h2>
          <div className="overflow-x-auto"><div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span>Feature</span>
              <span>Taplio</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.taplio}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over Taplio</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '$39/month for one platform is hard to justify',
                desc: 'Taplio\'s entry price is $39/month. That\'s $468/year to schedule posts on LinkedIn. SocialMate schedules LinkedIn posts free, and for $5/month you get Pro features across 7 platforms including LinkedIn. If you post anywhere besides LinkedIn, Taplio forces you to pay for a second tool.',
              },
              {
                n: '2',
                title: 'Your audience isn\'t only on LinkedIn',
                desc: 'LinkedIn is powerful for B2B and professional content. But creators, builders, and consultants also run Discord communities, Telegram channels, X/Twitter accounts, and Bluesky feeds. Taplio can\'t reach any of those. SocialMate covers all 7 platforms from one composer.',
              },
              {
                n: '3',
                title: 'Taplio\'s AI carousel feature is real — but narrow',
                desc: 'If PDF carousels are your primary LinkedIn format, Taplio\'s AI carousel generator is a genuine differentiator. SocialMate doesn\'t replicate that specific format. But for text posts, long-form posts, link sharing, and cross-platform repurposing — SocialMate\'s 15+ AI tools cover everything else free.',
              },
              {
                n: '4',
                title: 'SOMA handles your LinkedIn content strategy end-to-end',
                desc: 'SocialMate\'s SOMA AI system generates a full week of content across all connected platforms including LinkedIn. You define your voice, your topics, your posting cadence — SOMA writes and schedules everything. No other tool does this for $5/month across 7 platforms.',
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
          <h2 className="text-3xl font-extrabold mb-4">Schedule LinkedIn posts free</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            SocialMate connects to LinkedIn via official OAuth. Post now or schedule for later — free on every plan.
            When you&apos;re ready to go further, Pro is $5/month for 7 platforms.
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
