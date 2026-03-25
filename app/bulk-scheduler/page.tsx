'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useWorkspace, PLAN_CONFIG } from '@/contexts/WorkspaceContext'

const LIVE_PLATFORMS = [
  { id: 'discord',   label: 'Discord',   icon: '💬' },
  { id: 'bluesky',   label: 'Bluesky',   icon: '🦋' },
  { id: 'telegram',  label: 'Telegram',  icon: '✈️' },
  { id: 'mastodon',  label: 'Mastodon',  icon: '🐘' },
]

const COMING_SOON_PLATFORMS = [
  { id: 'linkedin',  label: 'LinkedIn',   icon: '💼' },
  { id: 'youtube',   label: 'YouTube',    icon: '▶️' },
  { id: 'pinterest', label: 'Pinterest',  icon: '📌' },
  { id: 'reddit',    label: 'Reddit',     icon: '🤖' },
  { id: 'instagram', label: 'Instagram',  icon: '📸' },
  { id: 'tiktok',    label: 'TikTok',     icon: '🎵' },
  { id: 'facebook',  label: 'Facebook',   icon: '📘' },
  { id: 'threads',   label: 'Threads',    icon: '🧵' },
  { id: 'twitter',   label: 'X/Twitter',  icon: '🐦' },
]

const HOURS = [
  '06','07','08','09','10','11','12',
  '13','14','15','16','17','18','19',
  '20','21','22',
]
const MINUTES = ['00','15','30','45']

const PLAN_MAX_ROWS: Record<string, number> = {
  free:   10,
  pro:    50,
  agency: 100,
}

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

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

