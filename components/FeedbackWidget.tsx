'use client'
import { useState } from 'react'

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
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message }),
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
    <div className="fixed bottom-6 left-6 z-50">
      {open && (
        <div className="mb-3 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-5">
          {done ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">🙏</div>
              <p className="text-sm font-bold">Thanks for the feedback!</p>
              <p className="text-xs text-gray-400 mt-1">It goes straight to the founder.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-extrabold">Send Feedback</p>
                <button onClick={() => setOpen(false)}
                  className="text-gray-300 hover:text-gray-500 transition-all text-lg leading-none">
                  ×
                </button>
              </div>

              {/* TYPE SELECTOR */}
              <div className="flex gap-2 mb-4">
                {TYPES.map(t => (
                  <button key={t.id} onClick={() => setType(t.id)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
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
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none resize-none focus:border-gray-400 transition-all placeholder:text-gray-300"
              />

              <button
                onClick={handleSubmit}
                disabled={!message.trim() || loading}
                className="mt-3 w-full bg-black text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
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
        className="w-10 h-10 bg-black text-white rounded-full shadow-lg hover:opacity-80 transition-all flex items-center justify-center text-base">
        {open ? '×' : '💬'}
      </button>
    </div>
  )
}