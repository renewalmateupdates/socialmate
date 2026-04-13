'use client'

import { useEffect, useState } from 'react'

interface Stats {
  free: number
  pro: number
  agency: number
  white_label: number
  total: number
  posts_published: number
}

export default function UserStatsCounter() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/stats/public')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  if (!stats || stats.total === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
      {stats.posts_published > 0 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 font-semibold text-green-700 dark:text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
          {stats.posts_published.toLocaleString()} posts published
        </span>
      )}
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-200">
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
        {stats.free.toLocaleString()} Free
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20 font-semibold text-yellow-700 dark:text-yellow-400">
        <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
        {stats.pro.toLocaleString()} Pro
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 font-semibold text-purple-700 dark:text-purple-400">
        <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
        {stats.agency.toLocaleString()} Agency
      </span>
      {stats.white_label > 0 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 font-semibold text-blue-700 dark:text-blue-400">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          {stats.white_label.toLocaleString()} White Label
        </span>
      )}
    </div>
  )
}
