'use client'

import { useState } from 'react'

interface BlueskyConnectModalProps {
  onSuccess: (handle: string, displayName: string) => void
  onClose: () => void
}

export default function BlueskyConnectModal({ onSuccess, onClose }: BlueskyConnectModalProps) {
  const [handle, setHandle] = useState('')
  const [appPassword, setAppPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)

    if (!handle.trim() || !appPassword.trim()) {
      setError('Both fields are required.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/accounts/bluesky/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.trim(), appPassword: appPassword.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Connection failed. Check your handle and app password.')
        return
      }

      onSuccess(data.handle, data.displayName)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-sky-400" fill="currentColor">
                <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.204-.659-.299-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white font-semibold text-base">Connect Bluesky</h2>
              <p className="text-gray-400 text-xs">Uses an App Password — not your main password</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-3 text-xs text-sky-300 space-y-1">
          <p className="font-medium">How to get an App Password:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-sky-400/80">
            <li>Go to Settings → Privacy and Security → App Passwords</li>
            <li>Click <span className="font-medium">Add App Password</span></li>
            <li>Name it "SocialMate" and copy the generated password</li>
          </ol>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Bluesky Handle</label>
            <input
              type="text"
              placeholder="yourhandle.bsky.social"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">App Password</label>
            <input
              type="password"
              placeholder="xxxx-xxxx-xxxx-xxxx"
              value={appPassword}
              onChange={(e) => setAppPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
            {error}
          </div>
        )}

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
            {loading ? 'Connecting...' : 'Connect Account'}
          </button>
        </div>
      </div>
    </div>
  )
}