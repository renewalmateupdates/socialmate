'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        const { data } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        setPosts(data || [])
      }
    }
    getData()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

  const scheduled = posts.filter(p => p.status === 'scheduled')
  const drafts = posts.filter(p => p.status === 'draft')

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
        <nav className="flex-1 p-3 space-y-0.5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2">Content</div>
          {[
            { icon: "🏠", label: "Dashboard", href: "/dashboard", active: true },
            { icon: "📅", label: "Calendar", href: "/calendar" },
            { icon: "✏️", label: "Compose", href: "/compose" },
            { icon: "📂", label: "Drafts", href: "/drafts" },
          ].map(item => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${item.active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
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
          <div className="px-3 py-2 text-xs text-gray-400 truncate mb-1">{user.email}</div>
          <button onClick={handleSignOut} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
            Sign out
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="ml-56 flex-1 p-8">
        {/* TOPBAR */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Welcome back! Here's what's happening.</p>
          </div>
          <Link href="/compose" className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
            + New Post
          </Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Scheduled", value: scheduled.length.toString(), change: scheduled.length > 0 ? `${scheduled.length} upcoming` : "No posts yet", icon: "📅" },
            { label: "Drafts", value: drafts.length.toString(), change: drafts.length > 0 ? `${drafts.length} in progress` : "No drafts yet", icon: "📂" },
            { label: "Total Posts", value: posts.length.toString(), change: posts.length > 0 ? "All time" : "Create your first", icon: "📊" },
            { label: "Accounts", value: "0", change: "Connect one →", icon: "🔗" },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</span>
                <span className="text-base">{stat.icon}</span>
              </div>
              <div className="text-3xl font-extrabold tracking-tight mb-1">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* POSTS LIST */}
        {posts.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h2 className="text-lg font-bold tracking-tight mb-2">No posts scheduled yet</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Connect your social accounts and start scheduling your first post.</p>
            <Link href="/compose" className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
              Create Your First Post →
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-base tracking-tight">Recent Posts</h2>
              <Link href="/compose" className="text-sm font-semibold text-gray-400 hover:text-black transition-colors">+ New Post</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {posts.map(post => (
                <div key={post.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{post.content}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{post.platform} · {post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString() : 'No date set'}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${post.status === 'scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    {post.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}