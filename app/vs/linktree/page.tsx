'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'

const COMPARISON = [
  { feature: 'Starting price',           linktree: '$5/month (Pro)',              socialmate: '$0 — free forever'        },
  { feature: 'Link in bio page',         linktree: '✅ Core feature',             socialmate: '✅ SIGIL — free'           },
  { feature: 'Custom domain',            linktree: '$9/month (Premium)',          socialmate: 'White Label Pro plan'     },
  { feature: 'Analytics on links',       linktree: 'Paid (Pro+)',                 socialmate: '✅ Free with QR code'     },
  { feature: 'Social media scheduling',  linktree: '❌ Not included',             socialmate: '✅ 7 platforms'            },
  { feature: 'AI writing tools',         linktree: '❌',                           socialmate: '15+ tools free'           },
  { feature: 'Bulk scheduling',          linktree: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Post calendar',            linktree: '❌',                           socialmate: '✅ Free'                  },
  { feature: 'Competitor tracking',      linktree: '❌',                           socialmate: '✅ Free (3 accounts)'    },
  { feature: 'Discord support',          linktree: '❌',                           socialmate: '✅'                       },
  { feature: 'Telegram support',         linktree: '❌',                           socialmate: '✅'                       },
  { feature: 'TikTok scheduling',        linktree: '❌',                           socialmate: '✅'                       },
  { feature: 'LinkedIn scheduling',      linktree: '❌',                           socialmate: '✅'                       },
  { feature: 'QR code for bio page',     linktree: '❌ (paid plan only)',          socialmate: '✅ Free'                  },
  { feature: 'Team seats',               linktree: '1 (free)',                    socialmate: '2 (free)'                },
]

const FAQ = [
  {
    q: "Why would I pay Linktree when SocialMate's SIGIL is free?",
    a: "Linktree's free plan is barebones — no analytics, limited links, Linktree branding on your page. Their Pro plan ($5/month) removes the branding and adds analytics. SocialMate's SIGIL link in bio is completely free, includes click analytics and a QR code, and lives alongside a full post scheduler, 15+ AI tools, and 7-platform support. You get more for less.",
  },
  {
    q: 'What is SIGIL?',
    a: "SIGIL is SocialMate's link in bio builder. Create a custom landing page with all your links, embed your social profiles, and track clicks — all free. It's included in every SocialMate plan, including the free tier. No separate subscription needed.",
  },
  {
    q: 'Does Linktree have a post scheduler?',
    a: "No. Linktree is a link landing page product. It does not schedule posts to Twitter, Bluesky, Discord, Telegram, TikTok, or LinkedIn. If you want to build your audience by actually posting content across platforms, you need a separate tool — or you use SocialMate which includes both.",
  },
  {
    q: 'Can I migrate from Linktree to SocialMate SIGIL?',
    a: "Yes. Sign up for SocialMate (free), go to your SIGIL page, and add all your links. Your SocialMate profile URL becomes your new link in bio. You then get the scheduler, AI tools, and analytics all in the same dashboard. Most users who switch do so in under 10 minutes.",
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

export default function VsLinktreePage() {
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
            SocialMate vs Linktree
          </h1>
          <p className="text-lg text-ink-body max-w-2xl mx-auto">
            Linktree charges $5-9/month for a link page. SocialMate's SIGIL link in bio is completely free — and you also get a full social media scheduler with 15+ AI tools and 7 platforms.
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
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">Linktree</p>
            <p className="font-extrabold text-lg mb-2 text-ink-high">Link in bio — and only that</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ Simple link landing page</li>
              <li>✅ Widely recognized brand</li>
              <li>❌ $5-9/month for analytics and custom domain</li>
              <li>❌ Linktree branding on free plan</li>
              <li>❌ No post scheduler</li>
              <li>❌ No AI tools, no competitor tracking</li>
            </ul>
          </div>
          <div className="bg-void text-ink-high rounded-2xl p-6">
            <p className="text-xs font-bold text-ink-body uppercase tracking-wide mb-2">SocialMate</p>
            <p className="font-extrabold text-lg mb-2">SIGIL link in bio + full Creator OS. Free.</p>
            <ul className="space-y-1 text-xs text-ink-body">
              <li>✅ SIGIL link in bio — free with analytics + QR</li>
              <li>✅ Schedule to 7 platforms simultaneously</li>
              <li>✅ 15+ AI writing tools on free tier</li>
              <li>✅ No Linktree branding — your page, your brand</li>
              <li>✅ Competitor tracking, bulk scheduling, inbox</li>
              <li>✅ No credit card required</li>
            </ul>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised px-5 py-3 text-xs font-extrabold text-ink-body uppercase tracking-wide">
              <span>{t('vs_shared.table_feature')}</span>
              <span>Linktree</span>
              <span>{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3.5 text-sm border-t border-edge ${i % 2 === 0 ? 'bg-panel' : 'bg-raised'}`}>
                <span className="font-semibold text-ink-body text-xs">{row.feature}</span>
                <span className="text-xs text-ink-body">{row.linktree}</span>
                <span className="text-xs font-semibold text-ink-high">{row.socialmate}</span>
              </div>
            ))}
          </div></div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">Why pay for just a link page when you can get everything free?</h2>
          <div className="space-y-4">
            {[
              {
                n: '1',
                title: 'SIGIL is free. Linktree Pro is $5/month.',
                desc: "Linktree's free plan shows their branding on your page and hides analytics behind a paywall. SocialMate's SIGIL is free, no branding, click analytics included, QR code included. The value math is obvious.",
              },
              {
                n: '2',
                title: 'A link page alone does not grow your audience',
                desc: 'Linktree is a destination, not a growth engine. To drive traffic to that destination, you still need to post content. SocialMate gives you the link page and the scheduler to keep posting across 7 platforms simultaneously — both in one free product.',
              },
              {
                n: '3',
                title: 'SocialMate SIGIL does not shout your tool name at visitors',
                desc: "Linktree's free plan puts a 'Linktree' logo at the bottom of your link page. Every visitor knows what tool you use. SIGIL pages are clean and brandable. Even on the free plan.",
              },
              {
                n: '4',
                title: 'The whole Creator OS — not just one feature',
                desc: 'Linktree does one thing. SocialMate does everything: SIGIL link in bio, post scheduler, 15+ AI tools, bulk scheduling, competitor tracking, team seats, social inbox, analytics, and more. The link page comes with the full platform.',
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
          <h2 className="text-2xl font-extrabold tracking-tight mb-3">Stop paying for a link page when you can get it free</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            SIGIL link in bio, 7-platform scheduler, 15+ AI tools, analytics — all free. No credit card required.
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
