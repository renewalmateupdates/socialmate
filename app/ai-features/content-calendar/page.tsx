'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useWorkspace } from '@/contexts/WorkspaceContext'

type Tone = 'Educational' | 'Inspirational' | 'Entertaining' | 'Promotional' | 'Mixed'
type Goal = 'Grow followers' | 'Drive website traffic' | 'Build community' | 'Sell products' | 'Build authority'

const ALL_PLATFORMS = ['Bluesky', 'Discord', 'TikTok', 'LinkedIn', 'X / Twitter', 'Mastodon', 'Telegram']
const TONES: Tone[] = ['Educational', 'Inspirational', 'Entertaining', 'Promotional', 'Mixed']
const GOALS: Goal[] = ['Grow followers', 'Drive website traffic', 'Build community', 'Sell products', 'Build authority']

interface CalendarDay {
  day: number
  date_label: string
  theme: string
  post_idea: string
  caption_hook: string
  platforms: string[]
}

const THEME_COLORS: Record<string, string> = {
  Educational:     'bg-blue-50   text-blue-700   dark:bg-blue-900/30   dark:text-blue-300',
  Inspirational:   'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Entertaining:    'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  Promotional:     'bg-green-50  text-green-700  dark:bg-green-900/30  dark:text-green-300',
  'Behind the Scenes': 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Story:           'bg-pink-50   text-pink-700   dark:bg-pink-900/30   dark:text-pink-300',
  'How-To':        'bg-teal-50   text-teal-700   dark:bg-teal-900/30   dark:text-teal-300',
  'Question/Poll': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  Community:       'bg-rose-50   text-rose-700   dark:bg-rose-900/30   dark:text-rose-300',
  Milestone:       'bg-amber-50  text-amber-700  dark:bg-amber-900/30  dark:text-amber-300',
  'Hot Take':      'bg-red-50    text-red-700    dark:bg-red-900/30    dark:text-red-300',
  Tutorial:        'bg-cyan-50   text-cyan-700   dark:bg-cyan-900/30   dark:text-cyan-300',
  'Case Study':    'bg-lime-50   text-lime-700   dark:bg-lime-900/30   dark:text-lime-300',
  Personal:        'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
}

function themeColor(theme: string): string {
  return THEME_COLORS[theme] ?? 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
}

