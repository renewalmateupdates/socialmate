'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type Result = {
  id: string
  type: 'post' | 'draft' | 'template' | 'hashtag' | 'media'
  title: string
  subtitle: string
  href: string
  icon: string
  badge?: string
  badgeColor?: string
}

const TYPE_LABELS: Record<string, string> = {
  post: 'Scheduled Post',
  draft: 'Draft',
  template: 'Template',
  hashtag: 'Hashtag Collection',
  media: 'Media File',
}

const TYPE_COLORS: Record<string, string> = {
  post: 'bg-blue-50 text-blue-600',
  draft: 'bg-gray-100 text-gray-500',
  template: 'bg-purple-50 text-purple-600',
  hashtag: 'bg-green-50 text-green-600',
  media: 'bg-orange-50 text-orange-600',
}

const TYPE_ICONS: Record<string, string> = {
  post: '📅',
  draft: '📂',
  template: '📝',
  hashtag: '#️⃣',
  media: '🖼️',
}

export default function Search() {
  const [user, setUser] = useState<any>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [filter, setFilter] = useState<'all' | 'post' | 'draft' | 'template' | 'hashtag' | 'media'>('all')
  const router = useRouter()

  const AI_CREDITS_LEFT = 15
  const AI_CREDITS_TOTAL = 15
  const ACCOUNTS_USED = 0
  const ACCOUNTS_TOTAL = 16

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
    }
    getUser()
  }, [])

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim() || !user) { setResults([]); setSearched(false); return }
    setLoading(true)
    setSearched(true)
    const found: Result[] = []

    const [posts, templates, hashtags] = await Promise.all([
      supabase.from('posts').select('id, content, status, scheduled_at, platforms').eq('user_id', user.id).ilike('content', `%${q}%`).limit(10),
      supabase.from('post_templates').select('id, name, content, category, platform').eq('user_id', user.id).or(`name.ilike.%${q}%,content.ilike.%${q}%`).limit(10),
      supabase.from('hashtag_collections').select('id, name, hashtags').eq('user_id', user.id).or(`name.ilike.%${q}%`).limit(10),
    ])

    posts.data?.forEach(p => {
      found.push({
        id: p.id,
        type: p.status === 'draft' ? 'draft' : 'post',
        title: p.content?.slice(0, 60) + (p.content?.length > 60 ? '...' : ''),
        subtitle: p.status === 'draft' ? 'Draft' : p.scheduled_at ? `Scheduled for ${new Date(p.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : 'Unscheduled',
        href: p.status === 'draft' ? '/drafts' : '/queue',
        icon: p.status === 'draft' ? '📂' : '📅',
        badge: p.status === 'draft' ? 'Draft' : 'Scheduled',
        badgeColor: p.status === 'draft' ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600',
      })
    })

    templates.data?.forEach(t => {
      found.push({
        id: t.id,
        type: 'template',
        title: t.name,
        subtitle: t.content?.slice(0, 80) + (t.content?.length > 80 ? '...' : ''),
        href: '/templates',
        icon: '📝',
        badge: t.category || 'Template',
        badgeColor: 'bg-purple-50 text-purple-600',
      })
    })

    hashtags.data?.forEach(h => {
      const matchingTags = h.hashtags?.filter((tag: string) => tag.toLowerCase().includes(q.toLowerCase())) || []
      found.push({
        id: h.id,
        type: 'hashtag',
        title: h.name,
        subtitle: matchingTags.length > 0 ? `Matching tags: ${matchingTags.slice(0, 5).join(' ')}` : `${h.hashtags?.length || 0} hashtags`,
        href: '/hashtags',
        icon: '#️⃣',
        badge: `${h.hashtags?.length || 0} tags`,
        badgeColor: 'bg-green-50 text-green-600',
      })
    })

    setResults(found)
    setLoading(false)
  }, [user])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query) handleSearch(query)
      else { setResults([]); setSearched(false) }
    }, 300)
    return () => clearTimeout(timeout)
  }, [query, handleSearch])

  const filtered = filter === 'all' ? results : results.filter(r => r.type === filter || (filter === 'post' && r.type === 'post') || (filter === 'draft' && r.type === 'draft'))

  const counts = {
    all: results.length,
    post: results.filter(r => r.type === 'post').length,
    draft: results.filter(r => r.type === 'draft').length,
    template: results.filter(r => r.type === 'template').length,
    hashtag: results.filter(r => r.type === 'hashtag').length,
    media: results.filter(r => r.type === 'media').length,
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-100 text-yellow-800 rounded px-0.5">{part}</mark> : part
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2">Content</div>
          {[
            { icon: "🏠", label: "Dashboard", href: "/dashboard" },
            { icon: "📅", label: "Calendar", href: "/calendar" },
            { icon: "✏️", label: "Compose", href: "/compose" },
            { icon: "📂", label: "Drafts", href: "/drafts" },
            { icon: "⏳", label: "Queue", href: "/queue" },
            { icon: "#️⃣", label: "Hashtags", href: "/hashtags" },
            { icon: "🖼️", label: "Media Library", href: "/media" },
            { icon: "📝", label: "Templates", href: "/templates" },
            { icon: "🔗", label: "Link in Bio", href: "/link-in-bio" },
            { icon: "📆", label: "Bulk Scheduler", href: "/bulk-scheduler" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Insights</div>
          {[
            { icon: "📊", label: "Analytics", href: "/analytics" },
            { icon: "🔍", label: "Best Times", href: "/best-times" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Settings</div>
          {[
            { icon: "🔗", label: "Accounts", href: "/accounts" },
            { icon: "👥", label: "Team", href: "/team" },
            { icon: "⚙️", label: "Settings", href: "/settings" },
            { icon: "🎁", label: "Referrals", href: "/referral" },
            { icon: "🔔", label: "Notifications", href: "/notifications" },
{ icon: "🔎", label: "Search", href: "/search" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Tools</div>
          <Link href="/search" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-black transition-all">
            <span>🔎</span>Search
          </Link>
        </nav>
        <div className="p-3 border-t border-gray-100 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">AI Credits</span>
              <span className="text-xs font-bold text-gray-700">{AI_CREDITS_LEFT}/{AI_CREDITS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full transition-all" style={{ width: `${(AI_CREDITS_LEFT / AI_CREDITS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{AI_CREDITS_LEFT} credits remaining</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">Accounts</span>
              <span className="text-xs font-bold text-gray-700">{ACCOUNTS_USED}/{ACCOUNTS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full transition-all" style={{ width: `${(ACCOUNTS_USED / ACCOUNTS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{ACCOUNTS_TOTAL - ACCOUNTS_USED} slots remaining</p>
          </div>
          <Link href="/pricing" className="w-full block text-center bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            ⚡ Upgrade to Pro
          </Link>
          <div className="px-1">
            <div className="text-xs text-gray-400 truncate mb-1">{user?.email}</div>
            <button onClick={handleSignOut} className="w-full text-left px-0 py-1 text-xs text-gray-400 hover:text-black transition-all">Sign out</button>
          </div>
        </div>
      </div>

      <div className="ml-56 flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight mb-1">Search</h1>
            <p className="text-sm text-gray-400">Search across all your posts, drafts, templates, and hashtags</p>
          </div>

          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔎</span>
            <input
              autoFocus
              type="text"
              placeholder="Search everything..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-black bg-white transition-all shadow-sm"
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setSearched(false) }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors text-xl">×</button>
            )}
          </div>

          {searched && !loading && (
            <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 flex-wrap">
              {(['all', 'post', 'draft', 'template', 'hashtag'] as const).map(f => (
                counts[f] > 0 || f === 'all' ? (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${filter === f ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
                  >
                    {f === 'all' ? `All (${counts.all})` : `${TYPE_LABELS[f]} (${counts[f]})`}
                  </button>
                ) : null
              ))}
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4">
                  <SkeletonBox className="w-10 h-10 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <SkeletonBox className="h-3 w-1/2" />
                    <SkeletonBox className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && searched && filtered.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h2 className="text-lg font-bold tracking-tight mb-2">No results for "{query}"</h2>
              <p className="text-gray-400 text-sm">Try different keywords or check your spelling</p>
            </div>
          )}

          {!loading && !searched && (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🔎</div>
              <h2 className="text-lg font-bold tracking-tight mb-2">Search everything</h2>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">Find posts, drafts, templates, and hashtag collections all from one place</p>
              <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
                {['product launch', 'instagram', 'motivation', '#marketing'].map(s => (
                  <button key={s} onClick={() => setQuery(s)} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 hover:border-gray-400 hover:text-black transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 px-1 mb-3">{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{query}"</p>
              {filtered.map(result => (
                <Link key={result.id} href={result.href} className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-300 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-gray-100 transition-all">
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold truncate">{highlightMatch(result.title, query)}</p>
                      {result.badge && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${result.badgeColor}`}>{result.badge}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{result.subtitle}</p>
                  </div>
                  <span className="text-gray-300 group-hover:text-gray-500 transition-colors text-sm flex-shrink-0 mt-1">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}