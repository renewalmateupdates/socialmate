import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

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
    desc: 'Hunter.io finds verified emails. Resend delivers HTML formatted outreach. Full 4-step sequence with automated follow-ups.',
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

// Apollo feature comparison — pulled from apollo.io/pricing May 2026
const APOLLO_FEATURES = [
  { label: 'AI-written outreach messages',       hermes: true,  apollo: 'Extra cost / AI credits' },
  { label: 'Automated 4-step sequences',         hermes: true,  apollo: true  },
  { label: 'Auto-discover leads (no cost)',       hermes: true,  apollo: 'Uses credits (30k–72k/yr)' },
  { label: 'Email outreach',                     hermes: true,  apollo: true  },
  { label: 'Social DMs (Bluesky + Mastodon)',    hermes: true,  apollo: false },
  { label: 'Flat per-team pricing',              hermes: true,  apollo: false },
  { label: 'Included in social scheduling plan', hermes: true,  apollo: false },
  { label: 'AI lead scoring',                    hermes: false, apollo: true  },
  { label: 'CRM integrations (Salesforce etc.)', hermes: false, apollo: true  },
  { label: 'Email warmup & deliverability suite',hermes: false, apollo: true  },
  { label: 'US phone dialer',                    hermes: false, apollo: 'Credits apply' },
  { label: 'Intent data & buying signals',       hermes: false, apollo: '$79+/seat plan' },
]

