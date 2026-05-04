'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_FILE_BYTES   = 500 * 1024 * 1024  // 500 MB
const MAX_DURATION_S   = 600                 // 10 minutes
const MIN_DURATION_S   = 3
const ACCEPTED_FORMATS = ['video/mp4', 'video/quicktime']
const CANVAS_W         = 720
const CANVAS_H         = 1280

const FILTERS: Record<string, string> = {
  'None':          '',
  'Amber':         'sepia(0.4) saturate(1.3) brightness(1.05)',
  'Light Blue':    'hue-rotate(190deg) saturate(0.9) brightness(1.1)',
  'B&W':           'grayscale(1)',
  'Dark Contrast': 'contrast(1.4) brightness(0.9)',
  'Warm':          'sepia(0.2) saturate(1.4) hue-rotate(-10deg)',
  'Cool':          'hue-rotate(20deg) saturate(0.85) brightness(1.05)',
  'Cinematic':     'contrast(1.15) saturate(0.85) brightness(0.95) sepia(0.1)',
}

const CAPTION_COLORS   = ['#ffffff', '#000000', '#facc15', '#ef4444', '#22d3ee']
const PRIVACY_OPTIONS  = [
  { value: 'PUBLIC_TO_EVERYONE',      label: '🌍 Public' },
  { value: 'MUTUAL_FOLLOW_FRIENDS',   label: '👥 Friends' },
  { value: 'SELF_ONLY',               label: '🔒 Private' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(s: number) {
  const m   = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function formatBytes(b: number) {
  return b < 1024 * 1024
    ? `${(b / 1024).toFixed(0)} KB`
    : `${(b / (1024 * 1024)).toFixed(1)} MB`
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Sound = {
  id:         string
  name:       string
  artist:     string
  duration:   number
  cover_url?: string
  is_original?: boolean
}

type CreatorInfo = {
  connected:    boolean
  account_name?: string
  avatar_url?:  string
  open_id?:     string
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TikTokStudioClient() {
  // Connection state
  const [creator, setCreator]         = useState<CreatorInfo | null>(null)
  const [creatorLoading, setCreatorLoading] = useState(true)

  // File state
  const [videoFile, setVideoFile]     = useState<File | null>(null)
  const [videoUrl, setVideoUrl]       = useState<string | null>(null)
  const [dragOver, setDragOver]       = useState(false)
  const [fileError, setFileError]     = useState<string | null>(null)

  // Playback state
  const [videoDuration, setVideoDuration] = useState(0)
  const [currentTime, setCurrentTime]     = useState(0)
  const [isPlaying, setIsPlaying]         = useState(false)
  const [trimStart, setTrimStart]         = useState(0)
  const [trimEnd, setTrimEnd]             = useState(0)
  const [volume, setVolume]               = useState(100)

  // Edit state
  const [activeFilter, setActiveFilter]         = useState('None')
  const [captionOverlay, setCaptionOverlay]     = useState('')
  const [captionPosition, setCaptionPosition]   = useState<'top' | 'center' | 'bottom'>('bottom')
  const [captionColor, setCaptionColor]         = useState('#ffffff')
  const [captionBg, setCaptionBg]               = useState(true)
  const [captionFontSize, setCaptionFontSize]   = useState(32)

  // Post settings state
  const [toolTab, setToolTab] = useState<'filters' | 'captions' | 'audio' | 'post'>('filters')
  const [postCaption, setPostCaption]           = useState('')
  const [hashtags, setHashtags]                 = useState<string[]>([])
  const [hashtagInput, setHashtagInput]         = useState('')
  const [privacyLevel, setPrivacyLevel]         = useState('PUBLIC_TO_EVERYONE')
  const [disableDuet, setDisableDuet]           = useState(false)
  const [disableComment, setDisableComment]     = useState(false)
  const [disableStitch, setDisableStitch]       = useState(false)
  const [scheduleMode, setScheduleMode]         = useState<'now' | 'schedule'>('now')
  const [scheduledAt, setScheduledAt]           = useState('')

  // Sound state
  const [soundQuery, setSoundQuery]     = useState('')
  const [sounds, setSounds]             = useState<Sound[]>([])
  const [soundNote, setSoundNote]       = useState('')
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null)
  const [soundLoading, setSoundLoading] = useState(false)

  // AI hashtags
  const [aiHashtagLoading, setAiHashtagLoading] = useState(false)

  // Export / upload / post state
  const [exporting, setExporting]   = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [posting, setPosting]       = useState(false)
  const [postError, setPostError]   = useState<string | null>(null)
  const [postSuccess, setPostSuccess] = useState(false)

  // Refs
  const videoRef    = useRef<HTMLVideoElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const animRef     = useRef<number | null>(null)
  // AudioContext refs — createMediaElementSource can only be called once per element
  const audioCtxRef = useRef<AudioContext | null>(null)
  const audioSrcRef = useRef<MediaElementAudioSourceNode | null>(null)

  // Reset audio nodes when video file changes so createMediaElementSource isn't called twice
  useEffect(() => {
    audioSrcRef.current = null
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
  }, [videoFile])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioSrcRef.current = null
      audioCtxRef.current?.close().catch(() => {})
    }
  }, [])

  // ── Load creator info on mount ──────────────────────────────────────────────

  useEffect(() => {
    fetch('/api/tiktok/creator-info')
      .then(r => r.json())
      .then(setCreator)
      .catch(() => setCreator({ connected: false }))
      .finally(() => setCreatorLoading(false))
  }, [])

  // Load default sounds on mount
  useEffect(() => {
    fetch('/api/tiktok/sounds')
      .then(r => r.json())
      .then(data => {
        setSounds(data.sounds ?? [])
        setSoundNote(data.note ?? '')
      })
      .catch(() => {})
  }, [])

  // ── Video player sync ───────────────────────────────────────────────────────

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.volume = volume / 100
  }, [volume])

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setCurrentTime(v.currentTime)
    if (v.currentTime >= trimEnd && trimEnd > 0) {
      v.pause()
      setIsPlaying(false)
    }
  }, [trimEnd])

  const handleVideoLoaded = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setVideoDuration(v.duration)
    setTrimEnd(v.duration)
  }, [])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (isPlaying) {
      v.pause()
      setIsPlaying(false)
    } else {
      if (v.currentTime >= trimEnd) v.currentTime = trimStart
      v.play()
      setIsPlaying(true)
    }
  }, [isPlaying, trimStart, trimEnd])

  // ── Canvas frame renderer ───────────────────────────────────────────────────

  const drawFrame = useCallback(() => {
    const v   = videoRef.current
    const ctx = canvasRef.current?.getContext('2d')
    if (!v || !ctx || v.readyState < 2) return

    const filter = FILTERS[activeFilter] || ''
    ctx.filter = filter || 'none'
    ctx.drawImage(v, 0, 0, CANVAS_W, CANVAS_H)
    ctx.filter = 'none'

    if (captionOverlay) {
      ctx.font         = `bold ${captionFontSize}px Inter, sans-serif`
      ctx.textAlign    = 'center'
      const lineHeight = captionFontSize * 1.3
      const lines      = captionOverlay.match(/.{1,40}/g) || []
      const totalH     = lines.length * lineHeight
      const yBase      = captionPosition === 'top'
        ? 80
        : captionPosition === 'center'
          ? CANVAS_H / 2 - totalH / 2
          : CANVAS_H - 120 - totalH

      lines.forEach((line, i) => {
        const y = yBase + i * lineHeight
        if (captionBg) {
          const w = ctx.measureText(line).width
          ctx.fillStyle = 'rgba(0,0,0,0.55)'
          ctx.fillRect(CANVAS_W / 2 - w / 2 - 12, y - captionFontSize, w + 24, captionFontSize + 10)
        }
        ctx.fillStyle = captionColor
        ctx.fillText(line, CANVAS_W / 2, y)
      })
    }
  }, [activeFilter, captionOverlay, captionFontSize, captionPosition, captionColor, captionBg])

  useEffect(() => {
    if (!isPlaying || !videoRef.current) return
    const loop = () => { drawFrame(); animRef.current = requestAnimationFrame(loop) }
    animRef.current = requestAnimationFrame(loop)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [isPlaying, drawFrame])

  // ── File handling ───────────────────────────────────────────────────────────

  const handleFile = useCallback((file: File) => {
    setFileError(null)
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      setFileError('Only MP4 and MOV files are supported.')
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError(`File too large. Max 500 MB (yours: ${formatBytes(file.size)}).`)
      return
    }

    const url = URL.createObjectURL(file)
    const tempVideo = document.createElement('video')
    tempVideo.src = url
    tempVideo.onloadedmetadata = () => {
      if (tempVideo.duration < MIN_DURATION_S) {
        setFileError(`Video too short. Minimum ${MIN_DURATION_S} seconds.`)
        URL.revokeObjectURL(url)
        return
      }
      if (tempVideo.duration > MAX_DURATION_S) {
        setFileError(`Video too long. Maximum 10 minutes (yours: ${formatTime(tempVideo.duration)}).`)
        URL.revokeObjectURL(url)
        return
      }
      setVideoFile(file)
      setVideoUrl(url)
      setTrimStart(0)
      setTrimEnd(tempVideo.duration)
      setCurrentTime(0)
      setIsPlaying(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  // ── Sound search ────────────────────────────────────────────────────────────

  const searchSounds = useCallback(async (q: string) => {
    setSoundLoading(true)
    try {
      const res  = await fetch(`/api/tiktok/sounds?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSounds(data.sounds ?? [])
      setSoundNote(data.note ?? '')
    } catch {
      // keep current list
    } finally {
      setSoundLoading(false)
    }
  }, [])

  // ── AI hashtag suggestions ──────────────────────────────────────────────────

  const suggestHashtags = useCallback(async () => {
    if (!postCaption) return
    setAiHashtagLoading(true)
    try {
      const res  = await fetch('/api/ai/hashtags', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ content: postCaption, platform: 'tiktok' }),
      })
      const data = await res.json()
      if (data.hashtags) {
        const newTags = (data.hashtags as string[])
          .map(t => t.replace(/^#/, ''))
          .filter(t => !hashtags.includes(t))
        setHashtags(prev => [...prev, ...newTags].slice(0, 30))
      }
    } catch {
      // non-fatal
    } finally {
      setAiHashtagLoading(false)
    }
  }, [postCaption, hashtags])

  // ── Export + upload + post ──────────────────────────────────────────────────

  const handlePost = useCallback(async () => {
    if (!videoFile || !videoUrl) return
    setPostError(null)
    setUploading(true)

    try {
      // Use the original file directly — TikTok only accepts MP4/H.264, not WebM.
      // Canvas re-encoding (for filters/trim) produces WebM which TikTok rejects.
      const uploadBlob = videoFile
      const mimeType   = videoFile.type === 'video/quicktime' ? 'video/mp4' : videoFile.type

      // Step 1: Initialize FILE_UPLOAD with TikTok — returns upload_url + publish_id
      const initRes = await fetch('/api/tiktok/init-upload', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          video_size:      uploadBlob.size,
          post_caption:    postCaption,
          hashtags,
          privacy_level:   privacyLevel,
          disable_duet:    disableDuet,
          disable_comment: disableComment,
          disable_stitch:  disableStitch,
          sound_id:        selectedSound?.id || null,
        }),
      })
      const initData = await initRes.json()
      if (!initRes.ok) throw new Error(initData.error || 'Failed to initialize TikTok upload')
      const { upload_url, publish_id, open_id, full_caption } = initData

      // Step 2: PUT original file directly to TikTok's upload URL (single-chunk)
      const end = uploadBlob.size - 1
      const tikPutRes = await fetch(upload_url, {
        method:  'PUT',
        body:    uploadBlob,
        headers: {
          'Content-Type':   mimeType,
          'Content-Range':  `bytes 0-${end}/${uploadBlob.size}`,
          'Content-Length': String(uploadBlob.size),
        },
      })
      if (!tikPutRes.ok) {
        const errText = await tikPutRes.text().catch(() => '')
        throw new Error(`TikTok upload failed (${tikPutRes.status})${errText ? ': ' + errText.slice(0, 200) : ''}`)
      }

      setUploading(false)
      setPosting(true)

      // Step 3: Record the post in our DB + decrement quota
      const confirmRes = await fetch('/api/tiktok/confirm-upload', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          publish_id,
          open_id,
          full_caption,
          video_size_bytes:       uploadBlob.size,
          video_duration_seconds: videoDuration,
          post_caption:           postCaption,
          hashtags,
          caption_overlay:        captionOverlay,
          caption_position:       captionPosition,
          caption_color:          captionColor,
          active_filter:          activeFilter,
          sound_id:               selectedSound?.id || null,
          sound_name:             selectedSound?.name || null,
          privacy_level:          privacyLevel,
          disable_duet:           disableDuet,
          disable_comment:        disableComment,
          disable_stitch:         disableStitch,
          scheduled_at:           scheduleMode === 'schedule' && scheduledAt ? scheduledAt : null,
        }),
      })
      const confirmData = await confirmRes.json()
      if (!confirmRes.ok) throw new Error(confirmData.error || 'Failed to save post record')

      setPostSuccess(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setPostError(msg)
    } finally {
      setExporting(false)
      setUploading(false)
      setPosting(false)
    }
  }, [
    videoFile, videoUrl, trimStart, trimEnd, drawFrame,
    postCaption, hashtags, captionOverlay, captionPosition, captionColor,
    activeFilter, selectedSound, privacyLevel, disableDuet, disableComment,
    disableStitch, scheduleMode, scheduledAt,
  ])

  // ── Render ──────────────────────────────────────────────────────────────────

  const isWorking  = uploading || posting
  const charCount  = postCaption.length + (hashtags.length ? hashtags.map(t => `#${t}`).join(' ').length + 2 : 0)

  if (creatorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-sm text-gray-400">Checking TikTok connection…</div>
      </div>
    )
  }

  if (!creator?.connected) {
    return (
      <div className="min-h-dvh bg-gray-950 flex">
        <Sidebar />
        <div className="md:ml-56 flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="text-6xl mb-6">🎵</div>
            <h1 className="text-2xl font-extrabold text-white mb-2">TikTok Studio</h1>
            <p className="text-gray-400 mb-8">
              Connect your TikTok account to start editing and publishing videos directly from SocialMate.
            </p>
            <a
              href="/api/tiktok/auth"
              className="inline-block bg-[#ff0050] text-white font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm"
            >
              Connect TikTok →
            </a>
            <p className="text-xs text-gray-600 mt-4">
              Uses TikTok Login Kit + Content Posting API. Your credentials are never stored in plain text.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (postSuccess) {
    return (
      <div className="min-h-dvh bg-gray-950 flex">
        <Sidebar />
        <div className="md:ml-56 flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-extrabold text-white mb-2">
              {scheduleMode === 'schedule' ? 'Video Scheduled!' : 'Video Posted to TikTok!'}
            </h2>
            <p className="text-gray-400 mb-8">
              {scheduleMode === 'schedule'
                ? `Your video will go live on ${new Date(scheduledAt).toLocaleString()}.`
                : 'Your video is live on TikTok. It may take a minute to appear.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setPostSuccess(false)
                  setVideoFile(null)
                  setVideoUrl(null)
                  setPostCaption('')
                  setHashtags([])
                  setSelectedSound(null)
                }}
                className="bg-[#ff0050] text-white font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90"
              >
                Create Another
              </button>
              <Link href="/dashboard" className="bg-gray-800 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-gray-700">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gray-950 flex">
      <Sidebar />

      <div className="md:ml-56 flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-gray-950 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎵</span>
            <span className="font-extrabold text-white tracking-tight">TikTok Studio</span>
            <span className="text-xs bg-[#ff0050]/20 text-[#ff0050] font-bold px-2 py-0.5 rounded-full">BETA</span>
          </div>
          <div className="flex items-center gap-3">
            {creator.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={creator.avatar_url} alt="" className="w-7 h-7 rounded-full" />
            )}
            <span className="text-xs text-gray-400">{creator.account_name}</span>
            <button
              onClick={() => fetch('/api/tiktok/disconnect', { method: 'POST' }).then(() => setCreator({ connected: false }))}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* ── LEFT: Video editor ── */}
          <div className="flex flex-col flex-1 min-w-0 border-r border-gray-800">

            {/* Canvas / upload zone */}
            <div className="flex-1 flex items-center justify-center bg-black p-6">
              {!videoUrl ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    w-64 aspect-[9/16] flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all
                    ${dragOver ? 'border-[#ff0050] bg-[#ff0050]/10' : 'border-gray-700 hover:border-gray-500 bg-gray-900/50'}
                  `}
                >
                  <div className="text-4xl">📱</div>
                  <div className="text-center px-4">
                    <p className="text-sm font-bold text-white">Drop your video here</p>
                    <p className="text-xs text-gray-500 mt-1">MP4 or MOV · Max 500 MB · 3s–10min</p>
                    <p className="text-xs text-gray-600 mt-0.5">9:16 vertical recommended</p>
                  </div>
                  <button className="text-xs bg-[#ff0050] text-white font-bold px-4 py-2 rounded-xl hover:opacity-90">
                    Browse files
                  </button>
                  {fileError && (
                    <p className="text-xs text-red-400 text-center px-4 mt-1">{fileError}</p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp4,.mov,video/mp4,video/quicktime"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="relative" style={{ height: '70vh' }}>
                  {/* 9:16 phone frame */}
                  <div
                    className="relative overflow-hidden rounded-[24px] border-2 border-gray-700 shadow-2xl"
                    style={{
                      width:  'calc(70vh * 9 / 16)',
                      height: '70vh',
                    }}
                  >
                    {/* Hidden video for decoding */}
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      className="absolute inset-0 opacity-0 pointer-events-none"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleVideoLoaded}
                      playsInline
                      muted={false}
                    />
                    {/* Canvas preview with filter + caption */}
                    <canvas
                      ref={canvasRef}
                      width={CANVAS_W}
                      height={CANVAS_H}
                      className="w-full h-full"
                      style={{ filter: FILTERS[activeFilter] || 'none' }}
                    />
                    {/* Play overlay */}
                    <button
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all"
                    >
                      <span className="text-5xl opacity-80">
                        {isPlaying ? '⏸' : '▶️'}
                      </span>
                    </button>
                    {/* Caption preview overlay */}
                    {captionOverlay && (
                      <div
                        className={`absolute left-0 right-0 px-4 text-center pointer-events-none ${
                          captionPosition === 'top'    ? 'top-6'
                          : captionPosition === 'center' ? 'top-1/2 -translate-y-1/2'
                          : 'bottom-16'
                        }`}
                      >
                        <span
                          className="inline-block px-3 py-1 rounded-lg text-sm font-bold leading-snug"
                          style={{
                            color:      captionColor,
                            fontSize:   `${captionFontSize * 0.018}em`,
                            background: captionBg ? 'rgba(0,0,0,0.55)' : 'transparent',
                          }}
                        >
                          {captionOverlay}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Change video button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute top-2 right-2 text-xs bg-gray-900/80 text-gray-300 px-3 py-1.5 rounded-xl hover:bg-gray-800 border border-gray-700"
                  >
                    Change
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp4,.mov,video/mp4,video/quicktime"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
              )}
            </div>

            {/* Timeline + trim controls */}
            {videoUrl && (
              <div className="px-6 py-4 border-t border-gray-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-gray-600">
                    Clip: {formatTime(trimStart)} → {formatTime(trimEnd)}
                    {' '}({formatTime(trimEnd - trimStart)})
                  </span>
                  <span>{formatTime(videoDuration)}</span>
                </div>
                {/* Trim range */}
                <div className="relative h-2 bg-gray-800 rounded-full">
                  <div
                    className="absolute h-full bg-[#ff0050]/30 rounded-full"
                    style={{
                      left:  `${(trimStart / videoDuration) * 100}%`,
                      width: `${((trimEnd - trimStart) / videoDuration) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute h-full w-0.5 bg-white rounded-full"
                    style={{ left: `${(currentTime / videoDuration) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Trim start</label>
                    <input
                      type="range" min={0} max={trimEnd - MIN_DURATION_S} step={0.1}
                      value={trimStart}
                      onChange={e => {
                        const v = parseFloat(e.target.value)
                        setTrimStart(v)
                        if (videoRef.current) videoRef.current.currentTime = v
                      }}
                      className="w-full accent-[#ff0050]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Trim end</label>
                    <input
                      type="range" min={trimStart + MIN_DURATION_S} max={videoDuration} step={0.1}
                      value={trimEnd}
                      onChange={e => setTrimEnd(parseFloat(e.target.value))}
                      className="w-full accent-[#ff0050]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tool tabs */}
            {videoUrl && (
              <div className="border-t border-gray-800">
                <div className="flex">
                  {(['filters', 'captions', 'audio', 'post'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setToolTab(tab)}
                      className={`flex-1 py-3 text-xs font-bold capitalize transition-colors ${
                        toolTab === tab
                          ? 'text-[#ff0050] border-b-2 border-[#ff0050] bg-gray-900'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {tab === 'filters' ? '🎨 Filters' : tab === 'captions' ? '💬 Text' : tab === 'audio' ? '🔊 Audio' : '📱 Post'}
                    </button>
                  ))}
                </div>

                <div className="p-4">
                  {/* Filters tab */}
                  {toolTab === 'filters' && (
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(FILTERS).map(f => (
                        <button
                          key={f}
                          onClick={() => setActiveFilter(f)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            activeFilter === f
                              ? 'bg-[#ff0050] border-[#ff0050] text-white'
                              : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Captions tab */}
                  {toolTab === 'captions' && (
                    <div className="space-y-3">
                      <textarea
                        value={captionOverlay}
                        onChange={e => setCaptionOverlay(e.target.value)}
                        placeholder="Text overlay on video…"
                        rows={2}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:border-[#ff0050] outline-none"
                      />
                      <div className="flex flex-wrap gap-2">
                        {(['top', 'center', 'bottom'] as const).map(pos => (
                          <button
                            key={pos}
                            onClick={() => setCaptionPosition(pos)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              captionPosition === pos
                                ? 'bg-[#ff0050] border-[#ff0050] text-white'
                                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                            }`}
                          >
                            {pos}
                          </button>
                        ))}
                        {CAPTION_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => setCaptionColor(c)}
                            className={`w-7 h-7 rounded-full border-2 transition-all ${
                              captionColor === c ? 'border-white scale-110' : 'border-gray-600'
                            }`}
                            style={{ background: c }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-xs text-gray-400">Font size: {captionFontSize}px</label>
                        <input
                          type="range" min={20} max={56} step={2}
                          value={captionFontSize}
                          onChange={e => setCaptionFontSize(parseInt(e.target.value))}
                          className="flex-1 accent-[#ff0050]"
                        />
                        <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={captionBg}
                            onChange={e => setCaptionBg(e.target.checked)}
                            className="accent-[#ff0050]"
                          />
                          BG
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Audio tab */}
                  {toolTab === 'audio' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Original audio volume: {volume}%</label>
                        <input
                          type="range" min={0} max={100}
                          value={volume}
                          onChange={e => setVolume(parseInt(e.target.value))}
                          className="w-full accent-[#ff0050]"
                        />
                      </div>

                      {/* Sound picker */}
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">TikTok Sound</label>
                        <div className="flex gap-2">
                          <input
                            value={soundQuery}
                            onChange={e => setSoundQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && searchSounds(soundQuery)}
                            placeholder="Search sounds…"
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[#ff0050] outline-none"
                          />
                          <button
                            onClick={() => searchSounds(soundQuery)}
                            disabled={soundLoading}
                            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                          >
                            {soundLoading ? '…' : '🔍'}
                          </button>
                        </div>
                        {soundNote && (
                          <p className="text-xs text-amber-500 mt-1">{soundNote}</p>
                        )}
                        <div className="mt-2 space-y-1 max-h-36 overflow-y-auto">
                          {sounds.map(s => (
                            <button
                              key={s.id}
                              onClick={() => setSelectedSound(s.id === selectedSound?.id ? null : s)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs transition-all ${
                                selectedSound?.id === s.id
                                  ? 'bg-[#ff0050]/20 border border-[#ff0050]/40 text-white'
                                  : 'bg-gray-900 border border-gray-800 text-gray-300 hover:border-gray-600'
                              }`}
                            >
                              <span className="text-base">{s.is_original ? '🎙️' : '🎵'}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{s.name}</p>
                                {s.artist && <p className="text-gray-500 truncate">{s.artist}</p>}
                              </div>
                              {s.duration > 0 && (
                                <span className="text-gray-500 shrink-0">{formatTime(s.duration)}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Post settings tab (mobile/compact) */}
                  {toolTab === 'post' && (
                    <div className="space-y-3 lg:hidden">
                      <p className="text-xs text-gray-500">Edit caption and schedule in the panel →</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Post settings panel ── */}
          <div className="w-80 xl:w-96 flex flex-col bg-gray-950 overflow-y-auto hidden lg:flex">
            <div className="flex-1 p-5 space-y-5">

              {/* Caption */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Caption
                </label>
                <textarea
                  value={postCaption}
                  onChange={e => setPostCaption(e.target.value.slice(0, 2200))}
                  placeholder="Describe your video…"
                  rows={5}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 resize-none focus:border-[#ff0050] outline-none"
                />
                <p className="text-xs text-gray-600 mt-1">{charCount} / 2200</p>
              </div>

              {/* Hashtags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hashtags</label>
                  <button
                    onClick={suggestHashtags}
                    disabled={!postCaption || aiHashtagLoading}
                    className="text-xs text-[#ff0050] disabled:opacity-40 hover:underline font-semibold"
                  >
                    {aiHashtagLoading ? 'Thinking…' : '✦ AI Suggest (5 cr)'}
                  </button>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    value={hashtagInput}
                    onChange={e => setHashtagInput(e.target.value.replace(/^#/, ''))}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        const tag = hashtagInput.trim()
                        if (tag && !hashtags.includes(tag) && hashtags.length < 30) {
                          setHashtags(prev => [...prev, tag])
                          setHashtagInput('')
                        }
                      }
                    }}
                    placeholder="#fyp · press Enter to add"
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-[#ff0050] outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {hashtags.map(tag => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded-xl text-xs text-gray-200"
                    >
                      #{tag}
                      <button
                        onClick={() => setHashtags(prev => prev.filter(t => t !== tag))}
                        className="text-gray-500 hover:text-red-400 leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Selected sound badge */}
              {selectedSound && (
                <div className="flex items-center gap-2 px-3 py-2 bg-[#ff0050]/10 border border-[#ff0050]/30 rounded-xl text-xs text-[#ff0050]">
                  <span>🎵</span>
                  <span className="flex-1 font-semibold truncate">{selectedSound.name}</span>
                  <button onClick={() => setSelectedSound(null)} className="opacity-60 hover:opacity-100">×</button>
                </div>
              )}

              {/* Privacy */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Privacy</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {PRIVACY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPrivacyLevel(opt.value)}
                      className={`px-2 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        privacyLevel === opt.value
                          ? 'bg-[#ff0050] border-[#ff0050] text-white'
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interaction toggles */}
              <div className="space-y-1.5">
                {[
                  { key: 'duet',    label: 'Disable Duets',   val: disableDuet,    set: setDisableDuet },
                  { key: 'stitch',  label: 'Disable Stitch',  val: disableStitch,  set: setDisableStitch },
                  { key: 'comment', label: 'Disable Comments', val: disableComment, set: setDisableComment },
                ].map(({ key, label, val, set }) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer group">
                    <span className="text-xs text-gray-400 group-hover:text-gray-300">{label}</span>
                    <button
                      onClick={() => set(!val)}
                      className={`w-9 h-5 rounded-full transition-colors relative ${val ? 'bg-[#ff0050]' : 'bg-gray-700'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${val ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </label>
                ))}
              </div>

              {/* Schedule */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">When</label>
                <div className="flex gap-2 mb-2">
                  {(['now', 'schedule'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setScheduleMode(m)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        scheduleMode === m
                          ? 'bg-[#ff0050] border-[#ff0050] text-white'
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {m === 'now' ? '⚡ Post Now' : '📅 Schedule'}
                    </button>
                  ))}
                </div>
                {scheduleMode === 'schedule' && (
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    min={new Date(Date.now() + 5 * 60_000).toISOString().slice(0, 16)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:border-[#ff0050] outline-none"
                  />
                )}
              </div>
            </div>

            {/* Sticky CTA */}
            <div className="sticky bottom-0 p-5 bg-gray-950 border-t border-gray-800 space-y-2">
              {postError && (
                <p className="text-xs text-red-400 text-center">{postError}</p>
              )}
              <button
                onClick={handlePost}
                disabled={!videoUrl || isWorking || (scheduleMode === 'schedule' && !scheduledAt)}
                className="w-full bg-[#ff0050] text-white font-extrabold py-3.5 rounded-2xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2"
              >
                {uploading ? '☁️ Uploading…'
                  : posting  ? '🚀 Publishing…'
                  : scheduleMode === 'schedule' ? '📅 Schedule Video'
                  : '🚀 Post to TikTok'}
              </button>
              <p className="text-xs text-gray-600 text-center">
                {uploading
                  ? 'Uploading your video directly to TikTok…'
                  : 'Your original video will be uploaded and published via TikTok\'s Content Posting API.'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
