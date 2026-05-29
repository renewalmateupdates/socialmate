import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Metadata } from 'next'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import UserStatsCounter from '@/components/UserStatsCounter'

// Direct JSON imports — zero next-intl dependency
import enMessages from '@/messages/en.json'
import esMessages from '@/messages/es.json'
import ptMessages from '@/messages/pt.json'
import frMessages from '@/messages/fr.json'
import deMessages from '@/messages/de.json'
import ruMessages from '@/messages/ru.json'
import zhMessages from '@/messages/zh.json'
import jaMessages from '@/messages/ja.json'
import koMessages from '@/messages/ko.json'

const ALL_MESSAGES: Record<string, typeof enMessages> = {
  en: enMessages, es: esMessages, pt: ptMessages,
  fr: frMessages, de: deMessages, ru: ruMessages, zh: zhMessages,
  ja: jaMessages as unknown as typeof enMessages,
  ko: koMessages as unknown as typeof enMessages,
}

/**
 * createT — looks up key in locale namespace first, falls back to English.
 * Any new key added to en.json is automatically shown in English on all locale
 * pages until a proper translation is provided — no broken keys ever.
 */
function createT(ns: Record<string, unknown>, enNs?: Record<string, unknown>) {
  return function t(key: string): string {
    const parts = key.split('.')
    let val: unknown = ns
    for (const p of parts) val = (val as Record<string, unknown>)?.[p]
    if (typeof val === 'string') return val
    if (enNs) {
      let fb: unknown = enNs
      for (const p of parts) fb = (fb as Record<string, unknown>)?.[p]
      if (typeof fb === 'string') return fb
    }
    return key
  }
}

const PLATFORMS = [
  { name: 'Discord',     icon: '💬', status: 'live'    },
  { name: 'Bluesky',     icon: '🦋', status: 'live'    },
  { name: 'Telegram',    icon: '✈️', status: 'live'    },
  { name: 'Mastodon',    icon: '🐘', status: 'live'    },
  { name: 'X / Twitter', icon: '🐦', status: 'live'    },
  { name: 'LinkedIn',    icon: '💼', status: 'live'    },
  { name: 'YouTube',     icon: '▶️', status: 'soon'    },
  { name: 'Pinterest',   icon: '📌', status: 'soon'    },
  { name: 'Reddit',      icon: '🤖', status: 'soon'    },
  { name: 'TikTok',      icon: '🎵', status: 'live'    },
  { name: 'Instagram',   icon: '📸', status: 'planned' },
  { name: 'Facebook',    icon: '📘', status: 'planned' },
  { name: 'Threads',     icon: '🧵', status: 'planned' },
  { name: 'Snapchat',    icon: '👻', status: 'planned' },
  { name: 'Lemon8',      icon: '🍋', status: 'planned' },
  { name: 'BeReal',      icon: '📷', status: 'planned' },
]

// AI tool names are product feature names — intentionally English across all locales
const AI_TOOLS = [
  { name: 'Caption Generator',    emoji: '✍️',  credits: '5 credits',    proOnly: false },
  { name: 'Hashtag Generator',    emoji: '#️⃣', credits: '5 credits',    proOnly: false },
  { name: 'Post Rewriter',        emoji: '🔁',  credits: '5 credits',    proOnly: false },
  { name: 'Viral Hook Generator', emoji: '🎣',  credits: '5 credits',    proOnly: false },
  { name: 'Thread Generator',     emoji: '🧵',  credits: '10 credits',   proOnly: false },
  { name: 'Content Repurposer',   emoji: '♻️',  credits: '10 credits',   proOnly: false },
  { name: 'Post Score',           emoji: '⚡',  credits: '5 credits',    proOnly: false },
  { name: 'SM-Pulse',             emoji: '🔥',  credits: '20 credits',   proOnly: false },
  { name: 'SM-Radar',             emoji: '📡',  credits: '20 credits',   proOnly: false },
  { name: 'Content Gap Detector', emoji: '🕳️', credits: '10 credits',   proOnly: false },
  { name: 'AI Content Calendar',  emoji: '📅',  credits: '25 cr · Pro+', proOnly: true  },
  { name: 'AI Image Generation',  emoji: '🎨',  credits: '25 cr · Pro+', proOnly: true  },
]

