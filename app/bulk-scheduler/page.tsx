'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type BulkPost = {
  id: string
  content: string
  platforms: string[]
  scheduled_at: string
  status: 'ready' | 'error' | 'scheduled'
  error?: string
}

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'twitter', label: 'X / Twitter', icon: '🐦' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'facebook', label: 'Facebook', icon: '📘' },
  { id: 'pinterest', label: 'Pinterest', icon: '📌' },
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
  { id: 'threads', label: 'Threads', icon: '🧵' },
  { id: 'bluesky', label: 'Bluesky', icon: '🦋' },
  { id: 'reddit', label: 'Reddit', icon: '🤖' },
]

const CHAR_LIMITS: Record<string, number> = {
  twitter: 280,
  threads: 500,
  linkedin: 3000,
  instagram: 2200,
  facebook: 63206,
  tiktok: 2200,
  pinterest: 500,
  youtube: 5000,
  bluesky: 300,
  reddit: 40000,
}

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

function getNextSlot(index: number) {
  const base = new Date()
  base.setMinutes(0, 0, 0)
  base.setHours(base.getHours() + 1 + index)
  return base.toISOString().slice(0, 16)
}

export default function BulkScheduler() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<BulkPost[]>([])
  const [defaultPlatforms, setDefaultPlatforms] = useState<string[]>(['instagram'])
  const [scheduling, setScheduling] = useState(false)
  const [scheduled, setScheduled] = useState(0)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [step, setStep] = useState<'compose' | 'review'>('compose')
  const router = useRouter()

  const AI_CREDITS_LEFT = 15
  const AI_CREDITS_TOTAL = 15
  const ACCOUNTS_USED = 0
  const ACCOUNTS_TOTAL = 16

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      setPosts([
        { id: generateId(), content: '', platforms: ['instagram'], scheduled_at: getNextSlot(0), status: 'ready' },
        { id: generateId(), content: '', platforms: ['instagram'], scheduled_at: getNextSlot(1), status: 'ready' },
        { id: generateId(), content: '', platforms: ['instagram'], scheduled_at: getNextSlot(2), status: 'ready' },
      ])
      setLoading(false)
    }
    getUser()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const addPost = () => {
    setPosts(prev => [...prev, {
      id: generateId(),
      content: '',
      platforms: defaultPlatforms,
      scheduled_at: getNextSlot(prev.length),
      status: 'ready',
    }])
  }

  const removePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const updatePost = (id: string, field: keyof BulkPost, value: any) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, [field]: value, status: 'ready', error: undefined } : p))
  }

  const togglePlatform = (postId: string, platformId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const has = p.platforms.includes(platformId)
      return { ...p, platforms: has ? p.platforms.filter(pl => pl !== platformId) : [...p.platforms, platformId] }
    }))
  }

  const applyPlatformsToAll = () => {
    setPosts(prev => prev.map(p => ({ ...p, platforms: defaultPlatforms })))
    showToast('Platforms applied to all posts', 'success')
  }

  const validatePosts = () => {
    let valid = true
    setPosts(prev => prev.map(p => {
      if (!p.content.trim()) return { ...p, status: 'error', error: 'Content is required' }
      if (p.platforms.length === 0) return { ...p, status: 'error', error: 'Select at least one platform' }
      if (!p.scheduled_at) return { ...p, status: 'error', error: 'Schedule a time' }
      const minLimit = Math.min(...p.platforms.map(pl => CHAR_LIMITS[pl] || 9999))
      if (p.content.length > minLimit) return { ...p, status: 'error', error: `Content too long for selected platforms (max ${minLimit} chars)` }
      return { ...p, status: 'ready' }
    }))
    setPosts(prev => {
      valid = prev.every(p => p.status !== 'error')
      return prev
    })
    return valid
  }

  const handleReview = () => {
    const filledPosts = posts.filter(p => p.content.trim())
    if (filledPosts.length === 0) { showToast('Add content to at least one post', 'error'); return }
    setPosts(prev => prev.map(p => {
      if (!p.content.trim()) return p
      if (p.platforms.length === 0) return { ...p, status: 'error', error: 'Select at least one platform' }
      if (!p.scheduled_at) return { ...p, status: 'error', error: 'Schedule a time' }
      return { ...p, status: 'ready' }
    }))
    setStep('review')
  }

  const handleScheduleAll = async () => {
    const toSchedule = posts.filter(p => p.content.trim() && p.platforms.length > 0 && p.scheduled_at)
    if (toSchedule.length === 0) { showToast('No valid posts to schedule', 'error'); return }
    setScheduling(true)
    setScheduled(0)

    let count = 0
    for (const post of toSchedule) {
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: post.content,
        platforms: post.platforms,
        scheduled_at: new Date(post.scheduled_at).toISOString(),
        status: 'scheduled',
      })
      if (!error) {
        count++
        setScheduled(count)
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'scheduled' } : p))
      } else {
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'error', error: 'Failed to schedule' } : p))
      }
      await new Promise(r => setTimeout(r, 150))
    }

    setScheduling(false)
    showToast(`${count} post${count !== 1 ? 's' : ''} scheduled successfully!`, 'success')
  }

  const readyCount = posts.filter(p => p.content.trim()).length
  const errorCount = posts.filter(p => p.status === 'error').length
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
            { icon: "📆", label: "Bulk Scheduler", href: "/bulk-scheduler", active: true },
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
            { icon: "🔎", label: "Search", href: "/search" },
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

      <div className="ml-56 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Bulk Scheduler</h1>
            <p className="text-sm text-gray-400 mt-0.5">Write and schedule multiple posts at once — free, unlimited</p>
          </div>
          <div className="flex items-center gap-2">
            {step === 'review' && (
              <button onClick={() => setStep('compose')} className="text-sm font-semibold px-4 py-2.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                ← Back to Edit
              </button>
            )}
            {step === 'compose' && (
              <button onClick={handleReview} className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                Review {readyCount > 0 ? `(${readyCount})` : ''} →
              </button>
            )}
            {step === 'review' && (
              <button
                onClick={handleScheduleAll}
                disabled={scheduling || scheduledCount === readyCount}
                className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {scheduling ? `Scheduling ${scheduled}/${readyCount}...` : scheduledCount === readyCount && readyCount > 0 ? '✅ All Scheduled!' : `Schedule All (${readyCount})`}
              </button>
            )}
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Posts', value: posts.length, icon: '📝', sub: 'total' },
            { label: 'Ready', value: readyCount, icon: '✅', sub: 'with content' },
            { label: 'Errors', value: errorCount, icon: '⚠️', sub: 'need fixing' },
            { label: 'Scheduled', value: scheduledCount, icon: '📅', sub: 'sent to queue' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                <span>{stat.icon}</span>
              </div>
              <div className="text-2xl font-extrabold tracking-tight">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* DEFAULT PLATFORMS */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold">Default Platforms</p>
              <p className="text-xs text-gray-400 mt-0.5">Select platforms to apply to all posts</p>
            </div>
            <button onClick={applyPlatformsToAll} className="text-xs font-semibold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
              Apply to all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setDefaultPlatforms(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${defaultPlatforms.includes(p.id) ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
              >
                <span>{p.icon}</span>{p.label}
              </button>
            ))}
          </div>
        </div>

        {/* POSTS */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <SkeletonBox key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className={`bg-white border rounded-2xl p-5 transition-all ${
                  post.status === 'error' ? 'border-red-200 bg-red-50/30' :
                  post.status === 'scheduled' ? 'border-green-200 bg-green-50/30 opacity-75' :
                  'border-gray-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Number */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    post.status === 'scheduled' ? 'bg-green-100 text-green-600' :
                    post.status === 'error' ? 'bg-red-100 text-red-500' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {post.status === 'scheduled' ? '✓' : index + 1}
                  </div>

                  <div className="flex-1 space-y-3">
                    {/* Content */}
                    <textarea
                      placeholder={`Post ${index + 1} caption...`}
                      value={post.content}
                      onChange={e => updatePost(post.id, 'content', e.target.value)}
                      disabled={post.status === 'scheduled'}
                      rows={3}
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none disabled:opacity-50 disabled:bg-gray-50"
                    />

                    {post.error && (
                      <p className="text-xs font-semibold text-red-500">⚠️ {post.error}</p>
                    )}

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Platforms */}
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {PLATFORMS.map(p => (
                          <button
                            key={p.id}
                            onClick={() => togglePlatform(post.id, p.id)}
                            disabled={post.status === 'scheduled'}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 ${
                              post.platforms.includes(p.id) ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-400 hover:border-gray-400'
                            }`}
                          >
                            <span>{p.icon}</span>
                            <span className="hidden sm:inline">{p.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Schedule time */}
                      <input
                        type="datetime-local"
                        value={post.scheduled_at}
                        onChange={e => updatePost(post.id, 'scheduled_at', e.target.value)}
                        disabled={post.status === 'scheduled'}
                        className="text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-gray-400 disabled:opacity-50"
                      />

                      {/* Remove */}
                      {post.status !== 'scheduled' && (
                        <button onClick={() => removePost(post.id)} className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all text-lg">
                          ×
                        </button>
                      )}
                    </div>

                    {/* Char count */}
                    {post.content && post.platforms.length > 0 && (
                      <div className="flex gap-3 flex-wrap">
                        {post.platforms.map(pl => {
                          const limit = CHAR_LIMITS[pl]
                          if (!limit) return null
                          const over = post.content.length > limit
                          return (
                            <span key={pl} className={`text-xs font-semibold ${over ? 'text-red-500' : 'text-gray-400'}`}>
                              {PLATFORMS.find(p => p.id === pl)?.icon} {post.content.length}/{limit}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add post button */}
            {posts.filter(p => p.status !== 'scheduled').length > 0 || scheduledCount === 0 ? (
              <button
                onClick={addPost}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-semibold text-gray-400 hover:border-gray-400 hover:text-black transition-all"
              >
                + Add Another Post
              </button>
            ) : null}

            {/* All scheduled success */}
            {scheduledCount > 0 && scheduledCount === readyCount && !scheduling && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <h3 className="font-bold text-green-800 mb-1">{scheduledCount} post{scheduledCount !== 1 ? 's' : ''} scheduled!</h3>
                <p className="text-sm text-green-600 mb-4">Your posts are queued and ready to go.</p>
                <div className="flex items-center justify-center gap-3">
                  <Link href="/queue" className="text-sm font-semibold px-4 py-2 bg-green-600 text-white rounded-xl hover:opacity-80 transition-all">
                    View Queue →
                  </Link>
                  <button onClick={() => { setPosts([{ id: generateId(), content: '', platforms: defaultPlatforms, scheduled_at: getNextSlot(0), status: 'ready' }]); setStep('compose') }} className="text-sm font-semibold px-4 py-2 border border-green-200 text-green-700 rounded-xl hover:border-green-400 transition-all">
                    Schedule More
                  </button>
                </div>
              </div>
            )}
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
