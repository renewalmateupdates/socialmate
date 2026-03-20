'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useWorkspace } from '@/contexts/WorkspaceContext'

type Post = {
  id: string
  content: string
  platforms: string[]
  created_at: string
  status: string
  approval_status: string | null
  user_id: string
  submitter_email?: string
}

export default function ApprovalsPage() {
  const router = useRouter()
  const { plan } = useWorkspace()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [acting, setActing] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('posts')
        .select('id, content, platforms, created_at, status, approval_status, user_id')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false })

      setPosts(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleApprove = async (post: Post) => {
    setActing(post.id)
    await supabase.from('posts').update({ approval_status: 'approved', status: 'draft' }).eq('id', post.id)
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, approval_status: 'approved', status: 'draft' } : p))
    showToast('Post approved — moved to drafts')
    setActing(null)
  }

  const handleReject = async (post: Post) => {
    setActing(post.id)
    await supabase.from('posts').update({ approval_status: 'rejected', status: 'rejected' }).eq('id', post.id)
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, approval_status: 'rejected', status: 'rejected' } : p))
    showToast('Post rejected', 'error')
    setActing(null)
  }

  const handleSubmitForApproval = async (postId: string) => {
    setActing(postId)
    await supabase.from('posts').update({ status: 'pending_approval', approval_status: 'pending' }).eq('id', postId)
    showToast('Post submitted for approval')
    setActing(null)
  }

  const filteredPosts = posts.filter(p => {
    if (tab === 'pending')  return p.approval_status === 'pending' || p.approval_status === null
    if (tab === 'approved') return p.approval_status === 'approved'
    if (tab === 'rejected') return p.approval_status === 'rejected'
    return true
  })

  const pendingCount  = posts.filter(p => p.approval_status === 'pending' || p.approval_status === null).length
  const approvedCount = posts.filter(p => p.approval_status === 'approved').length
  const rejectedCount = posts.filter(p => p.approval_status === 'rejected').length

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-theme">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  if (plan === 'free') {
    return (
      <div className="min-h-screen bg-theme flex">
        <Sidebar />
        <main className="md:ml-56 flex-1 p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-surface border border-theme rounded-2xl p-10 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h1 className="text-xl font-extrabold mb-2">Content Approval Workflows</h1>
              <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto leading-relaxed">
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

  return (
    <div className="min-h-screen bg-theme flex">
      <Sidebar />
      <main className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">✅</span>
              <h1 className="text-2xl font-extrabold tracking-tight">Content Approvals</h1>
            </div>
            <p className="text-sm text-gray-400">Review posts submitted by team members before they go live.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Pending review', value: pendingCount,  color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
              { label: 'Approved',       value: approvedCount, color: 'text-green-600',  bg: 'bg-green-50 border-green-100'   },
              { label: 'Rejected',       value: rejectedCount, color: 'text-red-500',    bg: 'bg-red-50 border-red-100'       },
            ].map(stat => (
              <div key={stat.label} className={`border rounded-2xl p-5 text-center ${stat.bg}`}>
                <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-surface border border-theme rounded-2xl p-1 mb-6 w-fit">
            {(['pending', 'approved', 'rejected'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  tab === t ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
                }`}>
                {t} {t === 'pending' && pendingCount > 0 && `(${pendingCount})`}
              </button>
            ))}
          </div>

          {filteredPosts.length === 0 ? (
            <div className="bg-surface border border-theme rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3">
                {tab === 'pending' ? '📭' : tab === 'approved' ? '✅' : '❌'}
              </div>
              <p className="text-sm font-bold text-gray-700 mb-1">
                {tab === 'pending' ? 'No posts awaiting review' : tab === 'approved' ? 'No approved posts yet' : 'No rejected posts'}
              </p>
              <p className="text-xs text-gray-400">
                {tab === 'pending' ? 'Team members can submit posts for approval from the Compose page.' : ''}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <div key={post.id} className="bg-surface border border-theme rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-4">{post.content}</p>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                      post.approval_status === 'approved' ? 'bg-green-100 text-green-700' :
                      post.approval_status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {post.approval_status === 'approved' ? '✓ Approved' :
                       post.approval_status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {post.platforms?.slice(0, 4).map(p => (
                      <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">{p}</span>
                    ))}
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {(post.approval_status === 'pending' || post.approval_status === null) && (
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                      <button
                        onClick={() => handleApprove(post)}
                        disabled={acting === post.id}
                        className="flex-1 py-2 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                        {acting === post.id ? '...' : '✓ Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(post)}
                        disabled={acting === post.id}
                        className="flex-1 py-2 border border-red-200 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition-all disabled:opacity-40">
                        {acting === post.id ? '...' : '✗ Reject'}
                      </button>
                    </div>
                  )}

                  {post.approval_status === 'approved' && (
                    <div className="pt-3 border-t border-gray-50">
                      <Link href="/drafts" className="text-xs font-bold text-black hover:underline">
                        View in drafts →
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
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-black text-white'
        }`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.message}
        </div>
      )}
    </div>
  )
}