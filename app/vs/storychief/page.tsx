import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs StoryChief (2026) — Full Comparison',
  description: 'StoryChief charges $99/month for content marketing with no Discord or Telegram support. SocialMate gives you 7 platforms, 15+ AI tools, and autonomous content generation — starting free.',
  openGraph: {
    title:       'SocialMate vs StoryChief (2026)',
    description: 'StoryChief is $99/month for content marketing. SocialMate is free — and covers 7 platforms including Discord and Telegram.',
    url:         'https://socialmate.studio/vs/storychief',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/storychief' },
}

const COMPARISON = [
  { feature: 'Starting price',               storychief: '$99/month',                 socialmate: '$0 — free forever'       },
  { feature: 'Platforms supported',           storychief: '8 platforms (no Discord/Telegram)', socialmate: '7 platforms (Discord + Telegram included)' },
  { feature: 'Free plan',                    storychief: '❌ No free plan',            socialmate: '✅ 50 credits/month'     },
  { feature: 'Discord scheduling',            storychief: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           storychief: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            storychief: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             storychief: '❌',                         socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           storychief: '✅',                         socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',              storychief: '✅ (paid add-on)',           socialmate: '15+ tools free'           },
  { feature: 'Autonomous content system',     storychief: '❌',                         socialmate: '✅ SOMA — learns your voice' },
  { feature: '8 autonomous AI agents',        storychief: '❌',                         socialmate: '✅ Pro+'                  },
  { feature: 'Content calendar',             storychief: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              storychief: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             storychief: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',           storychief: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Link in bio (SIGIL)',           storychief: '❌',                         socialmate: '✅ Built in free'         },
  { feature: 'Team collaboration',            storychief: '✅ (paid, $99+)',            socialmate: 'Free (2 seats)'          },
  { feature: 'Client workspaces',             storychief: '✅ ($99+)',                  socialmate: '✅ Agency $20/month'     },
  { feature: 'Creator Monetization Hub',      storychief: '❌',                         socialmate: '✅ Tip jar + fan subs'   },
  { feature: 'SM-Give charity program',       storychief: '❌',                         socialmate: '✅ 2% of revenue donated' },
]

const FAQ = [
  {
    q: 'Is StoryChief worth $99/month for content marketing?',
    a: "StoryChief combines content creation, multi-channel distribution, and SEO analysis in one platform. If you're running a full editorial team producing blog content + social simultaneously, StoryChief's workflow makes sense. But at $99/month minimum with no free plan, it's priced for marketing departments — not solo creators or small teams. SocialMate gives you the scheduling layer for free and adds Discord, Telegram, and Bluesky that StoryChief doesn't touch.",
  },
  {
    q: 'Can SocialMate replace StoryChief for social media scheduling?',
    a: "For the social scheduling piece, yes. SocialMate handles multi-platform publishing, content calendars, bulk scheduling, AI writing tools, and analytics for free. StoryChief's differentiator is its blog publishing + SEO content hub — if you're writing blog posts that also syndicate to social, StoryChief bundles that workflow. If you primarily schedule social posts (not full blog publishing), SocialMate covers everything StoryChief does and adds 3 more platforms.",
  },
  {
    q: 'Does StoryChief support Discord and Telegram?',
    a: "No. StoryChief focuses on mainstream platforms like Facebook, Instagram, LinkedIn, Twitter, and Pinterest. Discord and Telegram are community platforms that most traditional social schedulers skip entirely. SocialMate was built with Discord and Telegram as first-class platforms — you can schedule posts, manage channels, and track engagement on both.",
  },
  {
    q: 'What AI tools does SocialMate include?',
    a: "SocialMate's 15+ AI tools include caption generation, viral hook writing, content repurposing (6 formats), hashtag research, thread generation, post rewriting, post scoring, brand voice injection, SM Pulse (trend scan), SM Radar (content intelligence), and SOMA — an autonomous content system that learns your voice and generates a full week of platform-native posts automatically.",
  },
  {
    q: 'What is SOMA and how does it compare to StoryChief AI?',
    a: "SOMA is SocialMate's autonomous content agent. You ingest your brand context (about your brand, your audience, your goals), set a posting schedule per platform, and SOMA generates a full week of posts automatically — tailored to each platform's format and character limits. StoryChief has AI writing assistance built into their editor, but it doesn't autonomously plan and schedule a week of content from a single brief. SOMA does.",
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

export default function VsStoryChiefPage() {
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
            SocialMate vs StoryChief
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            StoryChief charges $99/month for content marketing. SocialMate covers 7 platforms including Discord and Telegram — starting completely free.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">StoryChief</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Full content hub, high price</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Blog publishing + social syndication in one</li>
              <li>✅ SEO content analysis built in</li>
              <li>✅ Editorial workflow for teams</li>
              <li>❌ $99/month minimum — no free plan</li>
              <li>❌ No Discord, Telegram, or Bluesky</li>
              <li>❌ No autonomous AI content agent</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">7 platforms. AI built in. Free to start.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Discord + Telegram + Bluesky + TikTok + LinkedIn + X + Mastodon</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ SOMA autonomous content agent learns your voice</li>
              <li>✅ Pro plan for $5/month total</li>
              <li>✅ 8 autonomous AI agents</li>
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
              <span>StoryChief</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.storychief}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over StoryChief</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '$99/month is too much for social scheduling alone',
                desc: "StoryChief bundles blog publishing, SEO analysis, and social scheduling into one platform. That bundle is powerful if you need all three. But most creators just need reliable social scheduling with AI tools — and paying $99/month for that is hard to justify when SocialMate does it free.",
              },
              {
                n: '2',
                title: 'Discord and Telegram are SocialMate-exclusive',
                desc: "StoryChief supports Facebook, Instagram, LinkedIn, Twitter, and Pinterest. No Discord. No Telegram. If you run a community on either platform — and millions of creators do — you need a separate tool. SocialMate built Discord and Telegram scheduling first, not as an afterthought.",
              },
              {
                n: '3',
                title: 'SOMA does what StoryChief AI cannot',
                desc: "StoryChief has AI writing inside its editor. SocialMate's SOMA is something different: you ingest your brand context once, set your platforms and schedule, and SOMA autonomously generates and publishes a full week of content across all your platforms. StoryChief doesn't have anything like autonomous multi-platform content generation.",
              },
              {
                n: '4',
                title: '8 AI agents run your social strategy on autopilot',
                desc: "SocialMate's Agents Hub includes a Newsletter Agent, Caption Agent, Trend Scout, Repurpose Agent, Growth Scout, Inbox Agent, Client Report Agent, and Email Outreach Agent. These run on their own schedules, generating drafts and executing tasks without manual input. No equivalent exists in StoryChief.",
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
          <h2 className="text-3xl font-extrabold mb-4">Schedule to 7 platforms free</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            SocialMate connects to Discord, Telegram, Bluesky, TikTok, LinkedIn, X, and Mastodon.
            Start for free. When you&apos;re ready for AI agents and SOMA, Pro is $5/month.
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
