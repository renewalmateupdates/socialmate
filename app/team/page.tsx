'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Team() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)
    }
    getUser()
  }, [])

  const handleInvite = () => {
    if (!email) return setMessage('Please enter an email address!')
    setMessage(`Invite sent to ${email}! Team collaboration is coming soon.`)
    setEmail('')
  }

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

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
            { icon: "📂", label: "Drafts", href: "/drafts" },
{ icon: "⏳", label: "Queue", href: "/queue" },
{ icon: "#️⃣", label: "Hashtags", href: "/hashtags" },
{ icon: "🖼️", label: "Media Library", href: "/media" },
{ icon: "📝", label: "Templates", href: "/templates" },
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
            { icon: "👥", label: "Team", href: "/team", active: true },
            { icon: "⚙️", label: "Settings", href: "/settings" },
          ].map(item => (
            <Link key={item.label} href={(item as any).href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${(item as any).active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
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

      <div className="ml-56 flex-1 p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight">Team</h1>
          <p className="text-sm text-gray-400 mt-0.5">Invite teammates to collaborate on your content.</p>
        </div>

        {/* COMING SOON BANNER */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <span className="text-xl">🔔</span>
          <div>
            <div className="font-semibold text-amber-800 text-sm">Team collaboration coming soon</div>
            <div className="text-amber-700 text-sm mt-0.5">Enter your teammate's email below and we'll notify them when team features go live. No per-seat fees — ever.</div>
          </div>
        </div>

        {/* CURRENT MEMBER */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
          <h2 className="font-extrabold text-base tracking-tight mb-4">Current Members</h2>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{user.email}</div>
              <div className="text-xs text-gray-400">Owner</div>
            </div>
            <span className="text-xs font-semibold bg-black text-white px-2.5 py-1 rounded-full">You</span>
          </div>
        </div>

        {/* INVITE */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-extrabold text-base tracking-tight mb-1">Invite a Teammate</h2>
          <p className="text-sm text-gray-400 mb-5">They'll get notified when team features launch.</p>
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
              placeholder="teammate@example.com"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
            <button
              onClick={handleInvite}
              className="bg-black text-white text-sm font-semibold px-5 py-3 rounded-xl hover:opacity-80 transition-all"
            >
              Invite →
            </button>
          </div>
          {message && (
            <div className={`text-sm px-4 py-3 rounded-xl mt-3 ${message.includes('sent') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}