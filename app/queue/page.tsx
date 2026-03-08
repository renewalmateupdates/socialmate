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
  }, [router]) // Q1: fixed

  const handleCancel = async (id: string) => {
    setCancelling(id)
    const { error } = await supabase
      .from('posts')
      .update({ status: 'draft', scheduled_at: null })
      .eq('id', id)
    if (error) { showToast('Failed to cancel', 'error'); setCancelling(null); return }
    setPosts(prev => prev.filter(p => p.id !== id))
    showToast('Moved back to drafts', 'success')
    setCancelling(null)
  }

  const grouped = groupByDate(posts)
  const dateKeys = Object.keys(grouped).sort((a, b) => {
    if (a === 'Unscheduled') return 1
    if (b === 'Unscheduled') return -1
    return new Date(a).getTime() - new Date(b).getTime()
  })

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-3xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Upcoming Queue</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {posts.length} post{posts.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>
            <Link href="/compose"
              className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
              + Schedule Post
            </Link>
          </div>

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
                    {grouped[dateKey].map(post => (
                      <div key={post.id}
                        className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-300 transition-all group">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {post.scheduled_at && (
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                  {new Date(post.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 mb-3">
                              {post.content || <span className="text-gray-300 italic">No content</span>}
                            </p>
                            <div className="flex items-center gap-1">
                              {(post.platforms || []).map((p: string) => (
                                <span key={p} className="text-sm">{PLATFORM_ICONS[p] || '📱'}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                            <Link href={`/compose?draft=${post.id}`}
                              className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                              Edit
                            </Link>
                            <button onClick={() => handleCancel(post.id)} disabled={cancelling === post.id}
                              className="text-xs font-bold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all disabled:opacity-40">
                              {cancelling === post.id ? '...' : 'Unschedule'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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