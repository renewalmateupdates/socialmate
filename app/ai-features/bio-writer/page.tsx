'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useWorkspace } from '@/contexts/WorkspaceContext'

type Platform = 'twitter' | 'linkedin' | 'instagram' | 'tiktok' | 'bluesky' | 'general'
type Tone = 'Professional' | 'Casual' | 'Bold' | 'Playful' | 'Authentic'

const PLATFORMS: { id: Platform; label: string; emoji: string; limit: number }[] = [
  { id: 'twitter',   label: 'X / Twitter', emoji: '𝕏',  limit: 160  },
  { id: 'linkedin',  label: 'LinkedIn',    emoji: '💼', limit: 2600 },
  { id: 'instagram', label: 'Instagram',   emoji: '📸', limit: 150  },
  { id: 'tiktok',    label: 'TikTok',      emoji: '🎵', limit: 80   },
  { id: 'bluesky',   label: 'Bluesky',     emoji: '🦋', limit: 256  },
  { id: 'general',   label: 'General',     emoji: '✍️', limit: 500  },
]

const TONES: Tone[] = ['Professional', 'Casual', 'Bold', 'Playful', 'Authentic']

export default function BioWriterPage() {
  const router = useRouter()
  const { credits, applyCredits } = useWorkspace()
  const [loading, setLoading] = useState(true)

  const [platform, setPlatform] = useState<Platform>('twitter')
  const [name, setName] = useState('')
  const [niche, setNiche] = useState('')
  const [tone, setTone] = useState<Tone>('Authentic')
  const [keywords, setKeywords] = useState('')

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [bio, setBio] = useState<string | null>(null)
  const [charCount, setCharCount] = useState(0)
  const [copied, setCopied] = useState(false)

  const currentPlatform = PLATFORMS.find(p => p.id === platform)!

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login?redirect=/ai-features/bio-writer')
      else setLoading(false)
    })
  }, [router])

  async function generate() {
    setError('')
    if (!name.trim()) { setError('Enter your name first.'); return }
    if (!niche.trim()) { setError('Describe what you do.'); return }
    if (credits < 5) { setError('Not enough credits. You need 5 credits.'); return }

    setGenerating(true)
    setBio(null)
    try {
      const res = await fetch('/api/ai/bio-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, name, niche, tone, keywords }),
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
      setBio(data.bio)
      setCharCount(data.charCount)
      if (typeof data.monthlyRemaining === 'number') {
        applyCredits(data.monthlyRemaining, data.earnedRemaining ?? 0, data.paidRemaining ?? 0)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  function copyBio() {
    if (!bio) return
    navigator.clipboard.writeText(bio).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const limitColor =
    charCount > currentPlatform.limit
      ? 'text-red-500'
      : charCount > currentPlatform.limit * 0.9
      ? 'text-amber-500'
      : 'text-green-500'

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
                <span>✍️</span> Bio Writer
              </h1>
              <p className="text-sm text-gray-400 mt-1">Generate a platform-optimized bio that makes people click Follow.</p>
            </div>
            <div className="text-right px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Credits</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{credits}</p>
            </div>
          </div>

          <div className="bg-surface border border-theme rounded-2xl p-6 mb-6">
            <div className="flex flex-col gap-5">

              {/* Platform selector */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORMS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`flex items-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-bold transition-all ${
                        platform === p.id
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500'
                      }`}
                    >
                      <span>{p.emoji}</span>
                      <span className="truncate">{p.label}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  Character limit: <span className="font-bold">{currentPlatform.limit.toLocaleString()}</span>
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Your name / brand name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Joshua Bostic"
                  style={{ fontSize: '16px' }}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 transition-colors"
                />
              </div>

              {/* Niche */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  What do you do / create content about?
                </label>
                <textarea
                  value={niche}
                  onChange={e => setNiche(e.target.value)}
                  placeholder="e.g. Solo founder building a social media scheduling tool. I help creators grow without the burnout."
                  rows={2}
                  style={{ fontSize: '16px' }}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 resize-none transition-colors"
                />
              </div>

              {/* Tone */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Tone
                </label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map(t => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`text-xs font-bold px-3.5 py-2 rounded-full border transition-all ${
                        tone === t
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keywords (optional) */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Keywords to include <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
                  placeholder="e.g. SaaS, bootstrapped, creator tools"
                  style={{ fontSize: '16px' }}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 transition-colors"
                />
              </div>

              <button
                onClick={generate}
                disabled={generating || !name.trim() || !niche.trim()}
                className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Writing your bio…
                  </>
                ) : (
                  <>✍️ Generate Bio — 5 credits</>
                )}
              </button>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>
          </div>

          {bio && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Your Bio</p>
                <button
                  onClick={copyBio}
                  className="text-xs font-bold px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-80 transition-all"
                >
                  {copied ? '✓ Copied!' : '📋 Copy Bio'}
                </button>
              </div>

              <div className="bg-surface border border-theme rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{currentPlatform.emoji}</span>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{currentPlatform.label} Bio</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${limitColor} border-current`}>
                    {charCount} / {currentPlatform.limit}
                  </span>
                </div>
                <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {bio}
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
                  href="/ai-features/profile-optimizer"
                  className="flex-1 text-center bg-black dark:bg-white text-white dark:text-black text-sm font-bold py-2.5 rounded-xl hover:opacity-80 transition-all"
                >
                  🔍 Optimize it →
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
