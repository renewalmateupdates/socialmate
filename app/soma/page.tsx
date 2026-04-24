import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

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
    included: 'Included with Pro',
    price: '$0',
    priceSub: 'Included with Pro plan',
    color: 'border-emerald-500/40 bg-emerald-950/20',
    labelColor: 'text-emerald-400',
    ctaStyle: 'border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-950/40',
    ctaLabel: 'Open Dashboard',
    ctaHref: '/soma/dashboard',
    disabled: false,
    desc: 'SOMA generates your content queue. You review and approve each post before anything goes live. Full control, zero risk.',
    features: [
      '7-day content window',
      '2 platforms',
      'Up to 2 posts/day',
      '4 generation runs/month',
      'Approve before posting',
    ],
  },
  {
    name: 'Autopilot',
    icon: '⚡',
    included: '$10/month',
    price: '$10',
    priceSub: '/month add-on',
    color: 'border-violet-500/40 bg-violet-950/20 ring-2 ring-violet-500/30 ring-offset-2 ring-offset-gray-950',
    labelColor: 'text-violet-400',
    badge: 'Most Popular',
    ctaStyle: 'bg-violet-600 hover:bg-violet-700 text-white',
    ctaLabel: 'Upgrade to Autopilot',
    ctaHref: '/soma/dashboard',
    disabled: false,
    desc: 'SOMA generates and auto-schedules. You get a notification to review but posts go live on schedule. Hands-off content marketing.',
    features: [
      '14-day content window',
      'All connected platforms',
      'Up to 5 posts/day',
      '8 generation runs/month',
      'Auto-schedules with notification',
    ],
  },
  {
    name: 'Full Send',
    icon: '🚀',
    included: '$20/month',
    price: '$20',
    priceSub: '/month add-on',
    color: 'border-amber-500/40 bg-amber-950/20',
    labelColor: 'text-amber-400',
    badge: 'Coming Soon',
    ctaStyle: 'bg-gray-800 text-gray-500 cursor-not-allowed',
    ctaLabel: 'Coming Soon',
    ctaHref: '#',
    disabled: true,
    desc: 'Maximum frequency. Drop your master doc, SOMA handles everything. Platform-native posts, optimized times, zero friction.',
    features: [
      '14-day content window',
      'All connected platforms',
      'Up to 10 posts/day',
      '12 generation runs/month',
      'Fully autonomous — no approval needed',
    ],
  },
]

