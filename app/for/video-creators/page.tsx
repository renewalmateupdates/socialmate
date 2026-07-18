'use client'

import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

const LIVE_PLATFORMS = [
  { name: 'TikTok',     icon: '🎵', note: 'Live — free', highlight: true  },
  { name: 'X / Twitter', icon: '🐦', note: 'Live',        highlight: false },
  { name: 'Bluesky',    icon: '🦋', note: 'Live',        highlight: false },
  { name: 'Mastodon',   icon: '🐘', note: 'Live',        highlight: false },
  { name: 'Discord',    icon: '💬', note: 'Live',        highlight: false },
  { name: 'Telegram',   icon: '✈️', note: 'Live',        highlight: false },
  { name: 'LinkedIn',   icon: '💼', note: 'Live',        highlight: false },
]

const COMING_PLATFORMS = [
  { name: 'YouTube posting', icon: '▶️' },
  { name: 'Instagram',       icon: '📸' },
  { name: 'LinkedIn',        icon: '💼' },
]

const PAIN_POINTS = [
  {
    icon: '🎬',
    problem: 'Managing TikTok, Twitter, and Discord separately for every video upload — three tabs, three captions, three times the effort.',
    solution: 'One dashboard. Write once, publish to all 7 platforms in one click. TikTok + Discord + Bluesky + LinkedIn in 30 seconds flat.',
  },
  {
    icon: '✍️',
    problem: 'Recording great content but spending hours writing hooks, captions, and CTAs from scratch for every video.',
    solution: 'AI TikTok Script Generator writes your hook, body, and CTA. AI Caption Generator handles social posts. Done in seconds.',
  },
  {
    icon: '📤',
    problem: 'Exporting clips in different formats and dimensions for TikTok vs Twitter vs Discord — a technical headache every time.',
    solution: 'Creator Studio handles GIF export and video editing with 8 CSS filters. One source, multiple outputs.',
  },
]

const FEATURES = [
  {
    title: 'TikTok Scheduling — Live & Free',
    desc:  'Production API approved May 2026. Schedule TikTok videos directly from your dashboard — for free on every plan. 20 videos/month on free, 60 on Pro, 200 on Agency.',
    icon:  '🎵',
    live:  true,
    badge: 'Live now',
    accent: 'text-[#fe2c55]',
    badgeBg: 'bg-alert/10 text-[#fe2c55]',
  },
  {
    title: 'Clips Studio (Twitch + YouTube)',
    desc:  'Browse your Twitch clips via OAuth or paste a YouTube channel URL — no API key needed. Pick any clip and schedule it to all platforms in one click.',
    icon:  '🎮',
    live:  true,
    badge: 'Live now',
    accent: 'text-violet',
    badgeBg: 'bg-jade/10 text-jade',
  },
  {
    title: 'Creator Studio & GIF Export',
    desc:  'Trim videos, apply 8 CSS filters, add caption overlays, and export as GIF or MP4 via MediaRecorder + canvas. No additional software needed.',
    icon:  '🎨',
    live:  true,
    badge: 'Live now',
    accent: 'text-amber',
    badgeBg: 'bg-jade/10 text-jade',
  },
  {
    title: 'TikTok Script Generator',
    desc:  'AI-powered hook → body → CTA script built for TikTok format. Enter your topic and get a complete short-form video script in seconds. Powered by Google Gemini.',
    icon:  '🤖',
    live:  true,
    badge: 'Live now',
    accent: 'text-[#fe2c55]',
    badgeBg: 'bg-jade/10 text-jade',
  },
  {
    title: 'Cross-Platform Posting',
    desc:  'Post to all 7 live platforms simultaneously — TikTok, X/Twitter, Bluesky, Mastodon, Discord, Telegram, LinkedIn. Per-platform previews show exactly how each post will look.',
    icon:  '🚀',
    live:  true,
    badge: 'Live now',
    accent: 'text-ink-muted',
    badgeBg: 'bg-jade/10 text-jade',
  },
  {
    title: 'YouTube Posting',
    desc:  'Direct video uploads to YouTube from the SocialMate dashboard. Full title, description, and tag support. API application in progress.',
    icon:  '▶️',
    live:  false,
    badge: 'Coming soon',
    accent: 'text-[#ff0000]',
    badgeBg: 'bg-raised text-ink-body',
  },
]

