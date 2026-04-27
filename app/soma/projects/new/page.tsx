'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

const ALL_PLATFORMS = [
  { id: 'bluesky',   label: 'Bluesky',    icon: '🦋' },
  { id: 'twitter',   label: 'Twitter / X', icon: '𝕏' },
  { id: 'mastodon',  label: 'Mastodon',   icon: '🐘' },
  { id: 'discord',   label: 'Discord',    icon: '💬' },
  { id: 'telegram',  label: 'Telegram',   icon: '✈️' },
  { id: 'linkedin',  label: 'LinkedIn',   icon: '💼' },
  { id: 'instagram', label: 'Instagram',  icon: '📸' },
]

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAY_FULL   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const PRESETS = [
  { id: 'all',      label: 'Every day',  days: [0,1,2,3,4,5,6] },
  { id: 'weekdays', label: 'Mon–Fri',    days: [1,2,3,4,5] },
  { id: 'weekends', label: 'Weekends',   days: [0,6] },
  { id: 'custom',   label: 'Custom',     days: [] },
]

interface PlatformSchedule {
  posts_per_day: number
  days: number[]
}

function detectPreset(days: number[]): string {
  const sorted = [...days].sort((a,b) => a-b).join(',')
  if (sorted === '0,1,2,3,4,5,6') return 'all'
  if (sorted === '1,2,3,4,5') return 'weekdays'
  if (sorted === '0,6') return 'weekends'
  return 'custom'
}

