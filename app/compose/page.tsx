'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import { useWorkspace, PLAN_CONFIG } from '@/contexts/WorkspaceContext'

const PLATFORMS = [
  { id: 'linkedin',  name: 'LinkedIn',  icon: '💼', limit: 3000  },
  { id: 'youtube',   name: 'YouTube',   icon: '▶️', limit: 5000  },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', limit: 500   },
  { id: 'bluesky',   name: 'Bluesky',   icon: '🦋', limit: 300   },
  { id: 'reddit',    name: 'Reddit',    icon: '🤖', limit: 40000 },
  { id: 'discord',   name: 'Discord',   icon: '💬', limit: 2000  },
  { id: 'telegram',  name: 'Telegram',  icon: '✈️', limit: 4096  },
  { id: 'mastodon',  name: 'Mastodon',  icon: '🐘', limit: 500   },
]

const COMING_SOON_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'twitter',   name: 'Twitter/X', icon: '🐦' },
  { id: 'tiktok',    name: 'TikTok',    icon: '🎵' },
  { id: 'facebook',  name: 'Facebook',  icon: '📘' },
  { id: 'threads',   name: 'Threads',   icon: '🧵' },
  { id: 'snapchat',  name: 'Snapchat',  icon: '👻' },
  { id: 'lemon8',    name: 'Lemon8',    icon: '🍋' },
  { id: 'bereal',    name: 'BeReal',    icon: '📷' },
]

const AI_TOOLS = [
  { id: 'caption',   label: 'Caption',   emoji: '✍️',  credits: 3, desc: 'Generate a caption from your topic'     },
  { id: 'hashtags',  label: 'Hashtags',  emoji: '#️⃣', credits: 2, desc: 'Generate relevant hashtags'             },
  { id: 'rewrite',   label: 'Rewrite',   emoji: '🔁',  credits: 3, desc: 'Rewrite your post to be punchier'       },
  { id: 'hook',      label: 'Hook',      emoji: '🎣',  credits: 4, desc: 'Generate 3 viral opening hooks'         },
  { id: 'thread',    label: 'Thread',    emoji: '🧵',  credits: 8, desc: 'Turn your idea into a full thread'      },
  { id: 'repurpose', label: 'Repurpose', emoji: '♻️',  credits: 8, desc: 'Reshape long content for this platform' },
]

const SCORE_CREDIT_COST = 2

const STARTER_TEMPLATES = [
  {
    id: 'starter-1',
    platforms: ['instagram', 'linkedin', 'facebook', 'bluesky'],
    content: `🚀 Introducing [product/service name]!\n\n[One sentence describing what it does and who it's for.]\n\nHere's what makes it different:\n✅ [Benefit 1]\n✅ [Benefit 2]\n✅ [Benefit 3]\n\n[Call to action — link in bio / comment below / DM us]`,
  },
  {
    id: 'starter-2',
    platforms: ['linkedin', 'instagram', 'tiktok', 'bluesky'],
    content: `💡 [Topic] tip that changed everything for me:\n\n[Tip in one clear sentence.]\n\nHere's how to do it:\n1️⃣ [Step 1]\n2️⃣ [Step 2]\n3️⃣ [Step 3]\n\nSave this for later and share with someone who needs it! 👇`,
  },
  {
    id: 'starter-3',
    platforms: ['instagram', 'facebook', 'bluesky', 'reddit'],
    content: `[Relatable observation or bold statement about your niche.] 🤔\n\nI used to think [common misconception], but now I know [what you actually believe].\n\nWhat do you think — am I wrong?\n\nDrop your take below 👇`,
  },
  {
    id: 'starter-4',
    platforms: ['instagram', 'tiktok', 'facebook'],
    content: `A little behind the scenes of [what you're working on] 👀\n\n[Short honest description of what your day/process looks like.]\n\nThe part nobody tells you about [your field/work]:\n[Honest, unexpected insight]\n\nAnything you want to know more about? Ask me below 👇`,
  },
  {
    id: 'starter-5',
    platforms: ['linkedin', 'bluesky', 'mastodon'],
    content: `This week in [your niche] 📰\n\n→ [Thing 1 that happened or that you learned]\n→ [Thing 2]\n→ [Thing 3]\n\nMy take: [One sentence opinion or insight]\n\nFollowing along? Subscribe so you don't miss next week's. 🔔`,
  },
]

