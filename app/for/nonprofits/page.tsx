'use client'

import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

const LIVE_PLATFORMS = [
  { name: 'Discord',    icon: '💬', note: 'Live' },
  { name: 'Telegram',   icon: '✈️', note: 'Live' },
  { name: 'Bluesky',   icon: '🦋', note: 'Live' },
  { name: 'Mastodon',   icon: '🐘', note: 'Live' },
  { name: 'LinkedIn',   icon: '💼', note: 'Live' },
  { name: 'X / Twitter', icon: '🐦', note: 'Live' },
  { name: 'TikTok',     icon: '🎵', note: 'Live' },
]

const COMING_PLATFORMS = [
  { name: 'Instagram', icon: '📸' },
  { name: 'Facebook',  icon: '📘' },
  { name: 'YouTube',   icon: '▶️' },
]

const PAIN_POINTS = [
  {
    before: 'Hootsuite wants $99/month. Buffer wants $18. You have $0 in your marketing budget.',
    after:  'SocialMate free plan: 50 AI credits, 7 platforms, post calendar. No credit card. No trial. Free forever.',
    icon: '💸',
  },
  {
    before: 'Volunteer social media manager posts for 2 weeks, goes quiet for a month. Engagement tanks.',
    after:  'Schedule a month of content in one session. Stays consistent whether volunteers are available or not.',
    icon: '📅',
  },
  {
    before: 'Your community is on Discord and Telegram. Most tools don\'t even support them.',
    after:  'SocialMate is one of very few schedulers that posts directly to Discord servers and Telegram channels.',
    icon: '💬',
  },
]

const FEATURES = [
  {
    title: 'Free Plan — No Credit Card Required',
    desc:  '50 AI credits, 7 live platforms, post calendar, drafts, link in bio, and 2 team seats. No payment information required. Free forever — not a trial.',
    icon:  '🎁',
    badge: 'Free',
  },
  {
    title: 'Discord & Telegram Scheduling',
    desc:  'Post to your Discord server and Telegram channel directly from SocialMate. Announcement updates, volunteer call-outs, fundraiser countdowns — all scheduled in advance.',
    icon:  '💬',
    badge: 'Free',
  },
  {
    title: 'SOMA AI Writes Cause-Based Content',
    desc:  'Tell SOMA your mission and audience — it generates donation ask posts, volunteer recruitment content, awareness campaign posts, and impact stories that align with your cause.',
    icon:  '🤖',
    badge: 'Free',
  },
  {
    title: 'SM-Give: 2% of Revenue Goes to Charity',
    desc:  "Every paying SocialMate subscription donates 2% to charity through SM-Give. When you use SocialMate Pro, you're not just saving money on tools — you're part of a platform that gives back.",
    icon:  '❤️',
    badge: 'Free',
  },
  {
    title: 'Link in Bio for Donation Pages',
    desc:  'Free link-in-bio page on all plans. Link your donation page, volunteer signup, petition, event registration, and impact report in one place. No Linktree subscription needed.',
    icon:  '🔗',
    badge: 'Free',
  },
  {
    title: 'Multi-Volunteer Team Access',
    desc:  'Add multiple volunteers and staff to one account. Free plan: 2 seats. Pro: 5 seats. Agency: 15 seats with client workspaces and approval workflows for content review.',
    icon:  '👥',
    badge: 'Free',
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
      '2 volunteer seats',
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
      '5 volunteer seats',
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
      '5 program workspaces',
      'All platforms + features',
      'Content approval workflows',
    ],
  },
]

