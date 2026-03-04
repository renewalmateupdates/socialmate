'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewWorkspacePage() {
  const { plan, refreshData } = useWorkspace()
  const router = useRouter()

  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSlugify = (val: string) => {
    return val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }

  const handleClientNameChange = (val: string) => {
    setClientName(val)
    if (!slug || slug === handleSlugify(clientName)) {
      setSlug(handleSlugify(val))
    }
  }

  const handleSubmit = async () => {
    if (!clientName.trim()) { setError('Client name is required.'); return }
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated.'); setSaving(false); return }

    // Check slug uniqueness
    if (slug) {
      const { data: existing } = await supabase
        .from('workspaces')
        .select('id')
        .eq('slug', slug)
        .single()
      if (existing) { setError('That slug is already taken. Try a different one.'); setSaving(false); return }
    }

    const { error: insertError } = await supabase
      .from('workspaces')
      .insert({
        owner_id: user.id,
        name: clientName.trim(),
        client_name: clientName.trim(),
        client_email: clientEmail.trim() || null,
        slug: slug || null,
        is_personal: false,
      })

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    await refreshData()
    router.push('/workspaces')
  }

  if (plan !== 'agency') {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-3">Agency plan required</h1>
            <p className="text-gray-400 mb-6">Client workspaces are an Agency feature.</p>
            <Link href="/pricing" className="bg-black text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
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
        <div className="max-w-2xl mx-auto px-8 py-10">

          {/* HEADER */}
          <div className="flex items-center gap-3 mb-8">
            <Link href="/workspaces" className="text-gray-400 hover:text-black transition-colors text-sm font-semibold">
              ← Workspaces
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">New Client Workspace</h1>
            <p className="text-gray-400 mt-1">Set up a separate workspace for a client. They get their own accounts, posts, and analytics.</p>
          </div>

          {/* FORM */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">

            {/* CLIENT NAME */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Client Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={e => handleClientNameChange(e.target.value)}
                placeholder="Acme Corporation"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-black transition-all"
              />
            </div>

            {/* CLIENT EMAIL */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Client Email <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                placeholder="hello@acme.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-black transition-all"
              />
              <p className="text-xs text-gray-400 mt-1.5">Used to invite the client to view their workspace.</p>
            </div>

            {/* SLUG */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Workspace Slug <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-black transition-all">
                <span className="px-3 py-3 text-xs text-gray-400 bg-gray-50 border-r border-gray-200 font-medium">
                  socialmate.app/w/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(handleSlugify(e.target.value))}
                  placeholder="acme"
                  className="flex-1 px-3 py-3 text-sm font-medium focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Only lowercase letters, numbers, and hyphens.</p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-600 font-semibold">
                {error}
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={saving || !clientName.trim()}
                className="bg-black text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                {saving ? 'Creating...' : 'Create Workspace'}
              </button>
              <Link href="/workspaces"
                className="text-sm font-semibold text-gray-400 hover:text-black transition-colors px-4 py-3">
                Cancel
              </Link>
            </div>
          </div>

          {/* WHAT HAPPENS NEXT */}
          <div className="mt-6 bg-gray-50 border border-gray-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-600 mb-3">What happens after you create this workspace?</p>
            <div className="space-y-2">
              {[
                'The workspace appears in your sidebar switcher immediately',
                'Switch into it to manage their accounts, posts, and analytics separately',
                'If you added their email, you can invite them to view their workspace',
                'All their data stays completely separate from your personal workspace',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}