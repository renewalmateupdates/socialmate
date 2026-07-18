'use client'

import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

const LIVE_PLATFORMS = [
  { name: 'LinkedIn',   icon: '💼', note: 'Live' },
  { name: 'Bluesky',   icon: '🦋', note: 'Live' },
  { name: 'X / Twitter', icon: '🐦', note: 'Live' },
  { name: 'Mastodon',   icon: '🐘', note: 'Live' },
  { name: 'Discord',    icon: '💬', note: 'Live' },
  { name: 'Telegram',   icon: '✈️', note: 'Live' },
  { name: 'TikTok',     icon: '🎵', note: 'Live' },
]

const COMING_PLATFORMS = [
  { name: 'Instagram', icon: '📸' },
  { name: 'Facebook',  icon: '📘' },
  { name: 'Pinterest', icon: '📌' },
]

const PAIN_POINTS = [
  {
    before: 'Listing goes live. You post it once. It disappears from feeds in 20 minutes. Buyer never sees it.',
    after:  'Schedule a full campaign: announcement, open house reminder, price drop, sold post — all pre-planned.',
    icon: '🏡',
  },
  {
    before: 'LinkedIn is where serious buyers and referral partners live. You know you need to post more. You never do.',
    after:  'LinkedIn scheduling is live. Write once, schedule weeks in advance. Stay top-of-mind without daily effort.',
    icon: '💼',
  },
  {
    before: 'Writing "Just Listed!" for the 50th time. Same caption, same energy, same low engagement.',
    after:  'AI generates fresh listing captions, market insight posts, and client win stories based on your niche.',
    icon: '✍️',
  },
]

const FEATURES = [
  {
    title: 'LinkedIn Scheduling — Live Now',
    desc:  'LinkedIn is the highest-value platform for real estate professionals. Connect your LinkedIn personal profile and schedule posts weeks in advance. Consistent presence without daily effort.',
    icon:  '💼',
    badge: 'Free',
  },
  {
    title: 'Schedule Listing Campaigns in Advance',
    desc:  'For every listing, build a campaign: announcement post, open house reminder, price update, sold announcement. Schedule them all at once. They fire automatically on your timeline.',
    icon:  '🏡',
    badge: 'Free',
  },
  {
    title: 'SOMA AI Generates Real Estate Content',
    desc:  'Tell SOMA your market, niche (luxury, first-time buyers, investment), and tone — it writes listing captions, market update posts, and thought leadership content that sounds like you.',
    icon:  '🤖',
    badge: 'Free',
  },
  {
    title: 'Cross-Post to 7 Platforms at Once',
    desc:  'One listing. Seven platforms. Hit schedule and your post goes to LinkedIn, Bluesky, X, Mastodon, Discord, Telegram, and TikTok simultaneously. Zero copy-paste.',
    icon:  '📡',
    badge: 'Free',
  },
  {
    title: 'Team Seats for Your Transaction Coordinator',
    desc:  'Add your TC, marketing assistant, or partner. Free plan includes 2 seats. Pro includes 5. No extra charge per seat — everyone schedules from the same account.',
    icon:  '👥',
    badge: 'Free',
  },
  {
    title: 'Agency Plan for Teams & Brokerages',
    desc:  'Run social media for your entire team or brokerage. 5 client workspaces, 15 seats, client approval workflows — manage every agent\'s content from one Agency account.',
    icon:  '🏢',
    badge: 'Agency',
  },
]

const PRICING = [
  {
    plan:    'Free',
    price:   '$0',
    period:  'forever',
    highlight: false,
    cta:     'Start free — no card',
    href:    '/signup',
    perks: [
      '50 AI credits/month',
      '7 live platforms including LinkedIn',
      'Post calendar & drafts',
      'Link in Bio page',
      '2 team seats',
    ],
  },
  {
    plan:    'Pro',
    price:   '$5',
    period:  '/month',
    highlight: true,
    cta:     'Go Pro',
    href:    '/signup',
    perks: [
      '500 AI credits/month',
      'All 7 platforms',
      'SOMA AI content generator',
      'Evergreen recycling',
      '5 team seats',
    ],
  },
  {
    plan:    'Agency',
    price:   '$20',
    period:  '/month',
    highlight: false,
    cta:     'Go Agency',
    href:    '/signup',
    perks: [
      '2,000 AI credits/month',
      '15 seats',
      '5 client workspaces',
      'All platforms + features',
      'Client approval workflows',
    ],
  },
]

