'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

const PLATFORM_ICONS: Record<string, string> = {
  bluesky:  '🦋',
  mastodon: '🐘',
  twitter:  '𝕏',
  discord:  '💬',
  telegram: '✈️',
  tiktok:   '🎵',
}

const PLATFORM_COLORS: Record<string, string> = {
  bluesky:  'bg-sky-500/20 text-sky-400 border-sky-500/30',
  mastodon: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  twitter:  'bg-gray-500/20 text-gray-300 border-gray-500/30',
  discord:  'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  telegram: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  tiktok:   'bg-pink-500/20 text-pink-400 border-pink-500/30',
}

interface ZenithStats {
  displayName: string
  handle: string
  totalPosts: number
  streak: number
  platforms: string[]
  topPost: { content: string; platform: string } | null
  joinedAt: string
  achievements: number
}

export default function ZenithPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [stats, setStats] = useState<ZenithStats | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)
      if (!u) { setLoading(false); return }

      const [
        { data: settings },
        { count: totalPosts },
        { data: accounts },
        { data: profile },
        { data: achievements },
        { data: recentPosts },
        { data: allPosts },
      ] = await Promise.all([
        supabase.from('user_settings').select('display_name').eq('user_id', u.id).single(),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', u.id).eq('status', 'published'),
        supabase.from('connected_accounts').select('platform').eq('user_id', u.id),
        supabase.from('profiles').select('created_at').eq('id', u.id).single(),
        supabase.from('user_achievements').select('id').eq('user_id', u.id),
        supabase.from('posts').select('content, platforms').eq('user_id', u.id).eq('status', 'published').order('created_at', { ascending: false }).limit(1),
        supabase.from('posts').select('scheduled_at').eq('user_id', u.id).in('status', ['published', 'scheduled']).order('scheduled_at', { ascending: false }),
      ])

      // Streak
      let streak = 0
      if (allPosts?.length) {
        const days = new Set(allPosts.map((p: any) => new Date(p.scheduled_at).toDateString()))
        const sorted = Array.from(days).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        let cursor = new Date(); cursor.setHours(0, 0, 0, 0)
        for (const day of sorted) {
          const d = new Date(day); d.setHours(0, 0, 0, 0)
          const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000)
          if (diff <= 1) { streak++; cursor = d } else break
        }
      }

      const platforms = Array.from(new Set((accounts ?? []).map((a: any) => a.platform)))
      const topPost = recentPosts?.[0]
        ? { content: recentPosts[0].content, platform: (recentPosts[0].platforms?.[0] ?? 'bluesky') }
        : null

      setStats({
        displayName: settings?.display_name || u.email?.split('@')[0] || 'Creator',
        handle: u.email?.split('@')[0] ?? 'creator',
        totalPosts: totalPosts ?? 0,
        streak,
        platforms,
        topPost,
        joinedAt: profile?.created_at ?? new Date().toISOString(),
        achievements: achievements?.length ?? 0,
      })

      setLoading(false)
    }
    init()
  }, [])

  const cardUrl = user ? `${typeof window !== 'undefined' ? window.location.origin : 'https://socialmate.studio'}/zenith` : ''

  function copyLink() {
    navigator.clipboard.writeText(cardUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
    </div>
  )

  if (!user || !stats) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white gap-4">
      <p className="text-xl font-bold">Sign in to see your ZENITH</p>
      <a href="/login?redirect=/zenith" className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl">Sign in</a>
    </div>
  )

  const joinedYear = new Date(stats.joinedAt).getFullYear()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">Your Glow Across the Web</p>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">ZENITH</h1>
          <p className="text-gray-400 text-sm">Your creator presence, distilled. Share it anywhere.</p>
        </div>

        {/* The Card */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-amber-500/20 rounded-3xl p-8 mb-6 relative overflow-hidden">
          {/* Glow orb */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Name + handle */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-extrabold">
                {stats.displayName[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xl font-extrabold">{stats.displayName}</p>
                <p className="text-xs text-gray-500">Creator since {joinedYear}</p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Posts', value: stats.totalPosts.toLocaleString() },
              { label: 'Day Streak', value: stats.streak },
              { label: 'Badges', value: stats.achievements },
            ].map(s => (
              <div key={s.label} className="bg-black/20 rounded-2xl p-3 text-center">
                <p className="text-2xl font-extrabold text-amber-400">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Platforms */}
          {stats.platforms.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">Active on</p>
              <div className="flex flex-wrap gap-2">
                {stats.platforms.map(p => (
                  <span key={p} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${PLATFORM_COLORS[p] ?? 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                    {PLATFORM_ICONS[p] ?? '🌐'} {p.charAt(0).toUpperCase() + p.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top post preview */}
          {stats.topPost && (
            <div className="bg-black/20 rounded-2xl p-4">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">Latest post</p>
              <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">{stats.topPost.content}</p>
            </div>
          )}

          {/* Watermark */}
          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-gray-600">socialmate.studio/zenith</p>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-400/40" />
              <div className="w-2 h-2 rounded-full bg-amber-300/30" />
            </div>
          </div>
        </div>

        {/* Share section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
          <p className="text-sm font-bold mb-3">Share your ZENITH</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-400 font-mono truncate">
              {cardUrl}
            </div>
            <button
              onClick={copyLink}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex-shrink-0 ${copied ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black hover:bg-amber-400'}`}
            >
              {copied ? '✓ Copied' : 'Copy link'}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">Drop this in your Twitter/X bio, Bluesky profile, or Discord about section.</p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/achievements" className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center hover:border-amber-500/30 transition-all">
            <p className="text-2xl mb-1">🏆</p>
            <p className="text-xs font-bold">Achievements</p>
            <p className="text-xs text-gray-500 mt-0.5">{stats.achievements} earned</p>
          </Link>
          <Link href="/challenge" className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center hover:border-amber-500/30 transition-all">
            <p className="text-2xl mb-1">🔥</p>
            <p className="text-xs font-bold">30-Day Challenge</p>
            <p className="text-xs text-gray-500 mt-0.5">{stats.streak} day streak</p>
          </Link>
        </div>

      </div>
    </div>
  )
}
