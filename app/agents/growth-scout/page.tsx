'use client'
import { useState, useEffect } from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import Link from 'next/link'

type ScoutData = {
  competitors: { id: string; username: string; platform: string; last_checked_at: string | null }[]
  competitor_frequency: Record<string, { username: string; platform: string; post_count: number; avg_engagement: number }>
  top_posts: { username: string; platform: string; content: string; posted_at: string; engagement: number }[]
  my_post_count: number
  platform_breakdown: Record<string, number>
  cadence: { label: string; count: number }[]
  insights: string[]
  period_days: number
}

const PLATFORM_ICONS: Record<string, string> = {
  twitter:   '🐦',
  bluesky:   '🦋',
  mastodon:  '🐘',
  instagram: '📸',
  linkedin:  '💼',
  discord:   '💬',
  telegram:  '✈️',
}

export default function GrowthScoutPage() {
  const { activeWorkspaceId: workspaceId, plan } = useWorkspace()
  const [data,    setData]    = useState<ScoutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!workspaceId) return
    fetch(`/api/agents/growth-scout?workspace_id=${workspaceId}`)
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(d => setData(d))
      .catch(() => setError('Failed to load scout data.'))
      .finally(() => setLoading(false))
  }, [workspaceId])

  const isPro = plan !== 'free'

  if (!isPro) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10 max-w-3xl mx-auto flex flex-col items-center justify-center text-center gap-4">
        <span className="text-5xl">🔭</span>
        <h1 className="text-2xl font-black text-primary">Growth Scout</h1>
        <p className="text-secondary text-sm max-w-md">
          Growth Scout is available on Pro and Agency plans. Upgrade to start tracking competitors and growing smarter.
        </p>
        <Link href="/settings?tab=Plan" className="bg-amber-400 hover:bg-amber-300 text-black font-black px-6 py-3 rounded-xl text-sm transition-all">
          Upgrade to Pro →
        </Link>
        <Link href="/agents" className="text-xs text-secondary hover:text-primary">← Back to Agents</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/agents" className="text-xs text-secondary hover:text-primary mb-4 inline-block">← Back to Agents</Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🔭</span>
            <h1 className="text-2xl font-black text-primary">Growth Scout</h1>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full">Free — Pro+</span>
        </div>
        <p className="text-secondary text-sm">
          30-day snapshot of your competitors and your own posting momentum.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-secondary text-sm">Loading intel…</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Insights banner */}
          {data.insights.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-600 mb-2">🧠 Scout Insights</p>
              {data.insights.map((insight, i) => (
                <p key={i} className="text-sm text-amber-800 dark:text-amber-200">{insight}</p>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-surface border border-theme rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-primary">{data.my_post_count}</p>
              <p className="text-xs text-secondary mt-1">Your posts (30d)</p>
            </div>
            <div className="bg-surface border border-theme rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-primary">{data.competitors.length}</p>
              <p className="text-xs text-secondary mt-1">Competitors tracked</p>
            </div>
            <div className="bg-surface border border-theme rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-primary">
                {Object.keys(data.platform_breakdown).length}
              </p>
              <p className="text-xs text-secondary mt-1">Platforms active</p>
            </div>
            <div className="bg-surface border border-theme rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-primary">
                {data.cadence[0]?.count ?? 0}
              </p>
              <p className="text-xs text-secondary mt-1">Posts this week</p>
            </div>
          </div>

          {/* Your cadence */}
          <div className="bg-surface border border-theme rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-4">Your Posting Cadence</p>
            <div className="flex items-end gap-3 h-24">
              {data.cadence.map((w, i) => {
                const max = Math.max(...data.cadence.map(c => c.count), 1)
                const pct = max > 0 ? (w.count / max) * 100 : 0
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-primary">{w.count}</span>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-t-lg" style={{ height: '60px', display: 'flex', alignItems: 'flex-end' }}>
                      <div
                        className="w-full bg-amber-400 rounded-t-lg transition-all"
                        style={{ height: `${Math.max(pct, w.count > 0 ? 10 : 0)}%` }}
                      />
                    </div>
                    <span className="text-xs text-secondary text-center leading-tight">{w.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Your platform breakdown */}
          {Object.keys(data.platform_breakdown).length > 0 && (
            <div className="bg-surface border border-theme rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-4">Your Platform Breakdown (30d)</p>
              <div className="space-y-2">
                {Object.entries(data.platform_breakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([platform, count]) => {
                    const total = Object.values(data.platform_breakdown).reduce((s, c) => s + c, 0)
                    const pct   = total > 0 ? Math.round((count / total) * 100) : 0
                    return (
                      <div key={platform} className="flex items-center gap-3">
                        <span className="text-lg w-7">{PLATFORM_ICONS[platform] ?? '📱'}</span>
                        <span className="text-sm text-primary capitalize w-20">{platform}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                          <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-secondary w-16 text-right">{count} posts ({pct}%)</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Competitor frequency */}
          {Object.keys(data.competitor_frequency).length > 0 && (
            <div className="bg-surface border border-theme rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-4">Competitor Activity (30d)</p>
              <div className="space-y-3">
                {Object.values(data.competitor_frequency)
                  .sort((a, b) => b.post_count - a.post_count)
                  .map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-background border border-theme rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{PLATFORM_ICONS[c.platform] ?? '📱'}</span>
                        <div>
                          <p className="text-sm font-bold text-primary">@{c.username}</p>
                          <p className="text-xs text-secondary capitalize">{c.platform}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{c.post_count} posts</p>
                        {c.avg_engagement > 0 && (
                          <p className="text-xs text-secondary">avg {c.avg_engagement} engagement</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Top competitor posts */}
          {data.top_posts.length > 0 && (
            <div className="bg-surface border border-theme rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-secondary mb-4">Top Competitor Posts (30d)</p>
              <div className="space-y-3">
                {data.top_posts.map((post, i) => (
                  <div key={i} className="p-4 bg-background border border-theme rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{PLATFORM_ICONS[post.platform] ?? '📱'}</span>
                        <span className="text-xs font-bold text-primary">@{post.username}</span>
                      </div>
                      {post.engagement > 0 && (
                        <span className="text-xs text-amber-500 font-semibold">⚡ {post.engagement} engagement</span>
                      )}
                    </div>
                    <p className="text-sm text-secondary leading-relaxed">{post.content}{post.content.length >= 200 ? '…' : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No competitors CTA */}
          {data.competitors.length === 0 && (
            <div className="bg-surface border border-theme rounded-2xl p-8 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-bold text-primary mb-1">No competitors tracked yet</p>
              <p className="text-sm text-secondary mb-4">Add competitors to start seeing intel on what's working in your space.</p>
              <Link href="/competitor-tracking" className="bg-amber-400 hover:bg-amber-300 text-black font-black px-5 py-2.5 rounded-xl text-sm transition-all inline-block">
                Add Competitors →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
