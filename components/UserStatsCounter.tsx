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

  // Aggregate only — never a plan-by-plan breakdown. Surfacing "0 Pro" publicly
  // undercuts the pitch. Posts published is the momentum number; total accounts
  // is the community number. Both are real, pulled live from the DB.
  const items: { value: string; label: string; live?: boolean }[] = []
  if (stats.posts_published > 0) {
    items.push({ value: stats.posts_published.toLocaleString(), label: 'posts published', live: true })
  }
  items.push({
    value: stats.total.toLocaleString(),
    label: stats.total === 1 ? 'creator building' : 'creators building',
  })

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
      {items.map(item => (
        <div key={item.label} className="inline-flex items-center gap-2.5">
          {item.live && (
            <span className="h-1.5 w-1.5 rounded-full bg-jade animate-pulse" aria-hidden="true" />
          )}
          <span className="font-mono text-body-lg font-semibold tracking-tight text-ink-high">
            {item.value}
          </span>
          <span className="font-mono text-eyebrow uppercase tracking-wide text-ink-faint">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
