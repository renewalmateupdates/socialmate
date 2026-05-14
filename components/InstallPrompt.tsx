'use client'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show,           setShow]           = useState(false)
  const [installed,      setInstalled]      = useState(false)

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // Don't show if dismissed recently (7-day cooldown)
    const dismissed = localStorage.getItem('pwa_install_dismissed')
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show after a short delay so it doesn't pop up immediately
      setTimeout(() => setShow(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setShow(false)
    setDeferredPrompt(null)
  }

  function dismiss() {
    localStorage.setItem('pwa_install_dismissed', String(Date.now()))
    setShow(false)
  }

  if (!show || installed) return null

  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm" style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 border border-white/10">
        <img src="/icon-192.png" alt="SocialMate" className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight">Add SocialMate to Home Screen</p>
          <p className="text-xs text-gray-400 mt-0.5">Post from anywhere, instantly</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={dismiss}
            className="text-gray-500 hover:text-gray-300 text-xs font-semibold px-2 py-1"
          >
            Not now
          </button>
          <button
            onClick={install}
            className="bg-amber-400 hover:bg-amber-300 text-black text-xs font-black px-3 py-1.5 rounded-lg transition-all"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  )
}
