'use client'

import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is TikTok scheduling really free on SocialMate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. TikTok scheduling is free on every SocialMate plan including the free tier. Unlike X/Twitter which charges $0.01 per tweet (because the API is paid), TikTok's Content Posting API has no per-post cost. We pass that saving directly to you — zero extra charge.",
      },
    },
    {
      '@type': 'Question',
      name: 'What is the TikTok video limit per month?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Free plan: 20 TikTok videos per month. Pro ($5/month): 60 videos per month. Agency ($20/month): 200 videos per month. These are generous limits based on realistic posting schedules. The cost to us is only Supabase storage egress (~$0.09/GB), not a per-post API charge.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need a TikTok Pro or Business account to use SocialMate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "No Pro or Business account required. SocialMate uses TikTok's Content Posting API which works with standard personal TikTok accounts. Just connect your account at /accounts and you're ready to schedule.",
      },
    },
    {
      '@type': 'Question',
      name: 'How does SocialMate post to TikTok?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "SocialMate uses TikTok's official Production-approved Content Posting API (FILE_UPLOAD method). When you schedule a video, SocialMate uploads it to secure storage and at your scheduled time, calls the TikTok API to publish directly to your profile. No manual posting, no third-party workarounds.",
      },
    },
  ],
}

const LIVE_PLATFORMS = [
  { name: 'TikTok',     icon: '🎵', note: 'Live', highlight: true },
  { name: 'Bluesky',   icon: '🦋', note: 'Live', highlight: false },
  { name: 'X / Twitter', icon: '🐦', note: 'Live', highlight: false },
  { name: 'Mastodon',  icon: '🐘', note: 'Live', highlight: false },
  { name: 'Discord',   icon: '💬', note: 'Live', highlight: false },
  { name: 'Telegram',  icon: '✈️', note: 'Live', highlight: false },
  { name: 'LinkedIn',  icon: '💼', note: 'Live', highlight: false },
]

const COMING_PLATFORMS = [
  { name: 'YouTube',    icon: '▶️' },
  { name: 'Instagram',  icon: '📸' },
  { name: 'Facebook',   icon: '📘' },
  { name: 'Threads',    icon: '🧵' },
]

const PAIN_POINTS = [
  {
    before: 'Set an alarm at 7 PM. Open TikTok. Hope you don\'t forget. Post manually every single day.',
    after:  'Schedule weeks of TikTok videos in one session. They go live automatically.',
    icon:   '⏰',
  },
  {
    before: 'Manage TikTok in one app, Bluesky in another, Discord in a third. Five tabs, all chaos.',
    after:  'One dashboard. All 7 platforms. Schedule once, post everywhere.',
    icon:   '📱',
  },
  {
    before: 'Pay $18+/month to a tool that charges extra or locks TikTok behind a paid plan.',
    after:  'TikTok scheduling is free on SocialMate. No per-post charges. No upgrade required.',
    icon:   '💸',
  },
]

const FEATURES = [
  {
    title: 'TikTok Direct Scheduling',
    desc:  'Schedule TikTok videos using the official Production-approved Content Posting API. Pick your video, write a caption, set a time — SocialMate posts it automatically.',
    icon:  '🎵',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'TikTok Studio',
    desc:  'Browse and manage your TikTok content in one place. Connect your account at /accounts and access TikTok Studio at /tiktok/studio for a full content management experience.',
    icon:  '🎬',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'TikTok Script Generator',
    desc:  'AI-powered TikTok script generator that writes hooks, body, and CTA optimized for TikTok format. Uses 5 AI credits per script. Available to all plans.',
    icon:  '🤖',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'Cross-Platform Posting',
    desc:  'Schedule the same video or content to all 7 platforms at once. One compose session reaches TikTok, Bluesky, X, Mastodon, Discord, Telegram, and LinkedIn simultaneously.',
    icon:  '🚀',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'AI Caption Writer',
    desc:  'Write TikTok captions with hashtags, hooks, and emojis in one click. The AI knows TikTok character limits and what captions actually perform.',
    icon:  '✍️',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'Scheduling Calendar',
    desc:  'Full drag-and-drop calendar view of every scheduled TikTok post. See gaps, move posts around, and bulk-schedule an entire week of content in one session.',
    icon:  '📅',
    live:  true,
    badge: 'Live now',
  },
]