type PublishResult = {
  platform: string
  success: boolean
  postId?: string
  error?: string
}

type ScoreResult = {
  score: number
  label: string
  strengths: string[]
  improvements: string[]
  verdict: string
}

function ComposeInner() {
  const searchParams = useSearchParams()
  const { credits, setCredits, plan } = useWorkspace()

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin'])
  const [content, setContent] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [activeAiTool, setActiveAiTool] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [templateBanner, setTemplateBanner] = useState<string | null>(null)
  const [scheduleError, setScheduleError] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [publishResults, setPublishResults] = useState<PublishResult[] | null>(null)
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null)
  const [scoring, setScoring] = useState(false)
  const [scoreError, setScoreError] = useState('')

  const planConfig = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
  const maxScheduleDate = (() => {
    const d = new Date()
    d.setDate(d.getDate() + (planConfig.scheduleWeeks * 7))
    return d.toISOString().split('T')[0]
  })()

  const scheduleHorizonLabel =
    plan === 'free'   ? '2 weeks' :
    plan === 'pro'    ? '1 month' :
    '3 months'

  useEffect(() => {
    const templateId = searchParams.get('template')
    const starterTemplateId = searchParams.get('starterTemplate')

    if (starterTemplateId) {
      const starter = STARTER_TEMPLATES.find(t => t.id === starterTemplateId)
      if (starter) {
        setContent(starter.content)
        const validPlatforms = starter.platforms.filter(p => PLATFORMS.some(pl => pl.id === p))
        if (validPlatforms.length > 0) setSelectedPlatforms(validPlatforms)
        setTemplateBanner('Starter template loaded — replace the [bracketed] sections with your content.')
      }
    } else if (templateId) {
      const loadTemplate = async () => {
        const { data } = await supabase
          .from('post_templates')
          .select('*')
          .eq('id', templateId)
          .single()
        if (data) {
          setContent(data.content)
          if (data.platforms && data.platforms.length > 0) {
            const validPlatforms = data.platforms.filter((p: string) => PLATFORMS.some(pl => pl.id === p))
            if (validPlatforms.length > 0) setSelectedPlatforms(validPlatforms)
          }
          setTemplateBanner(`Template "${data.title}" loaded.`)
        }
      }
      loadTemplate()
    }
  }, [searchParams])

  const activePlatform = selectedPlatforms.length > 0
    ? (PLATFORMS.find(p => selectedPlatforms[0] === p.id) || PLATFORMS[0])
    : null

  const charCount = content.length
  const charLimit = activePlatform?.limit ?? null
  const charOver = charLimit !== null && charCount > charLimit

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleDateChange = (val: string) => {
    setScheduleError('')
    if (val && val > maxScheduleDate) {
      setScheduleError(
        `Your ${plan} plan can only schedule up to ${scheduleHorizonLabel} in advance. Upgrade to schedule further out.`
      )
      return
    }
    setScheduleDate(val)
  }

  const handleAiTool = async (tool: typeof AI_TOOLS[0]) => {
    setAiError('')
    if (!content.trim()) {
      setAiError('Write something first — the AI needs your content or topic to work with.')
      return
    }
    if (credits < tool.credits) {
      setAiError(`Not enough credits. This tool costs ${tool.credits} credit${tool.credits > 1 ? 's' : ''} and you have ${credits} remaining.`)
      return
    }
    setActiveAiTool(tool.id)
    setAiLoading(true)
    setAiResult('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: tool.id,
          content,
          platform: activePlatform?.name || 'general',
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setAiError('Something went wrong. Please try again.')
        return
      }
      setAiResult(data.result)
      setCredits(credits - tool.credits)
      showToast(`Used ${tool.credits} credit${tool.credits > 1 ? 's' : ''} · ${credits - tool.credits} remaining`, 'info')
    } catch {
      setAiError('Network error. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleScorePost = async () => {
    if (!content.trim()) { setScoreError('Write some content first before scoring.'); return }
    if (credits < SCORE_CREDIT_COST) { setScoreError(`You need ${SCORE_CREDIT_COST} credits to score a post.`); return }
    setScoring(true)
    setScoreError('')
    setScoreResult(null)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'score',
          content,
          platform: activePlatform?.name || 'general',
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setScoreError('Scoring failed. Please try again.'); setScoring(false); return }

      try {
        const raw = data.result
        const scoreMatch = raw.match(/SCORE:\s*(\d+)/i)
        const strengthsMatch = raw.match(/STRENGTHS:([\s\S]*?)(?:IMPROVEMENTS:|$)/i)
        const improvementsMatch = raw.match(/IMPROVEMENTS:([\s\S]*?)(?:VERDICT:|$)/i)
        const verdictMatch = raw.match(/VERDICT:([\s\S]*?)$/i)

        const score = scoreMatch ? parseInt(scoreMatch[1]) : 50
        const label = score >= 80 ? 'Great' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work'
        const strengths = strengthsMatch
          ? strengthsMatch[1].trim().split('\n').filter(Boolean).map((s: string) => s.replace(/^[-•*]\s*/, ''))
          : []
        const improvements = improvementsMatch
          ? improvementsMatch[1].trim().split('\n').filter(Boolean).map((s: string) => s.replace(/^[-•*]\s*/, ''))
          : []
        const verdict = verdictMatch ? verdictMatch[1].trim() : raw

        setScoreResult({ score, label, strengths, improvements, verdict })
      } catch {
        setScoreResult({ score: 0, label: 'Unknown', strengths: [], improvements: [], verdict: data.result })
      }

      setCredits(credits - SCORE_CREDIT_COST)
    } catch {
      setScoreError('Network error. Please try again.')
    }
    setScoring(false)
  }

  const handleInsertResult = () => {
    if (!aiResult) return
    setContent(prev => prev ? `${prev}\n\n${aiResult}` : aiResult)
    setAiResult('')
    setActiveAiTool(null)
    showToast('Inserted into post ✓')
  }

  const handleReplaceWithResult = () => {
    if (!aiResult) return
    setContent(aiResult)
    setAiResult('')
    setActiveAiTool(null)
    showToast('Post replaced ✓')
  }

  const handlePublish = async () => {
    if (!content.trim() || charOver || selectedPlatforms.length === 0 || !!scheduleError) return
    setPublishing(true)
    setPublishResults(null)

    try {
      let scheduledAt: string | undefined
      if (scheduleDate) {
        const time = scheduleTime || '09:00'
        scheduledAt = new Date(`${scheduleDate}T${time}`).toISOString()
      }

      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, platforms: selectedPlatforms, scheduledAt }),
      })

      const data = await res.json()

      if (!res.ok) {
        showToast(data.error || 'Something went wrong', 'error')
        return
      }

      if (scheduledAt) {
        showToast('Post scheduled successfully! ✓')
        setContent('')
        setScheduleDate('')
        setScheduleTime('')
        setCurrentDraftId(null)
        setScoreResult(null)
      } else {
        setPublishResults(data.results || [])
        const allFailed = data.results?.every((r: PublishResult) => !r.success)
        const someFailed = data.results?.some((r: PublishResult) => !r.success)
        if (allFailed) showToast('Failed to publish to all platforms', 'error')
        else if (someFailed) showToast('Published to some platforms — check results below', 'info')
        else {
          showToast('Published successfully! ✓')
          setContent('')
          setCurrentDraftId(null)
          setScoreResult(null)
        }
      }
    } catch {
      showToast('Network error. Please try again.', 'error')
    } finally {
      setPublishing(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/posts/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, platforms: selectedPlatforms, postId: currentDraftId }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Failed to save draft', 'error'); return }
      setCurrentDraftId(data.postId)
      showToast('Saved to drafts ✓')
    } catch {
      showToast('Network error. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const scoreColor = scoreResult
    ? scoreResult.score >= 80 ? 'text-green-600' : scoreResult.score >= 60 ? 'text-blue-600' : scoreResult.score >= 40 ? 'text-yellow-600' : 'text-red-500'
    : ''

  const scoreBg = scoreResult
    ? scoreResult.score >= 80 ? 'bg-green-50 border-green-100' : scoreResult.score >= 60 ? 'bg-blue-50 border-blue-100' : scoreResult.score >= 40 ? 'bg-yellow-50 border-yellow-100' : 'bg-red-50 border-red-100'
    : ''

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-5xl mx-auto">

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight">Compose</h1>
            <p className="text-sm text-gray-400 mt-0.5">Write, schedule, and publish your posts</p>
          </div>

          {templateBanner && (
            <div className="mb-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-blue-700">📋 {templateBanner}</p>
              <button onClick={() => setTemplateBanner(null)} className="text-xs text-blue-400 hover:text-blue-700 ml-4 font-bold">✕</button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">

              <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p.id} onClick={() => togglePlatform(p.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        selectedPlatforms.includes(p.id)
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                      }`}>
                      <span>{p.icon}</span>{p.name}
                    </button>
                  ))}
                  {COMING_SOON_PLATFORMS.map(p => (
                    <div key={p.id} title={`${p.name} — coming soon`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-dashed border-gray-200 text-gray-300 cursor-not-allowed select-none">
                      <span>{p.icon}</span>
                      <span>{p.name}</span>
                      <span className="text-xs font-normal text-gray-300 ml-0.5">· Soon</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPlatforms.length === 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-amber-700">Select at least one platform to compose a post.</p>
                </div>
              )}

              <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <textarea
                  value={content}
                  onChange={e => { setContent(e.target.value); setScoreResult(null) }}
                  placeholder="What do you want to post? Write your content here, or use an AI tool to generate it..."
                  rows={8}
                  className="w-full text-sm outline-none resize-none text-gray-800 placeholder-gray-300"
                />
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-2">
                  {charLimit !== null ? (
                    <span className={`text-xs font-bold ${charOver ? 'text-red-500' : 'text-gray-400'}`}>
                      {charCount} / {charLimit.toLocaleString()}
                      {charOver && ' — over limit'}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">Select a platform to see character limit</span>
                  )}
                  <span className="text-xs text-gray-400">
                    {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">AI Tools</p>
                  <span className="text-xs font-bold text-gray-500">{credits} credits remaining</span>
                </div>
                <div className="grid grid-cols-6 gap-2 mb-4">
                  {AI_TOOLS.map(tool => (
                    <button key={tool.id}
                      onClick={() => handleAiTool(tool)}
                      disabled={aiLoading}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        activeAiTool === tool.id
                          ? 'bg-black text-white border-black'
                          : aiLoading
                          ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                          : 'bg-white border-gray-200 hover:border-gray-400 text-gray-700'
                      }`}>
                      <div className="text-lg mb-1">{tool.emoji}</div>
                      <p className="text-xs font-bold">{tool.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{tool.credits} cr</p>
                    </button>
                  ))}
                </div>

                {aiError && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
                    <p className="text-xs text-red-600">{aiError}</p>
                  </div>
                )}

                {aiLoading && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Generating with Gemini...
                    </div>
                  </div>
                )}

                {aiResult && !aiLoading && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Result</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">{aiResult}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={handleInsertResult}
                        className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-lg hover:opacity-80 transition-all">
                        Insert below
                      </button>
                      <button onClick={handleReplaceWithResult}
                        className="text-xs font-bold px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:border-gray-500 transition-all">
                        Replace post
                      </button>
                      <button onClick={() => { setAiResult(''); setActiveAiTool(null) }}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-all ml-auto">
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Post Score</p>
                    <p className="text-xs text-gray-400 mt-0.5">AI predicts how your post will perform before you publish</p>
                  </div>
                  <button
                    onClick={handleScorePost}
                    disabled={scoring || !content.trim() || credits < SCORE_CREDIT_COST}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    {scoring ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Scoring...
                      </>
                    ) : (
                      `⚡ Score Post — ${SCORE_CREDIT_COST} cr`
                    )}
                  </button>
                </div>

                {scoreError && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                    <p className="text-xs text-red-600">{scoreError}</p>
                  </div>
                )}

                {scoreResult && (
                  <div className={`border rounded-xl p-4 ${scoreBg}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-center">
                        <p className={`text-4xl font-extrabold ${scoreColor}`}>{scoreResult.score}</p>
                        <p className={`text-xs font-bold ${scoreColor}`}>{scoreResult.label}</p>
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-white/60 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all ${
                              scoreResult.score >= 80 ? 'bg-green-500' :
                              scoreResult.score >= 60 ? 'bg-blue-500' :
                              scoreResult.score >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${scoreResult.score}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{scoreResult.verdict}</p>
                      </div>
                    </div>
                    {scoreResult.strengths.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-bold text-gray-600 mb-1.5">✅ Strengths</p>
                        <ul className="space-y-1">
                          {scoreResult.strengths.slice(0, 3).map((s, i) => (
                            <li key={i} className="text-xs text-gray-600">• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {scoreResult.improvements.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-600 mb-1.5">💡 Improvements</p>
                        <ul className="space-y-1">
                          {scoreResult.improvements.slice(0, 3).map((s, i) => (
                            <li key={i} className="text-xs text-gray-600">• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {!scoreResult && !scoreError && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400">Write your post and hit Score Post to get an AI prediction of how it will perform.</p>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Schedule</p>
                  <span className="text-xs text-gray-400">
                    {plan === 'free'   && '⏳ Free — up to 2 weeks ahead'}
                    {plan === 'pro'    && '⏳ Pro — up to 1 month ahead'}
                    {plan === 'agency' && '⏳ Agency — up to 3 months ahead'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="date" value={scheduleDate}
                    min={new Date().toISOString().split('T')[0]}
                    max={maxScheduleDate}
                    onChange={e => handleDateChange(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-all" />
                  <input type="time" value={scheduleTime}
                    onChange={e => setScheduleTime(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-all" />
                </div>
                {scheduleError && (
                  <div className="mt-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-amber-700">{scheduleError}</p>
                    <a href="/pricing" className="text-xs font-bold text-black whitespace-nowrap hover:underline">Upgrade →</a>
                  </div>
                )}
              </div>

              {publishResults && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Publish Results</p>
                  <div className="space-y-2">
                    {publishResults.map(result => (
                      <div key={result.platform} className={`flex items-center gap-3 p-3 rounded-xl border ${
                        result.success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                      }`}>
                        <span className="text-lg">{PLATFORMS.find(p => p.id === result.platform)?.icon || '📱'}</span>
                        <div className="flex-1">
                          <p className="text-xs font-bold">{PLATFORMS.find(p => p.id === result.platform)?.name || result.platform}</p>
                          {result.error && <p className="text-xs text-red-500 mt-0.5">{result.error}</p>}
                        </div>
                        <span className={`text-xs font-bold ${result.success ? 'text-green-600' : 'text-red-500'}`}>
                          {result.success ? '✓ Published' : '✗ Failed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePublish}
                  disabled={publishing || !content.trim() || charOver || selectedPlatforms.length === 0 || !!scheduleError}
                  className="flex-1 bg-black text-white text-sm font-bold py-3 rounded-xl hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  {publishing
                    ? (scheduleDate ? 'Scheduling...' : 'Publishing...')
                    : (scheduleDate ? 'Schedule Post' : 'Post Now')}
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={saving || !content.trim()}
                  className="px-5 py-3 border border-gray-200 text-sm font-bold text-gray-600 rounded-xl hover:border-gray-400 transition-all disabled:opacity-40">
                  {saving ? 'Saving...' : currentDraftId ? 'Update Draft' : 'Save Draft'}
                </button>
              </div>

            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-4 sticky top-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Preview</p>
                <div className="bg-gray-50 rounded-xl p-4 min-h-32">
                  {content ? (
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
                  ) : (
                    <p className="text-xs text-gray-300 text-center mt-8">Your post preview appears here</p>
                  )}
                </div>
                {content && selectedPlatforms.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
                    {selectedPlatforms.map(id => {
                      const p = PLATFORMS.find(pl => pl.id === id)
                      if (!p) return null
                      const over = charCount > p.limit
                      return (
                        <div key={id} className="flex items-center gap-2">
                          <span className="text-sm">{p.icon}</span>
                          <span className="text-xs font-bold text-gray-500">{p.name}</span>
                          <span className={`ml-auto text-xs font-bold ${over ? 'text-red-500' : 'text-gray-400'}`}>
                            {charCount}/{p.limit.toLocaleString()}
                            {over && ' ⚠️'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg z-50 ${
          toast.type === 'error' ? 'bg-red-500' :
          toast.type === 'info'  ? 'bg-blue-600' :
          'bg-black'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default function Compose() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    }>
      <ComposeInner />
    </Suspense>
  )
}
