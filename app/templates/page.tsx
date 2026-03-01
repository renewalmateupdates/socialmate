'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type Template = {
  id: string
  name: string
  content: string
  platform: string
  category: string
  created_at: string
}

const PLATFORMS = [
  'Any', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'Facebook',
  'Pinterest', 'YouTube', 'Threads', 'Snapchat', 'Bluesky', 'Reddit',
  'Discord', 'Telegram', 'Mastodon', 'Lemon8', 'BeReal', 'WhatsApp'
]

const CATEGORIES = [
  'General', 'Promotion', 'Announcement', 'Quote', 'Question',
  'Behind the Scenes', 'Product', 'Event', 'Holiday', 'Engagement'
]

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  snapchat: '👻', bluesky: '🦋', reddit: '🤖', discord: '💬',
  telegram: '✈️', mastodon: '🐘', lemon8: '🍋', bereal: '📷',
  whatsapp: '💚', any: '📱'
}

const CATEGORY_COLORS: Record<string, string> = {
  promotion: 'bg-orange-50 text-orange-600',
  announcement: 'bg-blue-50 text-blue-600',
  quote: 'bg-purple-50 text-purple-600',
  question: 'bg-yellow-50 text-yellow-700',
  'behind the scenes': 'bg-pink-50 text-pink-600',
  product: 'bg-green-50 text-green-600',
  event: 'bg-red-50 text-red-600',
  holiday: 'bg-indigo-50 text-indigo-600',
  engagement: 'bg-teal-50 text-teal-600',
  general: 'bg-gray-100 text-gray-600',
}

const STARTER_TEMPLATES = [
  { name: 'Product Launch', platform: 'Instagram', category: 'Promotion', content: '🚀 Introducing [Product Name]!\n\n[Describe what makes it special in 1-2 sentences.]\n\n✨ Key features:\n• [Feature 1]\n• [Feature 2]\n• [Feature 3]\n\n👉 [Call to action — link in bio / shop now / etc.]\n\n#launch #new #[yourbrand]' },
  { name: 'Motivational Quote', platform: 'Any', category: 'Quote', content: '"[Insert your quote here]"\n\n— [Author or Your Name]\n\n[Add 1-2 sentences connecting the quote to your audience or brand.]\n\n#motivation #mindset #inspiration' },
  { name: 'Engagement Question', platform: 'Any', category: 'Question', content: 'Quick question for you 👇\n\n[Ask a simple, engaging question your audience will want to answer.]\n\nDrop your answer in the comments! 💬\n\n#community #[yourniche]' },
  { name: 'Behind the Scenes', platform: 'Instagram', category: 'Behind the Scenes', content: '👀 A little peek behind the curtain...\n\n[Describe what you\'re sharing — your process, workspace, day, etc.]\n\n[Add a personal touch or story that makes it relatable.]\n\n#behindthescenes #[yourbrand] #bts' },
  { name: 'Announcement', platform: 'Any', category: 'Announcement', content: '📣 Big news!\n\n[State your announcement clearly and excitedly.]\n\n[Add any important details — date, link, next steps.]\n\nStay tuned for more updates! 👀\n\n#announcement #news #[yourbrand]' },
  { name: 'LinkedIn Thought Leadership', platform: 'LinkedIn', category: 'General', content: 'I\'ve been thinking about [topic] a lot lately.\n\nHere\'s what I\'ve learned:\n\n1️⃣ [First insight]\n\n2️⃣ [Second insight]\n\n3️⃣ [Third insight]\n\nThe biggest takeaway? [Summarize your main point.]\n\nWhat\'s your experience with this? I\'d love to hear your thoughts.' },
]

