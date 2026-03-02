'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../src/lib/supabase'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV_CONTENT = [
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
]

const NAV_INSIGHTS = [
  { icon: '📊', label: 'Analytics', href: '/analytics' },
  { icon: '🔍', label: 'Best Times', href: '/best-times' },
]

const NAV_SETTINGS = [
  { icon: '🔗', label: 'Accounts', href: '/accounts' },
  { icon: '👥', label: 'Team', href: '/team' },
  { icon: '⚙️', label: 'Settings', href: '/settings' },
  { icon: '🎁', label: 'Referrals', href: '/referral' },
  { icon: '🔔', label: 'Notifications', href: '/notifications' },
  { icon: '🔎', label: 'Search', href: '/search' },
]

export default function Sidebar() {
  const [user, setUser] = useState<any>(null)
  const [aiCredits, setAiCredits] = useState(15)
  const [accountsUsed, setAccountsUsed] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const pathname = usePathname()
  const router = useRouter()

  const AI_CREDITS_TOTAL = 15
  const ACCOUNTS_TOTAL = 16

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      const { data: settings } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', user.id)
        .single()
      if (settings?.settings?.ai_credits_used !== undefined) {
        setAiCredits(Math.max(0, 15 - (settings.settings.ai_credits_used || 0)))
      }

      const { count } = await supabase
        .from('connected_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setAccountsUsed(count || 0)

      const stored = localStorage.getItem(`notifications_${user.id}`)
      if (stored) {
        const notifs = JSON.parse(stored)
        setUnreadCount(notifs.filter((n: any) => !n.read).length)
      }
    }
    init()
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full z-30">
      <div className="p-4 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight">SocialMate</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2">Content</div>
        {NAV_CONTENT.map(item => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive(item.href) ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Insights</div>
        {NAV_INSIGHTS.map(item => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive(item.href) ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Settings</div>
        {NAV_SETTINGS.map(item => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive(item.href) ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <span>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.label === 'Notifications' && unreadCount > 0 && (
              <span className="bg-black text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100 space-y-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-500">AI Credits</span>
            <span className="text-xs font-bold text-gray-700">{aiCredits}/{AI_CREDITS_TOTAL}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${aiCredits <= 3 ? 'bg-red-400' : aiCredits <= 7 ? 'bg-yellow-400' : 'bg-black'}`}
              style={{ width: `${(aiCredits / AI_CREDITS_TOTAL) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{aiCredits} credits remaining</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-500">Accounts</span>
            <span className="text-xs font-bold text-gray-700">{accountsUsed}/{ACCOUNTS_TOTAL}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-black h-1.5 rounded-full transition-all"
              style={{ width: `${(accountsUsed / ACCOUNTS_TOTAL) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{ACCOUNTS_TOTAL - accountsUsed} slots remaining</p>
        </div>

        <Link
          href="/pricing"
          className="w-full block text-center bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all"
        >
          ⚡ Upgrade to Pro
        </Link>

        <div className="px-1">
          <div className="text-xs text-gray-400 truncate mb-1">{user?.email}</div>
          <button
            onClick={handleSignOut}
            className="text-xs text-gray-400 hover:text-black transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}