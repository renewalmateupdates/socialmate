'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

type BulkPost = {
  id: string
  content: string
  platforms: string[]
  scheduledAt: string
  status: 'idle' | 'saving' | 'saved' | 'error'
}

const PLATFORMS = [
  { id: 'instagram', icon: '📸', label: 'Instagram', limit: 2200 },
  { id: 'twitter', icon: '🐦', label: 'X / Twitter', limit: 280 },
  { id: 'linkedin', icon: '💼', label: 'LinkedIn', limit: 3000 },
  { id: 'tiktok', icon: '🎵', label: 'TikTok', limit: 2200 },
  { id: 'facebook', icon: '📘', label: 'Facebook', limit: 63206 },
  { id: 'threads', icon: '🧵', label: 'Threads', limit: 500 },
  { id: 'bluesky', icon: '🦋', label: 'Bluesky', limit: 300 },
  { id: 'pinterest', icon: '📌', label: 'Pinterest', limit: 500 },
]

function generateId() { return Math.random().toString(36).slice(2) }

function getNextSlot(baseDate: string, index: number): string {
  if (!baseDate) {
    const d = new Date()
    d.setDate(d.getDate() + index + 1)
    d.setHours(9, 0, 0, 0)
    return d.toISOString().slice(0, 16)
  }
  const d = new Date(baseDate)
  d.setDate(d.getDate() + index)
  return d.toISOString().slice(0, 16)
}

