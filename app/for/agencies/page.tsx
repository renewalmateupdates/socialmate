import type { Metadata } from 'next'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

export const metadata: Metadata = {
  title: 'Social Media Management for Agencies — SocialMate',
  description: 'Manage every client from one dashboard. White label the entire platform as your own brand. SocialMate Agency plan: 2,000 AI credits, 15 seats, 5 client workspaces — $20/month.',
  openGraph: {
    title: 'Social Media Management for Agencies — SocialMate',
    description: 'Stop paying $299/month for agency tools. SocialMate gives you white label, client workspaces, team seats, and 2,000 AI credits for $20/month.',
    url: 'https://socialmate.studio/for/agencies',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: 'SocialMate for Agencies' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media Management for Agencies — SocialMate',
    description: 'White label social media scheduling for $20/month. Client workspaces, team seats, AI tools included.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/for/agencies' },
}

const PAIN_POINTS = [
  {
    before: 'Pay $299+/month for Sprout Social. Hope the client doesn\'t notice you\'re reselling it.',
    after:  'Pay $20/month for SocialMate Agency. White label it. Your brand, your price.',
    icon: '💸',
  },
  {
    before: 'Juggle 6 different logins across 6 different tools for 6 different clients.',
    after:  'One dashboard. Switch between client workspaces in one click.',
    icon: '🧩',
  },
  {
    before: 'Write every caption from scratch. Pay a copywriter per post.',
    after:  '12 built-in AI tools. Generate captions, hooks, and threads in seconds.',
    icon: '🤖',
  },
  {
    before: 'Manually report results to clients every month. 3 hours in spreadsheets.',
    after:  'Built-in analytics. Export-ready. Done.',
    icon: '📊',
  },
]

const FEATURES = [
  {
    title: 'Client Workspaces',
    desc:  '5 isolated client workspaces on the Agency plan. Each client sees only their data — no cross-contamination, no accidental posts.',
    icon:  '🏢',
    badge: 'Agency',
  },
  {
    title: 'White Label — Your Brand',
    desc:  'Custom logo, colors, and brand name for $20/month add-on. Your clients never know what\'s powering it.',
    icon:  '🏷️',
    badge: 'Add-on',
  },
  {
    title: 'White Label — Custom Domain',
    desc:  'Go further: serve the platform from your own domain. app.youragency.com instead of socialmate.studio.',
    icon:  '🌐',
    badge: 'Add-on',
  },
  {
    title: '15 Team Seats',
    desc:  'Add your entire team without paying per-seat fees. Everyone gets full access to the workspace.',
    icon:  '👥',
    badge: 'Agency',
  },
  {
    title: '2,000 AI Credits / Month',
    desc:  '12 AI tools — caption writer, hook generator, thread builder, rewriter, and more. 2,000 credits go a long way across multiple clients.',
    icon:  '✨',
    badge: 'Agency',
  },
  {
    title: '5 Live Platforms',
    desc:  'Schedule to Bluesky, X/Twitter, Mastodon, Discord, and Telegram today. LinkedIn, YouTube, Pinterest, and Reddit are on the active roadmap.',
    icon:  '📡',
    badge: 'Live now',
  },
  {
    title: 'Bulk Scheduling',
    desc:  'Upload a CSV or paste multiple posts at once. Assign platforms, days, and times in bulk. Perfect for high-volume agencies.',
    icon:  '📦',
    badge: 'Live now',
  },
  {
    title: 'Clips Studio',
    desc:  'Manage Twitch and YouTube clip distribution for streamer clients. Browse, caption, and schedule clips to every platform in minutes.',
    icon:  '🎬',
    badge: 'Live now',
  },
  {
    title: 'Evergreen Recycling',
    desc:  'Set top-performing posts to auto-recycle. Keep client content calendars full without manual effort.',
    icon:  '♻️',
    badge: 'Live now',
  },
]

const PRICING = [
  {
    name:    'Agency',
    price:   '$20',
    period:  '/month',
    annual:  '$209/year (save $31)',
    credits: '2,000 AI credits/mo',
    seats:   '15 team seats',
    workspaces: '5 client workspaces',
    highlight: true,
    cta:     'Start Agency plan',
    href:    '/signup',
  },
  {
    name:    'White Label Basic',
    price:   '+$20',
    period:  '/month',
    annual:  'Add-on to Agency plan',
    credits: 'Custom logo + colors',
    seats:   'Custom brand name',
    workspaces: 'Your branding throughout',
    highlight: false,
    cta:     'Learn about white label',
    href:    '/pricing',
  },
  {
    name:    'White Label Pro',
    price:   '+$40',
    period:  '/month',
    annual:  'Add-on to Agency plan',
    credits: 'Everything in Basic',
    seats:   'Custom domain',
    workspaces: 'Full white label',
    highlight: false,
    cta:     'Learn about white label',
    href:    '/pricing',
  },
]

