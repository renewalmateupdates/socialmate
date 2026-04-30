'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useWorkspace } from '@/contexts/WorkspaceContext'

type PendingPost = {
  id: string
  content: string
  platforms: string[]
  created_at: string
  scheduled_at: string | null
  status: string
  approval_status: string | null
  user_id: string
  submitted_by_email: string | null
  rejection_reason: string | null
}

export default function ApprovalsPage() {
  const router = useRouter()
  const { plan } = useWorkspace()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<PendingPost[]>([])
  const [acting, setActing] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [allPosts, setAllPosts] = useState<PendingPost[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      await fetchPosts()
      setLoading(false)
    }
    load()
  }, [router])

  const fetchPosts = async () => {
    const res = await fetch('/api/posts/pending-approvals')
    if (!res.ok) return
    const data = await res.json()
    // pending-approvals only returns pending — we also need approved/rejected for the tabs.
    // Fetch all posts with approval_status set from current user's workspaces.
    // The endpoint returns pending only, so fetch the rest with a separate call.
    setPosts(data.posts || [])
    // Fetch all non-pending (approved/rejected) approval posts for the history tabs
    const res2 = await fetch('/api/posts/pending-approvals?include_history=1')
    if (res2.ok) {
      const data2 = await res2.json()
      setAllPosts(data2.posts || [])
    } else {
      setAllPosts(data.posts || [])
    }
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleApprove = async (post: PendingPost) => {
    setActing(post.id)
    try {
      const res = await fetch(`/api/posts/${post.id}/approve`, { method: 'PATCH' })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Failed to approve post', 'error')
        return
      }
      setPosts(prev => prev.filter(p => p.id !== post.id))
      showToast(data.status === 'scheduled' ? 'Post approved and scheduled ✓' : 'Post approved — moved to drafts ✓')
    } catch {
      showToast('Network error', 'error')
    } finally {
      setActing(null)
    }
  }

  const handleRejectSubmit = async (post: PendingPost) => {
    setActing(post.id)
    try {
      const res = await fetch(`/api/posts/${post.id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Failed to reject post', 'error')
        return
      }
      setPosts(prev => prev.filter(p => p.id !== post.id))
      setRejectingId(null)
      setRejectReason('')
      showToast('Post returned for edits')
    } catch {
      showToast('Network error', 'error')
    } finally {
      setActing(null)
    }
  }

  const pendingPosts   = posts
  const pendingCount   = pendingPosts.length
  const approvedCount  = allPosts.filter(p => p.approval_status === 'approved').length
  const rejectedCount  = allPosts.filter(p => p.approval_status === 'rejected').length

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-theme">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  if (plan === 'free') {
    return (
      <div className="min-h-dvh bg-theme flex">
        <Sidebar />
        <main className="md:ml-56 flex-1 p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-surface border border-theme rounded-2xl p-10 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h1 className="text-xl font-extrabold mb-2">Content Approval Workflows</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
                Let team members submit posts for admin review before they go live. Available on Pro and Agency plans.
              </p>
              <Link href="/settings?tab=Plan"
                className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                Upgrade to unlock →
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const displayedPosts = tab === 'pending'
    ? pendingPosts
    : allPosts.filter(p =>
        tab === 'approved' ? p.approval_status === 'approved' : p.approval_status === 'rejected'
      )

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <main className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">✅</span>
              <h1 className="text-2xl font-extrabold tracking-tight">Content Approvals</h1>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">Review posts submitted by team members before they go live.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Pending review', value: pendingCount,  color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900/30' },
              { label: 'Approved',       value: approvedCount, color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30'   },
              { label: 'Rejected',       value: rejectedCount, color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'           },
            ].map(stat => (
              <div key={stat.label} className={`border rounded-2xl p-5 text-center ${stat.bg}`}>
                <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-surface border border-theme rounded-2xl p-1 mb-6 w-fit">
            {(['pending', 'approved', 'rejected'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  tab === t ? 'bg-black text-white' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}>
                {t} {t === 'pending' && pendingCount > 0 && `(${pendingCount})`}
              </button>
            ))}
          </div>

          {displayedPosts.length === 0 ? (
            <div className="bg-surface border border-theme rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3">
                {tab === 'pending' ? '📭' : tab === 'approved' ? '✅' : '❌'}
              </div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                {tab === 'pending' ? 'No posts awaiting review' : tab === 'approved' ? 'No approved posts yet' : 'No rejected posts'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {tab === 'pending' ? 'Team members with Editor or Client roles can submit posts for approval from the Compose page.' : ''}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedPosts.map(post => (
                <div key={post.id} className="bg-surface border border-theme rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap line-clamp-4">{post.content}</p>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                      post.approval_status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                      post.approval_status === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-500'
                    }`}>
                      {post.approval_status === 'approved' ? '✓ Approved' :
                       post.approval_status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {post.platforms?.slice(0, 4).map(p => (
                      <span key={p} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-semibold">{p}</span>
                    ))}
                    {post.submitted_by_email && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">by {post.submitted_by_email}</span>
                    )}
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {post.scheduled_at && (
                    <p className="text-xs text-blue-500 dark:text-blue-400 mb-3 font-medium">
                      Scheduled for {new Date(post.scheduled_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  )}

                  {post.rejection_reason && (
                    <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl">
                      <p className="text-xs text-red-600 dark:text-red-400 font-semibold">Reason: {post.rejection_reason}</p>
                    </div>
                  )}

                  {(post.approval_status === 'pending' || post.approval_status === null) && (
                    <div className="pt-3 border-t border-theme">
                      {rejectingId === post.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection (optional)"
                            rows={2}
                            className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 outline-none focus:border-gray-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRejectSubmit(post)}
                              disabled={acting === post.id}
                              className="flex-1 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                              {acting === post.id ? '...' : 'Confirm reject'}
                            </button>
                            <button
                              onClick={() => { setRejectingId(null); setRejectReason('') }}
                              disabled={acting === post.id}
                              className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 rounded-xl hover:border-gray-400 transition-all disabled:opacity-40">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(post)}
                            disabled={acting === post.id}
                            className="flex-1 py-2 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                            {acting === post.id ? '...' : '✓ Approve'}
                          </button>
                          <button
                            onClick={() => { setRejectingId(post.id); setRejectReason('') }}
                            disabled={acting === post.id}
                            className="flex-1 py-2 border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 text-xs font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all disabled:opacity-40">
                            {acting === post.id ? '...' : '✗ Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {post.approval_status === 'approved' && (
                    <div className="pt-3 border-t border-theme">
                      <Link href={post.scheduled_at ? '/queue' : '/drafts'} className="text-xs font-bold text-black dark:text-white hover:underline">
                        View in {post.scheduled_at ? 'queue' : 'drafts'} →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {toast && (
        <div style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }} className={`fixed right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-black text-white'
        }`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.message}
        </div>
      )}
    </div>
  )
}
