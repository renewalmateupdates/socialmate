import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

const WAITLIST_HREF =
  'mailto:socialmatehq@gmail.com?subject=Enki%20Early%20Access&body=I%20want%20early%20access%20to%20Enki!'

const FEATURES = [
  {
    emoji: '🏛️',
    title: 'Congressional Trade Signals',
    desc: 'Tracks every trade made by US Congress members. When Pelosi buys, Enki knows.',
  },
  {
    emoji: '📊',
    title: 'Multi-Signal Confidence Scoring',
    desc: 'RSI + MACD + sentiment + options flow + volume must agree before any trade fires.',
  },
  {
    emoji: '🛡️',
    title: '7 Automatic Guards',
    desc: 'Earnings guard, trailing stop-loss, PDT rule, macro event blackout, sector diversity, volume filter, economic calendar.',
  },
  {
    emoji: '₿',
    title: 'Crypto + Stocks',
    desc: 'Trades stocks 9:30–4 ET and crypto 24/7. Never stops working.',
  },
  {
    emoji: '🔄',
    title: 'Auto-Compounding',
    desc: 'Profits automatically fuel the next trade. Start with $5. Watch it snowball.',
  },
  {
    emoji: '📈',
    title: 'Full Backtesting',
    desc: 'Test any strategy against 90 days of real historical data before risking a dollar.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Connect Your Broker',
    desc: 'Link Alpaca (stocks) or Coinbase (crypto). Paper trade first with $0 risk.',
  },
  {
    number: '02',
    title: 'Enki Scans Everything',
    desc: 'Every 15 minutes: congressional trades, Reddit, RSI, MACD, options flow, volume spikes. Only trades when confidence score hits 6/10+.',
  },
  {
    number: '03',
    title: 'Profits Compound Automatically',
    desc: 'Every dollar made gets reinvested. Start with $5. The snowball grows.',
  },
]

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: '/month, forever',
    description: 'Full-featured paper trading. No real money. No credit card. No catch.',
    badge: 'No card needed',
    badgeStyle: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cardBg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-2 border-emerald-400',
    features: [
      'Paper trading (simulated)',
      'All 9+ signal sources',
      'Full confidence scoring',
      'All 7 safety guards',
      'Backtesting (90 days)',
      'No real money at risk',
    ],
    highlight: false,
  },
  {
    name: 'Trader',
    price: '$19',
    period: '/month',
    description: 'Go live with stocks. All guards active. Auto-compounding enabled.',
    badge: 'Live Trading',
    badgeStyle: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    cardBg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-2 border-blue-400',
    features: [
      'Everything in Free',
      'Live stock trading (9:30–4 ET)',
      'Alpaca broker integration',
      'All 7 safety guards active',
      'Auto-compound mode',
      'Real-time signal dashboard',
    ],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$39',
    period: '/month',
    description: 'Everything + Crypto (24/7). Aggressive compound mode. Multi-broker. Priority updates.',
    badge: 'Early Access',
    badgeStyle: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    cardBg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-2 border-amber-400',
    features: [
      'Everything in Trader',
      'Crypto trading 24/7',
      'Coinbase integration',
      'Aggressive compound mode',
      'Multi-broker support',
      'Priority feature updates',
    ],
    highlight: true,
  },
]

const STATS = [
  { value: '9+', label: 'Signal Sources' },
  { value: '24/7', label: 'Crypto + Stocks' },
  { value: 'Free', label: 'Paper Trade Forever' },
]

