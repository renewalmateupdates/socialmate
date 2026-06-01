'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'

const CHALLENGE_DAYS = 30
const CHALLENGE_REWARD = 50

function getDayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export default function ChallengePage() {
  const { t } = useI18n()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [postedDays, setPostedDays] = useState<Set<string>>(new Set())
  const [alreadyRewarded, setAlreadyRewarded] = useState(false)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)
      if (!u) { setLoading(false); return }

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - CHALLENGE_DAYS + 1)
      thirtyDaysAgo.setHours(0, 0, 0, 0)

      const { data: posts } = await supabase
        .from('posts')
        .select('scheduled_at, created_at')
        .eq('user_id', u.id)
        .in('status', ['published', 'scheduled'])
        .gte('scheduled_at', thirtyDaysAgo.toISOString())

      const days = new Set<string>()
      for (const p of posts ?? []) {
        const d = new Date(p.scheduled_at || p.created_at)
        days.add(getDayKey(d))
      }
      setPostedDays(days)

      // Calculate current streak
      let s = 0
      const today = new Date()
      for (let i = 0; i < CHALLENGE_DAYS; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        if (days.has(getDayKey(d))) s++
        else break
      }
      setStreak(s)

      // Check if already rewarded
      const { data: ach } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', u.id)
        .eq('achievement_key', '30_day_challenge')
        .maybeSingle()
      setAlreadyRewarded(!!ach)

      setLoading(false)
    }
    init()
  }, [])

  // Build 30-day grid from today backwards
  const today = new Date()
  const days: Date[] = []
  for (let i = CHALLENGE_DAYS - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d)
  }

  const completedCount = days.filter(d => postedDays.has(getDayKey(d))).length
  const isComplete = completedCount >= CHALLENGE_DAYS
  const pct = Math.round((completedCount / CHALLENGE_DAYS) * 100)

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
    </div>
  )

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white gap-4">
      <p className="text-xl font-bold">{t('challenge.sign_in_prompt')}</p>
      <a href="/login?redirect=/challenge" className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl">{t('challenge.sign_in_btn')}</a>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🔥</div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">{t('challenge.title')}</h1>
          <p className="text-gray-400 text-base">
            {t('challenge.subtitle_before')} <span className="text-amber-400 font-bold">{CHALLENGE_REWARD} {t('challenge.bonus_credits')}</span> {t('challenge.subtitle_after')}
          </p>
        </div>

        {/* Completion banner */}
        {isComplete && (
          <div className={`rounded-2xl p-6 text-center mb-8 ${alreadyRewarded ? 'bg-emerald-900/30 border border-emerald-500/40' : 'bg-amber-500/20 border border-amber-500/40'}`}>
            <p className="text-2xl mb-1">{alreadyRewarded ? '✅' : '🎉'}</p>
            <p className="font-extrabold text-lg">
              {alreadyRewarded ? `${t('challenge.complete_already')} ${CHALLENGE_REWARD} ${t('challenge.credits_awarded')}` : `${t('challenge.you_did_it')} ${CHALLENGE_REWARD} ${t('challenge.credits_incoming')}`}
            </p>
            {!alreadyRewarded && (
              <p className="text-sm text-gray-400 mt-1">{t('challenge.credits_timing')}</p>
            )}
          </div>
        )}

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: t('challenge.days_posted'), value: completedCount, suffix: `/ ${CHALLENGE_DAYS}`, color: 'amber' },
            { label: t('challenge.current_streak'), value: streak, suffix: ` ${t('challenge.days_suffix')}`, color: 'orange' },
            { label: t('challenge.completion'), value: pct, suffix: '%', color: isComplete ? 'emerald' : 'amber' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <p className={`text-3xl font-extrabold ${s.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {s.value}<span className="text-base font-normal text-gray-500">{s.suffix}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{t('challenge.progress')}</span>
            <span>{completedCount}/{CHALLENGE_DAYS} days</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* 30-day grid */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <p className="text-sm font-bold text-gray-400 mb-4">{t('challenge.last_30_days')}</p>
          <div className="grid grid-cols-10 gap-2">
            {days.map((d, i) => {
              const key = getDayKey(d)
              const posted = postedDays.has(key)
              const isToday = getDayKey(d) === getDayKey(today)
              return (
                <div
                  key={i}
                  title={`${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${posted ? ' ✓' : ''}`}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    posted
                      ? 'bg-amber-500 text-black'
                      : isToday
                        ? 'bg-gray-700 border-2 border-amber-500/60 text-gray-400'
                        : 'bg-gray-800 text-gray-600'
                  }`}
                >
                  {d.getDate()}
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-500 rounded inline-block" /> {t('challenge.legend_posted')}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-800 rounded inline-block" /> {t('challenge.legend_no_post')}</span>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <p className="font-bold mb-3">{t('challenge.how_it_works')}</p>
          <ul className="space-y-2 text-sm text-gray-400">
            {[
              t('challenge.rule1'),
              t('challenge.rule2'),
              t('challenge.rule3'),
              t('challenge.rule4').replace('{credits}', String(CHALLENGE_REWARD)),
              t('challenge.rule5'),
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">✦</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        {completedCount === 0 && (
          <div className="text-center">
            <Link
              href="/compose"
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-2xl transition-all text-base"
            >
              ✏️ {t('challenge.cta_start')}
            </Link>
          </div>
        )}
        {completedCount > 0 && !isComplete && (
          <div className="text-center">
            <Link
              href="/compose"
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-2xl transition-all text-base"
            >
              ✏️ {t('challenge.cta_keep_going')}
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
