import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs Social Report (2026) — Full Comparison',
  description: 'Social Report charges $49/month for social scheduling and analytics with no Discord or Telegram. SocialMate gives you 7 platforms, 12 AI tools, and SOMA — starting free.',
  openGraph: {
    title:       'SocialMate vs Social Report (2026)',
    description: 'Social Report is $49/month with no Discord, Telegram, or Bluesky. SocialMate covers 7 platforms with AI built in — free to start.',
    url:         'https://socialmate.studio/vs/social-report',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/social-report' },
}

const COMPARISON = [
  { feature: 'Starting price',               socialreport: '$49/month',               socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    socialreport: '❌ 30-day trial only',     socialmate: '✅ 50 credits/month'     },
  { feature: 'Platforms supported',           socialreport: '35+ (no Discord/Telegram)', socialmate: '7 (Discord + Telegram included)' },
  { feature: 'Discord scheduling',            socialreport: '❌',                        socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           socialreport: '❌',                        socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            socialreport: '❌',                        socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             socialreport: '✅ (paid)',                 socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           socialreport: '✅',                        socialmate: '✅ Free'                  },
  { feature: 'Social analytics',              socialreport: '✅ (strength)',             socialmate: '✅ Multi-platform charts' },
  { feature: 'AI writing tools',              socialreport: '❌',                        socialmate: '12 tools free'           },
  { feature: 'Autonomous content system',     socialreport: '❌',                        socialmate: '✅ SOMA — learns your voice' },
  { feature: '8 autonomous AI agents',        socialreport: '❌',                        socialmate: '✅ Pro+'                  },
  { feature: 'Content calendar',             socialreport: '✅',                        socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              socialreport: '✅',                        socialmate: '✅ Free'                  },
  { feature: 'RSS / blog import',             socialreport: '❌',                        socialmate: '✅ Free'                  },
  { feature: 'Link in bio (SIGIL)',           socialreport: '❌',                        socialmate: '✅ Built in free'         },
  { feature: 'Team collaboration',            socialreport: '✅ ($99+)',                 socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      socialreport: '❌',                        socialmate: '✅ Tip jar + fan subs'   },
  { feature: 'SM-Give charity program',       socialreport: '❌',                        socialmate: '✅ 2% of revenue donated' },
]

const FAQ = [
  {
    q: 'What is Social Report and how does it compare to SocialMate?',
    a: "Social Report is a social media management tool with scheduling, analytics, and team features for agencies. It supports 35+ networks including the main platforms. Pricing starts at $49/month with a 30-day trial. Key gaps: no Discord, no Telegram, no Bluesky, and no AI writing tools. SocialMate covers fewer total legacy platforms but adds Discord, Telegram, and Bluesky — plus 12 AI tools and SOMA — starting free.",
  },
  {
    q: 'Does Social Report have Discord and Telegram scheduling?',
    a: "No. Social Report focuses on mainstream platforms: Facebook, Instagram, Twitter, LinkedIn, Pinterest, YouTube, and others. Discord and Telegram are not on the list. SocialMate built Discord and Telegram scheduling first — they're treated as first-class platforms, not afterthoughts.",
  },
  {
    q: 'How does SocialMate analytics compare to Social Report?',
    a: "Social Report's analytics are a core strength — it offers detailed cross-platform reporting suitable for agency client reports. SocialMate's analytics include an SVG area chart dashboard, platform breakdown bars, best-times heatmap, Content DNA (engagement fingerprint), per-post performance alerts, and the Client Report Agent which generates automated weekly HTML email reports. For creator-scale analytics, SocialMate matches the need. For enterprise-level cross-platform BI reporting, Social Report has more depth.",
  },
  {
    q: 'What AI tools does SocialMate include?',
    a: "SocialMate's 12 AI tools include caption generation, viral hook writing, content repurposing (6 formats), hashtag research, thread generation, post rewriting, post scoring, brand voice injection, SM Pulse (trend scan), SM Radar (content intelligence), and SOMA — an autonomous content agent that generates a full week of platform-native posts automatically.",
  },
  {
    q: 'Is $49/month for Social Report worth it?',
    a: "Social Report at $49/month offers solid multi-platform scheduling and analytics for agencies. But for creators and small businesses, $49/month for a tool with no AI writing and no Discord/Telegram support is hard to justify. SocialMate's free plan does more for creators, and Pro at $5/month includes SOMA, 500 AI credits, and 8 agents — at 1/10th of Social Report's entry price.",
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

export default function VsSocialReportPage() {
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
            SocialMate vs Social Report
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Social Report is $49/month with no Discord, Telegram, or AI tools. SocialMate covers 7 platforms with 12 AI tools and SOMA — starting completely free.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Social Report</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Analytics-strong, AI-absent</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Strong cross-platform analytics</li>
              <li>✅ 35+ platforms supported</li>
              <li>✅ Agency-friendly reporting</li>
              <li>❌ $49/month — no free plan</li>
              <li>❌ No Discord, Telegram, or Bluesky</li>
              <li>❌ Zero AI writing or content generation</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Schedule + AI + analytics. Free.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Discord + Telegram + Bluesky + TikTok + LinkedIn + X + Mastodon</li>
              <li>✅ 12 AI tools on free tier</li>
              <li>✅ SOMA autonomous content agent</li>
              <li>✅ Client Report Agent for agencies</li>
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
              <span>Social Report</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.socialreport}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over Social Report</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: '$49/month for no AI is hard to justify in 2026',
                desc: "Social Report's core value is scheduling + analytics. But in 2026, a scheduler without AI writing tools is incomplete. SocialMate's 12 AI tools write captions, craft hooks, repurpose content into 6 formats, generate hashtags, and score posts — all on the free plan. Paying $49/month for a tool that can't generate or assist with a single word is a significant limitation.",
              },
              {
                n: '2',
                title: 'Discord and Telegram: platforms Social Report ignores',
                desc: "Social Report supports 35+ platforms — mostly legacy social networks. Discord and Telegram are conspicuously absent. These aren't niche platforms anymore: Discord has 200M+ active users and Telegram has 950M+. SocialMate schedules to both natively. If your community lives there, SocialMate is one of the few tools that reaches them.",
              },
              {
                n: '3',
                title: 'Client reports without the $99/month agency plan',
                desc: "Social Report's team and client reporting features are gated behind their $99/month plan. SocialMate's Client Report Agent (Agency plan, $20/month) generates automated weekly HTML reports for clients — posts published, scheduled ahead, active platforms — and emails them to your CC list every Monday. One-fifth the price of Social Report's agency tier.",
              },
              {
                n: '4',
                title: 'SOMA autonomously generates content Social Report cannot',
                desc: "Social Report helps you schedule what you write. SOMA generates what to write. Define your brand context, connect your platforms, set a schedule — and SOMA creates platform-native posts for the full week automatically. LinkedIn posts formatted for the algorithm. Discord announcements. TikTok hooks. All generated from one ingestion run. Social Report has no equivalent.",
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">More AI. More platforms. Less money.</p>
          <h2 className="text-3xl font-extrabold mb-4">Switch from Social Report today</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            SocialMate covers 7 platforms including Discord and Telegram — with 12 AI tools and SOMA built in.
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