function PlatformScheduleRow({
  platform,
  label,
  icon,
  schedule,
  maxPosts,
  onChange,
}: {
  platform: string
  label: string
  icon: string
  schedule: PlatformSchedule
  maxPosts: number
  onChange: (s: PlatformSchedule) => void
}) {
  const preset = detectPreset(schedule.days)
  const [showCustom, setShowCustom] = useState(preset === 'custom')

  const setPreset = (pid: string) => {
    if (pid === 'custom') {
      setShowCustom(true)
      return
    }
    setShowCustom(false)
    const p = PRESETS.find(p => p.id === pid)!
    onChange({ ...schedule, days: p.days })
  }

  const toggleDay = (d: number) => {
    const next = schedule.days.includes(d)
      ? schedule.days.filter(x => x !== d)
      : [...schedule.days, d].sort((a,b) => a-b)
    if (next.length === 0) return // must have at least one day
    onChange({ ...schedule, days: next })
  }

  const counts = Array.from({ length: maxPosts }, (_, i) => i + 1)

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-sm font-bold text-white">{label}</span>
        </div>
        {/* Posts per day */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-500 mr-1">posts/day</span>
          {counts.map(n => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ ...schedule, posts_per_day: n })}
              className={`w-7 h-7 rounded-lg text-xs font-bold border transition-all ${
                schedule.posts_per_day === n
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-400'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Day presets */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
              (p.id !== 'custom' && preset === p.id) || (p.id === 'custom' && showCustom)
                ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom day picker */}
      {showCustom && (
        <div className="flex gap-1.5">
          {DAY_LABELS.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              title={DAY_FULL[i]}
              className={`flex-1 h-8 rounded-lg text-[11px] font-bold border transition-all ${
                schedule.days.includes(i)
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-400'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {/* Summary */}
      <p className="text-[10px] text-gray-500">
        {schedule.posts_per_day} post{schedule.posts_per_day > 1 ? 's' : ''}/day
        {' · '}
        {schedule.days.length === 7
          ? 'every day'
          : schedule.days.map(d => DAY_FULL[d]).join(', ')}
        {' · '}
        ~{schedule.posts_per_day * schedule.days.length} posts/week
      </p>
    </div>
  )
}

export default function NewSomaProjectPage() {
  const router = useRouter()
  const [saving, setSaving]                         = useState(false)
  const [error, setError]                           = useState('')
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[] | null>(null)

  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [platforms, setPlatforms]     = useState<string[]>([])
  const [schedule, setSchedule]       = useState<Record<string, PlatformSchedule>>({})
  const [windowDays, setWindowDays]   = useState(7)
  const [mode, setMode]               = useState<'safe' | 'autopilot' | 'full_send'>('safe')
  const [autoCollect, setAutoCollect] = useState(false)
  const [autoUrl, setAutoUrl]         = useState('')

  const maxPostsPerDay = mode === 'full_send' ? 10 : mode === 'autopilot' ? 5 : 2

  useEffect(() => {
    fetch('/api/accounts/connected')
      .then(r => r.json())
      .then(d => {
        const connected: string[] = d.platforms ?? []
        setConnectedPlatforms(connected)
        setPlatforms(connected)
        const init: Record<string, PlatformSchedule> = {}
        connected.forEach(p => { init[p] = { posts_per_day: 1, days: [1,2,3,4,5] } })
        setSchedule(init)
      })
      .catch(() => setConnectedPlatforms([]))
  }, [])

  // When mode changes, cap existing schedule posts_per_day
  useEffect(() => {
    setSchedule(prev => {
      const next = { ...prev }
      for (const p of Object.keys(next)) {
        if (next[p].posts_per_day > maxPostsPerDay) {
          next[p] = { ...next[p], posts_per_day: maxPostsPerDay }
        }
      }
      return next
    })
    if (mode === 'safe') setWindowDays(7)
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  function togglePlatform(id: string) {
    setPlatforms(prev => {
      const next = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
      // Add default schedule entry if newly added
      if (!prev.includes(id)) {
        setSchedule(s => ({
          ...s,
          [id]: s[id] ?? { posts_per_day: 1, days: [1,2,3,4,5] },
        }))
      }
      return next
    })
  }

  function updatePlatformSchedule(platform: string, s: PlatformSchedule) {
    setSchedule(prev => ({ ...prev, [platform]: s }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Project name is required.'); return }
    if (platforms.length === 0) { setError('Select at least one platform.'); return }

    // Build platform_schedule only for selected platforms
    const platformSchedule: Record<string, PlatformSchedule> = {}
    platforms.forEach(p => {
      platformSchedule[p] = schedule[p] ?? { posts_per_day: 1, days: [1,2,3,4,5] }
    })

    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/soma/projects', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          platforms,
          posts_per_day:        Math.max(...platforms.map(p => platformSchedule[p].posts_per_day)),
          content_window_days:  windowDays,
          mode,
          auto_collect_enabled: autoCollect,
          auto_collect_url:     autoUrl,
          platform_schedule:    platformSchedule,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'project_limit_reached') {
          setError(`You've reached the project limit for your plan. Upgrade to add more.`)
        } else if (data.error === 'autopilot_not_enabled') {
          setError('Autopilot/Full Send requires the SOMA Autopilot add-on. Enable it from the dashboard.')
        } else {
          setError(data.error || 'Something went wrong.')
        }
        return
      }
      router.push(`/soma/projects/${data.project.id}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const availablePlatforms = ALL_PLATFORMS.filter(p =>
    connectedPlatforms === null || connectedPlatforms.includes(p.id)
  )

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 md:ml-56 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">

          <div className="flex items-center gap-3 mb-8">
            <Link href="/soma/dashboard" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              ← SOMA
            </Link>
            <span className="text-gray-700">/</span>
            <h1 className="text-lg font-extrabold text-white">New Project</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name + Description */}
            <div className="rounded-2xl border border-amber-500/20 bg-gray-900 p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400/80 mb-4">Project Info</h2>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Project Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. TechStartup Co., Personal Brand, Client X"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Description <span className="text-gray-600">(optional)</span></label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What is this project for?"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* Platforms */}
            <div className="rounded-2xl border border-amber-500/20 bg-gray-900 p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400/80 mb-4">Platforms</h2>
              <p className="text-xs text-gray-500 mb-4">Select which platforms SOMA should post to.</p>

              {connectedPlatforms === null ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[1,2,3].map(i => <div key={i} className="h-10 rounded-xl bg-gray-800 animate-pulse" />)}
                </div>
              ) : availablePlatforms.length === 0 ? (
                <div className="rounded-xl bg-gray-800/60 border border-gray-700 px-4 py-5 text-center">
                  <p className="text-sm text-gray-400 mb-2">No platforms connected yet.</p>
                  <Link href="/settings?tab=accounts" className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
                    Connect a platform in Settings →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availablePlatforms.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-1.5 ${
                        platforms.includes(p.id)
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <span>{p.icon}</span>{p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mode */}
            <div className="rounded-2xl border border-amber-500/20 bg-gray-900 p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400/80">Posting Mode</h2>
              <div className="grid grid-cols-3 gap-2">
                {(['safe', 'autopilot', 'full_send'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      mode === m
                        ? m === 'safe'
                          ? 'bg-emerald-900/50 border-emerald-500/50 text-emerald-300'
                          : m === 'autopilot'
                          ? 'bg-violet-900/50 border-violet-500/50 text-violet-300'
                          : 'bg-amber-900/50 border-amber-500/50 text-amber-300'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {m === 'safe' ? '🟢 Safe' : m === 'autopilot' ? '⚡ Autopilot' : '🚀 Full Send'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                {mode === 'safe'
                  ? 'You approve each post before it goes live. Max 2 posts/day per platform.'
                  : mode === 'autopilot'
                  ? 'Posts auto-schedule. You get a notification to review. Max 5 posts/day per platform.'
                  : 'Fully automated. Posts go live with no review. Max 10 posts/day per platform.'}
              </p>
            </div>

            {/* Per-platform schedule */}
            {platforms.length > 0 && (
              <div className="rounded-2xl border border-amber-500/20 bg-gray-900 p-6 space-y-3">
                <div className="mb-1">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400/80">Schedule</h2>
                  <p className="text-xs text-gray-500 mt-1">Set how often SOMA posts on each platform and which days.</p>
                </div>

                {platforms.map(pid => {
                  const meta = ALL_PLATFORMS.find(p => p.id === pid)!
                  return (
                    <PlatformScheduleRow
                      key={pid}
                      platform={pid}
                      label={meta?.label ?? pid}
                      icon={meta?.icon ?? '📱'}
                      schedule={schedule[pid] ?? { posts_per_day: 1, days: [1,2,3,4,5] }}
                      maxPosts={maxPostsPerDay}
                      onChange={s => updatePlatformSchedule(pid, s)}
                    />
                  )
                })}

                {/* Content window */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-400 mb-2">
                    Content window — <span className="text-amber-400">{windowDays} days</span>
                  </label>
                  <div className="flex gap-2">
                    {[7, 14].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setWindowDays(d)}
                        disabled={d === 14 && mode === 'safe'}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                          windowDays === d
                            ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        {d} days
                      </button>
                    ))}
                  </div>
                  {mode === 'safe' && <p className="text-xs text-gray-600 mt-1">14-day window requires Autopilot or Full Send.</p>}
                </div>
              </div>
            )}

            {/* Auto-collect */}
            <div className="rounded-2xl border border-amber-500/20 bg-gray-900 p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400/80">Auto-Collect</h2>
                  <p className="text-xs text-gray-500 mt-1">SOMA automatically pulls context from a URL instead of you uploading a doc each week.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoCollect(p => !p)}
                  className={`relative inline-flex h-5 w-10 flex-shrink-0 rounded-full border-2 transition-colors ${
                    autoCollect ? 'bg-amber-500 border-amber-500' : 'bg-gray-700 border-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${autoCollect ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {autoCollect && (
                <input
                  type="url"
                  value={autoUrl}
                  onChange={e => setAutoUrl(e.target.value)}
                  placeholder="https://notion.so/your-page or https://docs.google.com/..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 mt-3"
                />
              )}
            </div>

            {error && (
              <div className="rounded-xl bg-red-950/40 border border-red-700/40 px-4 py-3 text-xs text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving || platforms.length === 0}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-extrabold py-3 rounded-xl text-sm transition-all"
              >
                {saving ? 'Creating…' : 'Create Project →'}
              </button>
              <Link
                href="/soma/dashboard"
                className="px-6 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-gray-200 text-sm font-semibold transition-all"
              >
                Cancel
              </Link>
            </div>

          </form>
        </div>
      </main>
    </div>
  )
}
