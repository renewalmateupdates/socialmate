'use client'

import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

const PERSONAS = [
  { label: 'Restaurant owner',     icon: '🍕' },
  { label: 'Hair salon',           icon: '💇' },
  { label: 'Boutique shop',        icon: '👗' },
  { label: 'Fitness studio',       icon: '🏋️' },
  { label: 'Local contractor',     icon: '🔨' },
  { label: 'Real estate agent',    icon: '🏡' },
  { label: 'Freelancer / consultant', icon: '💼' },
  { label: 'Food truck',           icon: '🚚' },
]

const PAIN_POINTS = [
  {
    before: 'Open 4 apps. Post the same thing 4 times. 45 minutes gone.',
    after:  'Write once. Schedule to 7 platforms in 30 seconds.',
    icon: '⏱️',
  },
  {
    before: 'Pay $99/month for Hootsuite and use 10% of the features.',
    after:  'Get the same result for $5/month. Or free.',
    icon: '💸',
  },
  {
    before: 'Stare at a blank caption box for 20 minutes.',
    after:  'Click "Generate caption." Done in 3 seconds.',
    icon: '✍️',
  },
  {
    before: 'Forget to post for 2 weeks. Watch your engagement tank.',
    after:  'Schedule a month of content in one sitting. Set it and forget it.',
    icon: '📅',
  },
]

const FEATURES = [
  {
    title: 'Schedule to 6 Platforms',
    desc:  'Bluesky, X/Twitter, Mastodon, Discord, Telegram, and TikTok live today. Write once, post everywhere. LinkedIn and more on the way.',
    icon:  '📡',
    badge: 'Free',
  },
  {
    title: 'AI Caption Writer',
    desc:  'Stuck on what to write? Generate a caption, hook, or call-to-action in one click. Reads your content, writes like you.',
    icon:  '🤖',
    badge: 'Free',
  },
  {
    title: 'Post Calendar',
    desc:  'See your entire content schedule at a glance. Drag, drop, reschedule. Never wonder "did I post today?" again.',
    icon:  '📅',
    badge: 'Free',
  },
  {
    title: 'Link in Bio',
    desc:  'Free link-in-bio page included on all plans. One link, all your important pages. No Linktree subscription needed.',
    icon:  '🔗',
    badge: 'Free',
  },
  {
    title: 'Bulk Scheduling',
    desc:  'Batch your entire week of posts in one session. Upload a CSV or paste multiple captions at once and assign times automatically.',
    icon:  '📦',
    badge: 'Free',
  },
  {
    title: 'Drafts & Queue',
    desc:  'Save ideas as drafts. Build a queue of evergreen posts that publish on a schedule. Never run out of content.',
    icon:  '📝',
    badge: 'Free',
  },
  {
    title: 'Best Times to Post',
    desc:  'Data-driven recommendations for when your audience is most active on each platform. Stop guessing.',
    icon:  '📊',
    badge: 'Pro',
  },
  {
    title: 'Team Seats',
    desc:  'Add a VA, a partner, or a part-time social media helper. Up to 5 seats on Pro — no extra charge per seat.',
    icon:  '👥',
    badge: 'Pro',
  },
  {
    title: 'Evergreen Recycling',
    desc:  'Your best posts keep working. Set any post to auto-recycle on a schedule so your top content never gets buried.',
    icon:  '♻️',
    badge: 'Pro',
  },
]

const PRICING = [
  {
    plan:    'Free',
    price:   '$0',
    period:  'forever',
    credits: '50 AI credits/mo',
    posts:   '100 posts/month',
    seats:   '2 seats',
    window:  '2-week schedule window',
    highlight: false,
    cta:     'Start free — no card',
    href:    '/signup',
  },
  {
    plan:    'Pro',
    price:   '$5',
    period:  '/month',
    credits: '500 AI credits/mo',
    posts:   '100 posts / month',
    seats:   '5 seats',
    window:  'Unlimited schedule window',
    highlight: true,
    cta:     'Go Pro',
    href:    '/signup',
  },
]

