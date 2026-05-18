import type { Metadata } from 'next'
import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'SocialMate vs Flick (2026) — Full Comparison',
  description: "Flick starts at £14/month (~$18) with no free plan. SocialMate is free forever with TikTok included, plus Bluesky, Discord, and Telegram that Flick doesn't support.",
  openGraph: {
    title: 'SocialMate vs Flick (2026)',
    description: "Flick is £14/month (~$18) with a 14-day trial only. SocialMate is free forever — TikTok, Bluesky, Discord, Telegram, 12 AI tools, all included.",
    url: 'https://socialmate.studio/vs/flick',
  },
  alternates: { canonical: 'https://socialmate.studio/vs/flick' },
}

const COMPARISON = [
  { feature: 'Starting price',              flick: '£14/month (~$18)',          socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                   flick: '❌ (14-day trial only)',     socialmate: '✅ Free forever'          },
  { feature: 'TikTok support',              flick: '✅ (paid)',                  socialmate: '✅ Free'                  },
  { feature: 'Bluesky support',             flick: '❌',                         socialmate: '✅'                       },
  { feature: 'Discord support',             flick: '❌',                         socialmate: '✅'                       },
  { feature: 'Telegram support',            flick: '❌',                         socialmate: '✅'                       },
  { feature: 'Mastodon support',            flick: '❌',                         socialmate: '✅'                       },
  { feature: 'AI caption tools',            flick: '✅',                         socialmate: '✅ (12 tools)'            },
  { feature: 'AI credits free tier',        flick: 'None',                       socialmate: '50/month free'            },
  { feature: 'TikTok Script Generator',     flick: '❌',                         socialmate: '✅'                       },
  { feature: 'GIF export for clips',        flick: '❌',                         socialmate: '✅'                       },
  { feature: 'Bulk scheduling',             flick: '✅',                         socialmate: '✅ Free'                  },
  { feature: 'Link in bio',                 flick: '❌',                         socialmate: '✅ Free'                  },
  { feature: 'Hashtag manager',             flick: '✅',                         socialmate: '✅ Free'                  },
  { feature: 'Team seats (free)',           flick: '1',                           socialmate: '2'                        },
  { feature: 'Autonomous AI content',       flick: '❌',                         socialmate: 'SOMA (autopilot)'         },
]

const FAQ = [
  {
    q: 'Is Flick worth the price?',
    a: "Flick is a solid Instagram and TikTok-focused tool with good AI caption writing and hashtag research. At £14/month (~$18), it is priced for creators who are already monetizing their content. The main limitations: no Bluesky, Discord, Telegram, or Mastodon; no free plan (only a 14-day trial); no TikTok Script Generator; no link in bio tool. For creators on a budget or building audiences on open platforms, SocialMate delivers more for less.",
  },
  {
    q: 'Does Flick have a free plan?',
    a: "No. Flick offers a 14-day free trial, after which you must pay £14/month (~$18) or higher. There is no permanent free plan. SocialMate offers a free plan with no expiry — TikTok scheduling included, 50 AI credits per month, link in bio, bulk scheduling, and all 6 live platforms. No credit card required to start.",
  },
  {
    q: 'Is SocialMate better than Flick for TikTok?',
    a: "For most creators, yes. SocialMate includes TikTok scheduling on the free plan using the officially approved Production API — 20 videos per month free, 60 on Pro ($5/month). Flick requires a paid plan (~$18/month) for TikTok access. SocialMate also includes a TikTok Script Generator (AI-powered hooks, body, CTA formatted for TikTok) that Flick does not have. Where Flick has an edge: its hashtag research is more detailed and its Instagram-focused analytics are strong. If TikTok + open-web platforms are your priority, SocialMate is the better fit at a lower price.",
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

export default function VsFlickPage() {
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
            SocialMate vs Flick
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Flick starts at £14/month (~$18) with a 14-day trial and no permanent free plan. SocialMate is free forever — TikTok included — plus Bluesky, Discord, Telegram, and Mastodon that Flick doesn&apos;t support.
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Flick</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Strong AI captions, Instagram-centric, no free plan</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Good AI caption and hashtag tools</li>
              <li>✅ TikTok + Instagram focused</li>
              <li>❌ Starts at £14/month (~$18) — no free plan</li>
              <li>❌ No Bluesky, Discord, Telegram, or Mastodon</li>
              <li>❌ No TikTok Script Generator</li>
              <li>❌ No link in bio tool</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Free forever. TikTok + 5 more. 12 AI tools.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Free plan — permanent, no trial expiry</li>
              <li>✅ TikTok scheduling free (Production API approved)</li>
              <li>✅ Bluesky, Discord, Telegram, Mastodon, X</li>
              <li>✅ TikTok Script Generator included</li>
              <li>✅ Link in bio — free</li>
              <li>✅ 12 AI tools on free tier</li>
            </ul>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Feature comparison</h2>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span>Feature</span>
              <span>Flick</span>
              <span>SocialMate</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.flick}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over Flick</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'TikTok free vs TikTok behind ~$18/month',
                desc: "Flick requires a paid plan to access TikTok scheduling. SocialMate includes TikTok on the free plan — 20 videos per month using the officially approved Production API. For a creator posting once per day, that is free. Upgrading to Pro ($5/month) unlocks 60 videos per month. Either way, you are not paying $18/month just to reach TikTok.",
              },
              {
                n: '2',
                title: 'Flick skips the open web entirely',
                desc: 'Flick is focused on Instagram and TikTok. It does not support Bluesky, Discord, Telegram, or Mastodon. These are growing platforms where engaged communities are forming outside the algorithm. SocialMate covers all of them — from the same compose window, in the same post.',
              },
              {
                n: '3',
                title: 'TikTok Script Generator — Flick does not have one',
                desc: "SocialMate includes a TikTok Script Generator: AI writes your hook, body, and CTA formatted specifically for TikTok's short-form format. Uses 5 AI credits. Flick's AI tools focus on Instagram captions and hashtag analysis but don't generate full TikTok scripts optimized for the platform's structure.",
              },
              {
                n: '4',
                title: 'A 14-day trial is not a free plan',
                desc: 'Flick gives you 14 days to try the product before the clock runs out. SocialMate has a permanent free plan with no expiry. You can test your content strategy, grow your audience, and prove ROI before spending a single dollar. When you are ready to upgrade, Pro is $5/month — not $18.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">TikTok free. 6 platforms. 12 AI tools. Forever.</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            SocialMate is free forever — TikTok Production API included, Bluesky, Discord, Telegram, link in bio, TikTok Script Generator, and 12 AI tools. No trial clock.
          </p>
          <Link href="/signup" className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            Create free account →
          </Link>
          <p className="text-gray-600 text-xs mt-3">No card required · Free forever</p>
        </div>
      </div>
      {/* FOOTER */}
      <PublicFooter />
    </div>
  )
}
