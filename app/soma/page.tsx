'use client'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'
import { Download, FolderKanban, RefreshCw, Rocket, ShieldCheck, Target, Zap } from 'lucide-react'
import { SOMA_MODE_LIMITS, SOMA_PLATFORMS, SOMA_PROJECT_LIMITS } from '@/lib/soma-mode'
import { SOMA_COSTS, SOMA_FULL_RUN_COST, SOMA_MONTHLY_CREDITS } from '@/lib/soma-costs'

// Every number on this page comes from the code that enforces it: limits from
// lib/soma-mode.ts, costs and monthly credits from lib/soma-costs.ts. This page
// used to promise 10 posts a day, 15 runs, "unlimited" Enterprise runs,
// Instagram and TikTok, and said SOMA spent your regular AI credits.
const L = SOMA_MODE_LIMITS

const STATS = [
  { value: String(SOMA_PLATFORMS.length),                    label: 'Platforms' },
  { value: '3',                                              label: 'Automation Modes' },
  { value: SOMA_MONTHLY_CREDITS.pro.toLocaleString('en-US'), label: 'SOMA Credits / Month on Pro' },
  { value: String(SOMA_FULL_RUN_COST),                       label: 'Credits per Full Run' },
]

const STEPS = [
  {
    number: '01',
    title: 'Add Your Master Doc',
    desc: 'Paste text, upload a .txt or .md file, or link a Google Doc, a GitHub file or a public web page. SOMA saves each version and compares it with the last one.',
  },
  {
    number: '02',
    title: 'SOMA Reads the Diff',
    desc: 'Gemini pulls out what changed: wins, themes, shifts, content angles. Project memory tracks what SOMA already covered, so it doesn\'t repeat itself.',
  },
  {
    number: '03',
    title: 'Posts Get Written',
    desc: 'Platform-native posts for every platform in the project. In Safe Mode they wait in your drafts for approval. On Autopilot and Full Send they\'re scheduled, and you can edit or delete any of them before it publishes.',
  },
]

const perDay = (n: number) => `Up to ${n} posts a day per platform`

const MODES = [
  {
    name: 'Safe Mode',
    icon: ShieldCheck,
    price: 'Included',
    priceSub: 'with Pro and Agency',
    badge: 'Start Here',
    badgeKey: null,
    border: 'border-2 border-jade/50',
    ctaStyle: 'bg-panel hover:bg-raised border border-edge text-ink-high font-extrabold',
    ctaLabel: 'Open SOMA',
    ctaHref: '/soma/dashboard',
    desc: 'SOMA writes the posts, you decide. Everything lands in your drafts to approve, edit or skip. Nothing goes out without you.',
    features: [
      `${L.safe.windowDays} days of posts per run`,
      perDay(L.safe.postsPerDay),
      `${L.safe.runsPerMonth} runs a month`,
      'Every post waits for your approval',
    ],
  },
  {
    name: 'Autopilot',
    icon: Zap,
    price: '$10',
    priceSub: 'a month, on top of Pro or Agency',
    badge: 'Most Popular',
    badgeKey: 'app_soma_landing.most_popular',
    border: 'border-2 border-amber-400',
    ctaStyle: 'bg-amber-400 hover:bg-amber-500 text-gray-900 font-extrabold',
    ctaLabel: 'Get Started',
    ctaHref: '/soma/dashboard',
    desc: 'SOMA writes and schedules for you, and runs by itself every Monday. Each post waits in your queue first, so you can edit or delete it before it goes out.',
    features: [
      `${L.autopilot.windowDays} days of posts per run`,
      perDay(L.autopilot.postsPerDay),
      `${L.autopilot.runsPerMonth} runs a month, Mondays included`,
      'Posts are scheduled automatically',
    ],
  },
  {
    name: 'Full Send',
    icon: Rocket,
    price: '$20',
    priceSub: 'a month, on top of Pro or Agency',
    badge: 'Full Autonomous',
    badgeKey: 'app_soma_landing.full_autonomous',
    border: 'border-2 border-amber-500',
    ctaStyle: 'bg-amber-600 hover:bg-amber-700 text-void font-extrabold',
    ctaLabel: 'Upgrade to Full Send',
    ctaHref: '/soma/dashboard',
    desc: `Everything in Autopilot, plus a run every day. Each run uses ${SOMA_COSTS.generate_week} SOMA credits, so a month of daily runs takes more than a plan includes. Credit packs cover the rest.`,
    features: [
      `${L.full_send.windowDays} days of posts per run`,
      perDay(L.full_send.postsPerDay),
      `${L.full_send.runsPerMonth} runs a month, plus a daily run`,
      'Posts are scheduled automatically',
    ],
  },
]

