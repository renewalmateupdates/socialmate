'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useWorkspace, PLAN_CONFIG } from '@/contexts/WorkspaceContext'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

export default function Workspaces() {
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()
  const { plan, workspaces, setActiveWorkspace, activeWorkspace } = useWorkspace()

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setLoading(false)
    }
    check()
  }, [router])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDelete = async (id: string, name: string) => {
    setDeletingId(id)
    const { error } = await supabase.from('workspaces').delete().eq('id', id)
    if (error) { showToast('Failed to delete workspace', 'error'); setDeletingId(null); return }
    showToast(`${name} deleted`, 'success')
    setDeletingId(null)
    setConfirmDeleteId(null)
  }

  const handleSwitch = (ws: any) => {
    setActiveWorkspace(ws)
    router.push('/dashboard')
  }

  // Free users: upgrade wall
  if (plan === 'free') {
    return (
      <div className="min-h-screen bg-theme flex">
        <Sidebar />
        <div className="md:ml-56 flex-1 p-8 flex items-center justify-center">
          <div className="max-w-md text-center">
            <div className="text-5xl mb-4">🏢</div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-3">Client Workspaces</h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Manage clients in fully isolated workspaces — their own accounts, posts, and analytics.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6 text-left">
              <div className="bg-white border border-blue-100 rounded-2xl p-4">
                <div className="text-xs font-bold text-blue-600 mb-2">Pro · $5/mo</div>
                <div className="text-2xl font-extrabold mb-1">1</div>
                <div className="text-xs text-gray-500">client workspace</div>
              </div>
              <div className="bg-white border border-purple-100 rounded-2xl p-4">
                <div className="text-xs font-bold text-purple-600 mb-2">Agency · $20/mo</div>
                <div className="text-2xl font-extrabold mb-1">5</div>
                <div className="text-xs text-gray-500">client workspaces</div>
              </div>
            </div>
            <Link href="/settings?tab=Plan"
              className="block w-full text-center bg-black text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
              View Plans →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const limit    = PLAN_CONFIG[plan].clientWorkspaces
  const atLimit  = workspaces.filter((w: any) => !w.is_personal).length >= limit
  const personalWs = workspaces.find((w: any) => w.is_personal)
  const clientWs   = workspaces.filter((w: any) => !w.is_personal)

  return (
    <div className="min-h-screen bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Workspaces</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {clientWs.length} client workspace{clientWs.length !== 1 ? 's' : ''} · {limit} max on {PLAN_CONFIG[plan].label}
              </p>
            </div>
            {!atLimit && (
              <Link href="/workspaces/new"
                className="self-start sm:self-auto bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                + New Client Workspace
              </Link>
            )}
          </div>

          {/* USAGE BAR */}
          <div className="bg-surface border border-theme rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500">Client Workspaces</span>
              <span className="text-xs font-bold text-gray-700">{clientWs.length} / {limit}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${atLimit ? 'bg-red-400' : 'bg-black'}`}
                style={{ width: `${Math.min(100, (clientWs.length / limit) * 100)}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {atLimit ? 'Workspace limit reached' : `${limit - clientWs.length} slot${limit - clientWs.length !== 1 ? 's' : ''} remaining`}
            </p>
          </div>

          {/* PERSONAL WORKSPACE */}
          {personalWs && (
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Personal</p>
              <div className={`bg-white border-2 rounded-2xl p-4 md:p-5 flex items-center justify-between transition-all ${
                activeWorkspace?.id === personalWs.id ? 'border-black' : 'border-gray-100'
              }`}>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🏠</div>
                  <div>
                    <p className="text-sm font-extrabold">My Workspace</p>
                    <p className="text-xs text-gray-400">Your personal account</p>
                  </div>
                </div>
                {activeWorkspace?.id === personalWs.id ? (
                  <span className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl flex-shrink-0">Active</span>
                ) : (
                  <button onClick={() => handleSwitch(personalWs)}
                    className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all flex-shrink-0">
                    Switch →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* CLIENT WORKSPACES */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Client Workspaces</p>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <SkeletonBox key={i} className="h-20" />)}
              </div>
            ) : clientWs.length === 0 ? (
              <div className="bg-surface border border-theme rounded-2xl p-10 text-center">
                <div className="text-4xl mb-3">🏢</div>
                <p className="text-sm font-bold mb-1">No client workspaces yet</p>
                <p className="text-xs text-gray-400 mb-5">
                  Create a separate workspace for each client — isolated accounts, posts, and analytics.
                </p>
                <Link href="/workspaces/new"
                  className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                  Create your first client workspace →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {clientWs.map((ws: any) => {
                  const isActive     = activeWorkspace?.id === ws.id
                  const isConfirming = confirmDeleteId === ws.id
                  const isDeleting   = deletingId === ws.id

                  return (
                    <div key={ws.id}
                      className={`bg-white border-2 rounded-2xl p-4 md:p-5 transition-all ${
                        isActive ? 'border-black' : 'border-gray-100 hover:border-gray-300'
                      }`}>

                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🏢</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-extrabold truncate">{ws.client_name || ws.name}</p>
                            {isActive && (
                              <span className="text-xs font-bold px-2 py-0.5 bg-black text-white rounded-full flex-shrink-0">Active</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            {ws.industry && <p className="text-xs text-gray-400">{ws.industry}</p>}
                            {ws.website && (
                              <a href={ws.website} target="_blank" rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="text-xs text-blue-500 hover:underline truncate max-w-[200px]">
                                {ws.website.replace('https://', '').replace('http://', '')}
                              </a>
                            )}
                          </div>
                        </div>
                        {!isConfirming && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Link href={`/workspaces/${ws.id}`}
                              className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                              Edit
                            </Link>
                            {!isActive && (
                              <button onClick={() => handleSwitch(ws)}
                                className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                                Switch →
                              </button>
                            )}
                            {isActive && (
                              <span className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl">Active</span>
                            )}
                            {!isActive && (
                              <button onClick={() => setConfirmDeleteId(ws.id)}
                                className="text-xs font-bold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {isConfirming && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-2">
                          <p className="text-xs font-bold text-red-600 flex-1">
                            Delete "{ws.client_name || ws.name}"? This cannot be undone.
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => handleDelete(ws.id, ws.client_name || ws.name)}
                              disabled={isDeleting}
                              className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
                              {isDeleting
                                ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>
                                : 'Yes, delete'}
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)}
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

          {/* AT LIMIT BANNER */}
          {atLimit && (
            <div className="mt-6 rounded-2xl px-5 py-4 text-center border border-gray-100 bg-gray-50">
              {plan === 'agency' ? (
                <>
                  <p className="text-xs font-bold text-gray-700">You've reached your {limit} workspace limit on Agency.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Need more?{' '}
                    <a href="mailto:support@socialmate.studio" className="text-black underline hover:no-underline">
                      Contact us
                    </a>{' '}
                    to discuss additional workspaces.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold text-gray-700">You've used your 1 workspace on Pro.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    <Link href="/settings?tab=Plan" className="text-black underline hover:no-underline">
                      Upgrade to Agency
                    </Link>{' '}
                    for up to 5 client workspaces.
                  </p>
                </>
              )}
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