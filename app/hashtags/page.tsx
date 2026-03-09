'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
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
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null) // H2
  const [copied, setCopied] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

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
  }, [router]) // H1: fixed

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
    setName('')
    setTags('')
    setShowForm(false)
    setEditingId(null)
    showToast(editingId ? 'Collection updated' : 'Collection saved', 'success')
    setSaving(false)
  }

  const handleEdit = (col: any) => {
    setEditingId(col.id)
    setName(col.name)
    setTags((col.tags || []).join(' '))
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await supabase.from('hashtag_collections').delete().eq('id', id)
    setCollections(prev => prev.filter(c => c.id !== id))
    setConfirmDelete(null)
    showToast('Deleted', 'success')
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-3xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Hashtag Collections</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {collections.length} collection{collections.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            {!showForm && (
              <button onClick={() => setShowForm(true)}
                className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                + New Collection
              </button>
            )}
          </div>

          {/* FORM */}
          {showForm && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-extrabold mb-4">
                {editingId ? 'Edit Collection' : 'New Hashtag Collection'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Collection Name
                  </label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Food & Lifestyle, Tech Content..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                    autoFocus />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Hashtags
                    <span className="text-gray-400 font-normal ml-1">
                      (separate with spaces or commas, # optional)
                    </span>
                  </label>
                  <textarea value={tags} onChange={e => setTags(e.target.value)}
                    placeholder="foodie cooking recipe homecook instafood..."
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none font-mono" />
                  <p className="text-xs text-gray-400 mt-1">
                    {tags.split(/[\s,]+/).filter(t => t.trim().length > 0).length} hashtags
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving}
                    className="bg-black text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                    {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Collection'}
                  </button>
                  <button onClick={handleCancel}
                    className="px-5 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:border-gray-400 transition-all">
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
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">#️⃣</div>
              <p className="text-sm font-bold mb-1">No hashtag collections yet</p>
              <p className="text-xs text-gray-400 mb-5">
                Save groups of hashtags to insert into posts with one click.
              </p>
              <button onClick={() => setShowForm(true)}
                className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                Create your first collection →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {collections.map(col => {
                const isConfirming = confirmDelete === col.id
                return (
                  <div key={col.id}
                    className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-300 transition-all group">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-sm font-extrabold">{col.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{(col.tags || []).length} hashtags</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {isConfirming ? (
                          // H2: inline confirm
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-500 font-semibold">Delete?</span>
                            <button onClick={() => handleDelete(col.id)} disabled={deleting === col.id}
                              className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                              {deleting === col.id ? '...' : 'Yes'}
                            </button>
                            <button onClick={() => setConfirmDelete(null)}
                              className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => handleCopy(col)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all border ${
                                copied === col.id
                                  ? 'bg-green-500 text-white border-green-500'
                                  : 'border-gray-200 hover:border-gray-400'
                              }`}>
                              {copied === col.id ? '✓ Copied' : 'Copy all'}
                            </button>
                            <button onClick={() => handleEdit(col)}
                              className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                              Edit
                            </button>
                            <button onClick={() => setConfirmDelete(col.id)}
                              className="text-xs font-bold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(col.tags || []).slice(0, 20).map((tag: string) => (
                        <span key={tag}
                          className="text-xs font-semibold bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
                          {tag}
                        </span>
                      ))}
                      {(col.tags || []).length > 20 && (
                        <span className="text-xs text-gray-400 px-2 py-0.5">
                          +{col.tags.length - 20} more
                        </span>
                      )}
                    </div>
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