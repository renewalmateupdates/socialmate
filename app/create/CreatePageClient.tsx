'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

// ── Platform specs ────────────────────────────────────────────────────────────

type PlatformSpec = {
  id: string
  name: string
  icon: string
  ratio: string
  ratioLabel: string
  maxDuration: string
  maxFileSize: string
  resolution: string
  type: 'video' | 'image' | 'both'
}

const PLATFORM_SPECS: PlatformSpec[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    ratio: '9:16',
    ratioLabel: '9:16 (Vertical)',
    maxDuration: '60s (organic) / 10min (creator)',
    maxFileSize: '287 MB',
    resolution: '1080 × 1920',
    type: 'both',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    ratio: '16:9',
    ratioLabel: '16:9 (Landscape)',
    maxDuration: 'Unlimited',
    maxFileSize: '256 GB',
    resolution: '1920 × 1080',
    type: 'video',
  },
  {
    id: 'instagram-reels',
    name: 'Instagram Reels',
    icon: '📸',
    ratio: '9:16',
    ratioLabel: '9:16 (Vertical)',
    maxDuration: '90s',
    maxFileSize: '100 MB',
    resolution: '1080 × 1920',
    type: 'video',
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: '🐦',
    ratio: '16:9',
    ratioLabel: '16:9 (Landscape)',
    maxDuration: '2m 20s',
    maxFileSize: '512 MB',
    resolution: '1920 × 1080',
    type: 'both',
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    icon: '🦋',
    ratio: '16:9',
    ratioLabel: '16:9 (Landscape)',
    maxDuration: '60s',
    maxFileSize: '50 MB',
    resolution: '1920 × 1080',
    type: 'both',
  },
  {
    id: 'twitch',
    name: 'Twitch Clip',
    icon: '🎮',
    ratio: '16:9',
    ratioLabel: '16:9 (Landscape)',
    maxDuration: '60s',
    maxFileSize: '—',
    resolution: '1920 × 1080',
    type: 'video',
  },
  {
    id: 'kick',
    name: 'Kick',
    icon: '🟢',
    ratio: '16:9',
    ratioLabel: '16:9 (Landscape)',
    maxDuration: 'Unlimited',
    maxFileSize: '2 GB',
    resolution: '1920 × 1080',
    type: 'video',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    ratio: '16:9',
    ratioLabel: '16:9 (Landscape)',
    maxDuration: '240min',
    maxFileSize: '10 GB',
    resolution: '1920 × 1080',
    type: 'both',
  },
  {
    id: 'instagram-post',
    name: 'Instagram Post',
    icon: '🖼️',
    ratio: '4:5',
    ratioLabel: '4:5 (Portrait)',
    maxDuration: '—',
    maxFileSize: '8 MB (image)',
    resolution: '1080 × 1350',
    type: 'image',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: '📌',
    ratio: '2:3',
    ratioLabel: '2:3 (Portrait)',
    maxDuration: '—',
    maxFileSize: '20 MB (image)',
    resolution: '1000 × 1500',
    type: 'image',
  },
]

// ── Filters ───────────────────────────────────────────────────────────────────

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

// ── Image templates ───────────────────────────────────────────────────────────