const PLATFORMS = [
  { name: 'Twitter / X',  format: 'Punchy ≤280 chars' },
  { name: 'Bluesky',      format: 'Conversational ≤300 chars' },
  { name: 'LinkedIn',     format: 'Professional long-form' },
  { name: 'Mastodon',     format: 'Community-native tone' },
  { name: 'Instagram',    format: 'Caption + hashtags' },
  { name: 'Discord',      format: 'Server announcement style' },
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
    a: 'The same core message gets reformatted per platform. Twitter gets punchy ≤280 chars. LinkedIn gets professional long-form. Instagram gets captions with hashtags. One generation, native output everywhere.',
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
  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* ── HERO ── */}
        <section className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs font-bold mb-6 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            AI Marketing Agent
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-6 leading-tight">
            Your life has a changelog.<br className="hidden sm:block" />{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
              SOMA ships it.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            SOMA watches what changed week over week in your master doc and turns the delta into a
            platform-native content calendar. No brainstorming. No blank page. Just your story, told everywhere.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/soma/dashboard"
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all text-sm w-full sm:w-auto text-center"
            >
              Open SOMA Dashboard
            </Link>
            <a
              href="#how-it-works"
              className="border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold px-8 py-3.5 rounded-2xl hover:border-violet-500 hover:text-violet-600 dark:hover:border-violet-500 dark:hover:text-violet-400 transition-all text-sm w-full sm:w-auto text-center"
            >
              See How It Works
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400 dark:text-gray-500 font-medium">
            {[
              'Platform-native post generation',
              'Weekly master doc diffing',
              'Safe / Autopilot / Full Send modes',
              'Built by Gilgamesh Enterprise LLC',
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
            <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">The Process</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              How SOMA Works
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
            <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">Control Levels</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              You choose how much SOMA does
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              Start with Safe Mode on your Pro plan. Upgrade when you trust the agent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MODES.map(mode => (
              <div key={mode.name} className={`rounded-2xl border p-6 flex flex-col ${mode.color}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{mode.icon}</span>
                    <h3 className={`text-sm font-extrabold ${mode.labelColor}`}>{mode.name}</h3>
                  </div>
                  {mode.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10">
                      {mode.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4 flex-1">{mode.desc}</p>
                <ul className="space-y-2 mb-5">
                  {mode.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                      <span className={`flex-shrink-0 font-bold ${mode.labelColor}`}>◆</span> {f}
                    </li>
                  ))}
                </ul>
                <p className={`text-sm font-extrabold ${mode.labelColor}`}>{mode.included}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PLATFORM NATIVE ── */}
        <section id="platforms" className="mb-20">
          <div className="bg-black dark:bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-8 py-8 border-b border-gray-800">
              <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">Platform-Native Output</p>
              <h2 className="text-2xl font-extrabold text-white mb-2">One story. Every format.</h2>
              <p className="text-sm text-gray-400 max-w-xl">
                SOMA doesn&apos;t copy-paste the same post everywhere. It reformats your message natively
                for each platform — so it sounds right everywhere.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {PLATFORMS.map((p) => (
                <div key={p.name} className="px-6 py-5 border-b border-r border-gray-800">
                  <p className="text-sm font-bold text-violet-400 mb-1 flex items-center gap-2">
                    <span>◆</span> {p.name}
                  </p>
                  <p className="text-xs text-gray-500">{p.format}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROJECTS (AGENCY) ── */}
        <section id="projects" className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">For Agencies</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              One workspace. Multiple clients.
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              SOMA Projects let you run separate master doc pipelines per client — each with their own
              voice profile, platform settings, and content history.
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
            <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">Pricing</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              Start free with Pro. Scale when ready.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MODES.map(mode => (
              <div key={`pricing-${mode.name}`} className={`rounded-2xl border p-6 flex flex-col ${mode.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{mode.icon}</span>
                  <h3 className={`text-lg font-extrabold ${mode.labelColor}`}>{mode.name}</h3>
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-4xl font-extrabold ${mode.labelColor}`}>{mode.price}</span>
                  {mode.price !== '$0' && <span className="text-xs text-gray-400 mb-1.5">/mo</span>}
                </div>
                <p className="text-xs text-gray-400 mb-5">{mode.priceSub}</p>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {mode.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                      <span className={`flex-shrink-0 font-bold ${mode.labelColor}`}>◆</span> {f}
                    </li>
                  ))}
                </ul>
                {mode.disabled ? (
                  <button disabled className={`w-full text-center text-sm font-bold py-3 rounded-xl transition-all ${mode.ctaStyle}`}>
                    {mode.ctaLabel}
                  </button>
                ) : (
                  <Link href={mode.ctaHref} className={`w-full text-center text-sm font-bold py-3 rounded-xl transition-all block ${mode.ctaStyle}`}>
                    {mode.ctaLabel} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">FAQ</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              Questions answered.
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
                Responsible Posting Policy
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-3 text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              <p>
                <strong>SOMA is an automation tool — you are responsible for your content.</strong> Automated posting
                must comply with each platform&apos;s Terms of Service. Do not use SOMA to spam, harass, mislead,
                or post at volumes that could trigger platform rate limits or account restrictions.
              </p>
              <p>
                SOMA&apos;s daily and monthly caps are designed to keep your accounts healthy. Exceeding
                platform-recommended posting frequency — even within SOMA&apos;s limits — is at your own risk.
                SocialMate and Gilgamesh Enterprise LLC are not liable for account suspensions or restrictions
                resulting from your posting behavior.
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold pt-2 border-t border-amber-200 dark:border-amber-800">
                By enabling Autopilot or Full Send mode, you acknowledge that posts will go live automatically
                on your behalf and that you accept full responsibility for their content and timing.
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
            Built by Joshua Bostic — Gilgamesh Enterprise LLC
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-5 leading-relaxed">
            Solo founder. Bootstrapped. Building tools that give people the same marketing power that
            agencies charge thousands for — at prices that don&apos;t gatekeep.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/pricing" className="text-xs font-bold text-violet-500 hover:text-violet-400 transition-colors">
              SocialMate Plans →
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link href="/enki" className="text-xs font-bold text-violet-500 hover:text-violet-400 transition-colors">
              Enki Trading Agent →
            </Link>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}
