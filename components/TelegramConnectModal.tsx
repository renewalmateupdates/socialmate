'use client'

import { useState } from 'react'

interface TelegramConnectModalProps {
  onSuccess: (username: string) => void
  onClose: () => void
}

export default function TelegramConnectModal({ onSuccess, onClose }: TelegramConnectModalProps) {
  const [botToken, setBotToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)

    if (!botToken.trim()) {
      setError('Bot token is required.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/accounts/telegram/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: botToken.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Connection failed. Check your bot token.')
        return
      }

      onSuccess(data.username)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center text-xl">
              ✈️
            </div>
            <div>
              <h2 className="text-white font-semibold text-base">Connect Telegram</h2>
              <p className="text-gray-400 text-xs">Uses a Bot Token from @BotFather</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-3 text-xs text-sky-300 space-y-1">
          <p className="font-medium">How to get a Bot Token:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-sky-400/80">
            <li>Open Telegram and search for <span className="font-medium">@BotFather</span></li>
            <li>Send <span className="font-medium">/newbot</span> and follow the prompts</li>
            <li>Copy the token BotFather gives you (looks like <span className="font-medium">123456:ABC-DEF...</span>)</li>
          </ol>
        </div>

        {/* Form */}
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Bot Token</label>
          <input
            type="text"
            placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-400 text-sm hover:border-gray-500 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {loading ? 'Connecting...' : 'Connect Bot'}
          </button>
        </div>
      </div>
    </div>
  )
}