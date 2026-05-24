import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs Emplifi (2026) — Full Comparison',
  description: 'Emplifi (formerly Socialbakers) charges $200+/month for enterprise social management. SocialMate gives creators and agencies 7 platforms, 15+ AI tools, and SOMA — starting free.',
  openGraph: {
    title:       'SocialMate vs Emplifi (2026)',
    description: 'Emplifi is $200+/month enterprise pricing. SocialMate is free — 7 platforms, 15+ AI tools, and autonomous content generation.',
    url:         'https://socialmate.studio/vs/emplifi',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/emplifi' },
}

const COMPARISON = [
  { feature: 'Starting price',               emplifi: '$200+/month (enterprise)',     socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    emplifi: '❌ No free plan',              socialmate: '✅ 50 credits/month'     },
  { feature: 'Target audience',              emplifi: 'Enterprise only',              socialmate: 'Creators, teams, agencies' },
  { feature: 'Discord scheduling',            emplifi: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           emplifi: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            emplifi: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             emplifi: '✅ (enterprise)',              socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           emplifi: '✅ (enterprise)',              socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',              emplifi: '✅ (enterprise paid)',         socialmate: '12 tools free'           },
  { feature: 'Autonomous content system',     emplifi: '❌',                           socialmate: '✅ SOMA — learns your voice' },
  { feature: '8 autonomous AI agents',        emplifi: '❌',                           socialmate: '✅ Pro+'                  },
  { feature: 'Enterprise analytics',          emplifi: '✅ (deep BI-level)',           socialmate: '✅ Multi-platform (creator-level)' },
  { feature: 'Content calendar',             emplifi: '✅ (enterprise)',              socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              emplifi: '✅ (enterprise)',              socialmate: '✅ Free'                  },
  { feature: 'Link in bio (SIGIL)',           emplifi: '❌',                           socialmate: '✅ Built in free'         },
  { feature: 'Team collaboration',            emplifi: '✅ (enterprise-scale)',        socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      emplifi: '❌',                           socialmate: '✅ Tip jar + fan subs'   },
  { feature: 'SM-Give charity program',       emplifi: '❌',                           socialmate: '✅ 2% of revenue donated' },
]

const FAQ = [
  {
    q: 'What is Emplifi and who is it for?',
    a: "Emplifi (formerly Socialbakers, acquired by Astute) is an enterprise social media platform combining publishing, analytics, community management, and influencer marketing. It's designed for large brands and agencies with dedicated social media teams. Pricing starts around $200/month and scales up based on seats and features. It's a powerful tool — but it's not designed for individual creators, small businesses, or lean agencies.",
  },
  {
    q: 'Can SocialMate replace Emplifi?',
    a: "For enterprise-scale operations with hundreds of social accounts and large teams, Emplifi's depth is hard to replicate. But for creators, small agencies, and businesses who need reliable multi-platform scheduling, AI content tools, and team collaboration — SocialMate covers everything at a fraction of the cost. SocialMate's free plan alone does more than many paid tiers of tools in Emplifi's price range.",
  },
  {
    q: 'Does SocialMate support the same platforms as Emplifi?',
    a: "SocialMate has 7 live platforms: Discord, Telegram, Bluesky, TikTok, LinkedIn, X/Twitter, and Mastodon. Emplifi supports Facebook, Instagram, Twitter, LinkedIn, YouTube, TikTok, and more. The key difference: SocialMate supports Discord and Telegram — community platforms that Emplifi and most enterprise tools skip entirely.",
  },
  {
    q: 'What AI tools does SocialMate include?',
    a: "SocialMate's 15+ AI tools include caption generation, viral hook writing, content repurposing (6 formats), hashtag research, thread generation, post rewriting, post scoring, brand voice injection, SM Pulse (trend scan), SM Radar (content intelligence), and SOMA — an autonomous content agent that generates a full week of platform-native posts automatically.",
  },
  {
    q: 'Why choose SocialMate over an enterprise tool like Emplifi?',
    a: "Emplifi is built for social media teams at enterprise companies — it comes with enterprise complexity, enterprise onboarding, and enterprise pricing. SocialMate is self-serve: sign up, connect your accounts, start posting in minutes. Free forever. If you're a creator, solo founder, small business, or lean agency, you don't need enterprise infrastructure — you need something fast, affordable, and built for how you actually work.",
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

export default function VsEmplifPage() {
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
            SocialMate vs Emplifi
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Emplifi is $200+/month enterprise pricing — built for large social teams. SocialMate covers 7 platforms with AI built in. Starts free.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Emplifi</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Enterprise tool, enterprise price</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Deep enterprise analytics + BI integrations</li>
              <li>✅ Influencer marketing suite</li>
              <li>✅ Enterprise team workflows</li>
              <li>❌ $200+/month — no free plan, no self-serve</li>
              <li>❌ No Discord or Telegram scheduling</li>
              <li>❌ No autonomous content generation like SOMA</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Built for creators. Self-serve. Free.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Discord + Telegram + Bluesky + TikTok + LinkedIn + X + Mastodon</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ SOMA autonomous content agent</li>
              <li>✅ Pro plan for $5/month total</li>
              <li>✅ 8 autonomous AI agents</li>
              <li>✅ Ready in minutes — no demo required</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Feature comparison</h2>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span>Feature</span>
              <span>Emplifi</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.emplifi}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over Emplifi</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Enterprise tools are not built for creators',
                desc: "Emplifi is designed for social media teams at large brands. That means enterprise onboarding, enterprise contracts, enterprise support — and enterprise pricing. If you're a creator, solo founder, small agency, or lean team, you don't need any of that. SocialMate is self-serve: sign up for free, connect your accounts, start posting today.",
              },
              {
                n: '2',
                title: 'Discord and Telegram — platforms enterprises skip',
                desc: "Emplifi focuses on Facebook, Instagram, LinkedIn, Twitter, and TikTok — the platforms Fortune 500 brands need. Discord and Telegram are creator platforms, not enterprise priorities. SocialMate treats them as first-class citizens: you can schedule posts, manage channels, and grow communities on both from day one.",
              },
              {
                n: '3',
                title: 'SOMA generates content autonomously — Emplifi cannot',
                desc: "Emplifi has publishing tools and some AI content features. SocialMate's SOMA goes further: it ingests your brand context, analyzes what you've already posted (via Project Memory), and autonomously generates a full week of platform-native content. You define the parameters once. SOMA runs perpetually. No enterprise tool does this for $5/month.",
              },
              {
                n: '4',
                title: '$200+/month vs. $5/month for equivalent creator workflows',
                desc: "Emplifi's pricing is calibrated for budgets with dedicated social media line items. SocialMate's Pro plan at $5/month covers 7 platforms, 500 AI credits, SOMA access, 8 AI agents, and 5 team seats. The creator-focused feature set at SocialMate is deeper than what Emplifi provides for creators — at 1/40th the price.",
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Creator tools, not enterprise tools</p>
          <h2 className="text-3xl font-extrabold mb-4">Start scheduling in minutes. Free.</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            SocialMate is self-serve, free to start, and built for the creator workflow.
            7 platforms, 15+ AI tools, SOMA. No demo required.
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
