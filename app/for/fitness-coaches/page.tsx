'use client'

import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

const LIVE_PLATFORMS = [
  { name: 'TikTok',      icon: '🎵', note: 'Live' },
  { name: 'Bluesky',    icon: '🦋', note: 'Live' },
  { name: 'X / Twitter', icon: '🐦', note: 'Live' },
  { name: 'Mastodon',   icon: '🐘', note: 'Live' },
  { name: 'Discord',    icon: '💬', note: 'Live' },
  { name: 'Telegram',   icon: '✈️', note: 'Live' },
  { name: 'LinkedIn',   icon: '💼', note: 'Live' },
]

const COMING_PLATFORMS = [
  { name: 'Instagram', icon: '📸' },
  { name: 'YouTube',   icon: '▶️' },
  { name: 'Facebook',  icon: '📘' },
  { name: 'Pinterest', icon: '📌' },
]

const PAIN_POINTS = [
  {
    before: 'Back-to-back clients from 6am to 7pm. Open phone to post. Blank. Brain dead.',
    after:  'Batch your whole week on Sunday. SocialMate posts while you train clients.',
    icon: '📅',
  },
  {
    before: 'Post the same transformation photo caption on TikTok, then retype it for X, then Bluesky.',
    after:  'Write once. Schedule to every platform at once. Same content, zero repetition.',
    icon: '🔄',
  },
  {
    before: '"What should I even post today?" Stare at the app for 15 minutes. Give up.',
    after:  'SOMA AI writes your captions, hooks, and content ideas based on your niche.',
    icon: '🤖',
  },
]