export default function BulkScheduler() {
  const [user, setUser] = useState<any>(null)
  const { plan, activeWorkspace } = useWorkspace()
  const planConfig = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
  const maxRows = PLAN_MAX_ROWS[plan] ?? 10

  const maxScheduleDate = (() => {
    const d = new Date()
    d.setDate(d.getDate() + (planConfig.scheduleWeeks * 7))
    return d.toISOString().split('T')[0]
  })()

  const scheduleHorizonLabel =
    plan === 'free'   ? '2 weeks' :
    plan === 'pro'    ? '1 month' :
    '3 months'

  const [posts, setPosts] = useState<BulkPost[]>([
    { id: makeId(), content: '', platforms: ['discord'], date: getNextDate(1), time: '09:00', status: 'ready' },
    { id: makeId(), content: '', platforms: ['discord'], date: getNextDate(2), time: '09:00', status: 'ready' },
    { id: makeId(), content: '', platforms: ['discord'], date: getNextDate(3), time: '09:00', status: 'ready' },
  ])
  // Track per-row minute selection separately since BulkPost.time is HH:MM string
  const getHour   = (t: string) => t.split(':')[0] ?? '09'
  const getMinute = (t: string) => t.split(':')[1] ?? '00'
  const [defaultPlatforms, setDefaultPlatforms] = useState<string[]>(['discord'])
  const [defaultHour, setDefaultHour]     = useState('09')
  const [defaultMinute, setDefaultMinute] = useState('00')
  const defaultTime = `${defaultHour}:${defaultMinute}`
  const [saving, setSaving] = useState(false)
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
  }, [router])

  const addRow = () => {
    if (posts.length >= maxRows) {
      showToast(`Your ${plan} plan supports up to ${maxRows} posts per session. Upgrade for more.`, 'error')
      return
    }
    const lastPost = posts[posts.length - 1]
    const lastDate = lastPost?.date || getNextDate(1)
    const d = new Date(lastDate)
    d.setDate(d.getDate() + 1)
    const nextDate = d.toISOString().split('T')[0]
    const clampedDate = nextDate > maxScheduleDate ? maxScheduleDate : nextDate
    setPosts(prev => [...prev, {
      id: makeId(),
      content: '',
      platforms: [...defaultPlatforms],
      date: clampedDate,
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

  const handleDateChange = (postId: string, val: string) => {
    if (val > maxScheduleDate) {
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, status: 'error', error: `${plan} plan can only schedule up to ${scheduleHorizonLabel} ahead` }
        : p
      ))
      return
    }
    updatePost(postId, 'date', val)
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
    setPosts(prev => prev.map(p => ({ ...p, platforms: [...defaultPlatforms], time: defaultTime })))
    showToast('Defaults applied to all rows', 'success')
  }

  const autoFillDates = () => {
    setPosts(prev => prev.map((p, i) => {
      const date = getNextDate(i + 1)
      const clampedDate = date > maxScheduleDate ? maxScheduleDate : date
      return { ...p, date: clampedDate, status: 'ready', error: undefined }
    }))
    showToast('Dates auto-filled starting tomorrow', 'success')
  }

  const handleSaveAll = async () => {
    const today = getTodayDate()

    const pastDate = posts.some(p => p.content.trim() && p.date && p.date < today)
    if (pastDate) {
      showToast('Some posts have past dates — please update them before scheduling', 'error')
      setPosts(prev => prev.map(p => ({
        ...p,
        status: p.content.trim() && p.date < today ? 'error' : p.status,
        error:  p.content.trim() && p.date < today ? 'Date is in the past' : p.error,
      })))
      return
    }

    const horizonViolation = posts.some(p => p.content.trim() && p.date > maxScheduleDate)
    if (horizonViolation) {
      showToast(`Some posts exceed your ${scheduleHorizonLabel} scheduling limit`, 'error')
      setPosts(prev => prev.map(p => ({
        ...p,
        status: p.content.trim() && p.date > maxScheduleDate ? 'error' : p.status,
        error:  p.content.trim() && p.date > maxScheduleDate ? `Exceeds ${scheduleHorizonLabel} limit` : p.error,
      })))
      return
    }

    const valid = posts.filter(p => p.content.trim() && p.platforms.length > 0 && p.date)
    if (valid.length === 0) { showToast('Add content to at least one post', 'error'); return }

    setSaving(true)
    let saved = 0
    const updatedPosts = [...posts]

    for (const post of valid) {
      const scheduledAt = new Date(`${post.date}T${post.time}:00`).toISOString()
      // Use API route so workspace_id is set and Inngest event fires for auto-publish
      const res = await fetch('/api/posts/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          content:     post.content.trim(),
          platforms:   post.platforms,
          scheduledAt,
          workspaceId: activeWorkspace?.is_personal ? null : (activeWorkspace?.id ?? null),
        }),
      })
      const idx = updatedPosts.findIndex(p => p.id === post.id)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        updatedPosts[idx] = { ...updatedPosts[idx], status: 'error', error: err.error || 'Failed to save' }
      } else {
        updatedPosts[idx] = { ...updatedPosts[idx], status: 'saved' }
        saved++
      }
    }

    setPosts(updatedPosts)
    setSaving(false)
    if (saved > 0) showToast(`${saved} post${saved !== 1 ? 's' : ''} scheduled!`, 'success')
  }

  const clearSaved = () => {
    setPosts(prev => {
      const remaining = prev.filter(p => p.status !== 'saved')
      return remaining.length === 0
        ? [{ id: makeId(), content: '', platforms: [...defaultPlatforms], date: getNextDate(1), time: defaultTime, status: 'ready' }]
        : remaining
    })
  }

  const today         = getTodayDate()
  const readyCount    = posts.filter(p => p.content.trim() && p.status === 'ready').length
  const savedPosts    = posts.filter(p => p.status === 'saved').length
  const errorPosts    = posts.filter(p => p.status === 'error').length
  const atRowLimit    = posts.length >= maxRows

  return (
    <div className="min-h-screen bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Bulk Scheduler
                {activeWorkspace && !activeWorkspace.is_personal && (
                  <span className="ml-2 text-sm font-semibold text-purple-500">— {activeWorkspace.client_name || activeWorkspace.name}</span>
                )}
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Write and schedule multiple posts at once</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {savedPosts > 0 && (
                <button onClick={clearSaved}
                  className="text-xs font-bold px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                  Clear saved ({savedPosts})
                </button>
              )}
              <Link href="/calendar"
                className="text-xs font-bold px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all">
                📅 Calendar
              </Link>
            </div>
          </div>

          {/* PLAN LIMITS */}
          <div className={`mb-4 rounded-2xl px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border ${
            plan === 'free'   ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700' :
            plan === 'pro'    ? 'bg-blue-50 border-blue-100' :
            'bg-purple-50 border-purple-100'
          }`}>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {plan === 'free'   && '🔓 Free · Up to 10 posts per session · 2-week horizon'}
              {plan === 'pro'    && '⚡ Pro · Up to 50 posts per session · 1-month horizon'}
              {plan === 'agency' && '🏢 Agency · Up to 100 posts per session · 3-month horizon'}
              <span className="ml-2 font-bold text-gray-700 dark:text-gray-300">{posts.length}/{maxRows} rows</span>
            </p>
            {plan !== 'agency' && (
              <Link href="/settings?tab=Plan" className="text-xs font-bold text-black underline hover:opacity-70 self-start sm:self-auto">
                Upgrade →
              </Link>
            )}
          </div>

          {/* DEFAULTS BAR */}
          <div className="bg-surface border border-theme rounded-2xl p-4 mb-4">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Default Settings</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-1.5 flex-wrap flex-1">
                {LIVE_PLATFORMS.map(p => (
                  <button key={p.id}
                    onClick={() => setDefaultPlatforms(prev =>
                      prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]
                    )}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      defaultPlatforms.includes(p.id)
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400'
                    }`}>
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                ))}
                {COMING_SOON_PLATFORMS.slice(0, 4).map(p => (
                  <div key={p.id}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-dashed border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    title={`${p.label} — coming soon`}>
                    <span>{p.icon}</span>
                    <span className="hidden sm:inline">{p.label}</span>
                    <span className="text-xs text-gray-200 dark:text-gray-700 ml-0.5">Soon</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <div className="flex items-center gap-1">
                  <select value={defaultHour} onChange={e => setDefaultHour(e.target.value)}
                    className="px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-100 font-semibold">
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500">:</span>
                  <select value={defaultMinute} onChange={e => setDefaultMinute(e.target.value)}
                    className="px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-100 font-semibold">
                    {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <button onClick={autoFillDates}
                  className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-400 transition-all whitespace-nowrap">
                  🗓 Auto-fill Dates
                </button>
                <button onClick={applyDefaultsToAll}
                  className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all whitespace-nowrap">
                  Apply to All
                </button>
              </div>
            </div>
          </div>

          {/* STATUS BAR */}
          {(savedPosts > 0 || errorPosts > 0) && (
            <div className={`rounded-2xl px-5 py-3 mb-4 flex flex-wrap items-center gap-4 text-xs font-semibold ${
              errorPosts > 0 ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'
            }`}>
              {savedPosts > 0 && <span className="text-green-700">✅ {savedPosts} post{savedPosts !== 1 ? 's' : ''} scheduled</span>}
              {errorPosts > 0 && <span className="text-red-600">❌ {errorPosts} failed — check content and try again</span>}
            </div>
          )}

          {/* POST ROWS */}
          <div className="space-y-3 mb-4">
            {posts.map((post, index) => (
              <div key={post.id}
                className={`bg-surface border-2 rounded-2xl p-4 transition-all ${
                  post.status === 'saved'  ? 'border-green-200 opacity-70' :
                  post.status === 'error'  ? 'border-red-200' :
                  'border-theme hover:border-gray-300'
                }`}>

                {/* ROW CONTROLS */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-5 text-center flex-shrink-0">
                      {post.status === 'saved' ? '✅' : post.status === 'error' ? '❌' : index + 1}
                    </span>
                    <input type="date" value={post.date}
                      min={today} max={maxScheduleDate}
                      onChange={e => handleDateChange(post.id, e.target.value)}
                      className={`px-2.5 py-1.5 text-xs border rounded-xl focus:outline-none font-semibold ${
                        post.date < today || post.date > maxScheduleDate
                          ? 'border-red-300 text-red-500'
                          : 'border-gray-200 dark:border-gray-600 focus:border-gray-400'
                      }`} />
                    <div className="flex items-center gap-0.5">
                      <select value={getHour(post.time)}
                        onChange={e => updatePost(post.id, 'time', `${e.target.value}:${getMinute(post.time)}`)}
                        className="px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-100 font-semibold">
                        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500">:</span>
                      <select value={getMinute(post.time)}
                        onChange={e => updatePost(post.id, 'time', `${getHour(post.time)}:${e.target.value}`)}
                        className="px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-100 font-semibold">
                        {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <button onClick={() => removeRow(post.id)}
                      disabled={posts.length <= 1}
                      className="text-xs text-gray-300 hover:text-red-400 transition-all disabled:opacity-20 flex-shrink-0 ml-auto sm:ml-0">
                      ✕
                    </button>
                  </div>

                  {/* PLATFORM TOGGLES */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {LIVE_PLATFORMS.map(p => (
                      <button key={p.id}
                        onClick={() => togglePostPlatform(post.id, p.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          post.platforms.includes(p.id)
                            ? 'bg-black text-white border-black'
                            : 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-gray-400'
                        }`}
                        title={p.label}>
                        <span>{p.icon}</span>
                        <span className="hidden md:inline">{p.label}</span>
                      </button>
                    ))}
                    {COMING_SOON_PLATFORMS.slice(0, 4).map(p => (
                      <span key={p.id}
                        className="text-base opacity-20 cursor-not-allowed"
                        title={`${p.label} — coming soon`}>
                        {p.icon}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CONTENT */}
                <textarea
                  value={post.content}
                  onChange={e => updatePost(post.id, 'content', e.target.value)}
                  placeholder={`Post ${index + 1} content... Use [brackets] for fill-in sections`}
                  rows={3}
                  disabled={post.status === 'saved'}
                  className="w-full px-3 py-2.5 text-sm border border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:border-gray-300 resize-none bg-gray-50 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-60"
                />
                {post.status === 'error' && post.error && (
                  <p className="text-xs text-red-500 mt-1.5 font-semibold">⚠️ {post.error}</p>
                )}
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {post.platforms.length} platform{post.platforms.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{post.content.length} chars</p>
                </div>
              </div>
            ))}
          </div>

          {/* ADD + SAVE */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={addRow} disabled={atRowLimit}
                className="flex items-center gap-2 text-xs font-bold px-5 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-gray-500 transition-all text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
                + Add another post
              </button>
              {atRowLimit && plan !== 'agency' && (
                <Link href="/settings?tab=Plan" className="text-xs font-bold underline text-gray-400 dark:text-gray-500">
                  Upgrade for more rows →
                </Link>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-xs text-gray-400 dark:text-gray-500">{readyCount} post{readyCount !== 1 ? 's' : ''} ready</p>
              <button onClick={handleSaveAll}
                disabled={saving || readyCount === 0}
                className="bg-black text-white text-sm font-bold px-8 py-3 rounded-2xl hover:opacity-80 transition-all disabled:opacity-40">
                {saving ? 'Scheduling...' : `Schedule ${readyCount > 0 ? readyCount : ''} Post${readyCount !== 1 ? 's' : ''} →`}
              </button>
            </div>
          </div>

          {/* TIPS */}
          <div className="mt-8 bg-surface border border-theme rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">💡 Tips</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🗓', tip: 'Click "Auto-fill Dates" to spread posts across the next N days automatically.' },
                { icon: '⚡', tip: 'Set defaults at the top then click "Apply to All" to update every row at once.' },
                { icon: '[ ]', tip: 'Use [brackets] in content as fill-in-the-blank placeholders for easy editing.' },
                { icon: '📅', tip: 'After scheduling, view your full plan in the Content Calendar.' },
              ].map(item => (
                <div key={item.tip} className="flex items-start gap-2">
                  <span className="text-sm flex-shrink-0 font-bold text-gray-500 dark:text-gray-400">{item.icon}</span>
                  <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">{item.tip}</p>
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