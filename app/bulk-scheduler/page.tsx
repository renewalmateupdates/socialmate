'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram',   icon: '📸' },
  { id: 'linkedin',  label: 'LinkedIn',    icon: '💼' },
  { id: 'youtube',   label: 'YouTube',     icon: '▶️' },
  { id: 'pinterest', label: 'Pinterest',   icon: '📌' },
  { id: 'bluesky',   label: 'Bluesky',     icon: '🦋' },
  { id: 'reddit',    label: 'Reddit',      icon: '🤖' },
  { id: 'discord',   label: 'Discord',     icon: '💬' },
  { id: 'telegram',  label: 'Telegram',    icon: '✈️' },
  { id: 'mastodon',  label: 'Mastodon',    icon: '🐘' },
  { id: 'twitter',   label: 'X / Twitter', icon: '🐦' },
  { id: 'tiktok',    label: 'TikTok',      icon: '🎵' },
  { id: 'facebook',  label: 'Facebook',    icon: '📘' },
  { id: 'threads',   label: 'Threads',     icon: '🧵' },
]

const TIMES = [
  '06:00','07:00','08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00','19:00',
  '20:00','21:00','22:00',
]

interface BulkPost {
  id: string
  content: string
  platforms: string[]
  date: string
  time: string
  status: 'ready' | 'error' | 'saved'
  error?: string
}

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

function getNextDate(offset: number) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

