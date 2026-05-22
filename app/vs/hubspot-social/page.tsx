import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs HubSpot Social (2026) — Full Comparison',
  description: 'HubSpot Marketing Hub social tools cost $800+/month. SocialMate delivers social scheduling across 7 platforms including TikTok and LinkedIn — free to start.',
  openGraph: {
    title:       'SocialMate vs HubSpot Social (2026)',
    description: 'HubSpot social is $800+/month bundled into Marketing Hub. SocialMate covers 7 platforms for $5/month — or free.',
    url:         'https://socialmate.studio/vs/hubspot-social',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/hubspot-social' },
}

const COMPARISON = [
  { feature: 'Starting price (social only)',  competitor: '$800+/month (Marketing Hub)', socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    competitor: '❌ Social requires paid plan', socialmate: '✅ 50 credits/month'     },
  { feature: 'TikTok scheduling',             competitor: '❌ No TikTok',               socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           competitor: '✅ (paid, part of CRM)',      socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Discord scheduling',            competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Mastodon scheduling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Social-first tool',             competitor: '❌ Social is a secondary feature', socialmate: '✅ Built for social first' },
  { feature: 'AI writing tools',              competitor: '✅ (enterprise AI add-on)',   socialmate: '12 tools free'           },
  { feature: 'Content calendar',             competitor: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'CRM integration',               competitor: '✅ Deep CRM + social',       socialmate: '🔜 Roadmap'              },
  { feature: 'Evergreen recycling',           competitor: '❌',                          socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                   competitor: '❌',                          socialmate: '✅ Built in free'         },
  { feature: 'Team collaboration',            competitor: '✅ (enterprise seats)',       socialmate: 'Free (2 seats)'          },
  { feature: 'Suitable for solo creators',    competitor: '❌ Enterprise pricing',       socialmate: '✅ Built for individuals' },
  { feature: 'Creator Monetization Hub',      competitor: '❌',                          socialmate: '✅ Tip jar + fan subs'   },
]

const FAQ = [
  {
    q: 'What is HubSpot Social and how much does it actually cost?',
    a: 'HubSpot\'s social media tools are bundled inside HubSpot Marketing Hub — there\'s no social-only plan. The Starter Marketing Hub is $800+/month (billed annually). You\'re not paying for social scheduling; you\'re buying a full marketing platform where social is a secondary feature. For creators and small businesses who primarily need social scheduling, you\'re paying enterprise CRM pricing for one use case.',
  },
  {
    q: 'Does HubSpot support TikTok scheduling?',
    a: 'No. HubSpot Marketing Hub does not support TikTok scheduling. This is a significant platform gap — TikTok is the highest organic reach platform in 2026. SocialMate schedules TikTok for free (20 videos/month) using the official Production API approved in May 2026. No enterprise contract required.',
  },
  {
    q: 'When does HubSpot Social make sense vs SocialMate?',
    a: 'HubSpot Social makes sense if you\'re already paying for HubSpot CRM and want social scheduling that integrates directly with your contact database, deal pipeline, and marketing automation. If your primary need is social scheduling and AI content tools, paying $800+/month for that use case is not cost-effective. SocialMate covers the social scheduling job for $5/month.',
  },
  {
    q: 'Can SocialMate serve agency and team use cases at lower cost than HubSpot?',
    a: 'SocialMate\'s Agency plan ($20/month) includes 5 client workspaces, 15 team seats, 2,000 AI credits/month, and white label options. For agencies managing client social media, SocialMate delivers the core scheduling + AI workflow at $20/month vs HubSpot\'s enterprise-tier pricing. The tradeoff: no CRM or marketing automation. Pure social scheduling.',
  },
  {
    q: 'What social platforms does HubSpot support vs SocialMate?',
    a: 'HubSpot supports Facebook, Instagram, LinkedIn, X/Twitter, and YouTube. No TikTok, no Discord, no Telegram, no Bluesky, no Mastodon. SocialMate covers X/Twitter, LinkedIn, TikTok, Bluesky, Discord, Telegram, and Mastodon — 7 platforms. Facebook and Instagram are on SocialMate\'s roadmap pending Meta App Review.',
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

export default function VsHubSpotSocialPage() {
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
            SocialMate vs HubSpot Social
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            HubSpot social scheduling is buried inside an $800+/month marketing platform. SocialMate delivers social scheduling across 7 platforms for $5/month — or completely free.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">HubSpot Social</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Enterprise CRM with social as a feature</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Deep CRM + social integration</li>
              <li>✅ Marketing automation + workflows</li>
              <li>✅ Enterprise-grade team features</li>
              <li>❌ $800+/month — social is a bundled feature</li>
              <li>❌ No TikTok scheduling</li>
              <li>❌ No Discord, Telegram, Bluesky, Mastodon</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Social-first. 7 platforms. $5/month.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Built exclusively for social scheduling</li>
              <li>✅ TikTok free — HubSpot has none</li>
              <li>✅ X + LinkedIn + Bluesky + Discord + Telegram + Mastodon</li>
              <li>✅ 12 AI tools free</li>
              <li>✅ Pro $5/month — 160x cheaper than HubSpot</li>
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
              <span>HubSpot Social</span>
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

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over HubSpot Social</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'You need social scheduling — not an enterprise CRM',
                desc: 'HubSpot is an enterprise sales and marketing platform. Social media scheduling is one tab inside a $800+/month product suite designed for sales teams, marketing ops, and CRM-heavy workflows. If you\'re a creator or small business that primarily needs to schedule social posts, you\'re paying for a jet when you need a bicycle.',
              },
              {
                n: '2',
                title: 'TikTok is missing from HubSpot — present in SocialMate for free',
                desc: 'HubSpot supports LinkedIn, Facebook, Instagram, X, and YouTube — but not TikTok. SocialMate includes TikTok scheduling free (20 videos/month) via the official Production API. If TikTok is in your content strategy, HubSpot forces you to handle it manually or pay for a separate tool.',
              },
              {
                n: '3',
                title: '160x cheaper at the Pro tier',
                desc: 'HubSpot Marketing Hub Starter: $800+/month. SocialMate Pro: $5/month. Same core social scheduling result. Different scope — HubSpot is a full marketing suite; SocialMate is a focused social scheduler with AI tools. If social scheduling is the job, don\'t pay enterprise pricing for it.',
              },
              {
                n: '4',
                title: 'Discord and Telegram — channels HubSpot doesn\'t touch',
                desc: 'HubSpot has no Discord or Telegram support. If you run a community on either platform alongside your marketing channels, HubSpot can\'t help. SocialMate schedules Discord and Telegram posts alongside your social media — a combination no other affordable tool offers.',
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Social scheduling without the enterprise price</p>
          <h2 className="text-3xl font-extrabold mb-4">Get the scheduling. Skip the $800/month bill.</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            SocialMate schedules 7 platforms including TikTok and LinkedIn.
            Free plan available. Pro is $5/month — not $800.
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