const COMPARISON = [
  { tool: 'Sprout Social', price: '$249–$799/mo', seats: '1–5', ai: 'Add-on',    wl: '✗' },
  { tool: 'Hootsuite',     price: '$99–$739/mo',  seats: '1–5', ai: 'Add-on',    wl: '✗' },
  { tool: 'Sendible',      price: '$89–$299/mo',  seats: '3–7', ai: 'Limited',   wl: 'Paid' },
  { tool: 'SocialMate',    price: '$20/mo',        seats: '15',  ai: '2,000 cr',  wl: '+$20', highlight: true },
]

const FAQ = [
  {
    q: 'How do client workspaces work?',
    a: 'Each client workspace is fully isolated — separate social accounts, separate post history, separate analytics. You switch between them from the workspace switcher in the sidebar. Clients never see each other\'s data.',
  },
  {
    q: 'Can I give clients access to their own workspace?',
    a: 'Yes. Add a client as a team member to their workspace. They\'ll see only their workspace, nothing else. You control what they can access.',
  },
  {
    q: 'What\'s the difference between white label Basic and Pro?',
    a: 'Basic ($20/mo add-on) gives you custom logo, brand colors, and brand name — your clients see your brand, not SocialMate. Pro ($40/mo add-on) adds a custom domain so the platform runs on your own URL.',
  },
  {
    q: 'What platforms can I post to right now?',
    a: 'Bluesky, X/Twitter, Mastodon, Discord, and Telegram are live today. LinkedIn, YouTube, Pinterest, and Reddit are on the active roadmap with no fixed ETA. We don\'t vaporware — see the roadmap for honest status.',
  },
  {
    q: 'Can I resell SocialMate to my clients?',
    a: 'Yes — with white label, you can package it under your own brand at whatever price point works for your agency. We don\'t restrict resale.',
  },
  {
    q: 'Is there a setup fee or long-term contract?',
    a: 'No setup fee, no contract. Month-to-month on the Agency plan ($20/mo) or save $31 with annual ($209/yr). Cancel anytime.',
  },
  {
    q: 'Do the 15 seats include client seats?',
    a: 'The 15 seats apply to your entire workspace — that includes team members and clients you invite. Most agencies use 2–3 internal seats per workspace and fill the rest with client contacts.',
  },
  {
    q: 'How do AI credits work across multiple clients?',
    a: 'Your 2,000 monthly credits are shared across all workspaces and team members. You can top up with credit packs ($1.99–$19.99) if you run out. Credits reset monthly and never carry over.',
  },
]

