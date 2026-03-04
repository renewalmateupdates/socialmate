'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type BioLink = {
  id: string
  title: string
  url: string
  icon: string
  active: boolean
  order: number
  clicks: number
}

type BioPage = {
  id: string
  username: string
  display_name: string
  bio: string
  avatar_url: string
  theme: string
  background_color: string
}

const THEMES = [
  { id: 'minimal', label: 'Minimal', bg: 'bg-white', text: 'text-gray-900', button: 'bg-gray-900 text-white' },
  { id: 'dark', label: 'Dark', bg: 'bg-gray-900', text: 'text-white', button: 'bg-white text-gray-900' },
  { id: 'soft', label: 'Soft', bg: 'bg-rose-50', text: 'text-gray-800', button: 'bg-rose-400 text-white' },
  { id: 'ocean', label: 'Ocean', bg: 'bg-sky-50', text: 'text-sky-900', button: 'bg-sky-500 text-white' },
  { id: 'forest', label: 'Forest', bg: 'bg-emerald-50', text: 'text-emerald-900', button: 'bg-emerald-600 text-white' },
]

const LINK_ICONS = ['🔗', '🌐', '📸', '🐦', '💼', '🎵', '▶️', '📧', '📱', '🛒', '📝', '🎨', '💡', '🎤', '📚', '🎯']

