'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Drafts() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editing, setEditing] = useState<any | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editPlatform, setEditPlatform] = useState('')
  const [editScheduledAt, setEditScheduledAt] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled'>('all')
  const router = useRouter()

  const PLATFORMS = ['Instagram', 'X (Twitter)', 'LinkedIn', 'TikTok', 'YouTube', 'Pinterest', 'Threads']

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await supabase.from('posts').delete().eq('id', id)
    setPosts(posts.filter(p => p.id !== id))
    setDeleting(null)
  }

  const handleEdit = (post: any) => {
    setEditing(post)
    setEditContent(post.content)
    setEditPlatform(post.platform)
    setEditStatus(post.status)
    setEditScheduledAt(post.scheduled_at ? new Date(post.scheduled_at).toISOString().slice(0, 16) : '')
  }

  const handleSaveEdit = async () => {
    if (!editContent) return
    setSaving(true)
    await supabase.from('posts').update({
      content: editContent,
      platform: editPlatform,
      status: editStatus,
      scheduled_at: editScheduledAt || null
    }).eq('id', editing.id)
    await fetchPosts()
    setEditing(null)
    setSaving(false)
  }

  const filtered = posts.filter(p => filter === 'all' ? true : p.status === filter)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2">Content</div>
          {[
            { icon: "🏠", label: "Dashboard", href: "/dashboard" },
            { icon: "📅", label: "Calendar", href: "/calendar" },
            { icon: "✏️", label: "Compose", href: "/compose" },
            { icon: "📂", label: "Drafts", href: "/drafts", active: true },
          ].map(item => (
            <Link key={item.label} href={(item as any).href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${(item as any).active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
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
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <Link href="/compose" className="w-full block text-center bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
            + New Post
          </Link>
        </div>
      </div>
      <div className="ml-56 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">All Posts</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage your drafts and scheduled posts.</p>
          </div>
          <Link href="/compose" className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
            + New Post
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          {(['all', 'scheduled', 'draft'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${filter === f ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              {f === 'all' ? `All (${posts.length})` : f === 'scheduled' ? `Scheduled (${posts.filter(p => p.status === 'scheduled').length})` : `Drafts (${posts.filter(p => p.status === 'draft').length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 text-sm py-20">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">📂</div>
            <h2 className="text-lg font-bold tracking-tight mb-2">Nothing here yet</h2>
            <p className="text-gray-400 text-sm mb-6">Create your first post to get started.</p>
            <Link href="/compose" className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
              Create Post →
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="divide-y divide-gray-50">
              {filtered.map(post => (
                <div key={post.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{post.content}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {post.platform} · {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : 'No date set'} · Created {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${post.status === 'scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    {post.status}
                  </span>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleEdit(post)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-black transition-all">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(post.id)} disabled={deleting === post.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-100 text-red-500 hover:bg-red-50 transition-all disabled:opacity-50">
                      {deleting === post.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-extrabold tracking-tight mb-5">Edit Post</h2>
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Platform</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => (
                  <button key={p} onClick={() => setEditPlatform(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${editPlatform === p ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Content</label>
              <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={5}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none" />
            </div>
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Schedule Date & Time</label>
              <input type="datetime-local" value={editScheduledAt} onChange={e => setEditScheduledAt(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors" />
            </div>
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Status</label>
              <div className="flex gap-2">
                {(['draft', 'scheduled'] as const).map(s => (
                  <button key={s} onClick={() => setEditStatus(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all capitalize ${editStatus === s ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditing(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:border-gray-300 transition-all">
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-black text-white hover:opacity-80 transition-all disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}