'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

type Post = {
  id: string
  content: string
  platforms: string[]
  published_at: string
  evergreen: boolean
}

export default function EvergreenPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('posts')
        .select('id, content, platforms, published_at, evergreen')
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

  const evergreenPosts = posts.filter(p => p.evergreen)
  const regularPosts = posts.filter(p => !p.evergreen)

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
      <main className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">♻️</span>
              <h1 className="text-2xl font-extrabold tracking-tight">Evergreen Recycling</h1>
            </div>
            <p className="text-sm text-gray-400">Mark your best posts as evergreen and they'll automatically re-queue when your schedule is empty.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Published posts',  value: posts.length,          icon: '📝' },
              { label: 'Evergreen posts',  value: evergreenPosts.length, icon: '♻️' },
              { label: 'Auto-requeue',     value: evergreenPosts.length > 0 ? 'Active' : 'No posts', icon: '🔄' },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className="text-2xl font-extrabold">{stat.value}</p>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {evergreenPosts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-extrabold mb-4">♻️ Evergreen Queue ({evergreenPosts.length})</h2>
              <div className="space-y-3">
                {evergreenPosts.map(post => (
                  <div key={post.id} className="bg-white border-2 border-black rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400">
                            {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {post.platforms?.slice(0, 3).map(p => (
                            <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">{p}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleEvergreen(post)}
                        disabled={toggling === post.id}
                        className="flex-shrink-0 text-xs font-bold px-3 py-1.5 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-all disabled:opacity-40">
                        {toggling === post.id ? '...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-extrabold mb-4">📝 Published Posts — mark as evergreen</h2>
            {regularPosts.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-sm font-bold text-gray-700 mb-1">No published posts yet</p>
                <p className="text-xs text-gray-400 mb-4">Publish some posts first, then come back to mark your best ones as evergreen.</p>
                <Link href="/compose" className="text-xs font-bold px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                  Compose a post →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {regularPosts.map(post => (
                  <div key={post.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-300 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400">
                            {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {post.platforms?.slice(0, 3).map(p => (
                            <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">{p}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleEvergreen(post)}
                        disabled={toggling === post.id}
                        className="flex-shrink-0 text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                        {toggling === post.id ? '...' : '♻️ Mark Evergreen'}
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
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg">
          ✅ {toast}
        </div>
      )}
    </div>
  )
}