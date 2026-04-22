'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

// ── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  bg:      '#0a0a0a',
  surface: '#111111',
  surface2:'#161616',
  border:  '#1f1f1f',
  gold:    '#F59E0B',
  green:   '#22c55e',
  red:     '#ef4444',
  muted:   '#9ca3af',
  text:    '#e5e7eb',
  textDim: '#6b7280',
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Day30 = { date: string; count: number }

type RecentPost = {
  id: string
  content: string
  content_preview: string
  platforms: string[]
  published_at: string
  status: string
  bluesky_stats: { likes: number; reposts: number; replies: number; fetched_at: string } | null
}

type AnalyticsStats = {
  total_published: number
  total_scheduled: number
  total_failed: number
  total_drafts: number
  published_this_month: number
  published_last_month: number
  by_platform: { platform: string; count: number }[]
  by_day_of_week: { day: number; label: string; count: number }[]
  by_hour: { hour: number; count: number }[]
  recent_posts: RecentPost[]
  current_streak: number
  longest_streak: number
  avg_posts_per_week: number
  last_30_days: Day30[]
  period_totals: { total_all_time: number; this_month: number; last_month: number }
}

type DateRange = '7d' | '30d' | 'all'

// ── Helpers ───────────────────────────────────────────────────────────────────

const PLATFORM_ICONS: Record<string, string> = {
  bluesky:  '🦋',
  discord:  '💬',
  telegram: '✈️',
  mastodon: '🐘',
  twitter:  '🐦',
  instagram:'📸',
  linkedin: '💼',
  youtube:  '▶️',
  reddit:   '🤖',
  tiktok:   '🎵',
  facebook: '📘',
  threads:  '🧵',
  pinterest:'📌',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ w = '100%', h = 24 }: { w?: string | number; h?: number }) {
  return (
    <div style={{
      width: w, height: h,
      background: 'linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: 8,
    }} />
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, subColor }: {
  label: string
  value: string | number
  sub?: string
  subColor?: string
}) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: '16px 20px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.muted }}>
        {label}
      </span>
      <span style={{ fontSize: 32, fontWeight: 800, color: T.text, lineHeight: 1.1 }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: 12, color: subColor ?? T.muted }}>
          {sub}
        </span>
      )}
    </div>
  )
}

// ── Area Chart ────────────────────────────────────────────────────────────────