export default function Templates() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<Template[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [platform, setPlatform] = useState('Any')
  const [category, setCategory] = useState('General')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const router = useRouter()

  const AI_CREDITS_LEFT = 15
  const AI_CREDITS_TOTAL = 15
  const ACCOUNTS_USED = 0
  const ACCOUNTS_TOTAL = 16

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase
        .from('post_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setTemplates(data || [])
      setLoading(false)
    }
    getData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openNew = () => {
    setEditingId(null)
    setName('')
    setContent('')
    setPlatform('Any')
    setCategory('General')
    setShowModal(true)
  }

  const openEdit = (t: Template) => {
    setEditingId(t.id)
    setName(t.name)
    setContent(t.content)
    setPlatform(t.platform || 'Any')
    setCategory(t.category || 'General')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!name.trim()) { showToast('Please enter a template name', 'error'); return }
    if (!content.trim()) { showToast('Please add some content', 'error'); return }
    setSaving(true)

    if (editingId) {
      const { error } = await supabase
        .from('post_templates')
        .update({ name: name.trim(), content: content.trim(), platform, category })
        .eq('id', editingId)
      if (error) { showToast('Failed to update template', 'error'); setSaving(false); return }
      setTemplates(prev => prev.map(t => t.id === editingId ? { ...t, name: name.trim(), content: content.trim(), platform, category } : t))
      showToast('Template updated!', 'success')
    } else {
      const { data, error } = await supabase
        .from('post_templates')
        .insert({ user_id: user.id, name: name.trim(), content: content.trim(), platform, category })
        .select()
        .single()
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
    showToast('Template deleted', 'success')
  }

  const handleCopy = (t: Template) => {
    navigator.clipboard.writeText(t.content)
    setCopiedId(t.id)
    setTimeout(() => setCopiedId(null), 2000)
    showToast('Template copied!', 'success')
  }

  const loadStarterTemplates = async () => {
    setSaving(true)
    const inserts = STARTER_TEMPLATES.map(t => ({ ...t, user_id: user.id }))
    const { data, error } = await supabase.from('post_templates').insert(inserts).select()
    if (error) { showToast('Failed to load starters', 'error'); setSaving(false); return }
    setTemplates(prev => [...(data || []), ...prev])
    showToast(`${STARTER_TEMPLATES.length} starter templates added!`, 'success')
    setSaving(false)
  }

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category).filter(Boolean)))]
  const platforms = ['all', ...Array.from(new Set(templates.map(t => t.platform).filter(Boolean)))]

  const filtered = templates.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.content.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCategory === 'all' || t.category === filterCategory
    const matchPlat = filterPlatform === 'all' || t.platform === filterPlatform
    return matchSearch && matchCat && matchPlat
  })

  const previewTemplate = templates.find(t => t.id === previewId)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* SIDEBAR */}
      <div className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2">Content</div>
          {[
            { icon: "🏠", label: "Dashboard", href: "/dashboard" },
            { icon: "📅", label: "Calendar", href: "/calendar" },
            { icon: "✏️", label: "Compose", href: "/compose" },
            { icon: "📂", label: "Drafts", href: "/drafts" },
            { icon: "⏳", label: "Queue", href: "/queue" },
            { icon: "#️⃣", label: "Hashtags", href: "/hashtags" },
            { icon: "🖼️", label: "Media Library", href: "/media" },
{ icon: "📝", label: "Templates", href: "/templates" },
            { icon: "📝", label: "Templates", href: "/templates", active: true },
          ].map(item => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${'active' in item && item.active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Insights</div>
          {[
            { icon: "📊", label: "Analytics", href: "/analytics" },
            { icon: "🔍", label: "Best Times", href: "/best-times" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Settings</div>
          {[
            { icon: "🔗", label: "Accounts", href: "/accounts" },
            { icon: "👥", label: "Team", href: "/team" },
            { icon: "⚙️", label: "Settings", href: "/settings" },
            { icon: "🎁", label: "Referrals", href: "/referral" },
            { icon: "🔔", label: "Notifications", href: "/notifications" },
{ icon: "🔎", label: "Search", href: "/search" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">AI Credits</span>
              <span className="text-xs font-bold text-gray-700">{AI_CREDITS_LEFT}/{AI_CREDITS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full transition-all" style={{ width: `${(AI_CREDITS_LEFT / AI_CREDITS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{AI_CREDITS_LEFT} credits remaining</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">Accounts</span>
              <span className="text-xs font-bold text-gray-700">{ACCOUNTS_USED}/{ACCOUNTS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full transition-all" style={{ width: `${(ACCOUNTS_USED / ACCOUNTS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{ACCOUNTS_TOTAL - ACCOUNTS_USED} slots remaining</p>
          </div>
          <Link href="/pricing" className="w-full block text-center bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            ⚡ Upgrade to Pro
          </Link>
          <div className="px-1">
            <div className="text-xs text-gray-400 truncate mb-1">{user?.email}</div>
            <button onClick={handleSignOut} className="w-full text-left px-0 py-1 text-xs text-gray-400 hover:text-black transition-all">Sign out</button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="ml-56 flex-1 p-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Post Templates</h1>
            <p className="text-sm text-gray-400 mt-0.5">Save and reuse caption structures across your posts</p>
          </div>
          <div className="flex items-center gap-2">
            {templates.length === 0 && !loading && (
              <button
                onClick={loadStarterTemplates}
                disabled={saving}
                className="text-sm font-semibold px-4 py-2.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all disabled:opacity-50"
              >
                ✨ Load Starter Templates
              </button>
            )}
            <button onClick={openNew} className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
              + New Template
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5">
                <SkeletonBox className="h-3 w-16 mb-4" />
                <SkeletonBox className="h-8 w-10 mb-2" />
                <SkeletonBox className="h-3 w-20" />
              </div>
            ))
          ) : (
            [
              { label: "Templates", value: templates.length.toString(), sub: "saved", icon: "📝" },
              { label: "Categories", value: Array.from(new Set(templates.map(t => t.category).filter(Boolean))).length.toString(), sub: "types", icon: "🗂️" },
              { label: "Platforms", value: Array.from(new Set(templates.map(t => t.platform).filter(Boolean))).length.toString(), sub: "covered", icon: "📱" },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                  <span className="text-base">{stat.icon}</span>
                </div>
                <div className="text-3xl font-extrabold tracking-tight mb-1">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.sub}</div>
              </div>
            ))
          )}
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white"
            />
          </div>
          {categories.length > 1 && (
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-gray-400 bg-white"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
              ))}
            </select>
          )}
          {platforms.length > 1 && (
            <select
              value={filterPlatform}
              onChange={e => setFilterPlatform(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-gray-400 bg-white"
            >
              {platforms.map(p => (
                <option key={p} value={p}>{p === 'all' ? 'All Platforms' : p}</option>
              ))}
            </select>
          )}
        </div>

        {/* GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <SkeletonBox key={i} className="h-52 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">{search ? '🔍' : '📝'}</div>
            <h2 className="text-lg font-bold tracking-tight mb-2">
              {search ? 'No templates match your search' : 'No templates yet'}
            </h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              {search
                ? 'Try a different search term or clear your filters.'
                : 'Create reusable caption structures to speed up your posting workflow.'}
            </p>
            {!search && (
              <div className="flex items-center justify-center gap-3">
                <button onClick={loadStarterTemplates} disabled={saving} className="border border-gray-200 text-gray-700 text-sm font-semibold px-6 py-3 rounded-xl hover:border-gray-400 transition-all disabled:opacity-50">
                  ✨ Load Starter Templates
                </button>
                <button onClick={openNew} className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
                  Create From Scratch →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(t => (
              <div key={t.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 hover:border-gray-200 transition-all group">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm tracking-tight truncate">{t.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {t.platform && (
                        <span className="text-xs text-gray-400">
                          {PLATFORM_ICONS[t.platform.toLowerCase()] || '📱'} {t.platform}
                        </span>
                      )}
                      {t.category && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${CATEGORY_COLORS[t.category.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
                          {t.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => openEdit(t)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-black transition-all text-sm">✏️</button>
                    <button onClick={() => handleDelete(t.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-sm">🗑️</button>
                  </div>
                </div>

                {/* Preview */}
                <div
                  className="flex-1 bg-gray-50 rounded-xl p-3 cursor-pointer hover:bg-gray-100 transition-all"
                  onClick={() => setPreviewId(t.id)}
                >
                  <p className="text-xs text-gray-500 line-clamp-4 whitespace-pre-line">{t.content}</p>
                  {t.content.split('\n').length > 4 && (
                    <p className="text-xs text-gray-400 mt-1">Click to see full template...</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(t)}
                    className={`flex-1 text-sm font-semibold py-2 rounded-xl border transition-all ${copiedId === t.id ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                  >
                    {copiedId === t.id ? '✅ Copied!' : '📋 Copy'}
                  </button>
                  <Link
                    href={`/compose?template=${encodeURIComponent(t.content)}`}
                    className="flex-1 text-sm font-semibold py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all text-center"
                  >
                    ✏️ Use
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-bold text-base tracking-tight">{editingId ? 'Edit Template' : 'New Template'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black text-xl leading-none transition-colors">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Template Name</label>
                <input
                  type="text"
                  placeholder="e.g. Product Launch, Monday Motivation..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Platform</label>
                  <select
                    value={platform}
                    onChange={e => setPlatform(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white"
                  >
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                  Content <span className="normal-case font-normal text-gray-400">— use [brackets] for fill-in-the-blank spots</span>
                </label>
                <textarea
                  placeholder="Write your template here. Use [brackets] for parts you'll customize each time, e.g. [Product Name] or [Your Hook]"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{content.length} characters</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 text-sm font-semibold bg-black text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setPreviewId(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-base tracking-tight">{previewTemplate.name}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{previewTemplate.platform} · {previewTemplate.category}</p>
              </div>
              <button onClick={() => setPreviewId(null)} className="text-gray-400 hover:text-black text-xl leading-none transition-colors">×</button>
            </div>
            <div className="p-6">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed bg-gray-50 rounded-xl p-4 max-h-80 overflow-y-auto">{previewTemplate.content}</pre>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => { handleCopy(previewTemplate); setPreviewId(null) }}
                className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:border-gray-400 transition-all"
              >
                📋 Copy Template
              </button>
              <Link
                href={`/compose?template=${encodeURIComponent(previewTemplate.content)}`}
                className="flex-1 py-2.5 text-sm font-semibold bg-black text-white rounded-xl hover:opacity-80 transition-all text-center"
              >
                ✏️ Use in Compose
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}