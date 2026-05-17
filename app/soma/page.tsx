'use client'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

const STATS = [
  { value: '3',    label: 'Posting Modes' },
  { value: '6+',   label: 'Platforms' },
  { value: '21',   label: 'Posts / Week' },
  { value: '$0',   label: 'Setup Cost' },
]

const STEPS = [
  {
    number: '01',
    title: 'Upload Your Master Doc',
    desc: 'Paste text, upload a .txt/.md file, or link a public URL (Notion, Google Doc). SOMA saves it and compares it against last week\'s version automatically.',
  },
  {
    number: '02',
    title: 'SOMA Reads the Diff',
    desc: 'Gemini extracts what changed — wins, themes, directional shifts, content angles. The delta between this week and last week is the story.',
  },
  {
    number: '03',
    title: 'Content Goes Live',
    desc: 'Platform-native posts are generated and scheduled. You approve in Safe Mode, auto-post with Autopilot, or set-and-forget with Full Send.',
  },
]

const MODES = [
  {
    name: 'Safe Mode',
    icon: '🟢',
    price: '$0',
    priceSub: 'Included with Pro plan',
    badge: 'Included Free',
    badgeKey: 'app_soma_landing.included_free',
    cardBg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-2 border-emerald-400',
    headerText: 'text-gray-900 dark:text-white',
    subText: 'text-gray-500 dark:text-gray-400',
    badgeStyle: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    ctaStyle: 'border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
    ctaLabel: 'Open Dashboard',
    ctaHref: '/soma/dashboard',
    desc: 'SOMA generates your content queue. You review and approve each post before anything goes live. Full control, zero risk.',
    features: [
      '7-day content window',
      'Up to 2 posts/day',
      '4 generation runs/month',
      'All connected platforms',
      'Approve before posting',
    ],
  },
  {
    name: 'Autopilot',
    icon: '⚡',
    price: '$10',
    priceSub: '/month add-on',
    badge: 'Most Popular',
    badgeKey: 'app_soma_landing.most_popular',
    cardBg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-2 border-amber-400',
    headerText: 'text-gray-900 dark:text-white',
    subText: 'text-gray-500 dark:text-gray-400',
    badgeStyle: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    ctaStyle: 'bg-amber-400 hover:bg-amber-500 text-gray-900 font-extrabold',
    ctaLabel: 'Upgrade to Autopilot',
    ctaHref: '/soma/dashboard',
    desc: 'SOMA generates and auto-schedules. You get a notification to review but posts go live on schedule. Hands-off content marketing.',
    features: [
      '14-day content window',
      'Up to 5 posts/day',
      '8 generation runs/month',
      'All connected platforms',
      'Auto-schedules with notification',
    ],
  },
  {
    name: 'Full Send',
    icon: '🚀',
    price: '$20',
    priceSub: '/month add-on',
    badge: 'Full Autonomous',
    badgeKey: 'app_soma_landing.full_autonomous',
    cardBg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-2 border-purple-500',
    headerText: 'text-gray-900 dark:text-white',
    subText: 'text-gray-500 dark:text-gray-400',
    badgeStyle: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    ctaStyle: 'bg-purple-600 hover:bg-purple-700 text-white font-extrabold',
    ctaLabel: 'Upgrade to Full Send',
    ctaHref: '/soma/dashboard',
    desc: 'Maximum frequency. Drop your master doc, SOMA handles everything. Platform-native posts, optimized times, zero friction.',
    features: [
      '14-day content window',
      'Up to 10 posts/day',
      '12 generation runs/month',
      'All connected platforms',
      'Fully autonomous — no approval needed',
    ],
  },
]

const PLATFORMS = [
  { name: 'Twitter / X',  format: 'Punchy ≤280 chars. Max 2 hashtags.',      live: true  },
  { name: 'Bluesky',      format: 'Conversational ≤300 chars.',               live: true  },
  { name: 'Mastodon',     format: 'Community-native tone. ≤500 chars.',       live: true  },
  { name: 'Discord',      format: 'Server announcement style.',                live: true  },
  { name: 'Telegram',     format: 'Clean, direct copy.',                      live: true  },
  { name: 'LinkedIn',     format: 'Professional long-form. 3-6 sentences.',   live: false },
  { name: 'Instagram',    format: 'Caption + 5-8 hashtags.',                  live: false },
  { name: 'TikTok',       format: 'Short punchy caption for video.',          live: false },
]

