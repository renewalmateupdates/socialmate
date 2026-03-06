'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

const CATEGORIES = ['All', 'Promotional', 'Educational', 'Engagement', 'Announcement', 'Personal', 'Other']

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  bluesky: '🦋', reddit: '🤖',
}

export default function Templates() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Other')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
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
        .from('post_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setTemplates(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) { showToast('Title and content required', 'error'); return }
    setSaving(true)
    const payload = {
      user_id: userId,
      title: title.trim(),
      content: content.trim(),
      category,
      platforms,
      updated_at: new Date().toISOString(),
    }
    if (editingId) {
      const { data, error } = await supabase
        .from('post_templates').update(payload).eq('id', editingId).select().single()
      if (error) { showToast('Failed to save', 'error'); setSaving(false); return }
      setTemplates(prev => prev.map(t => t.id === editingId ? data : t))
    } else {
      const { data, error } = await supabase
        .from('post_templates').insert(payload).select().single()
      if (error) { showToast('Failed to save', 'error'); setSaving(false); return }
      setTemplates(prev => [data, ...prev])
    }
    resetForm()
    showToast(editingId ? 'Template updated' : 'Template saved', 'success')
    setSaving(false)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setTitle('')
    setContent('')
    setCategory('Other')
    setPlatforms([])
  }

  const handleEdit = (t: any) => {
    setEditingId(t.id)
    setTitle(t.title)
    setContent(t.content)
    setCategory(t.category || 'Other')
    setPlatforms(t.platforms || [])
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await supabase.from('post_templates').delete().eq('id', id)
    setTemplates(prev => prev.filter(t => t.id !== id))
    showToast('Deleted', 'success')
    setDeleting(null)
  }

  const handleCopy = (t: any) => {
    navigator.clipboard.writeText(t.content)
    setCopied(t.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const togglePlatform = (id: string) => {
    setPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const filtered = activeCategory === 'All'
    ? templates
    : templates.filter(t => t.category === activeCategory)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-3xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Post Templates</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {templates.length} template{templates.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            {!showForm && (
              <button onClick={() => setShowForm(true)}
                className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                + New Template
              </button>
            )}
          </div>

          {/* FORM */}
          {showForm && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-extrabold mb-4">
                {editingId ? 'Edit Template' : 'New Template'}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Product Launch Announcement"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                      autoFocus />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white">
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Content
                    <span className="text-gray-400 font-normal ml-1">
                      (use [brackets] for fill-in-the-blank sections)
                    </span>
                  </label>
                  <textarea value={content} onChange={e => setContent(e.target.value)}
                    placeholder="Excited to announce [product/service]! 🎉&#10;&#10;[Describe key benefit]&#10;&#10;[Call to action] 👇"
                    rows={6}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none" />
                  <p className="text-xs text-gray-400 mt-1">{content.length} chars</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                    Best for platforms <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(PLATFORM_ICONS).map(([id, icon]) => (
                      <button key={id} onClick={() => togglePlatform(id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          platforms.includes(id)
                            ? 'bg-black text-white border-black'
                            : 'border-gray-200 text-gray-500 hover:border-gray-400'
                        }`}>
                        <span>{icon}</span>
                        <span className="capitalize">{id === 'twitter' ? 'X' : id}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving}
                    className="bg-black text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                    {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Template'}
                  </button>
                  <button onClick={resetForm}
                    className="px-5 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:border-gray-400 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY FILTER */}
          {templates.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mb-5">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    activeCategory === cat
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* TEMPLATES */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <SkeletonBox key={i} className="h-28" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-sm font-bold mb-1">No templates yet</p>
              <p className="text-xs text-gray-400 mb-5">
                Save caption formats to reuse across any platform in one click.
              </p>
              <button onClick={() => setShowForm(true)}
                className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
                Create your first template →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(t => (
                <div key={t.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-300 transition-all group">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-extrabold">{t.title}</p>
                      <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {t.category || 'Other'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                      <button onClick={() => handleCopy(t)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all border ${
                          copied === t.id
                            ? 'bg-green-500 text-white border-green-500'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}>
                        {copied === t.id ? '✓ Copied' : 'Copy'}
                      </button>
                      <Link href={`/compose?template=${t.id}`}
                        className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                        Use →
                      </Link>
                      <button onClick={() => handleEdit(t)}
                        className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id}
                        className="text-xs font-bold px-3 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all disabled:opacity-40">
                        {deleting === t.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 whitespace-pre-line mb-3">
                    {t.content}
                  </p>
                  {t.platforms && t.platforms.length > 0 && (
                    <div className="flex items-center gap-1">
                      {t.platforms.map((p: string) => (
                        <span key={p} className="text-sm">{PLATFORM_ICONS[p]}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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