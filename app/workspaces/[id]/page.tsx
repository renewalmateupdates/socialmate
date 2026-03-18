'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useWorkspace, PLAN_CONFIG } from '@/contexts/WorkspaceContext'
import Link from 'next/link'

const INDUSTRIES = [
  'E-commerce', 'Restaurant / Food', 'Fitness / Wellness', 'Beauty / Fashion',
  'Real Estate', 'Technology', 'Finance', 'Education', 'Entertainment',
  'Nonprofit', 'Healthcare', 'Travel', 'Other',
]

const PLATFORM_ICONS: Record<string, string> = {
  discord: '💬', bluesky: '🦋', telegram: '✈️', mastodon: '🐘',
  linkedin: '💼', youtube: '▶️', pinterest: '📌', reddit: '🤖',
  instagram: '📸', tiktok: '🎵', twitter: '🐦', facebook: '📘', threads: '🧵',
}

type WorkspaceDetail = {
  id: string
  name: string
  client_name: string
  industry: string | null
  website: string | null
  notes: string | null
  default_platforms: string[]
  is_personal: boolean
  owner_id: string
  created_at: string
}

type Tab = 'details' | 'platforms' | 'notes'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

export default function WorkspaceEdit() {
  const params   = useParams()
  const id       = params?.id as string
  const router   = useRouter()
  const { plan, workspaces, setActiveWorkspace, activeWorkspace } = useWorkspace()

  const [ws, setWs]             = useState<WorkspaceDetail | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [tab, setTab]           = useState<Tab>('details')
  const [toast, setToast]       = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Editable fields
  const [clientName, setClientName]           = useState('')
  const [industry, setIndustry]               = useState('')
  const [website, setWebsite]                 = useState('')
  const [notes, setNotes]                     = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [dirty, setDirty]                     = useState(false)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      if (plan === 'free') { router.push('/workspaces'); return }

      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', id)
        .eq('owner_id', user.id)
        .single()

      if (error || !data) { router.push('/workspaces'); return }
      if (data.is_personal) { router.push('/workspaces'); return }

      setWs(data)
      setClientName(data.client_name || data.name || '')
      setIndustry(data.industry || '')
      setWebsite(data.website || '')
      setNotes(data.notes || '')
      setSelectedPlatforms(data.default_platforms || [])
      setLoading(false)
    }
    load()
  }, [id, plan, router])

  const markDirty = () => setDirty(true)

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
    markDirty()
  }

  const handleSave = async () => {
    if (!clientName.trim()) { showToast('Client name is required', 'error'); return }
    setSaving(true)
    const { error } = await supabase
      .from('workspaces')
      .update({
        name:              clientName.trim(),
        client_name:       clientName.trim(),
        industry:          industry || null,
        website:           website  || null,
        notes:             notes    || null,
        default_platforms: selectedPlatforms,
      })
      .eq('id', id)

    if (error) {
      showToast('Failed to save changes', 'error')
    } else {
      showToast('Workspace updated', 'success')
      setDirty(false)
      // Update context if this is the active workspace
      if (activeWorkspace?.id === id) {
        setActiveWorkspace({ ...activeWorkspace, name: clientName.trim(), client_name: clientName.trim() } as any)
      }
    }
    setSaving(false)
  }

  const handleSwitchToThis = () => {
    if (!ws) return
    setActiveWorkspace(ws as any)
    router.push('/dashboard')
  }

  const isActive = activeWorkspace?.id === id

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="md:ml-56 flex-1 p-4 md:p-8">
          <div className="max-w-2xl mx-auto space-y-4">
            <SkeletonBox className="h-8 w-48" />
            <SkeletonBox className="h-64" />
          </div>
        </div>
      </div>
    )
  }

  if (!ws) return null

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'details',   label: 'Details',   icon: '📋' },
    { key: 'platforms', label: 'Platforms',  icon: '📱' },
    { key: 'notes',     label: 'Notes',      icon: '📝' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">

          {/* BREADCRUMB + HEADER */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Link href="/workspaces"
                className="text-xs font-semibold text-gray-400 hover:text-black transition-all">
                ← Workspaces
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-extrabold tracking-tight">
                    {ws.client_name || ws.name}
                  </h1>
                  {isActive && (
                    <span className="text-xs font-bold px-2.5 py-1 bg-black text-white rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-0.5">
                  {ws.industry || 'No industry set'} · Created {new Date(ws.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              {!isActive && (
                <button onClick={handleSwitchToThis}
                  className="self-start sm:self-auto bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                  Switch to this workspace →
                </button>
              )}
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Plan',      value: PLAN_CONFIG[plan].label, icon: plan === 'agency' ? '🏢' : '⚡' },
              { label: 'Platforms', value: `${selectedPlatforms.length} selected`,                icon: '📱' },
              { label: 'Status',    value: isActive ? 'Active' : 'Inactive',                     icon: isActive ? '🟢' : '⚪' },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                  <span>{stat.icon}</span>
                </div>
                <div className="text-sm font-extrabold text-gray-800">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  tab === t.key ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}>
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* TAB: DETAILS */}
          {tab === 'details' && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Client Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => { setClientName(e.target.value); markDirty() }}
                  placeholder="Acme Co."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={e => { setIndustry(e.target.value); markDirty() }}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white">
                  <option value="">Select an industry...</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Client Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={e => { setWebsite(e.target.value); markDirty() }}
                  placeholder="https://clientwebsite.com"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                />
                {website && (
                  <a href={website} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline mt-1 inline-block">
                    {website.replace('https://', '').replace('http://', '')} ↗
                  </a>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {dirty && (
                  <button
                    onClick={() => {
                      setClientName(ws.client_name || ws.name || '')
                      setIndustry(ws.industry || '')
                      setWebsite(ws.website || '')
                      setDirty(false)
                    }}
                    className="px-4 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:border-gray-400 transition-all">
                    Discard
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving || !dirty}
                  className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* TAB: PLATFORMS */}
          {tab === 'platforms' && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6">
              <h2 className="text-sm font-extrabold mb-1">Client Platforms</h2>
              <p className="text-xs text-gray-400 mb-5">
                Select the platforms this client is active on. This helps pre-fill compose options when this workspace is active.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                {Object.entries(PLATFORM_ICONS).map(([pid, icon]) => {
                  const selected = selectedPlatforms.includes(pid)
                  return (
                    <button key={pid} onClick={() => togglePlatform(pid)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${
                        selected ? 'border-black bg-black/5' : 'border-gray-100 hover:border-gray-300'
                      }`}>
                      <span className="text-base flex-shrink-0">{icon}</span>
                      <span className="text-xs font-semibold truncate">
                        {pid === 'twitter' ? 'X / Twitter' : pid.charAt(0).toUpperCase() + pid.slice(1)}
                      </span>
                      {selected && <span className="ml-auto text-black font-bold text-xs flex-shrink-0">✓</span>}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-400">
                  {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
                </p>
                <button
                  onClick={handleSave}
                  disabled={saving || !dirty}
                  className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* TAB: NOTES */}
          {tab === 'notes' && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-extrabold">Internal Notes</h2>
                <span className="text-xs text-gray-400 font-medium">Not visible to client</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Goals, brand voice, content guidelines, login info, or anything you want to remember about this client.
              </p>
              <textarea
                value={notes}
                onChange={e => { setNotes(e.target.value); markDirty() }}
                placeholder="e.g. Posts 3x/week. Prefers short captions. Avoid political topics. Brand colors: #FF5733, #33FF57..."
                rows={10}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none"
              />
              <div className="flex justify-end gap-3 mt-4">
                {dirty && (
                  <button
                    onClick={() => { setNotes(ws.notes || ''); setDirty(false) }}
                    className="px-4 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:border-gray-400 transition-all">
                    Discard
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving || !dirty}
                  className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                  {saving ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          )}

          {/* DANGER ZONE */}
          <div className="mt-6 bg-white border border-red-100 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Danger Zone</h3>
            {isActive ? (
              <p className="text-xs text-gray-400">
                Switch to a different workspace before deleting this one.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Delete this workspace</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Permanently removes this workspace and all its data. This cannot be undone.
                  </p>
                </div>
                <DeleteButton wsId={id} wsName={ws.client_name || ws.name} onDeleted={() => router.push('/workspaces')} />
              </div>
            )}
          </div>

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

function DeleteButton({ wsId, wsName, onDeleted }: { wsId: string; wsName: string; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting]     = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await supabase.from('workspaces').delete().eq('id', wsId)
    onDeleted()
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)}
        className="self-start sm:self-auto text-xs font-bold px-4 py-2.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 hover:text-red-600 transition-all flex-shrink-0">
        Delete Workspace
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button onClick={handleDelete} disabled={deleting}
        className="text-xs font-bold px-4 py-2.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
        {deleting
          ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>
          : `Yes, delete "${wsName}"`}
      </button>
      <button onClick={() => setConfirming(false)}
        className="text-xs font-bold px-4 py-2.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
        Cancel
      </button>
    </div>
  )
}