const IMAGE_TEMPLATES = [
  { name: 'TikTok Thumbnail',  dims: '1080 × 1920' },
  { name: 'YouTube Thumbnail', dims: '1280 × 720'  },
  { name: 'Instagram Post',    dims: '1080 × 1350' },
  { name: 'Instagram Story',   dims: '1080 × 1920' },
  { name: 'Twitter Header',    dims: '1500 × 500'  },
  { name: 'Pinterest Pin',     dims: '1000 × 1500' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getPlatformDimensions(platformId: string) {
  const map: Record<string, { width: number; height: number }> = {
    'youtube':         { width: 1920, height: 1080 },
    'instagram-reels': { width: 1080, height: 1920 },
    'twitter':         { width: 1280, height: 720 },
    'bluesky':         { width: 1280, height: 720 },
    'twitch':          { width: 1920, height: 1080 },
    'kick':            { width: 1920, height: 1080 },
    'facebook':        { width: 1280, height: 720 },
    'tiktok':          { width: 1080, height: 1920 },
  }
  return map[platformId] ?? { width: 1280, height: 720 }
}

// ── Tooltip helper ────────────────────────────────────────────────────────────

function ComingSoonBtn({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="relative group">
      <button
        className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl border border-gray-800 bg-gray-900 hover:border-amber-500/40 transition-all text-sm font-medium text-gray-400 hover:text-gray-200"
        disabled
      >
        <span className="text-xl">{icon}</span>
        <span className="text-xs whitespace-nowrap">{label}</span>
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-amber-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        Coming soon ✦
      </div>
    </div>
  )
}

// ── SpecRow ───────────────────────────────────────────────────────────────────

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 py-2.5 border-b border-gray-800/60">
      <span className="text-xs text-gray-500 leading-tight">{label}</span>
      <span className="text-xs font-mono font-semibold text-gray-200 text-right leading-tight">{value}</span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CreatePageClient() {
  // Tab / platform
  const [activeTab, setActiveTab] = useState<'video' | 'image'>('video')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('tiktok')

  // Video state
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [activeFilter, setActiveFilter] = useState('None')
  const [editorTab, setEditorTab] = useState<'filters' | 'captions' | 'audio' | 'quality'>('filters')
  const [captionText, setCaptionText] = useState('')
  const [captionSize, setCaptionSize] = useState(32)
  const [captionPosition, setCaptionPosition] = useState<'top' | 'center' | 'bottom'>('bottom')
  const [captionColor, setCaptionColor] = useState('#ffffff')
  const [captionBg, setCaptionBg] = useState(true)
  const [volume, setVolume] = useState(100)
  const [muted, setMuted] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [videoDragOver, setVideoDragOver] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageDragOver, setImageDragOver] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Right panel notify
  const [filterEmail, setFilterEmail] = useState('')
  const [filterNotifyState, setFilterNotifyState] = useState<'idle' | 'loading' | 'done'>('idle')

  // ── Derived ──────────────────────────────────────────────────────────────────
  const spec = PLATFORM_SPECS.find(p => p.id === selectedPlatform) ?? PLATFORM_SPECS[0]
  const visiblePlatforms = PLATFORM_SPECS.filter(p =>
    activeTab === 'video' ? p.type !== 'image' : p.type !== 'video'
  )

  // ── Effects ───────────────────────────────────────────────────────────────────

  // Sync volume/mute to video element
  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.volume = muted ? 0 : volume / 100
  }, [volume, muted])

  // Timeupdate — keep currentTime in sync + enforce trim end
  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setCurrentTime(v.currentTime)
    if (v.currentTime >= trimEnd) {
      v.pause()
      v.currentTime = trimStart
      setPlaying(false)
    }
  }, [trimEnd, trimStart])

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleVideoFile(file: File) {
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    setVideoFile(file)
    setTrimStart(0)
    setTrimEnd(0)
    setDuration(0)
    setCurrentTime(0)
    setPlaying(false)
    setActiveFilter('None')
    setCaptionText('')
  }

  function handleImageFile(file: File) {
    setImageFile(file)
    setImageUrl(URL.createObjectURL(file))
  }

  function handleVideoMetadata() {
    const v = videoRef.current
    if (!v) return
    setDuration(v.duration)
    setTrimEnd(v.duration)
  }

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (playing) {
      v.pause()
      setPlaying(false)
    } else {
      if (v.currentTime >= trimEnd) v.currentTime = trimStart
      v.play()
      setPlaying(true)
    }
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const v = videoRef.current
    if (!v || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const t = trimStart + pct * (trimEnd - trimStart)
    v.currentTime = Math.max(trimStart, Math.min(trimEnd, t))
  }

  function switchTab(tab: 'video' | 'image') {
    setActiveTab(tab)
    const first = PLATFORM_SPECS.find(p => tab === 'video' ? p.type !== 'image' : p.type !== 'video')
    if (first && first.id !== selectedPlatform) setSelectedPlatform(first.id)
  }

  async function handleFilterNotify() {
    if (!filterEmail.trim() || filterNotifyState !== 'idle') return
    setFilterNotifyState('loading')
    try {
      await fetch('/api/feature-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Creator Studio filters — notify me', email: filterEmail.trim() }),
      })
    } catch {
      // non-fatal
    }
    setFilterNotifyState('done')
  }

  // ── Thumbnail capture ─────────────────────────────────────────────────────────

  function captureThumbnail() {
    const v = videoRef.current
    if (!v) return
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    canvas.getContext('2d')!.drawImage(v, 0, 0)
    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'thumbnail.png'
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  // ── Export ────────────────────────────────────────────────────────────────────

  async function exportVideo() {
    const v = videoRef.current
    const canvas = canvasRef.current
    if (!v || !canvas) return
    if (typeof window === 'undefined' || !window.MediaRecorder) {
      alert('Export requires Chrome or Edge')
      return
    }
    setExporting(true)

    const ctx = canvas.getContext('2d')!
    const { width, height } = getPlatformDimensions(selectedPlatform)
    canvas.width = width
    canvas.height = height

    const stream = canvas.captureStream(30)
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm'
    const recorder = new MediaRecorder(stream, { mimeType })
    const chunks: Blob[] = []

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `socialmate-${selectedPlatform}.webm`
      a.click()
      URL.revokeObjectURL(url)
      setExporting(false)
    }

    v.currentTime = trimStart
    await new Promise<void>(resolve => v.addEventListener('seeked', () => resolve(), { once: true }))

    recorder.start(100)
    v.volume = muted ? 0 : volume / 100
    v.play()

    function drawFrame() {
      if (!v || v.currentTime >= trimEnd) {
        recorder.stop()
        if (v) v.pause()
        setPlaying(false)
        return
      }
      ctx.filter = FILTERS[activeFilter] || 'none'
      ctx.drawImage(v as CanvasImageSource, 0, 0, canvas!.width, canvas!.height)
      ctx.filter = 'none'

      if (captionText) {
        const scaledSize = captionSize * (canvas!.height / 400)
        const y =
          captionPosition === 'top'    ? canvas!.height * 0.1
          : captionPosition === 'center' ? canvas!.height * 0.5
          : canvas!.height * 0.88

        ctx.font = `bold ${scaledSize}px sans-serif`
        ctx.textAlign = 'center'

        if (captionBg) {
          const metrics = ctx.measureText(captionText)
          const pad = 12
          ctx.fillStyle = 'rgba(0,0,0,0.6)'
          ctx.fillRect(
            canvas!.width / 2 - metrics.width / 2 - pad,
            y - scaledSize - pad,
            metrics.width + pad * 2,
            scaledSize * 1.4 + pad * 2
          )
        }
        ctx.fillStyle = captionColor
        ctx.fillText(captionText, canvas!.width / 2, y)
      }
      requestAnimationFrame(drawFrame)
    }
    requestAnimationFrame(drawFrame)
  }

  // ── Caption overlay styles ────────────────────────────────────────────────────

  function captionStyle(): React.CSSProperties {
    const base: React.CSSProperties = {
      position: 'absolute',
      left: '50%',
      color: captionColor,
      fontSize: `${captionSize}px`,
      fontWeight: 'bold',
      textShadow: '0 2px 4px rgba(0,0,0,0.8)',
      background: captionBg ? 'rgba(0,0,0,0.6)' : 'transparent',
      padding: captionBg ? '4px 12px' : '0',
      borderRadius: 6,
      maxWidth: '90%',
      textAlign: 'center',
      pointerEvents: 'none',
      transform: '',
      whiteSpace: 'pre-wrap',
    }
    if (captionPosition === 'top') {
      base.top = '16px'
      base.transform = 'translateX(-50%)'
    } else if (captionPosition === 'center') {
      base.top = '50%'
      base.transform = 'translateX(-50%) translateY(-50%)'
    } else {
      base.bottom = '16px'
      base.transform = 'translateX(-50%)'
    }
    return base
  }

  // ── Progress bar percentage ───────────────────────────────────────────────────
  const progressPct =
    duration > 0 && trimEnd > trimStart
      ? ((currentTime - trimStart) / (trimEnd - trimStart)) * 100
      : 0

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* ── Sticky header ── */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-gray-950/95 backdrop-blur-md">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="text-amber-400 text-xl">✦</span>
              Creator Studio
            </h1>
            <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
              <button
                onClick={() => switchTab('video')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'video'
                    ? 'bg-amber-500 text-gray-950'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                📹 Video Editor
              </button>
              <button
                onClick={() => switchTab('image')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'image'
                    ? 'bg-amber-500 text-gray-950'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                🖼️ Image Editor
              </button>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </header>

        {/* ── Main layout ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Center: platform picker + editor ── */}
          <div className="flex-1 flex flex-col overflow-y-auto">

            {/* Platform picker */}
            <div className="px-5 py-4 border-b border-gray-800/60 bg-gray-950 flex-shrink-0">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Editing for:</p>
              <div className="flex flex-wrap gap-2">
                {visiblePlatforms.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      selectedPlatform === p.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                    <span className={`text-xs font-mono ${selectedPlatform === p.id ? 'text-amber-500/70' : 'text-gray-600'}`}>
                      {p.ratio}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor panel */}
            <div className="flex-1 p-5 flex flex-col gap-4">

              {activeTab === 'video' ? (
                <>
                  {!videoFile ? (
                    /* ── Upload area ── */
                    <div
                      onDragOver={e => { e.preventDefault(); setVideoDragOver(true) }}
                      onDragLeave={() => setVideoDragOver(false)}
                      onDrop={e => {
                        e.preventDefault()
                        setVideoDragOver(false)
                        const f = e.dataTransfer.files[0]
                        if (f) handleVideoFile(f)
                      }}
                      onClick={() => videoInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all py-16 ${
                        videoDragOver
                          ? 'border-amber-500 bg-amber-500/5'
                          : 'border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-900/80'
                      }`}
                    >
                      <div className="text-4xl">🎬</div>
                      <div className="text-center">
                        <p className="text-base font-bold text-gray-200">Drop your video here</p>
                        <p className="text-sm text-gray-500 mt-1">or click to browse — MP4, MOV, WebM, AVI</p>
                      </div>
                      <div className="px-4 py-2 rounded-lg bg-amber-500 text-gray-950 text-sm font-bold hover:opacity-90 transition-opacity">
                        Choose File
                      </div>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept=".mp4,.mov,.webm,.avi,video/*"
                        className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0]
                          if (f) handleVideoFile(f)
                        }}
                      />
                    </div>
                  ) : (
                    /* ── Video editor ── */
                    <div className="flex flex-col gap-4">

                      {/* File info bar */}
                      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm">
                        <span className="text-gray-300 font-medium truncate max-w-xs">{videoFile.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">{formatBytes(videoFile.size)}</span>
                          <button
                            onClick={() => { setVideoFile(null); setVideoUrl(''); setPlaying(false) }}
                            className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>

                      {/* Video preview + caption overlay */}
                      <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-800 flex items-center justify-center min-h-64">
                        {videoUrl && (
                          <video
                            ref={videoRef}
                            src={videoUrl}
                            className="max-w-full max-h-96 w-auto"
                            style={{ filter: FILTERS[activeFilter] || 'none' }}
                            onLoadedMetadata={handleVideoMetadata}
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={() => setPlaying(false)}
                          />
                        )}
                        {captionText && (
                          <div style={captionStyle()}>
                            {captionText}
                          </div>
                        )}
                      </div>

                      {/* Playback controls */}
                      <div className="flex flex-col gap-2 px-1">
                        {/* Progress bar */}
                        <div
                          className="relative h-2 bg-gray-800 rounded-full cursor-pointer overflow-hidden"
                          onClick={handleProgressClick}
                        >
                          <div
                            className="absolute left-0 top-0 h-full bg-amber-500 rounded-full transition-none"
                            style={{ width: `${Math.max(0, Math.min(100, progressPct))}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={togglePlay}
                              disabled={!duration}
                              className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-500 text-gray-950 font-bold hover:opacity-90 transition-opacity disabled:opacity-40 text-sm"
                            >
                              {playing ? '⏸' : '▶'}
                            </button>
                            <span className="text-xs font-mono text-gray-400">
                              {formatTime(currentTime)} / {formatTime(trimEnd - trimStart)} (trim)
                            </span>
                          </div>
                          <span className="text-xs font-mono text-gray-600">
                            total {formatTime(duration)}
                          </span>
                        </div>
                      </div>

                      {/* Trim controls */}
                      <div className="flex flex-col gap-3 px-1 p-4 rounded-xl bg-gray-900 border border-gray-800">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Trim Region</p>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <label className="text-xs text-gray-400 w-20 flex-shrink-0">
                              Start: <span className="text-amber-400 font-mono">{formatTime(trimStart)}</span>
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={duration || 1}
                              step={0.1}
                              value={trimStart}
                              onChange={e => {
                                const v = Math.min(+e.target.value, trimEnd - 0.5)
                                setTrimStart(v)
                                if (videoRef.current) videoRef.current.currentTime = v
                              }}
                              className="flex-1 accent-amber-500"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-xs text-gray-400 w-20 flex-shrink-0">
                              End: <span className="text-amber-400 font-mono">{formatTime(trimEnd)}</span>
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={duration || 1}
                              step={0.1}
                              value={trimEnd}
                              onChange={e => {
                                const v = Math.max(+e.target.value, trimStart + 0.5)
                                setTrimEnd(v)
                                if (videoRef.current) videoRef.current.currentTime = v
                              }}
                              className="flex-1 accent-amber-500"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">
                          Clip length: <span className="text-gray-400 font-mono">{formatTime(trimEnd - trimStart)}</span>
                        </p>
                      </div>

                      {/* Editor tabs — hidden on mobile (sm and below), visible md+ */}
                      <div className="hidden md:block">
                        {/* Tab switcher */}
                        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit mb-4">
                          {(['filters', 'captions', 'audio', 'quality'] as const).map(t => (
                            <button
                              key={t}
                              onClick={() => setEditorTab(t)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                                editorTab === t
                                  ? 'bg-amber-500 text-gray-950'
                                  : 'text-gray-400 hover:text-gray-200'
                              }`}
                            >
                              {t === 'filters' ? '🎨 Filters'
                                : t === 'captions' ? '💬 Captions'
                                : t === 'audio' ? '🔊 Audio'
                                : '📊 Quality'}
                            </button>
                          ))}
                        </div>

                        {/* Filters panel */}
                        {editorTab === 'filters' && (
                          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Video Filters</p>
                            <div className="grid grid-cols-4 gap-2">
                              {Object.keys(FILTERS).map(f => (
                                <button
                                  key={f}
                                  onClick={() => setActiveFilter(f)}
                                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                    activeFilter === f
                                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                      : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                                  }`}
                                >
                                  {f}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Captions panel */}
                        {editorTab === 'captions' && (
                          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex flex-col gap-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Caption Overlay</p>

                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-gray-400">Caption text</label>
                              <input
                                type="text"
                                value={captionText}
                                onChange={e => setCaptionText(e.target.value)}
                                placeholder="Enter caption…"
                                className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/60"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-gray-400">
                                Font size: <span className="text-amber-400 font-mono">{captionSize}px</span>
                              </label>
                              <input
                                type="range" min={12} max={72} step={1}
                                value={captionSize}
                                onChange={e => setCaptionSize(+e.target.value)}
                                className="accent-amber-500"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-gray-400">Position</label>
                              <div className="flex gap-2">
                                {(['top', 'center', 'bottom'] as const).map(pos => (
                                  <button
                                    key={pos}
                                    onClick={() => setCaptionPosition(pos)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all ${
                                      captionPosition === pos
                                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                                    }`}
                                  >
                                    {pos}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-gray-400">Color</label>
                              <div className="flex gap-2">
                                {['#ffffff', '#000000', '#ffff00', '#ff4444'].map(c => (
                                  <button
                                    key={c}
                                    onClick={() => setCaptionColor(c)}
                                    style={{ background: c }}
                                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                                      captionColor === c ? 'border-amber-500 scale-110' : 'border-gray-700'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <div
                                onClick={() => setCaptionBg(!captionBg)}
                                className={`relative w-10 h-5 rounded-full transition-colors ${captionBg ? 'bg-amber-500' : 'bg-gray-700'}`}
                              >
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${captionBg ? 'left-5' : 'left-0.5'}`} />
                              </div>
                              <span className="text-xs text-gray-400">Background</span>
                            </label>
                          </div>
                        )}

                        {/* Audio panel */}
                        {editorTab === 'audio' && (
                          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex flex-col gap-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Audio Controls</p>

                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-gray-400">
                                Volume: <span className="text-amber-400 font-mono">{muted ? 'Muted' : `${volume}%`}</span>
                              </label>
                              <input
                                type="range" min={0} max={100} step={1}
                                value={volume}
                                onChange={e => {
                                  setVolume(+e.target.value)
                                  setMuted(false)
                                }}
                                disabled={muted}
                                className="accent-amber-500 disabled:opacity-40"
                              />
                            </div>

                            <button
                              onClick={() => setMuted(m => !m)}
                              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all w-fit ${
                                muted
                                  ? 'border-red-500/60 bg-red-500/10 text-red-400'
                                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                              }`}
                            >
                              {muted ? '🔇 Unmute' : '🔊 Mute'}
                            </button>

                            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-700/50 bg-gray-800/50">
                              <span className="text-lg">🎵</span>
                              <div>
                                <p className="text-xs font-semibold text-gray-300">Background Music</p>
                                <p className="text-xs text-gray-500">Coming soon — add a backing track</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Quality panel */}
                        {editorTab === 'quality' && (
                          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex flex-col gap-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Export Quality</p>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800 border border-amber-500/40">
                                <span className="text-sm font-semibold text-amber-400">WebM (vp9)</span>
                                <span className="text-xs text-gray-400">Best browser compat</span>
                              </div>
                              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 opacity-50">
                                <span className="text-sm font-semibold text-gray-400">MP4 (h264)</span>
                                <span className="text-xs text-gray-500">Coming soon</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              Export dimensions: <span className="text-gray-400 font-mono">{getPlatformDimensions(selectedPlatform).width} × {getPlatformDimensions(selectedPlatform).height}</span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Mobile: simplified filter row */}
                      <div className="flex md:hidden gap-2 overflow-x-auto pb-1">
                        {Object.keys(FILTERS).map(f => (
                          <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              activeFilter === f
                                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                : 'border-gray-700 bg-gray-800 text-gray-400'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>

                    </div>
                  )}
                </>
              ) : (
                /* ── Image editor tab ── */
                <>
                  {!imageFile ? (
                    <div className="flex flex-col gap-4">
                      <div
                        onDragOver={e => { e.preventDefault(); setImageDragOver(true) }}
                        onDragLeave={() => setImageDragOver(false)}
                        onDrop={e => {
                          e.preventDefault()
                          setImageDragOver(false)
                          const f = e.dataTransfer.files[0]
                          if (f) handleImageFile(f)
                        }}
                        onClick={() => imageInputRef.current?.click()}
                        className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all py-12 ${
                          imageDragOver
                            ? 'border-amber-500 bg-amber-500/5'
                            : 'border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-900/80'
                        }`}
                      >
                        <div className="text-4xl">🖼️</div>
                        <div className="text-center">
                          <p className="text-base font-bold text-gray-200">Drop your image here</p>
                          <p className="text-sm text-gray-500 mt-1">or click to browse — JPG, PNG, GIF, WebP</p>
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-amber-500 text-gray-950 text-sm font-bold hover:opacity-90 transition-opacity">
                          Choose File
                        </div>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.gif,.webp,image/*"
                          className="hidden"
                          onChange={e => {
                            const f = e.target.files?.[0]
                            if (f) handleImageFile(f)
                          }}
                        />
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Or start from a template:</p>
                        <div className="grid grid-cols-3 gap-3">
                          {IMAGE_TEMPLATES.map(t => (
                            <button
                              key={t.name}
                              className="relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-gray-800 bg-gray-900 hover:border-amber-500/40 hover:bg-gray-800 transition-all group"
                              title="Coming soon"
                            >
                              <div className="w-full aspect-video rounded-lg bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center group-hover:from-amber-950/30 group-hover:to-gray-800 transition-all">
                                <span className="text-2xl opacity-40">🖼️</span>
                              </div>
                              <p className="text-xs font-semibold text-gray-300 text-center leading-tight">{t.name}</p>
                              <p className="text-xs font-mono text-gray-600">{t.dims}</p>
                              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-xs bg-gray-800 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                Soon
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm">
                        <span className="text-gray-300 font-medium truncate max-w-xs">{imageFile.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">{formatBytes(imageFile.size)}</span>
                          <button
                            onClick={() => { setImageFile(null); setImageUrl(null) }}
                            className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 flex items-center justify-center min-h-64 p-4">
                        {imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt="Preview"
                            className="max-w-full max-h-96 w-auto rounded-xl object-contain"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <ComingSoonBtn icon="✂️" label="Crop" />
                    <ComingSoonBtn icon="🎨" label="Filter" />
                    <ComingSoonBtn icon="💡" label="Brightness/Contrast" />
                    <ComingSoonBtn icon="✏️" label="Text Overlay" />
                    <ComingSoonBtn icon="🌟" label="Stickers" />
                    <ComingSoonBtn icon="🔲" label="Background" />
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
                    <button
                      className="px-5 py-2.5 rounded-xl bg-amber-500 text-gray-950 font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40"
                      disabled={!imageFile}
                    >
                      Save to Drafts
                    </button>
                    <button
                      className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 font-semibold text-sm hover:border-gray-600 hover:text-gray-100 transition-all disabled:opacity-40"
                      disabled={!imageFile}
                    >
                      Download
                    </button>
                    {!imageFile && (
                      <span className="text-xs text-gray-600">Upload an image or pick a template to export</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Right: platform specs + export actions ── */}
          <aside className="hidden lg:flex flex-col w-72 border-l border-gray-800 bg-gray-950 p-5 gap-5 overflow-y-auto flex-shrink-0">

            {/* Platform Specs */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Platform Specs</p>

              <div className="flex items-center gap-3 mb-5">
                <span className="text-3xl">{spec.icon}</span>
                <div>
                  <p className="font-extrabold text-white text-base leading-tight">{spec.name}</p>
                  <p className="text-xs text-amber-400 font-mono">{spec.ratioLabel}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <SpecRow label="Aspect Ratio" value={spec.ratio} />
                <SpecRow label="Max Duration" value={spec.maxDuration} />
                <SpecRow label="Max File Size" value={spec.maxFileSize} />
                <SpecRow label="Resolution" value={spec.resolution} />
              </div>
            </div>

            {/* Actions (video only) */}
            {activeTab === 'video' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Actions</p>

                <button
                  onClick={captureThumbnail}
                  disabled={!videoFile}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900 text-sm font-semibold text-gray-300 hover:border-amber-500/40 hover:text-gray-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  📸 Capture Thumbnail
                </button>

                <button
                  onClick={exportVideo}
                  disabled={!videoFile || exporting}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-gray-950 text-sm font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {exporting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin" />
                      Exporting…
                    </>
                  ) : (
                    <>⚡ Export for {spec.name}</>
                  )}
                </button>

                <Link
                  href="/compose"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900 text-sm font-semibold text-gray-300 hover:border-amber-500/40 hover:text-amber-400 transition-all text-center"
                >
                  📅 Schedule this →
                </Link>
              </div>
            )}

            {/* Notify form (when no video or image tab) */}
            {activeTab === 'image' && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Filters</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['Amber', 'Light Blue', 'B&W', 'Dark Contrast', 'Warm', 'Cool', 'Cinematic'].map(f => (
                    <span
                      key={f}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-900 border border-gray-800 text-gray-400"
                    >
                      {f}
                    </span>
                  ))}
                </div>
                {filterNotifyState === 'done' ? (
                  <p className="text-xs text-green-400 font-semibold mt-2">You&apos;re on the list!</p>
                ) : (
                  <div className="flex items-center gap-1.5 mt-2">
                    <input
                      type="email"
                      value={filterEmail}
                      onChange={e => setFilterEmail(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleFilterNotify() }}
                      placeholder="your@email.com"
                      className="flex-1 min-w-0 px-2 py-1 rounded-lg bg-gray-900 border border-gray-700 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/60"
                    />
                    <button
                      onClick={handleFilterNotify}
                      disabled={filterNotifyState === 'loading'}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 text-gray-950 text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-60 whitespace-nowrap"
                    >
                      {filterNotifyState === 'loading' ? '...' : 'Notify me'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick tip */}
            <div className="mt-auto p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <p className="text-xs font-bold text-amber-400 mb-1">✦ Pro tip</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Select your platform first — the editor will export at the exact recommended resolution for that platform.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Hidden canvas for export */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
