'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

type Post = {
  id: string
  content: string
  platforms: string[]
  scheduled_at: string | null
  status: string
  created_at: string
}

type Template = { id: string; name: string; content: string; category: string }
type HashtagCollection = { id: string; name: string; hashtags: string[] }

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵',
  facebook: '📘', pinterest: '📌', youtube: '▶️', threads: '🧵',
  snapchat: '👻', bluesky: '🦋', reddit: '🤖', discord: '💬',
  telegram: '✈️', mastodon: '🐘', lemon8: '🍋', bereal: '📷',
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-600 border border-blue-200',
  draft: 'bg-gray-100 text-gray-500',
  published: 'bg-green-50 text-green-700 border border-green-200',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 rounded px-0.5">$1</mark>')
}

export default function Search() {
  const [user, setUser] = useState<any>(null)
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [hashtags, setHashtags] = useState<HashtagCollection[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [filter, setFilter] = useState<'all' | 'posts' | 'templates' | 'hashtags'>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      inputRef.current?.focus()
    }
    getData()
  }, [])

  useEffect(() => {
    if (!query.trim() || !user) {
      setPosts([]); setTemplates([]); setHashtags([])
      setHasSearched(false)
      return
    }
    const timeout = setTimeout(() => handleSearch(), 300)
    return () => clearTimeout(timeout)
  }, [query, user])

  const handleSearch = async () => {
    if (!query.trim() || !user) return
    setLoading(true)
    setHasSearched(true)
    const q = query.toLowerCase()

    const [postsRes, templatesRes, hashtagsRes] = await Promise.all([
      supabase.from('posts').select('*').eq('user_id', user.id).ilike('content', `%${q}%`).order('created_at', { ascending: false }).limit(20),
      supabase.from('post_templates').select('*').eq('user_id', user.id).or(`name.ilike.%${q}%,content.ilike.%${q}%`).limit(10),
      supabase.from('hashtag_collections').select('*').eq('user_id', user.id).ilike('name', `%${q}%`).limit(10),
    ])

    setPosts(postsRes.data || [])
    setTemplates(templatesRes.data || [])
    setHashtags(hashtagsRes.data || [])
    setLoading(false)
  }

  const filteredPosts = filter === 'all' || filter === 'posts' ? posts : []
  const filteredTemplates = filter === 'all' || filter === 'templates' ? templates : []
  const filteredHashtags = filter === 'all' || filter === 'hashtags' ? hashtags : []
  const totalResults = filteredPosts.length + filteredTemplates.length + filteredHashtags.length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="ml-56 flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Search</h1>
            <p className="text-sm text-gray-400 mt-0.5">Search posts, templates, and hashtag collections</p>
          </div>

          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input ref={inputRef} type="text" placeholder="Search everything..." value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-base border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-400 bg-white shadow-sm font-medium" />
            {query && (
              <button onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-xl leading-none transition-all">×</button>
            )}
          </div>

          {hasSearched && !loading && (
            <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 w-fit">
              {(['all', 'posts', 'templates', 'hashtags'] as const).map(f => {
                const count = f === 'all' ? posts.length + templates.length + hashtags.length
                  : f === 'posts' ? posts.length
                  : f === 'templates' ? templates.length
                  : hashtags.length
                return (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize flex items-center gap-1 ${filter === f ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}>
                    {f} {count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20' : 'bg-gray-100'}`}>{count}</span>}
                  </button>
                )
              })}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : hasSearched && totalResults === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h2 className="text-lg font-bold tracking-tight mb-2">No results for "{query}"</h2>
              <p className="text-gray-400 text-sm">Try a different search term or check your spelling</p>
            </div>
          ) : !hasSearched ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h2 className="text-lg font-bold tracking-tight mb-2">Search your content</h2>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">Find posts by caption text, templates by name, or hashtag collections</p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {['instagram', 'linkedin tips', 'launch', 'weekly'].map(suggestion => (
                  <button key={suggestion} onClick={() => setQuery(suggestion)}
                    className="text-xs font-semibold px-3 py-1.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPosts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Posts ({filteredPosts.length})</h2>
                    <Link href="/drafts" className="text-xs font-semibold text-gray-400 hover:text-black transition-colors">View All →</Link>
                  </div>
                  <div className="space-y-2">
                    {filteredPosts.map(post => (
                      <Link key={post.id} href={`/compose?edit=${post.id}`}
                        className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-300 transition-all group">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                          {post.platforms?.[0] ? PLATFORM_ICONS[post.platforms[0]] : '📝'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex gap-0.5">
                              {post.platforms?.slice(0, 4).map(pl => <span key={pl} className="text-xs">{PLATFORM_ICONS[pl]}</span>)}
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[post.status] || STATUS_COLORS.draft}`}>{post.status}</span>
                            <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: highlight(post.content || '', query) }} />
                        </div>
                        <span className="text-gray-300 group-hover:text-gray-500 transition-all text-sm flex-shrink-0">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {filteredTemplates.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Templates ({filteredTemplates.length})</h2>
                    <Link href="/templates" className="text-xs font-semibold text-gray-400 hover:text-black transition-colors">View All →</Link>
                  </div>
                  <div className="space-y-2">
                    {filteredTemplates.map(template => (
                      <Link key={template.id} href={`/compose?template=${encodeURIComponent(template.content)}`}
                        className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-300 transition-all group">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">📝</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold" dangerouslySetInnerHTML={{ __html: highlight(template.name, query) }} />
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{template.category}</span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1">{template.content}</p>
                        </div>
                        <span className="text-gray-300 group-hover:text-gray-500 transition-all text-sm flex-shrink-0">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {filteredHashtags.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hashtag Collections ({filteredHashtags.length})</h2>
                    <Link href="/hashtags" className="text-xs font-semibold text-gray-400 hover:text-black transition-colors">View All →</Link>
                  </div>
                  <div className="space-y-2">
                    {filteredHashtags.map(collection => (
                      <Link key={collection.id} href="/hashtags"
                        className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-300 transition-all group">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">#️⃣</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold mb-1" dangerouslySetInnerHTML={{ __html: highlight(collection.name, query) }} />
                          <div className="flex flex-wrap gap-1">
                            {collection.hashtags.slice(0, 6).map((tag, i) => (
                              <span key={i} className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{tag}</span>
                            ))}
                            {collection.hashtags.length > 6 && <span className="text-xs text-gray-400">+{collection.hashtags.length - 6}</span>}
                          </div>
                        </div>
                        <span className="text-gray-300 group-hover:text-gray-500 transition-all text-sm flex-shrink-0">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}