// The same rules the generator gives Gemini (app/api/soma/projects/[id]/generate/route.ts).
const PLATFORM_FORMATS: Record<(typeof SOMA_PLATFORMS)[number], { name: string; format: string }> = {
  twitter:  { name: 'X / Twitter', format: 'Punchy, 280 characters max, 2 hashtags at most. Counts toward your plan\'s X quota.' },
  bluesky:  { name: 'Bluesky',     format: 'Conversational, 300 characters max.' },
  mastodon: { name: 'Mastodon',    format: 'Community-native tone, 500 characters max.' },
  discord:  { name: 'Discord',     format: 'Casual announcement style.' },
  telegram: { name: 'Telegram',    format: 'Friendly and direct, can run a little longer.' },
  linkedin: { name: 'LinkedIn',    format: 'Professional but human, 3 to 6 sentences.' },
}
const PLATFORMS = SOMA_PLATFORMS.map(id => PLATFORM_FORMATS[id])

const FAQS = [
  {
    q: 'What is a master doc?',
    a: 'It\'s your weekly source of truth: a running doc where you capture what happened, what shipped, what changed. Think of it as a changelog for your life or business.',
  },
  {
    q: 'How does the diff work?',
    a: 'SOMA saves every version of your master doc. When you add a new one, Gemini compares it with the previous version and pulls out what\'s new. That difference is what the posts are about.',
  },
  {
    q: 'Can I use SOMA for multiple clients or projects?',
    a: `Yes. Each SOMA project has its own master doc history, memory, platforms and schedule. Pro includes ${SOMA_PROJECT_LIMITS.pro} project and Agency includes ${SOMA_PROJECT_LIMITS.agency}. Projects in a workspace share its voice profile.`,
  },
  {
    q: 'What does "platform-native" mean?',
    a: 'The same core message is rewritten for each platform: punchy for X, conversational for Bluesky, community-native for Mastodon, announcement style for Discord, direct for Telegram, professional for LinkedIn. You pick a project\'s platforms from the accounts you\'ve connected.',
  },
  {
    q: 'Will SOMA spam my followers?',
    a: `No. Every mode has hard caps: up to ${L.safe.postsPerDay}, ${L.autopilot.postsPerDay} or ${L.full_send.postsPerDay} posts a day per platform, a monthly run limit, and a credit check before every run. In Safe Mode nothing posts without your approval.`,
  },
  {
    q: 'What if I don\'t update my doc in a week?',
    a: 'On Autopilot and Full Send, SOMA runs on schedule anyway, working from your latest master doc and its memory of what it already covered. If you saved a link to your doc, SOMA checks it every Monday and reads the new version when it has changed. In Safe Mode nothing runs until you start it.',
  },
]

const CREDIT_ACTIONS = [
  { action: 'Read your master doc', credits: SOMA_COSTS.ingest_weekly,   desc: 'Gemini reads the new version and pulls out what changed since the last one. Also charged when the Monday run finds a saved link has changed.', icon: Download },
  { action: 'Generate a run',       credits: SOMA_COSTS.generate_week,   desc: `Posts for every platform in the project, ${L.safe.windowDays} to ${L.full_send.windowDays} days ahead depending on mode.`, icon: Zap },
]

