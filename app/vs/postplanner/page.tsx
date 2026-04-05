import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs Post Planner (2026) — Full Comparison',
  description: 'Post Planner starts at $9/month but its free plan caps at 10 posts/month — nearly useless. SocialMate is free forever with unlimited posts, AI tools, and Discord/Bluesky included.',
  openGraph: {
    title:       'SocialMate vs Post Planner (2026)',
    description: "Post Planner's free plan limits you to 10 posts/month — barely enough to stay active. SocialMate is free forever with no post caps.",
    url:         'https://socialmate.studio/vs/postplanner',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/postplanner' },
}

const COMPARISON = [
  { feature: 'Starting price',            postplanner: '$9/month (Starter)',       socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 postplanner: '✅ (10 posts/month cap)',   socialmate: '✅ Unlimited posts free' },
  { feature: 'Free plan post limit',      postplanner: '10 posts/month',           socialmate: 'No limit'                },
  { feature: 'Social accounts (free)',    postplanner: '3 accounts',               socialmate: 'No hard cap (free tier)' },
  { feature: 'Bulk scheduling',           postplanner: 'Paid plans',               socialmate: '✅ Free'                 },
  { feature: 'Discord support',           postplanner: '❌',                       socialmate: '✅'                      },
  { feature: 'Telegram support',          postplanner: '❌',                       socialmate: '✅'                      },
  { feature: 'Mastodon support',          postplanner: '❌',                       socialmate: '✅'                      },
  { feature: 'Bluesky support',           postplanner: '❌',                       socialmate: '✅'                      },
  { feature: 'AI writing tools',          postplanner: 'Basic caption help',       socialmate: '12 tools included'       },
  { feature: 'AI credits free tier',      postplanner: 'Very limited',             socialmate: '75/month free'           },
  { feature: 'Link in bio',               postplanner: '❌',                       socialmate: '✅ Free'                 },
  { feature: 'Hashtag manager',           postplanner: 'Paid plans',               socialmate: '✅ Free'                 },
  { feature: 'Evergreen recycling',       postplanner: '✅ Paid plans',            socialmate: '✅ Free'                 },
  { feature: 'Competitor tracking',       postplanner: '❌',                       socialmate: '✅ Free (3 accounts)'   },
  { feature: 'RSS import',                postplanner: 'Paid plans',               socialmate: '✅ Free'                 },
  { feature: 'Content discovery',         postplanner: '✅ Core feature',          socialmate: '✅ RSS import'           },
  { feature: 'Analytics',                 postplanner: 'Paid plans',               socialmate: '✅ Free'                 },
]

const FAQ = [
  {
    q: "Is Post Planner's free plan actually usable?",
    a: "Post Planner does have a free plan, but it caps at 10 posts per month across 3 social accounts. That is about 2-3 posts per week — not enough to maintain a consistent social presence. SocialMate's free plan has no post limit.",
  },
  {
    q: "What is Post Planner's main selling point?",
    a: 'Post Planner focuses on content discovery — surfacing viral and trending content from the web for you to reshare. If you want a tool that helps you find content to curate, Post Planner has that built in. SocialMate focuses on scheduling and creating original content with AI tools.',
  },
  {
    q: 'Which platforms does SocialMate support that Post Planner does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which Post Planner covers. If your audience is on community or decentralized platforms, Post Planner cannot help.',
  },
  {
    q: 'Is SocialMate a good Post Planner alternative for creators who post frequently?',
    a: 'Yes. SocialMate has no post limit on the free plan, plus bulk scheduling, 12 AI tools, evergreen recycling, competitor tracking, and analytics — all free. Post Planner charges $9/month and caps free usage at 10 posts.',
  },
]

export default function VsPostPlannerPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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
            SocialMate vs Post Planner
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Post Planner has a free plan — but 10 posts per month is barely a schedule. SocialMate is free forever with unlimited posts and no cap.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Post Planner</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Free plan exists — but nearly useless</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Content discovery and curation</li>
              <li>✅ Evergreen recycling on paid plans</li>
              <li>❌ Free plan: 10 posts/month cap</li>
              <li>❌ $9/month to get anything useful</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Analytics locked to paid plans</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Unlimited posts. All platforms. $0.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Free forever — no post cap</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Bulk scheduling free</li>
              <li>✅ Analytics free</li>
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
              <span>Post Planner</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.postplanner}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from Post Planner</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '10 posts per month is not a social media strategy',
                desc: "Post Planner's free plan caps at 10 posts per month. If you post once every 3 days — a modest pace — you hit the limit in a month. Any real posting schedule requires a paid plan. SocialMate has no post limit on the free tier.",
              },
              {
                n: '2',
                title: 'Analytics require a paid plan',
                desc: 'Post Planner locks analytics behind paid plans. You cannot see how your posts perform on the free tier. SocialMate includes analytics on the free plan — because knowing what works is part of posting, not an upgrade.',
              },
              {
                n: '3',
                title: 'Content discovery is only valuable if you can actually post what you find',
                desc: "Post Planner's content curation feature is genuinely useful — but limited posting caps mean you hit your limit quickly. SocialMate gives you RSS import for automated content sharing alongside unlimited original posts.",
              },
              {
                n: '4',
                title: 'SocialMate covers platforms Post Planner does not',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not supported by Post Planner. SocialMate covers all four, plus Instagram, LinkedIn, Facebook, Pinterest, Reddit, and more — all on the free plan.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">No 10-post cap — start free today</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — unlimited posts, bulk scheduling, 12 AI tools, 16 platforms. No credit card required.
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
            <Link href="/vs/recurpost" className="hover:text-black dark:hover:text-white transition-colors">vs RecurPost</Link>
            <Link href="/vs/socialbee" className="hover:text-black dark:hover:text-white transition-colors">vs SocialBee</Link>
            <Link href="/vs/missinglettr" className="hover:text-black dark:hover:text-white transition-colors">vs Missinglettr</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
