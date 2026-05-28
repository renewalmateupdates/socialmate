'use client'
import { useState } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

const FEATURES = [
  {
    icon: '👥',
    title: 'Unlimited seats',
    description: 'No per-seat limits. Add your whole team — designers, writers, strategists, clients.',
  },
  {
    icon: '🗂️',
    title: 'Unlimited client workspaces',
    description: 'Isolated workspaces for every brand you manage. No more workspace caps.',
  },
  {
    icon: '💰',
    title: 'Custom credit allocation',
    description: 'AI credit limits tailored to your actual usage. No arbitrary monthly caps.',
  },
  {
    icon: '🚀',
    title: 'Dedicated onboarding',
    description: 'Live onboarding session with Joshua to get your team fully set up and running fast.',
  },
  {
    icon: '🛡️',
    title: 'SLA guarantee (99.9% uptime)',
    description: 'Formal uptime commitment backed by a real service-level agreement.',
  },
  {
    icon: '🏷️',
    title: 'White Label Pro included',
    description: 'Custom domain, custom branding — your own SaaS product. Included at no extra cost.',
  },
  {
    icon: '⚡',
    title: 'Priority support (< 4hr response)',
    description: 'Skip the queue. Every support message gets a response within 4 hours during business hours.',
  },
  {
    icon: '📄',
    title: 'Custom contract',
    description: 'NDAs, custom terms, invoicing, and payment terms that work for your procurement process.',
  },
]

const TEAM_SIZES = [
  '1–5 people',
  '6–15 people',
  '16–50 people',
  '51–200 people',
  '200+ people',
]

export default function EnterprisePage() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [company, setCompany]   = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [message, setMessage]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/enterprise/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, team_size: teamSize, message }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('Network error — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PublicLayout>
      <div className="dark min-h-screen bg-gray-950 text-white">

        {/* HERO */}
        <div className="relative overflow-hidden">
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
            <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px]" />
          </div>

          <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
              Enterprise
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              Built for teams that{' '}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                move fast
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Custom pricing, unlimited seats, dedicated onboarding, and a real SLA.
              Everything your agency or enterprise team needs — without the $500/month price tag.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-2xl transition-all text-base shadow-lg shadow-blue-600/20"
            >
              Talk to us →
            </a>
          </div>
        </div>

        {/* SOCIAL PROOF */}
        <div className="max-w-4xl mx-auto px-6 pb-12 text-center">
          <p className="text-sm text-gray-500 mb-6">Trusted by growing teams</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { label: 'Unlimited seats', icon: '👥' },
              { label: 'Custom SLA', icon: '🛡️' },
              { label: 'White Label Pro', icon: '🏷️' },
              { label: 'Dedicated support', icon: '⚡' },
            ].map(item => (
              <div key={item.label}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-gray-300">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="max-w-4xl mx-auto px-6 py-12 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extrabold mb-3">Everything above Agency — and then some</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Enterprise includes every Agency feature plus unlimited scale, custom terms, and a direct line to Joshua.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map(feature => (
              <div key={feature.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">{feature.icon}</span>
                  <div>
                    <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMPARISON CALLOUT */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-2xl p-8 text-center">
            <p className="text-sm text-blue-400 font-bold uppercase tracking-widest mb-3">The math</p>
            <p className="text-2xl font-extrabold mb-4">
              Hootsuite Enterprise starts at $800/mo.<br />
              <span className="text-blue-400">We start at a conversation.</span>
            </p>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              Custom pricing means you pay for what you actually use — not a vendor&apos;s
              margin target. Most teams land between $50–$200/month.
            </p>
          </div>
        </div>

        {/* CONTACT FORM */}
        <div id="contact" className="max-w-2xl mx-auto px-6 py-12 border-t border-white/5">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold mb-3">Let&apos;s talk</h2>
            <p className="text-gray-400 text-sm">
              Fill out the form and Joshua will respond within one business day.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-8 text-center">
              <p className="text-2xl mb-3">🎉</p>
              <h3 className="text-lg font-bold text-emerald-400 mb-2">Message received!</h3>
              <p className="text-gray-400 text-sm">
                Joshua will reach out to <span className="font-semibold text-white">{email}</span> within one business day.
                In the meantime, feel free to{' '}
                <Link href="/pricing" className="text-amber-400 hover:underline">check out pricing</Link>{' '}
                or{' '}
                <Link href="/features" className="text-amber-400 hover:underline">explore features</Link>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Your name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Joshua Bostic"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Work email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@yourcompany.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="Acme Agency"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Team size
                  </label>
                  <select
                    value={teamSize}
                    onChange={e => setTeamSize(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm appearance-none"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-gray-900">Select size</option>
                    {TEAM_SIZES.map(s => (
                      <option key={s} value={s} className="bg-gray-900">{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  What do you need?
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Tell us about your team, how many accounts you manage, what you're currently using, and what you're trying to accomplish."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-sm resize-none leading-relaxed"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all text-base"
              >
                {submitting ? 'Sending...' : 'Send message →'}
              </button>

              <p className="text-xs text-gray-600 text-center">
                Or email directly:{' '}
                <a href="mailto:hello@socialmate.studio?subject=Enterprise Plan Inquiry"
                  className="text-amber-400 hover:underline">
                  hello@socialmate.studio
                </a>
              </p>
            </form>
          )}
        </div>

        {/* BOTTOM CTA */}
        <div className="max-w-4xl mx-auto px-6 py-12 border-t border-white/5 text-center">
          <p className="text-gray-400 text-sm mb-4">
            Not ready for Enterprise? Our{' '}
            <Link href="/pricing" className="text-amber-400 hover:underline">Agency plan</Link>{' '}
            at $20/month covers most growing teams.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
            <span>15 team seats</span>
            <span>·</span>
            <span>5 client workspaces</span>
            <span>·</span>
            <span>2,000 AI credits/mo</span>
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}
