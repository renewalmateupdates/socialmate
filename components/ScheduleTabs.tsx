'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { CalendarDays, List } from 'lucide-react'

/**
 * Calendar and Queue are one place now: "Schedule" in the sidebar, with these
 * two tabs on top of both pages (Nov 13, 2026). The tab last opened is
 * remembered, and the sidebar's Schedule link goes back to it.
 */
export const SCHEDULE_TAB_KEY = 'sm_schedule_tab'

export default function ScheduleTabs({ active }: { active: 'calendar' | 'list' }) {
  useEffect(() => {
    try { localStorage.setItem(SCHEDULE_TAB_KEY, active === 'list' ? '/queue' : '/calendar') } catch { /* private mode */ }
  }, [active])

  const tab = (key: 'calendar' | 'list', href: string, label: string, Icon: typeof List) => (
    <Link
      href={href}
      aria-current={active === key ? 'page' : undefined}
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-all ${
        active === key
          ? 'bg-white dark:bg-gray-950 text-gray-900 dark:text-white shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
      }`}>
      <Icon className="w-3.5 h-3.5" strokeWidth={2} /> {label}
    </Link>
  )

  return (
    <nav aria-label="Schedule views" className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-4">
      {tab('calendar', '/calendar', 'Calendar', CalendarDays)}
      {tab('list', '/queue', 'List', List)}
    </nav>
  )
}
