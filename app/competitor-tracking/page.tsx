'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useWorkspace } from '@/contexts/WorkspaceContext'

type Competitor = {
  id: string
  name: string
  platform: string
  handle: string
  notes: string
  created_at: string
  last_checked_at: string | null
}

type CompetitorPost = {
  id: string
  competitor_id: string
  platform: string
  post_url: string | null
  content: string
  posted_at: string | null
  fetched_at: string
  engagement: Record<string, number>
}

const PLATFORMS = [
  { id: 'bluesky',  name: 'Bluesky',  icon: '🦋' },
  { id: 'mastodon', name: 'Mastodon', icon: '🐘' },
  { id: 'discord',  name: 'Discord',  icon: '💬' },
  { id: 'telegram', name: 'Telegram', icon: '✈️' },
  { id: 'reddit',   name: 'Reddit',   icon: '🤖' },
  { id: 'youtube',  name: 'YouTube',  icon: '▶️' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
]

const MAX_COMPETITORS = 3

function formatEngagement(engagement: Record<string, number>): string {
  const parts: string[] = []
  if (engagement.likes   != null) parts.push(`❤️ ${engagement.likes}`)
  if (engagement.reposts != null) parts.push(`🔁 ${engagement.reposts}`)
  if (engagement.replies != null) parts.push(`💬 ${engagement.replies}`)
  if (engagement.views   != null) parts.push(`👁 ${engagement.views}`)
  if (engagement.upvotes != null) parts.push(`⬆️ ${engagement.upvotes}`)
  if (engagement.comments != null) parts.push(`💬 ${engagement.comments}`)
  return parts.slice(0, 3).join('  ')
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CompetitorTracking() {
  const router = useRouter()
  const { plan } = useWorkspace()
  const [loading, setLoading] = useState(true)
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [postsByCompetitor, setPostsByCompetitor] = useState<Record<string, CompetitorPost[]>>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [platform, setPlatform] = useState('bluesky')
  const [handle, setHandle] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: comps } = await supabase
        .from('competitor_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const competitorList = comps || []
      setCompetitors(competitorList)

      // Fetch recent posts for each competitor (last 3 per competitor)
      if (competitorList.length > 0) {
        const ids = competitorList.map(c => c.id)
        const { data: posts } = await supabase
          .from('competitor_posts')
          .select('*')
          .in('competitor_id', ids)
          .order('posted_at', { ascending: false })

        if (posts && posts.length > 0) {
          // Group by competitor_id, take latest 3 per competitor
          const grouped: Record<string, CompetitorPost[]> = {}
          for (const post of posts) {
            if (!grouped[post.competitor_id]) grouped[post.competitor_id] = []
            if (grouped[post.competitor_id].length < 3) {
              grouped[post.competitor_id].push(post)
            }
          }
          setPostsByCompetitor(grouped)
        }
      }

      setLoading(false)
    }
    load()
  }, [router])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleAdd = async () => {
    if (!name.trim() || !handle.trim()) { setError('Name and handle are required'); return }
    if (competitors.length >= MAX_COMPETITORS) { setError(`Limited to ${MAX_COMPETITORS} competitors`); return }
    setSaving(true)
    setError('')
    const { data, error: dbError } = await supabase
      .from('competitor_accounts')
      .insert({ user_id: userId, name, platform, handle, notes })
      .select()
      .single()
    if (dbError) { setError('Failed to save — try again'); setSaving(false); return }
    setCompetitors(prev => [data, ...prev])
    setName(''); setPlatform('bluesky'); setHandle(''); setNotes('')
    setShowForm(false)
    showToast('Competitor added — posts will be fetched tonight')
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await supabase.from('competitor_accounts').delete().eq('id', id)
    setCompetitors(prev => prev.filter(c => c.id !== id))
    const newPosts = { ...postsByCompetitor }
    delete newPosts[id]
    setPostsByCompetitor(newPosts)
    showToast('Removed')
    setDeleting(null)
  }

  const uniquePlatforms = Array.from(new Set(competitors.map(c => c.platform)))
  const slotsLeft = MAX_COMPETITORS - competitors.length

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-theme">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <main className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🔭</span>
                <h1 className="text-2xl font-extrabold tracking-tight">Competitor Tracking</h1>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">Track up to 3 competitor accounts across platforms — all tiers.</p>
            </div>
            {competitors.length < MAX_COMPETITORS && (
              <button onClick={() => setShowForm(!showForm)}
                className="px-4 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all">
                + Add Competitor
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-surface border border-theme rounded-2xl p-5 text-center">
              <p className="text-2xl font-extrabold">{competitors.length} / {MAX_COMPETITORS}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5">Tracked</p>
            </div>
            <div className="bg-surface border border-theme rounded-2xl p-5 text-center">
              <p className="text-2xl font-extrabold">{uniquePlatforms.length}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5">Platforms</p>
            </div>
            <div className="bg-surface border border-theme rounded-2xl p-5 text-center">
              <p className="text-2xl font-extrabold">{slotsLeft}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5">Slots left</p>
            </div>
          </div>

          {showForm && (
            <div className="bg-surface border border-theme rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-extrabold mb-4">Add Competitor</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Competitor Name</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Buffer, Hootsuite, a creator..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Platform</label>
                    <select value={platform} onChange={e => setPlatform(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all">
                      {PLATFORMS.map(p => (
                        <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Handle / URL</label>
                    <input value={handle} onChange={e => setHandle(e.target.value)}
                      placeholder="@handle or username"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Notes (optional)</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="What are you watching for?"
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-all resize-none" />
                </div>
                {error && <p className="text-xs text-red-500 font-semibold">❌ {error}</p>}
                <div className="flex gap-3">
                  <button onClick={() => { setShowForm(false); setError('') }}
                    className="px-5 py-2.5 border border-gray-200 text-xs font-bold rounded-xl hover:border-gray-400 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleAdd} disabled={saving}
                    className="flex-1 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                    {saving ? 'Saving...' : 'Add Competitor'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {competitors.length === 0 ? (
            <div className="bg-surface border border-theme rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3">🔭</div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">No competitors tracked yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Add up to 3 competitor accounts to keep tabs on what they're doing.</p>
              <button onClick={() => setShowForm(true)}
                className="text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                + Add your first competitor
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {competitors.map(c => {
                const p = PLATFORMS.find(pl => pl.id === c.platform)
                const recentPosts = postsByCompetitor[c.id] || []
                return (
                  <div key={c.id} className="bg-surface border border-theme rounded-2xl overflow-hidden">
                    {/* Competitor header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                            {p?.icon || '📱'}
                          </div>
                          <div>
                            <p className="text-sm font-extrabold">{c.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{p?.name} · {c.handle}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id}
                          className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors disabled:opacity-40">
                          {deleting === c.id ? '...' : 'Remove'}
                        </button>
                      </div>
                      {c.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{c.notes}</p>
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {c.last_checked_at
                            ? `Last checked ${formatDate(c.last_checked_at)}`
                            : `Added ${formatDate(c.created_at)} · Posts fetched nightly`}
                        </span>
                        <Link href="/sm-pulse" className="text-xs font-bold text-black hover:underline dark:text-white">
                          Scan with SM-Pulse →
                        </Link>
                      </div>
                    </div>

                    {/* Recent posts section */}
                    {recentPosts.length > 0 ? (
                      <div className="border-t border-gray-100 dark:border-gray-800">
                        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/40">
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recent Posts</p>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                          {recentPosts.map(post => (
                            <div key={post.id} className="px-5 py-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
                                    {post.content || '(no text content)'}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    {post.posted_at && (
                                      <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {formatDate(post.posted_at)}
                                      </span>
                                    )}
                                    {Object.keys(post.engagement || {}).length > 0 && (
                                      <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {formatEngagement(post.engagement)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {post.post_url && (
                                  <a
                                    href={post.post_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 text-xs font-bold text-black dark:text-white hover:underline"
                                  >
                                    View →
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 bg-gray-50 dark:bg-gray-900/20">
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                          🕐 Posts will appear here after the nightly fetch (runs daily at 7am UTC)
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
              {competitors.length >= MAX_COMPETITORS && (
                <div className="bg-theme border border-theme rounded-2xl p-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                    You've reached the {MAX_COMPETITORS}-competitor limit. Remove one to add another.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {toast && (
        <div style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }} className="fixed right-6 z-50 bg-black text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg">
          ✅ {toast}
        </div>
      )}
    </div>
  )
}
