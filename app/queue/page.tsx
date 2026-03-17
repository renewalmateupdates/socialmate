'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  bluesky: '🦋', reddit: '🤖', discord: '💬', telegram: '✈️',
  mastodon: '🐘', snapchat: '👻', lemon8: '🍋', bereal: '📷',
}

const PLATFORM_NAMES: Record<string, string> = {
  discord: 'Discord', bluesky: 'Bluesky', telegram: 'Telegram', mastodon: 'Mastodon',
  linkedin: 'LinkedIn', youtube: 'YouTube', pinterest: 'Pinterest', reddit: 'Reddit',
  instagram: 'Instagram', twitter: 'Twitter/X', tiktok: 'TikTok', facebook: 'Facebook',
  threads: 'Threads', snapchat: 'Snapchat', lemon8: 'Lemon8', bereal: 'BeReal',
}

function groupByDate(posts: any[]) {
  const groups: Record<string, any[]> = {}
  posts.forEach(post => {
    const date = post.scheduled_at ? new Date(post.scheduled_at).toDateString() : 'Unscheduled'
    if (!groups[date]) groups[date] = []
    groups[date].push(post)
  })
  return groups
}

function formatDateLabel(dateStr: string) {
  if (dateStr === 'Unscheduled') return 'Unscheduled'
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function Queue() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
      setPosts(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const handleCancel = async (id: string) => {
    setCancelling(id)
    const { error } = await supabase
      .from('posts')
      .update({ status: 'draft', scheduled_at: null })
      .eq('id', id)
    if (error) { showToast('Failed to unschedule', 'error'); setCancelling(null); return }
    setPosts(prev => prev.filter(p => p.id !== id))
    setConfirmCancel(null)
    showToast('Moved back to drafts', 'success')
    setCancelling(null)
  }

  const grouped = groupByDate(posts)
  const dateKeys = Object.keys(grouped).sort((a, b) => {
    if (a === 'Unscheduled') return 1
    if (b === 'Unscheduled') return -1
    return new Date(a).getTime() - new Date(b).getTime()
  })

  const daysWithPosts = dateKeys.filter(k => k !== 'Unscheduled').length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Upcoming Queue</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {loading ? 'Loading...' : `${posts.length} post${posts.length !== 1 ? 's' : ''} scheduled${daysWithPosts > 0 ? ` across ${daysWithPosts} day${daysWithPosts !== 1 ? 's' : ''}` : ''}`}
              </p>
            </div>
            <Link href="/compose"
              className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all self-start sm:self-auto">
              + Schedule Post
            </Link>
          </div>

          {/* SUMMARY STATS */}
          {!loading && posts.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Scheduled',   value: posts.length,      icon: '📅' },
                { label: 'Days Ahead',  value: daysWithPosts,     icon: '🗓️' },
                { label: 'Platforms',   value: new Set(posts.flatMap(p => p.platforms || [])).size, icon: '📱' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <p className="text-xl font-extrabold">{stat.value}</p>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <SkeletonBox key={i} className="h-24" />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-sm font-bold mb-1">Your queue is empty</p>
              <p className="text-xs text-gray-400 mb-5">Schedule posts and they'll line up here, grouped by day.</p>
              <Link href="/compose"
                className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                Schedule your first post →
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {dateKeys.map(dateKey => (
                <div key={dateKey}>
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-xs font-extrabold text-gray-900 uppercase tracking-widest">
                      {formatDateLabel(dateKey)}
                    </p>
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400">
                      {grouped[dateKey].length} post{grouped[dateKey].length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {grouped[dateKey].map(post => {
                      const isConfirming = confirmCancel === post.id
                      const isCancelling = cancelling === post.id
                      return (
                        <div key={post.id}
                          className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 hover:border-gray-300 transition-all">
                          <div className="flex items-start gap-4">
                            <div className="flex-1 min-w-0">
                              {post.scheduled_at && (
                                <div className="mb-2">
                                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                    {new Date(post.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              )}
                              <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 mb-3">
                                {post.content || <span className="text-gray-300 italic">No content</span>}
                              </p>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {(post.platforms || []).map((p: string) => (
                                  <span key={p} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                                    <span>{PLATFORM_ICONS[p] || '📱'}</span>
                                    <span className="hidden sm:inline">{PLATFORM_NAMES[p] || p}</span>
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* ACTIONS — always visible, not hover-only */}
                            {!isConfirming && (
                              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                                <Link href="/compose"
                                  className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                                  Edit
                                </Link>
                                <button onClick={() => setConfirmCancel(post.id)}
                                  className="text-xs font-bold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
                                  Unschedule
                                </button>
                              </div>
                            )}
                          </div>

                          {/* CONFIRM UNSCHEDULE */}
                          {isConfirming && (
                            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-2">
                              <p className="text-xs text-red-600 font-semibold flex-1">
                                Move this post back to drafts?
                              </p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleCancel(post.id)}
                                  disabled={isCancelling}
                                  className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
                                  {isCancelling ? (
                                    <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Moving...</>
                                  ) : 'Yes, unschedule'}
                                </button>
                                <button onClick={() => setConfirmCancel(null)}
                                  className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BULK SCHEDULE CTA */}
          {!loading && posts.length > 0 && (
            <div className="mt-8 bg-black rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
              <div>
                <p className="text-sm font-extrabold mb-0.5">Schedule more content at once</p>
                <p className="text-xs text-gray-400">Use the Bulk Scheduler to plan a full week in one session.</p>
              </div>
              <Link href="/bulk-scheduler"
                className="flex-shrink-0 bg-white text-black text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all self-start sm:self-auto">
                Open Bulk Scheduler →
              </Link>
            </div>
          )}

        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${
          toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}