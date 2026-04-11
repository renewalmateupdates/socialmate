import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import EnkiPricingSection from './PricingSection'
import WaitlistButton from './WaitlistButton'

const FEATURES = [
  {
    icon: '◆',
    title: 'Fortress Guard — 7 Hard Stops',
    desc: '3% max daily drawdown. 3 consecutive loss brake. Earnings calendar guard. Macro event shield (CPI/FOMC/NFP). PDT rule enforcement. Sector concentration cap. Earnings volatility avoidance.',
  },
  {
    icon: '◆',
    title: 'Seven Signal Sources',
    desc: 'RSI + MACD + candlestick patterns + moving average + congressional trades + Reddit sentiment + Fear & Greed Index. All 7 must agree before confidence crosses the execution threshold.',
  },
  {
    icon: '◆',
    title: 'Congressional Trade Signals',
    desc: 'Tracks every trade filed by US Congress members. Institutional-grade insider signal. When Pelosi buys semiconductors, Enki sees it within the scan cycle.',
  },
  {
    icon: '◆',
    title: 'Compound Treasury Mode',
    desc: 'Every profit automatically becomes the next trade\'s capital. Start with $5. The guardian uses 95% of available cash each cycle so nothing sits idle.',
  },
  {
    icon: '◆',
    title: 'Crypto + Stocks, 24/7',
    desc: 'Stocks trade 9:30–4 ET Monday–Friday via Alpaca. Crypto runs 24/7 via Coinbase. Separate treasury buckets — crypto capped at 35% so it can\'t consume the whole treasury.',
  },
  {
    icon: '◆',
    title: '90-Day Backtesting',
    desc: 'Run any doctrine against 90 days of real historical data before risking capital. See P&L, win rate, max drawdown, and Sharpe ratio before you commit.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Set Your Doctrine',
    desc: 'Choose a pre-built doctrine from the Strategy Vault — or configure your own. Set your symbols, risk tolerance, and position sizing. The guardian enforces it without emotion.',
  },
  {
    number: '02',
    title: 'Guardian Activates',
    desc: 'Every 15 minutes Enki scans 7 signal sources per symbol. It only executes when confidence crosses 6/10. Below threshold? The guardian waits. No guessing. No FOMO.',
  },
  {
    number: '03',
    title: 'Treasury Compounds',
    desc: 'Profits automatically fuel the next trade. The Fortress Guard pauses the guardian if drawdown exceeds 3% in a single day — protecting gains before chasing more.',
  },
]

const SIGNALS = [
  { num: '01', name: 'RSI Analysis',         desc: 'Oversold / overbought detection' },
  { num: '02', name: 'MACD Crossover',        desc: 'Momentum confirmation' },
  { num: '03', name: 'Candlestick Patterns',  desc: '9 bullish/bearish formations' },
  { num: '04', name: 'Moving Average Trend',  desc: 'Direction confirmation' },
  { num: '05', name: 'Congressional Trades',  desc: 'Institutional insider signal' },
  { num: '06', name: 'Reddit Sentiment',      desc: 'Crowd wisdom filter' },
  { num: '07', name: 'Fear & Greed Index',    desc: 'Market psychology overlay' },
]

const FORTRESS_RULES = [
  { rule: '3% max daily drawdown',        desc: 'Guardian pauses after 3% loss in any single trading day' },
  { rule: '3 consecutive loss brake',     desc: 'Three losing trades in a row triggers a mandatory review pause' },
  { rule: 'Macro event shield',           desc: 'No new positions on FOMC, CPI, or NFP announcement days' },
  { rule: 'Earnings calendar guard',      desc: 'Avoids buying within 2 days of earnings — eliminates volatility traps' },
  { rule: 'PDT rule enforcement',         desc: 'Never violates Pattern Day Trader rules on margin accounts under $25k' },
  { rule: 'Sector concentration cap',     desc: 'No more than 40% of the stock treasury in one sector' },
  { rule: 'Crypto treasury cap',          desc: 'Crypto bucket hard-capped at 35% of total treasury value' },
]

