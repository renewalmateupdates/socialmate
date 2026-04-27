'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'

interface StreakData {
  day_map: Record<string, number>
  current_streak: number
  longest_streak: number
  total_posts: number
  active_days: number
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_LABELS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function intensity(count: number): string {
  if (!count) return 'var(--heatmap-0)'
  if (count === 1) return 'var(--heatmap-1)'
  if (count <= 3)  return 'var(--heatmap-2)'
  if (count <= 6)  return 'var(--heatmap-3)'
  return 'var(--heatmap-4)'
}

function buildGrid() {
  // Build 52 full weeks + partial week ending today, Sunday-first
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().slice(0, 10)

  // Start = Sunday of 52 weeks ago
  const start = new Date(today)
  start.setDate(start.getDate() - 364)
  // Rewind to Sunday
  start.setDate(start.getDate() - start.getDay())

  const weeks: string[][] = []
  const cur = new Date(start)
  while (cur <= today) {
    const week: string[] = []
    for (let d = 0; d < 7; d++) {
      if (cur <= today) {
        week.push(cur.toISOString().slice(0, 10))
      } else {
        week.push('')
      }
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
  }
  return { weeks, todayStr }
}

function monthPositions(weeks: string[][]): { label: string; col: number }[] {
  const seen = new Set<string>()
  const positions: { label: string; col: number }[] = []
  weeks.forEach((week, col) => {
    const firstDay = week.find(d => d)
    if (!firstDay) return
    const month = firstDay.slice(0, 7)
    if (!seen.has(month)) {
      seen.add(month)
      const date = new Date(firstDay)
      positions.push({ label: MONTH_LABELS[date.getMonth()], col })
    }
  })
  return positions
}

function Tooltip({ day, count, x, y }: { day: string; count: number; x: number; y: number }) {
  const date = new Date(day)
  const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  return (
    <div
      className="pointer-events-none absolute z-50 rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-lg whitespace-nowrap"
      style={{
        background: 'var(--fg)',
        color: 'var(--bg)',
        left: x,
        top: y - 36,
        transform: 'translateX(-50%)',
      }}
    >
      {count ? `${count} post${count !== 1 ? 's' : ''}` : 'No posts'} · {label}
    </div>
  )
}

export default function StreakPage() {
  const [data, setData]         = useState<StreakData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [tooltip, setTooltip]   = useState<{ day: string; count: number; x: number; y: number } | null>(null)

  useEffect(() => {
    fetch('/api/streak')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .finally(() => setLoading(false))
  }, [])

  const { weeks, todayStr } = buildGrid()
  const monthPos = monthPositions(weeks)
  const CELL = 12
  const GAP  = 3

  const stats = [
    { label: 'Current streak', value: data ? `${data.current_streak}d` : '—', icon: '🔥' },
    { label: 'Longest streak', value: data ? `${data.longest_streak}d` : '—', icon: '🏆' },
    { label: 'Posts (365d)',    value: data ? String(data.total_posts)  : '—', icon: '📤' },
    { label: 'Active days',     value: data ? String(data.active_days) : '—', icon: '📅' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Heatmap CSS vars */}
      <style>{`
        :root {
          --heatmap-0: color-mix(in srgb, var(--border-mid) 60%, transparent);
          --heatmap-1: #86efac;
          --heatmap-2: #4ade80;
          --heatmap-3: #16a34a;
          --heatmap-4: #14532d;
        }
        .dark {
          --heatmap-0: rgba(255,255,255,0.06);
          --heatmap-1: #166534;
          --heatmap-2: #16a34a;
          --heatmap-3: #4ade80;
          --heatmap-4: #86efac;
        }
      `}</style>

      <Sidebar />
      <main className="md:ml-56 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>Posting Streak</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>
              Your publishing activity over the last 365 days.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {stats.map(s => (
              <div
                key={s.label}
                className="rounded-2xl border p-4 text-center"
                style={{ background: 'var(--surface)', borderColor: 'var(--border-mid)' }}
              >
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--fg)' }}>
                  {loading ? '…' : s.value}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <div
            className="rounded-2xl border p-5 overflow-x-auto"
            style={{ background: 'var(--surface)', borderColor: 'var(--border-mid)' }}
          >
            <div className="relative" style={{ position: 'relative' }}>
              {/* Month labels */}
              <div
                className="flex mb-1"
                style={{ paddingLeft: 28, gap: 0 }}
              >
                {weeks.map((_, col) => {
                  const mp = monthPos.find(m => m.col === col)
                  return (
                    <div
                      key={col}
                      className="text-xs flex-shrink-0"
                      style={{
                        width: CELL + GAP,
                        color: 'var(--text-faint)',
                        overflow: 'visible',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {mp ? mp.label : ''}
                    </div>
                  )
                })}
              </div>

              <div className="flex" style={{ gap: 0 }}>
                {/* Day-of-week labels */}
                <div className="flex flex-col flex-shrink-0" style={{ gap: GAP, marginRight: 4, width: 24 }}>
                  {DAY_LABELS.map((d, i) => (
                    <div
                      key={d}
                      className="text-xs flex items-center justify-end"
                      style={{
                        height: CELL,
                        color: 'var(--text-faint)',
                        display: i % 2 === 0 ? 'none' : 'flex',
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Grid */}
                <div className="relative flex" style={{ gap: GAP }}>
                  {tooltip && (
                    <Tooltip
                      day={tooltip.day}
                      count={tooltip.count}
                      x={tooltip.x}
                      y={tooltip.y}
                    />
                  )}
                  {weeks.map((week, col) => (
                    <div key={col} className="flex flex-col flex-shrink-0" style={{ gap: GAP }}>
                      {week.map((day, row) => {
                        if (!day) {
                          return <div key={row} style={{ width: CELL, height: CELL }} />
                        }
                        const count = data?.day_map[day] ?? 0
                        const isToday = day === todayStr
                        return (
                          <div
                            key={row}
                            style={{
                              width: CELL,
                              height: CELL,
                              borderRadius: 3,
                              background: intensity(count),
                              cursor: 'pointer',
                              outline: isToday ? '2px solid var(--sidebar-accent)' : 'none',
                              outlineOffset: 1,
                              flexShrink: 0,
                            }}
                            onMouseEnter={e => {
                              const rect = (e.target as HTMLElement).getBoundingClientRect()
                              const parent = (e.target as HTMLElement).closest('.relative')!.getBoundingClientRect()
                              setTooltip({
                                day,
                                count,
                                x: rect.left - parent.left + CELL / 2,
                                y: rect.top  - parent.top,
                              })
                            }}
                            onMouseLeave={() => setTooltip(null)}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-1.5 mt-3 justify-end">
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Less</span>
                {[0, 1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: 3,
                      background: intensity(level === 0 ? 0 : level === 1 ? 1 : level === 2 ? 2 : level === 3 ? 4 : 8),
                    }}
                  />
                ))}
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>More</span>
              </div>
            </div>
          </div>

          {/* Motivational footer */}
          {data && data.current_streak > 0 && (
            <div
              className="mt-4 rounded-2xl border p-4 text-center"
              style={{ borderColor: 'var(--border-mid)', background: 'var(--surface)' }}
            >
              <p className="text-sm font-bold" style={{ color: 'var(--fg)' }}>
                🔥 {data.current_streak}-day streak — keep it going!
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                Consistent creators grow 3× faster. Don&apos;t break the chain.
              </p>
            </div>
          )}
          {data && data.current_streak === 0 && (
            <div
              className="mt-4 rounded-2xl border p-4 text-center"
              style={{ borderColor: 'var(--border-mid)', background: 'var(--surface)' }}
            >
              <p className="text-sm font-bold" style={{ color: 'var(--fg)' }}>
                Start your streak today
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                Post something now to kick off your first day.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
