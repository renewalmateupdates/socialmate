'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type Account = {
  id: string
  platform: string
  username: string
  avatar_url: string
  connected_at: string
  status: string
}

const PLATFORM_META: Record<string, { icon: string; color: string; label: string }> = {
  instagram: { icon: '📸', color: 'bg-pink-50 border-pink-200', label: 'Instagram' },
  twitter: { icon: '🐦', color: 'bg-sky-50 border-sky-200', label: 'X / Twitter' },
  linkedin: { icon: '💼', color: 'bg-blue-50 border-blue-200', label: 'LinkedIn' },
  tiktok: { icon: '🎵', color: 'bg-gray-50 border-gray-200', label: 'TikTok' },
  facebook: { icon: '📘', color: 'bg-blue-50 border-blue-200', label: 'Facebook' },
  pinterest: { icon: '📌', color: 'bg-red-50 border-red-200', label: 'Pinterest' },
  youtube: { icon: '▶️', color: 'bg-red-50 border-red-200', label: 'YouTube' },
  threads: { icon: '🧵', color: 'bg-gray-50 border-gray-200', label: 'Threads' },
  snapchat: { icon: '👻', color: 'bg-yellow-50 border-yellow-200', label: 'Snapchat' },
  bluesky: { icon: '🦋', color: 'bg-sky-50 border-sky-200', label: 'Bluesky' },
  reddit: { icon: '🤖', color: 'bg-orange-50 border-orange-200', label: 'Reddit' },
  discord: { icon: '💬', color: 'bg-indigo-50 border-indigo-200', label: 'Discord' },
  telegram: { icon: '✈️', color: 'bg-sky-50 border-sky-200', label: 'Telegram' },
  mastodon: { icon: '🐘', color: 'bg-purple-50 border-purple-200', label: 'Mastodon' },
  lemon8: { icon: '🍋', color: 'bg-yellow-50 border-yellow-200', label: 'Lemon8' },
  bereal: { icon: '📷', color: 'bg-gray-50 border-gray-200', label: 'BeReal' },
}

const ALL_PLATFORMS = Object.keys(PLATFORM_META)

export default function Accounts() {
  const [user, setUser] = useState<any>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('connected_at', { ascending: false })
      setAccounts(data || [])
      setLoading(false)
    }
    getData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDisconnect = async (id: string, platform: string) => {
    await supabase.from('connected_accounts').delete().eq('id', id)
    setAccounts(prev => prev.filter(a => a.id !== id))
    showToast(`${PLATFORM_META[platform]?.label || platform} disconnected`, 'success')
  }

  const handleConnect = (platform: string) => {
    setConnectingPlatform(platform)
    showToast(`${PLATFORM_META[platform]?.label || platform} integration coming soon!`, 'success')
    setTimeout(() => setConnectingPlatform(null), 2000)
  }

  const connectedPlatforms = new Set(accounts.map(a => a.platform))
  const availablePlatforms = ALL_PLATFORMS.filter(p => !connectedPlatforms.has(p))
  const ACCOUNTS_TOTAL = 16

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="ml-56 flex-1 p-8">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Accounts</h1>
              <p className="text-sm text-gray-400 mt-0.5">Manage your connected social media accounts</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white border border-gray-100 rounded-xl px-4 py-2.5">
              {accounts.length}/{ACCOUNTS_TOTAL} accounts connected
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {loading ? [1,2,3].map(i => <SkeletonBox key={i} className="h-20 rounded-2xl" />) : (
              [
                { label: 'Connected', value: accounts.length, icon: '✅', color: 'text-green-600' },
                { label: 'Available', value: availablePlatforms.length, icon: '➕', color: 'text-gray-600' },
                { label: 'Slots Left', value: ACCOUNTS_TOTAL - accounts.length, icon: '🔓', color: 'text-blue-600' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                    <span>{stat.icon}</span>
                  </div>
                  <div className={`text-2xl font-extrabold tracking-tight ${stat.color}`}>{stat.value}</div>
                </div>
              ))
            )}
          </div>

          {!loading && accounts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold tracking-tight mb-4">Connected Accounts</h2>
              <div className="grid grid-cols-1 gap-3">
                {accounts.map(account => {
                  const meta = PLATFORM_META[account.platform] || { icon: '📱', color: 'bg-gray-50 border-gray-200', label: account.platform }
                  return (
                    <div key={account.id} className={`flex items-center gap-4 p-4 bg-white border rounded-2xl ${meta.color} transition-all`}>
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold">{meta.label}</p>
                          <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Connected</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">@{account.username}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-400">
                          Connected {new Date(account.connected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <button onClick={() => handleDisconnect(account.id, account.platform)}
                          className="text-xs font-semibold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 hover:text-red-600 transition-all">
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-bold tracking-tight mb-4">
              {accounts.length === 0 ? 'Connect Your First Account' : 'Add More Accounts'}
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4,5,6].map(i => <SkeletonBox key={i} className="h-16 rounded-2xl" />)}
              </div>
            ) : availablePlatforms.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-sm font-bold">All platforms connected!</p>
                <p className="text-xs text-gray-400 mt-1">You've connected all {ACCOUNTS_TOTAL} available platforms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {availablePlatforms.map(platform => {
                  const meta = PLATFORM_META[platform]
                  const isConnecting = connectingPlatform === platform
                  return (
                    <div key={platform} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-300 transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{meta.label}</p>
                        <p className="text-xs text-gray-400">Not connected</p>
                      </div>
                      <button onClick={() => handleConnect(platform)} disabled={isConnecting}
                        className="text-xs font-semibold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50">
                        {isConnecting ? 'Connecting...' : 'Connect'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-8 bg-gray-50 border border-gray-100 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-sm font-bold mb-1">API Integrations Coming Soon</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Direct publishing to Instagram, Twitter, LinkedIn and more is in development. For now, SocialMate helps you plan, write, and schedule your content — then reminds you when it's time to post. <Link href="/roadmap" className="text-black font-semibold underline">See our roadmap →</Link>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}