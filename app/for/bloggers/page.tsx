'use client'

import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

const LIVE_PLATFORMS = [
  { name: 'Bluesky',     icon: '🦋', note: 'Live' },
  { name: 'X / Twitter', icon: '🐦', note: 'Live' },
  { name: 'Mastodon',    icon: '🐘', note: 'Live' },
  { name: 'Discord',     icon: '💬', note: 'Live' },
  { name: 'Telegram',    icon: '✈️', note: 'Live' },
  { name: 'TikTok',      icon: '🎵', note: 'Live' },
  { name: 'LinkedIn',    icon: '💼', note: 'Live' },
]

const COMING_PLATFORMS = [
  { name: 'Instagram', icon: '📸' },
  { name: 'YouTube',   icon: '▶️' },
  { name: 'Facebook',  icon: '📘' },
  { name: 'Pinterest', icon: '📌' },
]

const PAIN_POINTS = [
  {
    before: 'Spend 4 hours writing a post. Spend another hour promoting it across 6 apps. Exhausted.',
    after:  'Write. Publish. SocialMate handles the promotion — all 7 platforms, scheduled automatically.',
    icon:   '😮‍💨',
  },
  {
    before: 'Old posts nobody sees. You can\'t afford to manually promote your back catalog.',
    after:  'Evergreen recycling automatically re-promotes your best posts every few weeks.',
    icon:   '♻️',
  },
  {
    before: 'Stare at a blank caption box. You already wrote 2,000 words today. You\'re done.',
    after:  'AI reads your post and writes a platform-optimized caption in 3 seconds.',
    icon:   '✍️',
  },
  {
    before: 'Post goes live. Twitter, LinkedIn, Bluesky, Discord — all manual. Takes 45 minutes.',
    after:  'Paste your RSS feed once. Every new post auto-schedules to all platforms.',
    icon:   '🚀',
  },
]

const FEATURES = [
  {
    title: 'RSS Import — Blog to Social, Automatically',
    desc:  'Paste your blog RSS or Atom feed URL once. Every new post you publish automatically gets queued for social media promotion across all your connected platforms.',
    icon:  '📡',
    badge: 'Free',
  },
  {
    title: 'AI Caption Generator',
    desc:  'Paste your post title and intro. AI generates punchy captions for each platform — Twitter hooks, LinkedIn opener, short blurb for Discord, hashtag-rich Mastodon post. Platform-native, not copy-pasted.',
    icon:  '🤖',
    badge: 'Free',
  },
  {
    title: 'SOMA — Blog Repurposing on Autopilot',
    desc:  'Upload your post or share your RSS. SOMA generates a full week of content from your blog: quotes, key points, questions, angles, teasers — platform-native for each channel. Run it once a week.',
    icon:  '⚡',
    badge: 'Pro',
  },
  {
    title: 'Evergreen Post Recycling',
    desc:  'Your best posts shouldn\'t die after launch day. Mark them evergreen and they auto-recycle on a schedule — monthly, quarterly, whenever you want. Back catalog = active traffic.',
    icon:  '♻️',
    badge: 'Free',
  },
  {
    title: 'LinkedIn Scheduling',
    desc:  'LinkedIn drives the most blog traffic for B2B bloggers. Schedule your post promotion and thought leadership content to your professional network in advance.',
    icon:  '💼',
    badge: 'Free',
  },
  {
    title: 'Content Repurposer',
    desc:  'Turn one blog post into 6 content pieces: Twitter thread, LinkedIn long-form, email newsletter hook, short TikTok hook, Mastodon post, Discord update. 1 click.',
    icon:  '🔄',
    badge: 'Pro',
  },
  {
    title: 'Post Calendar & Scheduling Queue',
    desc:  'See all your blog promo scheduled across all platforms. Drag and drop to reschedule. Smart Queue fills optimal time slots automatically on Pro.',
    icon:  '📅',
    badge: 'Free',
  },
  {
    title: 'Bluesky — Organic Reach for Writers',
    desc:  'Bluesky has the best organic reach for writers and bloggers right now. Chronological feed, engaged audience, no algorithmic suppression. First place to promote your posts.',
    icon:  '🦋',
    badge: 'Free',
  },
]