export default function SomaLandingPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* ── HERO ── */}
        <section className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold mb-6 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {t('app_soma_landing.badge')}
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-6 leading-tight">
            {t('app_soma_landing.hero_headline')}<br className="hidden sm:block" />{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-500">
              {t('app_soma_landing.hero_emphasis')}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            {t('app_soma_landing.hero_sub')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/soma/dashboard"
              className="bg-amber-600 hover:bg-amber-700 text-void font-bold px-8 py-3.5 rounded-2xl transition-all text-sm w-full sm:w-auto text-center"
            >
              {t('app_soma_landing.open_dashboard')}
            </Link>
            <a
              href="#how-it-works"
              className="border-2 border-gray-300 dark:border-edge text-gray-700 dark:text-gray-300 font-bold px-8 py-3.5 rounded-2xl hover:border-amber-500 hover:text-amber-600 dark:hover:border-amber-500 dark:hover:text-amber-400 transition-all text-sm w-full sm:w-auto text-center"
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
                <span className="text-amber-500">◆</span> {item}
              </span>
            ))}
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="bg-transparent border border-edge rounded-2xl p-6 mb-20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:divide-x divide-white/10">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center py-2">
                <p className="text-3xl font-extrabold text-amber-400 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">{t('app_soma_landing.process_eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              {t('app_soma_landing.process_headline')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="relative bg-panel border border-edge rounded-2xl p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center mb-4">
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
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">{t('app_soma_landing.modes_eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              {t('app_soma_landing.modes_headline')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              {t('app_soma_landing.modes_sub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MODES.map(mode => (
              <div key={mode.name} className={`rounded-2xl p-6 flex flex-col bg-panel ${mode.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <mode.icon className="w-5 h-5 text-ink-high" strokeWidth={1.75} />
                    <h3 className="text-sm font-extrabold text-ink-high">{mode.name}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-300">
                    {mode.badgeKey ? t(mode.badgeKey) : mode.badge}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mb-4 flex-1 text-ink-muted">{mode.desc}</p>
                <ul className="space-y-2">
                  {mode.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-ink-muted">
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
          <div className="bg-transparent border border-edge rounded-2xl overflow-hidden">
            <div className="px-8 py-8 border-b border-edge">
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">{t('app_soma_landing.platforms_eyebrow')}</p>
              <h2 className="text-2xl font-extrabold text-white mb-2">{t('app_soma_landing.platforms_headline')}</h2>
              <p className="text-sm text-gray-400 max-w-xl">
                {t('app_soma_landing.platforms_sub')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {PLATFORMS.map((p) => (
                <div key={p.name} className="px-6 py-5 border-b border-r border-edge">
                  <p className="text-sm font-bold mb-1 flex items-center gap-2 text-amber-400">
                    <span>◆</span> {p.name}
                  </p>
                  <p className="text-xs text-gray-500">{p.format}</p>
                </div>
              ))}
            </div>
            <div className="px-8 py-4 bg-gray-900/40">
              <p className="text-xs text-gray-500">
                <span className="text-amber-400 font-semibold">{t('app_soma_landing.platform_live_note')}</span>{t('app_soma_landing.platform_live_desc')}
              </p>
            </div>
          </div>
        </section>

        {/* ── PROJECTS (AGENCY) ── */}
        <section id="projects" className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">{t('app_soma_landing.projects_eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              {t('app_soma_landing.projects_headline')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              {t('app_soma_landing.projects_sub')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: FolderKanban, title: 'Named Projects', desc: 'A project per client or brand, each with its own master doc history, memory and platforms.' },
              { icon: RefreshCw, title: 'Automatic Diffing', desc: 'SOMA auto-compares each new doc against the previous version. Drop in an update and the diff becomes the content.' },
              { icon: Target, title: 'Per-Project Schedules', desc: 'Different clients post on different platforms at different frequencies. Each project keeps its own schedule.' },
            ].map(f => (
              <div key={f.title} className="bg-panel border border-edge rounded-2xl p-6">
                <f.icon className="w-6 h-6 mb-3 text-ink-muted" strokeWidth={1.75} />
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-2">{f.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">{t('app_soma_landing.pricing_eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              {t('app_soma_landing.pricing_headline')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MODES.map(mode => (
              <div key={`pricing-${mode.name}`} className={`rounded-2xl p-6 flex flex-col bg-panel ${mode.border}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <mode.icon className="w-5 h-5 text-ink-high" strokeWidth={1.75} />
                    <h3 className="text-base font-extrabold text-ink-high">{mode.name}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-300">
                    {mode.badgeKey ? t(mode.badgeKey) : mode.badge}
                  </span>
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-ink-high">{mode.price}</span>
                </div>
                <p className="text-xs mb-5 text-ink-muted">{mode.priceSub}</p>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {mode.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-ink-muted">
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
          <p className="text-center text-xs text-ink-muted mt-6">
            SOMA comes with Pro and Agency; it isn&apos;t on the free plan.{' '}
            <Link href="/enterprise" className="font-semibold text-amber-400 hover:text-amber-300">Need custom limits for a team? Talk to us →</Link>
          </p>
        </section>

        {/* ── CREDIT COSTS ── */}
        <section id="credits" className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">{t('app_soma_landing.credits_eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              {t('app_soma_landing.credits_headline')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              {t('app_soma_landing.credits_sub')}
            </p>
          </div>

          <div className="bg-panel border border-edge rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-800">
              {CREDIT_ACTIONS.map(item => (
                <div key={item.action} className="p-6 flex items-start gap-4">
                  <item.icon className="w-6 h-6 flex-shrink-0 text-ink-muted" strokeWidth={1.75} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-extrabold text-gray-900 dark:text-white">{item.action}</p>
                      <span className="flex-shrink-0 text-sm font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full">
                        {item.credits} cr
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-panel/50 border-t border-edge">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{t('app_soma_landing.credits_full_run', { n: SOMA_FULL_RUN_COST })}</span>
                  {' '}{t('app_soma_landing.credits_pro_covers', {
                    pro: SOMA_MONTHLY_CREDITS.pro.toLocaleString('en-US'),
                    proRuns: Math.floor(SOMA_MONTHLY_CREDITS.pro / SOMA_FULL_RUN_COST),
                    agency: SOMA_MONTHLY_CREDITS.agency.toLocaleString('en-US'),
                    agencyRuns: Math.floor(SOMA_MONTHLY_CREDITS.agency / SOMA_FULL_RUN_COST),
                  })}
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold flex-shrink-0">
                  <span className="text-gray-500">{t('app_soma_landing.credits_packs_from')} <span className="text-amber-600 dark:text-amber-400">$4.99</span></span>
                  <a href="/pricing" className="text-amber-600 dark:text-amber-400 hover:underline">{t('app_soma_landing.credits_see_plans')}</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">{t('app_soma_landing.faq_eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              {t('app_soma_landing.faq_headline')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FAQS.map(faq => (
              <div key={faq.q} className="bg-panel border border-edge rounded-2xl p-6">
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
        <section className="border-t border-edge pt-12 text-center">
          <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-void text-lg font-extrabold mx-auto mb-4">
            J
          </div>
          <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-1">
            {t('app_soma_landing.built_by')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-5 leading-relaxed">
            {t('app_soma_landing.built_by_sub')}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/pricing" className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors">
              {t('app_soma_landing.socialmate_plans')}
            </Link>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}
