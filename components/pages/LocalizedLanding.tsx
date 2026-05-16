import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Metadata } from 'next'
import PublicNav from '@/components/PublicNav'

const PLATFORMS = [
  { name: 'Discord',     icon: '💬', status: 'live'    },
  { name: 'Bluesky',     icon: '🦋', status: 'live'    },
  { name: 'Telegram',    icon: '✈️', status: 'live'    },
  { name: 'Mastodon',    icon: '🐘', status: 'live'    },
  { name: 'X / Twitter', icon: '🐦', status: 'live'    },
  { name: 'LinkedIn',    icon: '💼', status: 'soon'    },
  { name: 'YouTube',     icon: '▶️', status: 'soon'    },
  { name: 'Pinterest',   icon: '📌', status: 'soon'    },
  { name: 'Reddit',      icon: '🤖', status: 'soon'    },
  { name: 'TikTok',      icon: '🎵', status: 'soon'    },
  { name: 'Instagram',   icon: '📸', status: 'planned' },
  { name: 'Facebook',    icon: '📘', status: 'planned' },
  { name: 'Threads',     icon: '🧵', status: 'planned' },
  { name: 'Snapchat',    icon: '👻', status: 'planned' },
  { name: 'Lemon8',      icon: '🍋', status: 'planned' },
  { name: 'BeReal',      icon: '📷', status: 'planned' },
]

export async function generateLocaleMetadata(locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'home' })
  return {
    title: 'SocialMate — Free Social Media Scheduler',
    description: t('subheadline'),
    alternates: {
      canonical: `https://socialmate.studio`,
      languages: {
        'x-default': 'https://socialmate.studio',
        en: 'https://socialmate.studio',
        es: 'https://socialmate.studio/es',
        pt: 'https://socialmate.studio/pt',
        fr: 'https://socialmate.studio/fr',
        de: 'https://socialmate.studio/de',
        ru: 'https://socialmate.studio/ru',
        zh: 'https://socialmate.studio/zh',
      },
    },
  }
}

