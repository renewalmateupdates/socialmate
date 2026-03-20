'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ${className}`} />
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

type FilterType = 'all' | 'draft' | 'scheduled' | 'published'

export default function Drafts() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['draft', 'scheduled', 'published', 'partial', 'failed'])
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadPosts()

    // Realtime subscription — auto-update when post status changes
    const channel = supabase
      .channel('posts-status')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          setPosts(prev =>
            prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p)
          )
        }
      )
      .subscribe()

    // Auto-refresh every 30s when there are past-due scheduled posts
    const interval = setInterval(async () => {
      const now = new Date().toISOString()
      setPosts(prev => {
        const hasPastDueScheduled = prev.some(
          p => p.status === 'scheduled' && p.scheduled_at && p.scheduled_at <= now
        )
        if (hasPastDueScheduled) loadPosts()
        return prev
      })
    }, 30_000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [router])

  const handleRefresh = () => {
    setLoading(true)
    loadPosts()
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) { showToast('Failed to delete', 'error'); setDeleting(null); return }
    setPosts(prev => prev.filter(d => d.id !== id))
    setConfirmDelete(null)
    showToast('Deleted successfully', 'success')
    setDeleting(null)
  }

  const draftCount     = posts.filter(d => d.status === 'draft').length
  const scheduledCount = posts.filter(d => d.status === 'scheduled').length
  const publishedCount = posts.filter(d => ['published', 'partial'].includes(d.status)).length
  const failedCount    = posts.filter(d => d.status === 'failed').length

  const filtered = filter === 'all'       ? posts :
                   filter === 'published' ? posts.filter(d => ['published', 'partial', 'failed'].includes(d.status)) :
                   posts.filter(d => d.status === filter)

  const statusConfig: Record<string, { label: string; bg: string; text: string; icon: string }> = {
    draft:     { label: 'Draft',     bg: 'bg-gray-100 dark:bg-gray-800',   text: 'text-gray-500 dark:text-gray-400',   icon: '📂' },
    scheduled: { label: 'Scheduled', bg: 'bg-blue-100',   text: 'text-blue-600',   icon: '📅' },
    published: { label: 'Published', bg: 'bg-green-100',  text: 'text-green-700',  icon: '✅' },
    partial:   { label: 'Partial',   bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '⚠️' },
    failed:    { label: 'Failed',    bg: 'bg-red-100',    text: 'text-red-600',    icon: '❌' },
  }

  return (
    <div className="min-h-screen bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Posts</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {loading ? 'Loading...' : `${draftCount} draft${draftCount !== 1 ? 's' : ''} · ${scheduledCount} scheduled · ${publishedCount} published`}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="text-xs font-bold px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all disabled:opacity-40">
                ↻ Refresh
              </button>
              <Link href="/compose"
                className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                + New Post
              </Link>
            </div>
          </div>

          {/* STATS */}
          {!loading && posts.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Drafts',    value: draftCount,     icon: '📂', color: 'text-gray-700'  },
                { label: 'Scheduled', value: scheduledCount, icon: '📅', color: 'text-blue-600'  },
                { label: 'Published', value: publishedCount, icon: '✅', color: 'text-green-600' },
                { label: 'Failed',    value: failedCount,    icon: '❌', color: 'text-red-500'   },
              ].map(stat => (
                <div key={stat.label} className="bg-surface border border-theme rounded-2xl p-4 text-center">
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* FILTER TABS */}
          <div className="flex items-center gap-1 bg-surface border border-theme rounded-2xl p-1 mb-6 w-fit flex-wrap">
            {[
              { id: 'all',       label: `All (${posts.length})`         },
              { id: 'draft',     label: `Drafts (${draftCount})`        },
              { id: 'scheduled', label: `Scheduled (${scheduledCount})` },
              { id: 'published', label: `Published (${publishedCount})` },
            ].map(tab => (
              <button key={tab.id} onClick={() => setFilter(tab.id as FilterType)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  filter === tab.id ? 'bg-black text-white' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <SkeletonBox key={i} className="h-24" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-surface border border-theme rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-sm font-bold mb-1">No {filter === 'all' ? '' : filter + ' '}posts yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
                {filter === 'scheduled' ? 'Schedule a post and it will appear here.' :
                 filter === 'published' ? 'Posts you publish will appear here.' :
                 'Start writing and save as a draft to come back to it later.'}
              </p>
              <Link href="/compose"
                className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                Compose a post →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(post => {
                const isConfirming = confirmDelete === post.id
                const isDeleting   = deleting === post.id
                const status       = statusConfig[post.status] || statusConfig.draft
                const isEditable   = ['draft', 'scheduled'].includes(post.status)
                const isPublished  = ['published', 'partial', 'failed'].includes(post.status)

                return (
                  <div key={post.id}
                    className="bg-surface border border-theme rounded-2xl p-4 md:p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all">

                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                            {status.icon} {status.label}
                          </span>
                          {post.scheduled_at && post.status === 'scheduled' && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {new Date(post.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {' '}at{' '}
                              {new Date(post.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {post.published_at && isPublished && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {' '}at{' '}
                              {new Date(post.published_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          <span className="text-xs text-gray-300 dark:text-gray-600 ml-auto">{timeAgo(post.created_at)}</span>
                        </div>

                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2 mb-3">
                          {post.content || <span className="text-gray-300 dark:text-gray-600 italic">No content</span>}
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(post.platforms || []).slice(0, 6).map((p: string) => (
                            <span key={p} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                              <span>{PLATFORM_ICONS[p] || '📱'}</span>
                              <span className="hidden sm:inline">{PLATFORM_NAMES[p] || p}</span>
                            </span>
                          ))}
                          {(post.platforms || []).length > 6 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">+{post.platforms.length - 6} more</span>
                          )}
                          {(!post.platforms || post.platforms.length === 0) && (
                            <span className="text-xs text-gray-300 dark:text-gray-600">No platforms selected</span>
                          )}
                        </div>
                      </div>

                      {!isConfirming && (
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          {isEditable && (
                            <Link href={`/compose?draft=${post.id}`}
                              className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                              Edit →
                            </Link>
                          )}
                          <button onClick={() => setConfirmDelete(post.id)}
                            className="text-xs font-bold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {isConfirming && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-2">
                        <p className="text-xs text-red-600 font-semibold flex-1">
                          Permanently delete this {post.status === 'scheduled' ? 'scheduled post' : post.status === 'published' ? 'published post record' : 'draft'}? This cannot be undone.
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => handleDelete(post.id)} disabled={isDeleting}
                            className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
                            {isDeleting
                              ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>
                              : 'Yes, delete'}
                          </button>
                          <button onClick={() => setConfirmDelete(null)}
                            className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
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