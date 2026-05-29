import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

const STATS = [
  { value: '$0',    label: 'Setup Cost' },
  { value: '3',     label: 'Outreach Channels' },
  { value: '4-step', label: 'Auto Sequence' },
  { value: '$15',   label: 'vs $99 elsewhere' },
]

const STEPS = [
  {
    number: '01',
    icon: '🎯',
    title: 'Create a Campaign',
    desc: 'Name it, set your goal, describe your target persona. HERMES uses this context to write messages that sound like you — not a template.',
  },
  {
    number: '02',
    icon: '🔭',
    title: 'Auto-Discover Prospects',
    desc: 'HERMES scrapes Substack, GitHub, Dev.to, and Hashnode for leads matching your keyword. Extracts emails from public profiles. Zero paid APIs required.',
  },
  {
    number: '03',
    icon: '✍️',
    title: 'AI Writes Every Message',
    desc: 'Gemini generates a personalized intro for each prospect based on their work, company, and your goal. You review in Draft mode or let it run on Auto.',
  },
  {
    number: '04',
    icon: '⚡',
    title: 'Sequence Runs Itself',
    desc: 'Intro → Follow-up 1 → Follow-up 2 → Break-up. HERMES tracks where each prospect is and fires the next step automatically on your schedule.',
  },
]

