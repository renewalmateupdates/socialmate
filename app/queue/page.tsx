'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type Post = {
  id: string
  content: string
  platform: string
  status: string
  scheduled_at: string | null
  created_at: string
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  twitter: '🐦',
  x: '🐦',
  linkedin: '💼',
  tiktok: '🎵',
  facebook: '📘',
  pinterest: '📌',
  youtube: '▶️',
  threads: '🧵',
  snapchat: '👻',
  bluesky: '🦋',
  reddit: '🤖',
  discord: '💬',
  telegram: '✈️',
  mastodon: '🐘',
  lemon8: '🍋',
  bereal: '📷',
  whatsapp: '💚',
}

function getPlatformIcon(platform: string) {
  return PLATFORM_ICONS[platform?.toLowerCase()] || '📱'
}

function formatScheduled(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor(diff / (1000 * 60))

  if (mins < 0) return { label: 'Overdue', color: 'text-red-500', bg: 'bg-red-50' }
  if (mins < 60) return { label: `in ${mins}m`, color: 'text-orange-500', bg: 'bg-orange-50' }
  if (hours < 24) return { label: `in ${hours}h`, color: 'text-blue-500', bg: 'bg-blue-50' }
  if (days < 7) return { label: `in ${days}d`, color: 'text-gray-600', bg: 'bg-gray-100' }
  return { label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'text-gray-500', bg: 'bg-gray-100' }
}

