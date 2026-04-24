'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

function getCurrentWeekLabel(): string {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay() + 1)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

const PLATFORM_OPTIONS = [
  { id: 'bluesky', label: 'Bluesky' },
  { id: 'twitter', label: 'X / Twitter' },
  { id: 'mastodon', label: 'Mastodon' },
  { id: 'discord', label: 'Discord' },
  { id: 'telegram', label: 'Telegram' },
]

export default function SomaWeeklyPage() {
  const [tab, setTab] = useState<'form' | 'upload'>('form')
  const [weekLabel, setWeekLabel] = useState(getCurrentWeekLabel())
  const [whatHappened, setWhatHappened] = useState('')
  const [workingToward, setWorkingToward] = useState('')
  const [wins, setWins] = useState('')
  const [challenges, setChallenges] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState('')
  const [dragging, setDragging] = useState(false)
  const [ingesting, setIngesting] = useState(false)
  const [ingestError, setIngestError] = useState('')
  const [insights, setInsights] = useState<any>(null)
  const [ingestionId, setIngestionId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [done, setDone] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState(['bluesky', 'twitter'])
  const fileInputRef = useRef<HTMLInputElement>(null)

  function togglePlatform(id: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  async function handleFileSelect(file: File) {
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      setIngestError('Only .txt and .md files are supported.')
      return
    }
    setUploadedFile(file)
    const text = await file.text()
    setFilePreview(text.slice(0, 300))
    setIngestError('')
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  async function handleIngestForm() {
    const rawParts = [whatHappened, workingToward, wins, challenges].filter(Boolean)
    if (rawParts.length === 0) {
      setIngestError('Please fill in at least one field.')
      return
    }
    const raw_input = rawParts.join('\n\n')
    setIngesting(true)
    setIngestError('')
    try {
      const res = await fetch('/api/soma/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week_label: weekLabel, raw_input }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'insufficient_soma_credits') {
          setIngestError('Not enough SOMA credits. You need 25 credits to analyze a week.')
        } else {
          setIngestError(data.error || 'Something went wrong. Please try again.')
        }
        return
      }
      setInsights(data.extracted_insights)
      setIngestionId(data.ingestion_id)
    } catch {
      setIngestError('Network error. Please try again.')
    } finally {
      setIngesting(false)
    }
  }

  async function handleIngestUpload() {
    if (!uploadedFile) {
      setIngestError('Please select a file first.')
      return
    }
    setIngesting(true)
    setIngestError('')
    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)
      formData.append('week_label', weekLabel)
      const res = await fetch('/api/soma/ingest/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'insufficient_soma_credits') {
          setIngestError('Not enough SOMA credits. You need 25 credits to analyze a week.')
        } else {
          setIngestError(data.error || 'Something went wrong. Please try again.')
        }
        return
      }
      setInsights(data.extracted_insights)
      setIngestionId(data.ingestion_id)
    } catch {
      setIngestError('Network error. Please try again.')
    } finally {
      setIngesting(false)
    }
  }

  async function handleGenerate() {
    if (!ingestionId) return
    if (selectedPlatforms.length === 0) {
      setGenerateError('Select at least one platform.')
      return
    }
    setGenerating(true)
    setGenerateError('')
    try {
      const res = await fetch('/api/soma/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingestion_id: ingestionId, platforms: selectedPlatforms }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'insufficient_soma_credits') {
          setGenerateError('Not enough SOMA credits. You need 75 credits to generate a week.')
        } else {
          setGenerateError(data.error || 'Generation failed. Please try again.')
        }
        return
      }
      setDone(true)
    } catch {
      setGenerateError('Network error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  // ── Done state ──────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-5xl">⚡</div>
          <h2 className="text-2xl font-bold text-white">21 posts created as drafts</h2>
          <p className="text-zinc-400 text-sm">
            Spread across 7 days · morning, afternoon, evening slots
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/soma/dashboard"
              className="px-5 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors"
            >
              Review in SOMA Queue →
            </Link>
            <Link
              href="/drafts"
              className="px-5 py-3 rounded-lg border border-zinc-700 hover:border-zinc-500 text-white font-semibold text-sm transition-colors"
            >
              View all drafts →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">⚡ This Week&rsquo;s Ingestion</h1>
          <p className="text-zinc-400 text-sm">
            Tell SOMA what happened this week. She&rsquo;ll turn it into 21 posts.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <label className="text-xs text-zinc-500 shrink-0">Week:</label>
            <input
              type="text"
              value={weekLabel}
              onChange={(e) => setWeekLabel(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500 w-full max-w-xs"
            />
          </div>
        </div>

        {/* Insights card — shown after analysis */}
        {insights ? (
          <div className="rounded-xl border border-amber-500/30 bg-zinc-900/80 p-6 space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">✅</span>
              <h2 className="font-semibold text-white">Week analyzed</h2>
            </div>

            {/* Key themes */}
            {insights.key_themes?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Key themes</p>
                <div className="flex flex-wrap gap-2">
                  {insights.key_themes.map((theme: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Wins */}
            {insights.wins?.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Wins</p>
                <ul className="space-y-1">
                  {insights.wins.map((win: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-200">
                      <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                      <span>{win}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Challenges */}
            {insights.challenges?.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Challenges</p>
                <ul className="space-y-1">
                  {insights.challenges.map((challenge: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-200">
                      <span className="text-yellow-400 mt-0.5 shrink-0">⚠</span>
                      <span>{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Content angles */}
            {insights.content_angles?.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Content angles</p>
                <ol className="space-y-1 list-decimal list-inside">
                  {insights.content_angles.map((angle: string, i: number) => (
                    <li key={i} className="text-sm text-zinc-200">{angle}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Platform selector */}
            <div className="space-y-2 pt-1">
              <p className="text-xs text-zinc-500 uppercase tracking-widest">Post to</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_OPTIONS.map((p) => {
                  const active = selectedPlatforms.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {generateError && (
              <p className="text-red-400 text-sm">{generateError}</p>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={generating || selectedPlatforms.length === 0}
              className="w-full py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm transition-colors"
            >
              {generating
                ? 'Generating 21 posts…'
                : '⚡ Generate 21 Posts → (75 SOMA credits)'}
            </button>
          </div>
        ) : (
          /* ── Input section ─────────────────────────────────────────────── */
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
            {/* Tab switcher */}
            <div className="flex border-b border-zinc-800">
              <button
                onClick={() => { setTab('form'); setIngestError('') }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === 'form'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                📝 Fill Form
              </button>
              <button
                onClick={() => { setTab('upload'); setIngestError('') }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === 'upload'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                📁 Upload File
              </button>
            </div>

            <div className="p-6 space-y-5">
              {tab === 'form' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-medium">What happened this week?</label>
                    <textarea
                      value={whatHappened}
                      onChange={(e) => setWhatHappened(e.target.value)}
                      rows={4}
                      placeholder="Shipped the new dashboard, had a rough morning but pushed through, got 3 new sign-ups…"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-medium">What are you working toward?</label>
                    <textarea
                      value={workingToward}
                      onChange={(e) => setWorkingToward(e.target.value)}
                      rows={3}
                      placeholder="Trying to hit 100 users by end of month, building the SOMA queue page…"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-medium">Wins or milestones?</label>
                    <textarea
                      value={wins}
                      onChange={(e) => setWins(e.target.value)}
                      rows={3}
                      placeholder="First paying customer, fixed the quota bug that was blocking posts…"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-medium">Challenges or lessons?</label>
                    <textarea
                      value={challenges}
                      onChange={(e) => setChallenges(e.target.value)}
                      rows={3}
                      placeholder="Burnout hit hard mid-week. Realized I need to batch tasks better…"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  {ingestError && (
                    <p className="text-red-400 text-sm">{ingestError}</p>
                  )}

                  <button
                    onClick={handleIngestForm}
                    disabled={ingesting}
                    className="w-full py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm transition-colors"
                  >
                    {ingesting ? 'Analyzing…' : 'Analyze My Week → (25 SOMA credits)'}
                  </button>
                </>
              ) : (
                <>
                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      dragging
                        ? 'border-amber-500 bg-amber-500/5'
                        : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.md"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handleFileSelect(f)
                      }}
                    />
                    {uploadedFile ? (
                      <div className="space-y-1">
                        <p className="text-amber-400 font-medium text-sm">{uploadedFile.name}</p>
                        <p className="text-zinc-500 text-xs">
                          {(uploadedFile.size / 1024).toFixed(1)} KB · click to change
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-4xl">📁</p>
                        <p className="text-zinc-300 text-sm font-medium">Drop your file here</p>
                        <p className="text-zinc-600 text-xs">or click to browse — .txt or .md only</p>
                      </div>
                    )}
                  </div>

                  {/* File preview */}
                  {filePreview && (
                    <div className="rounded-lg bg-zinc-800 border border-zinc-700 p-3 space-y-1">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest">Preview</p>
                      <p className="text-xs text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap">
                        {filePreview}
                        {uploadedFile && uploadedFile.size > 300 && (
                          <span className="text-zinc-600">…</span>
                        )}
                      </p>
                    </div>
                  )}

                  {ingestError && (
                    <p className="text-red-400 text-sm">{ingestError}</p>
                  )}

                  <button
                    onClick={handleIngestUpload}
                    disabled={ingesting || !uploadedFile}
                    className="w-full py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm transition-colors"
                  >
                    {ingesting ? 'Analyzing…' : 'Analyze This File → (25 SOMA credits)'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="text-center">
          <Link href="/soma/dashboard" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">
            ← Back to SOMA
          </Link>
        </div>

      </div>
    </div>
  )
}
