'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Calendar() {
  const [posts, setPosts] = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchPosts = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .not('scheduled_at', 'is', null)
      setPosts(data || [])
      setLoading(false)
    }
    fetchPosts()
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleString('default', { month: 'long' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getPostsForDay = (day: number) => {
    return posts.filter(post => {
      const d = new Date(post.scheduled_at)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, { bg: string, text: string }> = {
      'Instagram': { bg: '#fce7f3', text: '#9d174d' },
      'X (Twitter)': { bg: '#e0f2fe', text: '#0369a1' },
      'LinkedIn': { bg: '#dbeafe', text: '#1d4ed8' },
      'TikTok': { bg: '#000000', text: '#ffffff' },
      'YouTube': { bg: '#fee2e2', text: '#b91c1c' },
      'Pinterest': { bg: '#ffe4e6', text: '#be123c' },
      'Threads': { bg: '#ede9fe', text: '#6d28d9' },
    }
    return colors[platform] || { bg: '#f3f4f6', text: '#374151' }
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const padDate = (n: number) => String(n).padStart(2, '0')

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
            { icon: "📅", label: "Calendar", href: "/calendar", active: true },
            { icon: "✏️", label: "Compose", href: "/compose" },
            { icon: "📂", label: "Drafts", href: "/drafts" },
{ icon: "#️⃣", label: "Hashtags", href: "/hashtags" },
{ icon: "🖼️", label: "Media Library", href: "/media" },
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
            <h1 className="text-2xl font-extrabold tracking-tight">Calendar</h1>
            <p className="text-sm text-gray-400 mt-0.5">See all your scheduled posts at a glance.</p>
          </div>
          <Link href="/compose" className="bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
            + New Post
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 hover:text-black">←</button>
            <h2 className="font-extrabold text-lg tracking-tight">{monthName} {year}</h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 hover:text-black">→</button>
          </div>

          <div className="grid grid-cols-7 border-b border-gray-100">
            {days.map(day => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-24 border-r border-b border-gray-50 bg-gray-50/50" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dayPosts = getPostsForDay(day)
              const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year
              const dateStr = `${year}-${padDate(month + 1)}-${padDate(day)}T09:00`
              return (
                <div key={day} className={`min-h-24 border-r border-b border-gray-100 p-2 ${isToday ? 'bg-blue-50/50' : 'hover:bg-gray-50'} transition-colors`}>
                  <div className={`text-sm font-semibold mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-black text-white' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayPosts.map(post => {
                      const colors = getPlatformColor(post.platform)
                      return (
                        <div key={post.id} style={{ backgroundColor: colors.bg, color: colors.text }} className="text-xs px-2 py-1 rounded-md font-medium truncate cursor-pointer">
                          {post.platform} · {post.content.substring(0, 12)}...
                        </div>
                      )
                    })}
                    <Link href={`/compose?date=${dateStr}`} className="text-xs text-gray-300 hover:text-gray-400 transition-colors block">
                      + add
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}