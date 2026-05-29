import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

const STATS = [
  { value: '$0',      label: 'Setup Cost',       sub: 'no credit card' },
  { value: '3',       label: 'Channels',          sub: 'email + social DMs' },
  { value: '4-step',  label: 'Auto Sequence',     sub: 'intro to break-up' },
  { value: 'Flat',    label: 'Pricing',           sub: 'not per seat' },
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
    desc: 'Gemini 2.5 Flash generates a personalized intro for each prospect based on their work, company, and your campaign goal. Not a mail merge.',
  },
  {
    number: '04',
    icon: '⚡',
    title: 'Sequence Runs Itself',
    desc: 'Intro → Follow-up 1 → Follow-up 2 → Break-up. HERMES tracks every prospect and fires the next step automatically on your schedule.',
  },
]

const CHANNELS = [
  {
    icon: '📧',
    name: 'Email',
    desc: 'Finds verified emails automatically. Resend delivers HTML-formatted outreach. Full 4-step sequence with automated follow-ups.',
    badge: 'Best for agencies',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    icon: '🦋',
    name: 'Bluesky DM',
    desc: 'Resolves handles to DIDs via AT Protocol. Sends via chat.bsky.convo — a real direct message, not a mention or @tag.',
    badge: 'Best for creators',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    icon: '🐘',
    name: 'Mastodon DM',
    desc: 'Direct message via visibility:direct on any Mastodon instance. Reaches open-source communities and indie devs directly.',
    badge: 'Best for devs',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
]

const WHAT_YOU_GET = [
  { icon: '🤖', title: 'AI-written messages, every time', desc: 'Every intro, follow-up, and break-up is written by Gemini based on who the prospect actually is. Not a template with {{FirstName}} in it.' },
  { icon: '🔭', title: 'Free lead discovery', desc: 'Most tools charge per lead found. HERMES discovers from Substack, GitHub, Dev.to, and Hashnode — zero cost, no credit limits.' },
  { icon: '📬', title: 'Multi-channel reach', desc: 'Email, Bluesky DM, and Mastodon DM in one sequence. Reach prospects where they actually spend time — not just their inbox.' },
  { icon: '📅', title: 'Automated follow-ups', desc: 'Set your day intervals and let HERMES handle the rest. Sends the right message at the right step for every prospect automatically.' },
  { icon: '✏️', title: 'Draft mode or autopilot', desc: 'Review every AI-generated message before it goes out, or flip to Auto and let the sequence run hands-free.' },
  { icon: '💸', title: 'Flat pricing. No per-seat nonsense.', desc: "The rest of the industry charges $49–$99 per person per month. HERMES is $15 flat — or free inside the Agency plan. Your whole team. One price." },
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
      'Manual prospect add',
      'Draft mode (review before send)',
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
      'All 3 channels (Email + Bluesky + Mastodon)',
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
    a: 'HERMES scrapes Substack leaderboards, GitHub user search, Dev.to articles, and Hashnode posts for people matching your keyword. It extracts emails from public profile pages. No paid APIs, no per-lead cost — it just runs.',
  },
  {
    q: 'How does it personalize messages?',
    a: "Gemini 2.5 Flash reads the prospect's name, company, source, and your campaign persona description — then writes a message tailored to them. Not a mail merge. An actual AI-written intro based on real context.",
  },
  {
    q: "What's the 4-step sequence?",
    a: "Intro → Follow-up 1 → Follow-up 2 → Break-up. You set the day intervals (default: Day 0 / 3 / 7). HERMES tracks each prospect's position and generates the next step automatically on schedule.",
  },
  {
    q: 'Can I edit messages before sending?',
    a: "Yes. Draft Mode generates every message for your review — edit the subject, rewrite the body, or delete it entirely before it goes out. Auto mode sends on schedule without review. Your campaign, your call.",
  },
  {
    q: 'Does this work for agencies reaching out to clients?',
    a: "That's the primary use case. Run a campaign targeting freelance social media managers or small agencies, auto-discover from Substack or GitHub, and let HERMES pitch your services on autopilot.",
  },
  {
    q: 'When is HERMES available to users?',
    a: "Currently in private beta — being tested internally before rollout. Join the waitlist to be notified when it opens up. Agency plan users get first access.",
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

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-50 mb-6 leading-tight">
            Cold outreach that actually{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              fits your budget.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            HERMES finds your prospects, writes every message with AI, and runs a full 4-step sequence across email, Bluesky, and Mastodon — automatically. The rest of the industry charges $49–$99 per seat for this. We don&apos;t.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/signup"
              className="bg-amber-400 hover:bg-amber-300 text-black font-extrabold px-8 py-3.5 rounded-2xl transition-all text-sm w-full sm:w-auto text-center shadow-lg shadow-amber-400/20">
              Join the Waitlist →
            </Link>
            <a
              href="#how-it-works"
              className="border-2 border-gray-700 text-gray-300 font-bold px-8 py-3.5 rounded-2xl hover:border-amber-400 hover:text-amber-400 transition-all text-sm w-full sm:w-auto text-center">
              See How It Works
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500 font-medium">
            {[
              'No per-seat fees',
              'AI writes every message',
              'Discovers prospects free',
              'Email + Bluesky + Mastodon',
            ].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="text-amber-500">◆</span> {item}
              </span>
            ))}
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="bg-gray-950 border border-gray-800 rounded-2xl p-6 mb-20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:divide-x divide-white/10">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center py-2">
                <p className="text-3xl font-extrabold text-amber-400 mb-1">{stat.value}</p>
                <p className="text-xs text-white font-semibold mb-0.5">{stat.label}</p>
                <p className="text-[11px] text-gray-500">{stat.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">The System</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-50">
              Set it up once. Runs forever.
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto mt-3">
              From zero to a running outreach sequence in under 10 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((step, i) => (
              <div key={i} className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-xs font-extrabold text-amber-400">
                    {step.number}
                  </div>
                  <span className="text-xl">{step.icon}</span>
                </div>
                <h3 className="text-sm font-extrabold text-gray-100 mb-2">{step.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gray-700" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── CHANNELS ── */}
        <section id="channels" className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Outreach Channels</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-50">
              3 channels. 0 extra fees.
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto mt-3">
              Most outreach tools stick to email. HERMES also hits Bluesky and Mastodon DMs — where creators, developers, and indie founders actually are.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CHANNELS.map(ch => (
              <div key={ch.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{ch.icon}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${ch.badgeColor}`}>{ch.badge}</span>
                </div>
                <h3 className="text-base font-extrabold text-white mb-2">{ch.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{ch.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHAT YOU GET ── */}
        <section id="features" className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">What&apos;s Included</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-50">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto mt-3">
              No enterprise bloat. No upsells to unlock basic features. Just outreach that works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHAT_YOU_GET.map(item => (
              <div key={item.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="text-sm font-extrabold text-gray-100 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Pricing</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-50">
              Simple. Flat. Included.
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto mt-3">
              HERMES is part of SocialMate. Agency plan users get it for free. No seats. No credits. No surprises.
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
                <div className="mb-1">
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
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-50">
              Questions answered.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FAQS.map(faq => (
              <div key={faq.q} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-sm font-extrabold text-gray-100 mb-2">{faq.q}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="text-center bg-gradient-to-br from-amber-950/40 to-orange-950/40 border-2 border-amber-500/20 rounded-2xl p-14 mb-12">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-2xl mx-auto mb-6">⚡</div>
          <h2 className="text-3xl font-extrabold text-white mb-3">
            The industry charges $49–$99/seat for this.
          </h2>
          <p className="text-gray-400 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
            We don&apos;t think that&apos;s right. HERMES is $15/mo flat — or free with Agency. Same AI-powered outreach, same 4-step sequences, more channels, a fraction of the price.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-extrabold px-8 py-4 rounded-2xl transition-all text-sm shadow-lg shadow-amber-400/20">
            Join the Waitlist — It&apos;s Free →
          </Link>
          <p className="text-xs text-gray-600 mt-4">Private beta · Agency plan users get first access.</p>
        </section>

        {/* ── BUILT BY ── */}
        <section className="border-t border-gray-800 pt-12 text-center">
          <div className="w-12 h-12 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-center justify-center text-amber-400 text-lg font-extrabold mx-auto mb-4">J</div>
          <p className="text-sm font-extrabold text-gray-100 mb-1">Built by Joshua Bostic</p>
          <p className="text-xs text-gray-500 max-w-lg mx-auto mb-5 leading-relaxed">
            Solo founder. Building tools that give creators and agencies the same outreach power as enterprise sales teams — at a price that doesn&apos;t require a fundraise to afford.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/pricing" className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors">SocialMate Plans</Link>
            <span className="text-gray-700">|</span>
            <Link href="/soma" className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors">SOMA — AI Content</Link>
            <span className="text-gray-700">|</span>
            <Link href="/enki" className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors">Enki — AI Trading</Link>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}
