'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

const AVAILABLE_PLATFORMS = [
  { id: 'bluesky',  label: 'Bluesky' },
  { id: 'twitter',  label: 'Twitter / X' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'mastodon', label: 'Mastodon' },
  { id: 'instagram',label: 'Instagram' },
  { id: 'discord',  label: 'Discord' },
]

export default function NewSomaProjectPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [platforms, setPlatforms]     = useState<string[]>(['bluesky'])
  const [postsPerDay, setPostsPerDay] = useState(2)
  const [windowDays, setWindowDays]   = useState(7)
  const [mode, setMode]               = useState<'safe' | 'autopilot' | 'full_send'>('safe')
  const [autoCollect, setAutoCollect] = useState(false)
  const [autoUrl, setAutoUrl]         = useState('')

  function togglePlatform(id: string) {
    setPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Project name is required.'); return }
    if (platforms.length === 0) { setError('Select at least one platform.'); return }

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
          posts_per_day:        postsPerDay,
          content_window_days:  windowDays,
          mode,
          auto_collect_enabled: autoCollect,
          auto_collect_url:     autoUrl,
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
              <p className="text-xs text-gray-500 mb-4">SOMA will generate platform-native posts for each one you select.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                      platforms.includes(p.id)
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {platforms.includes(p.id) ? '◆ ' : '○ '}{p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode + Schedule */}
            <div className="rounded-2xl border border-amber-500/20 bg-gray-900 p-6 space-y-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400/80 mb-2">Mode & Schedule</h2>

              {/* Mode */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Posting Mode</label>
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
                <p className="text-xs text-gray-500 mt-2">
                  {mode === 'safe'
                    ? 'You approve each post before it goes live.'
                    : mode === 'autopilot'
                    ? 'Posts auto-schedule. You get a notification to review.'
                    : 'Fully automated. Posts go live with no review required.'}
                </p>
              </div>

              {/* Posts per day */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">
                  Posts per day — <span className="text-amber-400">{postsPerDay}</span>
                  <span className="text-gray-600 ml-1">(max {mode === 'full_send' ? 10 : mode === 'autopilot' ? 5 : 2})</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={mode === 'full_send' ? 10 : mode === 'autopilot' ? 5 : 2}
                  value={postsPerDay}
                  onChange={e => setPostsPerDay(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              {/* Window */}
              <div>
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
                disabled={saving}
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