const FEATURES = [
  {
    title: 'Batch Schedule a Week in 30 Minutes',
    desc:  'Sunday session: write or generate 7 posts, set your times, hit schedule. The whole week is done. No more daily scramble between sessions.',
    icon:  '🗓️',
    badge: 'Free',
  },
  {
    title: 'SOMA AI Writes Your Content',
    desc:  'Tell SOMA your niche — fat loss coaching, powerlifting, yoga, whatever — and it generates a week of on-brand posts. Captions, hooks, CTAs, all of it.',
    icon:  '🤖',
    badge: 'Free',
  },
  {
    title: 'TikTok Scheduling',
    desc:  'Schedule your workout demos, client transformations, and tip videos directly to TikTok. TikTok is the #1 discovery platform for fitness — be there consistently.',
    icon:  '🎵',
    badge: 'Free',
  },
  {
    title: 'Discord Community for Client Check-ins',
    desc:  'Post your weekly check-in reminders, accountability updates, and motivational content directly to your Discord server — all scheduled from one place.',
    icon:  '💬',
    badge: 'Free',
  },
  {
    title: 'AI Caption & Hook Generator',
    desc:  'Never write "Transformation Tuesday" again. 15+ AI tools generate punchy hooks, engaging captions, and hashtag sets built for fitness audiences.',
    icon:  '✍️',
    badge: 'Free',
  },
  {
    title: 'Evergreen Recycling',
    desc:  'Your best tip posts and transformations never die. Set them to auto-recycle and keep your top content working for new followers every few weeks.',
    icon:  '♻️',
    badge: 'Pro',
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
      '7 live platforms',
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
    q: 'Can I schedule TikTok videos as a fitness coach?',
    a: 'Yes. TikTok scheduling is live for all SocialMate users including the free plan. Schedule your workout reels, transformation reveals, and tip videos directly from SocialMate — no manual posting required.',
  },
  {
    q: 'Will SOMA AI actually sound like me, not a robot?',
    a: "Yes. SOMA has a Voice DNA Builder — you answer questions about your niche, tone, and audience, and SOMA learns to write like you. It won't sound like generic fitness copy.",
  },
  {
    q: 'I only post 3 times a week. Is the free plan enough?',
    a: "Definitely. The free plan includes 50 AI credits/month and full access to the scheduling calendar and all 7 live platforms. Most solo trainers with 3 posts/week will stay on free forever.",
  },
  {
    q: 'Can I manage social media for my fitness studio and clients?',
    a: 'The Agency plan ($20/mo) gives you 5 client workspaces, 15 seats, and 2,000 AI credits. Perfect if you run a gym or manage socials for multiple coaches.',
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

export default function FitnessCoachesPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ─── HERO ─── */}
      <section className="text-ink-high py-24 px-6 text-center">
        <p className="text-xs font-bold text-jade uppercase tracking-widest mb-4">{t('for_fitness.eyebrow')}</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          {t('for_fitness.hero_title_1')}<br />
          <span className="text-jade">{t('for_fitness.hero_title_2')}</span>
        </h1>
        <p className="text-ink-body max-w-xl mx-auto text-base leading-relaxed mb-8">
          {t('for_fitness.hero_desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/signup"
            className="bg-jade/10 hover:bg-jade/10 text-ink-high font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_fitness.hero_cta_primary')}
          </Link>
          <Link href="/pricing"
            className="border border-edge hover:border-edge text-ink-body hover:text-ink-high font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_fitness.hero_cta_secondary')}
          </Link>
        </div>
        <p className="text-ink-muted text-xs mt-4">{t('for_fitness.hero_note')}</p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_fitness.pain_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            {t('for_fitness.pain_title')}
          </h2>
          <div className="space-y-5">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                <div className="bg-panel border border-edge rounded-2xl p-5">
                  <p className="text-xs text-alert font-bold uppercase tracking-wide mb-2">{t('for_fitness.pain_before_label')}</p>
                  <p className="text-sm text-ink-body leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-jade/10 border border-jade/40 rounded-2xl p-5">
                  <p className="text-xs text-jade font-bold uppercase tracking-wide mb-2">{t('for_fitness.pain_after_label')}</p>
                  <p className="text-sm text-ink-high leading-relaxed">{p.icon} {p.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="text-ink-high py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-jade uppercase tracking-widest mb-3">{t('for_fitness.features_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            {t('for_fitness.features_title')}
          </h2>
          <p className="text-center text-ink-body text-sm mb-12 max-w-xl mx-auto">
            {t('for_fitness.features_desc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-panel border border-edge rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    f.badge === 'Free'
                      ? 'bg-jade/10 text-jade'
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
      <section className="text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_fitness.platforms_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_fitness.platforms_title')}</h2>
          <p className="text-ink-body text-sm mb-8">{t('for_fitness.platforms_desc')}</p>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {LIVE_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-panel border border-edge rounded-xl px-4 py-2.5">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold">{p.name}</span>
                <span className="text-xs bg-jade/10 text-jade px-2 py-0.5 rounded-full font-bold">{t('for_fitness.platforms_live_badge')}</span>
              </div>
            ))}
          </div>
          <h3 className="text-base font-extrabold text-ink-body mb-4">{t('for_fitness.platforms_coming_title')}</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {COMING_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-panel border border-edge rounded-xl px-4 py-2.5 opacity-60">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold text-ink-body">{p.name}</span>
                <span className="text-xs bg-raised text-ink-muted px-2 py-0.5 rounded-full font-bold">{t('for_fitness.platforms_coming_badge')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_fitness.pricing_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_fitness.pricing_title')}</h2>
          <p className="text-ink-body text-sm mb-12">{t('for_fitness.pricing_desc')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PRICING.map((tier) => (
              <div key={tier.plan}
                className={`rounded-2xl p-6 border text-left ${tier.highlight
                  ? 'bg-jade/10 border-jade/40 ring-1 ring-jade'
                  : 'bg-panel border-edge'
                }`}>
                {tier.highlight && (
                  <p className="text-xs font-bold text-jade uppercase tracking-widest mb-3">{t('for_fitness.pricing_most_popular')}</p>
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
                    ? 'bg-jade/10 hover:bg-jade/10 text-ink-high'
                    : 'bg-panel text-ink-high hover:opacity-80'
                  }`}>
                  {tier.cta} →
                </Link>
              </div>
            ))}
          </div>
          <p className="text-ink-muted text-xs">{t('for_fitness.pricing_note')}</p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="text-ink-high py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_fitness.faq_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">{t('for_fitness.faq_title')}</h2>
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
      <section className="bg-gradient-to-b from-green-950 to-black text-ink-high py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          {t('for_fitness.bottom_title')}
        </h2>
        <p className="text-ink-body text-sm mb-8 max-w-md mx-auto">
          {t('for_fitness.bottom_desc')}
        </p>
        <Link href="/signup"
          className="inline-block bg-jade/10 hover:bg-jade/10 text-ink-high font-bold px-10 py-4 rounded-xl text-sm transition-all">
          {t('for_fitness.bottom_cta')}
        </Link>
        <p className="text-ink-muted text-xs mt-4">{t('for_fitness.bottom_note')}</p>
      </section>

    </PublicLayout>
  )
}