const PRICING = [
  {
    plan:      'Free',
    price:     '$0',
    note:      'forever',
    tiktok:    '20 TikTok videos/mo',
    ai:        '50 AI credits/mo',
    cta:       'Start free',
    href:      '/signup',
    highlight: false,
  },
  {
    plan:      'Pro',
    price:     '$5',
    note:      '/month',
    tiktok:    '60 TikTok videos/mo',
    ai:        '500 AI credits/mo',
    cta:       'Go Pro',
    href:      '/signup',
    highlight: true,
  },
  {
    plan:      'Agency',
    price:     '$20',
    note:      '/month',
    tiktok:    '200 TikTok videos/mo',
    ai:        '2,000 AI credits/mo',
    cta:       'Go Agency',
    href:      '/signup',
    highlight: false,
  },
]

const FAQ = [
  {
    q: 'What video platforms does SocialMate support?',
    a: 'TikTok is live with Production API approval (May 2026) — free for all users, up to 20 videos/month on the free plan, 60 on Pro, and 200 on Agency. Clips Studio lets you browse and schedule from Twitch (OAuth) and YouTube (channel URL, no API needed). YouTube direct posting and Instagram are on the roadmap.',
  },
  {
    q: 'Can I schedule TikTok videos for free?',
    a: "Yes. TikTok scheduling is free on every SocialMate plan. The free tier includes 20 TikTok videos per month. SocialMate connects directly to TikTok's Production API — no workarounds, no third-party tools. Connect your TikTok account at /accounts and start scheduling from the dashboard.",
  },
  {
    q: 'How does Clips Studio work?',
    a: 'Clips Studio has two modes: Twitch (connect your account via OAuth to browse all your clips), and YouTube (paste any channel URL to browse public videos — no API key or OAuth required). Click any clip to open the compose window, write or generate a caption, choose your platforms, and schedule. Works on the free plan.',
  },
  {
    q: "What's GIF Export in Creator Studio?",
    a: "Creator Studio at /create is SocialMate's browser-based video editor. You can trim clips, apply 8 CSS visual filters, add text caption overlays, capture a thumbnail, and export to GIF or MP4 using MediaRecorder + canvas — no third-party software, no downloads, no additional cost.",
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

export default function VideoCreatorsPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ─── HERO ─── */}
      <section className="bg-void text-ink-high py-24 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-[#fe2c55]/10 border border-[#fe2c55]/30 rounded-full px-4 py-1.5 text-xs font-bold text-[#fe2c55] mb-6 uppercase tracking-widest">
          {t('for_video.api_badge')}
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          {t('for_video.hero_title_1')}<br />
          <span className="text-[#fe2c55]">{t('for_video.hero_title_2')}</span>
        </h1>
        <p className="text-ink-body max-w-xl mx-auto text-base leading-relaxed mb-8">
          {t('for_video.hero_desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/signup"
            className="bg-[#fe2c55] hover:bg-[#fe2c55]/80 text-ink-high font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center"
          >
            {t('for_video.hero_cta_primary')}
          </Link>
          <Link
            href="/accounts"
            className="border border-edge hover:border-edge text-ink-body hover:text-ink-high font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center"
          >
            {t('for_video.hero_cta_secondary')}
          </Link>
        </div>
        <p className="text-ink-muted text-xs mt-4">{t('for_video.hero_note')}</p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="bg-panel text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_video.pain_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            {t('for_video.pain_title')}
          </h2>
          <div className="space-y-6">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="bg-panel border border-edge rounded-2xl p-5">
                  <p className="text-xs text-alert font-bold uppercase tracking-wide mb-2">{t('for_video.pain_before_label')}</p>
                  <p className="text-sm text-ink-body leading-relaxed">{p.icon} {p.problem}</p>
                </div>
                <div className="bg-[#fe2c55]/10 border border-[#fe2c55]/20 rounded-2xl p-5">
                  <p className="text-xs text-[#fe2c55] font-bold uppercase tracking-wide mb-2">{t('for_video.pain_after_label')}</p>
                  <p className="text-sm text-ink-high leading-relaxed">{p.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-void text-ink-high py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-[#fe2c55] uppercase tracking-widest mb-3">{t('for_video.features_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            {t('for_video.features_title')}
          </h2>
          <p className="text-center text-ink-body text-sm mb-12 max-w-xl mx-auto">
            {t('for_video.features_desc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`rounded-2xl p-5 border ${
                  f.live
                    ? 'bg-panel border-edge'
                    : 'bg-panel border-edge opacity-70'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${f.badgeBg}`}>
                    {f.live ? t('for_video.badge_live') : t('for_video.badge_soon')}
                  </span>
                </div>
                <h3 className={`text-sm font-extrabold mb-2 ${f.live ? f.accent : 'text-ink-muted'}`}>
                  {f.title}
                </h3>
                <p className="text-xs text-ink-body leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORM GRID ─── */}
      <section className="bg-gradient-to-b from-gray-950 to-black text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_video.platforms_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_video.platforms_title')}</h2>
          <p className="text-ink-body text-sm mb-8">{t('for_video.platforms_desc')}</p>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {LIVE_PLATFORMS.map((p) => (
              <div
                key={p.name}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 border ${
                  p.highlight
                    ? 'bg-[#fe2c55]/10 border-[#fe2c55]/40'
                    : 'bg-panel border-edge'
                }`}
              >
                <span className="text-lg">{p.icon}</span>
                <span className={`text-sm font-bold ${p.highlight ? 'text-[#fe2c55]' : ''}`}>{p.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    p.highlight
                      ? 'bg-[#fe2c55]/20 text-[#fe2c55]'
                      : 'bg-jade/10 text-jade'
                  }`}
                >
                  {p.highlight ? t('for_video.platforms_new_badge') : t('for_video.platforms_live_badge')}
                </span>
              </div>
            ))}
          </div>

          <h3 className="text-base font-extrabold text-ink-body mb-4">{t('for_video.pipeline_title')}</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {COMING_PLATFORMS.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-2 bg-panel border border-edge rounded-xl px-4 py-2.5 opacity-60"
              >
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold text-ink-body">{p.name}</span>
                <span className="text-xs bg-raised text-ink-muted px-2 py-0.5 rounded-full font-bold">{t('for_video.pipeline_badge')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-panel text-ink-high py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-[#fe2c55] uppercase tracking-widest mb-3">{t('for_video.how_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-12">{t('for_video.how_title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              {
                step: '1',
                title: t('for_video.step1_title'),
                desc: t('for_video.step1_desc'),
              },
              {
                step: '2',
                title: t('for_video.step2_title'),
                desc: t('for_video.step2_desc'),
              },
              {
                step: '3',
                title: t('for_video.step3_title'),
                desc: t('for_video.step3_desc'),
              },
            ].map((s) => (
              <div key={s.step} className="bg-void border border-[#fe2c55]/20 rounded-2xl p-6">
                <div className="text-3xl font-black text-[#fe2c55] mb-3">{s.step}</div>
                <h3 className="text-sm font-extrabold mb-2">{s.title}</h3>
                <p className="text-xs text-ink-body leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="bg-void text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_video.pricing_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            {t('for_video.pricing_title')}
          </h2>
          <p className="text-ink-body text-sm mb-12">{t('for_video.pricing_desc')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PRICING.map((tier) => (
              <div
                key={tier.plan}
                className={`rounded-2xl p-6 border ${
                  tier.highlight
                    ? 'bg-[#fe2c55]/10 border-[#fe2c55]/40 ring-1 ring-[#fe2c55]/30'
                    : 'bg-panel border-edge'
                }`}
              >
                {tier.highlight && (
                  <p className="text-xs font-bold text-[#fe2c55] uppercase tracking-widest mb-3">{t('for_video.pricing_most_popular')}</p>
                )}
                <p className="text-sm font-extrabold mb-1">{tier.plan}</p>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-black">{tier.price}</span>
                  <span className="text-ink-body text-sm mb-1">{tier.note}</span>
                </div>
                <ul className="text-xs text-ink-body space-y-2 mb-6 text-left">
                  <li>✓ {tier.tiktok}</li>
                  <li>✓ {tier.ai}</li>
                  <li>✓ {t('for_video.pricing_feature_platforms')}</li>
                  <li>✓ {t('for_video.pricing_feature_ai')}</li>
                  <li>✓ {t('for_video.pricing_feature_clips')}</li>
                </ul>
                <Link
                  href={tier.href}
                  className={`block text-center text-sm font-bold py-3 rounded-xl transition-all ${
                    tier.highlight
                      ? 'bg-[#fe2c55] hover:bg-[#fe2c55]/80 text-ink-high'
                      : 'bg-panel text-ink-high hover:opacity-80'
                  }`}
                >
                  {tier.cta} →
                </Link>
              </div>
            ))}
          </div>
          <p className="text-ink-muted text-xs">{t('for_video.pricing_note')}</p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-panel text-ink-high py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_video.faq_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">{t('for_video.faq_title')}</h2>
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
      <section className="bg-gradient-to-br from-[#fe2c55]/20 via-gray-950 to-black text-ink-high py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          {t('for_video.bottom_title')}
        </h2>
        <p className="text-ink-body text-sm mb-8 max-w-md mx-auto">
          {t('for_video.bottom_desc')}
        </p>
        <Link
          href="/signup"
          className="inline-block bg-[#fe2c55] hover:bg-[#fe2c55]/80 text-ink-high font-bold px-10 py-4 rounded-xl text-sm transition-all"
        >
          {t('for_video.bottom_cta')}
        </Link>
        <p className="text-ink-muted text-xs mt-4">{t('for_video.bottom_note')}</p>
      </section>
    </PublicLayout>
  )
}
