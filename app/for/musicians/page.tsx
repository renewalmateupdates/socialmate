'use client'

import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

const LIVE_PLATFORMS = [
  { name: 'Bluesky',    icon: '🦋', note: 'Live' },
  { name: 'Mastodon',   icon: '🐘', note: 'Live' },
  { name: 'TikTok',     icon: '🎵', note: 'Live' },
  { name: 'Discord',    icon: '💬', note: 'Live' },
  { name: 'Telegram',   icon: '✈️', note: 'Live' },
  { name: 'X / Twitter', icon: '🐦', note: 'Live' },
  { name: 'LinkedIn',   icon: '💼', note: 'Live' },
]

const COMING_PLATFORMS = [
  { name: 'Instagram', icon: '📸' },
  { name: 'YouTube',   icon: '▶️' },
  { name: 'Threads',   icon: '🧵' },
  { name: 'Facebook',  icon: '📘' },
]

const PAIN_POINTS = [
  {
    before: 'New single drops Friday. Spend all week manually posting teasers to 5 different apps instead of making music.',
    after:  'Schedule your entire release campaign in one sitting. SocialMate posts across every platform on your timeline.',
    icon: '🎶',
  },
  {
    before: 'Post one week, disappear for three. Fans unfollow. Algorithm tanks. Start over.',
    after:  'Batch a month of content in one session. Stay consistent on every platform without burning out.',
    icon: '📅',
  },
  {
    before: 'Bluesky fans are different from TikTok fans. Writing separate captions for each platform takes forever.',
    after:  'AI adapts your content for each platform\'s style. One idea, multiple formats, done in seconds.',
    icon: '🤖',
  },
]

