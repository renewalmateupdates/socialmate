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

export default function Drafts() {
  const [drafts, setDrafts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled'>('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  // Dr2: inline confirm for delete
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
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
        .order('updated_at', { ascending: false })
      setDrafts(data || [])
      setLoading(false)
    }
    load()
  }, [router]) // Dr1: fixed

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) { showToast('Failed to delete', 'error'); setDeleting(null); return }
    setDrafts(prev => prev.filter(d => d.id !== id))
    setConfirmDelete(null)
    showToast('Deleted', 'success')
    setDeleting(null)
  }

  const filtered = filter === 'all' ? drafts : drafts.filter(d => d.status === filter)
  const draftCount = drafts.filter(d => d.status === 'draft').length
  const scheduledCount = drafts.filter(d => d.status === 'scheduled').length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-3xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Drafts & Queue</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {draftCount} draft{draftCount !== 1 ? 's' : ''} · {scheduledCount} scheduled
              </p>
            </div>
            <Link href="/compose"
              className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
              + New Post
            </Link>
          </div>

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
              <p className="text-sm font-bold mb-1">No {filter === 'all' ? '' : filter + ' '}posts yet</p>
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
                return (
                  <div key={draft.id}
                    className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-300 transition-all group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            draft.status === 'scheduled' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {draft.status === 'scheduled' ? '📅 Scheduled' : '📂 Draft'}
                          </span>
                          {draft.scheduled_at && (
                            <span className="text-xs text-gray-400">
                              {new Date(draft.scheduled_at).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 mb-3">
                          {draft.content || <span className="text-gray-300 italic">No content</span>}
                        </p>
                        <div className="flex items-center gap-1">
                          {(draft.platforms || []).slice(0, 8).map((p: string) => (
                            <span key={p} className="text-sm">{PLATFORM_ICONS[p] || '📱'}</span>
                          ))}
                          {(draft.platforms || []).length > 8 && (
                            <span className="text-xs text-gray-400">+{draft.platforms.length - 8}</span>
                          )}
                          {(!draft.platforms || draft.platforms.length === 0) && (
                            <span className="text-xs text-gray-300">No platforms selected</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                        <Link href={`/compose?draft=${draft.id}`}
                          className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                          Edit →
                        </Link>
                        {/* Dr2: inline confirm before delete */}
                        {isConfirming ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-500 font-semibold">Delete?</span>
                            <button onClick={() => handleDelete(draft.id)} disabled={deleting === draft.id}
                              className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                              {deleting === draft.id ? '...' : 'Yes'}
                            </button>
                            <button onClick={() => setConfirmDelete(null)}
                              className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(draft.id)}
                            className="text-xs font-bold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
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