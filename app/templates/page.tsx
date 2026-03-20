'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ${className}`} />
}

const CATEGORIES = ['All', 'Promotional', 'Educational', 'Engagement', 'Announcement', 'Personal', 'Other']

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  bluesky: '🦋', reddit: '🤖', discord: '💬', telegram: '✈️',
  mastodon: '🐘', snapchat: '👻', lemon8: '🍋', bereal: '📷',
}

// Only show live platforms in the template platform picker
const LIVE_PLATFORM_IDS = ['discord', 'bluesky', 'telegram', 'mastodon']
const SOON_PLATFORM_IDS = ['linkedin', 'youtube', 'pinterest', 'reddit']

const STARTER_TEMPLATES = [
  {
    id: 'starter-1',
    title: 'Product / Service Launch',
    category: 'Promotional',
    platforms: ['bluesky', 'discord'],
    content: `🚀 Introducing [product/service name]!\n\n[One sentence describing what it does and who it's for.]\n\nHere's what makes it different:\n✅ [Benefit 1]\n✅ [Benefit 2]\n✅ [Benefit 3]\n\n[Call to action — link in bio / comment below / DM us]`,
  },
  {
    id: 'starter-2',
    title: 'Quick Tip / How-To',
    category: 'Educational',
    platforms: ['bluesky', 'mastodon'],
    content: `💡 [Topic] tip that changed everything for me:\n\n[Tip in one clear sentence.]\n\nHere's how to do it:\n1️⃣ [Step 1]\n2️⃣ [Step 2]\n3️⃣ [Step 3]\n\nSave this for later and share with someone who needs it! 👇`,
  },
  {
    id: 'starter-3',
    title: 'Engagement Question',
    category: 'Engagement',
    platforms: ['bluesky', 'discord', 'mastodon'],
    content: `[Relatable observation or bold statement about your niche.] 🤔\n\nI used to think [common misconception], but now I know [what you actually believe].\n\nWhat do you think — am I wrong?\n\nDrop your take below 👇`,
  },
  {
    id: 'starter-4',
    title: 'Behind the Scenes',
    category: 'Personal',
    platforms: ['discord', 'telegram'],
    content: `A little behind the scenes of [what you're working on] 👀\n\n[Short honest description of what your day/process looks like.]\n\nThe part nobody tells you about [your field/work]:\n[Honest, unexpected insight]\n\nAnything you want to know more about? Ask me below 👇`,
  },
  {
    id: 'starter-5',
    title: 'Weekly Roundup',
    category: 'Announcement',
    platforms: ['bluesky', 'mastodon'],
    content: `This week in [your niche] 📰\n\n→ [Thing 1 that happened or that you learned]\n→ [Thing 2]\n→ [Thing 3]\n\nMy take: [One sentence opinion or insight]\n\nFollowing along? Subscribe so you don't miss next week's. 🔔`,
  },
]

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
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [savingStarter, setSavingStarter] = useState<string | null>(null)
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
  }, [router])

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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await supabase.from('post_templates').delete().eq('id', id)
    setTemplates(prev => prev.filter(t => t.id !== id))
    setConfirmDelete(null)
    showToast('Deleted', 'success')
    setDeleting(null)
  }

  const handleCopy = (t: any) => {
    navigator.clipboard.writeText(t.content)
    setCopied(t.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSaveStarter = async (starter: typeof STARTER_TEMPLATES[0]) => {
    if (!userId) return
    setSavingStarter(starter.id)
    const { data, error } = await supabase
      .from('post_templates')
      .insert({
        user_id: userId,
        title: starter.title,
        content: starter.content,
        category: starter.category,
        platforms: starter.platforms,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) { showToast('Failed to save', 'error'); setSavingStarter(null); return }
    setTemplates(prev => [data, ...prev])
    showToast(`"${starter.title}" saved to your templates`, 'success')
    setSavingStarter(null)
  }

  const togglePlatform = (id: string) => {
    setPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const filtered = activeCategory === 'All'
    ? templates
    : templates.filter(t => t.category === activeCategory)

  return (
    <div className="min-h-screen bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Post Templates</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {loading ? 'Loading...' : `${templates.length} template${templates.length !== 1 ? 's' : ''} saved`}
              </p>
            </div>
            {!showForm && (
              <button onClick={() => setShowForm(true)}
                className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all self-start sm:self-auto">
                + New Template
              </button>
            )}
          </div>

          {/* FORM */}
          {showForm && (
            <div className="bg-surface border border-theme-md rounded-2xl p-5 md:p-6 mb-6">
              <h2 className="text-sm font-extrabold mb-4">
                {editingId ? 'Edit Template' : 'New Template'}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Product Launch Announcement"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400 dark:focus:border-gray-400"
                      autoFocus />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400 bg-white dark:bg-gray-900 dark:text-gray-100">
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
                    Content
                    <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(use [brackets] for fill-in sections)</span>
                  </label>
                  <textarea value={content} onChange={e => setContent(e.target.value)}
                    placeholder="Excited to announce [product/service]! 🎉&#10;&#10;[Describe key benefit]&#10;&#10;[Call to action] 👇"
                    rows={6}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-gray-400 resize-none" />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{content.length} chars</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
                    Best for platforms <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LIVE_PLATFORM_IDS.map(id => (
                      <button key={id} onClick={() => togglePlatform(id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          platforms.includes(id)
                            ? 'bg-black text-white border-black'
                            : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400'
                        }`}>
                        <span>{PLATFORM_ICONS[id]}</span>
                        <span className="capitalize">{id}</span>
                      </button>
                    ))}
                    {SOON_PLATFORM_IDS.map(id => (
                      <div key={id}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border border-dashed border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                        title={`${id} — coming soon`}>
                        <span>{PLATFORM_ICONS[id]}</span>
                        <span className="capitalize">{id}</span>
                        <span className="text-gray-200 dark:text-gray-600 ml-0.5 text-xs">Soon</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button onClick={handleSave} disabled={saving}
                    className="bg-black text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                    {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Template'}
                  </button>
                  <button onClick={resetForm}
                    className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 text-sm font-semibold rounded-xl hover:border-gray-400 transition-all">
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
                      : 'bg-surface border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* USER TEMPLATES */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <SkeletonBox key={i} className="h-28" />)}
            </div>
          ) : filtered.length > 0 && (
            <div className="space-y-3 mb-10">
              {filtered.map(t => {
                const isConfirming = confirmDelete === t.id
                return (
                  <div key={t.id}
                    className="bg-surface border border-theme rounded-2xl p-4 md:p-5 hover:border-gray-300 transition-all">

                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <p className="text-sm font-extrabold truncate">{t.title}</p>
                        <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full flex-shrink-0">
                          {t.category || 'Other'}
                        </span>
                      </div>
                      {/* Always visible actions */}
                      {!isConfirming && (
                        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                          <button onClick={() => handleCopy(t)}
                            className={`text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all border ${
                              copied === t.id
                                ? 'bg-green-500 text-white border-green-500'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                            }`}>
                            {copied === t.id ? '✓' : 'Copy'}
                          </button>
                          <Link href={`/compose?template=${t.id}`}
                            className="text-xs font-bold px-2.5 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                            Use →
                          </Link>
                          <button onClick={() => handleEdit(t)}
                            className="text-xs font-bold px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                            Edit
                          </button>
                          <button onClick={() => setConfirmDelete(t.id)}
                            className="text-xs font-bold px-2.5 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 whitespace-pre-line mb-3">
                      {t.content}
                    </p>

                    {t.platforms && t.platforms.length > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        {t.platforms.map((p: string) => (
                          <span key={p} className="text-sm">{PLATFORM_ICONS[p]}</span>
                        ))}
                      </div>
                    )}

                    {/* CONFIRM DELETE — below content, full width */}
                    {isConfirming && (
                      <div className="mt-3 pt-3 border-t border-theme flex flex-col sm:flex-row sm:items-center gap-2">
                        <p className="text-xs text-red-600 font-semibold flex-1">
                          Permanently delete "{t.title}"? This cannot be undone.
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id}
                            className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
                            {deleting === t.id
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

          {/* STARTER TEMPLATES */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-bold tracking-tight">Starter Templates</h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">Free to use</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              Ready-made formats for the 4 live platforms. Hit "Use →" to open in Compose, or "Save" to add to your collection.
            </p>
            <div className="space-y-3">
              {STARTER_TEMPLATES.map(t => (
                <div key={t.id}
                  className="bg-surface border border-theme rounded-2xl p-4 md:p-5 hover:border-gray-300 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <p className="text-sm font-extrabold truncate">{t.title}</p>
                      <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full flex-shrink-0">
                        {t.category}
                      </span>
                    </div>
                    {/* Always visible */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                      <button onClick={() => handleCopy(t)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all border ${
                          copied === t.id
                            ? 'bg-green-500 text-white border-green-500'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                        }`}>
                        {copied === t.id ? '✓' : 'Copy'}
                      </button>
                      <Link href={`/compose?starterTemplate=${t.id}`}
                        className="text-xs font-bold px-2.5 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                        Use →
                      </Link>
                      <button onClick={() => handleSaveStarter(t)} disabled={savingStarter === t.id}
                        className="text-xs font-bold px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all disabled:opacity-40">
                        {savingStarter === t.id ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 whitespace-pre-line mb-3">
                    {t.content}
                  </p>
                  <div className="flex items-center gap-1">
                    {t.platforms.map(p => (
                      <span key={p} className="text-sm">{PLATFORM_ICONS[p]}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EMPTY STATE */}
          {!loading && templates.length === 0 && !showForm && (
            <div className="mt-8 bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
              <p className="text-xs text-gray-400">
                You haven't saved any templates yet. Use a starter above or{' '}
                <button onClick={() => setShowForm(true)} className="text-black font-bold underline">
                  create your own
                </button>.
              </p>
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