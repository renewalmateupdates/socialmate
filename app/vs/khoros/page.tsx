'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',               khoros: '$500+/month (enterprise)',      socialmate: '$0 — free forever'       },
  { feature: 'Free plan',                    khoros: '❌ No free plan',               socialmate: '✅ 50 credits/month'     },
  { feature: 'Target audience',              khoros: 'Enterprise brands only',        socialmate: 'Creators, teams, agencies' },
  { feature: 'Discord scheduling',            khoros: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Telegram scheduling',           khoros: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'Bluesky scheduling',            khoros: '❌',                            socialmate: '✅ Free'                  },
  { feature: 'TikTok scheduling',             khoros: '✅ (enterprise)',               socialmate: '✅ Free (20 videos/mo)'  },
  { feature: 'LinkedIn scheduling',           khoros: '✅ (enterprise)',               socialmate: '✅ Free'                  },
  { feature: 'Enterprise community platform', khoros: '✅ (core product)',             socialmate: '✅ HESTIA community tab'  },
  { feature: 'AI writing tools',              khoros: '✅ (enterprise paid)',          socialmate: '15+ tools free'           },
  { feature: 'Autonomous content system',     khoros: '❌',                            socialmate: '✅ SOMA — learns your voice' },
  { feature: '8 autonomous AI agents',        khoros: '❌',                            socialmate: '✅ Pro+'                  },
  { feature: 'Content calendar',             khoros: '✅ (enterprise)',               socialmate: '✅ Free'                  },
  { feature: 'Bulk scheduling',              khoros: '✅ (enterprise)',               socialmate: '✅ Free'                  },
  { feature: 'Link in bio (SIGIL)',           khoros: '❌',                            socialmate: '✅ Built in free'         },
  { feature: 'Self-serve setup',             khoros: '❌ Requires demo + contract',   socialmate: '✅ Sign up in minutes'    },
  { feature: 'Creator Monetization Hub',      khoros: '❌',                            socialmate: '✅ Tip jar + fan subs'   },
  { feature: 'SM-Give charity program',       khoros: '❌',                            socialmate: '✅ 2% of revenue donated' },
]

const FAQ = [
  {
    q: 'What is Khoros and who uses it?',
    a: "Khoros (formerly Lithium Technologies and Spredfast) is an enterprise customer engagement platform combining social media management, branded community hosting, and customer service tools. It's used by large brands like Adobe, Airbnb, and Spotify to manage their social presence and host owned communities. Pricing starts at several hundred to thousands of dollars per month — it requires a demo, a contract, and enterprise procurement. It is not designed for individual creators or small teams.",
  },
  {
    q: 'Is SocialMate comparable to Khoros?',
    a: "Khoros and SocialMate serve fundamentally different audiences. Khoros is for enterprise social teams managing dozens of accounts with complex approval workflows and deep CRM integrations. SocialMate is for creators, small businesses, and lean agencies who need reliable multi-platform scheduling, AI content tools, and team collaboration — without enterprise complexity or enterprise pricing. If you're not a Fortune 500 brand with a dedicated social team, Khoros is not the right tool.",
  },
  {
    q: 'Does SocialMate have community features like Khoros?',
    a: "SocialMate includes HESTIA — a built-in community tab where creators using SocialMate can post wins, questions, tips, and feedback. It has emoji reactions, threaded replies, and a connected-account gate to keep discussions authentic. This is a creator-scale community feature, not a branded enterprise community platform like Khoros's core product. For creators who want a community hub within their tool, HESTIA fills that need for free.",
  },
  {
    q: 'What platforms does SocialMate schedule to?',
    a: "SocialMate has 7 live platforms: Discord, Telegram, Bluesky, TikTok, LinkedIn, X/Twitter, and Mastodon. Each connects via official OAuth. Discord and Telegram are unique — almost no competitor supports community platform scheduling. Khoros focuses on Facebook, Instagram, LinkedIn, Twitter, and YouTube.",
  },
  {
    q: 'Why choose SocialMate over an enterprise tool like Khoros?',
    a: "Unless you're running a social team at a Fortune 500 company with an enterprise budget, Khoros is not the right choice. SocialMate is self-serve: sign up, connect your accounts, start posting in minutes — free. No demo required. No contract. For creators, solo founders, small agencies, and growing teams, SocialMate delivers professional-grade scheduling, AI content tools, and team features at a fraction of what enterprise tools charge.",
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

export default function VsKhorosPage() {
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
            SocialMate vs Khoros
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            Khoros is enterprise social management at $500+/month — requires a demo and a contract. SocialMate is free, self-serve, and ready in minutes.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Khoros</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Enterprise-only, contract required</p>
            <ul className="space-y-1 text-xs text-ink-muted">
              <li>✅ Branded community platform hosting</li>
              <li>✅ Enterprise CRM and care integrations</li>
              <li>✅ Advanced multi-team workflows</li>
              <li>❌ $500+/month — demo + contract required</li>
              <li>❌ No Discord, Telegram, or Bluesky</li>
              <li>❌ No autonomous content generation like SOMA</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Self-serve. 7 platforms. Free.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Discord + Telegram + Bluesky + TikTok + LinkedIn + X + Mastodon</li>
              <li>✅ 15+ AI tools on free tier</li>
              <li>✅ SOMA autonomous content agent</li>
              <li>✅ HESTIA community tab</li>
              <li>✅ Pro plan for $5/month total</li>
              <li>✅ No demo required — ready in minutes</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-muted uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Khoros</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-muted">{row.khoros}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* WHY SWITCH */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why creators choose SocialMate over Khoros</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: "Khoros is not designed for creators or small teams",
                desc: "Khoros is built for large enterprises: multi-team workflows, custom SLAs, enterprise security compliance, dedicated account managers, and procurement processes. If you're a creator, freelancer, small business, or lean agency, you don't need any of that — and you'd pay thousands per month for features you'll never touch. SocialMate is self-serve, starts free, and scales to $20/month max.",
              },
              {
                n: '2',
                title: 'Discord and Telegram: the platforms Khoros skips',
                desc: "Khoros focuses on Facebook, Instagram, LinkedIn, Twitter, and YouTube — the mainstream brand channels. Discord and Telegram are creator-first platforms. SocialMate built native scheduling for both because that's where modern creators build communities. No enterprise tool has prioritized these platforms the way SocialMate has.",
              },
              {
                n: '3',
                title: 'SOMA generates content — Khoros just publishes it',
                desc: "Khoros is an excellent publishing and community management tool. But you still have to write the content. SocialMate's SOMA ingests your brand context and autonomously generates a full week of platform-native posts — one run covers LinkedIn, Discord, TikTok, X, and more. The content creation layer doesn't exist in Khoros.",
              },
              {
                n: '4',
                title: 'No demo. No contract. Start in minutes.',
                desc: "Khoros requires a sales demo, an enterprise evaluation, and a signed contract before you can post a single tweet through their platform. SocialMate requires a 30-second signup and an email confirmation. Free forever, no credit card. When you're ready for Pro, it's $5/month with one click.",
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
          <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-3">Built for creators, not enterprise</p>
          <h2 className="text-3xl font-extrabold mb-4">No demo. No contract. Just free.</h2>
          <p className="text-ink-body mb-6 max-w-lg mx-auto text-sm">
            SocialMate is self-serve, free to start, and ready in minutes.
            7 platforms, 15+ AI tools, SOMA. Pro is $5/month.
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
