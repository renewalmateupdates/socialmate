'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Workspace = {
  id: string
  name: string
  client_name: string | null
  client_email: string | null
  slug: string | null
  logo_url: string | null
  is_personal: boolean
  created_at: string
}

export default function WorkspacesPage() {
  const { plan, setActiveWorkspace } = useWorkspace()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  const fetchWorkspaces = async () => {
    const { data } = await supabase
      .from('workspaces')
      .select('*')
      .order('is_personal', { ascending: false })
      .order('created_at', { ascending: true })
    setWorkspaces(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workspace? This cannot be undone.')) return
    setDeleting(id)
    await supabase.from('workspaces').delete().eq('id', id)
    await fetchWorkspaces()
    setDeleting(null)
  }

  const handleSwitch = (ws: Workspace) => {
    setActiveWorkspace({
      id: ws.id,
      name: ws.name,
      client_name: ws.client_name,
      is_personal: ws.is_personal,
      slug: ws.slug,
    })
    router.push('/dashboard')
  }

  const clientWorkspaces = workspaces.filter(w => !w.is_personal)
  const personalWorkspace = workspaces.find(w => w.is_personal)

  // Non-agency gate
  if (plan !== 'agency') {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-6">🏢</div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-3">Client Workspaces</h1>
            <p className="text-gray-400 leading-relaxed mb-8">
              Create separate workspaces for each client — their own accounts, posts, analytics, and team. Upgrade to Agency to unlock this feature.
            </p>
            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 text-left space-y-3">
              {[
                'Separate workspace per client',
                'Each client gets their own accounts & posts',
                'Invite clients to view their own workspace',
                'Unlimited client workspaces',
                'White-label add-on available',
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-green-500 font-bold">✓</span>{f}
                </div>
              ))}
            </div>
            <Link href="/pricing"
              className="inline-block bg-black text-white text-sm font-bold px-8 py-4 rounded-2xl hover:opacity-80 transition-all">
              Upgrade to Agency →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Workspaces</h1>
              <p className="text-gray-400 mt-1">Manage your workspace and all client workspaces.</p>
            </div>
            <Link href="/workspaces/new"
              className="bg-black text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all flex items-center gap-2">
              + New Client Workspace
            </Link>
          </div>

          {/* STATS ROW */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Workspaces', value: workspaces.length },
              { label: 'Client Workspaces', value: clientWorkspaces.length },
              { label: 'Active Since', value: personalWorkspace ? new Date(personalWorkspace.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—' },
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5">
                <p className="text-xs font-semibold text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-extrabold tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* PERSONAL WORKSPACE */}
          {personalWorkspace && (
            <div className="mb-6">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">My Workspace</h2>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white text-lg">🏠</div>
                  <div>
                    <p className="font-bold text-sm">My Workspace</p>
                    <p className="text-xs text-gray-400">Personal workspace · Owner</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSwitch(personalWorkspace)}
                  className="text-xs font-bold text-gray-500 hover:text-black border border-gray-200 px-4 py-2 rounded-xl hover:border-gray-400 transition-all">
                  Switch →
                </button>
              </div>
            </div>
          )}

          {/* CLIENT WORKSPACES */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Client Workspaces</h2>
              <span className="text-xs text-gray-400">{clientWorkspaces.length} client{clientWorkspaces.length !== 1 ? 's' : ''}</span>
            </div>

            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse h-20" />
                ))}
              </div>
            )}

            {!loading && clientWorkspaces.length === 0 && (
              <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
                <div className="text-4xl mb-3">🏢</div>
                <p className="font-bold text-sm mb-1">No client workspaces yet</p>
                <p className="text-xs text-gray-400 mb-4">Create a workspace for each client to keep their content, accounts, and team completely separate.</p>
                <Link href="/workspaces/new"
                  className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                  + Create First Client Workspace
                </Link>
              </div>
            )}

            {!loading && clientWorkspaces.length > 0 && (
              <div className="space-y-3">
                {clientWorkspaces.map(ws => (
                  <div key={ws.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between group hover:border-gray-300 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg font-bold text-gray-500">
                        {ws.logo_url
                          ? <img src={ws.logo_url} className="w-10 h-10 rounded-xl object-cover" alt="" />
                          : (ws.client_name || ws.name).charAt(0).toUpperCase()
                        }
                      </div>
                      <div>
                        <p className="font-bold text-sm">{ws.client_name || ws.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {ws.client_email && (
                            <p className="text-xs text-gray-400">{ws.client_email}</p>
                          )}
                          {ws.slug && (
                            <span className="text-xs text-gray-300">· /{ws.slug}</span>
                          )}
                          <span className="text-xs text-gray-300">· Created {new Date(ws.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSwitch(ws)}
                        className="text-xs font-bold text-gray-500 hover:text-black border border-gray-200 px-4 py-2 rounded-xl hover:border-gray-400 transition-all">
                        Switch →
                      </button>
                      <Link
                        href={`/workspaces/${ws.id}/edit`}
                        className="text-xs font-bold text-gray-400 hover:text-black border border-gray-200 px-4 py-2 rounded-xl hover:border-gray-400 transition-all">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(ws.id)}
                        disabled={deleting === ws.id}
                        className="text-xs font-bold text-red-400 hover:text-red-600 border border-gray-200 px-4 py-2 rounded-xl hover:border-red-200 transition-all disabled:opacity-40">
                        {deleting === ws.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}