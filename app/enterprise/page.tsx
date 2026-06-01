'use client'
import { useState } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

export default function EnterprisePage() {
  const { t } = useI18n()

  const FEATURES = [
    { icon: '👥', title: t('enterprise.feat1_title'), description: t('enterprise.feat1_desc') },
    { icon: '🗂️', title: t('enterprise.feat2_title'), description: t('enterprise.feat2_desc') },
    { icon: '💰', title: t('enterprise.feat3_title'), description: t('enterprise.feat3_desc') },
    { icon: '🚀', title: t('enterprise.feat4_title'), description: t('enterprise.feat4_desc') },
    { icon: '🛡️', title: t('enterprise.feat5_title'), description: t('enterprise.feat5_desc') },
    { icon: '🏷️', title: t('enterprise.feat6_title'), description: t('enterprise.feat6_desc') },
    { icon: '⚡', title: t('enterprise.feat7_title'), description: t('enterprise.feat7_desc') },
    { icon: '📄', title: t('enterprise.feat8_title'), description: t('enterprise.feat8_desc') },
  ]

  const TEAM_SIZES = [
    t('enterprise.team_size1'),
    t('enterprise.team_size2'),
    t('enterprise.team_size3'),
    t('enterprise.team_size4'),
    t('enterprise.team_size5'),
  ]
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
              {t('enterprise.badge')}
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              {t('enterprise.hero_title')}{' '}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {t('enterprise.hero_title_highlight')}
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
              {t('enterprise.hero_desc')}
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-2xl transition-all text-base shadow-lg shadow-blue-600/20"
            >
              {t('enterprise.talk_cta')}
            </a>
          </div>
        </div>

        {/* SOCIAL PROOF */}
        <div className="max-w-4xl mx-auto px-6 pb-12 text-center">
          <p className="text-sm text-gray-500 mb-6">{t('enterprise.trusted_by')}</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { label: t('enterprise.proof1'), icon: '👥' },
              { label: t('enterprise.proof2'), icon: '🛡️' },
              { label: t('enterprise.proof3'), icon: '🏷️' },
              { label: t('enterprise.proof4'), icon: '⚡' },
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
            <h2 className="text-2xl font-extrabold mb-3">{t('enterprise.features_title')}</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              {t('enterprise.features_desc')}
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
            <p className="text-sm text-blue-400 font-bold uppercase tracking-widest mb-3">{t('enterprise.math_badge')}</p>
            <p className="text-2xl font-extrabold mb-4">
              {t('enterprise.math_line1')}<br />
              <span className="text-blue-400">{t('enterprise.math_line2')}</span>
            </p>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              {t('enterprise.math_desc')}
            </p>
          </div>
        </div>

        {/* CONTACT FORM */}
        <div id="contact" className="max-w-2xl mx-auto px-6 py-12 border-t border-white/5">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold mb-3">{t('enterprise.form_title')}</h2>
            <p className="text-gray-400 text-sm">
              {t('enterprise.form_desc')}
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-8 text-center">
              <p className="text-2xl mb-3">🎉</p>
              <h3 className="text-lg font-bold text-emerald-400 mb-2">{t('enterprise.success_title')}</h3>
              <p className="text-gray-400 text-sm">
                {t('enterprise.success_desc_before')} <span className="font-semibold text-white">{email}</span> {t('enterprise.success_desc_after')}{' '}
                <Link href="/pricing" className="text-amber-400 hover:underline">{t('enterprise.success_pricing_link')}</Link>{' '}
                {t('enterprise.success_or')}{' '}
                <Link href="/features" className="text-amber-400 hover:underline">{t('enterprise.success_features_link')}</Link>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    {t('enterprise.field_name')}
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
                    {t('enterprise.field_email')}
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
                    {t('enterprise.field_company')}
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
                    {t('enterprise.field_team_size')}
                  </label>
                  <select
                    value={teamSize}
                    onChange={e => setTeamSize(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm appearance-none"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-gray-900">{t('enterprise.select_size')}</option>
                    {TEAM_SIZES.map(s => (
                      <option key={s} value={s} className="bg-gray-900">{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  {t('enterprise.field_message')}
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={t('enterprise.message_placeholder')}
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
                {submitting ? t('enterprise.sending') : t('enterprise.send_cta')}
              </button>

              <p className="text-xs text-gray-600 text-center">
                {t('enterprise.or_email')}{' '}
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
            {t('enterprise.not_ready_before')}{' '}
            <Link href="/pricing" className="text-amber-400 hover:underline">{t('enterprise.agency_plan_link')}</Link>{' '}
            {t('enterprise.not_ready_after')}
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
            <span>{t('enterprise.agency_seats')}</span>
            <span>·</span>
            <span>{t('enterprise.agency_workspaces')}</span>
            <span>·</span>
            <span>{t('enterprise.agency_credits')}</span>
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}
