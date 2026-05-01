'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

// ── Design tokens ──────────────────────────────────────────────────────────────

const T = {
  bg:      '#0a0a0a',
  surface: '#111111',
  surface2:'#161616',
  border:  '#1f1f1f',
  gold:    '#F59E0B',
  green:   '#22c55e',
  muted:   '#9ca3af',
  text:    '#e5e7eb',
  textDim: '#6b7280',
  amber:   '#F59E0B',
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface DayEntry       { day: string;      avg_engagement: number; post_count: number }
interface TimeEntry      { label: string;    avg_engagement: number; post_count: number }
interface LengthEntry    { label: string;    avg_engagement: number; post_count: number }
interface FormatEntry    { label: string;    avg_engagement: number; post_count: number }
interface PlatformEntry  { platform: string; avg_engagement: number; post_count: number }

interface TopPost {
  id: string
  content: string
  platforms: string[]
  published_at: string
  engagement: number
  bluesky_stats:  { likes?: number; reposts?: number; replies?: number } | null
  mastodon_stats: { favourites_count?: number; reblogs_count?: number; replies_count?: number } | null
}

interface DNAData {
  posts_with_data:  number
  total_posts:      number
  insufficient_data: boolean
  best_day?:        { winner: string; data: DayEntry[] }
  best_time?:       { winner: string; data: TimeEntry[] }
  best_length?:     { winner: string; data: LengthEntry[] }
  top_posts?:       TopPost[]
  format_patterns?: { winner: string | null; data: FormatEntry[] }
  platform_breakdown?: PlatformEntry[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function maxVal(items: { avg_engagement: number }[]): number {
  return Math.max(...items.map(i => i.avg_engagement), 0.01)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const FORMAT_LABELS: Record<string, string> = {
  emoji:     'Starts with emoji',
  numbered:  'Numbered list',
  quote:     'Opens with quote',
  question:  'Contains question',
  statement: 'Statement / hook',
}

const PLATFORM_ICONS: Record<string, string> = {
  bluesky:  '🦋',
  mastodon: '🐘',
  twitter:  '🐦',
  discord:  '💬',
  telegram: '✈️',
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      padding: '20px 24px',
    }}>
      <p style={{ color: T.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function WinnerBadge({ label }: { label: string }) {
  return (
    <span style={{
      background: 'rgba(245,158,11,0.15)',
      border: `1px solid rgba(245,158,11,0.35)`,
      color: T.gold,
      borderRadius: 6,
      padding: '2px 8px',
      fontSize: 12,
      fontWeight: 600,
    }}>
      {label}
    </span>
  )
}

function BarRow({
  label,
  value,
  maxValue,
  isWinner,
  count,
}: {
  label: string
  value: number
  maxValue: number
  isWinner: boolean
  count: number
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: isWinner ? T.gold : T.text, fontSize: 13, fontWeight: isWinner ? 600 : 400 }}>
          {label}
        </span>
        <span style={{ color: T.muted, fontSize: 12 }}>
          {value.toFixed(1)} avg &middot; {count} post{count !== 1 ? 's' : ''}
        </span>
      </div>
      <div style={{ background: T.surface2, borderRadius: 4, height: 6, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: isWinner ? T.gold : '#374151',
          borderRadius: 4,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ContentDNAPage() {
  const router = useRouter()
  const [dna, setDna]       = useState<DNAData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncingBsky, setSyncingBsky]   = useState(false)
  const [syncingMast, setSyncingMast]   = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login?redirect=/analytics/dna')
    })
  }, [router])

  const fetchDNA = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics/dna')
      const data = await res.json()
      setDna(data)
    } catch {
      setDna(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDNA() }, [fetchDNA])

  async function syncBluesky() {
    setSyncingBsky(true)
    setSyncMsg(null)
    try {
      const res = await fetch('/api/analytics/bluesky-sync', { method: 'POST' })
      const data = await res.json()
      setSyncMsg(`Bluesky: synced ${data.synced ?? 0} post${data.synced !== 1 ? 's' : ''}`)
      await fetchDNA()
    } catch {
      setSyncMsg('Bluesky sync failed')
    } finally {
      setSyncingBsky(false)
    }
  }

  async function syncMastodon() {
    setSyncingMast(true)
    setSyncMsg(null)
    try {
      const res = await fetch('/api/analytics/mastodon-sync', { method: 'POST' })
      const data = await res.json()
      setSyncMsg(data.error
        ? `Mastodon: ${data.error}`
        : `Mastodon: synced ${data.synced ?? 0} post${data.synced !== 1 ? 's' : ''}`)
      await fetchDNA()
    } catch {
      setSyncMsg('Mastodon sync failed')
    } finally {
      setSyncingMast(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
      <Sidebar />

      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 64px' }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ color: T.text, fontSize: 26, fontWeight: 700, margin: 0 }}>
              Content DNA
            </h1>
            <p style={{ color: T.muted, marginTop: 6, fontSize: 14 }}>
              What makes your content work
            </p>
          </div>

          {/* Transparency disclaimer */}
          <div style={{
            background: 'rgba(245,158,11,0.06)',
            border: `1px solid rgba(245,158,11,0.2)`,
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 24,
            fontSize: 13,
            color: T.muted,
            lineHeight: 1.6,
          }}>
            <span style={{ color: T.gold, fontWeight: 700 }}>How this works —</span>{' '}
            Content DNA is built entirely from your own post history stored in SocialMate. Engagement data (likes, reposts, replies) is pulled directly from Bluesky and Mastodon using their public APIs when you hit Sync. No third-party data providers, no scrapers. X/Twitter and Discord engagement are not currently available via their APIs.
            Best day, time, and length scores are averages across your posts grouped by those attributes — the higher the bar, the more engagement those posts averaged. Requires at least 10 posts with engagement data to unlock.
          </div>

          {/* Sync bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}>
            <button
              onClick={syncBluesky}
              disabled={syncingBsky}
              style={{
                background: syncingBsky ? T.surface2 : 'rgba(245,158,11,0.12)',
                border: `1px solid ${syncingBsky ? T.border : 'rgba(245,158,11,0.35)'}`,
                color: syncingBsky ? T.muted : T.gold,
                borderRadius: 8,
                padding: '7px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: syncingBsky ? 'default' : 'pointer',
              }}
            >
              {syncingBsky ? 'Syncing…' : '🦋 Sync Bluesky'}
            </button>

            <button
              onClick={syncMastodon}
              disabled={syncingMast}
              style={{
                background: syncingMast ? T.surface2 : 'rgba(99,102,241,0.12)',
                border: `1px solid ${syncingMast ? T.border : 'rgba(99,102,241,0.35)'}`,
                color: syncingMast ? T.muted : '#818cf8',
                borderRadius: 8,
                padding: '7px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: syncingMast ? 'default' : 'pointer',
              }}
            >
              {syncingMast ? 'Syncing…' : '🐘 Sync Mastodon'}
            </button>

            {syncMsg && (
              <span style={{ color: T.muted, fontSize: 13 }}>{syncMsg}</span>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', paddingTop: 80 }}>
              <p style={{ color: T.muted, fontSize: 14 }}>Analyzing your content…</p>
            </div>
          )}

          {/* Insufficient data */}
          {!loading && dna && dna.insufficient_data && (
            <div style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: '48px 32px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>🧬</p>
              <h2 style={{ color: T.text, fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
                Not enough data yet
              </h2>
              <p style={{ color: T.muted, fontSize: 14, maxWidth: 440, margin: '0 auto 20px' }}>
                Content DNA needs at least 10 posts with engagement data synced.
                You currently have <strong style={{ color: T.text }}>{dna.posts_with_data}</strong> out of{' '}
                <strong style={{ color: T.text }}>{dna.total_posts}</strong> published posts synced.
                Use the sync buttons above to pull engagement from Bluesky or Mastodon.
              </p>
              <p style={{ color: T.textDim, fontSize: 12 }}>
                Sync runs against your last 20 Bluesky posts and up to 50 Mastodon posts.
              </p>
            </div>
          )}

          {/* DNA insights */}
          {!loading && dna && !dna.insufficient_data && (
            <>
              {/* Counter */}
              <div style={{ marginBottom: 24 }}>
                <span style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  color: T.green,
                  borderRadius: 8,
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  Based on {dna.posts_with_data} post{dna.posts_with_data !== 1 ? 's' : ''} with engagement data
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                {/* Best day */}
                {dna.best_day && (
                  <SectionCard title="Best Day of Week">
                    <div style={{ marginBottom: 10 }}>
                      <WinnerBadge label={dna.best_day.winner} />
                    </div>
                    {dna.best_day.data.map(d => (
                      <BarRow
                        key={d.day}
                        label={d.day}
                        value={d.avg_engagement}
                        maxValue={maxVal(dna.best_day!.data)}
                        isWinner={d.day === dna.best_day!.winner}
                        count={d.post_count}
                      />
                    ))}
                  </SectionCard>
                )}

                {/* Best time */}
                {dna.best_time && (
                  <SectionCard title="Best Time of Day">
                    <div style={{ marginBottom: 10 }}>
                      <WinnerBadge label={dna.best_time.winner} />
                    </div>
                    {dna.best_time.data.map(t => (
                      <BarRow
                        key={t.label}
                        label={t.label.charAt(0).toUpperCase() + t.label.slice(1)}
                        value={t.avg_engagement}
                        maxValue={maxVal(dna.best_time!.data)}
                        isWinner={t.label === dna.best_time!.winner}
                        count={t.post_count}
                      />
                    ))}
                  </SectionCard>
                )}

                {/* Best post length */}
                {dna.best_length && (
                  <SectionCard title="Post Length">
                    <div style={{ marginBottom: 10 }}>
                      <WinnerBadge label={dna.best_length.winner} />
                    </div>
                    {dna.best_length.data.map(l => (
                      <BarRow
                        key={l.label}
                        label={l.label}
                        value={l.avg_engagement}
                        maxValue={maxVal(dna.best_length!.data)}
                        isWinner={l.label === dna.best_length!.winner}
                        count={l.post_count}
                      />
                    ))}
                  </SectionCard>
                )}

                {/* Format patterns */}
                {dna.format_patterns && dna.format_patterns.data.length > 0 && (
                  <SectionCard title="Format Patterns">
                    {dna.format_patterns.winner && (
                      <div style={{ marginBottom: 10 }}>
                        <WinnerBadge label={FORMAT_LABELS[dna.format_patterns.winner] ?? dna.format_patterns.winner} />
                      </div>
                    )}
                    {dna.format_patterns.data.map(f => (
                      <BarRow
                        key={f.label}
                        label={FORMAT_LABELS[f.label] ?? f.label}
                        value={f.avg_engagement}
                        maxValue={maxVal(dna.format_patterns!.data)}
                        isWinner={f.label === dna.format_patterns!.winner}
                        count={f.post_count}
                      />
                    ))}
                  </SectionCard>
                )}

                {/* Platform breakdown — full width */}
                {dna.platform_breakdown && dna.platform_breakdown.length > 0 && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <SectionCard title="Platform Breakdown">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        {dna.platform_breakdown.map((pb, i) => (
                          <div key={pb.platform} style={{
                            background: T.surface2,
                            border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.3)' : T.border}`,
                            borderRadius: 10,
                            padding: '16px 20px',
                            textAlign: 'center',
                          }}>
                            <p style={{ fontSize: 24, margin: '0 0 6px' }}>
                              {PLATFORM_ICONS[pb.platform] ?? '📡'}
                            </p>
                            <p style={{ color: i === 0 ? T.gold : T.text, fontWeight: 700, fontSize: 15, textTransform: 'capitalize', margin: '0 0 2px' }}>
                              {pb.platform}
                            </p>
                            <p style={{ color: T.muted, fontSize: 12, margin: 0 }}>
                              {pb.avg_engagement.toFixed(1)} avg engagement
                            </p>
                            <p style={{ color: T.textDim, fontSize: 11, margin: '2px 0 0' }}>
                              {pb.post_count} post{pb.post_count !== 1 ? 's' : ''} synced
                            </p>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  </div>
                )}

                {/* Top 5 posts — full width */}
                {dna.top_posts && dna.top_posts.length > 0 && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <SectionCard title="Top 5 Posts by Engagement">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {dna.top_posts.map((post, i) => (
                          <div key={post.id} style={{
                            display: 'flex',
                            gap: 14,
                            background: T.surface2,
                            borderRadius: 8,
                            padding: '12px 14px',
                            border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.2)' : T.border}`,
                          }}>
                            <div style={{
                              flexShrink: 0,
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: i === 0 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.4)' : T.border}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: i === 0 ? T.gold : T.muted,
                              fontSize: 12,
                              fontWeight: 700,
                            }}>
                              {i + 1}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                color: T.text,
                                fontSize: 13,
                                margin: '0 0 6px',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              } as React.CSSProperties}>
                                {post.content}
                              </p>
                              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ color: T.gold, fontWeight: 700, fontSize: 13 }}>
                                  {post.engagement} engagement
                                </span>
                                <span style={{ color: T.textDim, fontSize: 12 }}>
                                  {formatDate(post.published_at)}
                                </span>
                                <span style={{ color: T.textDim, fontSize: 12 }}>
                                  {post.platforms.map(p => PLATFORM_ICONS[p] ?? p).join(' ')}
                                </span>
                                {post.bluesky_stats && (
                                  <span style={{ color: T.textDim, fontSize: 11 }}>
                                    🦋 {(post.bluesky_stats.likes ?? 0)}L · {(post.bluesky_stats.reposts ?? 0)}R · {(post.bluesky_stats.replies ?? 0)}💬
                                  </span>
                                )}
                                {post.mastodon_stats && (
                                  <span style={{ color: T.textDim, fontSize: 11 }}>
                                    🐘 {(post.mastodon_stats.favourites_count ?? 0)}⭐ · {(post.mastodon_stats.reblogs_count ?? 0)}🔁 · {(post.mastodon_stats.replies_count ?? 0)}💬
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  </div>
                )}

              </div>
            </>
          )}

        </div>
      </main>
    </div>
  )
}