// Comparison row labels are translated; values (prices, checkmarks) are universal
const COMPARISON_ROWS = [
  { rowKey: 'comparison.rows.starting_price',   industry: '$25–$99/month',         socialmate: '$0 — free forever'   },
  { rowKey: 'comparison.rows.free_plan',         industry: '❌ Removed or crippled', socialmate: '✅ Genuinely free'  },
  { rowKey: 'comparison.rows.ai_tools',          industry: '1–2 basic',             socialmate: '15+ tools included'  },
  { rowKey: 'comparison.rows.bulk_scheduling',   industry: 'Paid add-on',           socialmate: '✅ Free'              },
  { rowKey: 'comparison.rows.link_in_bio',       industry: 'Separate paid tool',    socialmate: '✅ Free on all plans' },
  { rowKey: 'comparison.rows.competitor',        industry: 'Paid add-on',           socialmate: '✅ Free'              },
  { rowKey: 'comparison.rows.evergreen',         industry: 'Paid add-on',           socialmate: '✅ Free'              },
  { rowKey: 'comparison.rows.rss',               industry: '❌ Not included',        socialmate: '✅ Free'              },
  { rowKey: 'comparison.rows.team_seats',        industry: 'Per seat fee',          socialmate: '2 seats free'        },
  { rowKey: 'comparison.rows.client_workspaces', industry: 'Enterprise only',       socialmate: 'From $5/mo'          },
  { rowKey: 'comparison.rows.white_label',       industry: 'Enterprise only',       socialmate: 'From $20/mo'         },
]

export function generateLocaleMetadata(locale: string): Metadata {
  const msgs = ALL_MESSAGES[locale] ?? ALL_MESSAGES.en
  const t = createT(msgs.home as Record<string, unknown>, enMessages.home as Record<string, unknown>)
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
        ja: 'https://socialmate.studio/ja',
        ko: 'https://socialmate.studio/ko',
      },
    },
  }
}