export default function ContentCalendarPage() {
  const router = useRouter()
  const { credits, applyCredits } = useWorkspace()
  const [loading, setLoading] = useState(true)

  const [niche, setNiche] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Bluesky', 'X / Twitter'])
  const [postsPerDay, setPostsPerDay] = useState(1)
  const [tone, setTone] = useState<Tone>('Mixed')
  const [goals, setGoals] = useState<Goal[]>(['Grow followers'])

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [calendar, setCalendar] = useState<CalendarDay[] | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login?redirect=/ai-features/content-calendar')
      else setLoading(false)
    })
  }, [router])

  function togglePlatform(p: string) {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  function toggleGoal(g: Goal) {
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  async function generate() {
    setError('')
    if (!niche.trim()) { setError('Enter your niche first.'); return }
    if (selectedPlatforms.length === 0) { setError('Select at least one platform.'); return }
    if (goals.length === 0) { setError('Select at least one goal.'); return }
    if (credits < 5) { setError('Not enough credits. You need 5 credits.'); return }

    setGenerating(true)
    setCalendar(null)
    try {
      const res = await fetch('/api/ai/content-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, platforms: selectedPlatforms, postsPerDay, tone, goals }),
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
      setCalendar(data.calendar)
      if (typeof data.monthlyRemaining === 'number') {
        applyCredits(data.monthlyRemaining, data.earnedRemaining ?? 0, data.paidRemaining ?? 0)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  function exportAsText() {
    if (!calendar) return
    const lines = calendar.map(d =>
      `${d.date_label} | ${d.theme}\nIdea: ${d.post_idea}\nHook: ${d.caption_hook}\nPlatforms: ${d.platforms.join(', ')}`
    )
    const text = lines.join('\n\n---\n\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
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
        <div className="max-w-4xl mx-auto">

          <div className="flex items-center gap-3 mb-2">
            <Link href="/ai-features" className="text-xs text-gray-400 hover:text-gray-200 transition-colors">
              ← AI Features
            </Link>
          </div>

          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
                <span>📅</span> Content Calendar AI
              </h1>
              <p className="text-sm text-gray-400 mt-1">Generate a complete 30-day content plan tailored to your niche and platforms.</p>
            </div>
            <div className="text-right px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Credits</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{credits}</p>
            </div>
          </div>

          <div className="bg-surface border border-theme rounded-2xl p-6 mb-6">
            <div className="flex flex-col gap-5">

              {/* Niche */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  What do you create content about?
                </label>
                <textarea
                  value={niche}
                  onChange={e => setNiche(e.target.value)}
                  placeholder="e.g. Solo founder journey, building a SaaS product in public, creator tools and productivity"
                  rows={2}
                  style={{ fontSize: '16px' }}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 resize-none transition-colors"
                />
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Platforms
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_PLATFORMS.map(p => (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`text-xs font-bold px-3.5 py-2 rounded-full border transition-all ${
                        selectedPlatforms.includes(p)
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Posts per day + Tone side by side */}
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Posts per day
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(n => (
                      <button
                        key={n}
                        onClick={() => setPostsPerDay(n)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                          postsPerDay === n
                            ? 'bg-amber-400 text-black border-amber-400'
                            : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500'
                        }`}
                      >
                        {n}×
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={e => setTone(e.target.value as Tone)}
                    style={{ fontSize: '16px' }}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 dark:focus:border-amber-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors"
                  >
                    {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Goals */}
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Goals
                </label>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map(g => (
                    <button
                      key={g}
                      onClick={() => toggleGoal(g)}
                      className={`text-xs font-bold px-3.5 py-2 rounded-full border transition-all ${
                        goals.includes(g)
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generate}
                disabled={generating || !niche.trim() || selectedPlatforms.length === 0}
                className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Building your 30-day calendar…
                  </>
                ) : (
                  <>📅 Generate 30-Day Calendar — 5 credits</>
                )}
              </button>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>
          </div>

          {calendar && calendar.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Your 30-Day Calendar <span className="font-normal text-gray-300">({calendar.length} days)</span>
                </p>
                <button
                  onClick={exportAsText}
                  className="text-xs font-bold px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-80 transition-all"
                >
                  {copied ? '✓ Copied!' : '📋 Export as Text'}
                </button>
              </div>

              {/* Table view */}
              <div className="bg-surface border border-theme rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        <th className="text-left text-xs font-extrabold text-gray-400 uppercase tracking-wide px-4 py-3 w-32">Day</th>
                        <th className="text-left text-xs font-extrabold text-gray-400 uppercase tracking-wide px-4 py-3 w-28">Theme</th>
                        <th className="text-left text-xs font-extrabold text-gray-400 uppercase tracking-wide px-4 py-3">Post Idea</th>
                        <th className="text-left text-xs font-extrabold text-gray-400 uppercase tracking-wide px-4 py-3">Hook</th>
                        <th className="text-left text-xs font-extrabold text-gray-400 uppercase tracking-wide px-4 py-3 w-40">Platforms</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calendar.map((day, idx) => (
                        <tr
                          key={day.day}
                          className={`border-b border-gray-50 dark:border-gray-800/60 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30 ${
                            idx % 7 === 6 ? 'border-b-2 border-gray-200 dark:border-gray-700' : ''
                          }`}
                        >
                          <td className="px-4 py-3 align-top">
                            <span className="text-xs font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">{day.date_label}</span>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${themeColor(day.theme)}`}>
                              {day.theme}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{day.post_idea}</p>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">&ldquo;{day.caption_hook}&rdquo;</p>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex flex-wrap gap-1">
                              {day.platforms.map(pl => (
                                <span key={pl} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                                  {pl}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                  href="/compose"
                  className="flex-1 text-center bg-black dark:bg-white text-white dark:text-black text-sm font-bold py-2.5 rounded-xl hover:opacity-80 transition-all"
                >
                  ✍️ Start composing →
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
