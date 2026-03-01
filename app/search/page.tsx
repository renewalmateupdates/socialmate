'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Result = {
  id: string
  type: 'post' | 'draft' | 'template' | 'hashtag' | 'media' | 'page'
  title: string
  subtitle: string
  href: string
  icon: string
  meta?: string
}

const STATIC_PAGES: Result[] = [
  { id: 'p1', type: 'page', title: 'Dashboard', subtitle: 'Your command center', href: '/dashboard', icon: '🏠' },
  { id: 'p2', type: 'page', title: 'Compose', subtitle: 'Write and schedule a post', href: '/compose', icon: '✏️' },
  { id: 'p3', type: 'page', title: 'Calendar', subtitle: 'View your content calendar', href: '/calendar', icon: '📅' },
  { id: 'p4', type: 'page', title: 'Drafts', subtitle: 'Your saved drafts', href: '/drafts', icon: '📂' },
  { id: 'p5', type: 'page', title: 'Queue', subtitle: 'Scheduled posts queue', href: '/queue', icon: '⏳' },
  { id: 'p6', type: 'page', title: 'Analytics', subtitle: 'Your posting analytics', href: '/analytics', icon: '📊' },
  { id: 'p7', type: 'page', title: 'Best Times', subtitle: 'When to post for max reach', href: '/best-times', icon: '🔍' },
  { id: 'p8', type: 'page', title: 'Media Library', subtitle: 'Your uploaded images and videos', href: '/media', icon: '🖼️' },
  { id: 'p9', type: 'page', title: 'Hashtags', subtitle: 'Your hashtag collections', href: '/hashtags', icon: '#️⃣' },
  { id: 'p10', type: 'page', title: 'Templates', subtitle: 'Your post templates', href: '/templates', icon: '📝' },
  { id: 'p11', type: 'page', title: 'Link in Bio', subtitle: 'Your bio page builder', href: '/link-in-bio', icon: '🔗' },
  { id: 'p12', type: 'page', title: 'Bulk Scheduler', subtitle: 'Schedule many posts at once', href: '/bulk-scheduler', icon: '📆' },
  { id: 'p13', type: 'page', title: 'Accounts', subtitle: 'Connected social accounts', href: '/accounts', icon: '🔗' },
  { id: 'p14', type: 'page', title: 'Team', subtitle: 'Manage your team members', href: '/team', icon: '👥' },
  { id: 'p15', type: 'page', title: 'Settings', subtitle: 'Your account settings', href: '/settings', icon: '⚙️' },
  { id: 'p16', type: 'page', title: 'Referrals', subtitle: 'Earn rewards by inviting friends', href: '/referral', icon: '🎁' },
  { id: 'p17', type: 'page', title: 'Pricing', subtitle: 'Plans and pricing', href: '/pricing', icon: '💰' },
]

