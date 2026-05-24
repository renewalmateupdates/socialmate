import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs OneUp (2026) — Full Comparison',
  description: 'OneUp charges $18/month for social scheduling with limited AI and no Discord or Telegram. SocialMate gives you 7 platforms, 15+ AI tools, and SOMA — starting free.',
  openGraph: {
    title:       'SocialMate vs OneUp (2026)',
    description: 'OneUp is $18/month with limited AI. SocialMate is free — and covers 7 platforms with 15+ AI tools built in.',
    url:         'https://socialmate.studio/vs/oneup',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/oneup' },
}

const COMPARISON = [
  { feature: 'Starting price',               oneup: '$18/month',                    socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    oneup: '❌ 7-day trial only',           socialmate: '✅ 50 credits/month'     },
  { feature: 'Platforms supported',           oneup: '7 platforms (no Discord/Telegram)', socialmate: '7 platforms (Discord + Telegram included)' },
  { feature: 'Discord scheduling',            oneup: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           oneup: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            oneup: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             oneup: '✅ (paid)',                     socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           oneup: '✅',                            socialmate: '✅ Free'                  },
  { feature: 'AI writing tools',              oneup: '❌ No AI tools',               socialmate: '12 tools free'           },
  { feature: 'Autonomous content system',     oneup: '❌',                            socialmate: '✅ SOMA — learns your voice' },
  { feature: '8 autonomous AI agents',        oneup: '❌',                            socialmate: '✅ Pro+'                  },
  { feature: 'Recurring posts',               oneup: '✅ (strength)',                 socialmate: '✅ Free'                  },
  { feature: 'Content calendar',             oneup: '✅',                            socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              oneup: '✅ (paid)',                     socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             oneup: '✅',                            socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',           oneup: '✅ (strength)',                 socialmate: '✅ Free'                  },
  { feature: 'Link in bio (SIGIL)',           oneup: '❌',                            socialmate: '✅ Built in free'         },
  { feature: 'Team collaboration',            oneup: '✅ ($36+)',                     socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      oneup: '❌',                            socialmate: '✅ Tip jar + fan subs'   },
  { feature: 'SM-Give charity program',       oneup: '❌',                            socialmate: '✅ 2% of revenue donated' },
]

const FAQ = [
  {
    q: 'Is OneUp a good social media scheduler?',
    a: "OneUp is a solid, straightforward scheduler with strong recurring post and evergreen recycling features. It's affordable compared to Hootsuite or Sprout Social. The main gaps are no AI tools, no Discord/Telegram support, and no free plan — just a 7-day trial. If you need a simple scheduler without AI and don't use community platforms, OneUp works. If you want AI tools, autonomous content generation, or Discord/Telegram scheduling, SocialMate is the better fit.",
  },
  {
    q: 'Does SocialMate support evergreen recycling like OneUp?',
    a: "Yes. SocialMate includes evergreen recycling on the free plan — mark any post as evergreen and SocialMate will automatically requeue it when your schedule is empty. OneUp's evergreen recycling is one of its strongest features, and SocialMate matches it for free.",
  },
  {
    q: 'What AI tools does SocialMate include that OneUp lacks?',
    a: "OneUp has no AI tools. SocialMate's 15+ AI tools include caption generation, viral hook writing, content repurposing (6 formats), hashtag research, thread generation, post rewriting, post scoring, brand voice injection, SM Pulse (trend scan), and SM Radar (content intelligence). Plus SOMA — an autonomous content agent that generates a full week of posts from your brand context.",
  },
  {
    q: 'Why does SocialMate include Discord and Telegram but OneUp does not?',
    a: "Most social schedulers were built before Discord and Telegram became major creator platforms. SocialMate was built in 2026 with community platforms as a core requirement. Discord has 200M+ active users and is the primary community platform for streamers, developers, and NFT communities. Telegram has 950M+ users and growing. These aren't niche platforms anymore — and SocialMate is one of the few tools that schedules to both.",
  },
  {
    q: 'Is $18/month for OneUp worth it compared to SocialMate free?',
    a: "OneUp's $18/month plan gives you unlimited posts, recurring schedules, and CSV bulk upload. SocialMate's free plan gives you the same core scheduling features plus 15+ AI tools, Discord/Telegram/Bluesky support, and a full link-in-bio page (SIGIL). For $5/month, SocialMate Pro adds 500 AI credits/month, 5 seats, SOMA access, and 8 autonomous agents. The value comparison strongly favors SocialMate at every price point.",
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

export default function VsOneUpPage() {
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
            SocialMate vs OneUp
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            OneUp is $18/month with no AI tools and no Discord or Telegram support. SocialMate is free — with 15+ AI tools and all 7 platforms.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">OneUp</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Simple scheduler, no AI</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Strong recurring + evergreen recycling</li>
              <li>✅ Clean, simple UI</li>
              <li>✅ CSV bulk import</li>
              <li>❌ No free plan — 7-day trial only</li>
              <li>❌ Zero AI tools</li>
              <li>❌ No Discord, Telegram, or Bluesky</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">7 platforms. 15+ AI tools. Free.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Discord + Telegram + Bluesky + TikTok + LinkedIn + X + Mastodon</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ SOMA autonomous content agent</li>
              <li>✅ Pro plan for $5/month total</li>
              <li>✅ Evergreen recycling + recurring posts free</li>
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
              <span>OneUp</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.oneup}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over OneUp</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'OneUp has zero AI tools — SocialMate has 12',
                desc: "OneUp is a clean scheduling tool. That is its entire value proposition. SocialMate does the same scheduling but adds caption AI, hook writing, content repurposing, hashtag research, post scoring, SOMA autonomous generation, and 8 AI agents that run on autopilot. If you ever want AI assistance in your content workflow, OneUp will never give it to you.",
              },
              {
                n: '2',
                title: 'No free plan vs. genuinely free forever',
                desc: "OneUp gives you a 7-day trial. After that, you pay $18/month minimum. SocialMate is free forever with no post caps and no time limits. The free plan includes Discord, Telegram, Bluesky, Mastodon, TikTok, and LinkedIn scheduling — plus 15+ AI tools and a full link-in-bio page. That's more than OneUp's paid plan for $0.",
              },
              {
                n: '3',
                title: 'Discord and Telegram scheduling are unique to SocialMate',
                desc: "If any part of your audience lives in a Discord server or Telegram channel, OneUp can't help you. SocialMate schedules posts natively to both platforms. You can queue community updates, announcements, and content drops to Discord and Telegram alongside all your other channels — from one composer.",
              },
              {
                n: '4',
                title: 'SOMA generates a full week of content autonomously',
                desc: "OneUp schedules what you give it. SocialMate's SOMA creates what to post. Ingest your brand context once — your story, your audience, your platforms — and SOMA generates a full week of platform-native posts tailored to each channel's format. Then it schedules them automatically. OneUp has no equivalent capability.",
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
          <h2 className="text-3xl font-extrabold mb-4">More platforms. More AI. Free.</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            SocialMate has everything OneUp offers — plus 15+ AI tools, Discord, Telegram, Bluesky, and SOMA.
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