function AreaChart({ data }: { data: Day30[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; count: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const W = 700, H = 120
  const padL = 36, padR = 10, padT = 10, padB = 28
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const max = Math.max(...data.map(d => d.count), 1)
  const min = 0

  const xOf = (i: number) => padL + (i / (data.length - 1)) * chartW
  const yOf = (v: number) => padT + chartH - ((v - min) / (max - min)) * chartH

  // Build SVG path
  const pts = data.map((d, i) => ({ x: xOf(i), y: yOf(d.count) }))
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${(padT + chartH).toFixed(1)} L${pts[0].x.toFixed(1)},${(padT + chartH).toFixed(1)} Z`

  // Y-axis ticks
  const tickCount = 4
  const yTicks = Array.from({ length: tickCount }, (_, i) => Math.round((max / (tickCount - 1)) * i))

  // X-axis: every 7th
  const xLabels = data.filter((_, i) => i % 7 === 0 || i === data.length - 1)

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const svgX = ((e.clientX - rect.left) / rect.width) * W
    const relX = svgX - padL
    if (relX < 0 || relX > chartW) { setTooltip(null); return }
    const idx = Math.round((relX / chartW) * (data.length - 1))
    const clamped = Math.max(0, Math.min(data.length - 1, idx))
    const d = data[clamped]
    setTooltip({ x: xOf(clamped), y: yOf(d.count), date: d.date, count: d.count })
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Grid lines */}
        {yTicks.map(v => (
          <line key={v}
            x1={padL} x2={W - padR}
            y1={yOf(v)} y2={yOf(v)}
            stroke={T.border} strokeWidth={0.5}
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="rgba(245,158,11,0.12)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke={T.gold} strokeWidth={1.5} strokeLinejoin="round" />

        {/* Y-axis labels */}
        {yTicks.map(v => (
          <text key={v} x={padL - 4} y={yOf(v) + 4}
            textAnchor="end" fontSize={8} fill={T.textDim}>
            {v}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map(d => {
          const i = data.indexOf(d)
          return (
            <text key={d.date} x={xOf(i)} y={H - 4}
              textAnchor="middle" fontSize={8} fill={T.textDim}>
              {formatShortDate(d.date)}
            </text>
          )
        })}

        {/* Tooltip vertical line */}
        {tooltip && (
          <line
            x1={tooltip.x} x2={tooltip.x}
            y1={padT} y2={padT + chartH}
            stroke={T.gold} strokeWidth={1} strokeDasharray="3,3" opacity={0.7}
          />
        )}

        {/* Tooltip dot */}
        {tooltip && (
          <circle cx={tooltip.x} cy={tooltip.y} r={3.5} fill={T.gold} stroke={T.bg} strokeWidth={1.5} />
        )}
      </svg>

      {/* Floating tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: `calc(${(tooltip.x / W) * 100}% + 8px)`,
          transform: tooltip.x > W * 0.7 ? 'translateX(-110%)' : undefined,
          background: T.surface2,
          border: `1px solid ${T.border}`,
          borderRadius: 6,
          padding: '4px 8px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}>
          <div style={{ fontSize: 11, color: T.muted }}>{formatShortDate(tooltip.date)}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.gold }}>{tooltip.count} posts</div>
        </div>
      )}
    </div>
  )
}

// ── Heatmap ───────────────────────────────────────────────────────────────────

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOUR_LABELS = ['12a', '3a', '6a', '9a', '12p', '3p', '6p', '9p']

function BestTimesHeatmap({ byDayOfWeek, byHour }: {
  byDayOfWeek: { day: number; label: string; count: number }[]
  byHour: { hour: number; count: number }[]
}) {
  // Build a 7×24 grid. We only have by_day_of_week + by_hour, not a 2D cross.
  // Approximate: cell value = (dayCount * hourCount) ^ 0.5 normalized
  const maxDay  = Math.max(...byDayOfWeek.map(d => d.count), 1)
  const maxHour = Math.max(...byHour.map(h => h.count), 1)
  const maxCell = Math.sqrt(maxDay * maxHour)

  const HOUR_COLS = 24
  const cellSize = 12

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 500, position: 'relative' }}>
        {/* Hour labels */}
        <div style={{ display: 'flex', marginLeft: 36, marginBottom: 4 }}>
          {HOUR_LABELS.map((lbl, i) => (
            <div key={lbl} style={{
              width: cellSize * 3,
              fontSize: 9, color: T.textDim, textAlign: 'center',
            }}>
              {lbl}
            </div>
          ))}
        </div>

        {/* Rows */}
        {DAYS.map((dayLabel, dayIdx) => {
          const dayEntry = byDayOfWeek.find(d => d.day === dayIdx)
          const dayCount = dayEntry?.count ?? 0

          return (
            <div key={dayLabel} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <div style={{ width: 32, fontSize: 10, color: T.muted, flexShrink: 0 }}>
                {dayLabel}
              </div>
              {Array.from({ length: HOUR_COLS }, (_, h) => {
                const hourEntry = byHour.find(x => x.hour === h)
                const hourCount = hourEntry?.count ?? 0
                const cellVal = Math.sqrt(dayCount * hourCount)
                const opacity = maxCell > 0 ? cellVal / maxCell : 0
                return (
                  <div key={h} title={`${dayLabel} ${h}:00 — ~${Math.round(cellVal)} posts`} style={{
                    width: cellSize,
                    height: cellSize,
                    marginRight: 1,
                    borderRadius: 2,
                    background: opacity > 0.02
                      ? `rgba(245,158,11,${Math.max(opacity * 0.9, 0.08)})`
                      : T.surface2,
                    border: `1px solid ${T.border}`,
                    cursor: 'default',
                  }} />
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Analytics() {
  const [stats, setStats]         = useState<AnalyticsStats | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [range, setRange]         = useState<DateRange>('30d')
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'done'>('idle')
  const [syncCount, setSyncCount] = useState(0)
  const router = useRouter()

  const loadStats = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/analytics/stats')
      if (res.status === 401) { router.push('/login?redirect=/analytics'); return }
      if (!res.ok) throw new Error('Failed to load analytics')
      const data = await res.json()
      setStats(data)
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { loadStats() }, [loadStats])

  async function syncBluesky() {
    setSyncState('syncing')
    try {
      const res = await fetch('/api/analytics/bluesky-sync', { method: 'POST' })
      const data = await res.json()
      setSyncCount(data.synced ?? 0)
      setSyncState('done')
      // Reload stats to show updated bluesky_stats
      if ((data.synced ?? 0) > 0) loadStats()
    } catch {
      setSyncState('done')
      setSyncCount(0)
    }
  }

  // ── Derived: filter last_30_days by range ──────────────────────────────────

  const chartData: Day30[] = (() => {
    if (!stats) return []
    const all = stats.last_30_days
    if (range === '7d')  return all.slice(-7)
    if (range === '30d') return all
    // 'all': build from scratch — use all days in range of the data (last 30 is what we have)
    return all
  })()

  // Filter recent_posts by range
  const filteredPosts: RecentPost[] = (() => {
    if (!stats) return []
    const posts = stats.recent_posts
    if (range === 'all') return posts
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - (range === '7d' ? 7 : 30))
    return posts.filter(p => new Date(p.published_at) >= cutoff)
  })()

  // ── Bluesky engagement totals ──────────────────────────────────────────────

  const bskyPosts  = stats?.recent_posts.filter(p => p.bluesky_stats) ?? []
  const bskyLikes  = bskyPosts.reduce((s, p) => s + (p.bluesky_stats?.likes ?? 0), 0)
  const bskyRep    = bskyPosts.reduce((s, p) => s + (p.bluesky_stats?.reposts ?? 0), 0)
  const bskyReplies= bskyPosts.reduce((s, p) => s + (p.bluesky_stats?.replies ?? 0), 0)
  const lastSynced = bskyPosts[0]?.bluesky_stats?.fetched_at

  const monthDelta = stats ? stats.published_this_month - stats.published_last_month : 0
  const maxPlatform = stats?.by_platform[0]?.count ?? 1

  const isEmpty = stats && stats.total_published === 0

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 14px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: `1px solid ${active ? T.gold : T.border}`,
    background: active ? 'rgba(245,158,11,0.12)' : 'transparent',
    color: active ? T.gold : T.muted,
    transition: 'all 0.15s',
  })

  const sectionStyle: React.CSSProperties = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: '20px 24px',
  }

  const sectionHead: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: T.muted,
    marginBottom: 16,
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>

            {/* ── Header ──────────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: T.text, margin: 0 }}>
                Analytics
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {/* Date range pills */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['7d', '30d', 'all'] as DateRange[]).map(r => (
                    <button key={r} onClick={() => setRange(r)} style={pillStyle(range === r)}>
                      {r === '7d' ? '7 days' : r === '30d' ? '30 days' : 'All time'}
                    </button>
                  ))}
                </div>

                {/* Bluesky sync */}
                <button
                  onClick={syncBluesky}
                  disabled={syncState === 'syncing'}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: syncState === 'syncing' ? 'default' : 'pointer',
                    border: `1px solid ${T.border}`,
                    background: T.surface,
                    color: syncState === 'done' ? T.green : T.muted,
                    transition: 'all 0.15s',
                    opacity: syncState === 'syncing' ? 0.6 : 1,
                  }}
                >
                  {syncState === 'idle' ? '🦋 Sync Bluesky ↻'
                    : syncState === 'syncing' ? 'Syncing...'
                    : `✓ Synced ${syncCount} posts`}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: `1px solid rgba(239,68,68,0.3)`,
                borderRadius: 8, padding: '10px 16px', color: T.red, fontSize: 14, marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            {/* ── Stat cards ──────────────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
              {loading ? (
                Array.from({ length: 4 }, (_, i) => (
                  <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 20px', height: 100 }}>
                    <Skeleton h={10} w="60%" />
                    <div style={{ marginTop: 8 }}><Skeleton h={36} w="40%" /></div>
                    <div style={{ marginTop: 6 }}><Skeleton h={10} w="80%" /></div>
                  </div>
                ))
              ) : (
                <>
                  <StatCard
                    label="Total Published"
                    value={stats?.period_totals.total_all_time ?? 0}
                    sub={`${stats?.published_this_month ?? 0} this month`}
                  />
                  <StatCard
                    label="vs Last Month"
                    value={`${monthDelta >= 0 ? '+' : ''}${monthDelta} posts`}
                    sub={monthDelta >= 0 ? 'trending up ↑' : 'trending down ↓'}
                    subColor={monthDelta >= 0 ? T.green : T.red}
                  />
                  <StatCard
                    label="Current Streak"
                    value={`${stats?.current_streak ?? 0} 🔥`}
                    sub={`Longest: ${stats?.longest_streak ?? 0} days`}
                  />
                  <StatCard
                    label="Avg / Week"
                    value={stats?.avg_posts_per_week ?? 0}
                    sub="posts (last 8 weeks)"
                  />
                </>
              )}
            </div>

            {/* ── Platform Analytics Status ───────────────────────────────────── */}
            <div style={{ ...sectionStyle, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <p style={{ ...sectionHead, margin: 0 }}>Platform Analytics Status</p>
                  <p style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>What engagement data we can pull per platform</p>
                </div>
                <button
                  onClick={syncBluesky}
                  disabled={syncState === 'syncing'}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: syncState === 'syncing' ? 'default' : 'pointer',
                    border: `1px solid ${T.border}`,
                    background: T.surface2,
                    color: syncState === 'done' ? T.green : T.muted,
                    transition: 'all 0.15s',
                    opacity: syncState === 'syncing' ? 0.6 : 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {syncState === 'idle' ? '🦋 Sync Bluesky engagement'
                    : syncState === 'syncing' ? 'Syncing...'
                    : `✓ Synced ${syncCount} posts`}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  {
                    icon: '🦋', name: 'Bluesky',
                    badge: '✅ Available', badgeColor: '#16a34a', badgeBg: 'rgba(22,163,74,0.12)',
                    desc: 'Likes, reposts, and replies — pulled live via AT Protocol public API.',
                  },
                  {
                    icon: '🐘', name: 'Mastodon',
                    badge: '✅ Available', badgeColor: '#16a34a', badgeBg: 'rgba(22,163,74,0.12)',
                    desc: 'Favourites and reblogs available via Mastodon API. Integration in progress.',
                  },
                  {
                    icon: '💬', name: 'Discord',
                    badge: '⚠️ Limited', badgeColor: '#d97706', badgeBg: 'rgba(217,119,6,0.12)',
                    desc: 'Message delivery confirmed. Discord does not expose engagement metrics via API.',
                  },
                  {
                    icon: '✈️', name: 'Telegram',
                    badge: '⚠️ Limited', badgeColor: '#d97706', badgeBg: 'rgba(217,119,6,0.12)',
                    desc: 'Message delivery confirmed. View counts available for channels only — not groups or DMs.',
                  },
                  {
                    icon: '🐦', name: 'X / Twitter',
                    badge: '🔒 Blocked', badgeColor: '#6b7280', badgeBg: 'rgba(107,114,128,0.12)',
                    desc: 'Impressions require Twitter API v2 Basic ($100+/mo). We\'ve built the integration — pending API tier upgrade.',
                  },
                  {
                    icon: '💼', name: 'LinkedIn',
                    badge: '🔒 Blocked', badgeColor: '#6b7280', badgeBg: 'rgba(107,114,128,0.12)',
                    desc: 'Impression data requires LinkedIn Partner Program approval. Coming when LinkedIn integration launches.',
                  },
                ].map(row => (
                  <div key={row.name} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    background: T.surface2, border: `1px solid ${T.border}`,
                    borderRadius: 8, padding: '10px 14px',
                  }}>
                    <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{row.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{row.name}</span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
                          color: row.badgeColor, background: row.badgeBg, border: `1px solid ${row.badgeColor}33`,
                        }}>
                          {row.badge}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: T.textDim, margin: 0, lineHeight: 1.5 }}>{row.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 30-day area chart ────────────────────────────────────────────── */}
            <div style={{ ...sectionStyle, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <p style={{ ...sectionHead, margin: 0 }}>SocialMate Post Activity</p>
                  <p style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>From your SocialMate scheduling data</p>
                </div>
                <span style={{ fontSize: 11, color: T.textDim }}>
                  {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'All time (30-day window)'}
                </span>
              </div>
              {loading ? (
                <Skeleton h={120} />
              ) : isEmpty || !chartData.length ? (
                <p style={{ color: T.muted, fontSize: 14 }}>No published posts yet.</p>
              ) : (
                <AreaChart data={chartData} />
              )}
            </div>

            {/* ── Platform breakdown ──────────────────────────────────────────── */}
            <div style={{ ...sectionStyle, marginBottom: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <p style={{ ...sectionHead, margin: 0 }}>Platform Breakdown</p>
                <p style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>Posts published per platform — from your SocialMate scheduling data</p>
              </div>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} h={20} />)}
                </div>
              ) : isEmpty || !stats?.by_platform.length ? (
                <p style={{ color: T.muted, fontSize: 14 }}>No published posts yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stats.by_platform.map(({ platform, count }) => {
                    const total = stats.total_published || 1
                    const pct   = Math.round((count / total) * 100)
                    const barW  = Math.max((count / maxPlatform) * 100, 2)
                    const icon  = PLATFORM_ICONS[platform] ?? '📡'
                    return (
                      <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ width: 100, fontSize: 13, color: T.text, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, textTransform: 'capitalize' }}>
                          <span>{icon}</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{platform}</span>
                        </span>
                        <div style={{ flex: 1, height: 8, background: T.surface2, borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${barW}%`,
                            background: `linear-gradient(90deg, ${T.gold}, rgba(245,158,11,0.6))`,
                            borderRadius: 4,
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                        <span style={{ width: 60, textAlign: 'right', fontSize: 13, color: T.muted, flexShrink: 0 }}>
                          {count} <span style={{ fontSize: 11, color: T.textDim }}>({pct}%)</span>
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── Bluesky Engagement ──────────────────────────────────────────── */}
            {!loading && bskyPosts.length > 0 && (
              <div style={{ ...sectionStyle, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <p style={{ ...sectionHead, margin: 0 }}>🦋 Bluesky Engagement</p>
                    <p style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>Platform Engagement — pulled live from AT Protocol API</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {lastSynced && (
                      <span style={{ fontSize: 11, color: T.textDim }}>
                        Last synced {timeAgo(lastSynced)}
                      </span>
                    )}
                    <button
                      onClick={syncBluesky}
                      disabled={syncState === 'syncing'}
                      style={{
                        fontSize: 11, padding: '3px 10px', borderRadius: 12,
                        border: `1px solid ${T.border}`, background: 'transparent',
                        color: T.muted, cursor: 'pointer',
                      }}
                    >
                      ↻ Sync
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    { emoji: '❤️', label: 'Likes', value: bskyLikes },
                    { emoji: '🔁', label: 'Reposts', value: bskyRep },
                    { emoji: '💬', label: 'Replies', value: bskyReplies },
                  ].map(({ emoji, label, value }) => (
                    <div key={label} style={{
                      background: T.surface2, border: `1px solid ${T.border}`,
                      borderRadius: 10, padding: '14px 16px', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 22 }}>{emoji}</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: T.text, lineHeight: 1.2 }}>{value}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Best Times Heatmap ──────────────────────────────────────────── */}
            <div style={{ ...sectionStyle, marginBottom: 20 }}>
              <p style={sectionHead}>Best Times Heatmap</p>
              {loading ? (
                <Skeleton h={100} />
              ) : isEmpty || !stats ? (
                <p style={{ color: T.muted, fontSize: 14 }}>No data yet.</p>
              ) : (
                <BestTimesHeatmap byDayOfWeek={stats.by_day_of_week} byHour={stats.by_hour} />
              )}
              <p style={{ fontSize: 11, color: T.textDim, marginTop: 8, margin: '8px 0 0' }}>
                Darker = more posts published at that time. Based on last 90 days.
              </p>
            </div>

            {/* ── Recent Posts table ──────────────────────────────────────────── */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}` }}>
                <p style={{ ...sectionHead, margin: 0 }}>Recent Published Posts</p>
              </div>

              {loading ? (
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} h={40} />)}
                </div>
              ) : isEmpty || !filteredPosts.length ? (
                <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                  <p style={{ color: T.muted, fontSize: 14, marginBottom: 12 }}>
                    {stats?.total_published === 0
                      ? 'No posts published yet — schedule your first post!'
                      : 'No posts in this date range.'}
                  </p>
                  {stats?.total_published === 0 && (
                    <Link href="/compose" style={{
                      display: 'inline-block', padding: '8px 20px', borderRadius: 8,
                      background: T.gold, color: T.bg, fontSize: 13, fontWeight: 700,
                      textDecoration: 'none',
                    }}>
                      Create a post
                    </Link>
                  )}
                </div>
              ) : (
                <div>
                  {/* Table header */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: bskyPosts.length > 0 ? '1fr 120px 80px 80px 80px 110px' : '1fr 120px 110px',
                    padding: '8px 24px',
                    borderBottom: `1px solid ${T.border}`,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: T.textDim,
                  }}>
                    <span>Content</span>
                    <span>Platforms</span>
                    {bskyPosts.length > 0 && <>
                      <span style={{ textAlign: 'right' }}>❤️</span>
                      <span style={{ textAlign: 'right' }}>💬</span>
                      <span style={{ textAlign: 'right' }}>🔁</span>
                    </>}
                    <span style={{ textAlign: 'right' }}>Date</span>
                  </div>

                  {filteredPosts.map((post, idx) => {
                    const rowBg = idx % 2 === 0 ? T.surface : '#0f0f0f'
                    const hasEngagement = bskyPosts.length > 0
                    return (
                      <div key={post.id} style={{
                        display: 'grid',
                        gridTemplateColumns: hasEngagement ? '1fr 120px 80px 80px 80px 110px' : '1fr 120px 110px',
                        padding: '10px 24px',
                        background: rowBg,
                        alignItems: 'center',
                        gap: 8,
                        borderBottom: `1px solid ${T.border}`,
                      }}>
                        {/* Content */}
                        <span style={{
                          fontSize: 13, color: T.text,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {post.content.slice(0, 60) || (
                            <span style={{ color: T.textDim, fontStyle: 'italic' }}>No text</span>
                          )}
                        </span>

                        {/* Platforms */}
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {post.platforms.map(p => (
                            <span key={p} title={p} style={{ fontSize: 14 }}>
                              {PLATFORM_ICONS[p] ?? '📡'}
                            </span>
                          ))}
                        </div>

                        {/* Bluesky stats */}
                        {hasEngagement && (
                          <>
                            <span style={{ textAlign: 'right', fontSize: 13, color: post.bluesky_stats ? T.text : T.textDim }}>
                              {post.bluesky_stats?.likes ?? '—'}
                            </span>
                            <span style={{ textAlign: 'right', fontSize: 13, color: post.bluesky_stats ? T.text : T.textDim }}>
                              {post.bluesky_stats?.replies ?? '—'}
                            </span>
                            <span style={{ textAlign: 'right', fontSize: 13, color: post.bluesky_stats ? T.text : T.textDim }}>
                              {post.bluesky_stats?.reposts ?? '—'}
                            </span>
                          </>
                        )}

                        {/* Date */}
                        <span style={{ textAlign: 'right', fontSize: 12, color: T.textDim, whiteSpace: 'nowrap' }}>
                          {formatDate(post.published_at)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Empty state full CTA */}
            {!loading && isEmpty && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ color: T.muted, fontSize: 16, marginBottom: 16 }}>
                  No posts published yet — schedule your first post and come back to see your stats!
                </p>
                <Link href="/compose" style={{
                  display: 'inline-block', padding: '12px 28px', borderRadius: 10,
                  background: T.gold, color: T.bg, fontSize: 15, fontWeight: 700,
                  textDecoration: 'none',
                }}>
                  Compose your first post
                </Link>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  )
}
