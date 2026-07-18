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
      name: 'Is LinkedIn scheduling free on SocialMate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. LinkedIn scheduling is free on every SocialMate plan including the free tier. Connect your LinkedIn profile at /accounts and start scheduling posts immediately — no credit card, no upgrade required.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does SocialMate use the official LinkedIn API?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. SocialMate uses LinkedIn\'s official OAuth 2.0 and UGC Posts API with the w_member_social scope. Posts publish directly to your LinkedIn profile through the official API — no automation workarounds, no browser extensions.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I schedule LinkedIn posts for multiple accounts?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Pro plan supports up to 5 connected accounts per platform. Agency plan supports up to 10. Each account appears separately in your compose window so you can target the right profile for each post.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the best time to post on LinkedIn?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Research shows Tuesday through Thursday, 8–10am and 12–1pm in your local timezone drives the highest engagement on LinkedIn. SocialMate\'s best times feature shows platform-specific recommendations and lets you auto-schedule to the optimal slot with one click.',
      },
    },
  ],
}

const LIVE_PLATFORMS = [
  { name: 'LinkedIn',    icon: '💼', note: 'Live — free', highlight: true  },
  { name: 'Bluesky',    icon: '🦋', note: 'Live',         highlight: false },
  { name: 'X / Twitter', icon: '🐦', note: 'Live',        highlight: false },
  { name: 'Mastodon',   icon: '🐘', note: 'Live',         highlight: false },
  { name: 'Discord',    icon: '💬', note: 'Live',         highlight: false },
  { name: 'Telegram',   icon: '✈️', note: 'Live',         highlight: false },
  { name: 'TikTok',     icon: '🎵', note: 'Live',         highlight: false },
]

const PAIN_POINTS = [
  {
    before: 'Open LinkedIn at 8am, stare at a blank box, give up and post nothing.',
    after:  'Write your week of LinkedIn posts on Sunday. They go out automatically.',
    icon: '📅',
  },
  {
    before: 'Pay $25–$99/month for a tool just to schedule LinkedIn posts.',
    after:  'Free on SocialMate. LinkedIn scheduling included on the free plan.',
    icon: '💸',
  },
  {
    before: 'LinkedIn, Bluesky, and X all need separate posting sessions.',
    after:  'Write once. Schedule to all 7 platforms simultaneously.',
    icon: '🚀',
  },
  {
    before: 'Stare at the cursor trying to write a LinkedIn hook that doesn\'t suck.',
    after:  'Click "Generate hook." Get 5 options in 3 seconds. Pick the best one.',
    icon: '✍️',
  },
]

