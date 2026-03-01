'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
        setLoading(false)
      }
    }
    getData()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const scheduled = posts.filter(p => p.status === 'scheduled')
  const drafts = posts.filter(p => p.status === 'draft')

  // Free plan limits
  const AI_CREDITS_USED = 0
  const AI_CREDITS_TOTAL = 15
  const AI_CREDITS_LEFT = AI_CREDITS_TOTAL - AI_CREDITS_USED
  const ACCOUNTS_USED = 0
  const ACCOUNTS_TOTAL = 3

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
{ icon: "⏳", label: "Queue", href: "/queue" },
{ icon: "#️⃣", label: "Hashtags", href: "/hashtags" },
{ icon: "🖼️", label: "Media Library", href: "/media" },
{ icon: "📝", label: "Templates", href: "/templates" },
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
{ icon: "🎁", label: "Referrals", href: "/referral" },
{ icon: "🔔", label: "Notifications", href: "/notifications" },
{ icon: "🔎", label: "Search", href: "/search" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>

        {/* FREE PLAN USAGE */}
        <div className="p-3 border-t border-gray-100 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">AI Credits</span>
              <span className="text-xs font-bold text-gray-700">{AI_CREDITS_LEFT}/{AI_CREDITS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-black h-1.5 rounded-full transition-all"
                style={{ width: `${(AI_CREDITS_LEFT / AI_CREDITS_TOTAL) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{AI_CREDITS_LEFT} credits remaining</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">Accounts</span>
              <span className="text-xs font-bold text-gray-700">{ACCOUNTS_USED}/{ACCOUNTS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-black h-1.5 rounded-full transition-all"
                style={{ width: `${(ACCOUNTS_USED / ACCOUNTS_TOTAL) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{ACCOUNTS_TOTAL - ACCOUNTS_USED} slots remaining</p>
          </div>

          <Link href="/pricing" className="w-full block text-center bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            ⚡ Upgrade to Pro
          </Link>

          <div className="px-1">
            <div className="text-xs text-gray-400 truncate mb-1">{user?.email}</div>
            <button onClick={handleSignOut} className="w-full text-left px-0 py-1 text-xs text-gray-400 hover:text-black transition-all">
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="ml-56 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? 'Loading your posts...' : `Welcome back${user?.email ? ', ' + user.email.split('@')[0] : ''}!`}
            </p>
          </div>
          <Link href="/compose" className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
            + New Post
          </Link>
        </div>

        {/* STATS — skeleton while loading */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {loading ? (
            <>
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5">
                  <SkeletonBox className="h-3 w-16 mb-4" />
                  <SkeletonBox className="h-8 w-10 mb-2" />
                  <SkeletonBox className="h-3 w-20" />
                </div>
              ))}
            </>
          ) : (
            <>
              {[
                { label: "Scheduled", value: scheduled.length.toString(), change: scheduled.length > 0 ? `${scheduled.length} upcoming` : "No posts yet", icon: "📅" },
                { label: "Drafts", value: drafts.length.toString(), change: drafts.length > 0 ? `${drafts.length} in progress` : "No drafts yet", icon: "📂" },
                { label: "Total Posts", value: posts.length.toString(), change: posts.length > 0 ? "All time" : "Create your first", icon: "📊" },
                { label: "AI Credits Left", value: AI_CREDITS_LEFT.toString(), change: `of ${AI_CREDITS_TOTAL} this month`, icon: "🤖" },
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
            </>
          )}
        </div>

        {/* FREE PLAN BANNER */}
        {!loading && (
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-5 mb-8 flex items-center justify-between">
            <div>
              <div className="text-white font-bold text-sm mb-0.5">You are on the Free plan</div>
              <div className="text-gray-400 text-xs">Upgrade to Pro for 3-month scheduling, 500 AI credits, and 10 accounts.</div>
            </div>
            <Link href="/#pricing" className="bg-white text-black text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all flex-shrink-0">
              See Plans →
            </Link>
          </div>
        )}

        {/* POSTS LIST */}
        {loading ? (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <SkeletonBox className="h-4 w-24" />
            </div>
            <div className="divide-y divide-gray-50">
              {[1,2,3].map(i => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <SkeletonBox className="h-3 w-3/4" />
                    <SkeletonBox className="h-3 w-1/3" />
                  </div>
                  <SkeletonBox className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-lg font-bold tracking-tight mb-2">Ready to start scheduling?</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Create your first post and start building your content calendar. It only takes 30 seconds.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/compose" className="bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
                Create Your First Post →
              </Link>
              <Link href="/accounts" className="border border-gray-200 text-gray-600 text-sm font-semibold px-6 py-3 rounded-xl hover:border-gray-400 transition-all">
                Connect an Account
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-base tracking-tight">Recent Posts</h2>
              <Link href="/drafts" className="text-sm font-semibold text-gray-400 hover:text-black transition-colors">View all →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {posts.slice(0, 10).map(post => (
                <div key={post.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{post.content}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {post.platform || 'No platform'} · {post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString() : 'No date set'}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${post.status === 'scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    {post.status}
                  </span>
                </div>
              ))}
            </div>
            {posts.length > 10 && (
              <div className="px-6 py-3 border-t border-gray-100 text-center">
                <Link href="/drafts" className="text-sm font-semibold text-gray-400 hover:text-black transition-colors">
                  View all {posts.length} posts →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}