const COMPARISON = [
  { tool: 'Hootsuite Pro',   price: '$99/mo',  platforms: 10,  ai: 'Add-on', free: '✗' },
  { tool: 'Buffer Essentials', price: '$18/mo', platforms: 3,   ai: 'Limited', free: '✗' },
  { tool: 'Later Starter',   price: '$18/mo',  platforms: 1,   ai: 'Limited', free: '✗' },
  { tool: 'SocialMate Pro',  price: '$5/mo',   platforms: 6,   ai: '500 cr',  free: '50cr', highlight: true },
]

const FAQ = [
  {
    q: 'Is the free plan actually useful, or is it a bait-and-switch?',
    a: 'Genuinely useful. 50 AI credits, 100 posts/month, 7 live platforms, link in bio, post calendar, drafts, and queue. We didn\'t gut the free plan to force upgrades. You\'ll outgrow it eventually, but it\'s not a demo.',
  },
  {
    q: 'Do I need a credit card to start?',
    a: 'No. Free plan requires no payment information at all. Just your email.',
  },
  {
    q: 'What platforms are supported right now?',
    a: 'Bluesky, X/Twitter, Mastodon, Discord, Telegram, and TikTok are live today. LinkedIn, YouTube, Pinterest, Reddit, Instagram, Facebook, and Threads are on the roadmap. We don\'t lie about ETAs — see the roadmap page for honest status.',
  },
  {
    q: 'What are AI credits and what can I do with them?',
    a: '15+ AI tools powered by Google Gemini. Caption writer, hook generator, thread builder, rewriter, content idea generator, and more. Each use costs 1–3 credits depending on the tool. Free plan gets 50/month, Pro gets 500.',
  },
  {
    q: 'Can my assistant or business partner use the account?',
    a: 'Yes. Free plan includes 2 seats, Pro includes 5. Add team members from the Team page in your dashboard.',
  },
  {
    q: 'What happens if I go over the 100-post limit on free?',
    a: 'You\'ll be notified before you hit the limit and prompted to upgrade. Nothing gets deleted — posts just queue until you upgrade or a new month starts.',
  },
  {
    q: 'Is there a contract or can I cancel anytime?',
    a: 'No contract. Cancel Pro anytime from your settings — no hoops, no "call to cancel" nonsense. Downgrade to free and keep your content.',
  },
  {
    q: 'Can I schedule posts months in advance?',
    a: 'Free plan has a 2-week scheduling window. Pro and Agency have no limit — schedule as far out as you want.',
  },
]

