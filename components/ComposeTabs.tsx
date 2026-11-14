'use client'
import Link from 'next/link'
import { PenLine, Rows3 } from 'lucide-react'

/**
 * Compose and the Bulk Scheduler are one place now: "One post" and "Bulk"
 * tabs on top of both pages (Nov 13, 2026). Bulk is where a CSV goes.
 */
export default function ComposeTabs({ active }: { active: 'one' | 'bulk' }) {
  const tab = (key: 'one' | 'bulk', href: string, label: string, Icon: typeof PenLine) => (
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
    <nav aria-label="Compose views" className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
      {tab('one', '/compose', 'One post', PenLine)}
      {tab('bulk', '/bulk-scheduler', 'Bulk', Rows3)}
    </nav>
  )
}
