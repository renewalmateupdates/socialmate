'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

const COMPARISON = [
  { feature: 'Starting price',            convertkit: '$25/month (Creator, 1k subs)', socialmate: '$0 — free forever'        },
  { feature: 'Primary focus',             convertkit: 'Email newsletters & automation', socialmate: 'Social media scheduling' },
  { feature: 'Social media scheduling',   convertkit: '❌ Not included',              socialmate: '✅ 7 platforms'            },
  { feature: 'Email campaigns',           convertkit: '✅ Core feature',              socialmate: '❌ Not included'           },
  { feature: 'Free plan',                 convertkit: 'Up to 1,000 subscribers',      socialmate: '✅ Full free plan'         },
  { feature: 'AI writing tools',          convertkit: 'Limited AI assist',            socialmate: '15+ tools free'            },
  { feature: 'Discord scheduling',        convertkit: '❌',                            socialmate: '✅'                       },
  { feature: 'Telegram scheduling',       convertkit: '❌',                            socialmate: '✅'                       },
  { feature: 'TikTok scheduling',         convertkit: '❌',                            socialmate: '✅'                       },
  { feature: 'LinkedIn scheduling',       convertkit: '❌',                            socialmate: '✅'                       },
  { feature: 'Bulk scheduling',           convertkit: '❌',                            socialmate: '✅ Free'                   },
  { feature: 'Link in bio (SIGIL)',        convertkit: 'Basic landing page',           socialmate: '✅ Free, no branding'      },
  { feature: 'Competitor tracking',       convertkit: '❌',                            socialmate: '✅ Free (3 accounts)'     },
  { feature: 'Post calendar',             convertkit: '❌',                            socialmate: '✅ Free'                   },
]

const FAQ = [
  {
    q: "Is ConvertKit the same as Kit?",
    a: "Yes — ConvertKit rebranded to Kit in 2024. It is the same product: an email newsletter and automation platform for creators. It does not include social media scheduling.",
  },
  {
    q: 'Does ConvertKit schedule social media posts?',
    a: "No. ConvertKit is built around email. It does not schedule posts to Twitter, Bluesky, Discord, Telegram, TikTok, or LinkedIn. You need a separate tool for social — or use SocialMate, which covers all 7 platforms and is free to start.",
  },
  {
    q: 'Can SocialMate and ConvertKit work together?',
    a: "Yes, and many creators use this combo. SocialMate builds your social audience across 7 platforms; your SIGIL link in bio drives followers to your ConvertKit landing page where they subscribe to your email list. Two complementary tools — one costs nothing to start.",
  },
  {
    q: 'What makes SocialMate better for social media than ConvertKit?',
    a: "SocialMate is purpose-built for social: bulk scheduling, 15+ AI writing tools, competitor tracking, post analytics, team collaboration, content repurposing, and cross-posting to 7 platforms in one click. ConvertKit does none of this — it is an email-first product.",
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

export default function VsConvertkitPage() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-screen bg-panel">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <nav className="border-b border-edge bg-panel sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold tracking-tight text-ink-high">SocialMate</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-semibold text-ink-body hover:text-ink-high transition-colors">{t('vs_shared.nav_login')}</Link>
            <Link href="/signup" className="text-xs font-bold px-4 py-2 bg-amber/10 text-ink-high rounded-xl hover:opacity-80 transition-all">{t('vs_shared.nav_start_free')}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-raised border border-edge-lit rounded-full px-4 py-1.5 text-xs font-bold text-ink-muted mb-4">
            Updated June 2026
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs ConvertKit (Kit)
          </h1>
          <p className="text-lg text-ink-body max-w-2xl mx-auto">
            ConvertKit (now Kit) is an email platform at $25+/month. SocialMate is a 7-platform social media scheduler with 15+ AI tools — free to start. Complementary tools, not competitors.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/signup" className="px-6 py-3 bg-amber/10 text-ink-high font-bold rounded-2xl hover:opacity-80 transition-all text-sm">
              {t('vs_shared.cta_try_free')}
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-edge font-semibold rounded-2xl hover:border-edge transition-all text-sm text-ink-high">
              {t('vs_shared.cta_see_pricing')}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-panel border-2 border-edge rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">ConvertKit (Kit)</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Leading email tool for creators</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Email automation and sequences</li>
              <li>✅ Landing pages and forms</li>
              <li>❌ $25+/month for paid features</li>
              <li>❌ No social media scheduling</li>
              <li>❌ No Discord, Telegram, Bluesky, or TikTok</li>
              <li>❌ Not designed for social content workflows</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">Social-first. 7 platforms. Starts free.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Schedule to 7 platforms in one click</li>
              <li>✅ 15+ AI writing and content tools</li>
              <li>✅ Discord, Telegram, Bluesky, TikTok, LinkedIn</li>
              <li>✅ SIGIL link in bio — free, no branding</li>
              <li>✅ Competitor tracking and analytics</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-body uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>ConvertKit</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-body">{row.convertkit}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div></div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Use both — or start with the free one</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'Different channels, different jobs',
                desc: "ConvertKit sends emails. SocialMate posts to social media. They are not competitors — they solve different problems. The question is: which do you need first? If you do not yet have an audience, social media (free) is how you build one before asking people to subscribe.",
              },
              {
                n: '2',
                title: 'SocialMate drives traffic to your ConvertKit page',
                desc: "The most effective creator stack: post consistently across 7 social platforms with SocialMate, link your ConvertKit signup page in your SIGIL link in bio, and convert social followers into email subscribers. SocialMate is the top of your funnel.",
              },
              {
                n: '3',
                title: '15+ social AI tools vs email-focused AI',
                desc: "ConvertKit has some AI writing features focused on email subjects and body copy. SocialMate has 15+ AI tools purpose-built for social: caption generator, thread builder, hashtag suggester, hook writer, post scorer, content repurposer, and more.",
              },
              {
                n: '4',
                title: 'Start free, scale when ready',
                desc: "SocialMate is free to start with no credit card. ConvertKit requires payment once you hit 1,000 subscribers. If you are building from zero, start with SocialMate to grow your audience, then add ConvertKit when you have a list worth emailing.",
              },
            ].map((r) => (
              <div key={r.n} className="flex gap-4 p-5 bg-raised border border-edge rounded-2xl hover:border-edge transition-all">
                <div className="w-8 h-8 bg-amber/10 text-ink-high rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0">{r.n}</div>
                <div>
                  <p className="text-sm font-extrabold mb-1 text-ink-high">{r.title}</p>
                  <p className="text-xs text-ink-body leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.faq_heading')}</h2>
          <div className="space-y-4">
            {FAQ.map((faq, i) => (
              <div key={i} className="p-5 bg-raised border border-edge rounded-2xl">
                <p className="text-sm font-extrabold mb-2 text-ink-high">{faq.q}</p>
                <p className="text-xs text-ink-body leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-void text-ink-high rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Build your social audience first — it is free</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            Schedule to 7 platforms, use 15+ AI tools, grow your audience — all free. No credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-amber/10 text-ink-high font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
          <p className="text-ink-muted text-xs mt-3">{t('vs_shared.cta_no_card')}</p>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