export default function BulkScheduler() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<BulkPost[]>([
    { id: makeId(), content: '', platforms: ['instagram'], date: getNextDate(1), time: '09:00', status: 'ready' },
    { id: makeId(), content: '', platforms: ['instagram'], date: getNextDate(2), time: '09:00', status: 'ready' },
    { id: makeId(), content: '', platforms: ['instagram'], date: getNextDate(3), time: '09:00', status: 'ready' },
  ])
  const [defaultPlatforms, setDefaultPlatforms] = useState<string[]>(['instagram'])
  const [defaultTime, setDefaultTime] = useState('09:00')
  const [saving, setSaving] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
    }
    init()
  }, [])

  const addRow = () => {
    const lastPost = posts[posts.length - 1]
    const lastDate = lastPost?.date || getNextDate(1)
    const d = new Date(lastDate)
    d.setDate(d.getDate() + 1)
    const nextDate = d.toISOString().split('T')[0]
    setPosts(prev => [...prev, {
      id: makeId(),
      content: '',
      platforms: [...defaultPlatforms],
      date: nextDate,
      time: defaultTime,
      status: 'ready',
    }])
  }

  const removeRow = (id: string) => {
    if (posts.length <= 1) return
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const updatePost = (id: string, field: keyof BulkPost, value: any) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, [field]: value, status: 'ready', error: undefined } : p))
  }

  const togglePostPlatform = (postId: string, platformId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const platforms = p.platforms.includes(platformId)
        ? p.platforms.filter(pl => pl !== platformId)
        : [...p.platforms, platformId]
      return { ...p, platforms, status: 'ready' }
    }))
  }

  const applyDefaultsToAll = () => {
    setPosts(prev => prev.map(p => ({
      ...p,
      platforms: [...defaultPlatforms],
      time: defaultTime,
    })))
    showToast('Defaults applied to all rows', 'success')
  }

  const autoFillDates = () => {
    setPosts(prev => prev.map((p, i) => ({
      ...p,
      date: getNextDate(i + 1),
    })))
    showToast('Dates auto-filled starting tomorrow', 'success')
  }

  const handleSaveAll = async () => {
    const valid = posts.filter(p => p.content.trim() && p.platforms.length > 0 && p.date)
    if (valid.length === 0) {
      showToast('Add content to at least one post', 'error')
      return
    }
    setSaving(true)
    let saved = 0
    const updatedPosts = [...posts]

    for (const post of valid) {
      const scheduledAt = new Date(`${post.date}T${post.time}:00`).toISOString()
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: post.content.trim(),
        platforms: post.platforms,
        status: 'scheduled',
        scheduled_at: scheduledAt,
      })
      const idx = updatedPosts.findIndex(p => p.id === post.id)
      if (error) {
        updatedPosts[idx] = { ...updatedPosts[idx], status: 'error', error: error.message }
      } else {
        updatedPosts[idx] = { ...updatedPosts[idx], status: 'saved' }
        saved++
      }
    }

    setPosts(updatedPosts)
    setSavedCount(saved)
    setSaving(false)
    if (saved > 0) {
      showToast(`${saved} post${saved !== 1 ? 's' : ''} scheduled successfully!`, 'success')
    }
  }

  const clearSaved = () => {
    setPosts(prev => prev.filter(p => p.status !== 'saved'))
    if (posts.every(p => p.status === 'saved')) {
      setPosts([{
        id: makeId(), content: '', platforms: [...defaultPlatforms],
        date: getNextDate(1), time: defaultTime, status: 'ready'
      }])
    }
  }

  const readyCount = posts.filter(p => p.content.trim() && p.status === 'ready').length
  const savedPosts = posts.filter(p => p.status === 'saved').length
  const errorPosts = posts.filter(p => p.status === 'error').length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-5xl mx-auto">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Bulk Scheduler</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Write and schedule multiple posts at once
              </p>
            </div>
            <div className="flex items-center gap-2">
              {savedPosts > 0 && (
                <button onClick={clearSaved}
                  className="text-xs font-bold px-4 py-2.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                  Clear saved ({savedPosts})
                </button>
              )}
              <Link href="/calendar"
                className="text-xs font-bold px-4 py-2.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                📅 View Calendar
              </Link>
            </div>
          </div>

          {/* DEFAULTS BAR */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Defaults:</p>

              {/* DEFAULT PLATFORMS */}
              <div className="flex items-center gap-1 flex-wrap">
                {PLATFORMS.slice(0, 8).map(p => (
                  <button key={p.id} onClick={() => {
                    setDefaultPlatforms(prev =>
                      prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]
                    )
                  }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      defaultPlatforms.includes(p.id)
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 text-gray-500 hover:border-gray-400'
                    }`}>
                    <span>{p.icon}</span>
                    <span className="hidden sm:inline capitalize">
                      {p.id === 'twitter' ? 'X' : p.label.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>

              {/* DEFAULT TIME */}
              <select value={defaultTime} onChange={e => setDefaultTime(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white font-semibold">
                {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <div className="flex items-center gap-2 ml-auto">
                <button onClick={autoFillDates}
                  className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                  🗓 Auto-fill Dates
                </button>
                <button onClick={applyDefaultsToAll}
                  className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                  Apply to All
                </button>
              </div>
            </div>
          </div>

          {/* STATUS BAR */}
          {(savedPosts > 0 || errorPosts > 0) && (
            <div className={`rounded-2xl px-5 py-3 mb-4 flex items-center gap-4 text-xs font-semibold ${
              errorPosts > 0 ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'
            }`}>
              {savedPosts > 0 && (
                <span className="text-green-700">✅ {savedPosts} post{savedPosts !== 1 ? 's' : ''} scheduled</span>
              )}
              {errorPosts > 0 && (
                <span className="text-red-600">❌ {errorPosts} failed — check content and try again</span>
              )}
            </div>
          )}

          {/* POSTS TABLE */}
          <div className="space-y-3 mb-4">
            {posts.map((post, index) => (
              <div key={post.id}
                className={`bg-white border-2 rounded-2xl p-4 transition-all ${
                  post.status === 'saved'  ? 'border-green-200 opacity-70' :
                  post.status === 'error'  ? 'border-red-200' :
                  'border-gray-100 hover:border-gray-300'
                }`}>

                {/* ROW HEADER */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold text-gray-400 w-6 text-center">
                    {post.status === 'saved'  ? '✅' :
                     post.status === 'error'  ? '❌' :
                     `${index + 1}`}
                  </span>

                  {/* DATE */}
                  <input type="date" value={post.date}
                    onChange={e => updatePost(post.id, 'date', e.target.value)}
                    className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 font-semibold" />

                  {/* TIME */}
                  <select value={post.time}
                    onChange={e => updatePost(post.id, 'time', e.target.value)}
                    className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white font-semibold">
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  {/* PLATFORMS */}
                  <div className="flex items-center gap-1 flex-wrap flex-1">
                    {PLATFORMS.slice(0, 9).map(p => (
                      <button key={p.id}
                        onClick={() => togglePostPlatform(post.id, p.id)}
                        className={`text-base transition-all ${
                          post.platforms.includes(p.id) ? 'opacity-100' : 'opacity-20 hover:opacity-60'
                        }`}
                        title={p.label}>
                        {p.icon}
                      </button>
                    ))}
                  </div>

                  {/* REMOVE */}
                  <button onClick={() => removeRow(post.id)}
                    disabled={posts.length <= 1}
                    className="text-xs text-gray-300 hover:text-red-400 transition-all disabled:opacity-20 flex-shrink-0">
                    ✕
                  </button>
                </div>

                {/* CONTENT */}
                <textarea
                  value={post.content}
                  onChange={e => updatePost(post.id, 'content', e.target.value)}
                  placeholder={`Post ${index + 1} content... Tip: use [brackets] for fill-in sections`}
                  rows={3}
                  disabled={post.status === 'saved'}
                  className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-xl focus:outline-none focus:border-gray-300 resize-none bg-gray-50 disabled:opacity-60"
                />

                {post.status === 'error' && post.error && (
                  <p className="text-xs text-red-500 mt-1.5 font-semibold">⚠️ {post.error}</p>
                )}

                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-gray-400">
                    {post.platforms.length} platform{post.platforms.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-400">{post.content.length} chars</p>
                </div>
              </div>
            ))}
          </div>

          {/* ADD ROW + SAVE */}
          <div className="flex items-center justify-between">
            <button onClick={addRow}
              className="flex items-center gap-2 text-xs font-bold px-5 py-3 border-2 border-dashed border-gray-300 rounded-2xl hover:border-gray-500 transition-all text-gray-500 hover:text-black">
              + Add another post
            </button>

            <div className="flex items-center gap-3">
              <p className="text-xs text-gray-400">
                {readyCount} post{readyCount !== 1 ? 's' : ''} ready to schedule
              </p>
              <button onClick={handleSaveAll}
                disabled={saving || readyCount === 0}
                className="bg-black text-white text-sm font-bold px-8 py-3 rounded-2xl hover:opacity-80 transition-all disabled:opacity-40">
                {saving ? 'Scheduling...' : `Schedule ${readyCount > 0 ? readyCount : ''} Post${readyCount !== 1 ? 's' : ''} →`}
              </button>
            </div>
          </div>

          {/* TIPS */}
          <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">💡 Bulk Scheduler Tips</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: '🗓', tip: 'Click "Auto-fill Dates" to spread posts across the next N days automatically.' },
                { icon: '⚡', tip: 'Set defaults at the top, then click "Apply to All" to update every row at once.' },
                { icon: '[x]', tip: 'Use [brackets] in your content as fill-in-the-blank placeholders to fill in later.' },
                { icon: '📅', tip: 'After scheduling, view all posts in the Content Calendar to see your full plan.' },
              ].map(item => (
                <div key={item.tip} className="flex items-start gap-2">
                  <span className="text-sm flex-shrink-0 font-bold text-gray-500">{item.icon}</span>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>

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