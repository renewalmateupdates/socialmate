'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',               mention: '$41/month',                   socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    mention: '❌ No free plan',              socialmate: '✅ 50 credits/month'     },
  { feature: 'Post scheduling',              mention: '❌ Monitoring only',           socialmate: '✅ Full scheduling suite' },
  { feature: 'Platforms supported',           mention: 'Monitoring only',             socialmate: '7 platforms — scheduling' },
  { feature: 'Discord scheduling',            mention: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           mention: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            mention: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             mention: '❌',                           socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           mention: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Brand mention monitoring',      mention: '✅ (core feature)',            socialmate: '✅ Competitor tracking'  },
  { feature: 'Sentiment analysis',            mention: '✅',                           socialmate: '✅ SM Radar (AI-powered)' },
  { feature: 'AI writing tools',              mention: '❌',                           socialmate: '15+ tools free'           },
  { feature: 'Autonomous content system',     mention: '❌',                           socialmate: '✅ SOMA — learns your voice' },
  { feature: '8 autonomous AI agents',        mention: '❌',                           socialmate: '✅ Pro+'                  },
  { feature: 'Content calendar',             mention: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              mention: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Link in bio (SIGIL)',           mention: '❌',                           socialmate: '✅ Built in free'         },
  { feature: 'Team collaboration',            mention: '✅ ($83+)',                    socialmate: 'Free (2 seats)'          },
  { feature: 'Creator Monetization Hub',      mention: '❌',                           socialmate: '✅ Tip jar + fan subs'   },
]

const FAQ = [
  {
    q: 'What does Mention do and who is it for?',
    a: "Mention is a social listening and media monitoring tool. It tracks mentions of your brand, competitors, or topics across social media, blogs, news sites, and forums. It shows sentiment analysis and reach for each mention. Mention does NOT schedule or publish social media posts — it's purely for monitoring what people are saying about you or your industry. It's most useful for PR professionals, marketing managers, and brand teams who need comprehensive monitoring.",
  },
  {
    q: 'Can SocialMate replace Mention for monitoring?',
    a: "SocialMate includes competitor tracking (up to 3 accounts, with engagement alerts), SM Radar (AI-powered content intelligence that surfaces gaps and opportunities), and SM Pulse (niche trend scanning). These cover the core monitoring use cases most creators need: knowing when competitors post, understanding what's trending, and finding content opportunities. Mention's comprehensive web-wide mention tracking across news and blogs is more thorough — but for creators focused on content strategy, SocialMate's monitoring tools are sufficient and come bundled with a full scheduler.",
  },
  {
    q: 'Why does Mention cost $41/month when it only does monitoring?',
    a: "Mention's pricing reflects enterprise and agency positioning. $41/month is their individual plan — agency plans go higher. Social listening infrastructure (crawling the web for mentions in real time) is expensive to operate. That infrastructure cost gets passed to customers. SocialMate focuses on publishing and AI content generation instead of web-wide crawling — which lets us offer more features for less.",
  },
  {
    q: 'Does SocialMate help you respond to mentions?',
    a: "Yes. SocialMate's unified inbox aggregates mentions and replies from Bluesky, Mastodon, Discord, and Telegram. You can read and reply inline — without switching between apps. The Inbox Agent also monitors Bluesky mentions and generates suggested replies via AI, saving time on community management.",
  },
  {
    q: 'What AI tools does SocialMate include?',
    a: "SocialMate's 15+ AI tools include caption generation, viral hook writing, content repurposing (6 formats), hashtag research, thread generation, post rewriting, post scoring, brand voice injection, SM Pulse (trend scan), SM Radar (content intelligence report), and SOMA — an autonomous content agent that generates a full week of platform-native posts from your brand context.",
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

export default function VsMentionPage() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-screen bg-panel">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* NAV */}
      <nav className="border-b border-edge bg-panel bg-panel sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold tracking-tight text-ink-high">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-ink-muted hover:text-ink-high dark:hover:text-ink-high transition-colors">{t('vs_shared.nav_login')}</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-void text-ink-high rounded-xl hover:opacity-80 transition-all">{t('vs_shared.nav_start_free')}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* HERO */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-raised bg-raised border border-edge-lit border-edge-lit rounded-full px-4 py-1.5 text-xs font-bold text-ink-muted mb-4">
            Updated May 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs Mention
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Mention charges $41/month for social listening only — no scheduling. SocialMate schedules, monitors, and creates content across 7 platforms. Starts free.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-void text-ink-high font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
              {t('vs_shared.cta_try_free')}
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-edge font-semibold rounded-2xl hover:border-edge transition-all text-sm text-ink-high">
              {t('vs_shared.cta_see_pricing')}
            </Link>
          </div>
        </div>

        {/* VERDICT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-panel border-2 border-edge rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Mention</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Monitoring only, no scheduling</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Web-wide brand mention tracking</li>
              <li>✅ Sentiment analysis + reach estimates</li>
              <li>✅ News and blog monitoring</li>
              <li>❌ $41/month — no free plan</li>
              <li>❌ Cannot schedule or publish posts</li>
              <li>❌ No AI writing or content generation</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Schedule + monitor + create. Free.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Scheduling to 7 platforms</li>
              <li>✅ Competitor tracking + engagement alerts</li>
              <li>✅ SM Radar: AI content intelligence report</li>
              <li>✅ 15+ AI tools + SOMA autonomous content</li>
              <li>✅ Pro plan for $5/month total</li>
              <li>✅ No credit card required to start</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-muted uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Mention</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.mention}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators choose SocialMate over Mention</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: "Mention monitors — it can't publish",
                desc: "Mention is a powerful listening tool but it literally cannot publish a social post. If you need to monitor what people are saying AND actually respond by publishing content — you need two separate subscriptions. SocialMate does both: monitors competitors, tracks engagement, and publishes to 7 platforms — all from one platform.",
              },
              {
                n: '2',
                title: '$41/month for monitoring vs. $0 for everything',
                desc: "Mention's lowest plan is $41/month for one user, one brand. SocialMate's free plan includes scheduling to 7 platforms, competitor tracking with alerts, AI content intelligence (SM Radar), and 15+ AI tools. Pro is $5/month. The cost comparison at every tier strongly favors SocialMate.",
              },
              {
                n: '3',
                title: 'SM Radar turns monitoring into actionable content',
                desc: "Mention shows you what people are saying. SM Radar tells you what to do about it: content gaps your competitors are missing, the best formats for your niche right now, hook styles that drive engagement, and one specific opportunity for this week. Monitoring data is only useful if it informs your content strategy — SM Radar closes that loop.",
              },
              {
                n: '4',
                title: 'Unified inbox for community platform replies',
                desc: "SocialMate's unified inbox pulls mentions and replies from Bluesky, Mastodon, Discord, and Telegram. The Inbox Agent monitors Bluesky for mentions and generates AI-suggested replies. This is active engagement management — not passive monitoring. You see what people say and can respond without leaving the platform.",
              },
            ].map((r) => (
              <div key={r.n} className="flex gap-4 p-5 bg-panel border border-edge border-edge rounded-2xl hover:border-edge dark:hover:border-edge transition-all">
                <div className="w-8 h-8 bg-void text-ink-high rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0">{r.n}</div>
                <div>
                  <p className="text-sm font-extrabold mb-1 text-ink-high">{r.title}</p>
                  <p className="text-xs text-ink-muted leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.faq_heading')}</h2>
          <div className="space-y-4">
            {FAQ.map((faq, i) => (
              <div key={i} className="p-5 bg-panel border border-edge border-edge rounded-2xl">
                <p className="text-sm font-extrabold mb-2 text-ink-high">{faq.q}</p>
                <p className="text-xs text-ink-muted leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="text-center py-12 bg-void text-ink-high rounded-3xl px-8">
          <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-3">Monitor and publish from one place</p>
          <h2 className="text-3xl font-extrabold mb-4">Stop monitoring. Start publishing. Free.</h2>
          <p className="text-ink-body mb-6 max-w-lg mx-auto text-sm">
            SocialMate schedules posts to 7 platforms, tracks competitors, and uses AI to generate what to post next.
            Start free. Pro is $5/month.
          </p>
          <Link href="/signup" className="inline-block px-8 py-3 bg-panel text-ink-high font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
            Start free — no credit card →
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link href="/vs" className="text-xs text-ink-body hover:text-ink-muted dark:hover:text-ink-body transition-colors">
            ← View all comparisons
          </Link>
        </div>

      </div>
      <PublicFooter />
    </div>
  )
}
