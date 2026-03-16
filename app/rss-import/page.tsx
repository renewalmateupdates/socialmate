'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

type RSSPost = {
  title: string
  link: string
  description: string
  pubDate: string
  selected: boolean
}

export default function RSSImport() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [feedUrl, setFeedUrl] = useState('')
  const [fetching, setFetching] = useState(false)
  const [posts, setPosts] = useState<RSSPost[]>([])
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else { setUserId(data.user.id); setLoading(false) }
    })
  }, [router])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleFetch = async () => {
    if (!feedUrl.trim()) { setError('Enter an RSS feed URL'); return }
    setFetching(true)
    setError('')
    setPosts([])

    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`)
      const data = await res.json()

      if (data.status !== 'ok') {
        setError('Could not parse that RSS feed. Check the URL and try again.')
        setFetching(false)
        return
      }

      const parsed: RSSPost[] = (data.items || []).slice(0, 20).map((item: any) => ({
        title: item.title || 'Untitled',
        link: item.link || '',
        description: item.description?.replace(/<[^>]*>/g, '').slice(0, 200) || '',
        pubDate: item.pubDate || '',
        selected: false,
      }))

      setPosts(parsed)
    } catch {
      setError('Failed to fetch feed. Make sure the URL is a valid RSS/Atom feed.')
    }
    setFetching(false)
  }

  const togglePost = (i: number) => {
    setPosts(prev => prev.map((p, idx) => idx === i ? { ...p, selected: !p.selected } : p))
  }

  const selectAll = () => setPosts(prev => prev.map(p => ({ ...p, selected: true })))
  const selectNone = () => setPosts(prev => prev.map(p => ({ ...p, selected: false })))

  const handleImport = async () => {
    const selected = posts.filter(p => p.selected)
    if (!selected.length || !userId) return
    setImporting(true)

    for (const post of selected) {
      const content = `${post.title}\n\n${post.description}\n\n${post.link}`
      await supabase.from('posts').insert({
        user_id: userId,
        content,
        platforms: [],
        status: 'draft',
      })
    }

    setImporting(false)
    showToast(`${selected.length} post${selected.length !== 1 ? 's' : ''} imported as drafts`)
    setPosts(prev => prev.map(p => p.selected ? { ...p, selected: false } : p))
  }

  const selectedCount = posts.filter(p => p.selected).length

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="max-w-3xl mx-auto">

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📡</span>
              <h1 className="text-2xl font-extrabold tracking-tight">RSS / Blog Import</h1>
            </div>
            <p className="text-sm text-gray-400">Pull posts from any RSS or Atom feed and turn them into scheduled social posts.</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">RSS Feed URL</label>
            <div className="flex gap-3">
              <input
                type="url"
                value={feedUrl}
                onChange={e => setFeedUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFetch()}
                placeholder="https://yourblog.com/feed or https://example.com/rss.xml"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition-all"
              />
              <button
                onClick={handleFetch}
                disabled={fetching}
                className="px-5 py-3 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-2">
                {fetching ? (
                  <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Fetching...</>
                ) : 'Fetch Feed'}
              </button>
            </div>
            {error && <p className="text-xs text-red-500 font-semibold mt-2">❌ {error}</p>}
          </div>

          {posts.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-extrabold">{posts.length} posts found</p>
                <div className="flex items-center gap-3">
                  <button onClick={selectAll} className="text-xs font-bold text-gray-500 hover:text-black transition-colors">Select all</button>
                  <button onClick={selectNone} className="text-xs font-bold text-gray-500 hover:text-black transition-colors">Clear</button>
                  <button
                    onClick={handleImport}
                    disabled={importing || selectedCount === 0}
                    className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                    {importing ? 'Importing...' : `Import ${selectedCount > 0 ? selectedCount : ''} as Drafts →`}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {posts.map((post, i) => (
                  <button key={i} onClick={() => togglePost(i)}
                    className={`w-full text-left bg-white border-2 rounded-2xl p-4 transition-all ${
                      post.selected ? 'border-black' : 'border-gray-100 hover:border-gray-300'
                    }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all ${
                        post.selected ? 'bg-black border-black' : 'border-gray-300'
                      }`}>
                        {post.selected && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 mb-1 truncate">{post.title}</p>
                        {post.description && (
                          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{post.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {post.pubDate && (
                            <span className="text-xs text-gray-400">
                              {new Date(post.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                          {post.link && (
                            <a href={post.link} target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-xs font-bold text-black hover:underline">
                              View post →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 bg-black text-white rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold mb-1">{selectedCount} post{selectedCount !== 1 ? 's' : ''} selected</p>
                  <p className="text-xs text-gray-400">Imported posts will be saved as drafts. Edit and schedule them from your Drafts page.</p>
                </div>
                <Link href="/drafts" className="flex-shrink-0 bg-white text-black text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                  Go to Drafts →
                </Link>
              </div>
            </>
          )}

          {posts.length === 0 && !fetching && !error && (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3">📡</div>
              <p className="text-sm font-bold text-gray-700 mb-1">Enter a feed URL above</p>
              <p className="text-xs text-gray-400">Works with any RSS or Atom feed — blog posts, podcasts, YouTube channels, newsletters.</p>
            </div>
          )}

        </div>
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg">
          ✅ {toast}
        </div>
      )}
    </div>
  )
}