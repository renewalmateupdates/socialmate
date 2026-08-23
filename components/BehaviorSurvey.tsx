'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/contexts/I18nContext'

/**
 * `value` is what gets stored in user_survey_responses and read on
 * /admin/overview; `key` is what the user sees. They are deliberately separate
 * so translating the options does not turn the admin read-out into nine
 * languages of the same answer.
 */
const REASONS = [
  { value: 'Scheduling across platforms',            key: 'app_survey.reason_scheduling' },
  { value: 'The AI tools',                           key: 'app_survey.reason_ai' },
  { value: 'SOMA auto-posting',                      key: 'app_survey.reason_soma' },
  { value: 'Supporting multiple platforms at once',  key: 'app_survey.reason_platforms' },
  { value: 'The price',                              key: 'app_survey.reason_price' },
  { value: 'All of the above',                       key: 'app_survey.reason_all' },
]

export default function BehaviorSurvey() {
  const [show, setShow]         = useState(false)
  const [userId, setUserId]     = useState<string | null>(null)
  const [reason, setReason]     = useState('')
  const [suggest, setSuggest]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)

      const dismissedKey = `sm_survey_done_${user.id}`
      if (localStorage.getItem(dismissedKey)) return

      // One increment per browser session (sessionStorage clears on tab close)
      const sessionKey = `sm_session_counted_${user.id}`
      if (sessionStorage.getItem(sessionKey)) return
      sessionStorage.setItem(sessionKey, '1')

      const countKey = `sm_sessions_${user.id}`
      const count = parseInt(localStorage.getItem(countKey) ?? '0', 10) + 1
      localStorage.setItem(countKey, String(count))

      // Show on 3rd login session and every 10 after (13, 23, 33...)
      if (count === 3 || (count > 3 && (count - 3) % 10 === 0)) {
        timerId = setTimeout(() => setShow(true), 45_000)
      }
    })

    return () => clearTimeout(timerId)
  }, [])

  const dismiss = () => {
    if (userId) localStorage.setItem(`sm_survey_done_${userId}`, '1')
    setShow(false)
  }

  const submit = async () => {
    if (!reason || !userId) return
    setLoading(true)
    try {
      await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, suggest: suggest.trim() || null }),
      })
      localStorage.setItem(`sm_survey_done_${userId}`, '1')
      setDone(true)
      setTimeout(() => setShow(false), 2500)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-surface border border-theme rounded-2xl shadow-2xl p-6">
        {done ? (
          <div className="text-center py-4">
            <p className="font-semibold text-theme text-sm">{t('app_survey.thanks')}</p>
            <p className="text-xs text-app-faint mt-1">{t('app_survey.thanks_sub')}</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-ink">{t('app_survey.title')}</span>
                <p className="text-xs text-app-faint mt-1">{t('app_survey.subtitle')}</p>
              </div>
              <button onClick={dismiss}
                className="text-app-faint hover:text-theme text-xl leading-none ml-3"
                aria-label={t('app_common.close')}>×</button>
            </div>

            <p className="text-sm font-semibold text-theme mb-3">
              {t('app_survey.question')}
            </p>
            <div className="space-y-1.5 mb-5">
              {REASONS.map(r => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition-all ${
                    reason === r.value
                      ? 'border-amber/50 bg-amber/[0.1] text-amber-ink font-semibold'
                      : 'border-theme text-app-muted hover:border-theme-md hover:text-theme'
                  }`}
                >
                  {t(r.key)}
                </button>
              ))}
            </div>

            <p className="text-sm font-semibold text-theme mb-2">
              {t('app_survey.recommend_question')}{' '}
              <span className="font-normal text-app-faint">({t('app_common.optional').toLowerCase()})</span>
            </p>
            <textarea
              value={suggest}
              onChange={e => setSuggest(e.target.value)}
              placeholder={t('app_survey.recommend_placeholder')}
              rows={2}
              className="w-full text-sm border border-theme bg-app-raised text-theme rounded-xl px-3 py-2 outline-none resize-none focus:border-amber/50 transition-all placeholder:text-app-ghost mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={dismiss}
                className="flex-1 text-sm text-app-muted hover:text-theme py-2 rounded-xl border border-theme hover:border-theme-md transition-all"
              >
                {t('app_survey.skip')}
              </button>
              <button
                onClick={submit}
                disabled={!reason || loading}
                className="flex-1 bg-gradient-to-b from-amber-bright to-amber text-void text-sm font-bold py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? t('app_survey.sending') : `${t('app_survey.send')} →`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