const PRICING = [
  {
    name: 'Citizen',
    price: '$0',
    period: '/month, forever',
    description: 'Prove your doctrine before risking a dollar. Full paper trading with all guards active.',
    badge: 'No card needed',
    badgeStyle: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    accentColor: 'border-emerald-400',
    features: [
      'Full paper trading — simulated capital',
      'All 7 signal sources',
      'Confidence scoring (6/10 threshold)',
      'All Fortress Guard rules active',
      '7-day backtests',
      'Leaderboard visibility (paper badge)',
      '1 active doctrine',
    ],
    highlight: false,
  },
  {
    name: 'Commander',
    price: '$15',
    period: '/month',
    description: 'Your first live treasury operations. Stocks, compound mode, macro shields, conquest alerts.',
    badge: 'Live Stocks',
    badgeStyle: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    accentColor: 'border-amber-400',
    features: [
      'Everything in Citizen',
      'Live stock trading via Alpaca',
      'Compound treasury mode',
      '3 active doctrines',
      'Fortress macro shields',
      'Conquest alerts (email + Telegram)',
      'Strategy vault — pre-built doctrines',
      '30-day backtests',
      'Cloud Runner available (+$7/mo)',
    ],
    highlight: true,
  },
  {
    name: 'Emperor',
    price: '$29',
    period: '/month',
    description: 'The full autonomous empire-grade guardian. Crypto + stocks, 24/7, multi-broker.',
    badge: 'Full Autonomous',
    badgeStyle: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    accentColor: 'border-gray-400',
    features: [
      'Everything in Commander',
      'Coinbase crypto trading 24/7',
      'Multi-broker orchestration',
      'Full autonomous mode (no approvals)',
      'Advanced doctrine packs',
      'Guild + doctrine marketplace',
      'Elite empire badges',
      '90-day backtests',
      'Cloud Runner available (+$7/mo)',
    ],
    highlight: false,
  },
]

const STATS = [
  { value: '7',    label: 'Signal Sources' },
  { value: '7',    label: 'Fortress Guards' },
  { value: '3%',   label: 'Max Daily Drawdown' },
  { value: '24/7', label: 'Crypto + Stocks' },
]

