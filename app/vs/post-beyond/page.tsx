import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs PostBeyond (2026) — Full Comparison',
  description: 'PostBeyond is an employee advocacy platform starting at $1,000+/month for enterprises. SocialMate gives creators and small teams 7 platforms and 15+ AI tools — starting free.',
  openGraph: {
    title:       'SocialMate vs PostBeyond (2026)',
    description: 'PostBeyond is enterprise employee advocacy at $1,000+/month. SocialMate is free for creators and small teams with 7 platforms and AI tools built in.',
    url:         'https://socialmate.studio/vs/post-beyond',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/post-beyond' },
}

const COMPARISON = [
  { feature: 'Starting price',               postbeyond: '$1,000+/month (enterprise)', socialmate: '$0 — free forever'    },
  { feature: 'Free plan',                    postbeyond: '❌ No free plan',             socialmate: '✅ 50 credits/month'  },
  { feature: 'Target audience',              postbeyond: 'Large enterprises only',      socialmate: 'Creators, teams, agencies' },
  { feature: 'Discord scheduling',            postbeyond: '❌',                           socialmate: '✅ Free'               },
  { feature: 'Telegram scheduling',           postbeyond: '❌',                           socialmate: '✅ Free'               },
  { feature: 'Bluesky scheduling',            postbeyond: '❌',                           socialmate: '✅ Free'               },
  { feature: 'TikTok scheduling',             postbeyond: '❌',                           socialmate: '✅ Free (20 videos/mo)' },
  { feature: 'LinkedIn scheduling',           postbeyond: '✅ (advocacy focus)',          socialmate: '✅ Free'               },
  { feature: 'Employee advocacy',             postbeyond: '✅ (core feature)',             socialmate: '❌ Not built for this' },
  { feature: 'AI writing tools',              postbeyond: '❌',                           socialmate: '15+ tools free'         },
  { feature: 'Autonomous content system',     postbeyond: '❌',                           socialmate: '✅ SOMA'               },
  { feature: '8 autonomous AI agents',        postbeyond: '❌',                           socialmate: '✅ Pro+'               },
  { feature: 'Content calendar',             postbeyond: '✅ (enterprise)',              socialmate: '✅ Free'               },
  { feature: 'RSS / blog import',             postbeyond: '❌',                           socialmate: '✅ Free'               },
  { feature: 'Evergreen recycling',           postbeyond: '❌',                           socialmate: '✅ Free'               },
  { feature: 'Link in bio (SIGIL)',           postbeyond: '❌',                           socialmate: '✅ Built in free'      },
  { feature: 'Team collaboration',            postbeyond: '✅ (enterprise-scale)',        socialmate: 'Free (2 seats)'        },
  { feature: 'Creator Monetization Hub',      postbeyond: '❌',                           socialmate: '✅ Tip jar + fan subs' },
  { feature: 'SM-Give charity program',       postbeyond: '❌',                           socialmate: '✅ 2% of revenue donated' },
]