const PRICING = [
  {
    plan:    'Free',
    price:   '$0',
    period:  'forever',
    credits: '50 AI credits/mo',
    cta:     'Start free — no card',
    href:    '/signup',
    highlight: false,
  },
  {
    plan:    'Pro',
    price:   '$5',
    period:  '/month',
    credits: '500 AI credits/mo',
    cta:     'Go Pro',
    href:    '/signup',
    highlight: true,
  },
]

const FAQ = [
  {
    q: 'How does the RSS import work?',
    a: 'Go to your SocialMate dashboard and paste your blog\'s RSS or Atom feed URL (usually yourblog.com/feed or yourblog.com/rss). SocialMate polls it regularly and when it finds a new post, it creates a draft scheduled post in your queue — ready for you to review or auto-publish.',
  },
  {
    q: 'Can I customize the auto-generated social posts from RSS?',
    a: 'Yes. Each RSS-imported post becomes a draft you can edit before it goes out. You can also let AI generate a fresh caption from the post title and summary.',
  },
  {
    q: 'Does Bluesky actually get blog traffic?',
    a: 'Yes. Bluesky has strong organic reach for writers and bloggers — chronological feed, highly engaged tech/creator audience, and no algorithmic suppression. Many bloggers are finding better engagement there than X right now. Plus it\'s free to post.',
  },
  {
    q: 'What is SOMA and does it work for bloggers?',
    a: 'SOMA is SocialMate\'s AI content system. For bloggers, you paste a post or URL and it generates a full week of social content based on your post: quotes, angles, questions for your audience, key takeaways — one per platform, in your voice. It\'s a Pro+ feature that replaces 2 hours of content work.',
  },
  {
    q: 'Can I schedule my back catalog of old posts?',
    a: 'Yes. Evergreen recycling lets you mark any post to auto-republish on a schedule. Great for evergreen guides, tutorials, and resource posts that deserve more than one moment in the spotlight.',
  },
  {
    q: 'What platforms can I actually use today?',
    a: 'Bluesky, X/Twitter, Mastodon, Discord, Telegram, TikTok, and LinkedIn are all live today. Instagram, Facebook, YouTube, and Pinterest are on the roadmap.',
  },
]