const FEATURES = [
  {
    title: 'LinkedIn Post Scheduling',
    desc:  'Write your post, pick a date and time, hit schedule. SocialMate publishes directly to your LinkedIn profile using the official API at exactly the right moment.',
    icon:  '💼',
    badge: 'Free',
    live:  true,
  },
  {
    title: 'Best Time to Post on LinkedIn',
    desc:  'Data-driven recommendations for your best LinkedIn posting windows. Tue–Thu 8–10am and 12–1pm consistently outperforms other slots. One-click "Use best time" in the scheduler.',
    icon:  '⏰',
    badge: 'Free',
    live:  true,
  },
  {
    title: 'AI LinkedIn Hook Generator',
    desc:  'The first line determines whether anyone reads your post. Generate 5 scroll-stopping opening lines based on your content — pick the one that fits your voice.',
    icon:  '🎣',
    badge: '5 credits',
    live:  true,
  },
  {
    title: 'AI Caption & Rewriter',
    desc:  'Paste rough notes and get a polished LinkedIn-optimized post in seconds. The rewriter adjusts tone to professional-but-human — the LinkedIn sweet spot that actually gets engagement.',
    icon:  '✍️',
    badge: '5 credits',
    live:  true,
  },
  {
    title: 'Cross-Platform Posting',
    desc:  'LinkedIn is just one of 7 live platforms. Write once and simultaneously schedule to LinkedIn, Bluesky, X/Twitter, Mastodon, Discord, and Telegram from a single compose window.',
    icon:  '🌐',
    badge: 'Free',
    live:  true,
  },
  {
    title: 'Content Repurposer',
    desc:  'Turn a blog post, tweet, or TikTok caption into a LinkedIn-formatted long-form post in one click. 6 repurpose formats. Each generates content in the native style of the target platform.',
    icon:  '♻️',
    badge: '5 credits',
    live:  true,
  },
  {
    title: 'LinkedIn Post Queue',
    desc:  'Build a backlog of LinkedIn content that publishes on your schedule. Draft ideas throughout the week and let the queue handle the actual publishing at optimal times.',
    icon:  '📋',
    badge: 'Free',
    live:  true,
  },
  {
    title: 'SOMA AI Content System',
    desc:  'Feed SOMA your weekly update doc and it generates a full week of LinkedIn posts that sound like you — not generic AI output. Includes Voice DNA builder trained on your writing style.',
    icon:  '🧠',
    badge: 'Pro',
    live:  true,
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
    highlight: true,
    cta:     'Go Pro',
    href:    '/pricing',
  },
  {
    plan:    'Agency',
    price:   '$20',
    period:  '/month',
    credits: '2,000 AI credits/mo',
    posts:   '100 posts / month',
    seats:   '15 seats',
    highlight: false,
    cta:     'Go Agency',
    href:    '/pricing',
  },
]

const COMPARISON = [
  { tool: 'Hootsuite',        price: '$99/mo',  linkedin: '✓', free: '✗', ai: 'Add-on'   },
  { tool: 'Buffer',           price: '$18/mo',  linkedin: '✓', free: '✗', ai: 'Limited'  },
  { tool: 'Later',            price: '$25/mo',  linkedin: '✗', free: '✗', ai: 'Limited'  },
  { tool: 'Publer',           price: '$12/mo',  linkedin: '✓', free: '✗', ai: 'Limited'  },
  { tool: 'SocialMate',       price: '$0–$5/mo',linkedin: '✓', free: '✓', ai: '15+ tools', highlight: true },
]

const FAQ = [
  {
    q: 'Is LinkedIn scheduling really free on SocialMate?',
    a: 'Yes. LinkedIn scheduling is included on the free plan — no credit card, no upgrade required. Connect your LinkedIn profile at /accounts and start scheduling immediately.',
  },
  {
    q: 'Does it post directly to LinkedIn or use a workaround?',
    a: 'It uses LinkedIn\'s official OAuth 2.0 and UGC Posts API with w_member_social scope. Your posts publish directly to your LinkedIn profile through the official API. No browser automation, no third-party workarounds.',
  },
  {
    q: 'How long does the LinkedIn access token last?',
    a: 'LinkedIn access tokens last 60 days. After that you\'ll need to reconnect your account at /accounts — takes about 10 seconds. We\'ll add a reminder notification before your token expires.',
  },
  {
    q: 'Can I schedule posts for a LinkedIn Company Page?',
    a: 'Currently SocialMate schedules to personal LinkedIn profiles using the w_member_social scope. Company Page posting (r/w_organization_social) requires separate LinkedIn API approval and is on our roadmap.',
  },
  {
    q: 'What\'s the character limit for LinkedIn posts?',
    a: 'LinkedIn allows up to 3,000 characters per post. SocialMate enforces this limit in the compose window and shows you a character counter so you never get cut off.',
  },
  {
    q: 'Can I post images or videos to LinkedIn through SocialMate?',
    a: 'Text posts are fully supported now. Image and video attachments to LinkedIn are on the roadmap — the API supports them and we\'re building the upload flow.',
  },
  {
    q: 'What other platforms can I post to at the same time?',
    a: 'All 7 live platforms: LinkedIn, Bluesky, X/Twitter, Mastodon, Discord, Telegram, and TikTok. Write once, schedule everywhere in one compose window.',
  },
]

