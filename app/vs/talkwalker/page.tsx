'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',               talkwalker: '$9,600+/year (enterprise)',   socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    talkwalker: '❌ No free plan',              socialmate: '✅ 50 credits/month'     },
  { feature: 'Post scheduling',              talkwalker: '❌ Listening only',            socialmate: '✅ Full scheduling suite' },
  { feature: 'Target audience',             talkwalker: 'Enterprise brands, agencies',  socialmate: 'Creators, teams, agencies' },
  { feature: 'Discord scheduling',            talkwalker: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           talkwalker: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            talkwalker: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             talkwalker: '❌',                           socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           talkwalker: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Social listening (web-wide)',   talkwalker: '✅ (core strength)',           socialmate: '✅ Competitor tracking'  },
  { feature: 'Sentiment analysis',            talkwalker: '✅ (enterprise AI)',           socialmate: '✅ SM Radar (AI-powered)' },
  { feature: 'AI writing tools',              talkwalker: '❌',                           socialmate: '15+ tools free'           },
  { feature: 'Autonomous content system',     talkwalker: '❌',                           socialmate: '✅ SOMA — learns your voice' },
  { feature: '8 autonomous AI agents',        talkwalker: '❌',                           socialmate: '✅ Pro+'                  },
  { feature: 'Content calendar',             talkwalker: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              talkwalker: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Link in bio (SIGIL)',           talkwalker: '❌',                           socialmate: '✅ Built in free'         },
  { feature: 'Self-serve signup',            talkwalker: '❌ Demo + contract required',  socialmate: '✅ Sign up in minutes'    },
  { feature: 'Creator Monetization Hub',      talkwalker: '❌',                           socialmate: '✅ Tip jar + fan subs'   },
  { feature: 'SM-Give charity program',       talkwalker: '❌',                           socialmate: '✅ 2% of revenue donated' },
]

const FAQ = [
  {
    q: 'What is Talkwalker and who is it for?',
    a: "Talkwalker is an enterprise social listening and analytics platform. It monitors billions of sources — social media, news, blogs, forums, podcasts, and more — for brand mentions, sentiment, and trend signals. It's used by global enterprise brands and large agencies. Pricing starts at roughly $800/month ($9,600+/year) and scales well beyond that for advanced tiers. It requires a sales demo and a contract to get started. It cannot schedule or publish social media posts.",
  },
  {
    q: 'Can SocialMate replace Talkwalker for social listening?',
    a: "Talkwalker's web-wide listening coverage — billions of sources across news, podcasts, forums, and social platforms — is enterprise-grade and hard to replicate. SocialMate focuses on publishing and AI content generation, with creator-scale monitoring built in: competitor tracking (up to 3 accounts), SM Radar (AI-powered content intelligence), and SM Pulse (niche trend scan). For most creators and small teams, SocialMate's monitoring tools provide enough signal to inform content strategy without the $9,600/year price tag.",
  },
  {
    q: 'Why does Talkwalker cost so much?',
    a: "Talkwalker's pricing reflects the infrastructure required to crawl and process billions of social and news sources in near-real-time, plus the enterprise features layered on top: dashboards, role-based access, custom reports, and dedicated customer success. That infrastructure cost gets passed to enterprise customers. SocialMate built a different product — purpose-built for creators and small teams who need to publish and create content, not operate a brand intelligence command center.",
  },
  {
    q: 'Does SocialMate have any listening or monitoring features?',
    a: "Yes. SocialMate includes competitor tracking (monitor up to 3 competitor accounts, get engagement alerts when they post), SM Radar (AI-powered content intelligence report: gaps competitors are missing, best formats for your niche, hook styles, and one specific opportunity for this week), and SM Pulse (niche trend scan that surfaces trending topics in your space). The unified inbox also pulls mentions from Bluesky, Mastodon, Discord, and Telegram — and the Inbox Agent monitors Bluesky mentions and suggests AI replies.",
  },
  {
    q: 'What AI tools does SocialMate include?',
    a: "SocialMate's 15+ AI tools include caption generation, viral hook writing, content repurposing (6 formats), hashtag research, thread generation, post rewriting, post scoring, brand voice injection, SM Pulse (trend scan), SM Radar (content intelligence report), and SOMA — an autonomous content agent that generates a full week of platform-native posts from your brand context automatically.",
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

export default function VsTalkwalkerPage() {
  const { t } = useI18n()
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
            <Link href="/login" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{t('vs_shared.nav_login')}</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all">{t('vs_shared.nav_start_free')}</Link>
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
            SocialMate vs Talkwalker
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Talkwalker charges $9,600+/year for enterprise listening — and cannot schedule a single post. SocialMate schedules across 7 platforms, monitors competitors, and creates content with AI. Starts free.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-black text-white font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
              {t('vs_shared.cta_try_free')}
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-gray-200 dark:border-gray-700 font-semibold rounded-2xl hover:border-gray-400 transition-all text-sm dark:text-gray-200">
              {t('vs_shared.cta_see_pricing')}
            </Link>
          </div>
        </div>

        {/* VERDICT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Talkwalker</p>
            <p className="font-extrabold text-lg mb-2 dark:text-white">Enterprise listening, no publishing</p>
            <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>✅ Billion-source social + news monitoring</li>
              <li>✅ Enterprise AI sentiment + trend analysis</li>
              <li>✅ Visual analytics dashboards</li>
              <li>❌ $9,600+/year — demo + contract required</li>
              <li>❌ Cannot schedule or publish posts</li>
              <li>❌ No AI writing or content generation</li>
            </ul>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Schedule + monitor + create. Free.</p>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✅ Discord + Telegram + Bluesky + TikTok + LinkedIn + X + Mastodon</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ SOMA autonomous content agent</li>
              <li>✅ SM Radar: AI content intelligence report</li>
              <li>✅ Pro plan for $5/month total</li>
              <li>✅ No credit card required to start</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 px-5 py-3 text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Talkwalker</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{row.feature}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{row.talkwalker}</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">Why creators choose SocialMate over Talkwalker</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: "Talkwalker listens — it can't publish",
                desc: "Talkwalker is one of the best social listening platforms in the world. But it literally cannot schedule or publish a social media post. If you need to both monitor what's happening AND respond by creating and publishing content — you need two completely separate subscriptions. SocialMate does both: monitors competitors, tracks trends via SM Radar, and publishes to 7 platforms — all from one tool.",
              },
              {
                n: '2',
                title: '$9,600+/year vs. $0 for creator-scale monitoring',
                desc: "Talkwalker's entry pricing starts at roughly $800/month for enterprise teams. SocialMate's free plan includes competitor tracking with engagement alerts, SM Radar (AI content intelligence), and SM Pulse (niche trend scan) — covering the core monitoring use cases creators actually need. Pro is $5/month. The ROI comparison isn't close.",
              },
              {
                n: '3',
                title: 'SM Radar turns listening data into content',
                desc: "Talkwalker shows you what people are saying. SM Radar tells you what to do about it: content gaps your competitors are missing, the best formats for your niche right now, hook styles that drive engagement, and one specific opportunity for this week. Monitoring data is only valuable if it informs your next post. SM Radar closes that loop with one click and 20 credits.",
              },
              {
                n: '4',
                title: 'SOMA generates the content Talkwalker helps you find ideas for',
                desc: "Talkwalker can surface trending topics in your niche. SOMA actually writes the content. Define your brand context, connect your platforms — and SOMA generates a full week of platform-native posts automatically. LinkedIn updates, Discord announcements, TikTok hooks — all created from one ingestion run. Combine SM Radar's insights with SOMA's generation and you have a full content pipeline without an enterprise budget.",
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
          <h2 className="text-xl font-extrabold tracking-tight mb-6 dark:text-white">{t('vs_shared.faq_heading')}</h2>
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Monitor and publish from one place</p>
          <h2 className="text-3xl font-extrabold mb-4">Stop listening. Start creating. Free.</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            SocialMate schedules to 7 platforms, tracks competitors, and uses AI to generate what to post next.
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
