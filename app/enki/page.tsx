'use client'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import EnkiPricingSection from './PricingSection'
import WaitlistButton from './WaitlistButton'
import { useI18n } from '@/contexts/I18nContext'

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
  const { t } = useI18n()
  return (
    <PublicLayout>
      {/* ── DEV BANNER ── */}
      <div className="w-full bg-amber-400 text-black text-sm font-bold text-center py-3 px-4">
        🚧 {t('app_enki_landing.dev_banner')}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* ── HERO ── */}
        <section className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold mb-6 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {t('app_enki_landing.badge')}
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-6 leading-tight">
            {t('app_enki_landing.hero_headline')}<br className="hidden sm:block" />{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              {t('app_enki_landing.hero_emphasis')}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            {t('app_enki_landing.hero_sub')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <WaitlistButton
              defaultTier="citizen"
              className="bg-black dark:bg-white text-white dark:text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-80 transition-all text-sm w-full sm:w-auto text-center"
            >
              {t('app_enki_landing.start_citizen')}
            </WaitlistButton>
            <a
              href="#how-it-works"
              className="border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold px-8 py-3.5 rounded-2xl hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all text-sm w-full sm:w-auto text-center"
            >
              {t('app_enki_landing.see_how')}
            </a>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400 dark:text-gray-500 font-medium">
            {[
              t('app_enki_landing.trust_1'),
              t('app_enki_landing.trust_2'),
              t('app_enki_landing.trust_3'),
              t('app_enki_landing.trust_4'),
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
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">{t('app_enki_landing.process_eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              {t('app_enki_landing.process_headline')}
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
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">{t('app_enki_landing.signals_eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              {t('app_enki_landing.signals_headline')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              {t('app_enki_landing.signals_sub')}
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
              <p className="text-xs font-bold text-amber-400 mb-1">{t('app_enki_landing.threshold_label')}</p>
              <p className="text-2xl font-extrabold text-amber-400 mb-1">6 / 10</p>
              <p className="text-xs text-gray-400">{t('app_enki_landing.threshold_buy')}</p>
            </div>
          </div>
        </section>

        {/* ── FORTRESS GUARD ── */}
        <section id="fortress" className="mb-20">
          <div className="bg-black dark:bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-8 py-8 border-b border-gray-800">
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">{t('app_enki_landing.fortress_eyebrow')}</p>
              <h2 className="text-2xl font-extrabold text-white mb-2">{t('app_enki_landing.fortress_headline')}</h2>
              <p className="text-sm text-gray-400 max-w-xl">
                {t('app_enki_landing.fortress_sub')}
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
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">{t('app_enki_landing.features_eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              {t('app_enki_landing.features_headline')}
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
          <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4">{t('app_enki_landing.waitlist_eyebrow')}</p>
          <h2 className="text-3xl font-extrabold text-white mb-3">
            {t('app_enki_landing.waitlist_headline')}
          </h2>
          <p className="text-sm text-gray-400 max-w-lg mx-auto mb-8">
            {t('app_enki_landing.waitlist_sub')}
          </p>
          <WaitlistButton
            defaultTier="citizen"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-black font-bold px-8 py-3.5 rounded-2xl transition-all text-sm"
          >
            {t('app_enki_landing.start_as_citizen')}
          </WaitlistButton>
          <p className="text-xs text-gray-500 mt-4">{t('app_enki_landing.waitlist_fine')}</p>
        </section>

        {/* ── LEGAL DISCLAIMER ── */}
        <section className="mb-16">
          <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-700 rounded-2xl p-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl">⚠️</span>
              <p className="text-base font-extrabold text-red-700 dark:text-red-400 uppercase tracking-widest">
                {t('app_enki_landing.risk_eyebrow')}
              </p>
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="max-w-3xl mx-auto space-y-3 text-sm text-red-800 dark:text-red-300 leading-relaxed">
              <p>
                <strong>{t('app_enki_landing.risk_p1')}</strong>
              </p>
              <p>
                {t('app_enki_landing.risk_p2')}
              </p>
              <p>
                {t('app_enki_landing.risk_p3')}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold pt-2 border-t border-red-200 dark:border-red-800">
                {t('app_enki_landing.risk_fine')}
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
            {t('app_enki_landing.built_by')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-5 leading-relaxed">
            {t('app_enki_landing.built_by_sub')}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="https://socialmate.studio"
              className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors"
            >
              {t('app_enki_landing.socialmate_link')}
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link
              href="https://www.renewalmate.com"
              className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors"
            >
              {t('app_enki_landing.renewalmate_link')}
            </Link>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}
