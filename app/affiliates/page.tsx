'use client'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

export default function AffiliatesPage() {
  const { t } = useI18n()

  const STEPS = [
    {
      n: '1',
      title: t('affiliates.step1_title'),
      body: t('affiliates.step1_body'),
    },
    {
      n: '2',
      title: t('affiliates.step2_title'),
      body: t('affiliates.step2_body'),
    },
    {
      n: '3',
      title: t('affiliates.step3_title'),
      body: t('affiliates.step3_body'),
    },
  ]

  const TIERS = [
    {
      label: t('affiliates.tier_standard_label'),
      rate: '30%',
      desc: t('affiliates.tier_standard_desc'),
      highlight: false,
    },
    {
      label: t('affiliates.tier_elite_label'),
      rate: '40%',
      desc: t('affiliates.tier_elite_desc'),
      highlight: true,
    },
  ]

  const FAQ = [
    {
      q: t('affiliates.faq1_q'),
      a: t('affiliates.faq1_a'),
    },
    {
      q: t('affiliates.faq2_q'),
      a: t('affiliates.faq2_a'),
    },
    {
      q: t('affiliates.faq3_q'),
      a: t('affiliates.faq3_a'),
    },
    {
      q: t('affiliates.faq4_q'),
      a: t('affiliates.faq4_a'),
    },
    {
      q: t('affiliates.faq5_q'),
      a: t('affiliates.faq5_a'),
    },
  ]

  const BENEFITS = [
    t('affiliates.benefit1'),
    t('affiliates.benefit2'),
    t('affiliates.benefit3'),
    t('affiliates.benefit4'),
    t('affiliates.benefit5'),
    t('affiliates.benefit6'),
    t('affiliates.benefit7'),
  ]

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-20">

        {/* Hero */}
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-bold tracking-widest text-violet-500 uppercase mb-4">{t('affiliates.badge')}</span>
          <h1 className="text-5xl font-extrabold tracking-tight mb-5 leading-tight">
            {t('affiliates.hero_title')}
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed mb-8">
            {t('affiliates.hero_desc')}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/partners"
              className="px-7 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl transition-colors text-sm"
            >
              {t('affiliates.apply_cta')}
            </Link>
            <Link
              href="/partners/dashboard"
              className="px-7 py-3 border border-gray-200 dark:border-gray-700 hover:border-gray-400 text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-colors text-sm"
            >
              {t('affiliates.partner_login')}
            </Link>
          </div>
        </div>

        {/* Commission tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-20">
          {TIERS.map(tier => (
            <div
              key={tier.label}
              className={`rounded-2xl p-6 border-2 ${
                tier.highlight
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20'
                  : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'
              }`}
            >
              {tier.highlight && (
                <span className="inline-block text-xs font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full mb-3">
                  {t('affiliates.elite_tier_badge')}
                </span>
              )}
              <p className="text-4xl font-extrabold mb-1 text-gray-900 dark:text-gray-100">{tier.rate}</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{tier.label}</p>
              <p className="text-xs text-gray-500">{tier.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-20">
          <h2 className="text-2xl font-extrabold mb-8 text-center">{t('affiliates.how_it_works')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map(s => (
              <div key={s.n} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-extrabold rounded-full flex items-center justify-center mb-4 text-sm">
                  {s.n}
                </div>
                <p className="font-bold text-gray-900 dark:text-gray-100 mb-2">{s.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What you get */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 mb-20">
          <h2 className="text-xl font-extrabold mb-6">{t('affiliates.what_you_get')}</h2>
          <ul className="space-y-3">
            {BENEFITS.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div className="mb-20">
          <h2 className="text-2xl font-extrabold mb-8 text-center">{t('affiliates.common_questions')}</h2>
          <div className="space-y-4">
            {FAQ.map(f => (
              <div key={f.q} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
                <p className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-sm">{f.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-violet-600 rounded-3xl p-12">
          <h2 className="text-3xl font-extrabold text-white mb-3">{t('affiliates.cta_title')}</h2>
          <p className="text-violet-200 text-sm mb-8 max-w-md mx-auto">
            {t('affiliates.cta_desc')}
          </p>
          <Link
            href="/partners"
            className="px-8 py-3.5 bg-white text-violet-700 font-extrabold rounded-2xl hover:opacity-90 transition-opacity text-sm"
          >
            {t('affiliates.cta_button')}
          </Link>
        </div>

      </div>
    </PublicLayout>
  )
}