const COMPETITORS = [
  { name: 'Apollo.io',  price: '$49–$119/seat/mo',  note: 'billed annually',   channels: 'Email + phone',              ai: 'Extra',       discover: '✅ (credits)',  seats: 'Per seat' },
  { name: 'Lemlist',    price: '$59/mo',             note: 'per seat',          channels: 'Email only',                 ai: '✅',          discover: '❌',            seats: 'Per seat' },
  { name: 'Instantly',  price: '$37–$97/mo',         note: 'billed annually',   channels: 'Email only',                 ai: '❌',          discover: '❌',            seats: 'Per seat' },
  { name: 'Reply.io',   price: '$60/mo',             note: 'per seat',          channels: 'Email + LinkedIn',           ai: 'Extra',       discover: '❌',            seats: 'Per seat' },
  { name: 'HERMES',     price: '$15/mo',             note: 'flat — not per seat', channels: 'Email + Bluesky + Mastodon', ai: '✅ Included', discover: '✅ Free',      seats: 'Flat fee', highlight: true },
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
    q: 'How does HERMES compare to Apollo specifically?',
    a: 'Apollo charges $49–$119 per seat per month (billed annually). A 3-person team is $147–$357/mo before you even add credits. HERMES is $15/mo flat — or free with the $20/mo Agency plan. Apollo also has no social DM outreach; HERMES reaches prospects on Bluesky and Mastodon in addition to email.',
  },
  {
    q: 'How does Auto-Discover work?',
    a: 'HERMES scrapes Substack leaderboards, GitHub user search, Dev.to articles, and Hashnode posts for people matching your keyword. It extracts emails from public profile pages. No paid APIs — no per-lead cost. Apollo uses a credit system that limits how many leads you can find per year.',
  },
  {
    q: 'How does it personalize messages?',
    a: 'Gemini 2.5 Flash reads the prospect\'s name, company, source, and your campaign persona description — then writes a message tailored to them. Not a mail merge with {{FirstName}} fields. An actual AI-written intro based on real context.',
  },
  {
    q: 'What\'s the 4-step sequence?',
    a: 'Intro → Follow-up 1 → Follow-up 2 → Break-up. You set the day intervals (default: Day 0 / 3 / 7). HERMES tracks each prospect\'s position and generates the next step automatically on schedule. Apollo\'s sequences work similarly — but cost $49+/seat/mo just to access them.',
  },
  {
    q: 'Can I edit messages before sending?',
    a: 'Yes. Draft Mode generates every message for your review — you can edit subject, body, or delete it before hitting Send. Auto mode sends on schedule without review. Your campaign, your call.',
  },
  {
    q: 'When is HERMES available to users?',
    a: 'Currently in private beta — being used internally to prove the system before rollout. Join the waitlist to be notified when it opens. Agency plan users get first access.',
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
            Apollo charges $49/seat.<br className="hidden sm:block" />{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              HERMES charges $15 flat.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            AI-powered cold outreach across email, Bluesky, and Mastodon. Auto-discovers prospects, writes personalized messages, runs 4-step sequences automatically. Everything Apollo does — for a team of 10, for the price of Apollo for 1.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/signup"
              className="bg-amber-400 hover:bg-amber-300 text-black font-extrabold px-8 py-3.5 rounded-2xl transition-all text-sm w-full sm:w-auto text-center shadow-lg shadow-amber-400/20">
              Join the Waitlist →
            </Link>
            <a
              href="#compare"
              className="border-2 border-gray-700 text-gray-300 font-bold px-8 py-3.5 rounded-2xl hover:border-amber-400 hover:text-amber-400 transition-all text-sm w-full sm:w-auto text-center">
              See the Full Comparison
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500 font-medium">
            {[
              'No per-seat fees. Ever.',
              'AI writes every message (Gemini 2.5)',
              'Discovers prospects for free',
              'Email + Bluesky + Mastodon',
            ].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="text-amber-500">◆</span> {item}
              </span>
            ))}
          </div>
        </section>

        {/* ── THE MATH SECTION ── */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Apollo */}
            <div className="bg-red-950/20 border-2 border-red-500/20 rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-base">☀️</div>
                <div>
                  <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Apollo.io Basic</p>
                  <p className="text-lg font-extrabold text-white">$49/seat/mo <span className="text-xs font-normal text-gray-500">billed annually</span></p>
                </div>
              </div>
              <div className="space-y-2 mb-5">
                {[
                  { seats: 1, label: '1-person team', value: '$49/mo · $588/yr' },
                  { seats: 3, label: '3-person team', value: '$147/mo · $1,764/yr' },
                  { seats: 5, label: '5-person team', value: '$245/mo · $2,940/yr' },
                  { seats: 10, label: '10-person team', value: '$490/mo · $5,880/yr' },
                ].map(row => (
                  <div key={row.seats} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{row.label}</span>
                    <span className="font-bold text-red-400">{row.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-600">Plus $79/seat for Automated Workflows. Plus $119/seat for SSO.</p>
            </div>

            {/* HERMES */}
            <div className="bg-amber-950/20 border-2 border-amber-400/40 rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-base">⚡</div>
                <div>
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">HERMES (via SocialMate)</p>
                  <p className="text-lg font-extrabold text-white">$15/mo flat <span className="text-xs font-normal text-gray-500">or free with Agency plan</span></p>
                </div>
              </div>
              <div className="space-y-2 mb-5">
                {[
                  { seats: 1,  label: '1-person team',  value: '$15/mo · $180/yr' },
                  { seats: 3,  label: '3-person team',  value: '$15/mo · $180/yr' },
                  { seats: 5,  label: '5-person team',  value: '$15/mo · $180/yr' },
                  { seats: 10, label: '10-person team', value: '$15/mo · $180/yr' },
                ].map(row => (
                  <div key={row.seats} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{row.label}</span>
                    <span className="font-bold text-amber-400">{row.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-500">Plus social scheduling, 15+ AI tools, SOMA, Enki, and more — in the same $5–$20 SocialMate plan.</p>
            </div>
          </div>

          <div className="mt-4 bg-amber-400/5 border border-amber-400/20 rounded-xl px-5 py-3.5 flex items-center gap-3">
            <span className="text-amber-400 text-lg">🧮</span>
            <p className="text-xs text-gray-400">
              <span className="text-amber-400 font-extrabold">5-person team on Apollo Basic = $245/mo.</span>{' '}
              5-person team on HERMES Agency = $20/mo. That&apos;s <span className="text-white font-bold">$2,700 saved per year.</span>{' '}
              And HERMES also posts to Bluesky and Mastodon. Apollo doesn&apos;t.
            </p>
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
              3 channels. Apollo has 0 social DMs.
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto mt-3">
              Apollo does email and phone. HERMES adds Bluesky and Mastodon DMs — channels where creators, developers, and indie founders actually live.
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

        {/* ── FEATURE COMPARISON ── */}
        <section id="features" className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Feature for Feature</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-50">
              What you actually need vs what you&apos;re paying for.
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto mt-3">
              Apollo loads you up with 40+ enterprise features you&apos;ll never use — and charges per seat for all of them. HERMES ships the core that moves the needle.
            </p>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 border-b border-gray-800">
              <div className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Feature</div>
              <div className="px-6 py-4 text-center">
                <p className="text-xs font-bold text-gray-300">⚡ HERMES</p>
                <p className="text-[11px] text-amber-400 font-semibold">$15/mo flat</p>
              </div>
              <div className="px-6 py-4 text-center">
                <p className="text-xs font-bold text-gray-400">Apollo Basic</p>
                <p className="text-[11px] text-red-400 font-semibold">$49/seat/mo</p>
              </div>
            </div>

            {APOLLO_FEATURES.map((f, i) => (
              <div
                key={f.label}
                className={`grid grid-cols-3 border-b border-gray-800/60 last:border-0 ${i % 2 === 0 ? 'bg-gray-900/30' : ''}`}>
                <div className="px-6 py-3.5 text-xs text-gray-300">{f.label}</div>
                <div className="px-6 py-3.5 flex items-center justify-center">
                  {f.hermes === true ? (
                    <span className="text-xs font-bold text-emerald-400">✓ Yes</span>
                  ) : (
                    <span className="text-xs text-gray-600">—</span>
                  )}
                </div>
                <div className="px-6 py-3.5 flex items-center justify-center">
                  {f.apollo === true ? (
                    <span className="text-xs font-bold text-gray-400">✓ Yes</span>
                  ) : f.apollo === false ? (
                    <span className="text-xs text-red-500 font-bold">✗ No</span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium text-center leading-tight">{f.apollo}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-gray-600 text-center mt-4">
            Apollo features sourced from apollo.io/pricing, May 2026. Prices billed annually.
          </p>
        </section>

        {/* ── COMPETITOR TABLE ── */}
        <section id="compare" className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">The Market</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-50">
              We&apos;re ruining the pricing.
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto mt-3">
              Every cold outreach tool charges per seat. HERMES is the only one that doesn&apos;t.
            </p>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Tool</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Price</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Seat Pricing</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Channels</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">AI Included</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Auto-Discover</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPETITORS.map(c => (
                    <tr
                      key={c.name}
                      className={`border-b border-gray-800 last:border-0 transition-colors ${
                        c.highlight
                          ? 'bg-amber-500/5'
                          : 'hover:bg-gray-900/50'
                      }`}>
                      <td className="px-6 py-4">
                        <span className={`font-bold text-sm ${c.highlight ? 'text-amber-400' : 'text-gray-300'}`}>
                          {c.highlight ? '⚡ ' : ''}{c.name}
                          {c.highlight && <span className="ml-2 text-[10px] bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">THIS IS US</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className={`text-sm font-bold ${c.highlight ? 'text-amber-400' : 'text-gray-300'}`}>{c.price}</span>
                          <p className="text-[11px] text-gray-600">{c.note}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold ${c.highlight ? 'text-emerald-400' : 'text-red-400'}`}>{c.seats}</span>
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
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-50">
              Simple. Flat. Included.
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto mt-3">
              HERMES launches as part of SocialMate. If you&apos;re already on Agency, you get it for free. No seats. No credits. No surprises.
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
            5 seats on Apollo = $245/month.
          </h2>
          <p className="text-2xl font-extrabold text-amber-400 mb-4">
            5 seats on HERMES = $15/month.
          </p>
          <p className="text-gray-400 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
            Same AI outreach. Same automated sequences. More channels. A fraction of the cost.
            We&apos;re not trying to compete with Apollo — we&apos;re making Apollo look like a bad deal.
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