const FAQ = [
  {
    q: 'What is PostBeyond and who is it for?',
    a: "PostBeyond is an employee advocacy platform designed for large enterprises. The idea: your company creates curated content, employees share it to their personal social accounts, and your brand's reach amplifies through the employee network. It's used by Fortune 500 companies to activate their workforce as brand advocates. PostBeyond is not a general-purpose social media scheduler — it's a specialized enterprise tool with pricing to match (typically $1,000+/month based on employee count).",
  },
  {
    q: 'Is SocialMate comparable to PostBeyond?',
    a: "They serve different audiences. PostBeyond is built for enterprises running employee advocacy programs at scale. SocialMate is built for creators, streamers, small businesses, and agencies who need to schedule content across multiple platforms with AI assistance. If your goal is to publish, schedule, and grow your own social presence — SocialMate is the right choice. If your goal is to coordinate hundreds of employees sharing company content, PostBeyond is the specialized tool for that.",
  },
  {
    q: 'Can SocialMate handle team-based content workflows?',
    a: "Yes. SocialMate includes role-based team access (Owner, Admin, Editor, Viewer, Client), content approval workflows where editors submit posts for owner approval, and client workspaces for agencies. The approval workflow is built into the free plan. This covers the content coordination use case most teams need without paying enterprise-tier pricing.",
  },
  {
    q: 'What AI tools does SocialMate include?',
    a: "SocialMate's 15+ AI tools include caption generation, viral hook writing, content repurposing (6 formats), hashtag research, thread generation, post rewriting, post scoring, brand voice injection, SM Pulse (trend scan), SM Radar (content intelligence), and SOMA — an autonomous content agent that generates a full week of platform-native posts from your brand context.",
  },
  {
    q: 'Does SocialMate support LinkedIn like PostBeyond?',
    a: "Yes. SocialMate connects to LinkedIn personal profiles via OAuth and publishes posts using the official UGC Posts API. LinkedIn is one of 7 live platforms — alongside Discord, Telegram, Bluesky, TikTok, X/Twitter, and Mastodon. LinkedIn scheduling is free on all plans.",
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

export default function VsPostBeyondPage() {
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
            SocialMate vs PostBeyond
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            PostBeyond is enterprise employee advocacy at $1,000+/month. SocialMate is purpose-built for creators and small teams — 7 platforms, 15+ AI tools, free to start.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">PostBeyond</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Enterprise advocacy, enterprise price</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Employee advocacy at scale</li>
              <li>✅ LinkedIn sharing coordination for large teams</li>
              <li>✅ Analytics on employee content sharing</li>
              <li>❌ $1,000+/month — not for individuals or small teams</li>
              <li>❌ Not a general social media scheduler</li>
              <li>❌ No AI writing, SOMA, or autonomous agents</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Built for creators and teams. Free.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ 7 platforms: Discord, Telegram, Bluesky, TikTok, LinkedIn, X, Mastodon</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ SOMA autonomous content agent</li>
              <li>✅ Team approval workflows free</li>
              <li>✅ Pro plan for $5/month total</li>
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
              <span>PostBeyond</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.postbeyond}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over PostBeyond</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: "PostBeyond is for Fortune 500 companies — not you",
                desc: "PostBeyond's pricing model is based on employee count, typically starting at several thousand dollars per month for enterprise deployments. It's designed for companies with hundreds of employees who need to coordinate brand advocacy across their workforce. If you're a creator, freelancer, agency, or small business — PostBeyond is simply not built for you.",
              },
              {
                n: '2',
                title: 'SocialMate does actual social scheduling — PostBeyond does not',
                desc: "PostBeyond is an advocacy platform that helps companies push curated content to employees who then share it to their personal accounts. It doesn't schedule original posts to brand channels. SocialMate schedules, composes, and publishes content to 7 platforms — Discord, Telegram, Bluesky, TikTok, LinkedIn, X, and Mastodon — all from one composer.",
              },
              {
                n: '3',
                title: 'AI tools that PostBeyond will never build',
                desc: "PostBeyond's value is in advocacy coordination — not AI content creation. SocialMate's 15+ AI tools, SOMA autonomous content system, and 8 AI agents are purpose-built for the creator workflow: generate a hook, repurpose a thread, schedule a full week of content, auto-respond to mentions. This entire capability layer doesn't exist in PostBeyond.",
              },
              {
                n: '4',
                title: 'Discord and Telegram — platforms enterprises skip',
                desc: "PostBeyond focuses on LinkedIn, where most employee advocacy happens. SocialMate was built to cover the platforms where creators actually live: Discord servers, Telegram channels, Bluesky feeds, and TikTok profiles. These aren't enterprise platforms — they're creator platforms, and SocialMate treats them as first-class citizens.",
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Built for creators, not enterprises</p>
          <h2 className="text-3xl font-extrabold mb-4">Schedule posts. Generate content. Free.</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            SocialMate is a full creator OS. 7 platforms, 15+ AI tools, SOMA, and 8 agents — all for $0 to start.
            Pro is $5/month.
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
