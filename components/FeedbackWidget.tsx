'use client'
import { useState, useEffect } from 'react'

type FeedbackType = 'bug' | 'feature' | 'general'

const TYPES: { id: FeedbackType; label: string; emoji: string }[] = [
  { id: 'bug',     label: 'Bug',     emoji: '🐛' },
  { id: 'feature', label: 'Idea',    emoji: '💡' },
  { id: 'general', label: 'General', emoji: '💬' },
]

export default function FeedbackWidget() {
  const [open, setOpen]         = useState(false)
  const [type, setType]         = useState<FeedbackType>('general')
  const [message, setMessage]   = useState('')
  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Try to pre-fill email from Supabase session
  useEffect(() => {
    try {
      const rawSession = localStorage.getItem('supabase-session')
        || Object.keys(localStorage).reduce<string | null>((acc, k) => {
          if (k.includes('supabase') && k.includes('auth') && !acc) {
            return localStorage.getItem(k)
          }
          return acc
        }, null)
      if (rawSession) {
        const parsed = JSON.parse(rawSession)
        const e = parsed?.user?.email || parsed?.session?.user?.email
        if (e) { setEmail(e); setUserEmail(e) }
      }
    } catch { /* silent */ }
  }, [])

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, email: email.trim() || undefined }),
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

  const handleClose = () => {
    setOpen(false)
    setDone(false)
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/40"
          onClick={handleClose}
        />
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 pointer-events-none">
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 pointer-events-auto"
            onClick={e => e.stopPropagation()}
          >
            {done ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🙏</div>
                <p className="text-sm font-bold">Thanks! We read every message ✓</p>
                <p className="text-xs text-gray-400 mt-1">Goes straight to the founder.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm font-extrabold">Send Feedback</p>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-all text-xl leading-none w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100">
                    ×
                  </button>
                </div>

                {/* TYPE SELECTOR */}
                <div className="flex gap-2 mb-4">
                  {TYPES.map(t => (
                    <button key={t.id} onClick={() => setType(t.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                        type === t.id
                          ? 'bg-black text-white border-black'
                          : 'border-gray-200 text-gray-500 hover:border-gray-400'
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
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none resize-none focus:border-gray-400 transition-all placeholder:text-gray-300 mb-3"
                />

                {/* Email */}
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  readOnly={!!userEmail}
                  placeholder="Your email (optional)"
                  className={`w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-gray-400 transition-all mb-4 ${
                    userEmail ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''
                  }`}
                />

                <button
                  onClick={handleSubmit}
                  disabled={!message.trim() || loading}
                  className="w-full bg-pink-500 text-white text-sm font-bold py-3 rounded-xl hover:bg-pink-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  {loading ? 'Sending...' : 'Send Feedback →'}
                </button>

                <p className="text-xs text-gray-300 text-center mt-2">
                  Goes straight to the founder
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating trigger button — bottom right */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg transition-all flex items-center justify-center text-lg font-bold"
        title="Send feedback">
        {open ? '×' : '💬'}
      </button>
    </>
  )
}
