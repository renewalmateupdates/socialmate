'use client'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

export default function AboutPage() {
  const { t } = useI18n()
  return (
    <PublicLayout>

      {/* ─── HERO ─── */}
      <section className="bg-black text-white py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <img src="/logo.png" alt="SocialMate" className="w-20 h-20 rounded-3xl mx-auto mb-8" />
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            {t('about.hero_title')}<br />
            <span className="text-amber-400">{t('about.hero_title_highlight')}</span>
          </h1>
          <p className="text-gray-300 text-base leading-relaxed max-w-xl mx-auto">
            {t('about.hero_desc')}
          </p>
        </div>
      </section>

      {/* ─── ORIGIN STORY ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-6">{t('about.origin_badge')}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-8">
            {t('about.origin_title')}
          </h2>

          <div className="space-y-6 text-gray-300 text-base leading-relaxed">
            <p>{t('about.origin_para1')}</p>
            <p>{t('about.origin_para2')}</p>
            <p>{t('about.origin_para3')}</p>
            <p>{t('about.origin_para4')}</p>
            <p>{t('about.origin_para5')}</p>
          </div>
        </div>
      </section>

      {/* ─── MISSION ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-6">{t('about.mission_badge')}</p>
          <blockquote className="text-2xl sm:text-3xl font-extrabold leading-snug mb-6">
            &ldquo;{t('about.mission_quote')}&rdquo;
          </blockquote>
          <p className="text-gray-300 text-base leading-relaxed mb-8">
            {t('about.mission_para1')}
          </p>
          <p className="text-gray-300 text-base leading-relaxed">
            {t('about.mission_para2')}
          </p>
        </div>
      </section>

      {/* ─── EVERYTHING EVERYWHERE ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-amber-950/50 to-gray-900 border border-amber-800/30 rounded-3xl p-8 sm:p-12 text-center">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">{t('about.vision_badge')}</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
              {t('about.vision_title')}
            </h2>
            <p className="text-gray-300 text-base leading-relaxed mb-6">
              {t('about.vision_para1')}
            </p>
            <p className="text-gray-300 text-base leading-relaxed">
              {t('about.vision_para2')}
            </p>
          </div>
        </div>
      </section>

      {/* ─── SM-GIVE ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-6">SM-Give</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-6">
            {t('about.give_title')}
          </h2>
          <p className="text-gray-300 text-base leading-relaxed mb-6">
            {t('about.give_para1')}
          </p>
          <p className="text-gray-300 text-base leading-relaxed mb-8">
            {t('about.give_para2')}
          </p>
          <Link href="/give"
            className="inline-block border border-rose-700 hover:bg-rose-950/40 text-rose-400 font-bold px-6 py-3 rounded-xl text-sm transition-all">
            ❤️ {t('about.give_cta')}
          </Link>
        </div>
      </section>

      {/* ─── FOUNDER ─── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-8 text-center">{t('about.founder_badge')}</p>
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center text-black font-black text-3xl flex-shrink-0">
                J
              </div>
              <div>
                <h2 className="text-xl font-extrabold mb-1">Joshua Bostic</h2>
                <p className="text-amber-400 text-sm font-bold mb-4">{t('about.founder_role')}</p>
                <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
                  <p>{t('about.founder_para1')}</p>
                  <p>{t('about.founder_para2')}</p>
                  <p>{t('about.founder_para3')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-10">{t('about.stats_badge')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: '7',    label: t('about.stat1_label') },
              { value: '480+', label: t('about.stat2_label') },
              { value: '8',    label: t('about.stat3_label') },
              { value: '$5',   label: t('about.stat4_label') },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
                <p className="text-3xl font-black text-amber-400 mb-2">{stat.value}</p>
                <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-gradient-to-b from-gray-950 to-black text-white py-20 px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
          {t('about.cta_title')}
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          {t('about.cta_desc')}
        </p>
        <Link href="/signup"
          className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-4 rounded-xl text-sm transition-all">
          {t('about.cta_button')}
        </Link>
        <p className="text-gray-600 text-xs mt-4">{t('about.cta_sub')}</p>
      </section>

    </PublicLayout>
  )
}
