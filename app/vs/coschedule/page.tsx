import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SocialMate vs CoSchedule (2026) — Full Comparison',
  description: 'CoSchedule free tier is manual-only with no auto-publish. SocialMate auto-publishes on free, includes bulk scheduling, and supports Discord/Bluesky/Telegram/Mastodon.',
  openGraph: {
    title:       'SocialMate vs CoSchedule (2026)',
    description: 'CoSchedule free plan has no auto-publishing. SocialMate auto-publishes on free — no per-user pricing, no editorial calendar bloat.',
    url:         'https://socialmate.studio/vs/coschedule',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/coschedule' },
}

const COMPARISON = [
  { feature: 'Starting price',            coschedule: '$29/month (Marketing Suite)', socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                 coschedule: '✅ Limited (Social Calendar)', socialmate: '✅ Full-featured free'   },
  { feature: 'Auto-publish on free',      coschedule: '❌ Manual only',               socialmate: '✅ Auto-publish free'    },
  { feature: 'Users on free plan',        coschedule: '1 user',                       socialmate: '2 users free'            },
  { feature: 'Analytics on free plan',    coschedule: '❌ None',                       socialmate: '✅ Included'             },
  { feature: 'Pricing model',             coschedule: 'Per user',                     socialmate: 'Flat rate'               },
  { feature: 'Discord support',           coschedule: '❌',                            socialmate: '✅'                      },
  { feature: 'Telegram support',          coschedule: '❌',                            socialmate: '✅'                      },
  { feature: 'Mastodon support',          coschedule: '❌',                            socialmate: '✅'                      },
  { feature: 'Bluesky support',           coschedule: '❌',                            socialmate: '✅'                      },
  { feature: 'AI writing tools',          coschedule: 'AI Mia (paid)',                socialmate: '12 tools included'       },
  { feature: 'AI credits free tier',      coschedule: '❌ None',                       socialmate: '75/month free'            },
  { feature: 'Bulk scheduling',           coschedule: 'Paid plans',                   socialmate: '✅ Free'                  },
  { feature: 'Link in bio',               coschedule: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',           coschedule: 'Paid plans',                   socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',       coschedule: '❌',                            socialmate: '✅ Free (3 accounts)'    },
  { feature: 'RSS import',                coschedule: 'Paid plans',                   socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',       coschedule: 'ReQueue (paid add-on)',        socialmate: '✅ Free'                  },
]

const FAQ = [
  {
    q: 'What does CoSchedule\'s free plan actually include?',
    a: 'CoSchedule\'s Social Calendar free tier is extremely limited — it allows only 1 user and does not support auto-publishing. You can plan and queue posts, but they do not publish automatically. You have to manually trigger each one. SocialMate auto-publishes on its free plan with no manual steps.',
  },
  {
    q: 'Who is CoSchedule built for?',
    a: 'CoSchedule started as a blog and editorial calendar tool for content marketing teams. Its Marketing Suite is built around managing content pipelines, team tasks, and blog workflows — not pure social scheduling. If you just need to schedule and publish social posts, you end up paying for a lot of bloat you will never use.',
  },
  {
    q: 'Which platforms does SocialMate support that CoSchedule does not?',
    a: 'SocialMate supports Discord, Telegram, Mastodon, and Bluesky — none of which CoSchedule covers. If your audience is growing on decentralized or alternative platforms, SocialMate is the only tool that reaches them.',
  },
  {
    q: 'Is SocialMate actually free with no catch?',
    a: 'Yes. The free tier includes unlimited posts, auto-publishing, 75 AI credits/month, bulk scheduling, link in bio, hashtag manager, competitor tracking, RSS import, and evergreen recycling. No credit card required and no manual-posting restrictions.',
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

export default function VsCoSchedulePage() {
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
            SocialMate vs CoSchedule
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            CoSchedule&apos;s free plan requires manual posting — no auto-publish. SocialMate auto-publishes for free, with bulk scheduling and 12 AI tools included.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">CoSchedule</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Editorial-heavy, free tier is barely functional</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Strong editorial calendar and blog workflow</li>
              <li>✅ Good for content marketing teams</li>
              <li>❌ Free plan has no auto-publish</li>
              <li>❌ No analytics on free tier</li>
              <li>❌ No Discord, Telegram, Mastodon, Bluesky</li>
              <li>❌ Per-user pricing inflates team costs</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Auto-publishes. No per-user fees. $0.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Auto-publish on free plan</li>
              <li>✅ Analytics included on free tier</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ Discord, Telegram, Mastodon, Bluesky</li>
              <li>✅ Bulk scheduling free</li>
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
              <span>CoSchedule</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.coschedule}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why people switch from CoSchedule</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'A free plan that requires manual posting is not a free plan',
                desc: 'CoSchedule\'s Social Calendar free tier lets you plan posts but does not auto-publish them. You still have to manually trigger each post yourself. The whole point of a social scheduler is automation. SocialMate auto-publishes everything on the free plan — no manual steps.',
              },
              {
                n: '2',
                title: 'CoSchedule is a blog tool wearing social media clothes',
                desc: 'CoSchedule was built for content marketing teams managing editorial calendars, blog pipelines, and multi-person approval workflows. That is powerful if you need it. But if you just want to schedule social posts efficiently, you are paying for a complicated system built around needs you do not have.',
              },
              {
                n: '3',
                title: 'Per-user pricing adds up faster than you expect',
                desc: 'CoSchedule\'s Marketing Suite charges per user seat. Add two collaborators and your monthly cost jumps significantly before you have published a single post. SocialMate uses flat-rate pricing — adding team members does not change what you pay.',
              },
              {
                n: '4',
                title: 'SocialMate reaches platforms CoSchedule does not',
                desc: 'Discord, Telegram, Mastodon, and Bluesky are not on CoSchedule\'s platform list. If your community lives in a Discord server, a Telegram channel, or the Bluesky feed, you need a different tool. SocialMate covers all of them on the free plan.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Done posting manually? Start auto-publishing free.</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate auto-publishes on the free plan — bulk scheduling, 12 AI tools, 16 platforms, no per-user fees. No credit card required.
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
            <Link href="/vs/hootsuite" className="hover:text-black dark:hover:text-white transition-colors">vs Hootsuite</Link>
            <Link href="/vs/loomly" className="hover:text-black dark:hover:text-white transition-colors">vs Loomly</Link>
            <Link href="/vs/meetedgar" className="hover:text-black dark:hover:text-white transition-colors">vs MeetEdgar</Link>
            <Link href="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
