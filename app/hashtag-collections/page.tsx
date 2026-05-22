'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

type HashtagCollection = {
  id: string
  name: string
  hashtags: string[]
  workspace_id: string | null
  created_at: string
  updated_at: string
}

function SkeletonCard() {
  return (
    <div className="bg-surface border border-theme rounded-2xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-32" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-20" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-6 bg-gray-100 dark:bg-gray-800 rounded-full w-16" />
        ))}
      </div>
    </div>
  )
}

export default function HashtagCollectionsPage() {
  const router = useRouter()
  const [collections, setCollections] = useState<HashtagCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // new / edit form
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formTags, setFormTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const tagInputRef = useRef<HTMLInputElement>(null)

  // delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // copy
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirect=/hashtag-collections'); return }
      await loadCollections()
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadCollections = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hashtag-collections')
      const data = await res.json()
      if (res.ok) setCollections(data.collections ?? [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  // ── form helpers ─────────────────────────────────────────────────────────────

  const openNew = () => {
    setEditingId(null)
    setFormName('')
    setFormTags([])
    setTagInput('')
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (col: HashtagCollection) => {
    setEditingId(col.id)
    setFormName(col.name)
    setFormTags(Array.from(col.hashtags))
    setTagInput('')
    setFormError('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormName('')
    setFormTags([])
    setTagInput('')
    setFormError('')
  }

  const commitTagInput = () => {
    const raw = tagInput.trim().replace(/^#+/, '').replace(/\s+/g, '')
    if (!raw) return
    // split on comma/space in case user pasted multiple
    const parts = raw.split(/[,\s]+/).filter(Boolean)
    const toAdd = parts.filter(p => p && !formTags.includes(p)).slice(0, 30 - formTags.length)
    if (toAdd.length > 0) setFormTags(prev => [...prev, ...toAdd])
    setTagInput('')
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitTagInput()
    } else if (e.key === 'Backspace' && !tagInput && formTags.length > 0) {
      setFormTags(prev => prev.slice(0, -1))
    }
  }

  const removeTag = (tag: string) => {
    setFormTags(prev => prev.filter(t => t !== tag))
  }

  const handleSave = async () => {
    setFormError('')
    if (!formName.trim()) { setFormError('Collection name is required'); return }
    // commit any pending input first
    const raw = tagInput.trim().replace(/^#+/, '').replace(/\s+/g, '')
    let tags = formTags
    if (raw && !tags.includes(raw)) {
      tags = [...tags, raw]
      setFormTags(tags)
      setTagInput('')
    }
    if (tags.length === 0) { setFormError('Add at least one hashtag'); return }

    setSaving(true)
    try {
      if (editingId) {
        const res = await fetch(`/api/hashtag-collections/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName.trim(), hashtags: tags }),
        })
        const data = await res.json()
        if (!res.ok) { setFormError(data.error || 'Failed to save'); return }
        setCollections(prev => prev.map(c => c.id === editingId ? data.collection : c))
        showToast(`"${data.collection.name}" updated`)
      } else {
        const res = await fetch('/api/hashtag-collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName.trim(), hashtags: tags }),
        })
        const data = await res.json()
        if (!res.ok) { setFormError(data.error || 'Failed to save'); return }
        setCollections(prev => [data.collection, ...prev])
        showToast(`"${data.collection.name}" saved`)
      }
      closeForm()
    } catch {
      setFormError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── delete ────────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string, name: string) => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/hashtag-collections/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCollections(prev => prev.filter(c => c.id !== id))
        setConfirmDeleteId(null)
        showToast(`"${name}" deleted`)
      } else {
        showToast('Failed to delete', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setDeleting(false)
    }
  }

  // ── copy ──────────────────────────────────────────────────────────────────────

  const copyTag = (tag: string) => {
    navigator.clipboard.writeText(`#${tag}`)
  }

  const copyAll = (col: HashtagCollection) => {
    navigator.clipboard.writeText(col.hashtags.map(t => `#${t}`).join(' '))
    setCopiedId(col.id)
    setTimeout(() => setCopiedId(null), 2200)
  }

  const totalHashtags = collections.reduce((sum, c) => sum + c.hashtags.length, 0)

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight"># Collections</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {loading
                  ? 'Loading...'
                  : `${collections.length} collection${collections.length !== 1 ? 's' : ''} · ${totalHashtags} hashtags`}
              </p>
            </div>
            {!showForm && (
              <div className="flex items-center gap-2">
                <Link
                  href="/compose"
                  className="text-xs font-bold px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-400 transition-all">
                  Go to Compose
                </Link>
                <button
                  onClick={openNew}
                  className="text-xs font-bold px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-80 transition-all">
                  + New Collection
                </button>
              </div>
            )}
          </div>

          {/* FORM */}
          {showForm && (
            <div className="bg-surface border border-theme-md rounded-2xl p-5 md:p-6 mb-6">
              <h2 className="text-sm font-extrabold mb-4">
                {editingId ? 'Edit Collection' : 'New Hashtag Collection'}
              </h2>

              {/* Name */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Tech Content, Food & Lifestyle..."
                  autoFocus
                  style={{ fontSize: '16px' }}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Tag input */}
              <div className="mb-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
                  Hashtags
                  <span className="text-gray-400 dark:text-gray-500 font-normal ml-1 normal-case">
                    — type a tag + Enter, or paste multiple separated by spaces/commas
                  </span>
                </label>
                <div
                  className="min-h-[44px] w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-900 flex flex-wrap gap-1 items-center cursor-text"
                  onClick={() => tagInputRef.current?.focus()}>
                  {formTags.map(tag => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-400 hover:text-red-500 transition-colors leading-none w-4 h-4 flex items-center justify-center">
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={commitTagInput}
                    placeholder={formTags.length === 0 ? 'Type a hashtag and press Enter' : ''}
                    style={{ fontSize: '16px' }}
                    className="flex-1 min-w-[140px] outline-none bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-300 dark:placeholder-gray-600"
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formTags.length}/30 tags</p>
              </div>

              {formError && (
                <p className="text-xs text-red-500 mb-3">{formError}</p>
              )}

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm font-bold px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-80 transition-all disabled:opacity-40 min-h-[44px]">
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Collection'}
                </button>
                <button
                  onClick={closeForm}
                  className="text-sm font-semibold px-5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all min-h-[44px]">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* COLLECTION CARDS */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : collections.length === 0 && !showForm ? (
            <div className="bg-surface border border-theme rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl mx-auto mb-4">#️⃣</div>
              <p className="text-base font-extrabold mb-1">No collections yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-xs mx-auto">
                Save your go-to hashtag sets to reuse them in Compose with one click.
              </p>
              <button
                onClick={openNew}
                className="inline-flex items-center gap-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all min-h-[44px]">
                + Create your first collection
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {collections.map(col => {
                const isConfirming = confirmDeleteId === col.id
                const isCopied    = copiedId === col.id
                return (
                  <div
                    key={col.id}
                    className="bg-surface border border-theme rounded-2xl p-4 md:p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all">

                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold truncate">{col.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {col.hashtags.length} hashtag{col.hashtags.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {!isConfirming && (
                        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                          <button
                            onClick={() => copyAll(col)}
                            className={`text-xs font-bold px-2.5 py-1.5 min-h-[36px] rounded-xl transition-all border ${
                              isCopied
                                ? 'bg-green-500 text-white border-green-500'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                            }`}>
                            {isCopied ? '✓ Copied' : 'Copy all'}
                          </button>
                          <button
                            onClick={() => openEdit(col)}
                            className="text-xs font-bold px-2.5 py-1.5 min-h-[36px] border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(col.id)}
                            className="text-xs font-bold px-2.5 py-1.5 min-h-[36px] border border-red-200 dark:border-red-800 text-red-400 rounded-xl hover:border-red-400 transition-all">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Hashtag pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {col.hashtags.slice(0, 5).map(tag => (
                        <button
                          key={tag}
                          title="Click to copy"
                          onClick={() => copyTag(tag)}
                          className="text-xs font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                          #{tag}
                        </button>
                      ))}
                      {col.hashtags.length > 5 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 px-2 py-0.5">
                          +{col.hashtags.length - 5} more
                        </span>
                      )}
                    </div>

                    {/* Delete confirm */}
                    {isConfirming && (
                      <div className="mt-3 pt-3 border-t border-theme flex flex-col sm:flex-row sm:items-center gap-2">
                        <p className="text-xs text-red-600 dark:text-red-400 font-semibold flex-1">
                          Delete &ldquo;{col.name}&rdquo;? This cannot be undone.
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleDelete(col.id, col.name)}
                            disabled={deleting}
                            className="text-xs font-bold px-3 py-1.5 min-h-[36px] bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
                            {deleting
                              ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>
                              : 'Yes, delete'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs font-bold px-3 py-1.5 min-h-[36px] border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
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

          {/* bottom tip */}
          {collections.length > 0 && !showForm && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-6">
              Tip: click any hashtag pill to copy it, or use &ldquo;Copy all&rdquo; to grab the full set.
              Open Compose to insert a collection directly into your post.
            </p>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
          className={`fixed right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg transition-all ${
            toast.type === 'success' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-red-500 text-white'
          }`}>
          {toast.type === 'success' ? '' : ''} {toast.message}
        </div>
      )}
    </div>
  )
}
