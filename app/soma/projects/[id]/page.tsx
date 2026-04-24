'use client'
import { useEffect, useState, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

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

export default function SomaProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params)
  const router = useRouter()

  const [loading, setLoading]           = useState(true)
  const [project, setProject]           = useState<Project | null>(null)
  const [docs, setDocs]                 = useState<MasterDoc[]>([])

  // Doc upload state
  const [inputMethod, setInputMethod]   = useState<'text' | 'file' | 'url'>('text')
  const [docContent, setDocContent]     = useState('')
  const [docUrl, setDocUrl]             = useState('')
  const [filename, setFilename]         = useState('')
  const [ingesting, setIngesting]       = useState(false)
  const [ingestResult, setIngestResult] = useState<any>(null)
  const [ingestError, setIngestError]   = useState('')

  // Generate state
  const [generating, setGenerating]     = useState(false)
  const [generateResult, setGenerateResult] = useState<any>(null)
  const [generateError, setGenerateError]   = useState('')

  // Delete
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]           = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/soma/projects/${projectId}`)
      if (res.status === 401) { router.push('/login?redirect=/soma/dashboard'); return }
      if (!res.ok) { router.push('/soma/dashboard'); return }
      const data = await res.json()
      setProject(data.project)
      setDocs(data.docs ?? [])
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
      await load() // refresh doc list
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

    try {
      const res = await fetch(`/api/soma/projects/${projectId}/generate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingestion_id: ingestResult.ingestion_id }),
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

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
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

        {/* ── PROJECT STATS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Platforms',    value: project.platforms.join(', ') },
            { label: 'Posts / day',  value: String(project.posts_per_day) },
            { label: 'Window',       value: `${project.content_window_days} days` },
            { label: 'Runs this month', value: `${project.runs_this_month} / ${runCap}` },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{s.label}</p>
              <p className="text-sm font-bold text-white truncate">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT: DOC UPLOAD ── */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-500/20 bg-gray-900 p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400/80 mb-1">Upload Master Doc</h2>
              {latestDoc && (
                <p className="text-xs text-gray-500 mb-4">
                  Latest: v{latestDoc.version} — {new Date(latestDoc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.
                  SOMA will diff against this.
                </p>
              )}
              {!latestDoc && (
                <p className="text-xs text-gray-500 mb-4">First upload — SOMA will use this as the baseline.</p>
              )}

              {/* Input method tabs */}
              <div className="flex gap-1 p-1 bg-gray-800 rounded-xl mb-4">
                {(['text', 'file', 'url'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setInputMethod(m)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
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
                  placeholder="Paste your weekly master doc here — what happened this week, what shipped, what changed…"
                  rows={10}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              )}

              {inputMethod === 'file' && (
                <div>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-amber-500/50 transition-all">
                    <p className="text-xs text-gray-400 mb-1">{filename || 'Click to upload .txt or .md file'}</p>
                    {docContent && <p className="text-[10px] text-emerald-400">{docContent.length.toLocaleString()} chars loaded</p>}
                    <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
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
                {ingesting ? 'Analyzing diff…' : latestDoc ? 'Submit & Diff Against Previous' : 'Submit Baseline Doc'}
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
          </div>

          {/* ── RIGHT: INSIGHTS + GENERATE ── */}
          <div className="space-y-4">

            {/* Ingest result */}
            {ingestResult && (
              <div className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-3">
                  {ingestResult.is_diff ? 'Diff Analysis' : 'Baseline Analysis'}
                </h2>

                {ingestResult.extracted_insights?.diff_summary && (
                  <div className="mb-4 p-3 rounded-xl bg-gray-900 border border-gray-800">
                    <p className="text-xs font-semibold text-gray-300">{ingestResult.extracted_insights.diff_summary}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {[
                    { label: 'Key Themes',    items: ingestResult.extracted_insights?.key_themes },
                    { label: 'Wins',          items: ingestResult.extracted_insights?.wins },
                    { label: 'Challenges',    items: ingestResult.extracted_insights?.challenges },
                    { label: 'Content Angles',items: ingestResult.extracted_insights?.content_angles },
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
                  <p className="text-xs text-gray-400 mb-3">
                    Ready to generate <strong className="text-white">{project.posts_per_day * project.content_window_days} posts</strong> across{' '}
                    <strong className="text-white">{project.platforms.join(', ')}</strong> for{' '}
                    <strong className="text-white">{project.content_window_days} days</strong>.
                    {project.mode === 'safe' ? ' Posts will be saved as drafts for your review.' : ' Posts will be auto-scheduled.'}
                  </p>

                  {generateError && (
                    <div className="mb-3 text-xs text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2">{generateError}</div>
                  )}

                  {generateResult ? (
                    <div className="rounded-xl bg-emerald-950/30 border border-emerald-700/40 px-4 py-3 text-center">
                      <p className="text-sm font-bold text-emerald-400">
                        {generateResult.posts_created} posts {project.mode === 'safe' ? 'drafted' : 'scheduled'}
                      </p>
                      <Link href={project.mode === 'safe' ? '/soma/dashboard' : '/queue'} className="text-xs text-emerald-300 hover:text-emerald-200 underline mt-1 block">
                        {project.mode === 'safe' ? 'Review in SOMA queue →' : 'View in queue →'}
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-extrabold py-3 rounded-xl text-sm transition-all"
                    >
                      {generating ? 'Generating platform-native posts…' : `Generate ${project.posts_per_day * project.content_window_days} Posts →`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {!ingestResult && (
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
                <p className="text-3xl mb-3">📋</p>
                <p className="text-sm font-semibold text-gray-300 mb-1">Submit your master doc first</p>
                <p className="text-xs text-gray-500">SOMA will analyze what changed and prepare your content calendar.</p>
              </div>
            )}

            {/* Responsible use note */}
            <div className="rounded-xl border border-amber-700/30 bg-amber-950/20 px-4 py-3">
              <p className="text-xs text-amber-300/80 leading-relaxed">
                <strong>Posting responsibly:</strong> SOMA respects platform rate limits. Posts generated here count against your daily cap ({project.posts_per_day}/day).
                You are responsible for reviewing generated content. Automated posts go live on your behalf —
                SocialMate is not liable for platform restrictions resulting from your posting behavior.
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
