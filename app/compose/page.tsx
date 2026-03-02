'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import Sidebar from '@/components/Sidebar'

type Template = { id: string; name: string; content: string; category: string }
type HashtagCollection = { id: string; name: string; hashtags: string[] }
type MediaFile = { id: string; name: string; url: string; type: string }

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸', limit: 2200 },
  { id: 'twitter', label: 'X / Twitter', icon: '🐦', limit: 280 },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', limit: 3000 },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', limit: 2200 },
  { id: 'facebook', label: 'Facebook', icon: '📘', limit: 63206 },
  { id: 'pinterest', label: 'Pinterest', icon: '📌', limit: 500 },
  { id: 'youtube', label: 'YouTube', icon: '▶️', limit: 5000 },
  { id: 'threads', label: 'Threads', icon: '🧵', limit: 500 },
  { id: 'snapchat', label: 'Snapchat', icon: '👻', limit: 250 },
  { id: 'bluesky', label: 'Bluesky', icon: '🦋', limit: 300 },
  { id: 'reddit', label: 'Reddit', icon: '🤖', limit: 40000 },
  { id: 'discord', label: 'Discord', icon: '💬', limit: 2000 },
  { id: 'telegram', label: 'Telegram', icon: '✈️', limit: 4096 },
  { id: 'mastodon', label: 'Mastodon', icon: '🐘', limit: 500 },
  { id: 'lemon8', label: 'Lemon8', icon: '🍋', limit: 2200 },
  { id: 'bereal', label: 'BeReal', icon: '📷', limit: 200 },
]

