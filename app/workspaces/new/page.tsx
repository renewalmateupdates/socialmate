'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'
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

export default function NewWorkspace() {
  const [authChecked, setAuthChecked] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [clientName, setClientName] = useState('')
  const [industry, setIndustry] = useState('')
  const [website, setWebsite] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const router = useRouter()
  const { plan, workspaces, setActiveWorkspace } = useWorkspace()

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setAuthChecked(true)
    }
    check()
  }, [router])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleCreate = async () => {
    if (!clientName.trim()) { showToast('Client name is required', 'error'); return }
    const clientCount = workspaces.filter((w: any) => !w.is_personal).length
    if (clientCount >= 50) { showToast('You have reached the 50 workspace limit', 'error'); return }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        owner_id:          user.id,
        name:              clientName.trim(),
        client_name:       clientName.trim(),
        industry:          industry || null,
        website:           website  || null,
        notes:             notes    || null,
        default_platforms: selectedPlatforms,
        is_personal:       false,
        created_at:        new Date().toISOString(),
      })
      .select()
      .single()

    if (error) { showToast('Failed to create workspace', 'error'); setSaving(false); return }

    setActiveWorkspace(data)
    showToast(`Workspace created for ${clientName}`, 'success')
    setTimeout(() => router.push('/dashboard'), 1000)
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="md:ml-56 flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (plan !== 'agency') {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="md:ml-56 flex-1 p-8 flex items-center justify-center">
          <div className="max-w-md text-center">
            <div className="text-5xl mb-4">🏢</div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-3">Client Workspaces</h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Create separate workspaces for each client — their own accounts, posts, analytics, and team access. Available on the Agency plan.
            </p>
            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 text-left space-y-2">
              {[
                'Separate accounts and posts per client',
                'Client-specific analytics',
                'Invite client team members',
                'White label branding per workspace',
                'Up to 50 client workspaces',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-green-500 font-bold">✓</span>{f}
                </div>
              ))}
            </div>
            <Link href="/settings?tab=Plan"
              className="block w-full text-center bg-black text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all mb-3">
              Upgrade to Agency — $20/mo →
            </Link>
            <Link href="/dashboard" className="text-xs text-gray-400 hover:text-black transition-all">
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const clientCount = workspaces.filter((w: any) => !w.is_personal).length

  if (clientCount >= 50) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="md:ml-56 flex-1 p-8 flex items-center justify-center">
          <div className="max-w-md text-center">
            <div className="text-5xl mb-4">🚫</div>
            <h1 className="text-xl font-extrabold tracking-tight mb-3">Workspace limit reached</h1>
            <p className="text-sm text-gray-500 mb-6">
              You've used all 50 client workspaces on your Agency plan. Delete unused workspaces to create new ones.
            </p>
            <Link href="/workspaces"
              className="inline-block bg-black text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
              ← Manage Workspaces
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link href="/workspaces"
              className="text-xs font-semibold text-gray-400 hover:text-black transition-all">
              ← Workspaces
            </Link>
            <div className="h-4 w-px bg-gray-200" />
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">New Client Workspace</h1>
              <p className="text-xs text-gray-400 mt-0.5">{clientCount} of 50 client workspaces used</p>
            </div>
          </div>

          {/* STEP INDICATOR */}
          <div className="flex items-center gap-1.5 mb-8 overflow-x-auto pb-1">
            {[
              { n: 1, label: 'Client Info' },
              { n: 2, label: 'Platforms'   },
              { n: 3, label: 'Review'      },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-1.5 flex-shrink-0">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  step === s.n ? 'bg-black text-white' :
                  step >  s.n ? 'bg-gray-100 text-gray-500' :
                  'text-gray-300'
                }`}>
                  <span>{step > s.n ? '✓' : s.n}</span>
                  <span>{s.label}</span>
                </div>
                {i < 2 && <div className={`w-4 h-px flex-shrink-0 ${step > s.n ? 'bg-gray-300' : 'bg-gray-100'}`} />}
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Client Name <span className="text-red-400">*</span>
                </label>
                <input type="text" value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && clientName.trim() && setStep(2)}
                  placeholder="Acme Co., Sarah's Boutique..."
                  autoFocus
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Industry</label>
                <select value={industry} onChange={e => setIndustry(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white">
                  <option value="">Select an industry...</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Client Website</label>
                <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                  placeholder="https://clientwebsite.com"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Internal Notes
                  <span className="text-gray-400 font-normal ml-1">(not visible to client)</span>
                </label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Goals, tone of voice, content guidelines..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none" />
              </div>
              <button onClick={() => clientName.trim() ? setStep(2) : showToast('Client name is required', 'error')}
                className="w-full py-3 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all">
                Continue →
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6">
              <h2 className="text-sm font-extrabold mb-1">Which platforms does this client use?</h2>
              <p className="text-xs text-gray-400 mb-5">You can add or change these later from workspace settings.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
                {Object.entries(PLATFORM_ICONS).map(([id, icon]) => {
                  const selected = selectedPlatforms.includes(id)
                  return (
                    <button key={id} onClick={() => togglePlatform(id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${
                        selected ? 'border-black bg-black/5' : 'border-gray-100 hover:border-gray-300'
                      }`}>
                      <span className="text-base flex-shrink-0">{icon}</span>
                      <span className="text-xs font-semibold truncate">
                        {id === 'twitter' ? 'X / Twitter' : id.charAt(0).toUpperCase() + id.slice(1)}
                      </span>
                      {selected && <span className="ml-auto text-black font-bold text-xs flex-shrink-0">✓</span>}
                    </button>
                  )
                })}
              </div>

              <p className="text-xs text-gray-400 text-center mb-5">
                {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
              </p>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="px-5 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:border-gray-400 transition-all">
                  ← Back
                </button>
                <button onClick={() => setStep(3)}
                  className="flex-1 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6">
                <h2 className="text-sm font-extrabold mb-4">Review workspace</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Client',   value: clientName },
                    industry && { label: 'Industry', value: industry },
                    website  && { label: 'Website',  value: website.replace('https://', '').replace('http://', '') },
                  ].filter(Boolean).map((row: any) => (
                    <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-50">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{row.label}</span>
                      <span className="text-sm font-bold text-right max-w-[60%] truncate">{row.value}</span>
                    </div>
                  ))}
                  <div className="flex items-start justify-between py-2 border-b border-gray-50">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5">Platforms</span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                      {selectedPlatforms.length > 0
                        ? selectedPlatforms.map(p => (
                          <span key={p} className="text-lg">{PLATFORM_ICONS[p]}</span>
                        ))
                        : <span className="text-xs text-gray-400">None selected</span>
                      }
                    </div>
                  </div>
                  {notes && (
                    <div className="py-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Notes</span>
                      <p className="text-xs text-gray-500 leading-relaxed">{notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
                <p className="text-xs font-bold text-blue-700 mb-1">What happens next</p>
                <p className="text-xs text-blue-600 leading-relaxed">
                  A new isolated workspace is created for {clientName}. Connect their social accounts,
                  schedule posts, and view analytics all separately from your other workspaces.
                  Switch between workspaces using the dropdown in the sidebar.
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="px-5 py-3 border border-gray-200 text-sm font-semibold rounded-xl hover:border-gray-400 transition-all">
                  ← Back
                </button>
                <button onClick={handleCreate} disabled={saving}
                  className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                  {saving ? 'Creating workspace...' : `Create workspace for ${clientName} →`}
                </button>
              </div>
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