const FAQ = [
  {
    q: 'Is LinkedIn scheduling actually live?',
    a: "Yes, LinkedIn personal profile scheduling went live May 21, 2026. Connect your LinkedIn account at /accounts and you can schedule posts directly from SocialMate — no workarounds needed.",
  },
  {
    q: 'Can I schedule listing posts weeks in advance?',
    a: "Yes. Pro and Agency plans have unlimited scheduling windows. Free plan has a 2-week window. Build your listing campaigns upfront and they post automatically at the times you set.",
  },
  {
    q: 'Will SOMA AI write real estate content that doesn\'t sound generic?',
    a: "SOMA has a Voice DNA Builder where you describe your market, niche, and personality. It learns your style and generates listing captions, market updates, and thought leadership posts that sound like you — not a template.",
  },
  {
    q: 'I\'m a team leader — can I manage multiple agents\' social media?',
    a: "The Agency plan ($20/mo) gives you 5 client workspaces and 15 seats. Each agent gets their own workspace with a separate content calendar. You review and approve content before it goes live.",
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

export default function RealEstatePage() {
  const { t } = useI18n()
  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ─── HERO ─── */}
      <section className="bg-void text-ink-high py-24 px-6 text-center">
        <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-4">{t('for_real_estate.eyebrow')}</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          {t('for_real_estate.hero_title_1')}<br />
          <span className="text-ink-muted">{t('for_real_estate.hero_title_2')}</span>
        </h1>
        <p className="text-ink-body max-w-xl mx-auto text-base leading-relaxed mb-8">
          {t('for_real_estate.hero_desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/signup"
            className="bg-raised hover:bg-raised text-ink-high font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_real_estate.hero_cta_primary')}
          </Link>
          <Link href="/pricing"
            className="border border-edge hover:border-edge text-ink-body hover:text-ink-high font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_real_estate.hero_cta_secondary')}
          </Link>
        </div>
        <p className="text-ink-muted text-xs mt-4">{t('for_real_estate.hero_note')}</p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="bg-panel text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_real_estate.pain_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            {t('for_real_estate.pain_title')}
          </h2>
          <div className="space-y-5">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                <div className="bg-panel border border-edge rounded-2xl p-5">
                  <p className="text-xs text-alert font-bold uppercase tracking-wide mb-2">{t('for_real_estate.pain_before_label')}</p>
                  <p className="text-sm text-ink-body leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-raised border border-edge-lit rounded-2xl p-5">
                  <p className="text-xs text-ink-muted font-bold uppercase tracking-wide mb-2">{t('for_real_estate.pain_after_label')}</p>
                  <p className="text-sm text-ink-high leading-relaxed">{p.icon} {p.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-void text-ink-high py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_real_estate.features_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            {t('for_real_estate.features_title')}
          </h2>
          <p className="text-center text-ink-body text-sm mb-12 max-w-xl mx-auto">
            {t('for_real_estate.features_desc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-panel border border-edge rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    f.badge === 'Free'
                      ? 'bg-jade/10 text-jade'
                      : f.badge === 'Agency'
                      ? 'bg-raised text-ink-muted'
                      : 'bg-amber/10 text-amber'
                  }`}>
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold mb-2">{f.title}</h3>
                <p className="text-xs text-ink-body leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORMS ─── */}
      <section className="bg-panel text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_real_estate.platforms_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_real_estate.platforms_title')}</h2>
          <p className="text-ink-body text-sm mb-8">{t('for_real_estate.platforms_desc')}</p>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {LIVE_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-panel border border-edge rounded-xl px-4 py-2.5">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold">{p.name}</span>
                <span className="text-xs bg-jade/10 text-jade px-2 py-0.5 rounded-full font-bold">{t('for_real_estate.platforms_live_badge')}</span>
              </div>
            ))}
          </div>
          <h3 className="text-base font-extrabold text-ink-body mb-4">{t('for_real_estate.platforms_coming_title')}</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {COMING_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-panel border border-edge rounded-xl px-4 py-2.5 opacity-60">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold text-ink-body">{p.name}</span>
                <span className="text-xs bg-raised text-ink-muted px-2 py-0.5 rounded-full font-bold">{t('for_real_estate.platforms_coming_badge')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="bg-void text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_real_estate.pricing_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_real_estate.pricing_title')}</h2>
          <p className="text-ink-body text-sm mb-12">{t('for_real_estate.pricing_desc')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PRICING.map((tier) => (
              <div key={tier.plan}
                className={`rounded-2xl p-6 border text-left ${tier.highlight
                  ? 'bg-raised border-edge-lit ring-1 ring-edge-lit'
                  : 'bg-panel border-edge'
                }`}>
                {tier.highlight && (
                  <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_real_estate.pricing_most_popular')}</p>
                )}
                <p className="text-sm font-extrabold mb-1">{tier.plan}</p>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-black">{tier.price}</span>
                  <span className="text-ink-body text-sm mb-1">{tier.period}</span>
                </div>
                <ul className="text-xs text-ink-body space-y-2 mb-6">
                  {tier.perks.map((perk) => (
                    <li key={perk}>✓ {perk}</li>
                  ))}
                </ul>
                <Link href={tier.href}
                  className={`block text-center text-sm font-bold py-3 rounded-xl transition-all ${tier.highlight
                    ? 'bg-raised hover:bg-raised text-ink-high'
                    : 'bg-panel text-ink-high hover:opacity-80'
                  }`}>
                  {tier.cta} →
                </Link>
              </div>
            ))}
          </div>
          <p className="text-ink-muted text-xs">{t('for_real_estate.pricing_note')}</p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-panel text-ink-high py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_real_estate.faq_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">{t('for_real_estate.faq_title')}</h2>
          <div className="space-y-6">
            {FAQ.map((item, i) => (
              <div key={i} className="border-b border-edge pb-6 last:border-0">
                <h3 className="text-sm font-extrabold mb-2">{item.q}</h3>
                <p className="text-sm text-ink-body leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="bg-gradient-to-b from-cyan-950 to-black text-ink-high py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          {t('for_real_estate.bottom_title')}
        </h2>
        <p className="text-ink-body text-sm mb-8 max-w-md mx-auto">
          {t('for_real_estate.bottom_desc')}
        </p>
        <Link href="/signup"
          className="inline-block bg-raised hover:bg-raised text-ink-high font-bold px-10 py-4 rounded-xl text-sm transition-all">
          {t('for_real_estate.bottom_cta')}
        </Link>
        <p className="text-ink-muted text-xs mt-4">{t('for_real_estate.bottom_note')}</p>
      </section>

    </PublicLayout>
  )
}
