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
      <section className="bg-black text-white py-24 px-6 text-center">
        <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">{t('for_fitness.eyebrow')}</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          {t('for_fitness.hero_title_1')}<br />
          <span className="text-green-400">{t('for_fitness.hero_title_2')}</span>
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto text-base leading-relaxed mb-8">
          {t('for_fitness.hero_desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/signup"
            className="bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_fitness.hero_cta_primary')}
          </Link>
          <Link href="/pricing"
            className="border border-gray-700 hover:border-gray-400 text-gray-300 hover:text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_fitness.hero_cta_secondary')}
          </Link>
        </div>
        <p className="text-gray-500 text-xs mt-4">{t('for_fitness.hero_note')}</p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('for_fitness.pain_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            {t('for_fitness.pain_title')}
          </h2>
          <div className="space-y-5">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-xs text-red-400 font-bold uppercase tracking-wide mb-2">{t('for_fitness.pain_before_label')}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-green-950/40 border border-green-800/50 rounded-2xl p-5">
                  <p className="text-xs text-green-300 font-bold uppercase tracking-wide mb-2">{t('for_fitness.pain_after_label')}</p>
                  <p className="text-sm text-white leading-relaxed">{p.icon} {p.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-green-400 uppercase tracking-widest mb-3">{t('for_fitness.features_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            {t('for_fitness.features_title')}
          </h2>
          <p className="text-center text-gray-400 text-sm mb-12 max-w-xl mx-auto">
            {t('for_fitness.features_desc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-gray-950 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    f.badge === 'Free'
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-yellow-900/50 text-yellow-300'
                  }`}>
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold mb-2">{f.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORMS ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('for_fitness.platforms_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_fitness.platforms_title')}</h2>
          <p className="text-gray-400 text-sm mb-8">{t('for_fitness.platforms_desc')}</p>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {LIVE_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold">{p.name}</span>
                <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full font-bold">{t('for_fitness.platforms_live_badge')}</span>
              </div>
            ))}
          </div>
          <h3 className="text-base font-extrabold text-gray-400 mb-4">{t('for_fitness.platforms_coming_title')}</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {COMING_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 opacity-60">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold text-gray-400">{p.name}</span>
                <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full font-bold">{t('for_fitness.platforms_coming_badge')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('for_fitness.pricing_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_fitness.pricing_title')}</h2>
          <p className="text-gray-400 text-sm mb-12">{t('for_fitness.pricing_desc')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PRICING.map((tier) => (
              <div key={tier.plan}
                className={`rounded-2xl p-6 border text-left ${tier.highlight
                  ? 'bg-green-950/40 border-green-700 ring-1 ring-green-500'
                  : 'bg-gray-900 border-gray-800'
                }`}>
                {tier.highlight && (
                  <p className="text-xs font-bold text-green-300 uppercase tracking-widest mb-3">{t('for_fitness.pricing_most_popular')}</p>
                )}
                <p className="text-sm font-extrabold mb-1">{tier.plan}</p>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-black">{tier.price}</span>
                  <span className="text-gray-400 text-sm mb-1">{tier.period}</span>
                </div>
                <ul className="text-xs text-gray-400 space-y-2 mb-6">
                  {tier.perks.map((perk) => (
                    <li key={perk}>✓ {perk}</li>
                  ))}
                </ul>
                <Link href={tier.href}
                  className={`block text-center text-sm font-bold py-3 rounded-xl transition-all ${tier.highlight
                    ? 'bg-green-500 hover:bg-green-400 text-white'
                    : 'bg-white text-black hover:opacity-80'
                  }`}>
                  {tier.cta} →
                </Link>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs">{t('for_fitness.pricing_note')}</p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('for_fitness.faq_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">{t('for_fitness.faq_title')}</h2>
          <div className="space-y-6">
            {FAQ.map((item, i) => (
              <div key={i} className="border-b border-gray-800 pb-6 last:border-0">
                <h3 className="text-sm font-extrabold mb-2">{item.q}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="bg-gradient-to-b from-green-950 to-black text-white py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          {t('for_fitness.bottom_title')}
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          {t('for_fitness.bottom_desc')}
        </p>
        <Link href="/signup"
          className="inline-block bg-green-500 hover:bg-green-400 text-white font-bold px-10 py-4 rounded-xl text-sm transition-all">
          {t('for_fitness.bottom_cta')}
        </Link>
        <p className="text-gray-600 text-xs mt-4">{t('for_fitness.bottom_note')}</p>
      </section>

    </PublicLayout>
  )
}