const CHANNELS = [
  {
    icon: '📧',
    name: 'Email',
    desc: 'Hunter.io finds verified emails. Resend delivers beautifully formatted HTML. Full 4-step sequence with automated follow-ups.',
    badge: 'Best for agencies',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    icon: '🦋',
    name: 'Bluesky DM',
    desc: 'Resolves handles to DIDs via AT Protocol. Sends via chat.bsky.convo — a real direct message, not a mention.',
    badge: 'Best for creators',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    icon: '🐘',
    name: 'Mastodon DM',
    desc: 'Direct message via visibility:direct on any Mastodon instance. Reaches open-source communities and indie devs.',
    badge: 'Best for devs',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
]

const COMPETITORS = [
  { name: 'Apollo.io',    price: '$49–$99/mo', channels: 'Email + LinkedIn', ai: 'Extra', discover: '✅', seq: '✅' },
  { name: 'Lemlist',      price: '$59/mo',     channels: 'Email only',       ai: '✅',    discover: '❌', seq: '✅' },
  { name: 'Instantly',    price: '$37/mo',     channels: 'Email only',       ai: '❌',    discover: '❌', seq: '✅' },
  { name: 'Reply.io',     price: '$60/mo',     channels: 'Email + LinkedIn', ai: 'Extra', discover: '❌', seq: '✅' },
  { name: 'HERMES',       price: '$15/mo',     channels: 'Email + Bluesky + Mastodon', ai: '✅ Included', discover: '✅ Free', seq: '✅', highlight: true },
]

const TIERS = [
  {
    name: 'Pro',
    icon: '🏹',
    price: 'Included',
    priceSub: 'with Pro plan ($5/mo)',
    badge: 'Starter',
    cardBg: 'bg-gray-900',
    border: 'border-2 border-gray-700',
    badgeStyle: 'bg-gray-700 text-gray-300',
    ctaStyle: 'border-2 border-gray-600 text-gray-300 hover:border-amber-400 hover:text-amber-400',
    ctaLabel: 'Join Waitlist',
    features: [
      '1 active campaign',
      '25 prospects / month',
      'Email + Bluesky channels',
      'Manual prospect add only',
      'Draft mode only',
    ],
  },
  {
    name: 'Agency',
    icon: '⚡',
    price: 'Included',
    priceSub: 'with Agency plan ($20/mo)',
    badge: 'Most Popular',
    cardBg: 'bg-amber-950/20',
    border: 'border-2 border-amber-400',
    badgeStyle: 'bg-amber-400/20 text-amber-400',
    ctaStyle: 'bg-amber-400 hover:bg-amber-300 text-black font-extrabold',
    ctaLabel: 'Join Waitlist',
    features: [
      '5 active campaigns',
      '150 prospects / month',
      'All 3 channels',
      'Auto-discover (Substack, GitHub, Dev.to, Hashnode)',
      'Draft + Auto-send modes',
    ],
  },
  {
    name: 'HERMES Pro',
    icon: '🚀',
    price: '$15',
    priceSub: '/month add-on',
    badge: 'Full Power',
    cardBg: 'bg-orange-950/20',
    border: 'border-2 border-orange-500',
    badgeStyle: 'bg-orange-500/20 text-orange-400',
    ctaStyle: 'bg-orange-500 hover:bg-orange-400 text-white font-extrabold',
    ctaLabel: 'Join Waitlist',
    features: [
      'Unlimited campaigns',
      'Unlimited prospects',
      'All 3 channels',
      'Weekly auto-discover cron',
      'Full Auto-send + analytics',
    ],
  },
]

const FAQS = [
  {
    q: 'How does Auto-Discover work?',
    a: 'HERMES scrapes Substack leaderboards, GitHub user search, Dev.to articles, and Hashnode posts for people matching your keyword. It extracts emails from public profile pages. No paid APIs — no per-lead cost.',
  },
  {
    q: 'How does it personalize messages?',
    a: 'Gemini reads the prospect\'s name, company, source, and your campaign persona description — then writes a message tailored to them. Not a mail merge. An actual AI-written intro based on context.',
  },
  {
    q: 'What\'s the 4-step sequence?',
    a: 'Intro → Follow-up 1 → Follow-up 2 → Break-up. You set the day intervals (default: Day 0 / 3 / 7). HERMES tracks each prospect\'s position and generates the next step automatically on schedule.',
  },
  {
    q: 'Can I edit messages before sending?',
    a: 'Yes. Draft Mode generates every message for your review. You can edit subject, body, or delete it before hitting Send. Auto mode sends on schedule without review — your call.',
  },
  {
    q: 'Does this work for agencies reaching out to clients?',
    a: 'That\'s the primary use case. Run a campaign targeting freelance social media managers or small agencies, auto-discover from Substack or GitHub, and let HERMES pitch SocialMate\'s Agency plan on autopilot.',
  },
  {
    q: 'When is HERMES available to users?',
    a: 'Currently in private beta — being used internally to prove the system before rollout. Join the waitlist to be notified when it opens up. Agency plan users get first access.',
  },
]

export default function HermesLandingPage() {
  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* ── HERO ── */}
        <section className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-6 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Cold Outreach — Now in Private Beta
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-6 leading-tight">
            The cold outreach tool that<br className="hidden sm:block" />{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              doesn&apos;t cost $99/month.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            HERMES finds your prospects, writes personalized outreach, and runs a 4-step sequence across email, Bluesky, and Mastodon — automatically. Apollo charges $99/mo for less.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/signup"
              className="bg-amber-400 hover:bg-amber-300 text-black font-extrabold px-8 py-3.5 rounded-2xl transition-all text-sm w-full sm:w-auto text-center shadow-lg shadow-amber-400/20">
              Join the Waitlist →
            </Link>
            <a
              href="#how-it-works"
              className="border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold px-8 py-3.5 rounded-2xl hover:border-amber-400 hover:text-amber-500 dark:hover:text-amber-400 transition-all text-sm w-full sm:w-auto text-center">
              See How It Works
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400 dark:text-gray-500 font-medium">
            {[
              'No per-lead fees',
              'AI writes every message',
              'Auto-discovers prospects free',
              '4-step sequence on autopilot',
            ].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="text-amber-500">◆</span> {item}
              </span>
            ))}
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="bg-black dark:bg-gray-950 border border-gray-800 rounded-2xl p-6 mb-20">
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
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">The System</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              Set it up once. Runs forever.
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              From zero to a running outreach sequence in under 10 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((step, i) => (
              <div key={i} className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-xs font-extrabold text-amber-400">
                    {step.number}
                  </div>
                  <span className="text-xl">{step.icon}</span>
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-2">{step.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gray-200 dark:bg-gray-700" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── CHANNELS ── */}
        <section id="channels" className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Outreach Channels</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              3 channels. 0 extra fees.
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              Most tools charge $99/mo for email alone. HERMES gives you three channels at a fraction of the cost.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CHANNELS.map(ch => (
              <div key={ch.name} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{ch.icon}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${ch.badgeColor}`}>{ch.badge}</span>
                </div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-2">{ch.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{ch.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── COMPETITOR TABLE ── */}
        <section id="compare" className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">The Honest Comparison</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              We&apos;re ruining the pricing.
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              The same outreach tools charge $37–$99/month. HERMES is $15. Included free with Agency.
            </p>
          </div>

          <div className="bg-black dark:bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Tool</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Price</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Channels</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">AI Writing</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Auto-Discover</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPETITORS.map((c, i) => (
                    <tr
                      key={c.name}
                      className={`border-b border-gray-800 last:border-0 transition-colors ${
                        c.highlight
                          ? 'bg-amber-500/5 border-amber-500/20'
                          : 'hover:bg-gray-900/50'
                      }`}>
                      <td className="px-6 py-4">
                        <span className={`font-bold text-sm ${c.highlight ? 'text-amber-400' : 'text-gray-300'}`}>
                          {c.highlight ? '⚡ ' : ''}{c.name}
                          {c.highlight && <span className="ml-2 text-[10px] bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">YOU ARE HERE</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${c.highlight ? 'text-amber-400' : 'text-gray-400'}`}>{c.price}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">{c.channels}</td>
                      <td className="px-6 py-4 text-xs text-gray-400">{c.ai}</td>
                      <td className="px-6 py-4 text-xs text-gray-400">{c.discover}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Pricing</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              Simple. Cheap. Powerful.
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              HERMES launches as part of SocialMate. If you&apos;re already on Agency, you get it free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map(tier => (
              <div key={tier.name} className={`rounded-2xl p-6 flex flex-col ${tier.cardBg} ${tier.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tier.icon}</span>
                    <h3 className="text-base font-extrabold text-white">{tier.name}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tier.badgeStyle}`}>{tier.badge}</span>
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                </div>
                <p className="text-xs text-gray-500 mb-5">{tier.priceSub}</p>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="flex-shrink-0 text-amber-400 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`w-full text-center text-sm font-bold py-3 rounded-xl transition-all block ${tier.ctaStyle}`}>
                  {tier.ctaLabel} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">FAQ</p>
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

        {/* ── CTA ── */}
        <section className="text-center bg-gradient-to-br from-amber-950/40 to-orange-950/40 border-2 border-amber-500/20 rounded-2xl p-14 mb-12">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-2xl mx-auto mb-6">⚡</div>
          <h2 className="text-3xl font-extrabold text-white mb-3">
            Apollo charges $99/month for this.
          </h2>
          <p className="text-gray-400 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
            We don&apos;t think that&apos;s right. HERMES is $15/mo — or free with Agency. Same AI-powered outreach. Same 4-step sequences. A fraction of the price.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-extrabold px-8 py-4 rounded-2xl transition-all text-sm shadow-lg shadow-amber-400/20">
            Join the Waitlist — It&apos;s Free →
          </Link>
          <p className="text-xs text-gray-600 mt-4">Private beta. Agency plan users get first access.</p>
        </section>

        {/* ── BUILT BY ── */}
        <section className="border-t border-gray-100 dark:border-gray-800 pt-12 text-center">
          <div className="w-12 h-12 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-center justify-center text-amber-400 text-lg font-extrabold mx-auto mb-4">J</div>
          <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-1">Built by Joshua Bostic</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-5 leading-relaxed">
            Solo founder. Working a deli job nights and weekends to build tools that give creators and builders the same power as people with 10x the budget.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/pricing" className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors">SocialMate Plans</Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link href="/soma" className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors">SOMA — AI Content</Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link href="/enki" className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors">Enki — AI Trading</Link>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}
