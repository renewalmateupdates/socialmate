'use client'

import { useState } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

const FEATURES = [
  {
    icon: '💸',
    number: '01',
    title: 'Tip Jar',
    desc: 'Drop your tip link anywhere — bio, posts, Link in Bio. Fans pay $1–$100. Money goes straight to your connected Stripe account. No middleman. No platform cut. Just Stripe\'s standard processing fee (~2.9% + 30¢).',
    highlight: '0% platform cut',
  },
  {
    icon: '🔁',
    number: '02',
    title: 'Fan Subscriptions',
    desc: 'Set a monthly tier — $3, $5, $10, whatever works for your audience. Subscribers unlock supporter-only content. You get predictable recurring revenue. SocialMate handles billing, renewals, and access — you just create.',
    highlight: 'Recurring revenue, yours to keep',
  },
  {
    icon: '🔒',
    number: '03',
    title: 'Paywalled Posts',
    desc: 'Mark any post "Supporters Only." Non-subscribers see a teaser to entice them. Subscribers see everything. Works across your Link in Bio page and future embeds — your content, your monetization, your rules.',
    highlight: 'Gate content, not your audience',
  },
]

const COMPARE = [
  { platform: 'Patreon',      cut: '8–12%', extra: '+ payment processing' },
  { platform: 'Substack',     cut: '10%',   extra: '+ payment processing' },
  { platform: 'Ko-fi',        cut: '0–5%',  extra: '+ payment processing' },
  { platform: 'SocialMate',   cut: '0%',    extra: 'Just Stripe (~2.9% + 30¢)', highlight: true },
]

export default function MonetizeLandingPage() {
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
            Now Live — Pro+
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-6 leading-tight">
            Get paid for<br className="hidden sm:block" />{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-fuchsia-500">
              your audience.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Accept tips, launch fan subscriptions, and paywall your content — all inside SocialMate.
            No separate platform. No link-hopping. No splitting your audience in two.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a
              href="/monetize/hub"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all text-sm w-full sm:w-auto text-center"
            >
              Open Creator Hub →
            </a>
            <
              href="#how-it-works"
              className="border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold px-8 py-3.5 rounded-2xl hover:border-purple-500 hover:text-purple-600 dark:hover:border-purple-500 dark:hover:text-purple-400 transition-all text-sm w-full sm:w-auto text-center"
            >
              See how it works
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400 dark:text-gray-500 font-medium">
            {[
              '0% platform cut',
              'Tip jar + subscriptions + paywalls',
              'Built into SocialMate — no new app',
              'Powered by Stripe',
            ].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="text-purple-500">◆</span> {item}
              </span>
            ))}
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="bg-black dark:bg-gray-950 border border-gray-800 rounded-2xl p-6 mb-20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:divide-x divide-white/10">
            {[
              { value: '0%',   label: 'Platform cut' },
              { value: '3',    label: 'Revenue streams' },
              { value: '$0',   label: 'Setup cost' },
              { value: '100%', label: 'Yours to keep' },
            ].map((stat, i) => (
              <div key={i} className="text-center py-2">
                <p className="text-3xl font-extrabold text-purple-400 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-2">The Features</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              Three ways to get paid
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-3">
              Mix and match. Run all three. Start with one. Your monetization stack, your call.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                    <span className="text-xs font-extrabold text-white">{feature.number}</span>
                  </div>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1 mb-4">{feature.desc}</p>
                <div className="inline-flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold px-3 py-1.5 rounded-full self-start">
                  <span className="w-1 h-1 rounded-full bg-purple-500" />
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
          <div className="bg-black dark:bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-8 py-8 border-b border-gray-800">
              <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-2">Why SocialMate</p>
              <h2 className="text-2xl font-extrabold text-white mb-2">
                You already schedule your content here. Now get paid for it.
              </h2>
              <p className="text-sm text-gray-400 max-w-xl">
                Every other monetization platform is a separate destination your audience has to find.
                SocialMate puts the tip jar, the subscription wall, and the paywall right where your content already lives.
              </p>
            </div>

            {/* Comparison table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Platform</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Platform Cut</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row) => (
                    <tr
                      key={row.platform}
                      className={`border-b border-gray-800/50 ${row.highlight ? 'bg-purple-950/20' : ''}`}
                    >
                      <td className={`px-6 py-4 font-bold ${row.highlight ? 'text-purple-400' : 'text-gray-300'}`}>
                        {row.highlight && <span className="mr-2">◆</span>}{row.platform}
                      </td>
                      <td className={`px-6 py-4 font-extrabold ${row.highlight ? 'text-purple-300' : 'text-gray-400'}`}>
                        {row.cut}
                      </td>
                      <td className={`px-6 py-4 text-xs ${row.highlight ? 'text-purple-400' : 'text-gray-500'}`}>
                        {row.extra}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-8 py-6 bg-gray-900/40 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '🔗', title: 'No separate platform', desc: 'Monetization lives inside SocialMate — where you already manage content.' },
                { icon: '👥', title: 'No audience split', desc: 'Don\'t send fans to three different platforms. One hub. One relationship.' },
                { icon: '⚡', title: 'No setup headache', desc: 'Connect Stripe, set your tiers, go. We handle billing, access, and renewals.' },
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
          <div className="bg-gradient-to-br from-purple-950/40 to-fuchsia-950/30 border-2 border-purple-800/50 rounded-2xl p-10 text-center">
            <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-5">
              💜
            </div>
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Early Access</p>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 mb-3">
              Get notified when this launches.
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed">
              Creator Monetization Hub is in active development. Drop your email and you&apos;ll be the
              first to know when it goes live — plus early access before the public rollout.
            </p>

            {status === 'success' ? (
              <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold px-6 py-3.5 rounded-xl text-sm">
                <span className="text-lg">✓</span> You&apos;re on the list. We&apos;ll reach out when it launches.
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
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={status === 'loading' || !email.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-all text-sm whitespace-nowrap"
                >
                  {status === 'loading' ? 'Joining...' : 'Notify me →'}
                </button>
              </form>
            )}

            {status === 'error' && (
              <p className="mt-3 text-xs text-red-500 dark:text-red-400">{errorMsg}</p>
            )}

            <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">
              No spam. One email when it launches. Unsubscribe any time.
            </p>
          </div>
        </section>

        {/* ── BUILT BY ── */}
        <section className="border-t border-gray-100 dark:border-gray-800 pt-12 text-center">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-extrabold mx-auto mb-4">
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
            <Link href="/pricing" className="text-xs font-bold text-purple-500 hover:text-purple-400 transition-colors">
              SocialMate Plans →
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link href="/soma" className="text-xs font-bold text-purple-500 hover:text-purple-400 transition-colors">
              SOMA AI Agent →
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link href="/enki" className="text-xs font-bold text-purple-500 hover:text-purple-400 transition-colors">
              Enki Trading →
            </Link>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}
