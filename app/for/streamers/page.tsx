'use client'

import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

const LIVE_PLATFORMS = [
  { name: 'Bluesky',   icon: '🦋', note: 'Live' },
  { name: 'X / Twitter', icon: '🐦', note: 'Live' },
  { name: 'Mastodon',  icon: '🐘', note: 'Live' },
  { name: 'Discord',   icon: '💬', note: 'Live' },
  { name: 'Telegram',  icon: '✈️', note: 'Live' },
  { name: 'TikTok',    icon: '🎵', note: 'Live' },
  { name: 'LinkedIn',  icon: '💼', note: 'Live' },
]

const COMING_PLATFORMS = [
  { name: 'Kick',      icon: '🟢' },
  { name: 'YouTube',   icon: '▶️' },
  { name: 'Instagram', icon: '📸' },
  { name: 'Threads',   icon: '🧵' },
  { name: 'Facebook',  icon: '📘' },
]

const PAIN_POINTS = [
  {
    before: 'Open Twitch Dashboard. Find the clip. Copy the link.',
    after:  'Browse all your Twitch clips inside SocialMate.',
    icon:   '🎬',
  },
  {
    before: 'Open Buffer / Hootsuite. Paste the link. Type a caption.',
    after:  'Pick a clip, write once, schedule everywhere.',
    icon:   '✍️',
  },
  {
    before: 'Repeat for every platform. 6 tabs open, 45 minutes gone.',
    after:  'Hit schedule. Done in 30 seconds.',
    icon:   '⏱️',
  },
]

const FEATURES = [
  {
    title: 'Twitch Clip Browser',
    desc:  'Connect your Twitch account and browse every clip right inside SocialMate. No more switching tabs or hunting for URLs.',
    icon:  '🎮',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'YouTube Video Scheduler',
    desc:  'Paste your YouTube channel URL — no API key, no OAuth — and browse your uploads ready to schedule.',
    icon:  '▶️',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'Search Any Twitch Channel',
    desc:  'Not your clips? No problem. Search any public Twitch channel and grab clips from creators you collab with.',
    icon:  '🔍',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'One-Click Multi-Platform Scheduling',
    desc:  'Pick a clip, write your caption, choose your platforms, hit schedule. Posts go out to Bluesky, X, Mastodon, Discord, and Telegram in one shot.',
    icon:  '🚀',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'TikTok & Kick Scheduling',
    desc:  'Directly schedule your best clips to TikTok and Kick from the same dashboard. API access is being finalized.',
    icon:  '🎵',
    live:  false,
    badge: 'Coming soon',
  },
  {
    title: 'Clip Calendar & Bulk Scheduling',
    desc:  'Plan your entire week of clips in advance. Bulk-upload multiple clips and assign them to different days automatically.',
    icon:  '📅',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'AI Caption Writer',
    desc:  'No idea what to write? Let the AI write a punchy caption for your clip — hooks, emojis, hashtags included.',
    icon:  '🤖',
    live:  true,
    badge: 'Live now',
  },
  {
    title: 'Evergreen Clip Recycling',
    desc:  'Your best clips don\'t die after one post. Set them to automatically recycle every few weeks and keep your content working forever.',
    icon:  '♻️',
    live:  true,
    badge: 'Live now',
  },
]

const PRICING = [
  {
    plan:    'Free',
    price:   '$0',
    note:    'forever',
    credits: '50 AI credits/mo',
    clips:   'Twitch + YouTube clips',
    cta:     'Start free',
    href:    '/signup',
    highlight: false,
  },
  {
    plan:    'Pro',
    price:   '$5',
    note:    '/month',
    credits: '500 AI credits/mo',
    clips:   'Twitch + YouTube clips',
    cta:     'Go Pro',
    href:    '/signup',
    highlight: true,
  },
  {
    plan:    'Agency',
    price:   '$20',
    note:    '/month',
    credits: '2,000 AI credits/mo',
    clips:   'Twitch + YouTube clips',
    cta:     'Go Agency',
    href:    '/signup',
    highlight: false,
  },
]

