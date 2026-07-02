'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const REASONS = [
  'Scheduling across platforms',
  'The AI tools',
  'SOMA auto-posting',
  'Supporting multiple platforms at once',
  'The price',
  'All of the above',
]

export default function BehaviorSurvey() {
  const [show, setShow]         = useState(false)
  const [userId, setUserId]     = useState<string | null>(null)
  const [reason, setReason]     = useState('')
  const [suggest, setSuggest]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)

      const dismissedKey = `sm_survey_done_${user.id}`
      if (localStorage.getItem(dismissedKey)) return

      const countKey = `sm_sessions_${user.id}`
      const count = parseInt(localStorage.getItem(countKey) ?? '0', 10) + 1
      localStorage.setItem(countKey, String(count))

      // Show on 3rd session and every 10 after if not answered
      if (count === 3 || (count > 3 && count % 10 === 0)) {
        setTimeout(() => setShow(true), 45_000)
      }
    })
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
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
        {done ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">🙏</div>
            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">Thanks — this genuinely helps.</p>
            <p className="text-xs text-gray-400 mt-1">Goes straight to Joshua.</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-extrabold text-gray-900 dark:text-gray-100 text-sm">Quick question</p>
                <p className="text-xs text-gray-400 mt-0.5">30 seconds. Helps us build what you actually need.</p>
              </div>
              <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 text-xl leading-none ml-3 mt-0.5">×</button>
            </div>

            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              What keeps you coming back to SocialMate?
            </p>
            <div className="space-y-2 mb-5">
              {REASONS.map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition-all ${
                    reason === r
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-semibold'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              What would make you recommend us? <span className="font-normal text-gray-400">(optional)</span>
            </p>
            <textarea
              value={suggest}
              onChange={e => setSuggest(e.target.value)}
              placeholder="Anything — a missing feature, a broken flow, a platform we need..."
              rows={2}
              className="w-full text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl px-3 py-2 outline-none resize-none focus:border-amber-400 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-500 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={dismiss}
                className="flex-1 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-2 rounded-xl border border-gray-200 dark:border-gray-600 transition-all"
              >
                Skip
              </button>
              <button
                onClick={submit}
                disabled={!reason || loading}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