export default function EnkiPage() {
  return (
    <PublicLayout>
      {/* ── DEV BANNER ── */}
      <div className="w-full bg-amber-400 text-black text-sm font-bold text-center py-3 px-4">
        🚧 Enki is in active development. Join the waitlist to get early access and founding member pricing.
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* ── HERO ── */}
        <section className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Coming Soon — Early Access Preview
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-6 leading-tight">
            Your Money Works<br className="hidden sm:block" />{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              While You Sleep
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Enki is an autonomous trading bot that scans stocks and crypto 24/7 — scanning
            congressional trades, Reddit sentiment, RSI, MACD, options flow, and 9 candlestick
            patterns. It only trades when everything lines up.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href={WAITLIST_HREF}
              className="bg-black dark:bg-white text-white dark:text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-80 transition-all text-sm w-full sm:w-auto text-center"
            >
              Join the Waitlist
            </a>
            <a
              href="#how-it-works"
              className="border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold px-8 py-3.5 rounded-2xl hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all text-sm w-full sm:w-auto text-center"
            >
              See How It Works
            </a>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Built by a solo founder. $0/month to run. No VC. No team.
          </p>
        </section>

        {/* ── STATS BAR ── */}
        <section className="bg-black dark:bg-gray-900 rounded-2xl p-6 mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:divide-x divide-white/10">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center py-2">
                <p className="text-3xl font-extrabold text-white mb-1">{stat.value}</p>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">The Process</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center mb-4">
                  <span className="text-xs font-extrabold text-white dark:text-black">{step.number}</span>
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {step.desc}
                </p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-gray-200 dark:bg-gray-700" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES GRID ── */}
        <section id="features" className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Capabilities</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              Built to Trade Smarter
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              Every signal source, every guard, every edge — baked in from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">
                  {f.emoji}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                    {f.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pricing</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              Start free. Scale when ready.
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              Paper trade at $0 until you trust it. Go live when you do.
            </p>
          </div>

          <p className="text-center text-sm font-semibold text-amber-700 dark:text-amber-400 mb-6">
            Pricing locked in for early access members. Join the waitlist to be first.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING.map(plan => (
              <div
                key={plan.name}
                className={`${plan.cardBg} ${plan.border} rounded-2xl overflow-hidden flex flex-col ${plan.highlight ? 'ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-gray-950' : ''}`}
              >
                <div className="px-6 py-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{plan.name}</h3>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${plan.badgeStyle}`}>
                      {plan.badge}
                    </span>
                  </div>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">{plan.price}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mb-1.5">{plan.period}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{plan.description}</p>
                </div>

                <div className="px-6 pb-6 flex-1 flex flex-col">
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5 flex-shrink-0 font-bold">✓</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={WAITLIST_HREF}
                    className="w-full text-center text-sm font-bold py-3 rounded-xl transition-all bg-black dark:bg-white text-white dark:text-black hover:opacity-80"
                  >
                    Join Waitlist →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WAITLIST / CTA ── */}
        <section id="waitlist" className="bg-black dark:bg-gray-900 rounded-2xl p-8 sm:p-12 mb-16 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">
            Get early access to Enki
          </h2>
          <p className="text-sm text-gray-400 max-w-lg mx-auto mb-8">
            Enki is in active development. Join the waitlist and be first to paper trade when the beta opens.
          </p>
          <a
            href={WAITLIST_HREF}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-black font-bold px-8 py-3.5 rounded-2xl transition-all text-sm"
          >
            Join the Waitlist →
          </a>
          <p className="text-xs text-gray-500 mt-4">No spam. No commitment. Cancel anytime.</p>
        </section>

        {/* ── LEGAL DISCLAIMER ── */}
        <section className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-16">
          <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed text-center max-w-3xl mx-auto">
            <span className="font-bold text-gray-500 dark:text-gray-400">Disclaimer:</span> Enki is a trading
            automation tool, not financial advice. Trading involves substantial risk of loss, including possible
            loss of principal. Past performance does not guarantee future results. You are solely responsible
            for all trading decisions and outcomes. Always trade within your means.
          </p>
        </section>

        {/* ── BUILT BY ── */}
        <section className="border-t border-gray-100 dark:border-gray-800 pt-12 text-center">
          <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black text-lg font-extrabold mx-auto mb-4">
            J
          </div>
          <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-1">
            Built by Joshua Bostic — solo founder, Gilgamesh Enterprise LLC
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-5 leading-relaxed">
            The same person behind SocialMate. Two products. One mission: tools for people who can&apos;t
            afford the expensive ones.
          </p>
          <Link
            href="https://socialmate.studio"
            className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors"
          >
            socialmate.studio →
          </Link>
        </section>

      </div>
    </PublicLayout>
  )
}