function ComposeInner() {
  const [user, setUser] = useState<any>(null)
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram'])
  const [scheduledAt, setScheduledAt] = useState('')
  const [status, setStatus] = useState<'draft' | 'scheduled'>('draft')
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [activePanel, setActivePanel] = useState<'templates' | 'hashtags' | 'media' | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [hashtags, setHashtags] = useState<HashtagCollection[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [panelLoading, setPanelLoading] = useState(false)
  const [templateSearch, setTemplateSearch] = useState('')
  const [hashtagSearch, setHashtagSearch] = useState('')
  const [mediaSearch, setMediaSearch] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const templateParam = searchParams.get('template')
      const editParam = searchParams.get('edit')
      const dateParam = searchParams.get('date')
      if (templateParam) setContent(decodeURIComponent(templateParam))
      if (dateParam) { setScheduledAt(`${dateParam}T09:00`); setStatus('scheduled') }
      if (editParam) {
        setEditId(editParam)
        const { data } = await supabase.from('posts').select('*').eq('id', editParam).single()
        if (data) {
          setContent(data.content || '')
          setSelectedPlatforms(data.platforms || ['instagram'])
          setScheduledAt(data.scheduled_at ? data.scheduled_at.slice(0, 16) : '')
          setStatus(data.status || 'draft')
        }
      }
    }
    init()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current
    if (!textarea) { setContent(prev => prev + '\n' + text); return }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.slice(0, start) + text + content.slice(end)
    setContent(newContent)
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length
      textarea.focus()
    }, 0)
  }

  const openPanel = async (panel: 'templates' | 'hashtags' | 'media') => {
    if (activePanel === panel) { setActivePanel(null); return }
    setActivePanel(panel)
    setPanelLoading(true)
    if (panel === 'templates' && templates.length === 0) {
      const { data } = await supabase.from('post_templates').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setTemplates(data || [])
    }
    if (panel === 'hashtags' && hashtags.length === 0) {
      const { data } = await supabase.from('hashtag_collections').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setHashtags(data || [])
    }
    if (panel === 'media' && mediaFiles.length === 0) {
      const { data } = await supabase.storage.from('media').list(user.id, { limit: 50, sortBy: { column: 'created_at', order: 'desc' } })
      if (data) {
        const files = data.map((f: any) => ({
          id: f.id || f.name,
          name: f.name,
          url: supabase.storage.from('media').getPublicUrl(`${user.id}/${f.name}`).data.publicUrl,
          type: f.metadata?.mimetype || 'image',
        }))
        setMediaFiles(files)
      }
    }
    setPanelLoading(false)
  }

  const handleSave = async (saveStatus: 'draft' | 'scheduled') => {
    if (!content.trim()) { showToast('Add some content first', 'error'); return }
    if (saveStatus === 'scheduled' && !scheduledAt) { showToast('Pick a scheduled time', 'error'); return }
    if (selectedPlatforms.length === 0) { showToast('Select at least one platform', 'error'); return }
    setSaving(true)
    const payload = {
      content: content.trim(),
      platforms: selectedPlatforms,
      status: saveStatus,
      scheduled_at: saveStatus === 'scheduled' && scheduledAt ? new Date(scheduledAt).toISOString() : null,
    }
    if (editId) {
      const { error } = await supabase.from('posts').update(payload).eq('id', editId)
      if (error) { showToast('Failed to update post', 'error'); setSaving(false); return }
      showToast('Post updated!', 'success')
    } else {
      const { error } = await supabase.from('posts').insert({ ...payload, user_id: user.id })
      if (error) { showToast('Failed to save post', 'error'); setSaving(false); return }
      showToast(saveStatus === 'draft' ? 'Draft saved!' : 'Post scheduled!', 'success')
      setContent('')
      setScheduledAt('')
      setSelectedPlatforms(['instagram'])
      setStatus('draft')
    }
    setSaving(false)
  }

  const minLimit = Math.min(...selectedPlatforms.map(p => PLATFORMS.find(pl => pl.id === p)?.limit || 9999))
  const charPercent = Math.min((content.length / minLimit) * 100, 100)
  const isOver = content.length > minLimit

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="ml-56 flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight">{editId ? 'Edit Post' : 'Compose'}</h1>
            <p className="text-sm text-gray-400 mt-0.5">Write once, post everywhere</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p.id} onClick={() => togglePlatform(p.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        selectedPlatforms.includes(p.id) ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'
                      }`}>
                      <span>{p.icon}</span>{p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-1 px-4 py-3 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-400 mr-2">Insert:</span>
                  {[
                    { id: 'templates', icon: '📝', label: 'Template' },
                    { id: 'hashtags', icon: '#️⃣', label: 'Hashtags' },
                    { id: 'media', icon: '🖼️', label: 'Media' },
                  ].map(tool => (
                    <button key={tool.id} onClick={() => openPanel(tool.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activePanel === tool.id ? 'bg-black text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}>
                      <span>{tool.icon}</span>{tool.label}
                    </button>
                  ))}
                </div>

                {activePanel && (
                  <div className="border-b border-gray-100 bg-gray-50 max-h-56 overflow-y-auto">
                    {panelLoading ? (
                      <div className="p-4 text-center text-xs text-gray-400">Loading...</div>
                    ) : activePanel === 'templates' ? (
                      <div className="p-3 space-y-2">
                        <input type="text" placeholder="Search templates..." value={templateSearch}
                          onChange={e => setTemplateSearch(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none mb-2" />
                        {templates.filter(t => t.name.toLowerCase().includes(templateSearch.toLowerCase())).length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-4">No templates yet — <Link href="/templates" className="underline">create one</Link></p>
                        ) : templates.filter(t => t.name.toLowerCase().includes(templateSearch.toLowerCase())).map(t => (
                          <button key={t.id}
                            onClick={() => { setContent(t.content); setActivePanel(null); showToast(`Template "${t.name}" loaded`, 'success') }}
                            className="w-full text-left p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-300 transition-all">
                            <p className="text-xs font-semibold">{t.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{t.content}</p>
                          </button>
                        ))}
                      </div>
                    ) : activePanel === 'hashtags' ? (
                      <div className="p-3 space-y-2">
                        <input type="text" placeholder="Search collections..." value={hashtagSearch}
                          onChange={e => setHashtagSearch(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none mb-2" />
                        {hashtags.filter(h => h.name.toLowerCase().includes(hashtagSearch.toLowerCase())).length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-4">No collections yet — <Link href="/hashtags" className="underline">create one</Link></p>
                        ) : hashtags.filter(h => h.name.toLowerCase().includes(hashtagSearch.toLowerCase())).map(h => (
                          <button key={h.id}
                            onClick={() => { insertAtCursor('\n' + h.hashtags.join(' ')); setActivePanel(null); showToast(`"${h.name}" hashtags inserted`, 'success') }}
                            className="w-full text-left p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-300 transition-all">
                            <p className="text-xs font-semibold">{h.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{h.hashtags.slice(0, 8).join(' ')}</p>
                          </button>
                        ))}
                      </div>
                    ) : activePanel === 'media' ? (
                      <div className="p-3">
                        <input type="text" placeholder="Search media..." value={mediaSearch}
                          onChange={e => setMediaSearch(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none mb-2" />
                        {mediaFiles.filter(f => f.name.toLowerCase().includes(mediaSearch.toLowerCase())).length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-4">No media yet — <Link href="/media" className="underline">upload some</Link></p>
                        ) : (
                          <div className="grid grid-cols-4 gap-2">
                            {mediaFiles.filter(f => f.name.toLowerCase().includes(mediaSearch.toLowerCase())).map(f => (
                              <button key={f.id}
                                onClick={() => { insertAtCursor(`\n${f.url}`); setActivePanel(null); showToast('Media URL inserted', 'success') }}
                                className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 transition-all">
                                <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                <textarea ref={textareaRef}
                  placeholder="Write your caption here... Use the toolbar above to insert templates, hashtags, or media."
                  value={content} onChange={e => setContent(e.target.value)}
                  rows={10} className="w-full px-5 py-4 text-sm focus:outline-none resize-none" />

                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="w-full bg-gray-100 rounded-full h-1">
                      <div className={`h-1 rounded-full transition-all ${isOver ? 'bg-red-500' : charPercent > 80 ? 'bg-orange-400' : 'bg-black'}`}
                        style={{ width: `${charPercent}%` }} />
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${isOver ? 'text-red-500' : 'text-gray-400'}`}>
                    {content.length}{selectedPlatforms.length > 0 ? `/${minLimit}` : ''}
                  </span>
                </div>
              </div>

              {selectedPlatforms.length > 1 && content.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Character Limits</p>
                  <div className="space-y-2">
                    {selectedPlatforms.map(pid => {
                      const p = PLATFORMS.find(pl => pl.id === pid)
                      if (!p) return null
                      const over = content.length > p.limit
                      const pct = Math.min((content.length / p.limit) * 100, 100)
                      return (
                        <div key={pid} className="flex items-center gap-3">
                          <span className="text-sm w-5 text-center">{p.icon}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full transition-all ${over ? 'bg-red-500' : pct > 80 ? 'bg-orange-400' : 'bg-black'}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`text-xs font-semibold w-16 text-right ${over ? 'text-red-500' : 'text-gray-400'}`}>
                            {content.length}/{p.limit}
                          </span>
                          {over && <span className="text-xs text-red-500 font-semibold">Over!</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Schedule</p>
                <input type="datetime-local" value={scheduledAt}
                  onChange={e => { setScheduledAt(e.target.value); if (e.target.value) setStatus('scheduled') }}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400" />
                {scheduledAt && (
                  <button onClick={() => { setScheduledAt(''); setStatus('draft') }} className="text-xs text-gray-400 hover:text-black mt-2 transition-colors">
                    × Clear schedule
                  </button>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Publish</p>
                <button onClick={() => handleSave('scheduled')} disabled={saving || !scheduledAt}
                  className="w-full py-3 bg-black text-white text-sm font-semibold rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                  {saving ? 'Saving...' : '📅 Schedule Post'}
                </button>
                <button onClick={() => handleSave('draft')} disabled={saving}
                  className="w-full py-3 border border-gray-200 text-sm font-semibold rounded-xl hover:border-gray-400 transition-all disabled:opacity-40">
                  📂 Save as Draft
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">💡 Tips</p>
                <div className="space-y-2 text-xs text-gray-400">
                  <p>📝 Use <Link href="/templates" className="text-black font-semibold underline">Templates</Link> to save time on repeated post formats</p>
                  <p>#️⃣ Add <Link href="/hashtags" className="text-black font-semibold underline">Hashtag Collections</Link> with one click</p>
                  <p>🖼️ Pick images from your <Link href="/media" className="text-black font-semibold underline">Media Library</Link></p>
                  <p>📆 Use <Link href="/bulk-scheduler" className="text-black font-semibold underline">Bulk Scheduler</Link> to write many posts at once</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}

export default function Compose() {
  return (
    <Suspense>
      <ComposeInner />
    </Suspense>
  )
}