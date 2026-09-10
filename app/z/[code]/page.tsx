import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import PlatformIcon, { hasPlatformIcon } from '@/components/landing/PlatformIcon'
import { Globe2 } from 'lucide-react'

function PlatformGlyph({ id, size = 14, className = '' }: { id: string; size?: number; className?: string }) {
  if (!hasPlatformIcon(id)) return <Globe2 size={size} className={className} strokeWidth={1.75} />
  return <PlatformIcon name={id} size={size} className={className} />
}

const PLATFORM_COLORS: Record<string, string> = {
  bluesky:  'bg-sky-500/20 text-sky-400 border-sky-500/30',
  mastodon: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  twitter:  'bg-gray-500/20 text-gray-300 border-gray-500/30',
  discord:  'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  telegram: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  tiktok:   'bg-pink-500/20 text-pink-400 border-pink-500/30',
  linkedin: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
}

async function getZenithStats(code: string) {
  const supabase = getSupabaseAdmin()

  const { data: settings } = await supabase
    .from('user_settings')
    .select('user_id, display_name, referral_code')
    .eq('referral_code', code.toUpperCase())
    .maybeSingle()

  if (!settings?.user_id) return null
  const userId = settings.user_id as string

  const [
    { count: totalPosts },
    { data: accounts },
    { data: profile },
    { data: achievements },
    { data: recentPosts },
    { data: allPosts },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'published'),
    supabase.from('connected_accounts').select('platform').eq('user_id', userId),
    supabase.from('profiles').select('created_at').eq('id', userId).maybeSingle(),
    supabase.from('user_achievements').select('id').eq('user_id', userId),
    supabase.from('posts').select('content, platforms').eq('user_id', userId).eq('status', 'published').order('created_at', { ascending: false }).limit(1),
    supabase.from('posts').select('scheduled_at').eq('user_id', userId).in('status', ['published', 'scheduled']).order('scheduled_at', { ascending: false }),
  ])

  let streak = 0
  if (allPosts?.length) {
    const days = new Set(allPosts.map((p: { scheduled_at: string }) => new Date(p.scheduled_at).toDateString()))
    const sorted = Array.from(days).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    let cursor = new Date(); cursor.setHours(0, 0, 0, 0)
    for (const day of sorted) {
      const d = new Date(day); d.setHours(0, 0, 0, 0)
      const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000)
      if (diff <= 1) { streak++; cursor = d } else break
    }
  }

  const platforms = Array.from(new Set((accounts ?? []).map((a: { platform: string }) => a.platform)))
  const topPost = recentPosts?.[0]
    ? { content: recentPosts[0].content as string, platform: (recentPosts[0].platforms?.[0] ?? 'bluesky') as string }
    : null

  return {
    displayName: (settings.display_name as string) || 'Creator',
    totalPosts: totalPosts ?? 0,
    streak,
    platforms,
    topPost,
    joinedAt: (profile?.created_at as string) ?? new Date().toISOString(),
    achievements: achievements?.length ?? 0,
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> }
): Promise<Metadata> {
  const { code } = await params
  const stats = await getZenithStats(code)
  if (!stats) return { title: 'Not Found' }
  return {
    title: `${stats.displayName}'s ZENITH — SocialMate`,
    description: `${stats.totalPosts.toLocaleString()} posts, ${stats.streak}-day streak, active across ${stats.platforms.length} platform${stats.platforms.length === 1 ? '' : 's'}. Built with SocialMate.`,
  }
}

export default async function PublicZenithPage(
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const stats = await getZenithStats(code)
  if (!stats) notFound()

  const joinedYear = new Date(stats.joinedAt).getFullYear()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-10">

        <div className="text-center mb-8">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">Creator presence</p>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">ZENITH</h1>
          <p className="text-gray-400 text-sm">{stats.displayName}&apos;s glow across the web.</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-amber-500/20 rounded-3xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-extrabold">
                {stats.displayName[0]?.toUpperCase() ?? 'C'}
              </div>
              <div>
                <p className="text-xl font-extrabold">{stats.displayName}</p>
                <p className="text-xs text-gray-500">Creator since {joinedYear}</p>
              </div>
            </div>
          </div>

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

          {stats.platforms.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">Active on</p>
              <div className="flex flex-wrap gap-2">
                {stats.platforms.map(p => (
                  <span key={p} className={`text-xs font-bold px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 ${PLATFORM_COLORS[p] ?? 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                    <PlatformGlyph id={p} size={12} /> {p.charAt(0).toUpperCase() + p.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {stats.topPost && (
            <div className="bg-black/20 rounded-2xl p-4">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">Latest post</p>
              <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">{stats.topPost.content}</p>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-gray-600">socialmate.studio</p>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-400/40" />
              <div className="w-2 h-2 rounded-full bg-amber-300/30" />
            </div>
          </div>
        </div>

        <Link href="/signup"
          className="block text-center bg-amber-500 hover:bg-amber-400 text-black font-bold py-3.5 rounded-2xl transition-all text-sm">
          Build your own ZENITH — free →
        </Link>

      </div>
    </div>
  )
}
