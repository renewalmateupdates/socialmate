'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

export default function Workspaces() {
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null) // W2
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
  }, [router]) // W1: fixed

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // W2: now called only after confirmation
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

  if (plan !== 'agency') {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="ml-56 flex-1 p-8 flex items-center justify-center">
          <div className="max-w-md text-center">
            <div className="text-5xl mb-4">🏢</div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-3">Client Workspaces</h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Separate workspaces for each client — isolated accounts, posts, and analytics. Agency plan only.
            </p>
            <Link href="/pricing"
              className="block w-full text-center bg-black text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
              Upgrade to Agency →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const personalWs = workspaces.find(w => w.is_personal)
  const clientWs = workspaces.filter(w => !w.is_personal)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-4xl mx-auto">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Workspaces</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {clientWs.length} client workspace{clientWs.length !== 1 ? 's' : ''} · 50 max on Agency
              </p>
            </div>
            {clientWs.length < 50 && (
              <Link href="/workspaces/new"
                className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                + New Client Workspace
              </Link>
            )}
          </div>

          {/* USAGE */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500">Client Workspaces</span>
              <span className="text-xs font-bold text-gray-700">{clientWs.length} / 50</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-black h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (clientWs.length / 50) * 100)}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{50 - clientWs.length} slots remaining</p>
          </div>

          {/* PERSONAL WORKSPACE */}
          {personalWs && (
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Personal</p>
              <div className={`bg-white border-2 rounded-2xl p-5 flex items-center justify-between transition-all ${
                activeWorkspace?.id === personalWs.id ? 'border-black' : 'border-gray-100'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl">🏠</div>
                  <div>
                    <p className="text-sm font-extrabold">My Workspace</p>
                    <p className="text-xs text-gray-400">Your personal account</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeWorkspace?.id === personalWs.id ? (
                    <span className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl">Active</span>
                  ) : (
                    <button onClick={() => handleSwitch(personalWs)}
                      className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                      Switch →
                    </button>
                  )}
                </div>
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
              <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
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
                {clientWs.map(ws => {
                  const isActive = activeWorkspace?.id === ws.id
                  const isConfirming = confirmDeleteId === ws.id

                  return (
                    <div key={ws.id}
                      className={`bg-white border-2 rounded-2xl p-5 transition-all group ${
                        isActive ? 'border-black' : 'border-gray-100 hover:border-gray-300'
                      }`}>

                      {/* W2: confirm inline UI replaces the row actions */}
                      {isConfirming ? (
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-red-600">
                            Delete "{ws.client_name || ws.name}"? This cannot be undone.
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleDelete(ws.id, ws.client_name || ws.name)}
                              disabled={deletingId === ws.id}
                              className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                              {deletingId === ws.id ? 'Deleting...' : 'Yes, delete'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl">🏢</div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-extrabold">{ws.client_name || ws.name}</p>
                                {isActive && (
                                  <span className="text-xs font-bold px-2 py-0.5 bg-black text-white rounded-full">Active</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                {(ws as any).industry && (
                                  <p className="text-xs text-gray-400">{(ws as any).industry}</p>
                                )}
                                {(ws as any).website && (
                                  <a href={(ws as any).website} target="_blank" rel="noopener noreferrer"
                                    className="text-xs text-blue-500 hover:underline truncate max-w-[200px]">
                                    {(ws as any).website.replace('https://', '').replace('http://', '')}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            {!isActive && (
                              <button onClick={() => handleSwitch(ws)}
                                className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                                Switch →
                              </button>
                            )}
                            {/* W3: active workspace cannot be deleted */}
                            {!isActive && (
                              <button
                                onClick={() => setConfirmDeleteId(ws.id)}
                                className="text-xs font-bold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
                                Delete
                              </button>
                            )}
                          </div>

                          {isActive && (
                            <span className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl">Active</span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {clientWs.length >= 50 && (
            <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-center">
              <p className="text-xs font-bold text-red-600">You've reached the 50 workspace limit on Agency.</p>
              <p className="text-xs text-red-400 mt-1">Delete unused workspaces to create new ones.</p>
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