export default function SmallBusinessPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>

      {/* ─── HERO ─── */}
      <section className="bg-void text-ink-high py-24 px-6 text-center">
        <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-4">{t('for_small_biz.eyebrow')}</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          {t('for_small_biz.hero_title_1')}<br />
          <span className="text-ink-muted">{t('for_small_biz.hero_title_2')}</span>
        </h1>
        <p className="text-ink-body max-w-xl mx-auto text-base leading-relaxed mb-6">
          {t('for_small_biz.hero_desc')}
        </p>

        {/* Persona pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-2xl mx-auto">
          {PERSONAS.map((p) => (
            <span key={p.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-panel border border-edge rounded-full text-xs text-ink-body font-medium">
              {p.icon} {p.label}
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/signup"
            className="bg-raised hover:bg-raised text-ink-high font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_small_biz.hero_cta_primary')}
          </Link>
          <Link href="/pricing"
            className="border border-edge hover:border-edge text-ink-body hover:text-ink-high font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_small_biz.hero_cta_secondary')}
          </Link>
        </div>
        <p className="text-ink-muted text-xs mt-4">{t('for_small_biz.hero_note')}</p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="bg-panel text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_small_biz.pain_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            {t('for_small_biz.pain_title_1')}<br />{t('for_small_biz.pain_title_2')}
          </h2>
          <div className="space-y-5">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                <div className="bg-panel border border-edge rounded-2xl p-5">
                  <p className="text-xs text-alert font-bold uppercase tracking-wide mb-2">{t('for_small_biz.pain_before_label')}</p>
                  <p className="text-sm text-ink-body leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-raised border border-edge-lit rounded-2xl p-5">
                  <p className="text-xs text-ink-muted font-bold uppercase tracking-wide mb-2">{t('for_small_biz.pain_after_label')}</p>
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
          <p className="text-center text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_small_biz.features_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            {t('for_small_biz.features_title')}
          </h2>
          <p className="text-center text-ink-body text-sm mb-12 max-w-lg mx-auto">
            {t('for_small_biz.features_desc')}
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

      {/* ─── PRICING ─── */}
      <section className="bg-panel text-ink-high py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_small_biz.pricing_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_small_biz.pricing_title')}</h2>
          <p className="text-ink-body text-sm mb-12 max-w-lg mx-auto">
            {t('for_small_biz.pricing_desc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto mb-8">
            {PRICING.map((tier) => (
              <div key={tier.plan}
                className={`rounded-2xl p-6 border text-left ${tier.highlight
                  ? 'bg-raised border-edge-lit ring-1 ring-edge-lit'
                  : 'bg-panel border-edge'
                }`}>
                {tier.highlight && (
                  <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_small_biz.pricing_most_popular')}</p>
                )}
                <p className="text-sm font-extrabold mb-1">{tier.plan}</p>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-black">{tier.price}</span>
                  <span className="text-ink-body text-sm mb-1">{tier.period}</span>
                </div>
                <ul className="text-xs text-ink-body space-y-2 mb-6">
                  <li>✓ {tier.credits}</li>
                  <li>✓ {tier.posts}</li>
                  <li>✓ {tier.seats}</li>
                  <li>✓ {tier.window}</li>
                  <li>✓ {t('for_small_biz.pricing_feature_platforms')}</li>
                  <li>✓ {t('for_small_biz.pricing_feature_bio')}</li>
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

          {/* Comparison */}
          <div className="overflow-x-auto mt-12">
            <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-4">{t('for_small_biz.pricing_comparison_eyebrow')}</p>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-edge text-xs text-ink-muted uppercase tracking-wide">
                  <th className="py-3 pr-4">{t('for_small_biz.pricing_comparison_col_tool')}</th>
                  <th className="py-3 pr-4">{t('for_small_biz.pricing_comparison_col_monthly')}</th>
                  <th className="py-3 pr-4">{t('for_small_biz.pricing_comparison_col_platforms')}</th>
                  <th className="py-3 pr-4">{t('for_small_biz.pricing_comparison_col_ai')}</th>
                  <th className="py-3">{t('for_small_biz.pricing_comparison_col_free')}</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} className={`border-b border-edge ${row.highlight ? 'bg-raised' : ''}`}>
                    <td className={`py-3 pr-4 font-bold ${row.highlight ? 'text-ink-muted' : 'text-ink-body'}`}>
                      {row.tool} {row.highlight && '←'}
                    </td>
                    <td className={`py-3 pr-4 ${row.highlight ? 'text-ink-muted font-extrabold' : 'text-ink-body'}`}>{row.price}</td>
                    <td className={`py-3 pr-4 ${row.highlight ? 'text-ink-high font-bold' : 'text-ink-body'}`}>{row.platforms}</td>
                    <td className={`py-3 pr-4 ${row.highlight ? 'text-ink-high font-bold' : 'text-ink-body'}`}>{row.ai}</td>
                    <td className={`py-3 ${row.highlight ? 'text-ink-high font-bold' : 'text-ink-body'}`}>{row.free}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-ink-muted mt-3">{t('for_small_biz.pricing_comparison_note')}</p>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-void text-ink-high py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_small_biz.faq_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">{t('for_small_biz.faq_title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
      <section className="bg-gradient-to-b from-blue-950 to-black text-ink-high py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          {t('for_small_biz.bottom_title_1')}<br />{t('for_small_biz.bottom_title_2')}
        </h2>
        <p className="text-ink-body text-sm mb-8 max-w-md mx-auto">
          {t('for_small_biz.bottom_desc')}
        </p>
        <Link href="/signup"
          className="inline-block bg-raised hover:bg-raised text-ink-high font-bold px-10 py-4 rounded-xl text-sm transition-all">
          {t('for_small_biz.bottom_cta')}
        </Link>
        <p className="text-ink-muted text-xs mt-4">{t('for_small_biz.bottom_note')}</p>
      </section>

    </PublicLayout>
  )
}