const FAQS = [
  {
    q: 'What is a master doc?',
    a: 'It\'s your weekly source of truth — a running doc where you capture what happened, what shipped, what changed. Think of it like a changelog for your life or business.',
  },
  {
    q: 'How does the diff work?',
    a: 'SOMA saves each week\'s master doc. When you submit a new one, Gemini compares it to the previous version and extracts what\'s new — wins, themes, shifts. That delta becomes the content.',
  },
  {
    q: 'Can I use SOMA for multiple clients or projects?',
    a: 'Yes. SOMA Projects let you create named projects, each with their own master doc history, platform settings, and voice profile. Agencies can manage multiple clients from one workspace.',
  },
  {
    q: 'What does "platform-native" mean?',
    a: 'The same core message gets reformatted per platform. Twitter gets punchy ≤280 chars. Bluesky gets conversational copy. Mastodon gets community-native tone. Discord gets announcement style. For platforms coming soon (LinkedIn, Instagram, TikTok), SOMA generates the content anyway — you can copy and post manually, or it auto-queues once that platform connects.',
  },
  {
    q: 'Will SOMA spam my followers?',
    a: 'No. Every tier has hard daily and monthly caps — Full Send maxes at 10 posts/day. SOMA is built around sustainable posting, not volume blasting. We\'ll also warn you if you approach platform-recommended limits.',
  },
  {
    q: 'What if I don\'t post anything in a week?',
    a: 'SOMA still generates content — it uses your voice profile and last known themes to keep the calendar consistent. You can always review and skip anything that doesn\'t fit.',
  },
]

