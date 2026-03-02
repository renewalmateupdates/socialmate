'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const AI_CREDITS_LEFT = 15
const AI_CREDITS_TOTAL = 15
const ACCOUNTS_USED = 0
const ACCOUNTS_TOTAL = 16

const NAV = [
  {
    section: 'Content',
    items: [
      { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
      { icon: '📅', label: 'Calendar', href: '/calendar' },
      { icon: '✏️', label: 'Compose', href: '/compose' },
      { icon: '📂', label: 'Drafts', href: '/drafts' },
      { icon: '⏳', label: 'Queue', href: '/queue' },
      { icon: '#️⃣', label: 'Hashtags', href: '/hashtags' },
      { icon: '🖼️', label: 'Media Library', href: '/media' },
      { icon: '📝', label: 'Templates', href: '/templates' },
      { icon: '🔗', label: 'Link in Bio', href: '/link-in-bio' },
      { icon: '📆', label: 'Bulk Scheduler', href: '/bulk-scheduler' },
    ],
  },
  {
    section: 'Insights',
    items: [
      { icon: '📊', label: 'Analytics', href: '/analytics' },
      { icon: '🔍', label: 'Best Times', href: '/best-times' },
    ],
  },
  {
    section: 'Settings',
    items: [
      { icon: '🔗', label: 'Accounts', href: '/accounts' },
      { icon: '👥', label: 'Team', href: '/team' },
      { icon: '⚙️', label: 'Settings', href: '/settings' },
      { icon: '🎁', label: 'Referrals', href: '/referral' },
      { icon: '🔔', label: 'Notifications', href: '/notifications' },
      { icon: '🔎', label: 'Search', href: '/search' },
    ],
  },
]

export default function Sidebar() {
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
  supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full z-40">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight">SocialMate</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(group => (
          <div key={group.section}>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-1">{group.section}</div>
            {group.items.map(item => {
              const active = pathname === item.href
              return (
                <Link key={item.label} href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
                  <span>{item.icon}</span>{item.label}
                </Link>
              )
            })}
          </div>
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
          <p className="text-xs text-gray-400 mt-1.5">{AI_CREDITS_LEFT} credits remaining</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-500">Accounts</span>
            <span className="text-xs font-bold text-gray-700">{ACCOUNTS_USED}/{ACCOUNTS_TOTAL}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-black h-1.5 rounded-full" style={{ width: `${(ACCOUNTS_USED / ACCOUNTS_TOTAL) * 100}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{ACCOUNTS_TOTAL - ACCOUNTS_USED} slots remaining</p>
        </div>

        <Link href="/pricing" className="w-full block text-center bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
          ⚡ Upgrade to Pro
        </Link>

        <div className="px-1">
          <div className="text-xs text-gray-400 truncate mb-1">{user?.email}</div>
          <button onClick={handleSignOut} className="w-full text-left px-0 py-1 text-xs text-gray-400 hover:text-black transition-all">Sign out</button>
        </div>
      </div>
    </div>
  )
}