const FAQ = [
  {
    q: 'Does this work with Twitch clips specifically?',
    a: 'Yes. Connect your Twitch account via OAuth and your clips appear inside SocialMate instantly. You can browse, preview, and schedule any clip to multiple social platforms with one click.',
  },
  {
    q: 'Do I need a Twitch affiliate or partner account?',
    a: 'Nope. Clips Studio works with any Twitch account — affiliate, partner, or regular streamer. As long as you have clips, they\'ll show up.',
  },
  {
    q: 'What about YouTube? Do I need to give you API access?',
    a: 'No API access, no OAuth, no permissions needed. Just paste your YouTube channel URL and SocialMate fetches your public video list automatically.',
  },
  {
    q: 'Can I schedule clips from channels I collaborate with?',
    a: 'Yes. The "Search Any Channel" feature lets you browse clips from any public Twitch channel — great for collab highlights and community clips.',
  },
  {
    q: 'Is TikTok or Kick scheduling available yet?',
    a: 'Not yet — we\'re finalizing platform API access. Those platforms are in the roadmap and will be added as direct scheduling targets. Current posting goes to Bluesky, X, Mastodon, Discord, and Telegram.',
  },
  {
    q: 'How much does it cost?',
    a: 'Clips Studio is free on every plan. You get full Twitch OAuth + YouTube scheduling access on the free tier, $0/month, no credit card required.',
  },
  {
    q: 'What platforms can I schedule to right now?',
    a: 'Bluesky, X/Twitter, Mastodon, Discord, Telegram, TikTok, and LinkedIn are live today. Kick, Instagram, Reddit, and more are on the active roadmap.',
  },
  {
    q: 'Do you have a clip editor?',
    a: 'Not yet — clip trimming and editing is on the roadmap. Right now SocialMate is focused on distribution: getting your already-clipped content in front of the right audiences on every platform.',
  },
]