export default function Queue() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'draft'>('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const AI_CREDITS_LEFT = 15
  const AI_CREDITS_TOTAL = 15
  const ACCOUNTS_USED = 0
  const ACCOUNTS_TOTAL = 16

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: true })
      setPosts(data || [])
      setLoading(false)
    }
    getData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('posts').delete().eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
    showToast('Post removed from queue', 'success')
  }

  const handleUnschedule = async (post: Post) => {
    await supabase.from('posts').update({ status: 'draft', scheduled_at: null }).eq('id', post.id)
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'draft', scheduled_at: null } : p))
    showToast('Moved to drafts', 'success')
  }

  const platforms = ['all', ...Array.from(new Set(posts.map(p => p.platform).filter(Boolean)))]

  const filtered = posts.filter(p => {
    const matchStatus = filter === 'all' || p.status === filter
    const matchPlatform = platformFilter === 'all' || p.platform === platformFilter
    return matchStatus && matchPlatform
  })

  const scheduled = posts.filter(p => p.status === 'scheduled')
  const drafts = posts.filter(p => p.status === 'draft')
  const overdue = posts.filter(p => p.scheduled_at && new Date(p.scheduled_at) < new Date() && p.status === 'scheduled')

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

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
            { icon: "⏳", label: "Queue", href: "/queue", active: true },
            { icon: "#️⃣", label: "Hashtags", href: "/hashtags" },
            { icon: "🖼️", label: "Media Library", href: "/media" },
{ icon: "📝", label: "Templates", href: "/templates" },
          ].map(item => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${'active' in item && item.active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
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
            { icon: "🔗", label: "Accounts", href: "/accounts" },
            { icon: "👥", label: "Team", href: "/team" },
            { icon: "⚙️", label: "Settings", href: "/settings" },
            { icon: "🎁", label: "Referrals", href: "/referral" },
            { icon: "🔔", label: "Notifications", href: "/notifications" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
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
              <div className="bg-black h-1.5 rounded-full transition-all" style={{ width: `${(AI_CREDITS_LEFT / AI_CREDITS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{AI_CREDITS_LEFT} credits remaining</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">Accounts</span>
              <span className="text-xs font-bold text-gray-700">{ACCOUNTS_USED}/{ACCOUNTS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full transition-all" style={{ width: `${(ACCOUNTS_USED / ACCOUNTS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{ACCOUNTS_TOTAL - ACCOUNTS_USED} slots remaining</p>
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
            <h1 className="text-2xl font-extrabold tracking-tight">Post Queue</h1>
            <p className="text-sm text-gray-400 mt-0.5">All your scheduled and draft posts in one place</p>
          </div>
          <Link href="/compose" className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
            + New Post
          </Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {loading ? (
            [1,2,3,4].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5">
                <SkeletonBox className="h-3 w-16 mb-4" />
                <SkeletonBox className="h-8 w-10 mb-2" />
                <SkeletonBox className="h-3 w-20" />
              </div>
            ))
          ) : (
            [
              { label: "Scheduled", value: scheduled.length.toString(), sub: "ready to publish", icon: "📅" },
              { label: "Drafts", value: drafts.length.toString(), sub: "not yet scheduled", icon: "📂" },
              { label: "Overdue", value: overdue.length.toString(), sub: overdue.length > 0 ? "need attention" : "all good!", icon: "⚠️" },
              { label: "Total", value: posts.length.toString(), sub: "all posts", icon: "📊" },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                  <span className="text-base">{stat.icon}</span>
                </div>
                <div className={`text-3xl font-extrabold tracking-tight mb-1 ${stat.label === 'Overdue' && overdue.length > 0 ? 'text-red-500' : ''}`}>{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.sub}</div>
              </div>
            ))
          )}
        </div>

        {/* OVERDUE BANNER */}
        {!loading && overdue.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-bold text-red-700">{overdue.length} post{overdue.length !== 1 ? 's' : ''} missed their scheduled time</p>
                <p className="text-xs text-red-400">These posts were scheduled but haven't been published yet. Reschedule or move them to drafts.</p>
              </div>
            </div>
          </div>
        )}

        {/* FILTERS */}
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1">
            {(['all', 'scheduled', 'draft'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${filter === f ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
              >
                {f === 'all' ? `All (${posts.length})` : f === 'scheduled' ? `Scheduled (${scheduled.length})` : `Drafts (${drafts.length})`}
              </button>
            ))}
          </div>
          {platforms.length > 1 && (
            <select
              value={platformFilter}
              onChange={e => setPlatformFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-gray-400 bg-white capitalize"
            >
              {platforms.map(p => (
                <option key={p} value={p}>{p === 'all' ? 'All Platforms' : `${getPlatformIcon(p)} ${p.charAt(0).toUpperCase() + p.slice(1)}`}</option>
              ))}
            </select>
          )}
        </div>

        {/* QUEUE LIST */}
        {loading ? (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="px-6 py-4 border-b border-gray-50 flex items-center gap-4">
                <SkeletonBox className="h-10 w-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <SkeletonBox className="h-3 w-3/4" />
                  <SkeletonBox className="h-3 w-1/3" />
                </div>
                <SkeletonBox className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-lg font-bold tracking-tight mb-2">
              {posts.length === 0 ? 'Your queue is empty' : 'No posts match this filter'}
            </h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              {posts.length === 0
                ? 'Start creating posts and scheduling them — they\'ll show up here in order.'
                : 'Try changing the filter above to see more posts.'}
            </p>
            {posts.length === 0 && (
              <Link href="/compose" className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
                Create Your First Post →
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{filtered.length} post{filtered.length !== 1 ? 's' : ''}</span>
              <span className="text-xs text-gray-400">Sorted by scheduled time</span>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map((post, index) => {
                const timing = post.scheduled_at ? formatScheduled(post.scheduled_at) : null
                return (
                  <div key={post.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors group">

                    {/* Position number */}
                    <div className="w-6 text-center text-xs font-bold text-gray-300 mt-3 flex-shrink-0">
                      {index + 1}
                    </div>

                    {/* Platform icon */}
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0 mt-1">
                      {getPlatformIcon(post.platform)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{post.content || 'No content'}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-400 capitalize">{post.platform || 'No platform'}</span>
                        {post.scheduled_at && (
                          <>
                            <span className="text-gray-200">·</span>
                            <span className="text-xs text-gray-400">
                              {new Date(post.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Timing badge */}
                    {timing && (
                      <div className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${timing.bg} ${timing.color}`}>
                        {timing.label}
                      </div>
                    )}

                    {/* Status badge */}
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                      post.status === 'scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {post.status}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                      <Link
                        href={`/compose?edit=${post.id}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-black transition-all text-sm"
                      >
                        ✏️
                      </Link>
                      {post.status === 'scheduled' && (
                        <button
                          onClick={() => handleUnschedule(post)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-yellow-50 hover:text-yellow-600 transition-all text-sm"
                          title="Move to drafts"
                        >
                          📂
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* TOAST */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}