const FEATURES = [
  {
    title: 'Schedule Release Campaigns',
    desc:  'Plan your entire single or album release — teasers, drop day posts, follow-up pushes — scheduled across every platform in advance. Your release runs on autopilot.',
    icon:  '🚀',
    badge: 'Free',
  },
  {
    title: 'Bluesky & Mastodon for Indie Audiences',
    desc:  'Independent music fans live on Bluesky and Mastodon. SocialMate is one of the few schedulers that supports both open social platforms where indie artists are actually growing.',
    icon:  '🦋',
    badge: 'Free',
  },
  {
    title: 'TikTok Scheduling',
    desc:  'Schedule your behind-the-scenes clips, snippets, and music videos directly to TikTok. TikTok music discovery is real — consistent posting is how artists blow up.',
    icon:  '🎵',
    badge: 'Free',
  },
  {
    title: 'Discord Fan Community Posting',
    desc:  'Post track announcements, exclusive updates, and listening party invites directly to your Discord server. Keep your core fanbase engaged without manually switching apps.',
    icon:  '💬',
    badge: 'Free',
  },
  {
    title: 'SOMA AI Generates Your Captions',
    desc:  "Tell SOMA your sound, your story, and your audience — it generates platform-specific captions for TikTok hooks, Bluesky threads, and announcement posts that actually sound like you.",
    icon:  '🤖',
    badge: 'Free',
  },
  {
    title: 'Evergreen Content Recycling',
    desc:  'Your music catalog never stops growing. Set older tracks and evergreen content to auto-recycle so new fans always find your best work — not just your latest release.',
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
    q: 'Does SocialMate support Bluesky and Mastodon?',
    a: 'Yes, both are fully live. Bluesky and Mastodon are where independent music communities are actually growing right now — SocialMate is one of very few schedulers that supports them both.',
  },
  {
    q: 'Can I schedule TikTok posts for music releases?',
    a: "Yes. TikTok scheduling is live for all plans including free. Schedule your snippets, behind-the-scenes content, and release day videos in advance — no manual posting required.",
  },
  {
    q: 'Will the AI captions work for music content specifically?',
    a: "SOMA AI learns your sound, genre, and tone via the Voice DNA Builder. It generates captions built for music content — not generic social media copy. Hooks, countdowns, and fan engagement posts that actually fit your brand.",
  },
  {
    q: 'I manage multiple artists — is there a plan for that?',
    a: 'The Agency plan ($20/mo) gives you 5 client workspaces, 15 seats, and client approval workflows. Manage each artist in a separate workspace with their own scheduling calendar.',
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

export default function MusiciansPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ─── HERO ─── */}
      <section className="bg-black text-white py-24 px-6 text-center">
        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">{t('for_musicians.eyebrow')}</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          {t('for_musicians.hero_title_1')}<br />
          <span className="text-purple-400">{t('for_musicians.hero_title_2')}</span>
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto text-base leading-relaxed mb-8">
          {t('for_musicians.hero_desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/signup"
            className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_musicians.hero_cta_primary')}
          </Link>
          <Link href="/pricing"
            className="border border-gray-700 hover:border-gray-400 text-gray-300 hover:text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_musicians.hero_cta_secondary')}
          </Link>
        </div>
        <p className="text-gray-500 text-xs mt-4">{t('for_musicians.hero_note')}</p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('for_musicians.pain_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            {t('for_musicians.pain_title')}
          </h2>
          <div className="space-y-5">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-xs text-red-400 font-bold uppercase tracking-wide mb-2">{t('for_musicians.pain_before_label')}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-purple-950/40 border border-purple-800/50 rounded-2xl p-5">
                  <p className="text-xs text-purple-300 font-bold uppercase tracking-wide mb-2">{t('for_musicians.pain_after_label')}</p>
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
          <p className="text-center text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">{t('for_musicians.features_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            {t('for_musicians.features_title')}
          </h2>
          <p className="text-center text-gray-400 text-sm mb-12 max-w-xl mx-auto">
            {t('for_musicians.features_desc')}
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
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('for_musicians.platforms_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_musicians.platforms_title')}</h2>
          <p className="text-gray-400 text-sm mb-8">{t('for_musicians.platforms_desc')}</p>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {LIVE_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold">{p.name}</span>
                <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full font-bold">{t('for_musicians.platforms_live_badge')}</span>
              </div>
            ))}
          </div>
          <h3 className="text-base font-extrabold text-gray-400 mb-4">{t('for_musicians.platforms_coming_title')}</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {COMING_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 opacity-60">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold text-gray-400">{p.name}</span>
                <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full font-bold">{t('for_musicians.platforms_coming_badge')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('for_musicians.pricing_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_musicians.pricing_title')}</h2>
          <p className="text-gray-400 text-sm mb-12">{t('for_musicians.pricing_desc')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PRICING.map((tier) => (
              <div key={tier.plan}
                className={`rounded-2xl p-6 border text-left ${tier.highlight
                  ? 'bg-purple-950/40 border-purple-700 ring-1 ring-purple-500'
                  : 'bg-gray-900 border-gray-800'
                }`}>
                {tier.highlight && (
                  <p className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-3">{t('for_musicians.pricing_most_popular')}</p>
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
                    ? 'bg-purple-500 hover:bg-purple-400 text-white'
                    : 'bg-white text-black hover:opacity-80'
                  }`}>
                  {tier.cta} →
                </Link>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs">{t('for_musicians.pricing_note')}</p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('for_musicians.faq_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">{t('for_musicians.faq_title')}</h2>
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
      <section className="bg-gradient-to-b from-purple-950 to-black text-white py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          {t('for_musicians.bottom_title')}
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          {t('for_musicians.bottom_desc')}
        </p>
        <Link href="/signup"
          className="inline-block bg-purple-500 hover:bg-purple-400 text-white font-bold px-10 py-4 rounded-xl text-sm transition-all">
          {t('for_musicians.bottom_cta')}
        </Link>
        <p className="text-gray-600 text-xs mt-4">{t('for_musicians.bottom_note')}</p>
      </section>

    </PublicLayout>
  )
}