const FAQ = [
  {
    q: 'Is the free plan really free with no credit card?',
    a: "Yes. The free plan requires no payment information at all. 50 AI credits/month, 7 live platforms, post calendar, drafts, link in bio, and 2 team seats. Free forever — not a trial that expires.",
  },
  {
    q: 'Do you offer a nonprofit discount?',
    a: "Yes. We have a NONPROFIT50 code that gets you 50% off the Pro plan — that's $2.50/month. It's an honor-system discount. Visit socialmate.studio/discount to apply it.",
  },
  {
    q: 'Can we post to Discord and Telegram from SocialMate?',
    a: "Yes. Both Discord and Telegram are fully live — SocialMate is one of very few scheduling tools that supports both. Connect your server/channel in Settings → Accounts and schedule posts directly.",
  },
  {
    q: 'What is SM-Give? How does SocialMate donate to charity?',
    a: "SM-Give is SocialMate's built-in charity initiative. 2% of every Pro and Agency subscription payment goes into the SM-Give fund. It's not marketing — it's in the code. You can see the live fund tracker at socialmate.studio/give.",
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

export default function NonprofitsPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ─── HERO ─── */}
      <section className="bg-black text-white py-24 px-6 text-center">
        <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4">{t('for_nonprofits.eyebrow')}</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          {t('for_nonprofits.hero_title_1')}<br />
          <span className="text-rose-400">{t('for_nonprofits.hero_title_2')}</span>
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto text-base leading-relaxed mb-8">
          {t('for_nonprofits.hero_desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/signup"
            className="bg-rose-500 hover:bg-rose-400 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_nonprofits.hero_cta_primary')}
          </Link>
          <Link href="/discount"
            className="border border-gray-700 hover:border-gray-400 text-gray-300 hover:text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            {t('for_nonprofits.hero_cta_secondary')}
          </Link>
        </div>
        <p className="text-gray-500 text-xs mt-4">{t('for_nonprofits.hero_note')}</p>
      </section>

      {/* ─── SM-GIVE CALLOUT ─── */}
      <section className="bg-rose-950/30 border-y border-rose-900/50 text-white py-8 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <span className="text-4xl flex-shrink-0">❤️</span>
          <div>
            <p className="text-sm font-extrabold text-rose-300 mb-1">SocialMate gives back — SM-Give</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              2% of every SocialMate subscription goes to charity through SM-Give. When you use SocialMate, you&apos;re
              supporting a platform that believes in giving back — just like your organization does.{' '}
              <Link href="/give" className="text-rose-400 hover:text-rose-300 underline">See the live fund →</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('for_nonprofits.pain_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            {t('for_nonprofits.pain_title')}
          </h2>
          <div className="space-y-5">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-xs text-red-400 font-bold uppercase tracking-wide mb-2">{t('for_nonprofits.pain_before_label')}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-rose-950/40 border border-rose-800/50 rounded-2xl p-5">
                  <p className="text-xs text-rose-300 font-bold uppercase tracking-wide mb-2">{t('for_nonprofits.pain_after_label')}</p>
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
          <p className="text-center text-xs font-bold text-rose-400 uppercase tracking-widest mb-3">{t('for_nonprofits.features_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            {t('for_nonprofits.features_title')}
          </h2>
          <p className="text-center text-gray-400 text-sm mb-12 max-w-xl mx-auto">
            {t('for_nonprofits.features_desc')}
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
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('for_nonprofits.platforms_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_nonprofits.platforms_title')}</h2>
          <p className="text-gray-400 text-sm mb-8">{t('for_nonprofits.platforms_desc')}</p>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {LIVE_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold">{p.name}</span>
                <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full font-bold">{t('for_nonprofits.platforms_live_badge')}</span>
              </div>
            ))}
          </div>
          <h3 className="text-base font-extrabold text-gray-400 mb-4">{t('for_nonprofits.platforms_coming_title')}</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {COMING_PLATFORMS.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 opacity-60">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-bold text-gray-400">{p.name}</span>
                <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full font-bold">{t('for_nonprofits.platforms_coming_badge')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('for_nonprofits.pricing_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_nonprofits.pricing_title')}</h2>
          <p className="text-gray-400 text-sm mb-12">{t('for_nonprofits.pricing_desc')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PRICING.map((tier) => (
              <div key={tier.plan}
                className={`rounded-2xl p-6 border text-left ${tier.highlight
                  ? 'bg-rose-950/40 border-rose-700 ring-1 ring-rose-500'
                  : 'bg-gray-900 border-gray-800'
                }`}>
                {tier.highlight && (
                  <p className="text-xs font-bold text-rose-300 uppercase tracking-widest mb-3">{t('for_nonprofits.pricing_most_popular')}</p>
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
                    ? 'bg-rose-500 hover:bg-rose-400 text-white'
                    : 'bg-white text-black hover:opacity-80'
                  }`}>
                  {tier.cta} →
                </Link>
              </div>
            ))}
          </div>
          <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-4 max-w-md mx-auto">
            <p className="text-sm font-bold text-rose-300 mb-1">🎁 Nonprofit discount</p>
            <p className="text-xs text-gray-400">Use code <span className="font-mono font-bold text-white">NONPROFIT50</span> at checkout for 50% off Pro — that&apos;s $2.50/month. Honor system. No verification required.</p>
            <Link href="/discount" className="text-xs text-rose-400 hover:text-rose-300 underline mt-2 block">
              See all discounts →
            </Link>
          </div>
          <p className="text-gray-500 text-xs mt-6">{t('for_nonprofits.pricing_note')}</p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('for_nonprofits.faq_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">{t('for_nonprofits.faq_title')}</h2>
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
      <section className="bg-gradient-to-b from-rose-950 to-black text-white py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          {t('for_nonprofits.bottom_title')}
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          {t('for_nonprofits.bottom_desc')}
        </p>
        <Link href="/signup"
          className="inline-block bg-rose-500 hover:bg-rose-400 text-white font-bold px-10 py-4 rounded-xl text-sm transition-all">
          {t('for_nonprofits.bottom_cta')}
        </Link>
        <p className="text-gray-600 text-xs mt-4">{t('for_nonprofits.bottom_note')}</p>
      </section>

    </PublicLayout>
  )
}
