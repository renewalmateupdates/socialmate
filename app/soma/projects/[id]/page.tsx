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
  paused: boolean
  campaign_theme: string | null
  campaign_start: string | null
  campaign_end: string | null
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

const LOADING_QUOTES = [
  // Hustle / Motivation
  "You do not rise to the level of your goals. You fall to the level of your systems.",
  "Do the work. The world doesn't owe you attention — you earn it.",
  "Muhammad Ali didn't become the greatest by resting. He became great by showing up every single day.",
  "The deli counter is not your ceiling. It's your origin story.",
  "Broke doesn't mean broken. Bootstrap means you control the outcome.",
  "Ship it. Fix it. Ship it again.",
  "Every post is a rep. Keep showing up.",
  "You're not waiting for the right moment. You're building it.",
  "Marcus Aurelius said it: waste no more time arguing what a good person should be — be one. Build the thing.",
  "The grind is the product. Everything else is the reward.",
  "Bootstrapped means no permission needed. That's a superpower.",
  "Naval: 'Escape competition through authenticity.' You're already one-of-one.",
  "J. Cole dropped an album with no features. You can build a product with no funding.",
  "The algorithm rewards consistency. Be consistent.",
  "Nobody gives a damn about your potential. Ship the proof.",
  "Hard times create strong builders. Strong builders create better tools.",
  "Kanye filed for bankruptcy before Yeezy. Act accordingly.",
  "Every epic started as a blank page. You're writing yours.",
  "Build in public. The community doesn't just watch — it cheers.",
  "One day at the deli. One night in the code. That's the formula.",
  // SOMA tips
  "SOMA gets smarter the more you use it — complete your Voice DNA for better results.",
  "Tip: campaign mode lets you focus SOMA on a specific theme or holiday push.",
  "Your Voice DNA is live — SOMA is generating content that actually sounds like you.",
  "Safe mode = full control. Autopilot = time back in your day.",
  "SOMA memory means no repeated angles. Every week is fresh.",
  "The diff engine is reading what changed — the more specific your doc, the sharper the posts.",
  "Tip: use the campaign theme field for launches, events, or seasonal pushes.",
  "Pausing a project doesn't lose your settings — resume anytime.",
  "Voice DNA Advanced tier means SOMA knows your slang, your references, your vibe.",
  "Your master doc is SOMA's brain. The more detail you give it, the better it performs.",
  "SOMA generates platform-native posts — Twitter gets hooks, LinkedIn gets depth, Bluesky gets authenticity.",
  "Tip: run a campaign theme during a product launch to flood your feed with relevant content.",
  "SOMA tracks what it's already covered. It won't repeat the same angles twice.",
  "Every run gets smarter. Feedback you give SOMA shapes every future generation.",
  // Building-in-public
  "Build the door. Then hold it open for everyone behind you.",
  "Your story — deli job, nights coding, no VC — is the content. Let SOMA tell it.",
  "The people who ship consistently win. Not the people with the best ideas.",
  "Imposter syndrome is proof you care. Ship anyway.",
  "The smallest consistent action beats the biggest one-time effort.",
  "Failure is research. Bugs are data. Keep iterating.",
  "Your first version doesn't have to be perfect. It has to exist.",
  "Power to the people. Build the door.",
  "Progress is not linear. Ship anyway.",
  "One year from now you'll wish you started today — so today you did.",
  "The platform that charges $99 built what you're replacing. Remember that.",
  "Creator OS. The home base. The foundation. You're building it.",
  "You don't need a team. You need a deadline and the will to meet it.",
  "Every creator deserves the tools the big players have. That's why this exists.",
  "One more rep. One more post. One more day.",
]

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
  const [memory, setMemory]                       = useState<{ running_summary: string; topics_covered: string[]; angles_used: string[]; total_posts_generated: number } | null>(null)

  // Loading modal quote rotator
  const [quoteIndex, setQuoteIndex] = useState(0)
  useEffect(() => {
    if (!generating) return
    const id = setInterval(() => setQuoteIndex(i => (i + 1) % LOADING_QUOTES.length), 2500)
    return () => clearInterval(id)
  }, [generating])

  // Pause toggle
  const [togglingPause, setTogglingPause] = useState(false)
  async function handleTogglePause() {
    if (!project) return
    setTogglingPause(true)
    try {
      await fetch(`/api/soma/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paused: !project.paused }),
      })
      setProject(p => p ? { ...p, paused: !p.paused } : p)
    } finally {
      setTogglingPause(false)
    }
  }

  // Campaign mode
  const [campaignOpen, setCampaignOpen]       = useState(false)
  const [campaignEnabled, setCampaignEnabled] = useState(false)
  const [campaignTheme, setCampaignTheme]     = useState('')
  const [campaignStart, setCampaignStart]     = useState('')
  const [campaignEnd, setCampaignEnd]         = useState('')
  const [savingCampaign, setSavingCampaign]   = useState(false)

  // Sync campaign state when project loads
  useEffect(() => {
    if (!project) return
    setCampaignEnabled(!!project.campaign_theme)
    setCampaignTheme(project.campaign_theme ?? '')
    setCampaignStart(project.campaign_start ?? '')
    setCampaignEnd(project.campaign_end ?? '')
  }, [project?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function saveCampaign() {
    setSavingCampaign(true)
    try {
      const payload = campaignEnabled && campaignTheme.trim()
        ? { campaign_theme: campaignTheme.trim(), campaign_start: campaignStart || null, campaign_end: campaignEnd || null }
        : { campaign_theme: null, campaign_start: null, campaign_end: null }
      await fetch(`/api/soma/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setProject(p => p ? { ...p, ...payload } : p)
      if (!campaignEnabled || !campaignTheme.trim()) {
        setCampaignEnabled(false)
        setCampaignTheme('')
        setCampaignStart('')
        setCampaignEnd('')
      }
    } finally {
      setSavingCampaign(false)
    }
  }

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

      // Load SOMA memory for this project
      const memRes = await fetch(`/api/soma/projects/${projectId}/memory`)
      if (memRes.ok) {
        const memData = await memRes.json()
        setMemory(memData.memory ?? null)
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
    setGenerateError('')
    setGenerateResult(null)
    setQuoteIndex(0)

    try {
      const res = await fetch(`/api/soma/projects/${projectId}/generate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingestion_id: ingestResult.ingestion_id, start_date: startDate }),
      })
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
      setGenerateError('Network error. Please try again.')
    } finally {
      setGenerating(false)
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

      {/* ── LOADING MODAL ── */}
      {generating && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/95 backdrop-blur-sm px-6">
          {/* Spinner */}
          <div className="relative mb-8">
            <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
          </div>

          {/* Rotating quote */}
          <div className="max-w-md text-center">
            <p
              key={quoteIndex}
              className="text-white text-sm sm:text-base font-medium leading-relaxed animate-fade-in"
              style={{ animation: 'fadeIn 0.6s ease-in-out' }}
            >
              {LOADING_QUOTES[quoteIndex]}
            </p>
          </div>

          <p className="mt-8 text-xs text-gray-600">SOMA is crafting your posts — do not close this tab</p>

          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
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
            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {project.paused && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-900/40 border border-amber-600/50 text-amber-400">
                  ⏸ PAUSED — weekly cron skipped
                </span>
              )}
              {project.campaign_theme && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-900/40 border border-orange-600/50 text-orange-300">
                  🎯 Campaign: {project.campaign_theme}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${modeColors.bg} ${modeColors.text}`}>
              {project.mode === 'safe' ? '🟢 Safe' : project.mode === 'autopilot' ? '⚡ Autopilot' : '🚀 Full Send'}
            </span>
            {/* Pause toggle */}
            <button
              onClick={handleTogglePause}
              disabled={togglingPause}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all disabled:opacity-50 ${
                project.paused
                  ? 'border-emerald-700/50 text-emerald-400 bg-emerald-900/20 hover:bg-emerald-900/40'
                  : 'border-gray-700 text-gray-400 bg-gray-800/50 hover:text-amber-400 hover:border-amber-700/50'
              }`}
              title={project.paused ? 'Resume — autopilot cron will run again' : 'Pause — skip weekly cron without deleting'}
            >
              {togglingPause ? '…' : project.paused ? '▶ Resume' : '⏸ Pause'}
            </button>
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

            {/* ── CAMPAIGN MODE ── */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <button
                type="button"
                onClick={() => setCampaignOpen(o => !o)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <span>🎯</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Campaign Mode</span>
                  {project.campaign_theme && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-900/40 border border-orange-700/40 text-orange-300">
                      Active
                    </span>
                  )}
                </div>
                <span className="text-gray-600 text-xs">{campaignOpen ? '▲' : '▼'}</span>
              </button>

              {campaignOpen && (
                <div className="mt-4 space-y-4">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Focus SOMA on a specific campaign — a product launch, holiday push, or event. When active, every generated post will tie back to this theme.
                  </p>

                  {/* Enable toggle */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setCampaignEnabled(e => !e)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${campaignEnabled ? 'bg-orange-500' : 'bg-gray-700'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${campaignEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-xs text-gray-300 font-medium">{campaignEnabled ? 'Campaign mode on' : 'Campaign mode off'}</span>
                  </label>

                  {campaignEnabled && (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                          Campaign theme or focus
                        </label>
                        <input
                          type="text"
                          value={campaignTheme}
                          onChange={e => setCampaignTheme(e.target.value)}
                          placeholder="e.g. Black Friday deals, product launch, New Year push…"
                          maxLength={120}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                            Start date (optional)
                          </label>
                          <input
                            type="date"
                            value={campaignStart}
                            onChange={e => setCampaignStart(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                            End date (optional)
                          </label>
                          <input
                            type="date"
                            value={campaignEnd}
                            min={campaignStart}
                            onChange={e => setCampaignEnd(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    onClick={saveCampaign}
                    disabled={savingCampaign || (campaignEnabled && !campaignTheme.trim())}
                    className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all"
                  >
                    {savingCampaign ? 'Saving…' : campaignEnabled ? 'Save Campaign' : 'Clear Campaign'}
                  </button>
                </div>
              )}
            </div>
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
                          <div className="flex items-center justify-between mt-2">
                            <Link href={project.mode === 'safe' ? '/soma/dashboard' : '/queue'} className="text-xs text-emerald-300 hover:text-emerald-200 underline">
                              {project.mode === 'safe' ? 'Review in SOMA queue →' : 'View in queue →'}
                            </Link>
                            <button
                              onClick={() => setShowFeedbackModal(true)}
                              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                            >
                              🎙️ Give feedback
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={handleGenerate}
                          disabled={generating}
                          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-extrabold py-3 rounded-xl text-sm transition-all"
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

        {/* ── SOMA MEMORY ── */}
        {memory && (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">SOMA Memory</h2>
                <p className="text-[11px] text-gray-600 mt-0.5">What SOMA has already covered — it won't repeat these</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600">{memory.total_posts_generated} posts generated</span>
                <button
                  onClick={async () => {
                    if (!confirm('Clear SOMA\'s memory for this project? It will start fresh on next ingest.')) return
                    await fetch(`/api/soma/projects/${projectId}/memory`, { method: 'DELETE' })
                    setMemory(null)
                  }}
                  className="text-xs text-red-500 hover:text-red-400 transition-colors"
                >
                  Clear memory
                </button>
              </div>
            </div>

            {memory.running_summary && (
              <div className="mb-4 bg-gray-800/50 rounded-xl p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">Manager Notes</p>
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{memory.running_summary}</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              {memory.topics_covered?.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">Topics covered</p>
                  <div className="flex flex-wrap gap-1.5">
                    {memory.topics_covered.map((t, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {memory.angles_used?.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">Angles used</p>
                  <div className="flex flex-wrap gap-1.5">
                    {memory.angles_used.map((a, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