export default function StreamersPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>

      {/* ─── HERO ─── */}
      <section className="text-ink-high py-24 px-6 text-center">
        <p className="text-xs font-bold text-amber uppercase tracking-widest mb-4">{t('for_streamers.eyebrow')}</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          {t('for_streamers.hero_title_1')}<br />
          <span className="text-amber">{t('for_streamers.hero_title_2')}</span>
        </h1>
        <p className="text-ink-body max-w-xl mx-auto text-base leading-relaxed mb-8">
          {t('for_streamers.hero_desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/signup"
            className="bg-amber/10 hover:bg-amber/10 text-ink-high font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_streamers.hero_cta_primary')}
          </Link>
          <Link href="/clips"
            className="border border-edge hover:border-edge text-ink-body hover:text-ink-high font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_streamers.hero_cta_secondary')}
          </Link>
        </div>
        <p className="text-ink-muted text-xs mt-4">{t('for_streamers.hero_note')}</p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_streamers.pain_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            {t('for_streamers.pain_title')}
          </h2>
          <div className="space-y-6">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="bg-panel border border-edge rounded-2xl p-5">
                  <p className="text-xs text-alert font-bold uppercase tracking-wide mb-2">{t('for_streamers.pain_before_label')}</p>
                  <p className="text-sm text-ink-body leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-amber/10 border border-amber/40 rounded-2xl p-5">
                  <p className="text-xs text-amber font-bold uppercase tracking-wide mb-2">{t('for_streamers.pain_after_label')}</p>
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
          <p className="text-center text-xs font-bold text-amber uppercase tracking-widest mb-3">{t('for_streamers.features_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            {t('for_streamers.features_title')}
          </h2>
          <p className="text-center text-ink-body text-sm mb-12 max-w-xl mx-auto">
            {t('for_streamers.features_desc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i}
                className={`rounded-2xl p-5 border ${f.live
                  ? 'bg-panel border-edge'
                  : 'bg-panel border-edge opacity-70'
                }`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${f.live
                    ? 'bg-jade/10 text-jade'
                    : 'bg-raised text-ink-body'
                  }`}>
                    {f.live ? t('for_streamers.badge_live') : t('for_streamers.badge_soon')}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold mb-2">{f.title}</h3>
                <p className="text-xs text-ink-body leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-gradient-to-b from-amber-950 to-gray-950 text-ink-high py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-amber uppercase tracking-widest mb-3">{t('for_streamers.how_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-12">{t('for_streamers.how_title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              { step: '1', title: t('for_streamers.step1_title'), desc: t('for_streamers.step1_desc') },
              { step: '2', title: t('for_streamers.step2_title'), desc: t('for_streamers.step2_desc') },
              { step: '3', title: t('for_streamers.step3_title'), desc: t('for_streamers.step3_desc') },
            ].map((s) => (
              <div key={s.step} className="bg-void border border-amber/40 rounded-2xl p-6">
                <div className="text-3xl font-black text-amber mb-3">{s.step}</div>
                <h3 className="text-sm font-extrabold mb-2">{s.title}</h3>
                <p className="text-xs text-ink-body leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORMS ─── */}
      <section className="text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_streamers.platforms_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_streamers.platforms_title')}</h2>
          <p className="text-ink-body text-sm mb-8">{t('for_streamers.platforms_desc')}</p>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {LIVE_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-panel border border-edge rounded-xl px-4 py-2.5">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold">{p.name}</span>
                <span className="text-xs bg-jade/10 text-jade px-2 py-0.5 rounded-full font-bold">{t('for_streamers.platforms_live_badge')}</span>
              </div>
            ))}
          </div>

          <h3 className="text-base font-extrabold text-ink-body mb-4">{t('for_streamers.pipeline_title')}</h3>
          <p className="text-ink-muted text-xs mb-6 max-w-md mx-auto">
            {t('for_streamers.pipeline_desc')} <Link href="/roadmap" className="text-amber hover:text-amber underline">{t('for_streamers.pipeline_roadmap')}</Link> {t('for_streamers.pipeline_desc_end')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {COMING_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-panel border border-edge rounded-xl px-4 py-2.5 opacity-60">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold text-ink-body">{p.name}</span>
                <span className="text-xs bg-raised text-ink-muted px-2 py-0.5 rounded-full font-bold">{t('for_streamers.pipeline_badge')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_streamers.pricing_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_streamers.pricing_title')}</h2>
          <p className="text-ink-body text-sm mb-12">{t('for_streamers.pricing_desc')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PRICING.map((tier) => (
              <div key={tier.plan}
                className={`rounded-2xl p-6 border ${tier.highlight
                  ? 'bg-amber/10 border-amber/40 ring-1 ring-amber'
                  : 'bg-panel border-edge'
                }`}>
                {tier.highlight && (
                  <p className="text-xs font-bold text-amber uppercase tracking-widest mb-3">{t('for_streamers.pricing_most_popular')}</p>
                )}
                <p className="text-sm font-extrabold mb-1">{tier.plan}</p>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-black">{tier.price}</span>
                  <span className="text-ink-body text-sm mb-1">{tier.note}</span>
                </div>
                <ul className="text-xs text-ink-body space-y-2 mb-6 text-left">
                  <li>✓ {tier.credits}</li>
                  <li>✓ {tier.clips}</li>
                  <li>✓ {t('for_streamers.pricing_feature_platforms')}</li>
                  <li>✓ {t('for_streamers.pricing_feature_ai_caption')}</li>
                  <li>✓ {t('for_streamers.pricing_feature_calendar')}</li>
                </ul>
                <Link href={tier.href}
                  className={`block text-center text-sm font-bold py-3 rounded-xl transition-all ${tier.highlight
                    ? 'bg-amber/10 hover:bg-amber/10 text-ink-high'
                    : 'bg-panel text-ink-high hover:opacity-80'
                  }`}>
                  {tier.cta} →
                </Link>
              </div>
            ))}
          </div>
          <p className="text-ink-muted text-xs">{t('for_streamers.pricing_note')}</p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="text-ink-high py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_streamers.faq_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">{t('for_streamers.faq_title')}</h2>
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
      <section className="bg-gradient-to-br from-amber-950 via-gray-950 to-black text-ink-high py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          {t('for_streamers.bottom_title')}
        </h2>
        <p className="text-ink-body text-sm mb-8 max-w-md mx-auto">
          {t('for_streamers.bottom_desc')}
        </p>
        <Link href="/signup"
          className="inline-block bg-amber/10 hover:bg-amber/10 text-ink-high font-bold px-10 py-4 rounded-xl text-sm transition-all">
          {t('for_streamers.bottom_cta')}
        </Link>
        <p className="text-ink-muted text-xs mt-4">{t('for_streamers.bottom_note')}</p>
      </section>

    </PublicLayout>
  )
}
