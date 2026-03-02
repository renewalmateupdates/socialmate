'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type HashtagCollection = {
  id: string
  name: string
  hashtags: string[]
  category: string
  created_at: string
  use_count: number
}

const CATEGORIES = ['All', 'Niche', 'Trending', 'Brand', 'Campaign', 'General', 'Other']

export default function Hashtags() {
  const [user, setUser] = useState<any>(null)
  const [collections, setCollections] = useState<HashtagCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingCollection, setEditingCollection] = useState<HashtagCollection | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [formName, setFormName] = useState('')
  const [formHashtags, setFormHashtags] = useState('')
  const [formCategory, setFormCategory] = useState('General')

  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase
        .from('hashtag_collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setCollections(data || [])
      setLoading(false)
    }
    getData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const parseHashtags = (raw: string): string[] => {
    return raw.split(/[\s,]+/)
      .map(h => h.trim().replace(/^#*/, '#').toLowerCase())
      .filter(h => h.length > 1)
  }

  const openCreate = () => {
    setEditingCollection(null)
    setFormName(''); setFormHashtags(''); setFormCategory('General')
    setShowModal(true)
  }

  const openEdit = (c: HashtagCollection) => {
    setEditingCollection(c)
    setFormName(c.name)
    setFormHashtags(c.hashtags.join(' '))
    setFormCategory(c.category)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formName.trim()) { showToast('Add a collection name', 'error'); return }
    const hashtags = parseHashtags(formHashtags)
    if (hashtags.length === 0) { showToast('Add at least one hashtag', 'error'); return }
    setSaving(true)
    const payload = { name: formName.trim(), hashtags, category: formCategory, user_id: user.id }
    if (editingCollection) {
      const { error } = await supabase.from('hashtag_collections').update(payload).eq('id', editingCollection.id)
      if (error) { showToast('Failed to update', 'error'); setSaving(false); return }
      setCollections(prev => prev.map(c => c.id === editingCollection.id ? { ...c, ...payload } : c))
      showToast('Collection updated!', 'success')
    } else {
      const { data, error } = await supabase.from('hashtag_collections').insert({ ...payload, use_count: 0 }).select().single()
      if (error) { showToast('Failed to create', 'error'); setSaving(false); return }
      setCollections(prev => [data, ...prev])
      showToast('Collection created!', 'success')
    }
    setSaving(false)
    setShowModal(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('hashtag_collections').delete().eq('id', id)
    setCollections(prev => prev.filter(c => c.id !== id))
    showToast('Collection deleted', 'success')
  }

  const handleCopy = async (collection: HashtagCollection) => {
    await navigator.clipboard.writeText(collection.hashtags.join(' '))
    await supabase.from('hashtag_collections').update({ use_count: (collection.use_count || 0) + 1 }).eq('id', collection.id)
    setCollections(prev => prev.map(c => c.id === collection.id ? { ...c, use_count: (c.use_count || 0) + 1 } : c))
    showToast('Hashtags copied!', 'success')
  }

  const filtered = collections.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.hashtags.some(h => h.toLowerCase().includes(search.toLowerCase()))
    const matchCat = category === 'All' || c.category === category
    return matchSearch && matchCat
  })

  const totalHashtags = collections.reduce((sum, c) => sum + c.hashtags.length, 0)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="ml-56 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Hashtags</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? 'Loading...' : `${collections.length} collection${collections.length !== 1 ? 's' : ''} · ${totalHashtags} hashtags`}
            </p>
          </div>
          <button onClick={openCreate}
            className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
            + New Collection
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {loading ? [1,2,3].map(i => <SkeletonBox key={i} className="h-20 rounded-2xl" />) : (
            [
              { label: 'Collections', value: collections.length, icon: '#️⃣' },
              { label: 'Total Hashtags', value: totalHashtags, icon: '🏷️' },
              { label: 'Times Used', value: collections.reduce((s, c) => s + (c.use_count || 0), 0), icon: '📋' },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                  <span>{stat.icon}</span>
                </div>
                <div className="text-2xl font-extrabold tracking-tight">{stat.value}</div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input type="text" placeholder="Search hashtags..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white" />
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${category === cat ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4].map(i => <SkeletonBox key={i} className="h-44 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">{search ? '🔍' : '#️⃣'}</div>
            <h2 className="text-lg font-bold tracking-tight mb-2">
              {search ? 'No collections match your search' : 'No hashtag collections yet'}
            </h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              {search ? 'Try a different search.' : 'Group your hashtags into collections and insert them into posts with one click.'}
            </p>
            {!search && (
              <button onClick={openCreate}
                className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
                Create Your First Collection →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(collection => (
              <div key={collection.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-gray-300 transition-all group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold">{collection.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{collection.category}</span>
                      <span className="text-xs text-gray-400">{collection.hashtags.length} tags</span>
                      {collection.use_count > 0 && <span className="text-xs text-gray-400">· Used {collection.use_count}×</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {collection.hashtags.slice(0, 12).map((tag, i) => (
                    <span key={i} className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                  {collection.hashtags.length > 12 && (
                    <span className="text-xs text-gray-400 px-2 py-0.5">+{collection.hashtags.length - 12} more</span>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                  <button onClick={() => handleCopy(collection)}
                    className="flex-1 py-1.5 text-xs font-semibold bg-black text-white rounded-xl hover:opacity-80 transition-all">
                    📋 Copy All
                  </button>
                  <button onClick={() => openEdit(collection)}
                    className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(collection.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-100 rounded-xl hover:border-red-300 transition-all">
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-extrabold tracking-tight">{editingCollection ? 'Edit Collection' : 'New Collection'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black text-xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Collection Name</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Fitness, Tech News, Brand Tags"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Category</label>
                <select value={formCategory} onChange={e => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white">
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Hashtags</label>
                <textarea value={formHashtags} onChange={e => setFormHashtags(e.target.value)}
                  placeholder="#fitness #workout #gym #motivation #health"
                  rows={5}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none font-mono" />
                <p className="text-xs text-gray-400 mt-1">
                  {parseHashtags(formHashtags).length} hashtags · Separate with spaces or commas · # is added automatically
                </p>
              </div>
              {formHashtags.trim() && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-400 mb-2">Preview:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {parseHashtags(formHashtags).map((tag, i) => (
                      <span key={i} className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 text-sm font-semibold bg-black text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                {saving ? 'Saving...' : editingCollection ? 'Save Changes' : 'Create Collection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}