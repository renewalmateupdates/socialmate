'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { useWorkspace } from '@/contexts/WorkspaceContext'

const PLATFORMS = [
  { id: 'linkedin',  name: 'LinkedIn',  icon: '💼', limit: 3000 },
  { id: 'youtube',   name: 'YouTube',   icon: '▶️', limit: 5000 },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', limit: 500  },
  { id: 'bluesky',   name: 'Bluesky',   icon: '🦋', limit: 300  },
  { id: 'reddit',    name: 'Reddit',    icon: '🤖', limit: 40000},
  { id: 'discord',   name: 'Discord',   icon: '💬', limit: 2000 },
  { id: 'telegram',  name: 'Telegram',  icon: '✈️', limit: 4096 },
  { id: 'mastodon',  name: 'Mastodon',  icon: '🐘', limit: 500  },
]

const AI_TOOLS = [
  { id: 'caption',  label: 'Caption',   emoji: '✍️',  credits: 1, desc: 'Generate a caption from your topic' },
  { id: 'hashtags', label: 'Hashtags',  emoji: '#️⃣', credits: 1, desc: 'Generate relevant hashtags'         },
  { id: 'rewrite',  label: 'Rewrite',   emoji: '🔁',  credits: 1, desc: 'Rewrite your post to be punchier'   },
  { id: 'hook',     label: 'Hook',      emoji: '🎣',  credits: 2, desc: 'Generate 3 viral opening hooks'     },
]

export default function Compose() {
  const { credits, setCredits } = useWorkspace()

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin'])
  const [content, setContent] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [activeAiTool, setActiveAiTool] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [toast, setToast] = useState('')

  const activePlatform = PLATFORMS.find(p => selectedPlatforms[0] === p.id) || PLATFORMS[0]
  const charCount = content.length
  const charLimit = activePlatform.limit
  const charOver = charCount > charLimit

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleAiTool = async (tool: typeof AI_TOOLS[0]) => {
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
    setAiError('')
    setAiResult('')

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: tool.id,
          content,
          platform: activePlatform.name,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setAiError('Something went wrong. Please try again.')
        return
      }

      setAiResult(data.result)
      setCredits(credits - tool.credits)
      showToast(`Used ${tool.credits} credit${tool.credits > 1 ? 's' : ''} · ${credits - tool.credits} remaining`)
    } catch {
      setAiError('Network error. Please try again.')
    } finally {
      setAiLoading(false)
    }
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-5xl mx-auto">

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight">Compose</h1>
            <p className="text-sm text-gray-400 mt-0.5">Write, schedule, and publish your posts</p>
          </div>

          <div className="grid grid-cols-3 gap-6">

            {/* LEFT — COMPOSER */}
            <div className="col-span-2 space-y-4">

              {/* PLATFORM SELECTOR */}
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
                </div>
              </div>

              {/* TEXT AREA */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="What do you want to post? Write your content here, or use an AI tool to generate it..."
                  rows={8}
                  className="w-full text-sm outline-none resize-none text-gray-800 placeholder-gray-300"
                />
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-2">
                  <span className={`text-xs font-bold ${charOver ? 'text-red-500' : 'text-gray-400'}`}>
                    {charCount} / {charLimit.toLocaleString()}
                    {charOver && ' — over limit'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected</span>
                  </div>
                </div>
              </div>

              {/* AI TOOLS */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">AI Tools</p>
                  <span className="text-xs font-bold text-gray-500">{credits} credits remaining</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {AI_TOOLS.map(tool => (
                    <button key={tool.id}
                      onClick={() => handleAiTool(tool)}
                      disabled={aiLoading && activeAiTool === tool.id}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        activeAiTool === tool.id
                          ? 'bg-black text-white border-black'
                          : 'bg-white border-gray-200 hover:border-gray-400 text-gray-700'
                      }`}>
                      <div className="text-lg mb-1">{tool.emoji}</div>
                      <p className="text-xs font-bold">{tool.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{tool.credits} cr</p>
                    </button>
                  ))}
                </div>

                {/* AI ERROR */}
                {aiError && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
                    <p className="text-xs text-red-600">{aiError}</p>
                  </div>
                )}

                {/* AI LOADING */}
                {aiLoading && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Generating with Gemini...
                    </div>
                  </div>
                )}

                {/* AI RESULT */}
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

              {/* SCHEDULE */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Schedule</p>
                <div className="flex items-center gap-3">
                  <input type="date" value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-all" />
                  <input type="time" value={scheduleTime}
                    onChange={e => setScheduleTime(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-all" />
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => showToast('Post scheduled! ✓')}
                  disabled={!content.trim() || charOver}
                  className="flex-1 bg-black text-white text-sm font-bold py-3 rounded-xl hover:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  {scheduleDate ? 'Schedule Post' : 'Post Now'}
                </button>
                <button
                  onClick={() => showToast('Saved to drafts ✓')}
                  disabled={!content.trim()}
                  className="px-5 py-3 border border-gray-200 text-sm font-bold text-gray-600 rounded-xl hover:border-gray-400 transition-all disabled:opacity-40">
                  Save Draft
                </button>
              </div>
            </div>

            {/* RIGHT — PREVIEW */}
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
                {content && (
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{activePlatform.icon}</span>
                      <span className="text-xs font-bold text-gray-500">{activePlatform.name}</span>
                      <span className={`ml-auto text-xs font-bold ${charOver ? 'text-red-500' : 'text-gray-400'}`}>
                        {charCount}/{charLimit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-black text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}