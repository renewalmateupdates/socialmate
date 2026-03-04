'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type Template = {
  id: string
  name: string
  content: string
  category: string
  platforms: string[]
  created_at: string
  use_count: number
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  snapchat: '👻', bluesky: '🦋', reddit: '🤖', discord: '💬',
  telegram: '✈️', mastodon: '🐘', lemon8: '🍋', bereal: '📷',
}

const CATEGORIES = ['All', 'Promotional', 'Educational', 'Personal', 'Engagement', 'Announcement', 'Other']

const PLATFORMS = [
  { id: 'instagram', icon: '📸', label: 'Instagram' },
  { id: 'twitter', icon: '🐦', label: 'X / Twitter' },
  { id: 'linkedin', icon: '💼', label: 'LinkedIn' },
  { id: 'tiktok', icon: '🎵', label: 'TikTok' },
  { id: 'facebook', icon: '📘', label: 'Facebook' },
  { id: 'threads', icon: '🧵', label: 'Threads' },
]

export default function Templates() {
  const [user, setUser] = useState<any>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  const [formName, setFormName] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formCategory, setFormCategory] = useState('Other')
  const [formPlatforms, setFormPlatforms] = useState<string[]>([])

  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase.from('post_templates').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setTemplates(data || [])
      setLoading(false)
    }
    getData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openCreate = () => {
    setEditingTemplate(null)
    setFormName(''); setFormContent(''); setFormCategory('Other'); setFormPlatforms([])
    setShowModal(true)
  }

  const openEdit = (t: Template) => {
    setEditingTemplate(t)
    setFormName(t.name); setFormContent(t.content); setFormCategory(t.category); setFormPlatforms(t.platforms || [])
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formName.trim()) { showToast('Add a template name', 'error'); return }
    if (!formContent.trim()) { showToast('Add some content', 'error'); return }
    setSaving(true)
    const payload = { name: formName.trim(), content: formContent.trim(), category: formCategory, platforms: formPlatforms, user_id: user.id }
    if (editingTemplate) {
      const { error } = await supabase.from('post_templates').update(payload).eq('id', editingTemplate.id)
      if (error) { showToast('Failed to update template', 'error'); setSaving(false); return }
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...payload } : t))
      showToast('Template updated!', 'success')
    } else {
      const { data, error } = await supabase.from('post_templates').insert({ ...payload, use_count: 0 }).select().single()
      if (error) { showToast('Failed to create template', 'error'); setSaving(false); return }
      setTemplates(prev => [data, ...prev])
      showToast('Template created!', 'success')
    }
    setSaving(false)
    setShowModal(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('post_templates').delete().eq('id', id)
    setTemplates(prev => prev.filter(t => t.id !== id))
    setPreviewTemplate(null)
    showToast('Template deleted', 'success')
  }

  const handleUseTemplate = async (template: Template) => {
    await supabase.from('post_templates').update({ use_count: (template.use_count || 0) + 1 }).eq('id', template.id)
    router.push(`/compose?template=${encodeURIComponent(template.content)}`)
  }

  const toggleFormPlatform = (id: string) => {
    setFormPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const filtered = templates.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.content.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || t.category === category
    return matchSearch && matchCat
  })

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="ml-56 flex-1 p-8">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Templates</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {loading ? 'Loading...' : `${templates.length} template${templates.length !== 1 ? 's' : ''} saved`}
              </p>
            </div>
            <button onClick={openCreate} className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
              + New Template
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input type="text" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)}
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
              {[1,2,3,4,5,6].map(i => <SkeletonBox key={i} className="h-44 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
              <div className="text-5xl mb-4">{search ? '🔍' : '📝'}</div>
              <h2 className="text-lg font-bold tracking-tight mb-2">{search ? 'No templates match your search' : 'No templates yet'}</h2>
              <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                {search ? 'Try a different search term.' : 'Save your most-used post formats as templates to speed up your workflow.'}
              </p>
              {!search && (
                <button onClick={openCreate} className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
                  Create Your First Template →
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(template => (
                <div key={template.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-gray-300 transition-all group cursor-pointer"
                  onClick={() => setPreviewTemplate(template)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{template.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{template.category}</span>
                        {template.use_count > 0 && <span className="text-xs text-gray-400">Used {template.use_count}×</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 ml-2 flex-shrink-0">
                      {template.platforms?.slice(0, 3).map(pl => <span key={pl} className="text-sm">{PLATFORM_ICONS[pl] || '📱'}</span>)}
                      {template.platforms?.length > 3 && <span className="text-xs text-gray-400">+{template.platforms.length - 3}</span>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-4 flex-1 whitespace-pre-line leading-relaxed">{template.content}</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={e => { e.stopPropagation(); handleUseTemplate(template) }}
                      className="flex-1 py-1.5 text-xs font-semibold bg-black text-white rounded-xl hover:opacity-80 transition-all">Use Template</button>
                    <button onClick={e => { e.stopPropagation(); openEdit(template) }}
                      className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl hover:border-gray-400 transition-all">Edit</button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(template.id) }}
                      className="px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-100 rounded-xl hover:border-red-300 transition-all">×</button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-extrabold tracking-tight">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black text-xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Template Name</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Weekly Tips, Product Launch, Q&A Post"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Category</label>
                <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white">
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p.id} onClick={() => toggleFormPlatform(p.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${formPlatforms.includes(p.id) ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      <span>{p.icon}</span>{p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Content</label>
                <textarea value={formContent} onChange={e => setFormContent(e.target.value)} placeholder="Write your template content here..." rows={6}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none" />
                <p className="text-xs text-gray-400 mt-1">{formContent.length} characters</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:border-gray-400 transition-all">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 text-sm font-semibold bg-black text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                {saving ? 'Saving...' : editingTemplate ? 'Save Changes' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewTemplate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-extrabold tracking-tight">{previewTemplate.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{previewTemplate.category}</span>
                  {previewTemplate.platforms?.map(pl => <span key={pl} className="text-sm">{PLATFORM_ICONS[pl]}</span>)}
                </div>
              </div>
              <button onClick={() => setPreviewTemplate(null)} className="text-gray-400 hover:text-black text-xl leading-none">×</button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 max-h-60 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{previewTemplate.content}</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
              <button onClick={() => { setPreviewTemplate(null); openEdit(previewTemplate) }}
                className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:border-gray-400 transition-all">✏️ Edit</button>
              <button onClick={() => handleUseTemplate(previewTemplate)}
                className="flex-1 py-2.5 text-sm font-semibold bg-black text-white rounded-xl hover:opacity-80 transition-all">Use Template →</button>
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