export default function SomaLandingPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* ── HERO ── */}
        <section className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs font-bold mb-6 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            {t('app_soma_landing.badge')}
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-6 leading-tight">
            {t('app_soma_landing.hero_headline')}<br className="hidden sm:block" />{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
              {t('app_soma_landing.hero_emphasis')}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            {t('app_soma_landing.hero_sub')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/soma/dashboard"
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all text-sm w-full sm:w-auto text-center"
            >
              {t('app_soma_landing.open_dashboard')}
            </Link>
            <a
              href="#how-it-works"
              className="border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold px-8 py-3.5 rounded-2xl hover:border-violet-500 hover:text-violet-600 dark:hover:border-violet-500 dark:hover:text-violet-400 transition-all text-sm w-full sm:w-auto text-center"
            >
              {t('app_soma_landing.see_how')}
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400 dark:text-gray-500 font-medium">
            {[
              t('app_soma_landing.trust_1'),
              t('app_soma_landing.trust_2'),
              t('app_soma_landing.trust_3'),
              t('app_soma_landing.trust_4'),
            ].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="text-violet-500">◆</span> {item}
              </span>
            ))}
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="bg-black dark:bg-gray-950 border border-gray-800 rounded-2xl p-6 mb-20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:divide-x divide-white/10">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center py-2">
                <p className="text-3xl font-extrabold text-violet-400 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">{t('app_soma_landing.process_eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              {t('app_soma_landing.process_headline')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center mb-4">
                  <span className="text-xs font-extrabold text-white">{step.number}</span>
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-2">{step.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-gray-200 dark:bg-gray-700" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── THREE MODES ── */}
        <section id="modes" className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">{t('app_soma_landing.modes_eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              {t('app_soma_landing.modes_headline')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              {t('app_soma_landing.modes_sub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MODES.map(mode => (
              <div key={mode.name} className={`rounded-2xl p-6 flex flex-col ${mode.cardBg} ${mode.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{mode.icon}</span>
                    <h3 className={`text-sm font-extrabold ${mode.headerText}`}>{mode.name}</h3>
                  </div>
                  {mode.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mode.badgeStyle}`}>
                      {t(mode.badgeKey!)}
                    </span>
                  )}
                </div>
                <p className={`text-xs leading-relaxed mb-4 flex-1 ${mode.subText}`}>{mode.desc}</p>
                <ul className="space-y-2">
                  {mode.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-xs ${mode.subText}`}>
                      <span className="flex-shrink-0 text-emerald-500 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── PLATFORM NATIVE ── */}
        <section id="platforms" className="mb-20">
          <div className="bg-black dark:bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-8 py-8 border-b border-gray-800">
              <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">{t('app_soma_landing.platforms_eyebrow')}</p>
              <h2 className="text-2xl font-extrabold text-white mb-2">{t('app_soma_landing.platforms_headline')}</h2>
              <p className="text-sm text-gray-400 max-w-xl">
                {t('app_soma_landing.platforms_sub')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              {PLATFORMS.map((p) => (
                <div key={p.name} className="px-6 py-5 border-b border-r border-gray-800">
                  <p className={`text-sm font-bold mb-1 flex items-center gap-2 ${p.live ? 'text-violet-400' : 'text-gray-600'}`}>
                    <span>{p.live ? '◆' : '○'}</span> {p.name}
                    {!p.live && <span className="text-[10px] font-semibold bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">{t('app_soma_landing.platform_soon_badge')}</span>}
                  </p>
                  <p className="text-xs text-gray-500">{p.format}</p>
                </div>
              ))}
            </div>
            <div className="px-8 py-4 border-t border-gray-800 bg-gray-900/40">
              <p className="text-xs text-gray-500">
                <span className="text-violet-400 font-semibold">{t('app_soma_landing.platform_live_note')}</span>{t('app_soma_landing.platform_live_desc')}{' '}
                <span className="text-gray-400 font-semibold">{t('app_soma_landing.platform_soon_note')}</span>{t('app_soma_landing.platform_soon_desc')}
              </p>
            </div>
          </div>
        </section>

        {/* ── PROJECTS (AGENCY) ── */}
        <section id="projects" className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">{t('app_soma_landing.projects_eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              {t('app_soma_landing.projects_headline')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              {t('app_soma_landing.projects_sub')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: '📁', title: 'Named Projects', desc: 'Create a project per client or brand. Each has its own master doc history, voice profile, and platform selections.' },
              { icon: '🔄', title: 'Automatic Diffing', desc: 'SOMA auto-compares each new doc against the previous version. Drop in an update and the diff becomes the content.' },
              { icon: '🎯', title: 'Per-Project Settings', desc: 'Different clients post on different platforms at different frequencies. SOMA respects each project\'s settings independently.' },
            ].map(f => (
              <div key={f.title} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <p className="text-2xl mb-3">{f.icon}</p>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-2">{f.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">{t('app_soma_landing.pricing_eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              {t('app_soma_landing.pricing_headline')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MODES.map(mode => (
              <div key={`pricing-${mode.name}`} className={`rounded-2xl p-6 flex flex-col ${mode.cardBg} ${mode.border}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{mode.icon}</span>
                    <h3 className={`text-base font-extrabold ${mode.headerText}`}>{mode.name}</h3>
                  </div>
                  {mode.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mode.badgeStyle}`}>
                      {t(mode.badgeKey!)}
                    </span>
                  )}
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-4xl font-extrabold ${mode.headerText}`}>{mode.price}</span>
                  {mode.price !== '$0' && <span className={`text-xs mb-1.5 ${mode.subText}`}>/mo</span>}
                </div>
                <p className={`text-xs mb-5 ${mode.subText}`}>{mode.priceSub}</p>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {mode.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-xs ${mode.subText}`}>
                      <span className="flex-shrink-0 text-emerald-500 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={mode.ctaHref} className={`w-full text-center text-sm font-bold py-3 rounded-xl transition-all block ${mode.ctaStyle}`}>
                  {mode.ctaLabel} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── CREDIT COSTS ── */}
        <section id="credits" className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">{t('app_soma_landing.credits_eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              {t('app_soma_landing.credits_headline')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              {t('app_soma_landing.credits_sub')}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-800">
              {[
                { action: 'Ingest master doc', credits: 25, desc: 'AI reads your doc, extracts themes, diffs against last week', icon: '📥' },
                { action: 'Generate full week', credits: 75, desc: 'Platform-native posts for all connected platforms, 7–14 days', icon: '⚡' },
                { action: 'Update voice profile', credits: 15, desc: 'Refresh SOMA\'s understanding of your tone and style', icon: '🎙️' },
                { action: 'Generate single post', credits: 5, desc: 'One-off post generation outside the weekly cycle', icon: '✍️' },
              ].map(item => (
                <div key={item.action} className="p-6 flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-extrabold text-gray-900 dark:text-white">{item.action}</p>
                      <span className="flex-shrink-0 text-sm font-extrabold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2.5 py-0.5 rounded-full">
                        {item.credits} cr
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{t('app_soma_landing.credits_full_run')}</span>
                  {' '}{t('app_soma_landing.credits_pro_covers')}
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold flex-shrink-0">
                  <span className="text-gray-500">{t('app_soma_landing.credits_packs_from')} <span className="text-violet-600 dark:text-violet-400">$1.99</span></span>
                  <a href="/pricing" className="text-violet-600 dark:text-violet-400 hover:underline">{t('app_soma_landing.credits_see_plans')}</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">{t('app_soma_landing.faq_eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              {t('app_soma_landing.faq_headline')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FAQS.map(faq => (
              <div key={faq.q} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-2">{faq.q}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── RESPONSIBLE USE DISCLAIMER ── */}
        <section className="mb-20">
          <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-8">
            <div className="text-center mb-4">
              <p className="text-base font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                {t('app_soma_landing.responsible_eyebrow')}
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-3 text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              <p>
                <strong>{t('app_soma_landing.responsible_p1')}</strong>
              </p>
              <p>
                {t('app_soma_landing.responsible_p2')}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold pt-2 border-t border-amber-200 dark:border-amber-800">
                {t('app_soma_landing.responsible_fine')}
              </p>
            </div>
          </div>
        </section>

        {/* ── BUILT BY ── */}
        <section className="border-t border-gray-100 dark:border-gray-800 pt-12 text-center">
          <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center text-white text-lg font-extrabold mx-auto mb-4">
            J
          </div>
          <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-1">
            {t('app_soma_landing.built_by')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-5 leading-relaxed">
            {t('app_soma_landing.built_by_sub')}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/pricing" className="text-xs font-bold text-violet-500 hover:text-violet-400 transition-colors">
              {t('app_soma_landing.socialmate_plans')}
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link href="/enki" className="text-xs font-bold text-violet-500 hover:text-violet-400 transition-colors">
              {t('app_soma_landing.enki_link')}
            </Link>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}
