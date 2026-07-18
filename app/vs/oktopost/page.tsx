'use client'

import Link from 'next/link'
import PublicFooter from '@/components/PublicFooter'
import { useI18n } from '@/contexts/I18nContext'



const COMPARISON = [
  { feature: 'Starting price',         oktopost: '$500+/month (enterprise)', socialmate: '$0 — free forever'       },
  { feature: 'Free plan',              oktopost: '❌ No free plan',           socialmate: '✅ Genuinely free'        },
  { feature: 'Target audience',        oktopost: 'Enterprise B2B teams',     socialmate: 'Creators, SMBs, agencies' },
  { feature: 'Platforms supported',    oktopost: 'LinkedIn-focused',         socialmate: '7 platforms'            },
  { feature: 'Team seats',             oktopost: 'Unlimited (enterprise)',   socialmate: '2 seats free'            },
  { feature: 'AI writing tools',       oktopost: 'Limited',                  socialmate: '15+ tools free'           },
  { feature: 'Employee advocacy',      oktopost: '✅ Core feature',          socialmate: '❌'                       },
  { feature: 'B2B analytics',          oktopost: '✅ Deep attribution',      socialmate: 'Basic analytics free'    },
  { feature: 'Bulk scheduling',        oktopost: '✅',                       socialmate: '✅ Free'                  },
  { feature: 'Link in bio',            oktopost: '❌',                       socialmate: '✅ Free'                  },
  { feature: 'Evergreen recycling',    oktopost: '❌',                       socialmate: '✅ Free'                  },
  { feature: 'RSS import',             oktopost: '✅',                       socialmate: '✅ Free'                  },
  { feature: 'Bluesky / Mastodon',     oktopost: '❌',                       socialmate: '✅'                       },
  { feature: 'Discord / Telegram',     oktopost: '❌',                       socialmate: '✅'                       },
  { feature: 'Client workspaces',      oktopost: 'Enterprise only',          socialmate: 'Pro+: from $5/mo'        },
  { feature: 'Salesforce integration', oktopost: '✅',                       socialmate: '❌'                       },
]