export default async function LocalizedLanding({ locale }: { locale: string }) {
  const prefix = `/${locale}`
  const msgs   = ALL_MESSAGES[locale] ?? ALL_MESSAGES.en
  const enHome   = enMessages.home   as Record<string, unknown>
  const enCommon = enMessages.common as Record<string, unknown>

  const t  = createT(msgs.home   as Record<string, unknown>, enHome)
  const tc = createT(msgs.common as Record<string, unknown>, enCommon)

  let isLoggedIn = false
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (user) isLoggedIn = true
  } catch { /* safe default */ }

  const live    = PLATFORMS.filter(p => p.status === 'live')
  const soon    = PLATFORMS.filter(p => p.status === 'soon')
  const planned = PLATFORMS.filter(p => p.status === 'planned')

  return (
    <div className="dark min-h-screen bg-gray-950">
      <PublicNav />

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-amber-500/8 blur-[130px]" />
          <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] rounded-full bg-purple-600/8 blur-[100px]" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-600/6 blur-[100px]" />
        </div>

        <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-white text-xs font-bold px-4 py-2 rounded-full mb-8">
          {t('badge')}
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.08] text-white">
          {t('hero_headline')}<br />
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
            {t('hero_tagline')}
          </span>
        </h1>

        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          {t('subheadline')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {live.map(p => (
            <div key={p.name}
              className="flex items-center gap-1.5 bg-gray-800/80 border border-gray-700/60 text-gray-200 text-xs font-semibold px-3 py-1.5 rounded-xl backdrop-blur-sm hover:border-gray-500 transition-colors">
              <span>{p.icon}</span><span>{p.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 bg-gray-800/40 border border-gray-700/40 text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-xl">
            {t('more_coming')}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <Link href={`${prefix}/signup`}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-2xl transition-all text-base w-full sm:w-auto text-center shadow-lg shadow-amber-500/25">
            {t('cta_primary')}
          </Link>
          <Link href={`${prefix}/pricing`}
            className="text-gray-400 font-semibold hover:text-white transition-all text-base">
            {t('cta_pricing')}
          </Link>
        </div>
        <p className="text-xs text-gray-500">{t('cta_no_card')}</p>

        <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-14 max-w-xl mx-auto">
          {[
            { value: '7',   labelKey: 'stats.platforms' },
            { value: '15+', labelKey: 'stats.ai_tools'  },
            { value: '$0',  labelKey: 'stats.price'     },
          ].map(stat => (
            <div key={stat.labelKey} className="text-center">
              <p className="text-4xl font-extrabold tracking-tight text-white">{stat.value}</p>
              <p className="text-xs text-gray-400 font-medium mt-1">{t(stat.labelKey)}</p>
            </div>
          ))}
        </div>

        {/* Live user stats — same component as English page */}
        <div className="mt-6">
          <UserStatsCounter />
        </div>

        <div className="mt-10 max-w-sm mx-auto bg-gray-900/60 border border-gray-800 rounded-2xl px-5 py-3.5 text-left backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm flex-shrink-0">👤</div>
            <div>
              <p className="text-xs font-bold text-gray-200">{t('built_by_name')}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t('built_by_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FREE TIER CALLOUT ──────────────────────────────────────────── */}
      <section className="bg-black text-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('free_tier.eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">{t('free_tier.headline')}</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">{t('free_tier.subheadline')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: '🤖', value: '50',      labelKey: 'free_tier.ai_credits'          },
              { icon: '📅', value: '2 weeks', labelKey: 'free_tier.scheduling_window'   },
              { icon: '👥', value: '2',       labelKey: 'free_tier.team_seats'          },
              { icon: '💾', value: '1 GB',    labelKey: 'free_tier.media_storage'       },
              { icon: '📝', value: '100',     labelKey: 'free_tier.posts_month'         },
              { icon: '📊', value: '30 days', labelKey: 'free_tier.analytics'           },
              { icon: '🔗', value: tc('free'),labelKey: 'free_tier.link_in_bio'         },
              { icon: '🔭', value: '3',       labelKey: 'free_tier.competitor_tracking' },
            ].map(stat => (
              <div key={stat.labelKey} className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className="text-lg font-extrabold">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t(stat.labelKey)}</p>
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

      {/* ── PLATFORMS ─────────────────────────────────────────────────── */}
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

      {/* ── CLIPS STUDIO ──────────────────────────────────────────────── */}
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
            {[
              { icon: '🟣', titleKey: 'clips.twitch_title', descKey: 'clips.twitch_desc', hov: 'hover:border-purple-500/40' },
              { icon: '▶️', titleKey: 'clips.youtube_title', descKey: 'clips.youtube_desc', hov: 'hover:border-red-500/40' },
              { icon: '🔍', titleKey: 'clips.search_title', descKey: 'clips.search_desc', hov: 'hover:border-blue-500/40' },
            ].map(c => (
              <div key={c.titleKey} className={`bg-white/5 border border-white/10 rounded-2xl p-6 ${c.hov} transition-all`}>
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="font-bold text-base mb-2">{t(c.titleKey)}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{t(c.descKey)}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-12 text-center">
            {['clips.step1','clips.step2','clips.step3'].map((key, i) => (
              <div key={key} className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                  <span className="text-xs font-bold text-purple-400">{i + 1}</span>
                  <span className="text-sm font-semibold text-white">{t(key)}</span>
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

      {/* ── AI TOOLS ──────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">{t('ai_tools.eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-gray-100">{t('ai_tools.headline')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">{t('ai_tools.subheadline')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {AI_TOOLS.map(tool => (
              <div key={tool.name}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-center hover:border-gray-300 dark:hover:border-gray-500 transition-all relative">
                {tool.proOnly && (
                  <span className="absolute top-2 right-2 text-xs font-bold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full">Pro+</span>
                )}
                <div className="text-2xl mb-2">{tool.emoji}</div>
                <p className="text-xs font-bold leading-snug mb-1 text-gray-900 dark:text-gray-100">{tool.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{tool.credits}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-black rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-extrabold text-lg">SM-Pulse</p>
                  <p className="text-xs text-gray-400">Real-time trend intelligence</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-white/20 rounded-full flex-shrink-0">20 credits</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Scans Reddit and YouTube right now to surface trending topics, viral formats,
                and engagement spikes in your niche — before you create your next post.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-extrabold text-lg text-gray-900 dark:text-gray-100">SM-Radar</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Personal growth intelligence</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex-shrink-0">20 credits</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Analyzes live Reddit and YouTube data to surface content gaps, competitor weaknesses,
                and the single best content strategy for your niche this week.
              </p>
            </div>
          </div>
          <div className="text-center">
            <Link href={`${prefix}/ai-features`}
              className="inline-block bg-black text-white font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all text-sm">
              {t('ai_tools.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURE GRID ──────────────────────────────────────────────── */}
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
                <h3 className="text-sm font-extrabold mb-2 text-gray-900 dark:text-gray-100">{t(f.titleKey)}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ────────────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">{t('comparison.eyebrow')}</p>
            <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-gray-100">{t('comparison.headline')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">{t('comparison.subheadline')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-x-auto">
            <div className="min-w-[420px]">
              <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-4 md:px-6 py-4">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{t('comparison.col_feature')}</span>
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide text-center">{t('comparison.col_typical')}</span>
                <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wide text-center">{t('comparison.col_socialmate')}</span>
              </div>
              {COMPARISON_ROWS.map((row, i) => (
                <div key={i} className={`grid grid-cols-3 px-4 md:px-6 py-3.5 items-center ${
                  i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                } border-b border-gray-50 dark:border-gray-700 last:border-0`}>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t(row.rowKey)}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 text-center">{row.industry}</span>
                  <span className="text-xs font-bold text-black dark:text-white text-center">{row.socialmate}</span>
                </div>
              ))}
            </div>
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

      {/* ── LINK IN BIO ───────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full mb-4">
                {t('bio_link.badge')}
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-gray-100">
                {t('bio_link.headline')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                {t('bio_link.subheadline')}
              </p>
              <div className="space-y-2 mb-6">
                {['bio_link.feature_themes','bio_link.feature_icons','bio_link.feature_url','bio_link.feature_domain','bio_link.feature_branding'].map(key => (
                  <div key={key} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className="text-green-500 font-bold flex-shrink-0">✓</span>{t(key)}
                  </div>
                ))}
              </div>
              <Link href={`${prefix}/signup`}
                className="inline-block bg-black text-white font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all text-sm">
                {t('bio_link.cta')}
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
              <div className="bg-gray-900 rounded-xl p-6 text-white text-center">
                <div className="w-14 h-14 rounded-full bg-gray-600 flex items-center justify-center text-2xl mx-auto mb-3">👤</div>
                <p className="font-bold text-sm mb-1">{t('bio_link.demo_name')}</p>
                <p className="text-xs text-gray-400 mb-4">{t('bio_link.demo_bio')}</p>
                <div className="space-y-2">
                  {['bio_link.demo_link1','bio_link.demo_link2','bio_link.demo_link3'].map(k => (
                    <div key={k} className="bg-white text-gray-900 text-xs font-bold py-2 px-4 rounded-lg">{t(k)}</div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-4">{t('bio_link.demo_footer')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW WE STAY FREE ──────────────────────────────────────────── */}
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
                <h3 className="text-sm font-extrabold mb-2 text-gray-900 dark:text-gray-100">{t(card.titleKey)}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t(card.descKey)}</p>
              </div>
            ))}
          </div>
          <Link href={`${prefix}/signup`}
            className="inline-block bg-black text-white font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all">
            {t('sustainability.cta')}
          </Link>
        </div>
      </section>

      {/* ── GILGAMESH'S GUIDES ────────────────────────────────────────── */}
      <section className="py-20 bg-[#0a0a0a] border-t border-gray-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-4 py-2 rounded-full mb-6">
              {t('guides.badge')}
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3 text-white">{t('guides.headline')}</h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">{t('guides.subheadline')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {[
              { vol: 'Vol. 1', titleKey: 'guides.vol1_title', descKey: 'guides.vol1_desc', href: '/guides/starting-a-business' },
              { vol: 'Vol. 2', titleKey: 'guides.vol2_title', descKey: 'guides.vol2_desc', href: '/guides/marketing-zero-budget' },
              { vol: 'Vol. 3', titleKey: 'guides.vol3_title', descKey: 'guides.vol3_desc', href: '/guides/business-credit-legal' },
              { vol: 'Vol. 4', titleKey: 'guides.vol4_title', descKey: 'guides.vol4_desc', href: '/guides/vibe-coding-with-ai' },
            ].map(g => (
              <div key={g.vol} className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400">{g.vol}</span>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">{t('guides.live_badge')}</span>
                </div>
                <h3 className="font-bold text-white text-sm mb-2">{t(g.titleKey)}</h3>
                <p className="text-xs text-gray-500 leading-relaxed flex-1">{t(g.descKey)}</p>
                <Link href={g.href} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">
                  {t('guides.read_free')}
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/guides" className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-7 py-3 text-sm font-bold text-amber-400 hover:bg-amber-500/20 transition-colors">
              {t('guides.browse_all')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── STORY ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">{t('story.eyebrow')}</p>
          <h2 className="text-3xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-gray-100">{t('story.headline')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-xl mx-auto">{t('story.subheadline')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/story" className="text-sm font-bold text-black dark:text-white underline hover:opacity-70 transition-all">
              {t('story.read_story')}
            </Link>
            <Link href={`${prefix}/pricing`} className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all">
              {t('story.see_pricing')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── SM-GIVE ───────────────────────────────────────────────────── */}
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
                    <div className="text-xs text-gray-500 font-medium leading-tight">{t(tag.labelKey)}</div>
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

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
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

      <PublicFooter />
    </div>
  )
}
