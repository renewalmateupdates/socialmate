'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type ConnectedAccount = {
  id: string
  platform: string
  username: string
  avatar?: string
  connected_at: string
}

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸', color: 'bg-pink-50 border-pink-200', limit: 2200, desc: 'Photos, Reels & Stories' },
  { id: 'twitter', label: 'X / Twitter', icon: '🐦', color: 'bg-sky-50 border-sky-200', limit: 280, desc: 'Short-form posts & threads' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'bg-blue-50 border-blue-200', limit: 3000, desc: 'Professional networking' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', color: 'bg-black/5 border-gray-200', limit: 2200, desc: 'Short-form video' },
  { id: 'facebook', label: 'Facebook', icon: '📘', color: 'bg-blue-50 border-blue-200', limit: 63206, desc: 'Pages & Groups' },
  { id: 'pinterest', label: 'Pinterest', icon: '📌', color: 'bg-red-50 border-red-200', limit: 500, desc: 'Visual discovery' },
  { id: 'youtube', label: 'YouTube', icon: '▶️', color: 'bg-red-50 border-red-200', limit: 5000, desc: 'Video descriptions' },
  { id: 'threads', label: 'Threads', icon: '🧵', color: 'bg-gray-50 border-gray-200', limit: 500, desc: 'Instagram threads' },
  { id: 'snapchat', label: 'Snapchat', icon: '👻', color: 'bg-yellow-50 border-yellow-200', limit: 250, desc: 'Snaps & Stories' },
  { id: 'bluesky', label: 'Bluesky', icon: '🦋', color: 'bg-sky-50 border-sky-200', limit: 300, desc: 'Decentralized social' },
  { id: 'reddit', label: 'Reddit', icon: '🤖', color: 'bg-orange-50 border-orange-200', limit: 40000, desc: 'Communities & posts' },
  { id: 'discord', label: 'Discord', icon: '💬', color: 'bg-indigo-50 border-indigo-200', limit: 2000, desc: 'Server announcements' },
  { id: 'telegram', label: 'Telegram', icon: '✈️', color: 'bg-sky-50 border-sky-200', limit: 4096, desc: 'Channel broadcasting' },
  { id: 'mastodon', label: 'Mastodon', icon: '🐘', color: 'bg-purple-50 border-purple-200', limit: 500, desc: 'Federated social network' },
  { id: 'lemon8', label: 'Lemon8', icon: '🍋', color: 'bg-yellow-50 border-yellow-200', limit: 2200, desc: 'Lifestyle content' },
  { id: 'bereal', label: 'BeReal', icon: '📷', color: 'bg-gray-50 border-gray-200', limit: 200, desc: 'Authentic moments' },
]

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

