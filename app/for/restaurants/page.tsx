'use client'

import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

const LIVE_PLATFORMS = [
  { name: 'TikTok',     icon: '🎵', note: 'Live' },
  { name: 'Discord',    icon: '💬', note: 'Live' },
  { name: 'Telegram',   icon: '✈️', note: 'Live' },
  { name: 'Bluesky',   icon: '🦋', note: 'Live' },
  { name: 'X / Twitter', icon: '🐦', note: 'Live' },
  { name: 'Mastodon',   icon: '🐘', note: 'Live' },
  { name: 'LinkedIn',   icon: '💼', note: 'Live' },
]

const COMING_PLATFORMS = [
  { name: 'Instagram', icon: '📸' },
  { name: 'Facebook',  icon: '📘' },
  { name: 'Pinterest', icon: '📌' },
]

const PAIN_POINTS = [
  {
    before: 'Saturday lunch rush. 40 covers on the floor. Still haven\'t posted the weekend special.',
    after:  'Weekend specials are scheduled Monday morning. They go live automatically while you work the line.',
    icon: '🍽️',
  },
  {
    before: 'Post daily for 2 weeks, then go silent for a month. Lost followers, dead engagement.',
    after:  'Batch a month of menu posts and content in one afternoon. Consistent every day, automatically.',
    icon: '📅',
  },
  {
    before: 'TikTok is where customers find new restaurants. You know you need to be there. You don\'t have time.',
    after:  'Schedule your kitchen clips, plating videos, and specials directly to TikTok from one dashboard.',
    icon: '🎵',
  },
]

