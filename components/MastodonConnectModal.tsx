'use client'

import { useState } from 'react'

interface MastodonConnectModalProps {
  onClose: () => void
  workspaceId?: string | null
}

export default function MastodonConnectModal({ onClose, workspaceId }: MastodonConnectModalProps) {
  const [instance, setInstance] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleConnect() {
    setError(null)

    if (!instance.trim()) {
      setError('Instance URL is required.')
      return
    }

    // Strip protocol if user pasted a full URL
    const cleaned = instance.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')

    if (!cleaned.includes('.')) {
      setError('Enter a valid instance like mastodon.social')
      return
    }

    // Save workspace context before OAuth redirect
    if (workspaceId) {
      document.cookie = `pending_workspace_id=${workspaceId}; path=/; max-age=300`
    } else {
      document.cookie = `pending_workspace_id=; path=/; max-age=0`
    }
    window.location.href = `/api/accounts/mastodon/connect?instance=${encodeURIComponent(cleaned)}`
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-xl">
              🐘
            </div>
            <div>
              <h2 className="text-white font-semibold text-base">Connect Mastodon</h2>
              <p className="text-gray-400 text-xs">Enter your Mastodon instance to continue</p>
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
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-xs text-purple-300 space-y-1">
          <p className="font-medium">What is an instance?</p>
          <p className="text-purple-400/80">
            Mastodon is decentralized — your account lives on a specific server.
            Common ones include <span className="font-medium">mastodon.social</span>, <span className="font-medium">fosstodon.org</span>, or <span className="font-medium">hachyderm.io</span>.
            Find yours in your profile URL or app settings.
          </p>
        </div>

        {/* Form */}
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Your Instance</label>
          <div className="flex items-center bg-gray-800 border border-gray-600 rounded-lg overflow-hidden focus-within:border-purple-500 transition-colors">
            <span className="text-gray-500 text-sm px-3">https://</span>
            <input
              type="text"
              placeholder="mastodon.social"
              value={instance}
              onChange={(e) => setInstance(e.target.value)}
              className="flex-1 bg-transparent py-2.5 pr-3 text-white text-sm placeholder-gray-500 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            />
          </div>
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
            onClick={handleConnect}
            className="flex-1 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
          >
            Connect with Mastodon
          </button>
        </div>
      </div>
    </div>
  )
}