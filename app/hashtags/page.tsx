'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

const LS_KEY = 'sm_hashtag_saved_sets'

interface SavedSet {
  id: string
  name: string
  tags: string[]
  savedAt: string
}

function loadSavedSets(): SavedSet[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistSavedSets(sets: SavedSet[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(sets))
}

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ${className}`} />
}

export default function Hashtags() {
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Quick saved sets (localStorage)
  const [savedSets, setSavedSets] = useState<SavedSet[]>([])
  const [quickTags, setQuickTags] = useState('')
  const [quickSetName, setQuickSetName] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [copiedSet, setCopiedSet] = useState<string | null>(null)
  const [deletingSet, setDeletingSet] = useState<string | null>(null)

  const router = useRouter()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Load localStorage saved sets on mount
  useEffect(() => {
    setSavedSets(loadSavedSets())
  }, [])

  const saveQuickSet = () => {
    const trimmedName = quickSetName.trim()
    if (!trimmedName) { showToast('Set name is required', 'error'); return }
    const parsed = quickTags
      .split(/[\s,]+/)
      .map(t => t.startsWith('#') ? t : `#${t}`)
      .filter(t => t.length > 1)
    if (parsed.length === 0) { showToast('Add at least one hashtag', 'error'); return }
    const newSet: SavedSet = {
      id: Math.random().toString(36).slice(2, 9),
      name: trimmedName,
      tags: parsed,
      savedAt: new Date().toISOString(),
    }
    const updated = [newSet, ...savedSets]
    setSavedSets(updated)
    persistSavedSets(updated)
    setShowSaveForm(false)
    setQuickSetName('')
    setQuickTags('')
    showToast(`Set "${trimmedName}" saved`, 'success')
  }

  const deleteQuickSet = (id: string) => {
    const updated = savedSets.filter(s => s.id !== id)
    setSavedSets(updated)
    persistSavedSets(updated)
    setDeletingSet(null)
    showToast('Set removed', 'success')
  }

  const copyQuickSet = (set: SavedSet) => {
    navigator.clipboard.writeText(set.tags.join(' '))
    setCopiedSet(set.id)
    setTimeout(() => setCopiedSet(null), 2000)
  }

  const quickTagCount = quickTags.split(/[\s,]+/).filter(t => t.trim().length > 0).length

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('hashtag_collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setCollections(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const handleSave = async () => {
    if (!name.trim() || !tags.trim()) { showToast('Name and hashtags required', 'error'); return }
    setSaving(true)
    const parsed = tags
      .split(/[\s,]+/)
      .map(t => t.startsWith('#') ? t : `#${t}`)
      .filter(t => t.length > 1)

    if (editingId) {
      const { data, error } = await supabase
        .from('hashtag_collections')
        .update({ name: name.trim(), tags: parsed, updated_at: new Date().toISOString() })
        .eq('id', editingId)
        .select()
        .single()
      if (error) { showToast('Failed to save', 'error'); setSaving(false); return }
      setCollections(prev => prev.map(c => c.id === editingId ? data : c))
    } else {
      const { data, error } = await supabase
        .from('hashtag_collections')
        .insert({ user_id: userId, name: name.trim(), tags: parsed })
        .select()
        .single()
      if (error) { showToast('Failed to save', 'error'); setSaving(false); return }
      setCollections(prev => [data, ...prev])
    }
    handleCancel()
    showToast(editingId ? 'Collection updated' : 'Collection saved', 'success')
    setSaving(false)
  }

  const handleEdit = (col: any) => {
    setEditingId(col.id)
    setName(col.name)
    setTags((col.tags || []).join(' '))
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await supabase.from('hashtag_collections').delete().eq('id', id)
    setCollections(prev => prev.filter(c => c.id !== id))
    setConfirmDelete(null)
    showToast('Collection deleted', 'success')
    setDeleting(null)
  }

  const handleCopy = (col: any) => {
    navigator.clipboard.writeText((col.tags || []).join(' '))
    setCopied(col.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setName('')
    setTags('')
  }

  const totalTags = collections.reduce((sum, c) => sum + (c.tags?.length || 0), 0)
  const tagCount = tags.split(/[\s,]+/).filter(t => t.trim().length > 0).length

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Hashtag Collections</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {loading ? 'Loading...' : `${collections.length} collection${collections.length !== 1 ? 's' : ''} · ${totalTags} hashtags total`}
              </p>
            </div>
            {!showForm && (
              <button onClick={() => setShowForm(true)}
                className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all self-start sm:self-auto">
                + New Collection
              </button>
            )}
          </div>

          {/* QUICK SAVED SETS (localStorage) */}
          <div className="mb-6">
            {/* Save as Set input area */}
            {!showSaveForm ? (
              <button
                onClick={() => setShowSaveForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-400 dark:text-gray-500 hover:border-gray-400 hover:text-black dark:hover:text-white transition-all">
                💾 Save a Quick Hashtag Set (no account needed)
              </button>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-blue-700 dark:text-blue-400">Save Quick Set</p>
                  <button onClick={() => { setShowSaveForm(false); setQuickSetName(''); setQuickTags('') }}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
                </div>
                <input
                  type="text"
                  value={quickSetName}
                  onChange={e => setQuickSetName(e.target.value)}
                  placeholder="Set name (e.g. Food & Travel)"
                  autoFocus
                  className="w-full px-3 py-2.5 text-sm border border-blue-200 dark:border-blue-800 rounded-xl focus:outline-none focus:border-blue-400 dark:bg-gray-900 dark:text-gray-100"
                />
                <div>
                  <textarea
                    value={quickTags}
                    onChange={e => setQuickTags(e.target.value)}
                    placeholder="Paste or type hashtags here — foodie cooking recipe homecook..."
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-blue-200 dark:border-blue-800 rounded-xl focus:outline-none focus:border-blue-400 resize-none font-mono dark:bg-gray-900 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{quickTagCount} hashtag{quickTagCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveQuickSet}
                    className="bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                    Save Set
                  </button>
                  <button onClick={() => { setShowSaveForm(false); setQuickSetName(''); setQuickTags('') }}
                    className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-xs font-semibold rounded-xl hover:border-gray-400 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Saved Sets list */}
            {savedSets.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xs font-extrabold uppercase tracking-wide text-gray-400 dark:text-gray-500">Saved Sets</h2>
                  <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                    {savedSets.length}
                  </span>
                  <span className="text-xs text-gray-300 dark:text-gray-600 font-normal">(stored locally)</span>
                </div>
                <div className="space-y-2">
                  {savedSets.map(set => (
                    <div key={set.id}
                      className="bg-surface border border-theme rounded-2xl p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold truncate">{set.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{set.tags.length} hashtags</p>
                        </div>
                        {deletingSet !== set.id ? (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button onClick={() => copyQuickSet(set)}
                              className={`text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all border ${
                                copiedSet === set.id
                                  ? 'bg-green-500 text-white border-green-500'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                              }`}>
                              {copiedSet === set.id ? '✓ Copied' : 'Copy all'}
                            </button>
                            <button onClick={() => setDeletingSet(set.id)}
                              className="text-xs font-bold px-2.5 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button onClick={() => deleteQuickSet(set.id)}
                              className="text-xs font-bold px-2.5 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all">
                              Yes, remove
                            </button>
                            <button onClick={() => setDeletingSet(null)}
                              className="text-xs font-bold px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {set.tags.slice(0, 20).map(tag => (
                          <span key={tag}
                            className="text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg">
                            {tag}
                          </span>
                        ))}
                        {set.tags.length > 20 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 px-2 py-0.5">+{set.tags.length - 20} more</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FORM */}
          {showForm && (
            <div className="bg-surface border border-theme-md rounded-2xl p-5 md:p-6 mb-6">
              <h2 className="text-sm font-extrabold mb-4">
                {editingId ? 'Edit Collection' : 'New Hashtag Collection'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
                    Collection Name
                  </label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Food & Lifestyle, Tech Content..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400"
                    autoFocus />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
                    Hashtags
                    <span className="text-gray-400 font-normal ml-1">
                      (separate with spaces or commas, # optional)
                    </span>
                  </label>
                  <textarea value={tags} onChange={e => setTags(e.target.value)}
                    placeholder="foodie cooking recipe homecook instafood..."
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400 resize-none font-mono dark:bg-gray-800 dark:text-gray-100" />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{tagCount} hashtag{tagCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={handleSave} disabled={saving}
                    className="bg-black text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                    {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Collection'}
                  </button>
                  <button onClick={handleCancel}
                    className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 text-sm font-semibold rounded-xl hover:border-gray-400 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* COLLECTIONS */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <SkeletonBox key={i} className="h-28" />)}
            </div>
          ) : collections.length === 0 && !showForm ? (
            <div className="bg-surface border border-theme rounded-2xl p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl mx-auto mb-4">#️⃣</div>
              <p className="text-base font-extrabold mb-1">No hashtag collections yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-2 max-w-xs mx-auto">
                Save groups of hashtags to quickly insert into posts with one click.
              </p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mb-6 max-w-xs mx-auto">
                Collections are synced to your account. For quick local saves, use the "Save Quick Set" area above.
              </p>
              <button onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                + Create your first collection
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {collections.map(col => {
                const isConfirming = confirmDelete === col.id
                const isDeleting   = deleting === col.id
                return (
                  <div key={col.id}
                    className="bg-surface border border-theme rounded-2xl p-4 md:p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all">

                    {/* TOP ROW */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold truncate">{col.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{(col.tags || []).length} hashtags</p>
                      </div>

                      {/* ACTIONS — always visible */}
                      {!isConfirming && (
                        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                          <button onClick={() => handleCopy(col)}
                            className={`text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all border ${
                              copied === col.id
                                ? 'bg-green-500 text-white border-green-500'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                            }`}>
                            {copied === col.id ? '✓ Copied' : 'Copy all'}
                          </button>
                          <button onClick={() => handleEdit(col)}
                            className="text-xs font-bold px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                            Edit
                          </button>
                          <button onClick={() => setConfirmDelete(col.id)}
                            className="text-xs font-bold px-2.5 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* TAGS */}
                    <div className="flex flex-wrap gap-1.5">
                      {(col.tags || []).slice(0, 20).map((tag: string) => (
                        <span key={tag}
                          className="text-xs font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-lg">
                          {tag}
                        </span>
                      ))}
                      {(col.tags || []).length > 20 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 px-2 py-0.5">
                          +{col.tags.length - 20} more
                        </span>
                      )}
                    </div>

                    {/* CONFIRM DELETE — below tags, full width */}
                    {isConfirming && (
                      <div className="mt-3 pt-3 border-t border-theme flex flex-col sm:flex-row sm:items-center gap-2">
                        <p className="text-xs text-red-600 font-semibold flex-1">
                          Delete "{col.name}"? This cannot be undone.
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => handleDelete(col.id)} disabled={isDeleting}
                            className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
                            {isDeleting
                              ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>
                              : 'Yes, delete'}
                          </button>
                          <button onClick={() => setConfirmDelete(null)}
                            className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
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
