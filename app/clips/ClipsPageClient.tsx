'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

type ActivePlatform = 'twitch' | 'youtube'

interface ClipConnection {
  channel_id: string
  channel_name: string | null
  channel_avatar: string | null
}

interface Clip {
  id: string
  title: string
  thumbnail_url: string
  url: string
  view_count: number
  duration: number
  created_at: string
}

interface YTVideo {
  id: string
  title: string
  thumbnail_url: string
  url: string
  published_at: string
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 ${
        type === 'success'
          ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700'
          : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700'
      }`}
    >
      <span>{type === 'success' ? '✅' : '❌'}</span>
      <span>{message}</span>
    </div>
  )
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatViews(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return String(count)
}

export default function ClipsPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [activePlatform, setActivePlatform] = useState<ActivePlatform>('twitch')

  // ── Twitch state ───────────────────────────────────────────────────────────
  const [connection, setConnection]   = useState<ClipConnection | null>(null)
  const [clips, setClips]             = useState<Clip[]>([])
  const [loadingConn, setLoadingConn] = useState(true)
  const [loadingClips, setLoadingClips] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [toast, setToast]             = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // ── YouTube state ──────────────────────────────────────────────────────────
  const [ytVideos, setYtVideos]               = useState<YTVideo[]>([])
  const [ytConnected, setYtConnected]         = useState(false)
  const [ytChannelName, setYtChannelName]     = useState('')
  const [ytLoading, setYtLoading]             = useState(true)
  const [ytError, setYtError]                 = useState('')
  const [ytChannelUrl, setYtChannelUrl]       = useState('')
  const [ytConnecting, setYtConnecting]       = useState(false)
  const [ytConnectError, setYtConnectError]   = useState('')
  const [ytDisconnecting, setYtDisconnecting] = useState(false)

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // Handle success/error query params from OAuth redirect
  useEffect(() => {
    const success = searchParams.get('success')
    const error   = searchParams.get('error')
    if (success === 'twitch_connected') showToast('Twitch connected!', 'success')
    if (error) showToast(`Connection failed: ${error.replace(/_/g, ' ')}`, 'error')
    // Clean URL params
    if (success || error) {
      router.replace('/clips')
    }
  }, [searchParams, showToast, router])

  // Load Twitch connection from Supabase
  useEffect(() => {
    async function loadConnection() {
      setLoadingConn(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoadingConn(false); return }

      const { data } = await supabase
        .from('clip_connections')
        .select('channel_id, channel_name, channel_avatar')
        .eq('user_id', user.id)
        .eq('platform', 'twitch')
        .maybeSingle()

      setConnection(data || null)
      setLoadingConn(false)
    }
    loadConnection()
  }, [])

  // Fetch clips once connected
  const fetchClips = useCallback(async () => {
    setLoadingClips(true)
    try {
      const res = await fetch('/api/clips/twitch/list')
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || 'Failed to fetch clips', 'error')
        return
      }
      const { clips: data } = await res.json()
      setClips(data || [])
    } catch {
      showToast('Network error fetching clips', 'error')
    } finally {
      setLoadingClips(false)
    }
  }, [showToast])

  useEffect(() => {
    if (connection) fetchClips()
  }, [connection, fetchClips])

  // ── YouTube logic ──────────────────────────────────────────────────────────
  const fetchYouTubeVideos = useCallback(async () => {
    setYtLoading(true)
    setYtError('')
    try {
      const res = await fetch('/api/clips/youtube/list')
      if (!res.ok) { setYtError('Failed to load videos'); return }
      const data = await res.json()
      setYtConnected(data.connected ?? false)
      setYtChannelName(data.channelName ?? '')
      setYtVideos(data.videos ?? [])
    } catch {
      setYtError('Something went wrong loading YouTube videos')
    } finally {
      setYtLoading(false)
    }
  }, [])

  useEffect(() => { fetchYouTubeVideos() }, [fetchYouTubeVideos])

  const handleYtConnect = async () => {
    if (!ytChannelUrl.trim()) return
    setYtConnecting(true)
    setYtConnectError('')
    try {
      const res = await fetch('/api/clips/youtube/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelUrl: ytChannelUrl.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setYtConnectError(data.error ?? 'Failed to connect channel'); return }
      setYtChannelUrl('')
      await fetchYouTubeVideos()
    } catch {
      setYtConnectError('Something went wrong — please try again')
    } finally {
      setYtConnecting(false)
    }
  }

  const handleYtDisconnect = async () => {
    setYtDisconnecting(true)
    try {
      await fetch('/api/clips/youtube/disconnect', { method: 'POST' })
      setYtConnected(false)
      setYtVideos([])
      setYtChannelName('')
    } catch { /* silent */ } finally {
      setYtDisconnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Twitch? Your clips will no longer be accessible.')) return
    setDisconnecting(true)
    try {
      const res = await fetch('/api/clips/twitch/disconnect', { method: 'POST' })
      if (res.ok) {
        setConnection(null)
        setClips([])
        showToast('Twitch disconnected', 'success')
      } else {
        showToast('Failed to disconnect', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setDisconnecting(false)
    }
  }

  // unified layout with platform tab switcher
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>Clips Studio</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Import your best clips and videos directly into a scheduled post
        </p>
      </div>

      {/* Platform tab switcher */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActivePlatform('twitch')}
          className={'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ' + (activePlatform === 'twitch' ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-purple-300 dark:hover:border-purple-700')}>
          🟣 Twitch
        </button>
        <button
          onClick={() => setActivePlatform('youtube')}
          className={'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ' + (activePlatform === 'youtube' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-red-300 dark:hover:border-red-700')}>
          ▶️ YouTube
        </button>
      </div>

      {/* TWITCH TAB */}
      {activePlatform === 'twitch' && (
        <div>
          {loadingConn ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-sm" style={{ color: 'var(--text-faint)' }}>Loading…</div>
            </div>
          ) : !connection ? (
            <div className="rounded-2xl p-8 text-center max-w-md mx-auto" style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)' }}>
              <div className="text-5xl mb-4">🟣</div>
              <h2 className="text-lg font-extrabold mb-2" style={{ color: 'var(--text)' }}>Connect Twitch</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Connect your Twitch account to browse and schedule your clips.</p>
              <a
                href="/api/clips/twitch/connect"
                className="inline-block px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: '#9146FF' }}>
                Connect Twitch
              </a>
            </div>
          ) : (
            <div>
              {/* Connected header */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  {connection.channel_avatar ? (
                    <Image src={connection.channel_avatar} alt={connection.channel_name || 'Channel avatar'} width={44} height={44} className="rounded-full" />
                  ) : (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold" style={{ background: '#9146FF' }}>
                      {(connection.channel_name || 'T')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-base" style={{ color: 'var(--text)' }}>{connection.channel_name}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: '#9146FF' }}>Connected</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={fetchClips} disabled={loadingClips} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50" style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)', color: 'var(--text)' }}>
                    {loadingClips ? '⏳' : '🔄'} {loadingClips ? 'Fetching…' : 'Refresh'}
                  </button>
                  <button onClick={handleDisconnect} disabled={disconnecting} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50" style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)', color: 'var(--text-muted)' }}>
                    {disconnecting ? 'Disconnecting…' : 'Disconnect'}
                  </button>
                </div>
              </div>
              {/* Clips grid */}
              {loadingClips && clips.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-sm" style={{ color: 'var(--text-faint)' }}>Loading clips…</div>
                </div>
              ) : clips.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-4xl mb-3">🎬</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No clips found for this channel.</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Create some clips on Twitch, then hit Refresh.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {clips.map(clip => <ClipCard key={clip.id} clip={clip} />)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* YOUTUBE TAB */}
      {activePlatform === 'youtube' && (
        <div>
          {ytLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
          ) : ytError ? (
            <div className="text-center py-20">
              <p className="text-sm text-red-500 mb-4">{ytError}</p>
              <button onClick={fetchYouTubeVideos} className="text-xs font-bold underline" style={{ color: 'var(--text-muted)' }}>Try again</button>
            </div>
          ) : !ytConnected ? (
            <div className="rounded-2xl p-8 max-w-md mx-auto" style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)' }}>
              <div className="text-5xl mb-4 text-center">▶️</div>
              <h2 className="text-lg font-extrabold mb-2 text-center" style={{ color: 'var(--text)' }}>Connect YouTube Channel</h2>
              <p className="text-sm mb-6 text-center" style={{ color: 'var(--text-muted)' }}>Paste your channel URL to import your latest videos — no API key needed.</p>
              <div className="space-y-3">
                <input
                  type="url"
                  value={ytChannelUrl}
                  onChange={e => { setYtChannelUrl(e.target.value); setYtConnectError('') }}
                  placeholder="https://youtube.com/@yourchannel"
                  className="w-full text-sm rounded-xl px-4 py-3 outline-none transition-all"
                  style={{ border: '1px solid var(--border-mid)', background: 'var(--surface-hover)', color: 'var(--text)' }}
                  onKeyDown={e => { if (e.key === 'Enter') handleYtConnect() }}
                />
                {ytConnectError && <p className="text-xs text-red-500">{ytConnectError}</p>}
                <button
                  onClick={handleYtConnect}
                  disabled={ytConnecting || !ytChannelUrl.trim()}
                  className="w-full py-3 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: '#FF0000' }}>
                  {ytConnecting ? 'Connecting...' : 'Connect Channel'}
                </button>
              </div>
              <p className="text-xs text-center mt-4" style={{ color: 'var(--text-faint)' }}>Supports youtube.com/@handle and youtube.com/channel/UC...</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: '#FF0000' }}>
                    Y
                  </div>
                  <div>
                    <p className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>{ytChannelName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{ytVideos.length} recent videos</p>
                  </div>
                </div>
                <button onClick={handleYtDisconnect} disabled={ytDisconnecting} className="text-xs font-semibold transition-colors" style={{ color: 'var(--text-faint)' }}>
                  {ytDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
              {ytVideos.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No public videos found on this channel.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {ytVideos.map(video => <YTVideoCard key={video.id} video={video} />)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

function ClipCard({ clip }: { clip: Clip }) {
  const router = useRouter()
  const scheduleContent = `Check out my latest clip: ${clip.title} ${clip.url}`

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all hover:shadow-lg"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)' }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-black">
        {clip.thumbnail_url ? (
          <Image
            src={clip.thumbnail_url}
            alt={clip.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl">🎬</span>
          </div>
        )}
        {/* Play icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all">
          <a
            href={clip.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            aria-label={`Watch ${clip.title}`}
          >
            <span className="text-lg leading-none ml-0.5">▶</span>
          </a>
        </div>
        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg text-xs font-bold text-white" style={{ background: 'rgba(0,0,0,0.7)' }}>
          {formatDuration(clip.duration)}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: 'var(--text)' }} title={clip.title}>
          {clip.title}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
          👁 {formatViews(clip.view_count)} views
        </p>

        <button
          onClick={() => router.push(`/compose?content=${encodeURIComponent(scheduleContent)}`)}
          className="mt-auto w-full py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'var(--accent, #7c3aed)' }}
        >
          📅 Schedule
        </button>
      </div>
    </div>
  )
}

function YTVideoCard({ video }: { video: YTVideo }) {
  const router = useRouter()
  const scheduleContent = `${video.title}\n\n${video.url}`

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all hover:shadow-lg"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)' }}
    >
      <div className="relative aspect-video bg-black">
        <Image
          src={video.thumbnail_url}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            aria-label={`Watch ${video.title}`}
          >
            <span className="text-lg leading-none ml-0.5">▶</span>
          </a>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: 'var(--text)' }} title={video.title}>
          {video.title}
        </p>
        {video.published_at && (
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            {new Date(video.published_at).toLocaleDateString()}
          </p>
        )}
        <button
          onClick={() => router.push(`/compose?content=${encodeURIComponent(scheduleContent)}`)}
          className="mt-auto w-full py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: '#FF0000' }}
        >
          📅 Schedule
        </button>
      </div>
    </div>
  )
}