export default function LinkInBio() {
  const [user, setUser] = useState<any>(null)
  const [bioPage, setBioPage] = useState<BioPage | null>(null)
  const [links, setLinks] = useState<BioLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'links' | 'appearance'>('links')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showAddLink, setShowAddLink] = useState(false)
  const [editingLink, setEditingLink] = useState<BioLink | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const [formTitle, setFormTitle] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [formIcon, setFormIcon] = useState('🔗')

  const [pageName, setPageName] = useState('')
  const [pageUsername, setPageUsername] = useState('')
  const [pageBio, setPageBio] = useState('')
  const [pageTheme, setPageTheme] = useState('minimal')

  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data: page } = await supabase.from('bio_pages').select('*').eq('user_id', user.id).single()
      if (page) {
        setBioPage(page)
        setPageName(page.display_name || '')
        setPageUsername(page.username || '')
        setPageBio(page.bio || '')
        setPageTheme(page.theme || 'minimal')
      } else {
        const defaultUsername = user.email?.split('@')[0] || 'user'
        setPageUsername(defaultUsername)
      }
      const { data: linksData } = await supabase.from('bio_links').select('*').eq('user_id', user.id).order('order', { ascending: true })
      setLinks(linksData || [])
      setLoading(false)
    }
    getData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSavePage = async () => {
    setSaving(true)
    const payload = {
      user_id: user.id,
      display_name: pageName,
      username: pageUsername.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      bio: pageBio,
      theme: pageTheme,
    }
    const { error } = await supabase.from('bio_pages').upsert(payload, { onConflict: 'user_id' })
    if (error) { showToast('Failed to save', 'error'); setSaving(false); return }
    showToast('Page saved!', 'success')
    setSaving(false)
  }

  const openAddLink = () => {
    setEditingLink(null)
    setFormTitle(''); setFormUrl(''); setFormIcon('🔗')
    setShowAddLink(true)
  }

  const openEditLink = (link: BioLink) => {
    setEditingLink(link)
    setFormTitle(link.title); setFormUrl(link.url); setFormIcon(link.icon)
    setShowAddLink(true)
  }

  const handleSaveLink = async () => {
    if (!formTitle.trim()) { showToast('Add a title', 'error'); return }
    if (!formUrl.trim()) { showToast('Add a URL', 'error'); return }
    const url = formUrl.startsWith('http') ? formUrl : `https://${formUrl}`
    if (editingLink) {
      const { error } = await supabase.from('bio_links').update({ title: formTitle.trim(), url, icon: formIcon }).eq('id', editingLink.id)
      if (error) { showToast('Failed to update link', 'error'); return }
      setLinks(prev => prev.map(l => l.id === editingLink.id ? { ...l, title: formTitle.trim(), url, icon: formIcon } : l))
      showToast('Link updated!', 'success')
    } else {
      const newOrder = links.length
      const { data, error } = await supabase.from('bio_links').insert({
        user_id: user.id, title: formTitle.trim(), url, icon: formIcon, active: true, order: newOrder, clicks: 0,
      }).select().single()
      if (error) { showToast('Failed to add link', 'error'); return }
      setLinks(prev => [...prev, data])
      showToast('Link added!', 'success')
    }
    setShowAddLink(false)
  }

  const handleDeleteLink = async (id: string) => {
    await supabase.from('bio_links').delete().eq('id', id)
    setLinks(prev => prev.filter(l => l.id !== id))
    showToast('Link removed', 'success')
  }

  const handleToggleActive = async (link: BioLink) => {
    await supabase.from('bio_links').update({ active: !link.active }).eq('id', link.id)
    setLinks(prev => prev.map(l => l.id === link.id ? { ...l, active: !l.active } : l))
  }

  const handleDragStart = (id: string) => setDragId(id)
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id) }
  const handleDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return }
    const oldIndex = links.findIndex(l => l.id === dragId)
    const newIndex = links.findIndex(l => l.id === targetId)
    const reordered = [...links]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    const updated = reordered.map((l, i) => ({ ...l, order: i }))
    setLinks(updated)
    for (const l of updated) { await supabase.from('bio_links').update({ order: l.order }).eq('id', l.id) }
    setDragId(null); setDragOverId(null)
  }

  const currentTheme = THEMES.find(t => t.id === pageTheme) || THEMES[0]
  const activeLinks = links.filter(l => l.active)
  const bioUrl = `socialmate.app/${pageUsername || 'yourname'}`

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="ml-56 flex-1 p-8">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Link in Bio</h1>
              <p className="text-sm text-gray-400 mt-0.5">{pageUsername ? `socialmate.app/${pageUsername}` : 'Set up your bio page'}</p>
            </div>
            <div className="flex items-center gap-2">
              {pageUsername && (
                <a href={`https://${bioUrl}`} target="_blank" rel="noreferrer"
                  className="text-sm font-semibold px-4 py-2.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                  🔗 Preview
                </a>
              )}
              <button onClick={handleSavePage} disabled={saving}
                className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                {saving ? 'Saving...' : 'Save Page'}
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 w-fit">
                {(['links', 'appearance'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${activeTab === tab ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}>
                    {tab === 'links' ? '🔗 Links' : '🎨 Appearance'}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <SkeletonBox key={i} className="h-16 rounded-2xl" />)}</div>
              ) : activeTab === 'links' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Links</p>
                      <p className="text-2xl font-extrabold">{links.length}</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Clicks</p>
                      <p className="text-2xl font-extrabold">{links.reduce((s, l) => s + (l.clicks || 0), 0)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Your Links</p>
                    <button onClick={openAddLink} className="text-xs font-semibold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all">+ Add Link</button>
                  </div>
                  {links.length === 0 ? (
                    <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
                      <div className="text-4xl mb-3">🔗</div>
                      <p className="text-sm font-bold mb-1">No links yet</p>
                      <p className="text-xs text-gray-400 mb-4">Add links to your socials, website, or anything else</p>
                      <button onClick={openAddLink} className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">Add Your First Link →</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {links.map(link => (
                        <div key={link.id} draggable
                          onDragStart={() => handleDragStart(link.id)}
                          onDragOver={e => handleDragOver(e, link.id)}
                          onDrop={() => handleDrop(link.id)}
                          onDragEnd={() => { setDragId(null); setDragOverId(null) }}
                          className={`flex items-center gap-3 p-4 bg-white border rounded-2xl transition-all group cursor-grab active:cursor-grabbing ${dragOverId === link.id ? 'border-black scale-[1.01]' : 'border-gray-100 hover:border-gray-300'} ${!link.active ? 'opacity-50' : ''} ${dragId === link.id ? 'opacity-30' : ''}`}>
                          <span className="text-gray-300 text-sm cursor-grab">⠿</span>
                          <span className="text-xl flex-shrink-0">{link.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{link.title}</p>
                            <p className="text-xs text-gray-400 truncate">{link.url}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <span>{link.clicks || 0} clicks</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => handleToggleActive(link)}
                              className={`w-9 h-5 rounded-full transition-all relative ${link.active ? 'bg-black' : 'bg-gray-200'}`}>
                              <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${link.active ? 'left-5' : 'left-1'}`} />
                            </button>
                            <button onClick={() => openEditLink(link)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-black transition-all text-sm">✏️</button>
                            <button onClick={() => handleDeleteLink(link.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all">×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5 bg-white border border-gray-100 rounded-2xl p-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Display Name</label>
                    <input type="text" value={pageName} onChange={e => setPageName(e.target.value)} placeholder="Your name or brand"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Username</label>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400 transition-all">
                      <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">socialmate.app/</span>
                      <input type="text" value={pageUsername} onChange={e => setPageUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="yourname" className="flex-1 px-3 py-2.5 text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Bio</label>
                    <textarea value={pageBio} onChange={e => setPageBio(e.target.value)} placeholder="Tell people about yourself..." rows={3}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-3">Theme</label>
                    <div className="grid grid-cols-5 gap-2">
                      {THEMES.map(theme => (
                        <button key={theme.id} onClick={() => setPageTheme(theme.id)}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${pageTheme === theme.id ? 'border-black' : 'border-gray-200 hover:border-gray-400'}`}>
                          <div className={`w-full h-8 rounded-lg ${theme.bg} border border-gray-200 flex items-center justify-center`}>
                            <div className={`w-6 h-2 rounded-full ${theme.button.split(' ')[0]}`} />
                          </div>
                          <span className="text-xs font-semibold text-gray-600">{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-64 flex-shrink-0">
              <div className="sticky top-8">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 text-center">Preview</p>
                <div className={`rounded-3xl p-5 ${currentTheme.bg} border border-gray-200 shadow-xl min-h-96`}>
                  <div className="text-center mb-5">
                    <div className="w-14 h-14 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center text-xl font-bold">
                      {(pageName || pageUsername || 'U').charAt(0).toUpperCase()}
                    </div>
                    <p className={`text-sm font-bold ${currentTheme.text}`}>{pageName || pageUsername || 'Your Name'}</p>
                    {pageBio && <p className={`text-xs mt-1 opacity-70 ${currentTheme.text}`}>{pageBio}</p>}
                  </div>
                  <div className="space-y-2">
                    {activeLinks.slice(0, 5).map(link => (
                      <div key={link.id} className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 ${currentTheme.button}`}>
                        <span>{link.icon}</span>{link.title}
                      </div>
                    ))}
                    {activeLinks.length === 0 && (
                      <div className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center opacity-30 ${currentTheme.button}`}>Your Link Here</div>
                    )}
                  </div>
                  {activeLinks.length > 5 && <p className={`text-xs text-center mt-2 opacity-50 ${currentTheme.text}`}>+{activeLinks.length - 5} more</p>}
                </div>
                <p className="text-xs text-center mt-2 text-gray-400">{bioUrl}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {showAddLink && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setShowAddLink(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-extrabold tracking-tight">{editingLink ? 'Edit Link' : 'Add Link'}</h2>
              <button onClick={() => setShowAddLink(false)} className="text-gray-400 hover:text-black text-xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {LINK_ICONS.map(icon => (
                    <button key={icon} onClick={() => setFormIcon(icon)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border-2 transition-all ${formIcon === icon ? 'border-black' : 'border-gray-200 hover:border-gray-400'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Title</label>
                <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. My Instagram, Shop Now, Portfolio"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">URL</label>
                <input type="url" value={formUrl} onChange={e => setFormUrl(e.target.value)} placeholder="https://..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
              <button onClick={() => setShowAddLink(false)} className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:border-gray-400 transition-all">Cancel</button>
              <button onClick={handleSaveLink} className="flex-1 py-2.5 text-sm font-semibold bg-black text-white rounded-xl hover:opacity-80 transition-all">
                {editingLink ? 'Save Changes' : 'Add Link'}
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