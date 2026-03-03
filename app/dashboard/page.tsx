'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile?.onboarding_completed) {
        router.push('/onboarding')
        return
      }

      setUser(user)
      setProfile(profile)
      setLoading(false)
    }

    init()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {greeting}, {displayName} 👋
              </h1>
              <p className="text-sm text-gray-500 mt-1">0 posts scheduled today · 0 coming up</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/bulk-scheduler"
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
              >
                📅 Bulk Schedule
              </Link>
              <Link
                href="/compose"
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
              >
                ✏️ Compose
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'SCHEDULED', value: 0, sub: 'posts queued', icon: '📅', color: 'text-blue-600' },
              { label: 'DRAFTS', value: 0, sub: 'in progress', icon: '📁', color: 'text-yellow-600' },
              { label: 'THIS WEEK', value: 0, sub: 'posts created', icon: '✏️', color: 'text-purple-600' },
              { label: 'PUBLISHED', value: 0, sub: 'all time', icon: '✅', color: 'text-green-600' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 tracking-wide">{stat.label}</span>
                  <span className="text-lg">{stat.icon}</span>
                </div>
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* This Week */}
            <div className="col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">This Week</h2>
                  <Link href="/calendar" className="text-sm text-gray-500 hover:text-black">View Calendar →</Link>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => {
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' })
                    const isToday = day === today
                    return (
                      <div key={day} className={`py-2 rounded-lg text-sm ${isToday ? 'bg-black text-white font-semibold' : 'text-gray-400'}`}>
                        {day}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Upcoming Posts */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Upcoming Posts</h2>
                  <Link href="/queue" className="text-sm text-gray-500 hover:text-black">View All →</Link>
                </div>
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="text-4xl mb-3">🚫</div>
                  <p className="text-gray-500 text-sm mb-4">No upcoming posts scheduled</p>
                  <Link href="/compose" className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition">
                    Create Your First Post →
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Recent Activity</h2>
                  <Link href="/drafts" className="text-sm text-gray-500 hover:text-black">View Drafts →</Link>
                </div>
                <p className="text-sm text-gray-400 text-center py-6">No activity yet</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  {[
                    { label: 'Write a post', sub: 'Compose & schedule', href: '/compose', icon: '✏️', featured: true },
                    { label: 'Bulk schedule', sub: 'Schedule many at once', href: '/bulk-scheduler', icon: '📅' },
                    { label: 'View calendar', sub: 'See all scheduled posts', href: '/calendar', icon: '🗓️' },
                    { label: 'Use a template', sub: 'Start from a saved format', href: '/templates', icon: '📋' },
                    { label: 'Upload media', sub: 'Add to your library', href: '/media', icon: '🖼️' },
                    { label: 'Edit link in bio', sub: 'Update your bio page', href: '/link-in-bio', icon: '🔗' },
                  ].map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={`flex items-center gap-3 p-3 rounded-lg transition ${
                        action.featured ? 'bg-black text-white hover:bg-gray-800' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{action.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${action.featured ? 'text-white' : 'text-gray-900'}`}>{action.label}</div>
                        <div className={`text-xs truncate ${action.featured ? 'text-gray-300' : 'text-gray-400'}`}>{action.sub}</div>
                      </div>
                      <span className={action.featured ? 'text-gray-400' : 'text-gray-300'}>→</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Top Platforms */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Top Platforms</h2>
                <p className="text-sm text-gray-400 text-center py-4">No scheduled posts yet</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}