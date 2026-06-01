'use client'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { useI18n } from '@/contexts/I18nContext'

export default function TikTokStudioLandingPage() {
  const { t } = useI18n()

  const FEATURES = [
    { icon: '✂️', title: t('tiktok_landing.feat1_title'), description: t('tiktok_landing.feat1_desc') },
    { icon: '🎨', title: t('tiktok_landing.feat2_title'), description: t('tiktok_landing.feat2_desc') },
    { icon: '💬', title: t('tiktok_landing.feat3_title'), description: t('tiktok_landing.feat3_desc') },
    { icon: '🖼️', title: t('tiktok_landing.feat4_title'), description: t('tiktok_landing.feat4_desc') },
    { icon: '📤', title: t('tiktok_landing.feat5_title'), description: t('tiktok_landing.feat5_desc') },
    { icon: '🤖', title: t('tiktok_landing.feat6_title'), description: t('tiktok_landing.feat6_desc') },
    { icon: '📅', title: t('tiktok_landing.feat7_title'), description: t('tiktok_landing.feat7_desc') },
    { icon: '🔁', title: t('tiktok_landing.feat8_title'), description: t('tiktok_landing.feat8_desc') },
  ]

  const QUOTA = [
    { plan: t('tiktok_landing.plan_free'), price: '$0/mo', videos: t('tiktok_landing.free_videos'), color: 'border-gray-700' },
    { plan: t('tiktok_landing.plan_pro'), price: '$5/mo', videos: t('tiktok_landing.pro_videos'), color: 'border-amber-500' },
    { plan: t('tiktok_landing.plan_agency'), price: '$20/mo', videos: t('tiktok_landing.agency_videos'), color: 'border-purple-500' },
  ]

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative bg-gray-950 pt-20 pb-16 px-4 text-center overflow-hidden">
        {/* TikTok brand glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#fe2c55]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#fe2c55]/10 border border-[#fe2c55]/30 text-[#fe2c55] text-xs font-semibold px-3 py-1 rounded-full mb-6">
            ✅ {t('tiktok_landing.api_approved_badge')}
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            TikTok Studio
          </h1>
          <p className="text-xl text-gray-300 mb-3">
            {t('tiktok_landing.hero_tagline')}
          </p>
          <p className="text-gray-500 text-sm mb-10">
            {t('tiktok_landing.hero_sub')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="bg-[#fe2c55] hover:bg-[#e0263c] text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              {t('tiktok_landing.get_started_cta')}
            </Link>
            <Link
              href="/login?redirect=/tiktok/studio"
              className="border border-gray-700 hover:border-gray-500 text-gray-300 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              {t('tiktok_landing.open_studio_cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-gray-900 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            {t('tiktok_landing.features_title')}
          </h2>
          <p className="text-gray-400 text-center mb-12 text-sm">
            {t('tiktok_landing.features_desc')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-[#fe2c55]/40 transition-colors">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-white font-semibold mb-2 text-sm">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Post everywhere CTA section */}
      <section className="bg-gray-950 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-4">🌐</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('tiktok_landing.post_everywhere_title')}
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            {t('tiktok_landing.post_everywhere_desc')}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['TikTok', 'Bluesky', 'Discord', 'Mastodon', 'LinkedIn', 'Telegram', 'X/Twitter'].map((p) => (
              <span key={p} className={`px-3 py-1 rounded-full text-xs font-medium border ${p === 'TikTok' ? 'bg-[#fe2c55]/10 border-[#fe2c55]/40 text-[#fe2c55]' : 'bg-gray-800 border-gray-700 text-gray-300'}`}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / quota */}
      <section className="bg-gray-900 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            {t('tiktok_landing.pricing_title')}
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10">
            {t('tiktok_landing.pricing_desc')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {QUOTA.map((q) => (
              <div key={q.plan} className={`bg-gray-800 rounded-xl p-6 border-2 ${q.color} text-center`}>
                <div className="text-white font-bold text-lg mb-1">{q.plan}</div>
                <div className="text-gray-400 text-sm mb-3">{q.price}</div>
                <div className="text-[#fe2c55] font-semibold text-sm">{q.videos}</div>
              </div>
            ))}
          </div>

          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 text-sm text-gray-400 text-center">
            💡 {t('tiktok_landing.pricing_note')}
          </div>
        </div>
      </section>

      {/* AI Script Generator callout */}
      <section className="bg-gray-950 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-[#fe2c55]/10 to-purple-900/20 border border-[#fe2c55]/20 rounded-2xl p-8 text-center">
            <div className="text-3xl mb-4">🤖</div>
            <h2 className="text-xl font-bold text-white mb-3">
              {t('tiktok_landing.script_title')}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {t('tiktok_landing.script_desc')}
            </p>
            <Link
              href="/signup"
              className="inline-block bg-[#fe2c55] hover:bg-[#e0263c] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              {t('tiktok_landing.try_free_cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gray-900 py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('tiktok_landing.final_cta_title')}
          </h2>
          <p className="text-gray-400 mb-8 text-sm">
            {t('tiktok_landing.final_cta_desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="bg-[#fe2c55] hover:bg-[#e0263c] text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              {t('tiktok_landing.create_account_cta')}
            </Link>
            <Link
              href="/for/tiktok-creators"
              className="border border-gray-700 hover:border-gray-500 text-gray-300 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              {t('tiktok_landing.learn_more_cta')}
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
