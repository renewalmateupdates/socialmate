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

export default function Drafts() {
  const [drafts, setDrafts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled'>('all')
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
        .in('status', ['draft', 'scheduled'])
        .order('created_at', { ascending: false })
      setDrafts(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) { showToast('Failed to delete', 'error'); setDeleting(null); return }
    setDrafts(prev => prev.filter(d => d.id !== id))
    setConfirmDelete(null)
    showToast('Deleted successfully', 'success')
    setDeleting(null)
  }

  const filtered       = filter === 'all' ? drafts : drafts.filter(d => d.status === filter)
  const draftCount     = drafts.filter(d => d.status === 'draft').length
  const scheduledCount = drafts.filter(d => d.status === 'scheduled').length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Drafts & Queue</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {loading ? 'Loading...' : `${draftCount} draft${draftCount !== 1 ? 's' : ''} · ${scheduledCount} scheduled`}
              </p>
            </div>
            <Link href="/compose"
              className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all self-start sm:self-auto">
              + New Post
            </Link>
          </div>

          {/* STATS */}
          {!loading && drafts.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Total',     value: drafts.length,  icon: '📝' },
                { label: 'Drafts',    value: draftCount,     icon: '📂' },
                { label: 'Scheduled', value: scheduledCount, icon: '📅' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <p className="text-xl font-extrabold">{stat.value}</p>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* FILTER TABS */}
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-2xl p-1 mb-6 w-fit">
            {[
              { id: 'all',       label: `All (${drafts.length})`        },
              { id: 'draft',     label: `Drafts (${draftCount})`        },
              { id: 'scheduled', label: `Scheduled (${scheduledCount})` },
            ].map(tab => (
              <button key={tab.id} onClick={() => setFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  filter === tab.id ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
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
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-sm font-bold mb-1">
                No {filter === 'all' ? '' : filter + ' '}posts yet
              </p>
              <p className="text-xs text-gray-400 mb-5">
                {filter === 'scheduled'
                  ? 'Schedule a post and it will appear here.'
                  : 'Start writing and save as a draft to come back to it later.'}
              </p>
              <Link href="/compose"
                className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                Compose a post →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(draft => {
                const isConfirming = confirmDelete === draft.id
                const isDeleting   = deleting === draft.id
                return (
                  <div key={draft.id}
                    className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 hover:border-gray-300 transition-all">

                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        {/* STATUS + TIME */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            draft.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {draft.status === 'scheduled' ? '📅 Scheduled' : '📂 Draft'}
                          </span>
                          {draft.scheduled_at && (
                            <span className="text-xs text-gray-400">
                              {new Date(draft.scheduled_at).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric',
                              })} at {new Date(draft.scheduled_at).toLocaleTimeString('en-US', {
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </span>
                          )}
                          <span className="text-xs text-gray-300 ml-auto">
                            {timeAgo(draft.created_at)}
                          </span>
                        </div>

                        {/* CONTENT */}
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 mb-3">
                          {draft.content
                            ? draft.content
                            : <span className="text-gray-300 italic">No content</span>}
                        </p>

                        {/* PLATFORMS */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(draft.platforms || []).slice(0, 6).map((p: string) => (
                            <span key={p} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                              <span>{PLATFORM_ICONS[p] || '📱'}</span>
                              <span className="hidden sm:inline">{PLATFORM_NAMES[p] || p}</span>
                            </span>
                          ))}
                          {(draft.platforms || []).length > 6 && (
                            <span className="text-xs text-gray-400">+{draft.platforms.length - 6} more</span>
                          )}
                          {(!draft.platforms || draft.platforms.length === 0) && (
                            <span className="text-xs text-gray-300">No platforms selected</span>
                          )}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      {!isConfirming && (
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <Link href={`/compose?draft=${draft.id}`}
                            className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                            Edit →
                          </Link>
                          <button onClick={() => setConfirmDelete(draft.id)}
                            className="text-xs font-bold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* CONFIRM DELETE */}
                    {isConfirming && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-2">
                        <p className="text-xs text-red-600 font-semibold flex-1">
                          Permanently delete this {draft.status === 'scheduled' ? 'scheduled post' : 'draft'}? This cannot be undone.
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleDelete(draft.id)}
                            disabled={isDeleting}
                            className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
                            {isDeleting ? (
                              <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>
                            ) : 'Yes, delete'}
                          </button>
                          <button onClick={() => setConfirmDelete(null)}
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