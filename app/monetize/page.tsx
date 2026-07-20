'use client'

import { useState } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

export default function MonetizeLandingPage() {
  const { t } = useI18n()

  const FEATURES = [
    {
      icon: '💸',
      number: '01',
      title: t('monetize_landing.feat1_title'),
      desc: t('monetize_landing.feat1_desc'),
      highlight: t('monetize_landing.feat1_highlight'),
    },
    {
      icon: '🔁',
      number: '02',
      title: t('monetize_landing.feat2_title'),
      desc: t('monetize_landing.feat2_desc'),
      highlight: t('monetize_landing.feat2_highlight'),
    },
    {
      icon: '🔒',
      number: '03',
      title: t('monetize_landing.feat3_title'),
      desc: t('monetize_landing.feat3_desc'),
      highlight: t('monetize_landing.feat3_highlight'),
    },
  ]

  const COMPARE = [
    { platform: 'Patreon',    cut: '8–12%', extra: t('monetize_landing.plus_processing') },
    { platform: 'Substack',   cut: '10%',   extra: t('monetize_landing.plus_processing') },
    { platform: 'Ko-fi',      cut: '0–5%',  extra: t('monetize_landing.plus_processing') },
    { platform: 'SocialMate', cut: '0%',    extra: t('monetize_landing.stripe_only'), highlight: true },
  ]
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/monetize/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setStatus('success')
      setEmail('')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    }
  }

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* ── HERO ── */}
        <section className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-6 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t('monetize_landing.live_badge')}
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-6 leading-tight">
            {t('monetize_landing.hero_title')}<br className="hidden sm:block" />{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-500">
              {t('monetize_landing.hero_title_highlight')}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            {t('monetize_landing.hero_desc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a
              href="/monetize/hub"
              className="bg-amber-600 hover:bg-amber-700 text-void font-bold px-8 py-3.5 rounded-2xl transition-all text-sm w-full sm:w-auto text-center"
            >
              {t('monetize_landing.open_hub_cta')}
            </a>
            <a
              href="#how-it-works"
              className="border-2 border-gray-300 dark:border-edge text-gray-700 dark:text-gray-300 font-bold px-8 py-3.5 rounded-2xl hover:border-amber-500 hover:text-amber-600 dark:hover:border-amber-500 dark:hover:text-amber-400 transition-all text-sm w-full sm:w-auto text-center"
            >
              {t('monetize_landing.see_how_cta')}
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400 dark:text-gray-500 font-medium">
            {[
              t('monetize_landing.proof1'),
              t('monetize_landing.proof2'),
              t('monetize_landing.proof3'),
              t('monetize_landing.proof4'),
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
            {[
              { value: '0%',   label: t('monetize_landing.stat1_label') },
              { value: '3',    label: t('monetize_landing.stat2_label') },
              { value: '$0',   label: t('monetize_landing.stat3_label') },
              { value: '100%', label: t('monetize_landing.stat4_label') },
            ].map((stat, i) => (
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
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">{t('monetize_landing.features_badge')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              {t('monetize_landing.features_title')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              {t('monetize_landing.features_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="relative bg-panel border border-edge rounded-2xl p-6 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center">
                    <span className="text-xs font-extrabold text-white">{feature.number}</span>
                  </div>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1 mb-4">{feature.desc}</p>
                <div className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full self-start">
                  <span className="w-1 h-1 rounded-full bg-amber-500" />
                  {feature.highlight}
                </div>
                {i < FEATURES.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-gray-200 dark:bg-gray-700" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY SOCIALMATE ── */}
        <section id="why" className="mb-20">
          <div className="bg-transparent border border-edge rounded-2xl overflow-hidden">
            <div className="px-8 py-8 border-b border-edge">
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">{t('monetize_landing.why_badge')}</p>
              <h2 className="text-2xl font-extrabold text-white mb-2">
                {t('monetize_landing.why_title')}
              </h2>
              <p className="text-sm text-gray-400 max-w-xl">
                {t('monetize_landing.why_desc')}
              </p>
            </div>

            {/* Comparison table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-edge">
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('monetize_landing.table_platform')}</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('monetize_landing.table_cut')}</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('monetize_landing.table_notes')}</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row) => (
                    <tr
                      key={row.platform}
                      className={`border-b border-edge/50 ${row.highlight ? 'bg-amber-950/20' : ''}`}
                    >
                      <td className={`px-6 py-4 font-bold ${row.highlight ? 'text-amber-400' : 'text-gray-300'}`}>
                        {row.highlight && <span className="mr-2">◆</span>}{row.platform}
                      </td>
                      <td className={`px-6 py-4 font-extrabold ${row.highlight ? 'text-amber-300' : 'text-gray-400'}`}>
                        {row.cut}
                      </td>
                      <td className={`px-6 py-4 text-xs ${row.highlight ? 'text-amber-400' : 'text-gray-500'}`}>
                        {row.extra}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-8 py-6 bg-gray-900/40 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '🔗', title: t('monetize_landing.why1_title'), desc: t('monetize_landing.why1_desc') },
                { icon: '👥', title: t('monetize_landing.why2_title'), desc: t('monetize_landing.why2_desc') },
                { icon: '⚡', title: t('monetize_landing.why3_title'), desc: t('monetize_landing.why3_desc') },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">{item.title}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WAITLIST ── */}
        <section id="waitlist" className="mb-20">
          <div className="bg-gradient-to-br from-amber-950/40 to-amber-950/30 border-2 border-amber-800/50 rounded-2xl p-10 text-center">
            <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center text-void text-2xl mx-auto mb-5">
              💜
            </div>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">{t('monetize_landing.waitlist_badge')}</p>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 mb-3">
              {t('monetize_landing.waitlist_title')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed">
              {t('monetize_landing.waitlist_desc')}
            </p>

            {status === 'success' ? (
              <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold px-6 py-3.5 rounded-xl text-sm">
                <span className="text-lg">✓</span> {t('monetize_landing.waitlist_success')}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={status === 'loading'}
                  className="flex-1 px-4 py-3 rounded-xl border border-edge bg-panel text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={status === 'loading' || !email.trim()}
                  className="bg-amber-600 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-void font-bold px-6 py-3 rounded-xl transition-all text-sm whitespace-nowrap"
                >
                  {status === 'loading' ? t('monetize_landing.joining') : t('monetize_landing.notify_cta')}
                </button>
              </form>
            )}

            {status === 'error' && (
              <p className="mt-3 text-xs text-red-500 dark:text-red-400">{errorMsg}</p>
            )}

            <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">
              {t('monetize_landing.no_spam')}
            </p>
          </div>
        </section>

        {/* ── BUILT BY ── */}
        <section className="border-t border-edge pt-12 text-center">
          <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-void text-lg font-extrabold mx-auto mb-4">
            J
          </div>
          <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mb-1">
            Built by Joshua Bostic — Gilgamesh Enterprise LLC
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-5 leading-relaxed">
            Solo founder. Bootstrapped. Building tools that give creators the same monetization infrastructure
            that platforms charge 10%+ for — at prices that don&apos;t gatekeep.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/pricing" className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors">
              SocialMate Plans →
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link href="/soma" className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors">
              SOMA AI Agent →
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link href="/enki" className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors">
              Enki Trading →
            </Link>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}