export default function AgenciesPage() {
  return (
    <PublicLayout>

      {/* ─── HERO ─── */}
      <section className="bg-black text-white py-24 px-6 text-center">
        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">Built for agencies</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-6">
          Stop overpaying for agency tools.<br />
          <span className="text-amber-400">Manage every client for $20/month.</span>
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto text-base leading-relaxed mb-8">
          Client workspaces. 15 team seats. 2,000 AI credits. White label optional.
          Everything you charge clients $500/month to manage — for $20.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/signup"
            className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            Start Agency plan — $20/month →
          </Link>
          <Link href="/pricing"
            className="border border-gray-700 hover:border-gray-400 text-gray-300 hover:text-white font-bold px-8 py-4 rounded-xl text-sm transition-all w-full sm:w-auto text-center">
            See full pricing
          </Link>
        </div>
        <p className="text-gray-500 text-xs mt-4">No contract · No setup fee · Cancel anytime</p>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">The agency tax is real</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
            The tools are charging you a fortune.<br />You don&apos;t have to keep paying it.
          </h2>
          <div className="space-y-5">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-xs text-red-400 font-bold uppercase tracking-wide mb-2">The old way</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-amber-950/40 border border-amber-800/50 rounded-2xl p-5">
                  <p className="text-xs text-amber-300 font-bold uppercase tracking-wide mb-2">With SocialMate</p>
                  <p className="text-sm text-white leading-relaxed">{p.icon} {p.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Price comparison</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-10">What you&apos;re paying vs what you could pay</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left py-3 pr-4">Tool</th>
                  <th className="text-left py-3 pr-4">Monthly cost</th>
                  <th className="text-left py-3 pr-4">Seats</th>
                  <th className="text-left py-3 pr-4">AI included</th>
                  <th className="text-left py-3">White label</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} className={`border-b border-gray-900 ${row.highlight ? 'bg-amber-950/20' : ''}`}>
                    <td className={`py-3 pr-4 font-bold ${row.highlight ? 'text-amber-300' : 'text-gray-300'}`}>
                      {row.tool} {row.highlight && '←'}
                    </td>
                    <td className={`py-3 pr-4 ${row.highlight ? 'text-amber-300 font-extrabold' : 'text-gray-400'}`}>{row.price}</td>
                    <td className={`py-3 pr-4 ${row.highlight ? 'text-white font-bold' : 'text-gray-400'}`}>{row.seats}</td>
                    <td className={`py-3 pr-4 ${row.highlight ? 'text-white font-bold' : 'text-gray-400'}`}>{row.ai}</td>
                    <td className={`py-3 ${row.highlight ? 'text-white font-bold' : 'text-gray-400'}`}>{row.wl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600 mt-4">Prices approximate as of April 2026. See competitor sites for current pricing.</p>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">What you get</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">
            Built for agencies. Priced for reality.
          </h2>
          <p className="text-center text-gray-400 text-sm mb-12 max-w-xl mx-auto">
            Every feature below is included in the $20/month Agency plan unless marked as an add-on.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{f.icon}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    f.badge === 'Agency'   ? 'bg-amber-900/50 text-amber-300' :
                    f.badge === 'Add-on'  ? 'bg-gray-800 text-gray-400' :
                    'bg-green-900/50 text-green-400'
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

      {/* ─── PRICING ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Simple. No per-seat nonsense.</h2>
          <p className="text-gray-400 text-sm mb-12 max-w-xl mx-auto">
            One flat price. 15 seats. 5 client workspaces. White label available as an add-on.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PRICING.map((tier) => (
              <div key={tier.name}
                className={`rounded-2xl p-6 border text-left ${tier.highlight
                  ? 'bg-amber-950/40 border-amber-700 ring-1 ring-amber-500'
                  : 'bg-gray-900 border-gray-800'
                }`}>
                {tier.highlight && (
                  <p className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-3">Start here</p>
                )}
                <p className="text-sm font-extrabold mb-1">{tier.name}</p>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-black">{tier.price}</span>
                  <span className="text-gray-400 text-sm mb-1">{tier.period}</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">{tier.annual}</p>
                <ul className="text-xs text-gray-400 space-y-2 mb-6">
                  <li>✓ {tier.credits}</li>
                  <li>✓ {tier.seats}</li>
                  <li>✓ {tier.workspaces}</li>
                </ul>
                <Link href={tier.href}
                  className={`block text-center text-sm font-bold py-3 rounded-xl transition-all ${tier.highlight
                    ? 'bg-amber-400 hover:bg-amber-300 text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}>
                  {tier.cta} →
                </Link>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs">Need more than 5 client workspaces? <Link href="/support" className="text-amber-400 hover:text-amber-300 underline">Contact us.</Link></p>
        </div>
      </section>

      {/* ─── WHITE LABEL CALLOUT ─── */}
      <section className="bg-gradient-to-br from-amber-950 via-gray-950 to-black text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-3">White label</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
            Put your brand on it.<br />Your clients never know it&apos;s SocialMate.
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-xl mx-auto leading-relaxed">
            Add White Label Basic for $20/month and the platform becomes yours — your logo,
            your colors, your name. Add White Label Pro for $40/month and run it on your own domain.
            Charge clients $200/month. Margin is yours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pricing"
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-8 py-4 rounded-xl text-sm transition-all">
              See white label pricing →
            </Link>
            <Link href="/signup"
              className="border border-gray-700 hover:border-gray-400 text-gray-300 hover:text-white font-bold px-8 py-4 rounded-xl text-sm transition-all">
              Start Agency plan first
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Questions</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">Agency FAQ</h2>
          <div className="space-y-6">
            {FAQ.map((item, i) => (
              <div key={i} className="border-b border-gray-900 pb-6 last:border-0">
                <h3 className="text-sm font-extrabold mb-2">{item.q}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="bg-gray-950 text-white py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          Your agency deserves better margins.
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          Start the Agency plan today. 15 seats, 5 client workspaces, 2,000 AI credits.
          White label when you&apos;re ready.
        </p>
        <Link href="/signup"
          className="inline-block bg-amber-400 hover:bg-amber-300 text-black font-bold px-10 py-4 rounded-xl text-sm transition-all">
          Start Agency plan — $20/month →
        </Link>
        <p className="text-gray-600 text-xs mt-4">No contract · No setup fee · Month-to-month · Cancel anytime</p>
      </section>

    </PublicLayout>
  )
}
