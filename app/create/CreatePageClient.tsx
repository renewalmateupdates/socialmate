'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  'Amber':         'sepia(0.4) saturate(1.3) brightness(1.05)',
  'Light Blue':    'hue-rotate(190deg) saturate(0.9) brightness(1.1)',
  'B&W':           'grayscale(1)',
  'Dark Contrast': 'contrast(1.4) brightness(0.9)',
  'Warm':          'sepia(0.2) saturate(1.4) hue-rotate(-10deg)',
  'Cool':          'hue-rotate(20deg) saturate(0.85) brightness(1.05)',
  'Cinematic':     'contrast(1.15) saturate(0.85) brightness(0.95) sepia(0.1)',
}

const FILTER_NAMES = ['None', ...Object.keys(FILTERS)]

// ── Platform export dimensions ────────────────────────────────────────────────

function getPlatformDimensions(platformId: string): { width: number; height: number } {
  const dims: Record<string, { width: number; height: number }> = {
    'youtube':         { width: 1920, height: 1080 },
    'instagram-reels': { width: 1080, height: 1920 },
    'twitter':         { width: 1280, height: 720 },
    'bluesky':         { width: 1280, height: 720 },
    'twitch':          { width: 1920, height: 1080 },
    'kick':            { width: 1920, height: 1080 },
    'facebook':        { width: 1280, height: 720 },
    'tiktok':          { width: 1080, height: 1920 },
  }
  return dims[platformId] ?? { width: 1280, height: 720 }
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

// ── Caption colors ────────────────────────────────────────────────────────────

const CAPTION_COLORS = ['#ffffff', '#000000', '#facc15', '#ef4444']

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Sub-components ────────────────────────────────────────────────────────────

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
  const router = useRouter()

  // Tab state
  const [activeTab, setActiveTab] = useState<'video' | 'image'>('video')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('tiktok')

  // File state
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [videoDragOver, setVideoDragOver] = useState(false)
  const [imageDragOver, setImageDragOver] = useState(false)

  // Video editor state
  const [videoDuration, setVideoDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)

  // Filter state
  const [activeFilter, setActiveFilter] = useState<string>('None')

  // Caption state
  const [captionText, setCaptionText] = useState('')
  const [captionFontSize, setCaptionFontSize] = useState(28)
  const [captionPosition, setCaptionPosition] = useState<'top' | 'center' | 'bottom'>('bottom')
  const [captionColor, setCaptionColor] = useState('#ffffff')
  const [captionBg, setCaptionBg] = useState(true)

  // Audio state
  const [volume, setVolume] = useState(100)
  const [muted, setMuted] = useState(false)

  // Tool panel tab
  const [toolTab, setToolTab] = useState<'filters' | 'captions' | 'audio' | 'export'>('filters')

  // Export state
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  // Notify state
  const [filterEmail, setFilterEmail] = useState('')
  const [filterNotifyState, setFilterNotifyState] = useState<'idle' | 'loading' | 'done'>('idle')

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const animFrameRef = useRef<number | null>(null)

  const spec = PLATFORM_SPECS.find(p => p.id === selectedPlatform) ?? PLATFORM_SPECS[0]

  // Apply volume/mute to video element
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.volume = volume / 100
    v.muted = muted
  }, [volume, muted])

  // Track playback time
  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setCurrentTime(v.currentTime)
    // Stop at trim end
    if (v.currentTime >= trimEnd && trimEnd > 0) {
      v.pause()
      setIsPlaying(false)
    }
  }, [trimEnd])

  const handleVideoLoaded = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    const dur = v.duration
    setVideoDuration(dur)
    setTrimStart(0)
    setTrimEnd(dur)
    setCurrentTime(0)
  }, [])

  function handleVideoFile(file: File) {
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    setVideoFile(file)
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    setActiveFilter('None')
    setCaptionText('')
    setTrimStart(0)
    setTrimEnd(0)
    setCurrentTime(0)
    setIsPlaying(false)
  }

  function handleImageFile(file: File) {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageFile(file)
    setImageUrl(URL.createObjectURL(file))
  }

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      // If at or past trimEnd, rewind to trimStart first
      if (v.currentTime >= trimEnd) v.currentTime = trimStart
      v.play()
      setIsPlaying(true)
    } else {
      v.pause()
      setIsPlaying(false)
    }
  }

  function handleTrimStartChange(val: number) {
    const newStart = Math.min(val, trimEnd - 0.5)
    setTrimStart(newStart)
    if (videoRef.current && videoRef.current.currentTime < newStart) {
      videoRef.current.currentTime = newStart
    }
  }

  function handleTrimEndChange(val: number) {
    const newEnd = Math.max(val, trimStart + 0.5)
    setTrimEnd(newEnd)
    if (videoRef.current && videoRef.current.currentTime > newEnd) {
      videoRef.current.currentTime = newEnd
    }
  }

  // Computed CSS filter string
  const cssFilter = activeFilter !== 'None' ? FILTERS[activeFilter] ?? '' : ''

  // Caption vertical position style
  function captionPositionStyle(): React.CSSProperties {
    switch (captionPosition) {
      case 'top': return { top: '8%', bottom: 'auto', transform: 'translateX(-50%)' }
      case 'center': return { top: '50%', bottom: 'auto', transform: 'translate(-50%, -50%)' }
      case 'bottom': return { bottom: '8%', top: 'auto', transform: 'translateX(-50%)' }
    }
  }

  // ── Thumbnail capture ────────────────────────────────────────────────────────

  function captureThumbnail() {
    const v = videoRef.current
    if (!v) return
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(v, 0, 0)
    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'thumbnail.png'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    }, 'image/png')
  }

  // ── Export video ─────────────────────────────────────────────────────────────

  async function exportVideo() {
    const v = videoRef.current
    const canvas = canvasRef.current
    if (!v || !canvas) return

    // Check MediaRecorder support
    if (typeof MediaRecorder === 'undefined') {
      setExportError('Export requires a modern browser (Chrome/Edge recommended)')
      return
    }

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : null

    if (!mimeType) {
      setExportError('Export requires a modern browser (Chrome/Edge recommended)')
      return
    }

    setExporting(true)
    setExportError(null)

    const { width, height } = getPlatformDimensions(selectedPlatform)
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!

    // Apply CSS filter via canvas filter if supported
    if (cssFilter) {
      ctx.filter = cssFilter
    }

    let stream: MediaStream
    try {
      stream = canvas.captureStream(30)
    } catch {
      setExportError('Canvas stream not supported in this browser.')
      setExporting(false)
      return
    }

    // Add original audio track if present
    try {
      const audioCtx = new AudioContext()
      const dest = audioCtx.createMediaStreamDestination()
      const src = audioCtx.createMediaElementSource(v)
      const gainNode = audioCtx.createGain()
      gainNode.gain.value = muted ? 0 : volume / 100
      src.connect(gainNode)
      gainNode.connect(dest)
      gainNode.connect(audioCtx.destination)
      dest.stream.getAudioTracks().forEach(t => stream.addTrack(t))
    } catch {
      // Audio capture failed — proceed with video only (non-fatal)
    }

    const chunks: Blob[] = []
    const recorder = new MediaRecorder(stream, { mimeType })
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `socialmate-export-${selectedPlatform}.webm`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 10000)
      setExporting(false)
    }

    v.currentTime = trimStart
    await new Promise<void>(resolve => {
      const onSeeked = () => { v.removeEventListener('seeked', onSeeked); resolve() }
      v.addEventListener('seeked', onSeeked)
    })

    recorder.start()
    v.play()
    setIsPlaying(true)

    function drawFrame() {
      if (!v || !canvas) return
      if (v.currentTime >= trimEnd) {
        recorder.stop()
        v.pause()
        setIsPlaying(false)
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (cssFilter) ctx.filter = cssFilter
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
      ctx.filter = 'none'

      // Draw caption overlay
      if (captionText.trim()) {
        const scaledFontSize = Math.round(captionFontSize * (canvas.height / 400))
        ctx.font = `bold ${scaledFontSize}px Arial, sans-serif`
        ctx.textAlign = 'center'
        const textWidth = ctx.measureText(captionText).width
        const x = canvas.width / 2
        let y: number
        if (captionPosition === 'top') y = canvas.height * 0.12
        else if (captionPosition === 'center') y = canvas.height / 2
        else y = canvas.height * 0.88

        if (captionBg) {
          const pad = scaledFontSize * 0.4
          ctx.fillStyle = 'rgba(0,0,0,0.55)'
          ctx.beginPath()
          const rx = x - textWidth / 2 - pad
          const ry = y - scaledFontSize - pad / 2
          const rw = textWidth + pad * 2
          const rh = scaledFontSize + pad
          const radius = rh / 2
          ctx.moveTo(rx + radius, ry)
          ctx.lineTo(rx + rw - radius, ry)
          ctx.arcTo(rx + rw, ry, rx + rw, ry + radius, radius)
          ctx.lineTo(rx + rw, ry + rh - radius)
          ctx.arcTo(rx + rw, ry + rh, rx + rw - radius, ry + rh, radius)
          ctx.lineTo(rx + radius, ry + rh)
          ctx.arcTo(rx, ry + rh, rx, ry + rh - radius, radius)
          ctx.lineTo(rx, ry + radius)
          ctx.arcTo(rx, ry, rx + radius, ry, radius)
          ctx.closePath()
          ctx.fill()
        }

        ctx.fillStyle = captionColor
        ctx.fillText(captionText, x, y)
      }

      animFrameRef.current = requestAnimationFrame(drawFrame)
    }

    animFrameRef.current = requestAnimationFrame(drawFrame)
  }

  // ── Notify me ────────────────────────────────────────────────────────────────

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

  // ── Platform tab switching ────────────────────────────────────────────────────

  const visiblePlatforms = PLATFORM_SPECS.filter(p =>
    activeTab === 'video' ? p.type !== 'image' : p.type !== 'video'
  )

  function switchTab(tab: 'video' | 'image') {
    setActiveTab(tab)
    const first = PLATFORM_SPECS.find(p => tab === 'video' ? p.type !== 'image' : p.type !== 'video')
    if (first && first.id !== selectedPlatform) setSelectedPlatform(first.id)
  }

  // ── Timeline progress % ────────────────────────────────────────────────────

  const progressPct = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0
  const trimStartPct = videoDuration > 0 ? (trimStart / videoDuration) * 100 : 0
  const trimEndPct = videoDuration > 0 ? (trimEnd / videoDuration) * 100 : 100

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />

      {/* Hidden canvas for export */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-gray-950/95 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="text-amber-400 text-xl">✦</span>
              Creator Studio
            </h1>
            <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
              <button
                onClick={() => switchTab('video')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'video' ? 'bg-amber-500 text-gray-950' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                📹 Video Editor
              </button>
              <button
                onClick={() => switchTab('image')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'image' ? 'bg-amber-500 text-gray-950' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                🖼️ Image Editor
              </button>
            </div>
          </div>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors">
            ← Back to Dashboard
          </Link>
        </header>

        {/* Main layout */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left / center */}
          <div className="flex-1 flex flex-col gap-0 overflow-y-auto">

            {/* Platform picker */}
            <div className="px-5 py-4 border-b border-gray-800/60 bg-gray-950">
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
                  {/* ── Upload / Preview ── */}
                  {!videoFile ? (
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
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoFile(f) }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {/* File info bar */}
                      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm">
                        <span className="text-gray-300 font-medium truncate max-w-xs">{videoFile.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">{formatBytes(videoFile.size)}</span>
                          <button
                            onClick={() => { setVideoFile(null); if (videoUrl) { URL.revokeObjectURL(videoUrl); setVideoUrl(null) } }}
                            className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>

                      {/* Video preview with caption overlay */}
                      <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-800 flex items-center justify-center min-h-64">
                        {videoUrl && (
                          <video
                            ref={videoRef}
                            src={videoUrl}
                            className="max-w-full max-h-96 w-auto"
                            style={{
                              aspectRatio: spec.ratio.replace(':', '/'),
                              filter: cssFilter || undefined,
                            }}
                            onLoadedMetadata={handleVideoLoaded}
                            onTimeUpdate={handleTimeUpdate}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                          />
                        )}

                        {/* Caption overlay */}
                        {captionText && (
                          <div
                            className="absolute left-1/2 pointer-events-none px-4 py-1.5 max-w-[90%] text-center leading-snug"
                            style={{
                              ...captionPositionStyle(),
                              fontSize: `${captionFontSize}px`,
                              color: captionColor,
                              fontWeight: 700,
                              fontFamily: 'Arial, sans-serif',
                              textShadow: captionBg ? 'none' : '0 1px 4px rgba(0,0,0,0.8)',
                              background: captionBg ? 'rgba(0,0,0,0.55)' : 'transparent',
                              borderRadius: '999px',
                              display: 'inline-block',
                            }}
                          >
                            {captionText}
                          </div>
                        )}
                      </div>

                      {/* Playback controls */}
                      <div className="flex items-center gap-3 px-1">
                        <button
                          onClick={togglePlay}
                          className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-500 text-gray-950 text-base font-bold hover:opacity-90 transition-opacity flex-shrink-0"
                          title={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? '⏸' : '▶'}
                        </button>
                        <span className="text-xs font-mono text-gray-400 flex-shrink-0 w-20 text-center">
                          {formatTime(currentTime)} / {formatTime(videoDuration)}
                        </span>
                        {/* Progress bar showing trimmed region */}
                        <div className="relative flex-1 h-2 bg-gray-800 rounded-full overflow-hidden cursor-pointer"
                          onClick={e => {
                            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
                            const ratio = (e.clientX - rect.left) / rect.width
                            const t = ratio * videoDuration
                            if (videoRef.current) videoRef.current.currentTime = t
                          }}
                        >
                          {/* Trim region highlight */}
                          <div
                            className="absolute h-full bg-amber-500/30 rounded-full"
                            style={{ left: `${trimStartPct}%`, width: `${trimEndPct - trimStartPct}%` }}
                          />
                          {/* Playhead */}
                          <div
                            className="absolute h-full w-0.5 bg-amber-400 rounded-full"
                            style={{ left: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Trim controls */}
                      <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 flex flex-col gap-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Trim</p>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <label className="text-xs text-gray-400 w-20 flex-shrink-0">Start: <span className="font-mono text-amber-400">{formatTime(trimStart)}</span></label>
                            <input
                              type="range"
                              min={0}
                              max={videoDuration}
                              step={0.1}
                              value={trimStart}
                              onChange={e => handleTrimStartChange(parseFloat(e.target.value))}
                              className="flex-1 accent-amber-500"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-xs text-gray-400 w-20 flex-shrink-0">End: <span className="font-mono text-amber-400">{formatTime(trimEnd)}</span></label>
                            <input
                              type="range"
                              min={0}
                              max={videoDuration}
                              step={0.1}
                              value={trimEnd}
                              onChange={e => handleTrimEndChange(parseFloat(e.target.value))}
                              className="flex-1 accent-amber-500"
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 px-0.5">
                            <span>Clip length: <span className="font-mono text-gray-400">{formatTime(Math.max(0, trimEnd - trimStart))}</span></span>
                            <button
                              className="text-gray-600 hover:text-gray-400 underline underline-offset-2 transition-colors"
                              onClick={() => { setTrimStart(0); setTrimEnd(videoDuration) }}
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Tool panel tabs */}
                      <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
                        <div className="flex border-b border-gray-800">
                          {(['filters', 'captions', 'audio', 'export'] as const).map(t => (
                            <button
                              key={t}
                              onClick={() => setToolTab(t)}
                              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                                toolTab === t
                                  ? 'text-amber-400 bg-amber-500/5 border-b-2 border-amber-500'
                                  : 'text-gray-500 hover:text-gray-300'
                              }`}
                            >
                              {t === 'filters' && '🎨 '}
                              {t === 'captions' && '💬 '}
                              {t === 'audio' && '🔊 '}
                              {t === 'export' && '📦 '}
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                          ))}
                        </div>

                        <div className="p-4">
                          {/* ── Filters ── */}
                          {toolTab === 'filters' && (
                            <div className="flex flex-col gap-3">
                              <p className="text-xs text-gray-500">Select a filter to apply to your video preview and export.</p>
                              <div className="flex flex-wrap gap-2">
                                {FILTER_NAMES.map(f => (
                                  <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                      activeFilter === f
                                        ? 'border-amber-500 bg-amber-500/10 text-amber-400 ring-1 ring-amber-500'
                                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                                    }`}
                                  >
                                    {f}
                                  </button>
                                ))}
                              </div>
                              {activeFilter !== 'None' && (
                                <p className="text-xs text-amber-400/70">
                                  Active: <span className="font-mono text-amber-400">{activeFilter}</span>
                                  {' — '}applied via CSS filter on preview + baked into export.
                                </p>
                              )}
                            </div>
                          )}

                          {/* ── Captions ── */}
                          {toolTab === 'captions' && (
                            <div className="flex flex-col gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-400">Caption text</label>
                                <input
                                  type="text"
                                  value={captionText}
                                  onChange={e => setCaptionText(e.target.value)}
                                  placeholder="Type your caption..."
                                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/60"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-400">
                                  Font size: <span className="font-mono text-amber-400">{captionFontSize}px</span>
                                </label>
                                <input
                                  type="range"
                                  min={12}
                                  max={72}
                                  value={captionFontSize}
                                  onChange={e => setCaptionFontSize(parseInt(e.target.value))}
                                  className="accent-amber-500"
                                />
                                <div className="flex justify-between text-xs text-gray-600"><span>12px</span><span>72px</span></div>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-400">Position</label>
                                <div className="flex gap-2">
                                  {(['top', 'center', 'bottom'] as const).map(pos => (
                                    <button
                                      key={pos}
                                      onClick={() => setCaptionPosition(pos)}
                                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                                        captionPosition === pos
                                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                          : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                                      }`}
                                    >
                                      {pos.charAt(0).toUpperCase() + pos.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-400">Text color</label>
                                <div className="flex gap-2">
                                  {CAPTION_COLORS.map(c => (
                                    <button
                                      key={c}
                                      onClick={() => setCaptionColor(c)}
                                      title={c}
                                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                                        captionColor === c ? 'border-amber-500 scale-110' : 'border-gray-700'
                                      }`}
                                      style={{ background: c }}
                                    />
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <label className="text-xs font-semibold text-gray-400">Background</label>
                                <button
                                  onClick={() => setCaptionBg(!captionBg)}
                                  className={`relative w-10 h-5 rounded-full transition-colors ${captionBg ? 'bg-amber-500' : 'bg-gray-700'}`}
                                >
                                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${captionBg ? 'left-5' : 'left-0.5'}`} />
                                </button>
                                <span className="text-xs text-gray-500">{captionBg ? 'Semi-black pill' : 'Transparent'}</span>
                              </div>
                            </div>
                          )}

                          {/* ── Audio ── */}
                          {toolTab === 'audio' && (
                            <div className="flex flex-col gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-400">
                                  Volume: <span className="font-mono text-amber-400">{muted ? '0%' : `${volume}%`}</span>
                                </label>
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={volume}
                                  onChange={e => { setVolume(parseInt(e.target.value)); setMuted(false) }}
                                  disabled={muted}
                                  className="accent-amber-500 disabled:opacity-50"
                                />
                              </div>
                              <button
                                onClick={() => setMuted(!muted)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all self-start ${
                                  muted
                                    ? 'border-red-500/60 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                                }`}
                              >
                                {muted ? '🔇 Muted — click to unmute' : '🔊 Mute'}
                              </button>

                              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-800 bg-gray-800/50 opacity-60">
                                <span className="text-base">🎵</span>
                                <div>
                                  <p className="text-xs font-semibold text-gray-400">Background music</p>
                                  <p className="text-xs text-gray-600">Coming soon — add royalty-free music to your clips</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ── Export ── */}
                          {toolTab === 'export' && (
                            <div className="flex flex-col gap-4">
                              <div>
                                <p className="text-xs font-semibold text-gray-400 mb-2">Export for: <span className="text-amber-400">{spec.name}</span></p>
                                <p className="text-xs text-gray-600">
                                  Target: <span className="font-mono text-gray-400">{getPlatformDimensions(selectedPlatform).width} × {getPlatformDimensions(selectedPlatform).height}</span>
                                  {' '}· Format: <span className="font-mono text-gray-400">WebM (VP9)</span>
                                </p>
                              </div>

                              <div className="flex flex-col gap-2 text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                  <span className={activeFilter !== 'None' ? 'text-amber-400' : 'text-gray-600'}>✦</span>
                                  <span>Filter: <span className="font-mono text-gray-300">{activeFilter}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={captionText ? 'text-amber-400' : 'text-gray-600'}>✦</span>
                                  <span>Caption: <span className="font-mono text-gray-300">{captionText || 'none'}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-amber-400">✦</span>
                                  <span>Trim: <span className="font-mono text-gray-300">{formatTime(trimStart)} → {formatTime(trimEnd)}</span></span>
                                </div>
                              </div>

                              {exportError && (
                                <div className="px-3 py-2 rounded-lg border border-red-500/40 bg-red-500/10 text-xs text-red-400">
                                  {exportError}
                                </div>
                              )}

                              <button
                                onClick={exportVideo}
                                disabled={exporting}
                                className="px-5 py-2.5 rounded-xl bg-amber-500 text-gray-950 font-bold text-sm hover:opacity-90 transition-all disabled:opacity-60 flex items-center gap-2"
                              >
                                {exporting ? (
                                  <>
                                    <span className="inline-block w-3 h-3 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin" />
                                    Exporting…
                                  </>
                                ) : (
                                  '📦 Export for ' + spec.name
                                )}
                              </button>
                              <p className="text-xs text-gray-600">
                                Export renders the trimmed clip with filters baked in. Chrome/Edge recommended.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom action bar */}
                      <div className="flex items-center gap-3 pt-2 border-t border-gray-800 flex-wrap">
                        <button
                          onClick={() => router.push('/compose')}
                          className="px-5 py-2.5 rounded-xl bg-amber-500 text-gray-950 font-bold text-sm hover:opacity-90 transition-all"
                        >
                          Schedule this video →
                        </button>
                        <button
                          onClick={captureThumbnail}
                          disabled={!videoRef.current || videoDuration === 0}
                          className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 font-semibold text-sm hover:border-amber-500/40 hover:text-amber-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Capture current frame as PNG thumbnail"
                        >
                          📷 Capture Thumbnail
                        </button>
                        <button
                          onClick={exportVideo}
                          disabled={exporting}
                          className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 font-semibold text-sm hover:border-gray-600 hover:text-gray-100 transition-all disabled:opacity-60"
                        >
                          {exporting ? 'Exporting…' : '⬇ Download Export'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* ── Image tab (unchanged) ── */
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
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f) }}
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
                            onClick={() => { setImageFile(null); if (imageUrl) { URL.revokeObjectURL(imageUrl); setImageUrl(null) } }}
                            className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>
                      <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 flex items-center justify-center min-h-64 p-4">
                        {imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imageUrl} alt="Preview" className="max-w-full max-h-96 w-auto rounded-xl object-contain" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Image toolbar */}
                  <div className="flex flex-wrap gap-2">
                    <ComingSoonBtn icon="✂️" label="Crop" />
                    <ComingSoonBtn icon="🎨" label="Filter" />
                    <ComingSoonBtn icon="💡" label="Brightness/Contrast" />
                    <ComingSoonBtn icon="✏️" label="Text Overlay" />
                    <ComingSoonBtn icon="🌟" label="Stickers" />
                    <ComingSoonBtn icon="🔲" label="Background" />
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
                    <button className="px-5 py-2.5 rounded-xl bg-amber-500 text-gray-950 font-bold text-sm hover:opacity-90 transition-all" disabled={!imageFile}>
                      Save to Drafts
                    </button>
                    <button className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 font-semibold text-sm hover:border-gray-600 hover:text-gray-100 transition-all" disabled={!imageFile}>
                      Download
                    </button>
                    {!imageFile && <span className="text-xs text-gray-600">Upload an image or pick a template to export</span>}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right panel */}
          <aside className="hidden lg:flex flex-col w-72 border-l border-gray-800 bg-gray-950 p-5 gap-5 overflow-y-auto">
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

            {/* Export + actions */}
            {activeTab === 'video' && videoFile && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Quick Actions</p>
                <button
                  onClick={exportVideo}
                  disabled={exporting}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-500 text-gray-950 font-bold text-sm hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {exporting ? (
                    <>
                      <span className="inline-block w-3 h-3 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin" />
                      Exporting…
                    </>
                  ) : '📦 Export for ' + spec.name}
                </button>
                <button
                  onClick={captureThumbnail}
                  disabled={!videoRef.current || videoDuration === 0}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 font-semibold text-sm hover:border-amber-500/40 hover:text-amber-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  📷 Capture Thumbnail
                </button>
                <button
                  onClick={() => router.push('/compose')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 font-semibold text-sm hover:border-gray-600 hover:text-gray-100 transition-all"
                >
                  📅 Schedule this video →
                </button>
                {exportError && (
                  <p className="text-xs text-red-400 mt-1">{exportError}</p>
                )}
              </div>
            )}

            {/* Filter chips */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Filters</p>
              <div className="flex flex-wrap gap-2">
                {FILTER_NAMES.map(f => (
                  <button
                    key={f}
                    onClick={() => activeTab === 'video' && videoFile && setActiveFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      activeFilter === f && activeTab === 'video' && videoFile
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    {f}
                  </button>
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

            {/* Pro tip */}
            <div className="mt-auto p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <p className="text-xs font-bold text-amber-400 mb-1">✦ Pro tip</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Select your platform first — the editor will auto-size your export to the exact recommended dimensions.
                Use <strong className="text-gray-300">Capture Thumbnail</strong> to grab any frame as a PNG for your upload thumbnail.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
