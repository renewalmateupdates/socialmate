'use client'
import { useEffect, useState, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import SomaVoiceFeedbackModal from '@/components/soma/SomaVoiceFeedbackModal'

interface PlatformSchedule { posts_per_day: number; days: number[] }

interface Project {
  id: string
  name: string
  description: string | null
  platforms: string[]
  posts_per_day: number
  content_window_days: number
  mode: 'safe' | 'autopilot' | 'full_send'
  auto_collect_enabled: boolean
  auto_collect_url: string | null
  runs_this_month: number
  last_generated_at: string | null
  platform_schedule: Record<string, PlatformSchedule> | null
}

interface MasterDoc {
  id: string
  version: number
  filename: string | null
  input_method: string
  created_at: string
  content: string
}

const MODE_COLORS = {
  safe:      { text: 'text-emerald-400', bg: 'bg-emerald-900/30 border-emerald-700/40' },
  autopilot: { text: 'text-violet-400',  bg: 'bg-violet-900/30 border-violet-700/40' },
  full_send: { text: 'text-amber-400',   bg: 'bg-amber-900/30 border-amber-700/40' },
}

const RUN_CAPS = { safe: 4, autopilot: 8, full_send: 12 }

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const PLATFORM_ICONS: Record<string, string> = {
  twitter: '𝕏', bluesky: '🦋', mastodon: '🐘', telegram: '✈️',
  discord: '🎮', linkedin: '💼', instagram: '📸', tiktok: '🎵',
}

const HOW_IT_WORKS = [
  { step: '1', title: 'Write your master doc', body: 'Drop in everything that happened this week — features shipped, insights gained, wins, lessons, news. No format required.' },
  { step: '2', title: 'Submit & analyze', body: 'SOMA reads your doc, extracts key themes, wins, and content angles. On week 2+, it diffs against last week to find what\'s new.' },
  { step: '3', title: 'Generate posts', body: 'SOMA creates platform-native content for each connected platform — tuned to character limits, tone, and your posting schedule.' },
  { step: '4', title: 'Review or autopilot', body: 'Safe mode saves drafts for your review. Autopilot & Full Send schedule posts automatically — no action needed.' },
]

export default function SomaProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params)
  const router = useRouter()

  const [loading, setLoading]           = useState(true)
  const [project, setProject]           = useState<Project | null>(null)
  const [docs, setDocs]                 = useState<MasterDoc[]>([])

  const [inputMethod, setInputMethod]   = useState<'text' | 'file' | 'url'>('text')
  const [docContent, setDocContent]     = useState('')
  const [docUrl, setDocUrl]             = useState('')
  const [filename, setFilename]         = useState('')
  const [ingesting, setIngesting]       = useState(false)
  const [ingestResult, setIngestResult] = useState<any>(null)
  const [ingestError, setIngestError]   = useState('')

  const [generating, setGenerating]         = useState(false)
  const [generateStage, setGenerateStage]   = useState('')
  const [generateResult, setGenerateResult] = useState<any>(null)
  const [generateError, setGenerateError]   = useState('')
  const [startDate, setStartDate]           = useState(() => new Date().toISOString().split('T')[0])

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]           = useState(false)

  const [editingSchedule, setEditingSchedule] = useState(false)
  const [localSchedule, setLocalSchedule]     = useState<Record<string, PlatformSchedule>>({})
  const [savingSchedule, setSavingSchedule]   = useState(false)

  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [voiceProfile, setVoiceProfile]           = useState<{ tier: string; hasSummary: boolean } | null>(null)

  async function saveSchedule() {
    setSavingSchedule(true)
    try {
      await fetch(`/api/soma/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform_schedule: localSchedule }),
      })
      setProject(p => p ? { ...p, platform_schedule: localSchedule } : p)
      setEditingSchedule(false)
    } finally {
      setSavingSchedule(false)
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/soma/projects/${projectId}`)
      if (res.status === 401) { router.push('/login?redirect=/soma/dashboard'); return }
      if (!res.ok) { router.push('/soma/dashboard'); return }
      const data = await res.json()
      setProject(data.project)
      setDocs(data.docs ?? [])

      // Restore latest ingestion so diff result survives page reloads
      const ingRes = await fetch(`/api/soma/projects/${projectId}/latest-ingestion`)
      if (ingRes.ok) {
        const ingData = await ingRes.json()
        if (ingData.ingestion) setIngestResult(ingData.ingestion)
      }

      // Check voice profile status
      const voiceRes = await fetch('/api/soma/voice')
      if (voiceRes.ok) {
        const voiceData = await voiceRes.json()
        setVoiceProfile({
          tier: voiceData.personality_tier ?? 'none',
          hasSummary: !!voiceData.personality_summary,
        })
      }
    } finally {
      setLoading(false)
    }
  }, [projectId, router])

  useEffect(() => { load() }, [load])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFilename(file.name)
    const text = await file.text()
    setDocContent(text)
  }

  async function handleIngest() {
    if (!docContent.trim() && inputMethod !== 'url') { setIngestError('Paste or upload your master doc first.'); return }
    if (inputMethod === 'url' && !docUrl.trim()) { setIngestError('Enter a URL to fetch.'); return }

    setIngesting(true)
    setIngestError('')
    setIngestResult(null)
    setGenerateResult(null)

    try {
      const res = await fetch(`/api/soma/projects/${projectId}/ingest`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content:      inputMethod === 'url' ? `Auto-collected from: ${docUrl}` : docContent,
          input_method: inputMethod,
          filename:     filename || undefined,
          source_url:   inputMethod === 'url' ? docUrl : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setIngestError(data.error === 'insufficient_soma_credits' ? 'Not enough SOMA credits.' : data.error || 'Ingest failed.')
        return
      }
      setIngestResult(data)
      // Clear the input so the panel is ready for the next doc (or clearly shows it was saved)
      setDocContent('')
      setDocUrl('')
      setFilename('')
      await load()
    } catch {
      setIngestError('Network error. Please try again.')
    } finally {
      setIngesting(false)
    }
  }

  async function handleGenerate() {
    if (!ingestResult?.ingestion_id) { setGenerateError('Run an ingest first.'); return }
    setGenerating(true)
    setGenerateStage('Crafting platform-native posts…')
    setGenerateError('')
    setGenerateResult(null)

    // Animate through stages so the user knows it's working
    const stages = [
      'Reading your diff…',
      'Crafting platform-native posts…',
      'Formatting for each platform…',
      'Scheduling posts…',
    ]
    let stageIdx = 0
    const stageTimer = setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, stages.length - 1)
      setGenerateStage(stages[stageIdx])
    }, 4000)

    try {
      const res = await fetch(`/api/soma/projects/${projectId}/generate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingestion_id: ingestResult.ingestion_id, start_date: startDate }),
      })
      clearInterval(stageTimer)
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'insufficient_soma_credits') setGenerateError('Not enough SOMA credits.')
        else if (data.error === 'monthly_run_cap_reached') setGenerateError(`Monthly run cap (${data.cap}) reached. Resets next month.`)
        else setGenerateError(data.error || 'Generation failed.')
        return
      }
      setGenerateResult(data)
      await load()
      // Show voice feedback modal after successful generation
      setShowFeedbackModal(true)
    } catch {
      clearInterval(stageTimer)
      setGenerateError('Network error. Please try again.')
    } finally {
      setGenerating(false)
      setGenerateStage('')
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/soma/projects/${projectId}`, { method: 'DELETE' })
      router.push('/soma/dashboard')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-950">
        <Sidebar />
        <main className="flex-1 md:ml-56 p-8 flex items-center justify-center">
          <div className="text-gray-500 text-sm animate-pulse">Loading project…</div>
        </main>
      </div>
    )
  }

  if (!project) return null

  const modeColors = MODE_COLORS[project.mode]
  const runCap     = RUN_CAPS[project.mode]
  const latestDoc  = docs[0] ?? null
  const isFirstDoc = !latestDoc
  const schedule   = project.platform_schedule

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />

      {showFeedbackModal && (
        <SomaVoiceFeedbackModal
          projectId={projectId}
          generationCount={project.runs_this_month}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}

      <main className="flex-1 md:ml-56 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
              <Link href="/soma/dashboard" className="hover:text-gray-300 transition-colors">SOMA</Link>
              <span>/</span>
              <span className="text-gray-300">{project.name}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">{project.name}</h1>
            {project.description && <p className="text-sm text-gray-400 mt-0.5">{project.description}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${modeColors.bg} ${modeColors.text}`}>
              {project.mode === 'safe' ? '🟢 Safe' : project.mode === 'autopilot' ? '⚡ Autopilot' : '🚀 Full Send'}
            </span>
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors px-2 py-1"
            >
              Delete
            </button>
          </div>
        </div>

        {/* ── VOICE DNA BANNER ── */}
        {voiceProfile && voiceProfile.tier === 'none' && (
          <Link
            href="/soma/voice"
            className="flex items-center justify-between gap-4 rounded-xl border border-purple-700/50 bg-purple-950/20 px-5 py-4 hover:bg-purple-950/30 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧬</span>
              <div>
                <p className="text-white font-semibold text-sm">Build your Voice DNA</p>
                <p className="text-purple-300 text-xs">Answer 10–40 questions and SOMA generates content that actually sounds like you.</p>
              </div>
            </div>
            <span className="text-purple-400 group-hover:translate-x-1 transition-transform text-sm">→</span>
          </Link>
        )}
        {voiceProfile && voiceProfile.tier !== 'none' && (
          <Link
            href="/soma/voice"
            className="flex items-center justify-between gap-4 rounded-xl border border-gray-700/50 bg-gray-900/50 px-5 py-3 hover:bg-gray-900 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🧬</span>
              <div>
                <p className="text-gray-300 text-sm font-medium">Voice DNA active — <span className="capitalize text-purple-400">{voiceProfile.tier.replace('_', ' ')}</span> tier</p>
                <p className="text-gray-600 text-xs">Click to deepen your profile or switch tiers</p>
              </div>
            </div>
            <span className="text-gray-600 group-hover:text-gray-400 transition-colors text-xs">Update →</span>
          </Link>
        )}

        {/* ── PROJECT STATS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Platforms */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 col-span-2 sm:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Platforms</p>
            <div className="flex flex-wrap gap-1">
              {project.platforms.map(p => (
                <span key={p} className="text-xs font-semibold text-white flex items-center gap-1">
                  <span>{PLATFORM_ICONS[p] ?? '📱'}</span>
                  <span className="capitalize">{p}</span>
                </span>
              )).reduce((acc: React.ReactNode[], el, i) => i === 0 ? [el] : [...acc, <span key={`sep-${i}`} className="text-gray-600">·</span>, el], [])}
            </div>
          </div>

          {/* Per-platform schedule */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Schedule</p>
            {schedule && Object.keys(schedule).length > 0 ? (
              <div className="space-y-1">
                {Object.entries(schedule).map(([pid, cfg]) => (
                  <div key={pid} className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 capitalize">{pid}</span>
                    <span className="text-white font-bold">{cfg.posts_per_day}/day</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-bold text-white">{project.posts_per_day}/day</p>
            )}
          </div>

          {/* Content window */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Window</p>
            <p className="text-sm font-bold text-white">{project.content_window_days} days</p>
          </div>

          {/* Runs */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Runs this month</p>
            <p className="text-sm font-bold text-white">{project.runs_this_month} / {runCap}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">resets monthly</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT: DOC UPLOAD ── */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-500/20 bg-gray-900 p-5">

              {/* Header with context */}
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400/80">
                  {isFirstDoc ? 'Set Your Baseline' : 'Upload This Week\'s Doc'}
                </h2>
                {isFirstDoc ? (
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    Drop in your current master doc — everything about your brand, what you've shipped, your story so far. This becomes SOMA's baseline. Next week, paste the updated version and SOMA will diff it to find what's new.
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1.5">
                    v{latestDoc!.version} uploaded {new Date(latestDoc!.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.
                    {' '}SOMA will diff your new doc against this to extract what changed.
                  </p>
                )}
              </div>

              {/* Input method tabs */}
              <div className="flex gap-1 p-1 bg-gray-800 rounded-xl mb-4">
                {(['text', 'file', 'url'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setInputMethod(m)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      inputMethod === m ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {m === 'text' ? 'Paste Text' : m === 'file' ? 'Upload File' : 'URL'}
                  </button>
                ))}
              </div>

              {inputMethod === 'text' && (
                <textarea
                  value={docContent}
                  onChange={e => setDocContent(e.target.value)}
                  placeholder={isFirstDoc
                    ? 'Paste your master doc — who you are, what you do, what you\'ve shipped, key wins, your story. No specific format needed.'
                    : 'Paste this week\'s update — what shipped, what changed, lessons learned, wins, news…'
                  }
                  rows={10}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              )}

              {inputMethod === 'file' && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-amber-500/50 transition-all">
                  <p className="text-xs text-gray-400 mb-1">{filename || 'Click to upload .txt or .md file'}</p>
                  {docContent && <p className="text-[10px] text-emerald-400">{docContent.length.toLocaleString()} chars loaded</p>}
                  <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
                </label>
              )}

              {inputMethod === 'url' && (
                <div>
                  <input
                    type="url"
                    value={docUrl}
                    onChange={e => setDocUrl(e.target.value)}
                    placeholder="https://notion.so/your-page"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                  />
                  <p className="text-xs text-gray-500 mt-2">Public Notion pages and Google Docs share links supported.</p>
                </div>
              )}

              {ingestError && (
                <div className="mt-3 text-xs text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2">{ingestError}</div>
              )}

              <button
                onClick={handleIngest}
                disabled={ingesting}
                className="mt-4 w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-extrabold py-3 rounded-xl text-sm transition-all"
              >
                {ingesting ? 'Analyzing…' : isFirstDoc ? 'Submit Baseline Doc' : 'Submit & Diff Against Previous'}
              </button>
            </div>

            {/* Doc history */}
            {docs.length > 0 && (
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Doc History</h2>
                <div className="space-y-2">
                  {docs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between text-xs text-gray-400">
                      <span>v{doc.version} — {doc.filename || doc.input_method}</span>
                      <span>{new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Per-platform day schedule */}
            {schedule && Object.keys(schedule).length > 0 && (
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Posting Schedule</h2>
                  {!editingSchedule ? (
                    <button
                      onClick={() => { setLocalSchedule(JSON.parse(JSON.stringify(schedule))); setEditingSchedule(true) }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setEditingSchedule(false)} className="text-[11px] text-gray-500 hover:text-gray-300">Cancel</button>
                      <button onClick={saveSchedule} disabled={savingSchedule} className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold disabled:opacity-50">
                        {savingSchedule ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {Object.entries(editingSchedule ? localSchedule : schedule).map(([pid, cfg]) => (
                    <div key={pid}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-gray-300 capitalize flex items-center gap-1.5">
                          <span>{PLATFORM_ICONS[pid] ?? '📱'}</span>{pid}
                        </span>
                        {editingSchedule ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => setLocalSchedule(s => ({ ...s, [pid]: { ...s[pid], posts_per_day: Math.max(1, s[pid].posts_per_day - 1) } }))} className="w-5 h-5 rounded bg-gray-800 text-gray-300 text-xs font-bold hover:bg-gray-700">−</button>
                            <span className="text-[11px] text-amber-400 font-bold w-8 text-center">{cfg.posts_per_day}/day</span>
                            <button onClick={() => setLocalSchedule(s => ({ ...s, [pid]: { ...s[pid], posts_per_day: Math.min(10, s[pid].posts_per_day + 1) } }))} className="w-5 h-5 rounded bg-gray-800 text-gray-300 text-xs font-bold hover:bg-gray-700">+</button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-400 font-bold">{cfg.posts_per_day}/day</span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {DAY_LABELS.map((d, i) => (
                          <button
                            key={i}
                            disabled={!editingSchedule}
                            onClick={() => {
                              if (!editingSchedule) return
                              setLocalSchedule(s => {
                                const days = s[pid].days.includes(i) ? s[pid].days.filter(x => x !== i) : [...s[pid].days, i]
                                return { ...s, [pid]: { ...s[pid], days } }
                              })
                            }}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                              cfg.days.includes(i)
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-gray-800 text-gray-600'
                            } ${editingSchedule ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: INSIGHTS + GUIDE ── */}
          <div className="space-y-4">

            {/* Ingest result */}
            {ingestResult && (
              <div className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-3">
                  {ingestResult.is_diff ? 'Diff Analysis' : 'Baseline Captured'}
                </h2>

                {ingestResult.extracted_insights?.diff_summary && (
                  <div className="mb-4 p-3 rounded-xl bg-gray-900 border border-gray-800">
                    <p className="text-xs font-semibold text-gray-300">{ingestResult.extracted_insights.diff_summary}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {[
                    { label: 'Key Themes',     items: ingestResult.extracted_insights?.key_themes },
                    { label: 'Wins',           items: ingestResult.extracted_insights?.wins },
                    { label: 'Challenges',     items: ingestResult.extracted_insights?.challenges },
                    { label: 'Content Angles', items: ingestResult.extracted_insights?.content_angles },
                  ].map(row => (
                    row.items?.length > 0 && (
                      <div key={row.label}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{row.label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {row.items.slice(0, 5).map((item: string) => (
                            <span key={item} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-gray-300">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-violet-500/20">
                  {!ingestResult.is_diff ? (
                    /* Baseline captured — don't generate yet, prompt for current doc */
                    <div className="rounded-xl bg-amber-950/20 border border-amber-700/30 px-4 py-3">
                      <p className="text-xs font-bold text-amber-400 mb-1">Baseline saved. Now paste your current doc.</p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Go back to the left panel and paste your most recent master doc. SOMA will diff the two, extract what changed, and then you can generate posts.
                      </p>
                    </div>
                  ) : generating ? (
                    <div className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse flex-shrink-0" />
                        <p className="text-xs font-semibold text-violet-300">{generateStage}</p>
                      </div>
                      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-400" style={{ width: '100%', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                      </div>
                      <p className="text-[11px] text-gray-600 mt-2">Usually takes 15–30 seconds. Hang tight.</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-400 mb-3">
                        {project.mode === 'safe'
                          ? `Posts will be saved as drafts across ${project.platforms.join(', ')} for your review.`
                          : `Posts will auto-schedule across ${project.platforms.join(', ')} for ${project.content_window_days} days.`}
                      </p>

                      {/* Start date picker */}
                      <div className="mb-4 rounded-xl bg-gray-900/80 border border-gray-700 px-4 py-3">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                          Schedule starts
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={e => setStartDate(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                        />
                        <p className="text-[10px] text-gray-600 mt-1.5">
                          Posts will be spread across {project.content_window_days} days starting this date.
                        </p>
                      </div>

                      {generateError && (
                        <div className="mb-3 text-xs text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2">{generateError}</div>
                      )}

                      {generateResult ? (
                        <div className="rounded-xl bg-emerald-950/30 border border-emerald-700/40 px-4 py-3">
                          <p className="text-sm font-bold text-emerald-400 text-center mb-2">
                            {generateResult.posts_created} posts {project.mode === 'safe' ? 'drafted' : 'scheduled'}
                          </p>
                          {generateResult.platform_counts && (
                            <div className="space-y-1 mb-3">
                              {Object.entries(generateResult.platform_counts as Record<string,number>).map(([p, n]) => (
                                <div key={p} className="flex justify-between text-xs">
                                  <span className="text-gray-400 capitalize">{PLATFORM_ICONS[p] ?? '📱'} {p}</span>
                                  <span className="text-emerald-400 font-bold">{n} posts ✓</span>
                                </div>
                              ))}
                              {generateResult.platform_errors && Object.entries(generateResult.platform_errors as Record<string,string>).map(([p, err]) => (
                                <div key={p} className="flex justify-between text-xs">
                                  <span className="text-gray-400 capitalize">{PLATFORM_ICONS[p] ?? '📱'} {p}</span>
                                  <span className="text-red-400 font-bold">failed — {err.slice(0, 40)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <Link href={project.mode === 'safe' ? '/soma/dashboard' : '/queue'} className="text-xs text-emerald-300 hover:text-emerald-200 underline block text-center">
                            {project.mode === 'safe' ? 'Review in SOMA queue →' : 'View in queue →'}
                          </Link>
                        </div>
                      ) : generating ? (
                        <div className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse flex-shrink-0" />
                            <p className="text-xs font-semibold text-violet-300">{generateStage}</p>
                          </div>
                          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-400" style={{ width: '100%', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                          </div>
                          <p className="text-[11px] text-gray-600 mt-2">Usually takes 15–30 seconds. Hang tight.</p>
                        </div>
                      ) : (
                        <button
                          onClick={handleGenerate}
                          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-extrabold py-3 rounded-xl text-sm transition-all"
                        >
                          Generate Posts →
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* How it works — shown before first ingest */}
            {!ingestResult && (
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">How SOMA works</h2>
                <div className="space-y-4">
                  {HOW_IT_WORKS.map(({ step, title, body }) => (
                    <div key={step} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[11px] font-extrabold text-amber-400">
                        {step}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-200 mb-0.5">{title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-[11px] text-gray-600">
                    {isFirstDoc
                      ? '← Start by pasting your master doc on the left.'
                      : `← Paste this week's update. SOMA will diff it against v${latestDoc!.version}.`}
                  </p>
                </div>
              </div>
            )}

            {/* Responsible use — simplified, no per-platform number confusion */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 px-4 py-3">
              <p className="text-[11px] text-gray-500 leading-relaxed">
                <strong className="text-gray-400">Heads up:</strong> Posts go live on your behalf in Autopilot and Full Send mode.
                You're responsible for the content — SocialMate isn't liable for platform restrictions from your posting activity.
                {project.mode === 'safe' && ' In Safe mode, nothing publishes without your approval.'}
              </p>
            </div>

          </div>
        </div>

        {/* ── DELETE CONFIRM ── */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-red-700/40 bg-gray-900 p-6 text-center">
              <p className="text-base font-extrabold text-white mb-2">Delete &quot;{project.name}&quot;?</p>
              <p className="text-xs text-gray-400 mb-6">This will delete the project and all its master doc history. Posts already generated are not affected.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm"
                >
                  {deleting ? 'Deleting…' : 'Delete Project'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 border border-gray-700 text-gray-300 hover:text-white font-bold py-2.5 rounded-xl text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