const PRICING = [
  {
    plan:     'Free',
    price:    '$0',
    note:     'forever',
    tiktok:   '20 TikTok videos/month',
    credits:  '50 AI credits/month',
    cta:      'Connect TikTok Free',
    href:     '/signup',
    highlight: false,
  },
  {
    plan:     'Pro',
    price:    '$5',
    note:     '/month',
    tiktok:   '60 TikTok videos/month',
    credits:  '500 AI credits/month',
    cta:      'Go Pro',
    href:     '/signup',
    highlight: true,
  },
  {
    plan:     'Agency',
    price:    '$20',
    note:     '/month',
    tiktok:   '200 TikTok videos/month',
    credits:  '2,000 AI credits/month',
    cta:      'Go Agency',
    href:     '/signup',
    highlight: false,
  },
]

export default function TikTokCreatorsPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ─── HERO ─── */}
      <section className="bg-[#0a0a0a] text-ink-high py-24 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-jade/10 border border-jade/40 rounded-full px-4 py-1.5 text-xs font-bold text-jade mb-6">
          {t('for_tiktok.api_badge')}
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          {t('for_tiktok.hero_title_1')}{' '}
          <span className="text-[#f59e0b]">{t('for_tiktok.hero_title_2')}</span>
        </h1>
        <p className="text-ink-body max-w-xl mx-auto text-base leading-relaxed mb-8">
          {t('for_tiktok.hero_desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/signup"
            className="bg-[#f59e0b] hover:opacity-90 text-ink-high font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center"
          >
            {t('for_tiktok.hero_cta_primary')}
          </Link>
          <Link
            href="/pricing"
            className="border border-edge hover:border-edge text-ink-body hover:text-ink-high font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center"
          >
            {t('for_tiktok.hero_cta_secondary')}
          </Link>
        </div>
        <p className="text-ink-muted text-xs mt-4">
          {t('for_tiktok.hero_note')}
        </p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_tiktok.pain_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            {t('for_tiktok.pain_title')}
          </h2>
          <div className="space-y-6">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="bg-panel border border-edge rounded-2xl p-5">
                  <p className="text-xs text-alert font-bold uppercase tracking-wide mb-2">{t('for_tiktok.pain_before_label')}</p>
                  <p className="text-sm text-ink-body leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-2xl p-5">
                  <p className="text-xs text-[#f59e0b] font-bold uppercase tracking-wide mb-2">{t('for_tiktok.pain_after_label')}</p>
                  <p className="text-sm text-ink-high leading-relaxed">{p.icon} {p.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-[#0a0a0a] text-ink-high py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-3">{t('for_tiktok.features_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            {t('for_tiktok.features_title')}
          </h2>
          <p className="text-center text-ink-body text-sm mb-12 max-w-xl mx-auto">
            {t('for_tiktok.features_desc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 border bg-panel border-edge"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-jade/10 text-jade">
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

      {/* ─── WHY FREE ─── */}
      <section className="bg-gradient-to-b from-[#f59e0b]/10 to-gray-950 text-ink-high py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-3">{t('for_tiktok.why_free_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-6">
            {t('for_tiktok.why_free_title')}
          </h2>
          <p className="text-ink-body text-sm leading-relaxed mb-8 max-w-2xl mx-auto">
            {t('for_tiktok.why_free_desc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { platform: 'TikTok', cost: '$0 per post', note: 'Free on all plans', color: 'text-jade' },
              { platform: 'Bluesky / Mastodon / Discord / Telegram', cost: '$0 per post', note: 'Open APIs — always free', color: 'text-jade' },
              { platform: 'X / Twitter', cost: '$0.01 per tweet', note: 'Pro+ required (API cost passed through)', color: 'text-amber' },
            ].map((r, i) => (
              <div key={i} className="bg-void border border-edge rounded-2xl p-5">
                <p className="text-xs font-extrabold text-ink-body mb-1">{r.platform}</p>
                <p className={`text-lg font-black mb-1 ${r.color}`}>{r.cost}</p>
                <p className="text-xs text-ink-muted">{r.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORMS ─── */}
      <section className="bg-[#0a0a0a] text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_tiktok.platforms_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_tiktok.platforms_title')}</h2>
          <p className="text-ink-body text-sm mb-8">{t('for_tiktok.platforms_desc')}</p>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {LIVE_PLATFORMS.map((p) => (
              <div
                key={p.name}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 border ${
                  p.highlight
                    ? 'bg-[#f59e0b]/10 border-[#f59e0b]/40'
                    : 'bg-panel border-edge'
                }`}
              >
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold">{p.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  p.highlight ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-jade/10 text-jade'
                }`}>
                  {t('for_tiktok.platforms_live_badge')}
                </span>
              </div>
            ))}
          </div>

          <h3 className="text-base font-extrabold text-ink-body mb-4">{t('for_tiktok.platforms_coming_title')}</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {COMING_PLATFORMS.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-2 bg-panel border border-edge rounded-xl px-4 py-2.5 opacity-60"
              >
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold text-ink-body">{p.name}</span>
                <span className="text-xs bg-raised text-ink-muted px-2 py-0.5 rounded-full font-bold">{t('for_tiktok.platforms_coming_badge')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_tiktok.pricing_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            {t('for_tiktok.pricing_title')}
          </h2>
          <p className="text-ink-body text-sm mb-12">
            {t('for_tiktok.pricing_desc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PRICING.map((tier) => (
              <div
                key={tier.plan}
                className={`rounded-2xl p-6 border ${
                  tier.highlight
                    ? 'bg-[#f59e0b]/10 border-[#f59e0b]/50 ring-1 ring-[#f59e0b]/30'
                    : 'bg-panel border-edge'
                }`}
              >
                {tier.highlight && (
                  <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-3">{t('for_tiktok.pricing_most_popular')}</p>
                )}
                <p className="text-sm font-extrabold mb-1">{tier.plan}</p>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-black">{tier.price}</span>
                  <span className="text-ink-body text-sm mb-1">{tier.note}</span>
                </div>
                <ul className="text-xs text-ink-body space-y-2 mb-6 text-left">
                  <li>✓ {tier.tiktok}</li>
                  <li>✓ {tier.credits}</li>
                  <li>✓ {t('for_tiktok.pricing_feature_platforms')}</li>
                  <li>✓ {t('for_tiktok.pricing_feature_ai')}</li>
                  <li>✓ {t('for_tiktok.pricing_feature_script')}</li>
                  <li>✓ {t('for_tiktok.pricing_feature_calendar')}</li>
                </ul>
                <Link
                  href={tier.href}
                  className={`block text-center text-sm font-bold py-3 rounded-xl transition-all ${
                    tier.highlight
                      ? 'bg-[#f59e0b] hover:opacity-90 text-ink-high'
                      : 'bg-panel text-ink-high hover:opacity-80'
                  }`}
                >
                  {tier.cta} →
                </Link>
              </div>
            ))}
          </div>
          <p className="text-ink-muted text-xs">{t('for_tiktok.pricing_note')}</p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-[#0a0a0a] text-ink-high py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_tiktok.faq_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">{t('for_tiktok.faq_title')}</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Is TikTok scheduling really free on SocialMate?',
                a: "Yes. TikTok scheduling is free on every SocialMate plan including the free tier. Unlike X/Twitter which charges $0.01 per tweet (because the API is paid), TikTok's Content Posting API has no per-post cost. We pass that saving directly to you — zero extra charge.",
              },
              {
                q: 'What is the TikTok video limit per month?',
                a: 'Free plan: 20 TikTok videos per month. Pro ($5/month): 60 videos per month. Agency ($20/month): 200 videos per month. These are generous limits based on realistic posting schedules. The cost to us is only Supabase storage egress (~$0.09/GB), not a per-post API charge.',
              },
              {
                q: 'Do I need a TikTok Pro or Business account?',
                a: "No Pro or Business account required. SocialMate uses TikTok's Content Posting API which works with standard personal TikTok accounts. Just connect your account at /accounts and you're ready to schedule.",
              },
              {
                q: 'How does SocialMate post to TikTok?',
                a: "SocialMate uses TikTok's official Production-approved Content Posting API (FILE_UPLOAD method). When you schedule a video, SocialMate uploads it to secure storage and at your scheduled time, calls the TikTok API to publish directly to your profile. No manual posting, no third-party workarounds.",
              },
            ].map((item, i) => (
              <div key={i} className="border-b border-edge pb-6 last:border-0">
                <h3 className="text-sm font-extrabold mb-2">{item.q}</h3>
                <p className="text-sm text-ink-body leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="bg-gradient-to-br from-[#f59e0b]/20 via-gray-950 to-[#0a0a0a] text-ink-high py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          {t('for_tiktok.bottom_title')}
        </h2>
        <p className="text-ink-body text-sm mb-8 max-w-md mx-auto">
          {t('for_tiktok.bottom_desc')}
        </p>
        <Link
          href="/signup"
          className="inline-block bg-[#f59e0b] hover:opacity-90 text-ink-high font-bold px-10 py-4 rounded-xl text-sm transition-all"
        >
          {t('for_tiktok.bottom_cta')}
        </Link>
        <p className="text-ink-muted text-xs mt-4">{t('for_tiktok.bottom_note')}</p>
      </section>
    </PublicLayout>
  )
}