export default function Accounts() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [search, setSearch] = useState('')
  const [showConnected, setShowConnected] = useState(false)
  const router = useRouter()

  const AI_CREDITS_LEFT = 15
  const AI_CREDITS_TOTAL = 15
  const ACCOUNTS_TOTAL = 16

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

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId)
    await new Promise(r => setTimeout(r, 1200))

    const platform = PLATFORMS.find(p => p.id === platformId)
    const mockUsername = `@${user.email?.split('@')[0]}_${platformId}`

    const { error } = await supabase.from('connected_accounts').insert({
      user_id: user.id,
      platform: platformId,
      username: mockUsername,
      connected_at: new Date().toISOString(),
    })

    if (!error) {
      const { data } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', platformId)
        .single()
      if (data) setAccounts(prev => [...prev, data])
      showToast(`${platform?.label} connected!`, 'success')
    } else {
      showToast('Failed to connect account', 'error')
    }
    setConnecting(null)
  }

  const handleDisconnect = async (accountId: string, platform: string) => {
    setDisconnecting(accountId)
    await supabase.from('connected_accounts').delete().eq('id', accountId)
    setAccounts(prev => prev.filter(a => a.id !== accountId))
    setDisconnecting(null)
    showToast(`${platform} disconnected`, 'success')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getConnected = (platformId: string) => accounts.find(a => a.platform === platformId)

  const filtered = PLATFORMS.filter(p => {
    const matchSearch = p.label.toLowerCase().includes(search.toLowerCase())
    const matchConnected = showConnected ? !!getConnected(p.id) : true
    return matchSearch && matchConnected
  })

  const connectedCount = accounts.length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <div className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2">Content</div>
          {[
            { icon: "🏠", label: "Dashboard", href: "/dashboard" },
            { icon: "📅", label: "Calendar", href: "/calendar" },
            { icon: "✏️", label: "Compose", href: "/compose" },
            { icon: "📂", label: "Drafts", href: "/drafts" },
            { icon: "⏳", label: "Queue", href: "/queue" },
            { icon: "#️⃣", label: "Hashtags", href: "/hashtags" },
            { icon: "🖼️", label: "Media Library", href: "/media" },
            { icon: "📝", label: "Templates", href: "/templates" },
            { icon: "🔗", label: "Link in Bio", href: "/link-in-bio" },
            { icon: "📆", label: "Bulk Scheduler", href: "/bulk-scheduler" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Insights</div>
          {[
            { icon: "📊", label: "Analytics", href: "/analytics" },
            { icon: "🔍", label: "Best Times", href: "/best-times" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Settings</div>
          {[
            { icon: "🔗", label: "Accounts", href: "/accounts", active: true },
            { icon: "👥", label: "Team", href: "/team" },
            { icon: "⚙️", label: "Settings", href: "/settings" },
            { icon: "🎁", label: "Referrals", href: "/referral" },
            { icon: "🔔", label: "Notifications", href: "/notifications" },
            { icon: "🔎", label: "Search", href: "/search" },
          ].map(item => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${'active' in item && item.active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">AI Credits</span>
              <span className="text-xs font-bold text-gray-700">{AI_CREDITS_LEFT}/{AI_CREDITS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full" style={{ width: `${(AI_CREDITS_LEFT / AI_CREDITS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{AI_CREDITS_LEFT} credits remaining</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">Accounts</span>
              <span className="text-xs font-bold text-gray-700">{connectedCount}/{ACCOUNTS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full transition-all" style={{ width: `${(connectedCount / ACCOUNTS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{ACCOUNTS_TOTAL - connectedCount} slots remaining</p>
          </div>
          <Link href="/pricing" className="w-full block text-center bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            ⚡ Upgrade to Pro
          </Link>
          <div className="px-1">
            <div className="text-xs text-gray-400 truncate mb-1">{user?.email}</div>
            <button onClick={handleSignOut} className="w-full text-left px-0 py-1 text-xs text-gray-400 hover:text-black transition-all">Sign out</button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="ml-56 flex-1 p-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Social Accounts</h1>
            <p className="text-sm text-gray-400 mt-0.5">Connect up to {ACCOUNTS_TOTAL} platforms — all free, no limits</p>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {loading ? (
            [1,2,3].map(i => <SkeletonBox key={i} className="h-20 rounded-2xl" />)
          ) : (
            [
              { label: 'Connected', value: connectedCount, icon: '✅', sub: 'platforms linked' },
              { label: 'Available', value: ACCOUNTS_TOTAL - connectedCount, icon: '🔓', sub: 'slots remaining' },
              { label: 'Total Platforms', value: ACCOUNTS_TOTAL, icon: '🌐', sub: 'supported free' },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                  <span>{stat.icon}</span>
                </div>
                <div className="text-2xl font-extrabold tracking-tight">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
              </div>
            ))
          )}
        </div>

        {/* FREE TIER BANNER */}
        <div className="bg-black text-white rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="font-bold text-sm tracking-tight">🎉 All 16 platforms included free</p>
            <p className="text-xs text-white/60 mt-0.5">No per-channel fees. No platform limits. Connect everything at zero cost.</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-extrabold">$0</p>
            <p className="text-xs text-white/60">forever</p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search platforms..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white"
            />
          </div>
          <button
            onClick={() => setShowConnected(prev => !prev)}
            className={`text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${showConnected ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
          >
            ✅ Connected Only
          </button>
        </div>

        {/* PLATFORM GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => <SkeletonBox key={i} className="h-40 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(platform => {
              const connected = getConnected(platform.id)
              const isConnecting = connecting === platform.id
              const isDisconnecting = disconnecting === connected?.id

              return (
                <div
                  key={platform.id}
                  className={`bg-white rounded-2xl border p-5 flex flex-col gap-3 transition-all ${connected ? 'border-green-200 bg-green-50/30' : 'border-gray-100 hover:border-gray-300'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl ${platform.color}`}>
                      {platform.icon}
                    </div>
                    {connected && (
                      <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        ✓ Connected
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-bold tracking-tight">{platform.label}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{platform.desc}</p>
                    {connected ? (
                      <p className="text-xs text-gray-500 mt-1.5 font-medium">{connected.username}</p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1.5">{platform.limit.toLocaleString()} char limit</p>
                    )}
                  </div>

                  {connected ? (
                    <button
                      onClick={() => handleDisconnect(connected.id, platform.label)}
                      disabled={!!isDisconnecting}
                      className="w-full py-2 text-xs font-semibold border border-red-200 text-red-400 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(platform.id)}
                      disabled={!!isConnecting || !!connecting}
                      className="w-full py-2 text-xs font-semibold bg-black text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {isConnecting ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        '+ Connect'
                      )}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm font-bold mb-1">No platforms found</p>
            <p className="text-xs text-gray-400">Try a different search term</p>
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}