'use client'
import { useState, useRef } from 'react'
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

// ── Filter lists ──────────────────────────────────────────────────────────────

const VIDEO_FILTERS = ['Amber', 'Light Blue', 'B&W', 'Dark Contrast', 'Warm', 'Cool', 'Cinematic']

const IMAGE_TEMPLATES = [
  { name: 'TikTok Thumbnail',  dims: '1080 × 1920' },
  { name: 'YouTube Thumbnail', dims: '1280 × 720'  },
  { name: 'Instagram Post',    dims: '1080 × 1350' },
  { name: 'Instagram Story',   dims: '1080 × 1920' },
  { name: 'Twitter Header',    dims: '1500 × 500'  },
  { name: 'Pinterest Pin',     dims: '1000 × 1500' },
]

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

// ── Under construction banner ─────────────────────────────────────────────────

function ConstructionBanner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-sm text-amber-400/80">
      <span className="text-base">🚧</span>
      <span>{label} — full editing coming very soon</span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CreatePageClient() {
  const [activeTab, setActiveTab] = useState<'video' | 'image'>('video')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('tiktok')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [videoDragOver, setVideoDragOver] = useState(false)
  const [imageDragOver, setImageDragOver] = useState(false)
  const [filterEmail, setFilterEmail] = useState('')
  const [filterNotifyState, setFilterNotifyState] = useState<'idle' | 'loading' | 'done'>('idle')

  const videoInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

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

  const spec = PLATFORM_SPECS.find(p => p.id === selectedPlatform) ?? PLATFORM_SPECS[0]

  function handleVideoFile(file: File) {
    setVideoFile(file)
    setVideoUrl(URL.createObjectURL(file))
  }

  function handleImageFile(file: File) {
    setImageFile(file)
    setImageUrl(URL.createObjectURL(file))
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Filter platforms by type for the active tab
  const visiblePlatforms = PLATFORM_SPECS.filter(p =>
    activeTab === 'video' ? p.type !== 'image' : p.type !== 'video'
  )

  // When switching tabs, reset selection to first valid platform
  function switchTab(tab: 'video' | 'image') {
    setActiveTab(tab)
    const first = PLATFORM_SPECS.find(p => tab === 'video' ? p.type !== 'image' : p.type !== 'video')
    if (first && first.id !== selectedPlatform) setSelectedPlatform(first.id)
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* ── Sticky header bar ── */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-gray-950/95 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="text-amber-400 text-xl">✦</span>
              Creator Studio
            </h1>
            {/* Tab switcher */}
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

        {/* ── Coming Soon banner ── */}
        <div className="px-5 py-3 flex items-center gap-3 border-b border-amber-500/20 bg-amber-500/5">
          <span className="text-base flex-shrink-0">✦</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-400">Creator Studio — Coming Soon</p>
            <p className="text-xs text-amber-400/70 leading-relaxed">
              Full video trimming, image editing, filter application, and one-click platform export are in active development.
              Upload, preview, and check platform specs now — full editing ships very soon.
            </p>
          </div>
        </div>

        {/* ── Main layout: editor area + right specs panel ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left / center: platform picker + editor ── */}
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
                  <ConstructionBanner label="Video editing engine loading" />

                  {/* Upload area */}
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
                        onChange={e => {
                          const f = e.target.files?.[0]
                          if (f) handleVideoFile(f)
                        }}
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
                            onClick={() => { setVideoFile(null); setVideoUrl(null) }}
                            className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>

                      {/* Video preview */}
                      <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-800 flex items-center justify-center min-h-64">
                        {videoUrl && (
                          <video
                            src={videoUrl}
                            controls
                            className="max-w-full max-h-96 w-auto"
                            style={{ aspectRatio: spec.ratio.replace(':', '/') }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Toolbar */}
                  <div className="flex flex-wrap gap-2">
                    <ComingSoonBtn icon="✂️" label="Trim & Cut" />
                    <ComingSoonBtn icon="🔲" label="Crop" />
                    <ComingSoonBtn icon="🎨" label="Filters" />
                    <ComingSoonBtn icon="💬" label="Captions" />
                    <ComingSoonBtn icon="🔊" label="Audio" />
                    <ComingSoonBtn icon="📊" label="Quality" />
                  </div>

                  {/* Export bar */}
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
                    <button
                      className="px-5 py-2.5 rounded-xl bg-amber-500 text-gray-950 font-bold text-sm hover:opacity-90 transition-all"
                      disabled={!videoFile}
                    >
                      Save to Drafts
                    </button>
                    <button
                      className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 font-semibold text-sm hover:border-gray-600 hover:text-gray-100 transition-all"
                      disabled={!videoFile}
                    >
                      Download
                    </button>
                    {!videoFile && (
                      <span className="text-xs text-gray-600">Upload a video to export</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <ConstructionBanner label="Image editing engine loading" />

                  {/* Upload or template */}
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

                      {/* Template grid */}
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
                      {/* File info */}
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

                      {/* Image preview */}
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

                  {/* Toolbar */}
                  <div className="flex flex-wrap gap-2">
                    <ComingSoonBtn icon="✂️" label="Crop" />
                    <ComingSoonBtn icon="🎨" label="Filter" />
                    <ComingSoonBtn icon="💡" label="Brightness/Contrast" />
                    <ComingSoonBtn icon="✏️" label="Text Overlay" />
                    <ComingSoonBtn icon="🌟" label="Stickers" />
                    <ComingSoonBtn icon="🔲" label="Background" />
                  </div>

                  {/* Export bar */}
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
                    <button
                      className="px-5 py-2.5 rounded-xl bg-amber-500 text-gray-950 font-bold text-sm hover:opacity-90 transition-all"
                      disabled={!imageFile}
                    >
                      Save to Drafts
                    </button>
                    <button
                      className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 font-semibold text-sm hover:border-gray-600 hover:text-gray-100 transition-all"
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

          {/* ── Right: platform specs panel ── */}
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

            {/* Filter preview chips */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Filters</p>
              <div className="flex flex-wrap gap-2">
                {VIDEO_FILTERS.map(f => (
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

            {/* Quick tip */}
            <div className="mt-auto p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <p className="text-xs font-bold text-amber-400 mb-1">✦ Pro tip</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Select your platform first — the editor will auto-crop and resize your content to the exact recommended dimensions.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

// ── Spec row sub-component ────────────────────────────────────────────────────

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 py-2.5 border-b border-gray-800/60">
      <span className="text-xs text-gray-500 leading-tight">{label}</span>
      <span className="text-xs font-mono font-semibold text-gray-200 text-right leading-tight">{value}</span>
    </div>
  )
}