export default function EnkiPage() {
  return (
    <PublicLayout>
      {/* ── DEV BANNER ── */}
      <div className="w-full bg-amber-400 text-black text-sm font-bold text-center py-3 px-4">
        🚧 Enki is in active development — join the waitlist for founding member pricing and early access.
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* ── HERO ── */}
        <section className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold mb-6 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Preview — Early Access
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-6 leading-tight">
            Build Your Empire<br className="hidden sm:block" />{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              While You Sleep
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Enki is the cold elite autonomous guardian of your treasury — executing disciplined
            stock and crypto doctrines with fortress-grade downside protection and relentless compounding.
            No finance degree required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <WaitlistButton
              defaultTier="citizen"
              className="bg-black dark:bg-white text-white dark:text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-80 transition-all text-sm w-full sm:w-auto text-center"
            >
              Start Citizen — Free
            </WaitlistButton>
            <a
              href="#how-it-works"
              className="border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold px-8 py-3.5 rounded-2xl hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all text-sm w-full sm:w-auto text-center"
            >
              See How It Works
            </a>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400 dark:text-gray-500 font-medium">
            {[
              'Fortress-grade downside protection',
              '24/7 stock + crypto execution',
              'Zero-configuration safe defaults',
              'Built by Gilgamesh Enterprise LLC',
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="text-amber-500">◆</span> {item}
              </span>
            ))}
          </div>
        </section>

        {/* ── STATS BAR ── */}
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
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">The Process</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              How the Guardian Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-black dark:bg-amber-400 flex items-center justify-center mb-4">
                  <span className="text-xs font-extrabold text-amber-400 dark:text-black">{step.number}</span>
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

        {/* ── SEVEN SIGNAL SOURCES ── */}
        <section id="signals" className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Intelligence Layer</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              Seven Signal Sources
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              All seven must align before confidence crosses the execution threshold. Below 6/10 — the guardian waits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SIGNALS.map((s) => (
              <div
                key={s.num}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4"
              >
                <p className="text-xs font-bold text-amber-500 mb-1">{s.num}</p>
                <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-1">{s.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.desc}</p>
              </div>
            ))}
            {/* 8th card — summary */}
            <div className="bg-black dark:bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 flex flex-col justify-center">
              <p className="text-xs font-bold text-amber-400 mb-1">THRESHOLD</p>
              <p className="text-2xl font-extrabold text-amber-400 mb-1">6 / 10</p>
              <p className="text-xs text-gray-400">Minimum confidence to execute a BUY. 5/10 for SELL.</p>
            </div>
          </div>
        </section>

        {/* ── FORTRESS GUARD ── */}
        <section id="fortress" className="mb-20">
          <div className="bg-black dark:bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-8 py-8 border-b border-gray-800">
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Risk Doctrine</p>
              <h2 className="text-2xl font-extrabold text-white mb-2">Fortress Guard</h2>
              <p className="text-sm text-gray-400 max-w-xl">
                Your capital is protected before it can grow. These rules run before every single order —
                no exceptions, no overrides on Citizen or Commander.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {FORTRESS_RULES.map((item, i) => (
                <div
                  key={i}
                  className="px-6 py-4 border-b border-r-0 md:border-r border-gray-800 last:border-b-0"
                  style={{ borderBottomColor: i >= FORTRESS_RULES.length - 2 ? 'transparent' : undefined }}
                >
                  <p className="text-sm font-bold text-amber-400 mb-1 flex items-center gap-2">
                    <span>◆</span> {item.rule}
                  </p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES GRID ── */}
        <section id="features" className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Capabilities</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              Everything the Guardian Does
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6"
              >
                <p className="text-amber-500 font-extrabold text-lg mb-3">{f.icon}</p>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <EnkiPricingSection />

        {/* ── WAITLIST CTA ── */}
        <section
          id="waitlist"
          className="bg-black dark:bg-gray-950 border border-gray-800 rounded-2xl p-8 sm:p-12 mb-16 text-center"
        >
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4">Early Access</p>
          <h2 className="text-3xl font-extrabold text-white mb-3">
            The guardian awaits your command.
          </h2>
          <p className="text-sm text-gray-400 max-w-lg mx-auto mb-8">
            Join the waitlist and be among the first Architects to run paper trading when the beta opens.
            Founding member pricing locked in — no price increases for early access members.
          </p>
          <WaitlistButton
            defaultTier="citizen"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-black font-bold px-8 py-3.5 rounded-2xl transition-all text-sm"
          >
            Start as Citizen — Free →
          </WaitlistButton>
          <p className="text-xs text-gray-500 mt-4">No spam. No commitment. No credit card for Citizen.</p>
        </section>

        {/* ── LEGAL DISCLAIMER ── */}
        <section className="mb-16">
          <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-700 rounded-2xl p-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl">⚠️</span>
              <p className="text-base font-extrabold text-red-700 dark:text-red-400 uppercase tracking-widest">
                Important Risk Disclosure
              </p>
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="max-w-3xl mx-auto space-y-3 text-sm text-red-800 dark:text-red-300 leading-relaxed">
              <p>
                <strong>Enki is a trading automation tool — not a financial advisor, broker, or investment service.</strong> Nothing on this page or within the Enki platform constitutes financial, investment, legal, or tax advice.
              </p>
              <p>
                Trading in stocks, ETFs, and cryptocurrencies involves <strong>substantial risk of loss</strong>, including the possible loss of your entire principal. Past backtest or paper-trading performance does not guarantee future results. Markets are unpredictable and no algorithm can eliminate risk.
              </p>
              <p>
                Enki&apos;s Fortress Guard and risk rules reduce exposure but <strong>cannot protect against all losses</strong>. You are solely responsible for your investment decisions. Only trade with money you can afford to lose entirely.
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold pt-2 border-t border-red-200 dark:border-red-800">
                Gilgamesh Enterprise LLC does not provide investment advice. Use of Enki constitutes acceptance that you are acting as an independent investor making your own decisions. Consult a licensed financial professional before trading.
              </p>
            </div>
          </div>
        </section>

        {/* ── BUILT BY ── */}
        <section className="border-t border-gray-100 dark:border-gray-800 pt-12 text-center">
          <div className="w-12 h-12 bg-black dark:bg-amber-400 rounded-xl flex items-center justify-center text-amber-400 dark:text-black text-lg font-extrabold mx-auto mb-4">
            J
          </div>
          <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-1">
            Built by Joshua Bostic — Gilgamesh Enterprise LLC
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-5 leading-relaxed">
            Solo founder. Bootstrapped. The same person behind SocialMate and RenewalMate.
            Building the Gilgamesh Empire OS — tools for people who can&apos;t afford the expensive ones.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="https://socialmate.studio"
              className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors"
            >
              SocialMate →
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link
              href="https://www.renewalmate.com"
              className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors"
            >
              RenewalMate →
            </Link>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}