const FAQ = [
  {
    q: 'What is Oktopost and who is it for?',
    a: 'Oktopost is an enterprise B2B social media management platform with a strong focus on employee advocacy and LinkedIn marketing. It\'s designed for large organizations with dedicated social media teams and starts around $500/month or more.',
  },
  {
    q: 'Should creators and small businesses use Oktopost?',
    a: 'No — Oktopost is explicitly built for enterprise B2B companies. The pricing, feature set, and onboarding are all tuned for large teams. Creators, freelancers, and small businesses would find SocialMate a much better fit.',
  },
  {
    q: 'Does SocialMate support LinkedIn?',
    a: 'LinkedIn support is on SocialMate\'s roadmap and coming soon. In the meantime, SocialMate covers 7 platforms including Bluesky, Discord, Telegram, Mastodon, and X/Twitter — all channels most B2B creators are building on in 2026.',
  },
  {
    q: 'What does Oktopost do better than SocialMate?',
    a: 'Oktopost has deep employee advocacy features — turning your entire company\'s employees into brand amplifiers on LinkedIn. This is a genuine enterprise use case that SocialMate doesn\'t cover. If that\'s your primary need, Oktopost is purpose-built for it.',
  },
  {
    q: 'Why is there such a large price difference?',
    a: 'Oktopost targets enterprise buyers who pay per seat with full procurement processes. SocialMate is bootstrapped and targets individual creators through agencies — completely different markets. The price difference reflects this.',
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

export default function VsOktopost() {
  const { t } = useI18n()
  return (
    <div className="dark min-h-screen bg-panel">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <header className="sticky top-0 z-50 bg-panel bg-panel backdrop-blur-sm border-b border-edge">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="SocialMate" className="w-8 h-8 rounded-xl" />
            <span className="font-bold text-base tracking-tight text-ink-high">
              SocialMate
              <span className="text-[10px] font-semibold bg-raised text-ink-high px-1.5 py-0.5 rounded-full align-super ml-1">Beta</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {[
              { label: 'Features',    href: '/features'    },
              { label: 'Pricing',     href: '/pricing'     },
              { label: 'Studio Stax', href: '/studio-stax' },
              { label: 'Roadmap',     href: '/roadmap'     },
              { label: 'Our Story',   href: '/story'       },
              { label: 'Blog',        href: '/blog'        },
            ].map(l => (
              <Link key={l.label} href={l.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-ink-muted hover:text-ink-high dark:hover:text-ink-high hover:bg-raised dark:hover:bg-raised transition-all">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <Link href="/give" className="text-sm font-semibold text-alert hover:text-alert transition-all">❤️ Give</Link>
            <Link href="/partners" className="text-sm font-semibold text-amber hover:text-amber transition-all">Partners</Link>
            <Link href="/login" className="text-sm font-semibold text-ink-muted hover:text-ink-high dark:hover:text-ink-high transition-all">{t('vs_shared.nav_sign_in')}</Link>
            <Link href="/signup" className="bg-void bg-panel text-ink-high text-sm font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
              {t('vs_shared.nav_get_started')}
            </Link>
          </div>
          <div className="flex md:hidden items-center gap-2">
            <Link href="/login" className="text-sm font-semibold text-ink-muted hover:text-ink-high dark:hover:text-ink-high transition-all px-2 py-1">{t('vs_shared.nav_sign_in')}</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">

        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber text-amber text-xs font-bold px-4 py-2 rounded-full mb-6">
            🏢 Oktopost is enterprise-only — $500+/month, no free plan
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-ink-high">
            SocialMate vs Oktopost (2026)
          </h1>
          <p className="text-ink-muted max-w-2xl mx-auto text-sm leading-relaxed">
            Oktopost is an enterprise B2B social platform built around employee advocacy and LinkedIn.
            If you&#39;re a creator, small business, or lean agency, this comparison will quickly show
            why Oktopost probably isn&#39;t the right fit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="border-2 border-amber bg-amber/10 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-amber uppercase tracking-widest mb-2">Oktopost</p>
            <p className="text-3xl font-extrabold text-amber mb-1">$500+/month</p>
            <p className="text-xs text-amber">Enterprise only · No free plan · Quote-based</p>
          </div>
          <div className="border-2 border-jade/40 bg-jade/10 rounded-2xl p-6 text-center">
            <p className="text-xs font-bold text-jade uppercase tracking-widest mb-2">SocialMate</p>
            <p className="text-3xl font-extrabold text-jade mb-1">$0/month</p>
            <p className="text-xs text-jade">7 platforms · 15+ AI tools · Free forever</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-6 text-ink-high">{t('vs_shared.feature_comparison')}</h2>
          <div className="overflow-x-auto"><div className="bg-panel border border-edge border-edge rounded-2xl overflow-hidden min-w-[480px]">
            <div className="grid grid-cols-3 bg-raised bg-raised border-b border-edge border-edge px-5 py-3">
              <span className="text-xs font-bold text-ink-body uppercase tracking-wide">{t('vs_shared.table_feature')}</span>
              <span className="text-xs font-bold text-ink-body uppercase tracking-wide text-center">Oktopost</span>
              <span className="text-xs font-bold text-ink-high uppercase tracking-wide text-center">{t('vs_shared.table_socialmate')}</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 px-5 py-3 items-center border-b border-edge border-edge last:border-0 ${i % 2 === 0 ? 'bg-panel' : 'bg-raised bg-raised'}`}>
                <span className="text-xs font-semibold text-ink-body">{row.feature}</span>
                <span className="text-xs text-ink-muted text-center">{row.oktopost}</span>
                <span className="text-xs font-bold text-ink-high text-center">{row.socialmate}</span>
              </div>
            ))}
          </div>
          </div>
        </div>

        <div className="mb-12 bg-raised rounded-2xl p-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 text-ink-high">The honest take</h2>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            Oktopost and SocialMate are not really competing for the same customers. Oktopost is a specialized enterprise tool for large B2B organizations running structured employee advocacy programs on LinkedIn. It solves a real problem — getting employees to amplify brand content — and it does it well.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            SocialMate targets creators, small businesses, and lean agencies who need to publish great content across multiple platforms without spending a fortune.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed">
            If you searched &#34;Oktopost alternative&#34; because $500/month felt steep, SocialMate is the answer. Start free and scale to $20/month for an Agency account.
          </p>
        </div>

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

        <div className="bg-void text-ink-high rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight mb-3 text-ink-high">Start for free today</h2>
          <p className="text-ink-body text-sm mb-6 max-w-lg mx-auto">
            7 platforms, 15+ AI tools, 100 posts/month, link in bio, competitor tracking — all free. No card required.
          </p>
          <Link href="/signup"
            className="inline-block bg-panel text-ink-high font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
            {t('vs_shared.cta_create_free')}
          </Link>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