export default function BulkScheduler() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<BulkPost[]>([])
  const [globalPlatforms, setGlobalPlatforms] = useState<string[]>(['instagram'])
  const [startDate, setStartDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      setPosts(Array.from({ length: 5 }, (_, i) => ({
        id: generateId(), content: '', platforms: ['instagram'], scheduledAt: getNextSlot('', i), status: 'idle',
      })))
    }
    getData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const addPost = () => {
    const lastPost = posts[posts.length - 1]
    const lastDate = lastPost?.scheduledAt || ''
    const nextDate = lastDate ? (() => { const d = new Date(lastDate); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 16) })() : getNextSlot('', posts.length)
    setPosts(prev => [...prev, { id: generateId(), content: '', platforms: [...globalPlatforms], scheduledAt: nextDate, status: 'idle' }])
  }

  const removePost = (id: string) => setPosts(prev => prev.filter(p => p.id !== id))

  const updatePost = (id: string, field: keyof BulkPost, value: any) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const togglePostPlatform = (postId: string, platformId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const platforms = p.platforms.includes(platformId) ? p.platforms.filter(pl => pl !== platformId) : [...p.platforms, platformId]
      return { ...p, platforms }
    }))
  }

  const applyGlobalPlatforms = () => {
    setPosts(prev => prev.map(p => ({ ...p, platforms: [...globalPlatforms] })))
    showToast('Platforms applied to all posts', 'success')
  }

  const applyStartDate = () => {
    if (!startDate) { showToast('Pick a start date first', 'error'); return }
    setPosts(prev => prev.map((p, i) => ({ ...p, scheduledAt: getNextSlot(startDate, i) })))
    showToast('Dates auto-filled — 1 post per day', 'success')
  }

  const handleSaveAll = async () => {
    const toSave = posts.filter(p => p.content.trim() && p.scheduledAt)
    if (toSave.length === 0) { showToast('Add content to at least one post', 'error'); return }
    setSaving(true); setSavedCount(0)
    let count = 0
    for (const post of toSave) {
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'saving' } : p))
      const { error } = await supabase.from('posts').insert({
        user_id: user.id, content: post.content.trim(), platforms: post.platforms,
        scheduled_at: new Date(post.scheduledAt).toISOString(), status: 'scheduled',
      })
      if (!error) {
        count++; setSavedCount(count)
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'saved' } : p))
      } else {
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'error' } : p))
      }
    }
    setSaving(false)
    showToast(`${count} post${count !== 1 ? 's' : ''} scheduled!`, 'success')
  }

  const clearSaved = () => setPosts(prev => prev.filter(p => p.status !== 'saved'))
  const toggleGlobalPlatform = (id: string) => setGlobalPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])

  const filledPosts = posts.filter(p => p.content.trim()).length
  const savedPosts = posts.filter(p => p.status === 'saved').length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="ml-56 flex-1 p-8">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Bulk Scheduler</h1>
              <p className="text-sm text-gray-400 mt-0.5">Write and schedule multiple posts at once</p>
            </div>
            <div className="flex items-center gap-2">
              {savedPosts > 0 && (
                <button onClick={clearSaved} className="text-sm font-semibold px-4 py-2.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                  Clear Saved ({savedPosts})
                </button>
              )}
              <button onClick={handleSaveAll} disabled={saving || filledPosts === 0}
                className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                {saving ? `Scheduling ${savedCount}/${filledPosts}...` : `📅 Schedule All (${filledPosts})`}
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Global Settings — Apply to All Posts</p>
            <div className="flex items-end gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p.id} onClick={() => toggleGlobalPlatform(p.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${globalPlatforms.includes(p.id) ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      <span>{p.icon}</span>{p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Start Date</p>
                <div className="flex items-center gap-2">
                  <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-gray-400" />
                  <button onClick={applyStartDate} className="text-xs font-semibold px-3 py-2 border border-gray-200 rounded-xl hover:border-gray-400 transition-all whitespace-nowrap">
                    Auto-fill Dates
                  </button>
                </div>
              </div>
              <button onClick={applyGlobalPlatforms} className="text-xs font-semibold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all self-end">
                Apply Platforms
              </button>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {posts.map((post, index) => {
              const minLimit = Math.min(...post.platforms.map(pid => PLATFORMS.find(p => p.id === pid)?.limit || 9999))
              const isOver = post.content.length > minLimit
              const pct = Math.min((post.content.length / minLimit) * 100, 100)
              return (
                <div key={post.id} className={`bg-white border rounded-2xl overflow-hidden transition-all ${post.status === 'saved' ? 'border-green-200 bg-green-50/30' : post.status === 'error' ? 'border-red-200' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-400 w-6 text-center">{index + 1}</span>
                    <div className="flex-1 flex flex-wrap gap-1.5">
                      {PLATFORMS.map(p => (
                        <button key={p.id} onClick={() => togglePostPlatform(post.id, p.id)}
                          className={`text-xs px-2 py-0.5 rounded-lg font-semibold border transition-all ${post.platforms.includes(p.id) ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-400 hover:border-gray-400'}`}>
                          {p.icon}
                        </button>
                      ))}
                    </div>
                    <input type="datetime-local" value={post.scheduledAt} onChange={e => updatePost(post.id, 'scheduledAt', e.target.value)}
                      className="text-xs border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none focus:border-gray-400" />
                    {post.status === 'saved' && <span className="text-green-500 text-sm">✅</span>}
                    {post.status === 'error' && <span className="text-red-500 text-sm">❌</span>}
                    {post.status === 'saving' && <span className="text-gray-400 text-xs">⏳</span>}
                    <button onClick={() => removePost(post.id)} className="text-gray-300 hover:text-red-400 transition-all text-lg leading-none">×</button>
                  </div>
                  <div className="relative">
                    <textarea placeholder={`Post ${index + 1} — write your caption here...`} value={post.content}
                      onChange={e => updatePost(post.id, 'content', e.target.value)} rows={3}
                      disabled={post.status === 'saved'}
                      className="w-full px-4 py-3 text-sm focus:outline-none resize-none disabled:opacity-60 disabled:cursor-not-allowed" />
                    <div className="absolute bottom-2 right-3 flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1">
                        <div className={`h-1 rounded-full transition-all ${isOver ? 'bg-red-500' : pct > 80 ? 'bg-orange-400' : 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-xs ${isOver ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                        {post.content.length}{post.platforms.length > 0 ? `/${minLimit}` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between">
            <button onClick={addPost} className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 border border-dashed border-gray-300 rounded-xl hover:border-gray-500 transition-all text-gray-500 hover:text-black">
              + Add Another Post
            </button>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>{filledPosts} post{filledPosts !== 1 ? 's' : ''} ready</span>
              <span>·</span>
              <span>{posts.length - filledPosts} empty</span>
              {savedPosts > 0 && <><span>·</span><span className="text-green-600 font-semibold">{savedPosts} scheduled ✅</span></>}
            </div>
          </div>

          <div className="mt-6 bg-gray-50 border border-gray-100 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">💡 Tips</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
              <p>📅 Use "Auto-fill Dates" to space posts one per day from your start date</p>
              <p>📱 Click platform icons on each row to override global platform settings</p>
              <p>✏️ Empty posts are ignored when you hit "Schedule All"</p>
              <p>🔗 After scheduling, view all posts in the <Link href="/queue" className="text-black font-semibold underline">Queue →</Link></p>
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