const TYPE_LABELS: Record<string, string> = {
  post: 'Scheduled Post',
  draft: 'Draft',
  template: 'Template',
  hashtag: 'Hashtag Collection',
  media: 'Media',
  page: 'Page',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Search() {
  const [user, setUser] = useState<any>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const AI_CREDITS_LEFT = 15
  const AI_CREDITS_TOTAL = 15
  const ACCOUNTS_USED = 0
  const ACCOUNTS_TOTAL = 16

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    init()
  }, [])

  useEffect(() => {
    if (!query.trim() || !user) {
      setResults([])
      setSearched(false)
      return
    }
    const timer = setTimeout(() => doSearch(query.trim()), 250)
    return () => clearTimeout(timer)
  }, [query, user])

  const doSearch = async (q: string) => {
    setLoading(true)
    setSearched(true)

    const lower = q.toLowerCase()
    const all: Result[] = []

    // Pages
    STATIC_PAGES.forEach(p => {
      if (p.title.toLowerCase().includes(lower) || p.subtitle.toLowerCase().includes(lower)) {
        all.push(p)
      }
    })

    // Posts & Drafts
    const { data: posts } = await supabase
      .from('posts')
      .select('id, content, status, scheduled_at, platforms, created_at')
      .eq('user_id', user.id)
      .ilike('content', `%${q}%`)
      .limit(10)

    posts?.forEach(p => {
      const isDraft = p.status === 'draft'
      all.push({
        id: p.id,
        type: isDraft ? 'draft' : 'post',
        title: p.content?.slice(0, 60) + (p.content?.length > 60 ? '...' : ''),
        subtitle: isDraft ? 'Draft' : `Scheduled · ${p.platforms?.slice(0, 2).join(', ')}`,
        href: isDraft ? '/drafts' : '/queue',
        icon: isDraft ? '📂' : '📅',
        meta: p.scheduled_at ? new Date(p.scheduled_at).toLocaleDateString() : timeAgo(p.created_at),
      })
    })

    // Templates
    const { data: templates } = await supabase
      .from('templates')
      .select('id, name, content, created_at')
      .eq('user_id', user.id)
      .or(`name.ilike.%${q}%,content.ilike.%${q}%`)
      .limit(5)

    templates?.forEach(t => {
      all.push({
        id: t.id,
        type: 'template',
        title: t.name,
        subtitle: t.content?.slice(0, 60) + (t.content?.length > 60 ? '...' : ''),
        href: '/templates',
        icon: '📝',
        meta: timeAgo(t.created_at),
      })
    })

    // Hashtag collections
    const { data: hashtags } = await supabase
      .from('hashtag_collections')
      .select('id, name, tags, created_at')
      .eq('user_id', user.id)
      .ilike('name', `%${q}%`)
      .limit(5)

    hashtags?.forEach(h => {
      all.push({
        id: h.id,
        type: 'hashtag',
        title: h.name,
        subtitle: h.tags?.slice(0, 4).join(' ') || '',
        href: '/hashtags',
        icon: '#️⃣',
        meta: `${h.tags?.length || 0} tags`,
      })
    })

    setResults(all)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const types = ['all', ...Array.from(new Set(results.map(r => r.type)))]
  const filtered = typeFilter === 'all' ? results : results.filter(r => r.type === typeFilter)

  const grouped = filtered.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {} as Record<string, Result[]>)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
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
            { icon: "🔎", label: "Search", href: "/search", active: true },
          ].map(item => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${'active' in item && item.active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">AI Credits</span>
              <span className="text-xs font-bold text-gray-700">{AI_CREDITS_LEFT}/{AI_CREDITS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full" style={{ width: `${(AI_CREDITS_LEFT / AI_CREDITS_TOTAL) * 100}%` }} />
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">Accounts</span>
              <span className="text-xs font-bold text-gray-700">{ACCOUNTS_USED}/{ACCOUNTS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full" style={{ width: `${(ACCOUNTS_USED / ACCOUNTS_TOTAL) * 100}%` }} />
            </div>
          </div>
          <Link href="/pricing" className="w-full block text-center bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            ⚡ Upgrade to Pro
          </Link>
          <div className="px-1">
            <div className="text-xs text-gray-400 truncate mb-1">{user?.email}</div>
            <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-black transition-all">Sign out</button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-2xl mx-auto">

          {/* SEARCH BAR */}
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔎</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search posts, drafts, templates, hashtags, pages..."
              className="w-full pl-11 pr-12 py-4 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-400 bg-white shadow-sm text-base"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-xl leading-none"
              >
                ×
              </button>
            )}
          </div>

          {/* TYPE FILTER */}
          {results.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-5">
              {types.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize ${
                    typeFilter === t ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {t === 'all' ? `All (${results.length})` : `${TYPE_LABELS[t] || t} (${results.filter(r => r.type === t).length})`}
                </button>
              ))}
            </div>
          )}

          {/* RESULTS */}
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : searched && filtered.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h2 className="text-lg font-bold tracking-tight mb-2">No results for "{query}"</h2>
              <p className="text-gray-400 text-sm mb-6">Try different keywords or check your spelling</p>
              <Link href="/compose" className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
                Create a new post →
              </Link>
            </div>
          ) : searched ? (
            <div className="space-y-6">
              {Object.entries(grouped).map(([type, items]) => (
                <div key={type}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                    {TYPE_LABELS[type] || type}s
                  </p>
                  <div className="space-y-1.5">
                    {items.map(result => (
                      <Link
                        key={result.id}
                        href={result.href}
                        className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-300 transition-all group"
                      >
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                          {result.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-black truncate">{result.title}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{result.subtitle}</p>
                        </div>
                        {result.meta && (
                          <span className="text-xs text-gray-400 flex-shrink-0">{result.meta}</span>
                        )}
                        <span className="text-gray-300 group-hover:text-black transition-colors text-sm flex-shrink-0">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY STATE — show quick links */
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Quick Access</p>
              <div className="grid grid-cols-2 gap-2 mb-8">
                {STATIC_PAGES.slice(0, 8).map(page => (
                  <Link
                    key={page.id}
                    href={page.href}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-300 transition-all group"
                  >
                    <span className="text-lg">{page.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{page.title}</p>
                      <p className="text-xs text-gray-400 truncate">{page.subtitle}</p>
                    </div>
                    <span className="text-gray-200 group-hover:text-gray-400 transition-colors text-sm">→</span>
                  </Link>
                ))}
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Search Tips</p>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-2">
                {[
                  { tip: 'Search post content', example: '"product launch"' },
                  { tip: 'Find a template by name', example: '"weekly recap"' },
                  { tip: 'Locate hashtag collections', example: '"fitness"' },
                  { tip: 'Navigate to any page', example: '"calendar"' },
                ].map(item => (
                  <div key={item.tip} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 flex-1">{item.tip}</span>
                    <button
                      onClick={() => setQuery(item.example.replace(/"/g, ''))}
                      className="text-xs font-mono font-semibold bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      {item.example}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}