export default async function LocalizedLanding({ locale }: { locale: string }) {
  const prefix = `/${locale}`

  let isLoggedIn = false
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (user) isLoggedIn = true
  } catch { /* safe default */ }

  const live    = PLATFORMS.filter(p => p.status === 'live')
  const soon    = PLATFORMS.filter(p => p.status === 'soon')
  const planned = PLATFORMS.filter(p => p.status === 'planned')

  const t  = await getTranslations({ locale, namespace: 'home' })
  const tc = await getTranslations({ locale, namespace: 'common' })

  return (
    <div className="dark min-h-screen bg-gray-950">
      <PublicNav />

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs font-bold px-4 py-2 rounded-full mb-8">
          {t('badge')}
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-gray-900 dark:text-gray-100">
          {t('headline')}{' '}
          <span className="text-gray-400 dark:text-gray-500">{t('headline_emphasis')}</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('subheadline')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <Link
            href={`${prefix}/signup`}
            className="bg-black text-white font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all text-base w-full sm:w-auto text-center">
            {t('cta_primary')}
          </Link>
          <Link
            href={`${prefix}/pricing`}
            className="text-gray-500 dark:text-gray-400 font-semibold hover:text-black dark:hover:text-white transition-all text-base">
            {t('cta_pricing')}
          </Link>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">{t('no_card')}</p>

        <div className="mt-10 max-w-md mx-auto bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-base flex-shrink-0">👤</div>
            <div>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{t('built_by_name')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('built_by_desc')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 max-w-2xl mx-auto">
          {[
            { value: '5',   labelKey: 'stats.platforms' },
            { value: '12',  labelKey: 'stats.ai_tools'  },
            { value: '$0',  labelKey: 'stats.price'     },
          ].map(stat => (
            <div key={stat.labelKey} className="text-center">
              <p className="text-4xl font-extrabold tracking-tight">{stat.value}</p>
              <p className="text-xs text-gray-400 font-semibold mt-1">{t(stat.labelKey as Parameters<typeof t>[0])}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FREE TIER CALLOUT */}
      <section className="bg-black text-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('free_tier.eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">
              {t('free_tier.headline')}
            </h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              {t('free_tier.subheadline')}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: '🤖', value: '50',      labelKey: 'free_tier.ai_credits'            },
              { icon: '📅', value: '2 weeks', labelKey: 'free_tier.scheduling_window'     },
              { icon: '👥', value: '2',        labelKey: 'free_tier.team_seats'           },
              { icon: '💾', value: '1 GB',     labelKey: 'free_tier.media_storage'        },
              { icon: '📝', value: '100',      labelKey: 'free_tier.posts_month'          },
              { icon: '📊', value: '30 days',  labelKey: 'free_tier.analytics'            },
              { icon: '🔗', value: tc('free'), labelKey: 'free_tier.link_in_bio'          },
              { icon: '🔭', value: '3',        labelKey: 'free_tier.competitor_tracking'  },
            ].map(stat => (
              <div key={stat.labelKey} className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className="text-lg font-extrabold">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t(stat.labelKey as Parameters<typeof t>[0])}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href={`${prefix}/signup`}
              className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
              {t('free_tier.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* PLATFORMS */}
      <section id="platforms" className="border-t border-gray-100 dark:border-gray-800 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">{t('platforms.eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-gray-100">{t('platforms.headline')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">{t('platforms.subheadline')}</p>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3 text-center">{t('platforms.live_label')}</p>
              <div className="flex flex-wrap justify-center gap-3">
                {live.map(p => (
                  <div key={p.name}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-800 rounded-xl text-sm font-bold text-gray-800 dark:text-gray-200">
                    <span>{p.icon}</span>{p.name}
                    <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-950 px-1.5 py-0.5 rounded-full">{t('platforms.live_badge')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 text-center">{t('platforms.soon_label')}</p>
              <div className="flex flex-wrap justify-center gap-3">
                {soon.map(p => (
                  <div key={p.name}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400">
                    <span>{p.icon}</span>{p.name}
                    <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded-full">{t('platforms.soon_badge')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 text-center">{t('platforms.planned_label')}</p>
              <div className="flex flex-wrap justify-center gap-3">
                {planned.map(p => (
                  <div key={p.name}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-400 dark:text-gray-500">
                    <span>{p.icon}</span>{p.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLIPS STUDIO */}
      <section className="py-20 bg-gradient-to-br from-purple-950 via-gray-950 to-black text-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-purple-900/60 border border-purple-700/50 text-purple-300 text-xs font-bold px-4 py-2 rounded-full mb-6">
              {t('clips.badge')}
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">{t('clips.headline')}</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">{t('clips.subheadline')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
              <div className="text-3xl mb-3">🟣</div>
              <h3 className="font-bold text-base mb-2">{t('clips.twitch_title')}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{t('clips.twitch_desc')}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-red-500/40 transition-all">
              <div className="text-3xl mb-3">▶️</div>
              <h3 className="font-bold text-base mb-2">{t('clips.youtube_title')}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{t('clips.youtube_desc')}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/40 transition-all">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-bold text-base mb-2">{t('clips.search_title')}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{t('clips.search_desc')}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-12 text-center">
            {[
              { step: '1', labelKey: 'clips.step1' },
              { step: '2', labelKey: 'clips.step2' },
              { step: '3', labelKey: 'clips.step3' },
            ].map((item, i) => (
              <div key={item.step} className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                  <span className="text-xs font-bold text-purple-400">{item.step}</span>
                  <span className="text-sm font-semibold text-white">{t(item.labelKey as Parameters<typeof t>[0])}</span>
                </div>
                {i < 2 && <span className="text-gray-600 text-lg hidden sm:block">→</span>}
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href={`${prefix}/signup`}
              className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3.5 rounded-2xl transition-all text-sm">
              {t('clips.cta')}
            </Link>
            <p className="text-xs text-gray-600 mt-3">{t('clips.cta_note')}</p>
          </div>
        </div>
      </section>

      {/* AI TOOLS */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">{t('ai_tools.eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-gray-100">{t('ai_tools.headline')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">{t('ai_tools.subheadline')}</p>
          </div>
          <div className="text-center">
            <Link href={`${prefix}/ai-features`}
              className="inline-block bg-black text-white font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all text-sm">
              {t('ai_tools.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">{t('features.eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-gray-100">{t('features.headline')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('features.subheadline')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: '📅', titleKey: 'features.items.scheduling_title', descKey: 'features.items.scheduling_desc' },
              { icon: '🤖', titleKey: 'features.items.ai_title',         descKey: 'features.items.ai_desc'         },
              { icon: '📊', titleKey: 'features.items.analytics_title',  descKey: 'features.items.analytics_desc'  },
              { icon: '🔗', titleKey: 'features.items.bio_title',        descKey: 'features.items.bio_desc'        },
              { icon: '👥', titleKey: 'features.items.team_title',       descKey: 'features.items.team_desc'       },
              { icon: '🏢', titleKey: 'features.items.workspaces_title', descKey: 'features.items.workspaces_desc' },
              { icon: '♻️', titleKey: 'features.items.evergreen_title',  descKey: 'features.items.evergreen_desc'  },
              { icon: '📡', titleKey: 'features.items.rss_title',        descKey: 'features.items.rss_desc'        },
              { icon: '🔭', titleKey: 'features.items.competitor_title', descKey: 'features.items.competitor_desc' },
            ].map((f, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-gray-500 transition-all">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-sm font-extrabold mb-2 text-gray-900 dark:text-gray-100">{t(f.titleKey as Parameters<typeof t>[0])}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t(f.descKey as Parameters<typeof t>[0])}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">{t('comparison.eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-gray-100">{t('comparison.headline')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">{t('comparison.subheadline')}</p>
          </div>
          <div className="mt-8 bg-black rounded-2xl p-6 text-white text-center">
            <p className="text-sm font-extrabold mb-1">{t('comparison.cta_headline')}</p>
            <p className="text-xs text-gray-400 mb-1">{t('comparison.cta_sub1')}</p>
            <p className="text-xs text-amber-400 mb-5">{t('comparison.cta_sub2')}</p>
            <Link href={`${prefix}/signup`}
              className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm">
              {t('comparison.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* SUSTAINABILITY */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">{t('sustainability.eyebrow')}</p>
          <h2 className="text-3xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-gray-100">{t('sustainability.headline')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">{t('sustainability.subheadline')}</p>
          <div className="inline-flex items-center gap-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 mb-12">
            <span className="text-base">🚫</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('sustainability.no_ads')}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: '🆓', titleKey: 'sustainability.free_tier_title', descKey: 'sustainability.free_tier_desc' },
              { icon: '⚡', titleKey: 'sustainability.credits_title',   descKey: 'sustainability.credits_desc'   },
              { icon: '🔒', titleKey: 'sustainability.no_bait_title',   descKey: 'sustainability.no_bait_desc'   },
            ].map((card, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 text-left hover:border-gray-300 dark:hover:border-gray-500 transition-all">
                <div className="text-2xl mb-3">{card.icon}</div>
                <h3 className="text-sm font-extrabold mb-2 text-gray-900 dark:text-gray-100">{t(card.titleKey as Parameters<typeof t>[0])}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t(card.descKey as Parameters<typeof t>[0])}</p>
              </div>
            ))}
          </div>
          <Link href={`${prefix}/signup`}
            className="inline-block bg-black text-white font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all">
            {t('sustainability.cta')}
          </Link>
        </div>
      </section>

      {/* SM-GIVE */}
      <section className="py-16 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gray-950 dark:bg-gray-900 rounded-2xl px-5 sm:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">❤️</span>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">{t('sm_give.eyebrow')}</span>
              </div>
              <h2 className="text-xl font-extrabold text-white mb-3 tracking-tight">{t('sm_give.headline')}</h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-md">{t('sm_give.desc')}</p>
            </div>
            <div className="flex flex-col items-center gap-3 flex-shrink-0">
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { emoji: '🎒', labelKey: 'sm_give.school'   },
                  { emoji: '👶', labelKey: 'sm_give.baby'     },
                  { emoji: '🏠', labelKey: 'sm_give.homeless' },
                ].map(tag => (
                  <div key={tag.labelKey} className="text-center">
                    <div className="text-xl mb-1">{tag.emoji}</div>
                    <div className="text-xs text-gray-500 font-medium leading-tight">{t(tag.labelKey as Parameters<typeof t>[0])}</div>
                  </div>
                ))}
              </div>
              <Link href="/give"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-all border border-amber-400/30 hover:border-amber-400/60 px-5 py-2 rounded-xl mt-2">
                {t('sm_give.learn_more')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">{t('final_cta.headline')}</h2>
          <p className="text-gray-400 mb-8 text-sm max-w-lg mx-auto">{t('final_cta.subheadline')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={`${prefix}/signup`}
              className="bg-white text-black font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all text-base w-full sm:w-auto text-center">
              {t('final_cta.cta_primary')}
            </Link>
            <Link href={`${prefix}/pricing`}
              className="text-gray-400 font-semibold hover:text-white transition-all text-sm">
              {t('final_cta.cta_secondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 bg-black dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-6">
          <div className="flex items-center gap-2 mb-8">
            <img src="/logo.png" alt="SocialMate" className="w-7 h-7 rounded-lg" />
            <span className="text-sm font-bold text-white">SocialMate</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-gray-800">
            <a href="https://www.producthunt.com/posts/socialmate-2"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FF6154] hover:bg-[#e5564a] text-white text-xs font-semibold rounded-lg transition-colors">
              Featured on Product Hunt
            </a>
            <p className="text-xs text-gray-600">© 2026 SocialMate · All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
