import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs PromoRepublic (2026) — Full Comparison',
  description: 'PromoRepublic costs $49/month with no TikTok or LinkedIn free tier. SocialMate covers 7 platforms including TikTok and LinkedIn — starting free.',
  openGraph: {
    title:       'SocialMate vs PromoRepublic (2026)',
    description: 'PromoRepublic is $49/month with no TikTok. SocialMate is free — 7 platforms, TikTok free, LinkedIn live.',
    url:         'https://socialmate.studio/vs/promo-republic',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/promo-republic' },
}

const COMPARISON = [
  { feature: 'Starting price',               competitor: '$49/month',                  socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    competitor: '❌ No free plan',             socialmate: '✅ 50 credits/month'     },
  { feature: 'TikTok scheduling',             competitor: '❌ No TikTok',               socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           competitor: '✅ (paid, limited)',          socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Discord scheduling',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Mastodon scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',              competitor: '✅ Template library (paid)',  socialmate: '15+ AI tools free'        },
  { feature: 'Content calendar',             competitor: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              competitor: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'White label',                   competitor: '✅ (enterprise pricing)',     socialmate: '✅ $20–$40/month'        },
  { feature: 'Link in bio',                   competitor: '❌',                          socialmate: '✅ Built in free'         },
  { feature: 'Analytics',                     competitor: '✅ Paid',                    socialmate: '✅ Multi-platform free'  },
  { feature: 'Team collaboration',            competitor: '$79+/month',                 socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      competitor: '❌',                          socialmate: '✅ Tip jar + fan subs'   },
]

const FAQ = [
  {
    q: 'What is PromoRepublic and who uses it?',
    a: 'PromoRepublic is a social media scheduling and content marketing platform targeting franchises, agencies, and multi-location businesses. It has a large template library and white-label features for agencies. At $49/month minimum (enterprise plans go much higher), it\'s positioned as a business-tier tool. SocialMate undercuts it significantly at $5/month Pro with more platform coverage.',
  },
  {
    q: 'Does PromoRepublic support TikTok?',
    a: 'No. PromoRepublic does not support TikTok scheduling. This is a major gap for any brand wanting to reach younger audiences in 2026. SocialMate includes TikTok scheduling free — 20 videos/month on the free plan — using the official TikTok Production API approved in May 2026.',
  },
  {
    q: 'Can SocialMate serve agency use cases like PromoRepublic?',
    a: 'SocialMate\'s Agency plan ($20/month) includes client workspaces, 15 team seats, 2,000 AI credits/month, and white label options ($20–$40/month add-on). For agencies managing multiple client accounts across 7 platforms including TikTok and LinkedIn, SocialMate delivers enterprise-adjacent features at a fraction of PromoRepublic\'s pricing.',
  },
  {
    q: 'How does SocialMate\'s content creation compare to PromoRepublic\'s template library?',
    a: 'PromoRepublic\'s strength is its large library of pre-built visual templates for holidays, promotions, and events. SocialMate\'s strength is AI-generated text content via 15+ tools including SOMA, which auto-generates a full week of posts tailored to your voice and niche. If you need pre-made graphics, PromoRepublic has depth. For AI-written content across 7 platforms, SocialMate leads.',
  },
  {
    q: 'Is SocialMate suitable for franchises and multi-location businesses?',
    a: 'SocialMate\'s client workspace system and team collaboration tools work for multi-location management. Each client workspace is isolated with its own connected accounts, posts, and analytics. White label options let agencies brand the tool for clients. For the specific franchise-network use cases PromoRepublic targets, SocialMate covers the core scheduling needs at dramatically lower cost.',
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

export default function VsPromoRepublicPage() {
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
            SocialMate vs PromoRepublic
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            PromoRepublic charges $49/month with no TikTok support. SocialMate covers TikTok, LinkedIn, and 5 more platforms — free to start, $5/month Pro.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">PromoRepublic</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Agency / franchise tool, enterprise price</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Large design template library</li>
              <li>✅ White label for agencies</li>
              <li>✅ Multi-location management</li>
              <li>❌ No TikTok scheduling</li>
              <li>❌ $49/month minimum — no free plan</li>
              <li>❌ No Discord or Telegram</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">TikTok + LinkedIn + 5 more. $5/month.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ TikTok free (20 videos/mo) — PromoRepublic has none</li>
              <li>✅ X + LinkedIn + Bluesky + Discord + Telegram + Mastodon</li>
              <li>✅ 15+ AI tools free</li>
              <li>✅ White label add-on from $20/month</li>
              <li>✅ Client workspaces on Agency plan</li>
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
              <span>PromoRepublic</span>
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
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over PromoRepublic</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'TikTok is the most important platform PromoRepublic ignores',
                desc: 'PromoRepublic has no TikTok support. In 2026, TikTok is the highest-reach platform for organic discovery — the algorithm surfaces content to non-followers at scale. SocialMate schedules TikTok for free (20 videos/month) using the official Production API. Your competitors are already on TikTok.',
              },
              {
                n: '2',
                title: '10x cheaper at the Pro tier',
                desc: 'PromoRepublic starts at $49/month — nearly $600/year. SocialMate Pro is $5/month — $60/year for 7 platforms including TikTok and LinkedIn. That\'s a $540/year saving for more platform coverage. Agency plan is $20/month with client workspaces and white label.',
              },
              {
                n: '3',
                title: 'AI content generation beats static templates',
                desc: 'PromoRepublic\'s template library is broad but static — you still write the copy. SocialMate\'s SOMA AI system generates fully written posts based on your voice, audience, and niche. 15+ AI tools handle hook writing, repurposing, hashtag research, and full-week content calendars. AI-first beats template-first.',
              },
              {
                n: '4',
                title: 'Discord and Telegram scheduling — no other tool offers this',
                desc: 'PromoRepublic can\'t touch Discord or Telegram. If you run a community on either platform, SocialMate is the only affordable scheduler that covers all your channels. Schedule Discord announcements, Telegram posts, and social media from the same content queue.',
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">$5/month vs $49/month</p>
          <h2 className="text-3xl font-extrabold mb-4">More platforms. Way less cost.</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            SocialMate covers TikTok, LinkedIn, X, Bluesky, Discord, Telegram, and Mastodon.
            Free plan available. Pro is $5/month. Agency is $20/month.
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
