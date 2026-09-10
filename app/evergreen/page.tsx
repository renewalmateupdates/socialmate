'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { ArrowUpDown, FileEdit, Heart, Inbox, MessageCircle, Recycle, Repeat2, RefreshCw } from 'lucide-react'

type BlueskyStats = { likes: number; reposts: number; replies: number; fetched_at: string } | null
type MastodonStats = { favourites_count: number; reblogs_count: number; replies_count: number; fetched_at: string } | null
// Auto-populated by the fetchPostAnalytics Inngest function 1h/24h after publish —
// a second, separate engagement snapshot from the manually-triggered bluesky_stats/
// mastodon_stats sync. Both are read here so a post shows real numbers whether or
// not the user ever clicked "Sync" on /analytics.
type AutoAnalytics = {
  bluesky?:  { likes: number; replies: number; reposts: number }
  mastodon?: { likes: number; replies: number; reposts: number }
} | null

type Post = {
  id: string
  content: string
  platforms: string[]
  published_at: string
  evergreen: boolean
  bluesky_stats: BlueskyStats
  mastodon_stats: MastodonStats
  analytics: AutoAnalytics
}

function engagementOf(post: Post): { likes: number; reposts: number; replies: number; hasData: boolean } {
  let likes = 0, reposts = 0, replies = 0, hasData = false

  const bsky = post.bluesky_stats
    ? { likes: post.bluesky_stats.likes ?? 0, reposts: post.bluesky_stats.reposts ?? 0, replies: post.bluesky_stats.replies ?? 0 }
    : post.analytics?.bluesky
      ? { likes: post.analytics.bluesky.likes ?? 0, reposts: post.analytics.bluesky.reposts ?? 0, replies: post.analytics.bluesky.replies ?? 0 }
      : null
  if (bsky) { hasData = true; likes += bsky.likes; reposts += bsky.reposts; replies += bsky.replies }

  const masto = post.mastodon_stats
    ? { likes: post.mastodon_stats.favourites_count ?? 0, reposts: post.mastodon_stats.reblogs_count ?? 0, replies: post.mastodon_stats.replies_count ?? 0 }
    : post.analytics?.mastodon
      ? { likes: post.analytics.mastodon.likes ?? 0, reposts: post.analytics.mastodon.reposts ?? 0, replies: post.analytics.mastodon.replies ?? 0 }
      : null
  if (masto) { hasData = true; likes += masto.likes; reposts += masto.reposts; replies += masto.replies }

  return { likes, reposts, replies, hasData }
}

function EngagementBadge({ post }: { post: Post }) {
  const { likes, reposts, replies, hasData } = engagementOf(post)
  if (!hasData) {
    return <span className="text-xs text-gray-400 dark:text-gray-600 italic">No engagement data yet</span>
  }
  return (
    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-semibold">
      <span className="inline-flex items-center gap-1"><Heart size={11} strokeWidth={2} /> {likes}</span>
      <span className="inline-flex items-center gap-1"><Repeat2 size={11} strokeWidth={2} /> {reposts}</span>
      <span className="inline-flex items-center gap-1"><MessageCircle size={11} strokeWidth={2} /> {replies}</span>
    </div>
  )
}

export default function EvergreenPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'engagement'>('newest')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('posts')
        .select('id, content, platforms, published_at, evergreen, bluesky_stats, mastodon_stats, analytics')
        .eq('user_id', user.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50)

      setPosts(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const toggleEvergreen = async (post: Post) => {
    setToggling(post.id)
    const newVal = !post.evergreen
    await supabase.from('posts').update({ evergreen: newVal }).eq('id', post.id)
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, evergreen: newVal } : p))
    showToast(newVal ? 'Added to evergreen queue' : 'Removed from evergreen queue')
    setToggling(null)
  }

  const totalEngagement = (p: Post) => {
    const e = engagementOf(p)
    return e.likes + e.reposts + e.replies
  }
  const sortPosts = (list: Post[]) =>
    sortBy === 'engagement'
      ? [...list].sort((a, b) => totalEngagement(b) - totalEngagement(a))
      : list

  const evergreenPosts = sortPosts(posts.filter(p => p.evergreen))
  const regularPosts = sortPosts(posts.filter(p => !p.evergreen))

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-theme">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-amber-500" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <main className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Recycle className="w-6 h-6 text-gray-400" strokeWidth={1.75} />
              <h1 className="text-2xl font-extrabold tracking-tight">Evergreen Recycling</h1>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">Mark your best posts as evergreen and they'll automatically re-queue when your schedule is empty.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Published posts',  value: posts.length,          icon: FileEdit },
              { label: 'Evergreen posts',  value: evergreenPosts.length, icon: Recycle },
              { label: 'Auto-requeue',     value: evergreenPosts.length > 0 ? 'Active' : 'No posts', icon: RefreshCw },
            ].map(stat => (
              <div key={stat.label} className="bg-surface border border-theme rounded-2xl p-5 text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-1 text-gray-400" strokeWidth={1.75} />
                <p className="text-2xl font-extrabold">{stat.value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {evergreenPosts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-extrabold mb-4 flex items-center gap-1.5"><Recycle className="w-4 h-4" strokeWidth={2} /> Evergreen Queue ({evergreenPosts.length})</h2>
              <div className="space-y-3">
                {evergreenPosts.map(post => (
                  <div key={post.id} className="bg-white dark:bg-gray-900 border-2 border-black dark:border-white rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {post.platforms?.slice(0, 3).map(p => (
                            <span key={p} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-semibold">{p}</span>
                          ))}
                        </div>
                        <div className="mt-2">
                          <EngagementBadge post={post} />
                        </div>
                      </div>
                      <button
                        onClick={() => toggleEvergreen(post)}
                        disabled={toggling === post.id}
                        className="flex-shrink-0 text-xs font-bold px-3 py-1.5 border border-red-200 dark:border-red-900 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-all disabled:opacity-40">
                        {toggling === post.id ? '...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-sm font-extrabold flex items-center gap-1.5"><FileEdit className="w-4 h-4" strokeWidth={2} /> Published Posts — mark as evergreen</h2>
              <button
                onClick={() => setSortBy(s => s === 'newest' ? 'engagement' : 'newest')}
                className="text-xs font-bold px-3 py-1.5 border border-theme rounded-xl text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-all inline-flex items-center gap-1.5">
                <ArrowUpDown size={12} strokeWidth={2} />
                Sort: {sortBy === 'newest' ? 'Newest' : 'Most engaged'}
              </button>
            </div>
            {regularPosts.length === 0 ? (
              <div className="bg-surface border border-theme rounded-2xl p-10 text-center">
                <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">No published posts yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Publish some posts first, then come back to mark your best ones as evergreen.</p>
                <Link href="/compose" className="text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                  Compose a post →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {regularPosts.map(post => (
                  <div key={post.id} className="bg-surface border border-theme rounded-2xl p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {post.platforms?.slice(0, 3).map(p => (
                            <span key={p} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-semibold">{p}</span>
                          ))}
                        </div>
                        <div className="mt-2">
                          <EngagementBadge post={post} />
                        </div>
                      </div>
                      <button
                        onClick={() => toggleEvergreen(post)}
                        disabled={toggling === post.id}
                        className="flex-shrink-0 text-xs font-bold px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                        {toggling === post.id ? '...' : <span className="inline-flex items-center gap-1"><Recycle className="w-3 h-3" strokeWidth={2} /> Mark Evergreen</span>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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