const FEATURES = [
  {
    title: 'Schedule Daily Menu & Special Posts',
    desc:  'Write this week\'s specials once. Schedule them to go live at peak times — before the lunch rush, Friday night dinner hour. Content on autopilot while you run the kitchen.',
    icon:  '🍕',
    badge: 'Free',
  },
  {
    title: 'AI Generates Food Captions',
    desc:  'Describe the dish, pick your tone — casual, upscale, playful — and the AI writes a caption with hashtags ready to post. No more staring at a blank caption box at 11pm.',
    icon:  '🤖',
    badge: 'Free',
  },
  {
    title: 'TikTok Scheduling',
    desc:  'TikTok is the #1 discovery platform for restaurants right now. Schedule your kitchen videos, plating clips, and specials to post at the right time without picking up your phone.',
    icon:  '🎵',
    badge: 'Free',
  },
  {
    title: 'Cross-Post to 7 Platforms at Once',
    desc:  'Write one post. Hit schedule. It goes to TikTok, Discord, Telegram, Bluesky, X, Mastodon, and LinkedIn simultaneously. No copy-paste, no switching apps.',
    icon:  '📡',
    badge: 'Free',
  },
  {
    title: 'Link in Bio for Your Menu',
    desc:  'Free link-in-bio page on all plans. Link your menu, reservation page, delivery app, and weekly specials PDF in one place. No Linktree subscription needed.',
    icon:  '🔗',
    badge: 'Free',
  },
  {
    title: 'SOMA AI Plans Your Content Calendar',
    desc:  'Tell SOMA your restaurant concept and audience — SOMA generates a week of content ideas: specials announcements, behind-the-scenes content, customer appreciation posts.',
    icon:  '📅',
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
    q: 'Can I really schedule TikTok posts for my restaurant?',
    a: "Yes. TikTok scheduling is fully live for all SocialMate users including free. Your kitchen videos, dish reveals, and specials can be scheduled in advance — TikTok posts them automatically at the time you choose.",
  },
  {
    q: 'Is the free plan actually useful for a small restaurant?',
    a: "Absolutely. 50 AI credits, 7 live platforms, post calendar, link in bio, and no credit card required. Most single-location restaurants can run their whole social presence on the free plan.",
  },
  {
    q: 'Can my manager or front-of-house staff post too?',
    a: "Free plan includes 2 seats, Pro includes 5. Add your manager or a designated social media person — they can create and schedule posts without access to your admin account.",
  },
  {
    q: 'I run multiple locations — do you have a plan for that?',
    a: "The Agency plan ($20/mo) gives you 5 client workspaces, 15 seats, and client approval workflows. Manage each location in its own workspace with separate content calendars.",
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

export default function RestaurantsPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ─── HERO ─── */}
      <section className="bg-black text-white py-24 px-6 text-center">
        <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4">{t('for_restaurants.eyebrow')}</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          {t('for_restaurants.hero_title_1')}<br />
          <span className="text-orange-400">{t('for_restaurants.hero_title_2')}</span>
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto text-base leading-relaxed mb-8">
          {t('for_restaurants.hero_desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/signup"
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_restaurants.hero_cta_primary')}
          </Link>
          <Link href="/pricing"
            className="border border-gray-700 hover:border-gray-400 text-gray-300 hover:text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_restaurants.hero_cta_secondary')}
          </Link>
        </div>
        <p className="text-gray-500 text-xs mt-4">{t('for_restaurants.hero_note')}</p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('for_restaurants.pain_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            {t('for_restaurants.pain_title')}
          </h2>
          <div className="space-y-5">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-xs text-red-400 font-bold uppercase tracking-wide mb-2">{t('for_restaurants.pain_before_label')}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-orange-950/40 border border-orange-800/50 rounded-2xl p-5">
                  <p className="text-xs text-orange-300 font-bold uppercase tracking-wide mb-2">{t('for_restaurants.pain_after_label')}</p>
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
          <p className="text-center text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">{t('for_restaurants.features_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            {t('for_restaurants.features_title')}
          </h2>
          <p className="text-center text-gray-400 text-sm mb-12 max-w-xl mx-auto">
            {t('for_restaurants.features_desc')}
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
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('for_restaurants.platforms_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_restaurants.platforms_title')}</h2>
          <p className="text-gray-400 text-sm mb-8">{t('for_restaurants.platforms_desc')}</p>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {LIVE_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold">{p.name}</span>
                <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full font-bold">{t('for_restaurants.platforms_live_badge')}</span>
              </div>
            ))}
          </div>
          <h3 className="text-base font-extrabold text-gray-400 mb-4">{t('for_restaurants.platforms_coming_title')}</h3>
          <p className="text-gray-500 text-xs mb-6 max-w-md mx-auto">
            Instagram and Facebook are on the active roadmap. See the full{' '}
            <Link href="/roadmap" className="text-orange-400 hover:text-orange-300 underline">roadmap</Link> for status.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {COMING_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 opacity-60">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold text-gray-400">{p.name}</span>
                <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full font-bold">{t('for_restaurants.platforms_coming_badge')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('for_restaurants.pricing_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_restaurants.pricing_title')}</h2>
          <p className="text-gray-400 text-sm mb-12">{t('for_restaurants.pricing_desc')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PRICING.map((tier) => (
              <div key={tier.plan}
                className={`rounded-2xl p-6 border text-left ${tier.highlight
                  ? 'bg-orange-950/40 border-orange-700 ring-1 ring-orange-500'
                  : 'bg-gray-900 border-gray-800'
                }`}>
                {tier.highlight && (
                  <p className="text-xs font-bold text-orange-300 uppercase tracking-widest mb-3">{t('for_restaurants.pricing_most_popular')}</p>
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
                    ? 'bg-orange-500 hover:bg-orange-400 text-white'
                    : 'bg-white text-black hover:opacity-80'
                  }`}>
                  {tier.cta} →
                </Link>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs">{t('for_restaurants.pricing_note')}</p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('for_restaurants.faq_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">{t('for_restaurants.faq_title')}</h2>
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
      <section className="bg-gradient-to-b from-orange-950 to-black text-white py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          {t('for_restaurants.bottom_title')}
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          {t('for_restaurants.bottom_desc')}
        </p>
        <Link href="/signup"
          className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-bold px-10 py-4 rounded-xl text-sm transition-all">
          {t('for_restaurants.bottom_cta')}
        </Link>
        <p className="text-gray-600 text-xs mt-4">{t('for_restaurants.bottom_note')}</p>
      </section>

    </PublicLayout>
  )
}
