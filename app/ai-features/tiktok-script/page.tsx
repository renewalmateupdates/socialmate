'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useWorkspace } from '@/contexts/WorkspaceContext'

type Script = {
  hook: string
  body: string[]
  cta: string
}

export default function TikTokScriptPage() {
  const router = useRouter()
  const { credits, applyCredits } = useWorkspace()
  const [loading, setLoading] = useState(true)

  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState<'15s' | '30s' | '60s'>('30s')
  const [tone, setTone] = useState('engaging')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [script, setScript] = useState<Script | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login?redirect=/ai-features/tiktok-script')
      else setLoading(false)
    })
  }, [router])

  async function generate() {
    setError('')
    if (!topic.trim()) { setError('Enter a topic first.'); return }
    if (credits < 5) { setError('Not enough credits. You need 5 credits.'); return }

    setGenerating(true)
    setScript(null)
    try {
      const res = await fetch('/api/ai/tiktok-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, duration, tone }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        if (data.error === 'rate_limited') {
          setError(data.message || "You're going too fast — wait 30 seconds and try again.")
        } else {
          setError(data.error || 'Something went wrong. Please try again.')
        }
        return
      }
      setScript(data.script)
      if (typeof data.monthlyRemaining === 'number') {
        applyCredits(data.monthlyRemaining, data.earnedRemaining ?? 0, data.paidRemaining ?? 0)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  function copyFull() {
    if (!script) return
    const full = `HOOK:\n${script.hook}\n\nMAIN CONTENT:\n${script.body.map(b => `• ${b}`).join('\n')}\n\nCTA:\n${script.cta}`
    copyText(full, 'full')
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-theme">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <main className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">

          <div className="flex items-center gap-3 mb-2">
            <Link href="/ai-features" className="text-xs text-gray-400 hover:text-gray-200 transition-colors">
              ← AI Features
            </Link>
          </div>

          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
                <span>🎵</span> TikTok Script Generator
              </h1>
              <p className="text-sm text-gray-400 mt-1">Generate a scroll-stopping hook, main content, and CTA for any TikTok video.</p>
            </div>
            <div className="text-right px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Credits</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{credits}</p>
            </div>
          </div>

          <div className="bg-surface border border-theme rounded-2xl p-6 mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  What is your video about?
                </label>
                <textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. 3 habits that changed my morning routine forever"
                  rows={3}
                  style={{ fontSize: '16px' }}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 resize-none transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    Duration
                  </label>
                  <div className="flex gap-2">
                    {(['15s', '30s', '60s'] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                          duration === d
                            ? 'bg-amber-400 text-black border-amber-400'
                            : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    Tone
                  </label>
                  <input
                    type="text"
                    value={tone}
                    onChange={e => setTone(e.target.value)}
                    placeholder="e.g. engaging, funny, educational"
                    style={{ fontSize: '16px' }}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 transition-colors text-sm"
                  />
                </div>
              </div>

              <button
                onClick={generate}
                disabled={generating || !topic.trim()}
                className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Generating script…
                  </>
                ) : (
                  <>🎵 Generate Script — 5 credits</>
                )}
              </button>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>
          </div>

          {script && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Your Script</p>
                <button
                  onClick={copyFull}
                  className="text-xs font-bold px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-80 transition-all"
                >
                  {copied === 'full' ? '✓ Copied!' : '📋 Copy Full Script'}
                </button>
              </div>

              <div className="bg-surface border border-theme rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎣</span>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">Hook</p>
                    <span className="text-xs text-gray-400 font-normal">— first 3 seconds</span>
                  </div>
                  <button
                    onClick={() => copyText(script.hook, 'hook')}
                    className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-300"
                  >
                    {copied === 'hook' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug">
                  &ldquo;{script.hook}&rdquo;
                </p>
              </div>

              <div className="bg-surface border border-theme rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">Main Content</p>
                    <span className="text-xs text-gray-400 font-normal">— {duration} video</span>
                  </div>
                  <button
                    onClick={() => copyText(script.body.map(b => `• ${b}`).join('\n'), 'body')}
                    className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-300"
                  >
                    {copied === 'body' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <ul className="flex flex-col gap-2">
                  {script.body.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-amber-500 font-bold mt-0.5 flex-shrink-0">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-surface border border-theme rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📢</span>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">CTA</p>
                    <span className="text-xs text-gray-400 font-normal">— closing call to action</span>
                  </div>
                  <button
                    onClick={() => copyText(script.cta, 'cta')}
                    className="text-xs font-bold px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-300"
                  >
                    {copied === 'cta' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {script.cta}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={generate}
                  disabled={generating}
                  className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold py-2.5 rounded-xl hover:border-amber-400 dark:hover:border-amber-500 transition-all disabled:opacity-40"
                >
                  🔄 Regenerate
                </button>
                <Link
                  href="/tiktok/studio"
                  className="flex-1 text-center bg-black dark:bg-white text-white dark:text-black text-sm font-bold py-2.5 rounded-xl hover:opacity-80 transition-all"
                >
                  🎵 Go to TikTok Studio →
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