export default function LinkedInCreatorsPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ─── HERO ─── */}
      <section className="bg-void text-ink-high py-24 px-6 text-center">
        <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-4">{t('for_linkedin.api_badge')}</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          {t('for_linkedin.hero_title_1')}<br />
          <span className="text-ink-muted">{t('for_linkedin.hero_title_2')}</span>
        </h1>
        <p className="text-ink-body max-w-xl mx-auto text-base leading-relaxed mb-8">
          {t('for_linkedin.hero_desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/signup"
            className="bg-raised hover:bg-raised text-ink-high font-bold px-8 py-4 rounded-2xl transition-all text-base w-full sm:w-auto text-center"
          >
            {t('for_linkedin.hero_cta_primary')}
          </Link>
          <Link
            href="/accounts"
            className="border border-edge-lit text-ink-high font-semibold px-6 py-4 rounded-2xl hover:bg-panel transition-all text-sm w-full sm:w-auto text-center"
          >
            {t('for_linkedin.hero_cta_secondary')}
          </Link>
        </div>
        <p className="text-ink-muted text-xs mt-4">{t('for_linkedin.hero_note')}</p>
      </section>

      {/* ─── BEFORE / AFTER ─── */}
      <section className="bg-panel text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3 text-center">{t('for_linkedin.pain_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            {t('for_linkedin.pain_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="bg-panel border border-edge-lit rounded-2xl p-6">
                <div className="text-2xl mb-4">{p.icon}</div>
                <div className="space-y-3">
                  <div className="bg-alert/10 border border-alert/40 rounded-xl p-3">
                    <p className="text-xs font-bold text-alert uppercase tracking-widest mb-1">{t('for_linkedin.pain_before_label')}</p>
                    <p className="text-sm text-ink-body">{p.before}</p>
                  </div>
                  <div className="bg-jade/10 border border-jade/40 rounded-xl p-3">
                    <p className="text-xs font-bold text-jade uppercase tracking-widest mb-1">{t('for_linkedin.pain_after_label')}</p>
                    <p className="text-sm text-ink-body">{p.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-panel text-ink-high py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3 text-center">{t('for_linkedin.features_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            {t('for_linkedin.features_title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-panel border border-edge-lit rounded-2xl p-5 hover:border-edge-lit transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    f.badge === 'Free'
                      ? 'bg-jade/10 text-jade'
                      : f.badge === 'Pro'
                      ? 'bg-amber/10 text-amber'
                      : 'bg-raised text-ink-muted'
                  }`}>{f.badge}</span>
                </div>
                <h3 className="font-bold text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-ink-body leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORMS ─── */}
      <section className="bg-[#0a0a0a] text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_linkedin.platforms_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_linkedin.platforms_title')}</h2>
          <p className="text-ink-body text-sm mb-10">{t('for_linkedin.platforms_desc')}</p>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {LIVE_PLATFORMS.map((p) => (
              <div
                key={p.name}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${
                  p.highlight
                    ? 'bg-raised border-edge-lit text-ink-muted'
                    : 'bg-panel border-edge-lit text-ink-body'
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.name}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  p.highlight ? 'bg-raised text-ink-muted' : 'bg-jade/10 text-jade'
                }`}>{p.highlight ? t('for_linkedin.platforms_new_badge') : t('for_linkedin.platforms_live_badge')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON ─── */}
      <section className="bg-panel text-ink-high py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3 text-center">{t('for_linkedin.comparison_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-10">
            {t('for_linkedin.comparison_title')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge-lit">
                  <th className="text-left py-3 pr-4 text-ink-body font-semibold">{t('for_linkedin.comparison_col_tool')}</th>
                  <th className="text-center py-3 px-3 text-ink-body font-semibold">{t('for_linkedin.comparison_col_price')}</th>
                  <th className="text-center py-3 px-3 text-ink-body font-semibold">{t('for_linkedin.comparison_col_linkedin')}</th>
                  <th className="text-center py-3 px-3 text-ink-body font-semibold">{t('for_linkedin.comparison_col_platforms')}</th>
                  <th className="text-center py-3 px-3 text-ink-body font-semibold">{t('for_linkedin.comparison_col_ai')}</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.tool} className={`border-b border-edge-lit ${row.highlight ? 'bg-raised' : ''}`}>
                    <td className={`py-3 pr-4 font-semibold ${row.highlight ? 'text-ink-muted' : 'text-ink-high'}`}>
                      {row.tool} {row.highlight && <span className="text-xs text-ink-muted ml-1">← you are here</span>}
                    </td>
                    <td className="text-center py-3 px-3 text-ink-body">{row.price}</td>
                    <td className="text-center py-3 px-3">{row.linkedin === '✓' ? <span className="text-jade">✓</span> : <span className="text-alert">✗</span>}</td>
                    <td className="text-center py-3 px-3">{row.free === '✓' ? <span className="text-jade">✓</span> : <span className="text-alert">✗</span>}</td>
                    <td className="text-center py-3 px-3 text-ink-body">{row.ai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="bg-panel text-ink-high py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">{t('for_linkedin.pricing_eyebrow')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">{t('for_linkedin.pricing_title')}</h2>
          <p className="text-ink-body text-sm mb-10">{t('for_linkedin.pricing_desc')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {PRICING.map((tier) => (
              <div key={tier.plan} className={`rounded-2xl border p-6 text-left ${
                tier.highlight
                  ? 'bg-raised border-edge-lit'
                  : 'bg-panel border-edge-lit'
              }`}>
                <p className="text-xs font-bold text-ink-body uppercase tracking-widest mb-1">{tier.highlight ? t('for_linkedin.pricing_most_popular') : tier.plan}</p>
                <p className="text-3xl font-extrabold mb-0.5">{tier.price}</p>
                <p className="text-xs text-ink-body mb-4">{tier.period}</p>
                <ul className="text-xs text-ink-body space-y-2 mb-6">
                  <li>✓ {tier.credits}</li>
                  <li>✓ {tier.posts}</li>
                  <li>✓ {tier.seats}</li>
                  <li>✓ {t('for_linkedin.platforms_title')}</li>
                  <li>✓ LinkedIn scheduling</li>
                  <li>✓ AI hook + caption generator</li>
                </ul>
                <Link
                  href={tier.href}
                  className={`block text-center text-sm font-bold py-3 px-4 rounded-xl transition-all ${
                    tier.highlight
                      ? 'bg-raised hover:bg-raised text-ink-high'
                      : 'bg-panel hover:bg-panel text-ink-high'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-panel text-ink-high py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3 text-center">{t('for_linkedin.faq_eyebrow')}</p>
          <h2 className="text-2xl font-extrabold text-center mb-10">{t('for_linkedin.faq_title')}</h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="bg-panel border border-edge-lit rounded-2xl p-5">
                <p className="font-bold text-sm mb-2">{item.q}</p>
                <p className="text-xs text-ink-body leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-void text-ink-high py-20 px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
          {t('for_linkedin.bottom_title')}
        </h2>
        <p className="text-ink-body text-base max-w-xl mx-auto mb-8">
          {t('for_linkedin.bottom_desc')}
        </p>
        <Link
          href="/signup"
          className="inline-block bg-raised hover:bg-raised text-ink-high font-bold px-10 py-4 rounded-2xl transition-all text-base"
        >
          {t('for_linkedin.bottom_cta')}
        </Link>
        <p className="text-ink-muted text-xs mt-4">{t('for_linkedin.bottom_note')}</p>
      </section>

    </PublicLayout>
  )
}
