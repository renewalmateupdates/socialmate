'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type FeedbackType = 'bug' | 'feature' | 'general'

const TYPES: { id: FeedbackType; label: string; emoji: string }[] = [
  { id: 'bug',     label: 'Bug',     emoji: '🐛' },
  { id: 'feature', label: 'Idea',    emoji: '💡' },
  { id: 'general', label: 'General', emoji: '💬' },
]

export default function FeedbackWidget() {
  const [open, setOpen]       = useState(false)
  const [type, setType]       = useState<FeedbackType>('general')
  const [message, setMessage] = useState('')
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setEmail(data.user.email)
        setIsLoggedIn(true)
      }
    })
  }, [])

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, email: email.trim() }),
      })
      setDone(true)
      setMessage('')
      setTimeout(() => {
        setDone(false)
        setOpen(false)
      }, 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl p-5">
          {done ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">🙏</div>
              <p className="text-sm font-bold">Thanks for the feedback!</p>
              <p className="text-xs text-gray-400 mt-1">It goes straight to the founder.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-extrabold">Share Feedback</p>
                <button onClick={() => setOpen(false)}
                  className="text-gray-300 hover:text-gray-500 transition-all text-xl leading-none">
                  ×
                </button>
              </div>

              {/* TYPE SELECTOR */}
              <div className="flex gap-2 mb-4">
                {TYPES.map(t => (
                  <button key={t.id} onClick={() => setType(t.id)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      type === t.id
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'border-gray-200 text-gray-500 hover:border-pink-300'
                    }`}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>

              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={
                  type === 'bug'     ? "What's broken? What did you expect?" :
                  type === 'feature' ? "What would make SocialMate better?" :
                  "Share anything on your mind..."
                }
                rows={4}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none resize-none focus:border-pink-400 transition-all placeholder:text-gray-300 mb-3"
              />

              {!isLoggedIn && (
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email (optional)"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-pink-400 transition-all mb-3"
                />
              )}

              {isLoggedIn && email && (
                <p className="text-xs text-gray-400 mb-3">Sending as {email}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!message.trim() || loading}
                className="w-full bg-pink-500 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-pink-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? 'Sending...' : 'Send Feedback →'}
              </button>

              <p className="text-xs text-gray-300 text-center mt-2">
                Goes straight to the founder
              </p>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        title="Share feedback"
        className="w-12 h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg transition-all flex items-center justify-center text-lg font-bold">
        {open ? '×' : '💬'}
      </button>
    </div>
  )
}