export default function BloggersPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>

      {/* ─── HERO ─── */}
      <section className="bg-void text-ink-high py-24 px-6 text-center">
        <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-4">{t('for_bloggers.eyebrow')}</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          {t('for_bloggers.hero_title_1')}<br />
          <span className="text-ink-muted">{t('for_bloggers.hero_title_2')}</span>
        </h1>
        <p className="text-ink-body max-w-xl mx-auto text-base leading-relaxed mb-8">
          {t('for_bloggers.hero_desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/signup"
            className="bg-raised hover:bg-raised text-ink-high font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_bloggers.hero_cta_primary')}
          </Link>
          <Link href="/soma"
            className="border border-edge hover:border-edge text-ink-body hover:text-ink-high font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_bloggers.hero_cta_secondary')}
          </Link>
        </div>
        <p className="text-ink-muted text-xs mt-4">{t('for_bloggers.hero_note')}</p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="bg-panel text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_bloggers.pain_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            {t('for_bloggers.pain_title')}
          </h2>
          <div className="space-y-5">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                <div className="bg-panel border border-edge rounded-2xl p-5">
                  <p className="text-xs text-alert font-bold uppercase tracking-wide mb-2">{t('for_bloggers.pain_before_label')}</p>
                  <p className="text-sm text-ink-body leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-raised border border-edge-lit rounded-2xl p-5">
                  <p className="text-xs text-ink-muted font-bold uppercase tracking-wide mb-2">{t('for_bloggers.pain_after_label')}</p>
                  <p className="text-sm text-ink-high leading-relaxed">{p.icon} {p.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RSS CALLOUT ─── */}
      <section className="bg-void text-ink-high py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-950/60 to-gray-900 border border-edge-lit rounded-3xl p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row gap-8 items-center">
              <div className="text-center sm:text-left flex-1">
                <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">RSS Import</p>
                <h2 className="text-xl sm:text-2xl font-extrabold mb-3">
                  Paste your blog URL.<br />Get automatic social posts.
                </h2>
                <p className="text-ink-body text-sm leading-relaxed mb-4">
                  SocialMate monitors your RSS feed. When you publish a new post,
                  it automatically creates scheduled social media posts across all your
                  connected platforms. No setup. No manual work. Just blog.
                </p>
                <Link href="/signup"
                  className="inline-block bg-raised hover:bg-raised text-ink-high font-bold px-6 py-3 rounded-xl text-sm transition-all">
                  Try it free →
                </Link>
              </div>
              <div className="bg-panel border border-edge rounded-2xl p-5 text-sm font-mono text-ink-body w-full sm:w-56 flex-shrink-0">
                <p className="text-ink-muted text-xs mb-2">RSS Feed:</p>
                <p className="text-ink-high text-xs mb-4">yourblog.com/feed</p>
                <p className="text-ink-muted text-xs mb-2">Platforms:</p>
                <p className="text-xs">🦋 Bluesky ✓</p>
                <p className="text-xs">🐦 X ✓</p>
                <p className="text-xs">💼 LinkedIn ✓</p>
                <p className="text-xs">💬 Discord ✓</p>
                <p className="text-xs mb-4">✈️ Telegram ✓</p>
                <p className="text-jade text-xs font-bold">✓ Auto-scheduled</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-panel text-ink-high py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_bloggers.features_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            {t('for_bloggers.features_title')}
          </h2>
          <p className="text-center text-ink-body text-sm mb-12 max-w-lg mx-auto">
            {t('for_bloggers.features_desc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-void border border-edge rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    f.badge === 'Free'
                      ? 'bg-jade/10 text-jade'
                      : 'bg-raised text-ink-muted'
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
      <section className="bg-void text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_bloggers.platforms_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_bloggers.platforms_title')}</h2>
          <p className="text-ink-body text-sm mb-8">{t('for_bloggers.platforms_desc')}</p>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {LIVE_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-panel border border-edge rounded-xl px-4 py-2.5">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold">{p.name}</span>
                <span className="text-xs bg-jade/10 text-jade px-2 py-0.5 rounded-full font-bold">{t('for_bloggers.platforms_live_badge')}</span>
              </div>
            ))}
          </div>

          <h3 className="text-base font-extrabold text-ink-body mb-4">{t('for_bloggers.platforms_coming_title')}</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {COMING_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-panel border border-edge rounded-xl px-4 py-2.5 opacity-60">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold text-ink-body">{p.name}</span>
                <span className="text-xs bg-raised text-ink-muted px-2 py-0.5 rounded-full font-bold">{t('for_bloggers.platforms_coming_badge')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="bg-panel text-ink-high py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_bloggers.pricing_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_bloggers.pricing_title')}</h2>
          <p className="text-ink-body text-sm mb-12">{t('for_bloggers.pricing_desc')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto mb-8">
            {PRICING.map((tier) => (
              <div key={tier.plan}
                className={`rounded-2xl p-6 border text-left ${tier.highlight
                  ? 'bg-raised border-edge-lit ring-1 ring-edge-lit'
                  : 'bg-panel border-edge'
                }`}>
                {tier.highlight && (
                  <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_bloggers.pricing_most_popular')}</p>
                )}
                <p className="text-sm font-extrabold mb-1">{tier.plan}</p>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-black">{tier.price}</span>
                  <span className="text-ink-body text-sm mb-1">{tier.period}</span>
                </div>
                <ul className="text-xs text-ink-body space-y-2 mb-6">
                  <li>✓ {tier.credits}</li>
                  <li>✓ All 7 live platforms</li>
                  <li>✓ RSS import</li>
                  <li>✓ AI caption writer</li>
                  <li>✓ Evergreen recycling</li>
                  <li>✓ Link in Bio page</li>
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
          <p className="text-ink-muted text-xs">{t('for_bloggers.pricing_note')}</p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-void text-ink-high py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_bloggers.faq_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">{t('for_bloggers.faq_title')}</h2>
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
      <section className="bg-gradient-to-br from-indigo-950 via-gray-950 to-black text-ink-high py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          {t('for_bloggers.bottom_title')}
        </h2>
        <p className="text-ink-body text-sm mb-8 max-w-md mx-auto">
          {t('for_bloggers.bottom_desc')}
        </p>
        <Link href="/signup"
          className="inline-block bg-raised hover:bg-raised text-ink-high font-bold px-10 py-4 rounded-xl text-sm transition-all">
          {t('for_bloggers.bottom_cta')}
        </Link>
        <p className="text-ink-muted text-xs mt-4">{t('for_bloggers.bottom_note')}</p>
      </section>

    </PublicLayout>
  )
}
