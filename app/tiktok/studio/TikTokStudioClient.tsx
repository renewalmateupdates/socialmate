'use client'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import FilmstripTimeline from '@/components/tiktok/FilmstripTimeline'
import SafeAreaOverlay from '@/components/tiktok/SafeAreaOverlay'
import PhotoComposer from '@/components/tiktok/PhotoComposer'

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

// ── Post settings panel (shared between right panel and mobile Post tab) ──────

interface PostSettingsPanelProps {
  postCaption:     string
  setPostCaption:  (v: string) => void
  charCount:       number
  hashtags:        string[]
  setHashtags:     (fn: (prev: string[]) => string[]) => void
  hashtagInput:    string
  setHashtagInput: (v: string) => void
  aiHashtagLoading: boolean
  suggestHashtags: () => void
  selectedSound:   Sound | null
  setSelectedSound: (s: Sound | null) => void
  privacyLevel:    string
  setPrivacyLevel: (v: string) => void
  disableDuet:     boolean
  setDisableDuet:  (v: boolean) => void
  disableStitch:   boolean
  setDisableStitch: (v: boolean) => void
  disableComment:  boolean
  setDisableComment: (v: boolean) => void
  scheduleMode:    'now' | 'schedule' | 'drafts'
  setScheduleMode: (v: 'now' | 'schedule' | 'drafts') => void
  scheduledAt:     string
  setScheduledAt:  (v: string) => void
  postError:       string | null
  videoUrl:        string | null
  isWorking:       boolean
  uploading:       boolean
  posting:         boolean
  handlePost:      () => void
}

function PostSettingsPanel({
  postCaption, setPostCaption, charCount,
  hashtags, setHashtags, hashtagInput, setHashtagInput,
  aiHashtagLoading, suggestHashtags,
  selectedSound, setSelectedSound,
  privacyLevel, setPrivacyLevel,
  disableDuet, setDisableDuet,
  disableStitch, setDisableStitch,
  disableComment, setDisableComment,
  scheduleMode, setScheduleMode,
  scheduledAt, setScheduledAt,
  postError, videoUrl, isWorking, uploading, posting, handlePost,
}: PostSettingsPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-5 overflow-y-auto">

        {/* Caption */}
        <div>
          <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-2">
            Post Caption
          </label>
          <p className="text-xs text-ink-faint mb-2">
            This is the description shown on your TikTok post — separate from any video overlay text.
          </p>
          <textarea
            value={postCaption}
            onChange={e => setPostCaption(e.target.value.slice(0, 2200))}
            placeholder="Describe your video…"
            rows={5}
            className="w-full bg-panel border border-edge rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-ink-faint resize-none focus:border-[#fe2c55] outline-none transition-colors"
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-ink-faint">{charCount} / 2200</p>
            {charCount > 1800 && (
              <p className="text-xs text-amber-500">{2200 - charCount} chars left</p>
            )}
          </div>
        </div>

        {/* Hashtags */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-ink-muted uppercase tracking-wider">Hashtags</label>
            <button
              onClick={suggestHashtags}
              disabled={!postCaption || aiHashtagLoading}
              className="text-xs text-[#fe2c55] disabled:opacity-40 hover:underline font-semibold transition-opacity"
            >
              {aiHashtagLoading ? '…thinking' : '✦ AI Suggest (5 cr)'}
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
              className="flex-1 bg-panel border border-edge rounded-xl px-3 py-2 text-xs text-white placeholder:text-ink-faint focus:border-[#fe2c55] outline-none transition-colors"
            />
          </div>
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {hashtags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-1 bg-raised border border-edge rounded-xl text-xs text-ink-high"
                >
                  #{tag}
                  <button
                    onClick={() => setHashtags(prev => prev.filter(t => t !== tag))}
                    className="text-ink-muted hover:text-red-400 leading-none transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Selected sound badge */}
        {selectedSound && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#fe2c55]/10 border border-[#fe2c55]/30 rounded-xl text-xs text-[#fe2c55]">
            <span>🎵</span>
            <span className="flex-1 font-semibold truncate">{selectedSound.name}</span>
            <button onClick={() => setSelectedSound(null)} className="opacity-60 hover:opacity-100 transition-opacity">×</button>
          </div>
        )}

        {/* Privacy */}
        <div>
          <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-2">Privacy</label>
          <div className="grid grid-cols-3 gap-1.5">
            {PRIVACY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPrivacyLevel(opt.value)}
                className={`px-2 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  privacyLevel === opt.value
                    ? 'bg-[#fe2c55] border-[#fe2c55] text-white shadow-sm shadow-[#fe2c55]/30'
                    : 'bg-panel border-edge text-ink-muted hover:border-edge-lit hover:text-ink-high'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interaction toggles */}
        <div>
          <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-2">Interactions</label>
          <div className="space-y-2">
            {[
              { key: 'duet',    label: 'Disable Duets',    val: disableDuet,    set: setDisableDuet },
              { key: 'stitch',  label: 'Disable Stitch',   val: disableStitch,  set: setDisableStitch },
              { key: 'comment', label: 'Disable Comments', val: disableComment, set: setDisableComment },
            ].map(({ key, label, val, set }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-ink-muted group-hover:text-ink-high transition-colors">{label}</span>
                <button
                  onClick={() => set(!val)}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${val ? 'bg-[#fe2c55]' : 'bg-raised hover:bg-raised'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${val ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </label>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-2">When to Post</label>
          <div className="flex gap-2 mb-2">
            {(['now', 'schedule'] as const).map(m => (
              <button
                key={m}
                onClick={() => setScheduleMode(m)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  scheduleMode === m
                    ? 'bg-[#fe2c55] border-[#fe2c55] text-white shadow-sm shadow-[#fe2c55]/30'
                    : 'bg-panel border-edge text-ink-muted hover:border-edge-lit hover:text-ink-high'
                }`}
              >
                {m === 'now' ? '⚡ Post Now' : '📅 Schedule'}
              </button>
            ))}
          </div>

          {/* The only route to TikTok's sound library. TikTok never exposes
              sound audio to a third party, so a track can only be added inside
              their app — which means getting the video there as a draft. */}
          <button
            onClick={() => setScheduleMode('drafts')}
            className={`w-full py-2.5 px-3 rounded-xl text-left border transition-all mb-2 ${
              scheduleMode === 'drafts'
                ? 'bg-[#fe2c55]/10 border-[#fe2c55]/50'
                : 'bg-panel border-edge hover:border-edge-lit'
            }`}
          >
            <span className={`text-xs font-bold ${scheduleMode === 'drafts' ? 'text-[#fe2c55]' : 'text-ink-high'}`}>
              🎵 Send to TikTok drafts
            </span>
            <span className="block text-[11px] text-ink-muted mt-0.5 leading-snug">
              Finish in the TikTok app, where you can add any sound from their library.
            </span>
          </button>
          {scheduleMode === 'schedule' && (
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              min={new Date(Date.now() + 5 * 60_000).toISOString().slice(0, 16)}
              className="w-full bg-panel border border-edge rounded-xl px-3 py-2 text-sm text-white focus:border-[#fe2c55] outline-none transition-colors"
            />
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="pt-4 mt-4 border-t border-edge space-y-2">
        {postError && (
          <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-800/50 rounded-xl">
            <span className="text-red-400 text-xs mt-0.5">⚠️</span>
            <p className="text-xs text-red-400">{postError}</p>
          </div>
        )}
        <button
          onClick={handlePost}
          disabled={!videoUrl || isWorking || (scheduleMode === 'schedule' && !scheduledAt)}
          className="w-full bg-[#fe2c55] text-white font-extrabold py-3.5 rounded-2xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#fe2c55]/20"
        >
          {uploading
            ? <><span className="animate-spin">⏳</span> Uploading to TikTok…</>
            : posting
            ? <><span className="animate-pulse">🚀</span> Publishing…</>
            : scheduleMode === 'schedule'
            ? '📅 Schedule Video'
            : scheduleMode === 'drafts'
            ? '🎵 Send to TikTok drafts'
            : '🚀 Post to TikTok'}
        </button>
        <p className="text-xs text-ink-faint text-center">
          {uploading
            ? 'Uploading your video directly to TikTok…'
            : 'Your original video will be uploaded via TikTok\'s Content Posting API.'}
        </p>
      </div>
    </div>
  )
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
  // Frames come back from the timeline once, and the cover picker reuses them
  // rather than decoding the video a second time.
  const [frames, setFrames]               = useState<{ time: number; url: string }[]>([])
  const [coverTime, setCoverTime]         = useState<number | null>(null)
  const [showSafeArea, setShowSafeArea]   = useState(false)
  // "Browse files" assumed the creator already had a finished video, which is
  // the one thing a studio should not assume.
  const [composerOpen, setComposerOpen]   = useState(false)

  // Edit state
  const [activeFilter, setActiveFilter]         = useState('None')
  // Eight presets is a filter menu, not colour control. These compose on top of
  // whichever preset is selected, so a look can be dialled in rather than picked.
  const [adjust, setAdjust] = useState({ brightness: 100, contrast: 100, saturation: 100, warmth: 0 })
  const adjustDefault = adjust.brightness === 100 && adjust.contrast === 100
                     && adjust.saturation === 100 && adjust.warmth === 0
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
  const [scheduleMode, setScheduleMode]         = useState<'now' | 'schedule' | 'drafts'>('now')
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
  // TikTok processes asynchronously, so "uploaded" is not "published". Until
  // this settles we are still waiting on their answer, not on ourselves.
  const [publishState, setPublishState] = useState<'idle' | 'checking' | 'live' | 'drafted' | 'rejected' | 'unknown'>('idle')
  const [publishReason, setPublishReason] = useState<string | null>(null)

  // Refs
  const videoRef    = useRef<HTMLVideoElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const animRef     = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const audioSrcRef = useRef<MediaElementAudioSourceNode | null>(null)

  // Reset audio nodes when video file changes
  useEffect(() => {
    audioSrcRef.current = null
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
  }, [videoFile])

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

  const seekTo = useCallback((t: number) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = t
    setCurrentTime(t)
  }, [])

  // ── Keyboard ────────────────────────────────────────────────────────────────
  // The shortcuts every editor shares. Someone who has used one before will try
  // space and the arrow keys within the first ten seconds, and having them do
  // nothing is what makes a tool feel like a form instead of an instrument.
  useEffect(() => {
    if (!videoUrl) return
    const onKey = (e: KeyboardEvent) => {
      // Never steal a key from someone typing a caption.
      const el = e.target as HTMLElement | null
      const tag = el?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const v = videoRef.current
      if (!v) return
      const step = e.shiftKey ? 1 : 1 / 30

      switch (e.key) {
        case ' ':
          e.preventDefault(); togglePlay(); break
        case 'ArrowLeft':
          e.preventDefault(); seekTo(Math.max(trimStart, v.currentTime - step)); break
        case 'ArrowRight':
          e.preventDefault(); seekTo(Math.min(trimEnd, v.currentTime + step)); break
        case 'Home':
          e.preventDefault(); seekTo(trimStart); break
        case 'End':
          e.preventDefault(); seekTo(trimEnd); break
        case 'i': case 'I':
          e.preventDefault(); setTrimStart(Math.min(v.currentTime, trimEnd - MIN_DURATION_S)); break
        case 'o': case 'O':
          e.preventDefault(); setTrimEnd(Math.max(v.currentTime, trimStart + MIN_DURATION_S)); break
        default: break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [videoUrl, togglePlay, seekTo, trimStart, trimEnd])

  // One filter string for the preview canvas and the exported frames, so what
  // is recorded is exactly what was on screen.
  const composedFilter = useMemo(() => {
    const parts: string[] = []
    const preset = FILTERS[activeFilter]
    if (preset) parts.push(preset)
    if (adjust.brightness !== 100) parts.push(`brightness(${adjust.brightness / 100})`)
    if (adjust.contrast !== 100)   parts.push(`contrast(${adjust.contrast / 100})`)
    if (adjust.saturation !== 100) parts.push(`saturate(${adjust.saturation / 100})`)
    // Warmth is sepia plus a hue nudge, which reads as warm or cool without
    // needing a real colour-temperature pass.
    if (adjust.warmth > 0) parts.push(`sepia(${(adjust.warmth / 100) * 0.5})`)
    if (adjust.warmth < 0) parts.push(`hue-rotate(${adjust.warmth * 0.35}deg) saturate(1.05)`)
    return parts.join(' ')
  }, [activeFilter, adjust])

  // ── Canvas frame renderer ───────────────────────────────────────────────────

  const drawFrame = useCallback(() => {
    const v   = videoRef.current
    const ctx = canvasRef.current?.getContext('2d')
    if (!v || !ctx || v.readyState < 2) return

    ctx.filter = composedFilter || 'none'
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
  }, [composedFilter, captionOverlay, captionFontSize, captionPosition, captionColor, captionBg])

  useEffect(() => {
    if (!isPlaying || !videoRef.current) return
    const loop = () => { drawFrame(); animRef.current = requestAnimationFrame(loop) }
    animRef.current = requestAnimationFrame(loop)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [isPlaying, drawFrame])

  // ── Export ──────────────────────────────────────────────────────────────────

  // createMediaElementSource can only ever be called once per element; calling
  // it a second time throws and takes the whole export with it. Cached so a
  // second post attempt in the same session still works.
  const audioGraphRef = useRef<{ ctx: AudioContext; gain: GainNode; dest: MediaStreamAudioDestinationNode } | null>(null)

  /** Has the creator actually changed anything? */
  const hasEdits =
    trimStart > 0.05 ||
    (videoDuration > 0 && trimEnd < videoDuration - 0.05) ||
    activeFilter !== 'None' ||
    !adjustDefault ||
    captionOverlay.trim().length > 0 ||
    volume !== 100

  // TikTok accepts MP4 and MOV. MediaRecorder's universal format is WebM, which
  // TikTok rejects, so re-encoding is only possible where the browser can record
  // H.264. Chrome and Edge can; Firefox currently cannot.
  const pickMp4Mime = (): string | null => {
    if (typeof MediaRecorder === 'undefined') return null
    const candidates = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4;codecs=avc1',
      'video/mp4',
    ]
    for (const m of candidates) {
      if (MediaRecorder.isTypeSupported(m)) return m
    }
    return null
  }

  /**
   * Render the edit to a real file.
   *
   * Everything in this studio used to be preview only: `const uploadBlob =
   * videoFile` sent the untouched original to TikTok, so the trim, the filter,
   * the caption overlay and the volume changed what the creator saw here and
   * nothing about what their followers saw. This plays the kept region back
   * through the same drawFrame the preview uses, records the canvas, and mixes
   * the audio at the chosen volume.
   */
  const exportEditedVideo = useCallback(async (mimeType: string): Promise<Blob> => {
    const v = videoRef.current
    const canvas = canvasRef.current
    if (!v || !canvas) throw new Error('Nothing to export')

    const stream = canvas.captureStream(30)

    // Audio, at the chosen volume. A silent TikTok is not worth shipping, but a
    // failure to route audio should not lose the whole post either.
    try {
      if (!audioGraphRef.current) {
        const ctx = new AudioContext()
        const src = ctx.createMediaElementSource(v)
        const gain = ctx.createGain()
        const dest = ctx.createMediaStreamDestination()
        src.connect(gain)
        gain.connect(dest)
        gain.connect(ctx.destination)
        audioGraphRef.current = { ctx, gain, dest }
      }
      const g = audioGraphRef.current
      g.gain.gain.value = volume / 100
      if (g.ctx.state === 'suspended') await g.ctx.resume()
      g.dest.stream.getAudioTracks().forEach(t => stream.addTrack(t))
    } catch (e) {
      console.warn('[tiktok] audio capture failed, exporting video only', e)
    }

    const chunks: Blob[] = []
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 })
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }

    const finished = new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/mp4' }))
      recorder.onerror = () => reject(new Error('Recording failed partway through'))
    })

    // Seek to the in point and wait for the frame to actually be there.
    v.currentTime = trimStart
    await new Promise<void>(resolve => {
      const onSeeked = () => { v.removeEventListener('seeked', onSeeked); resolve() }
      v.addEventListener('seeked', onSeeked)
      setTimeout(resolve, 3000)
    })

    let raf = 0
    const stopAll = () => {
      cancelAnimationFrame(raf)
      v.pause()
      if (recorder.state !== 'inactive') recorder.stop()
    }

    recorder.start(100)
    await v.play()

    const loop = () => {
      drawFrame()
      if (v.currentTime >= trimEnd || v.ended) { stopAll(); return }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    // Hard ceiling, so a stalled element cannot leave the recorder running and
    // the button spinning forever.
    const guard = setTimeout(stopAll, (trimEnd - trimStart + 10) * 1000)
    const blob = await finished
    clearTimeout(guard)
    return blob
  }, [trimStart, trimEnd, volume, drawFrame])

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
      // Send what they actually made. This was `const uploadBlob = videoFile`,
      // so the original was uploaded untouched and every edit in this studio
      // was decorative — the trim, the filter, the caption and the volume all
      // changed the preview and nothing else.
      //
      // An untouched video is still uploaded byte for byte when nothing was
      // edited: that is faster, lossless, and re-encoding it would only lose
      // quality for no reason.
      let uploadBlob: Blob = videoFile
      let mimeType = videoFile.type === 'video/quicktime' ? 'video/mp4' : videoFile.type

      if (hasEdits) {
        const mp4 = pickMp4Mime()
        if (!mp4) {
          throw new Error(
            'This browser cannot re-encode video to MP4, which TikTok requires, so your trim and filter cannot be applied here. Chrome or Edge can do it. You can also clear the trim, filter and caption to post the original as it is.'
          )
        }
        setExporting(true)
        uploadBlob = await exportEditedVideo(mp4)
        setExporting(false)
        if (!uploadBlob || uploadBlob.size < 1024) {
          throw new Error('The edited video came out empty. Try again, or post the original without edits.')
        }
        mimeType = 'video/mp4'
      }

      // Step 1: Initialize FILE_UPLOAD with TikTok
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
          // Relative to the trimmed clip, which is what gets uploaded — not to
          // the original file the creator dropped in.
          video_cover_timestamp_ms:
            coverTime === null ? 0 : Math.max(0, Math.round((coverTime - trimStart) * 1000)),
          destination: scheduleMode === 'drafts' ? 'inbox' : 'direct',
        }),
      })
      const initData = await initRes.json()
      if (!initRes.ok) throw new Error(initData.error || 'Failed to initialize TikTok upload')
      const { upload_url, publish_id, open_id, full_caption } = initData

      // Step 2: PUT original file directly to TikTok's upload URL
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

      // Uploading the bytes is not publishing. TikTok returns 200 for the
      // transfer and then decides separately whether the video is acceptable —
      // length, format, copyrighted audio, and so on. Nothing used to ask, so
      // the studio claimed success for videos TikTok silently rejected.
      //
      // Scheduled posts are not polled: nothing has been sent to TikTok yet.
      if (scheduleMode !== 'schedule' && publish_id) {
        setPublishState('checking')
        const started = Date.now()
        const poll = async (): Promise<void> => {
          // Two minutes is well past normal processing. Beyond that, saying we
          // do not know yet is honest; claiming success is not.
          if (Date.now() - started > 120_000) { setPublishState('unknown'); return }
          try {
            const r = await fetch('/api/tiktok/publish-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ publish_id }),
            })
            const d = await r.json()
            if (d.status === 'published') { setPublishState('live'); return }
            if (d.status === 'in_drafts')  { setPublishState('drafted'); return }
            if (d.status === 'failed') {
              setPublishReason(d.reason ?? null)
              setPublishState('rejected')
              return
            }
          } catch { /* a dropped check is not a failed post; try again */ }
          setTimeout(() => { void poll() }, 4000)
        }
        void poll()
      }
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
    hasEdits, exportEditedVideo, coverTime, volume,
    postCaption, hashtags, captionOverlay, captionPosition, captionColor,
    activeFilter, selectedSound, privacyLevel, disableDuet, disableComment,
    disableStitch, scheduleMode, scheduledAt,
  ])

  // ── Derived ─────────────────────────────────────────────────────────────────

  const isWorking  = uploading || posting
  const charCount  = postCaption.length + (hashtags.length ? hashtags.map(t => `#${t}`).join(' ').length + 2 : 0)

  // Shared props object for PostSettingsPanel
  const postPanelProps: PostSettingsPanelProps = {
    postCaption, setPostCaption, charCount,
    hashtags, setHashtags, hashtagInput, setHashtagInput,
    aiHashtagLoading, suggestHashtags,
    selectedSound, setSelectedSound,
    privacyLevel, setPrivacyLevel,
    disableDuet, setDisableDuet,
    disableStitch, setDisableStitch,
    disableComment, setDisableComment,
    scheduleMode, setScheduleMode,
    scheduledAt, setScheduledAt,
    postError, videoUrl, isWorking, uploading, posting, handlePost,
  }

  // ── Loading / not-connected / success screens ───────────────────────────────

  if (creatorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#fe2c55] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-ink-muted">Checking TikTok connection…</p>
        </div>
      </div>
    )
  }

  if (!creator?.connected) {
    return (
      <div className="min-h-dvh bg-void flex">
        <Sidebar />
        <div className="md:ml-56 flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#fe2c55]/10 border border-[#fe2c55]/20 flex items-center justify-center text-4xl mx-auto mb-6">
              🎵
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2">TikTok Studio</h1>
            <p className="text-ink-muted mb-8 text-sm leading-relaxed">
              Connect your TikTok account to edit, trim, and publish videos directly from SocialMate.
            </p>
            <a
              href="/api/tiktok/auth"
              className="inline-flex items-center gap-2 bg-[#fe2c55] text-white font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm shadow-lg shadow-[#fe2c55]/20"
            >
              Connect TikTok →
            </a>
            <p className="text-xs text-ink-faint mt-4">
              Uses TikTok Login Kit + Content Posting API. Your credentials are never stored in plain text.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (postSuccess) {
    return (
      <div className="min-h-dvh bg-void flex">
        <Sidebar />
        <div className="md:ml-56 flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            {/* What TikTok actually said, rather than what we hoped. The old
                screen declared the video live the moment the bytes finished
                transferring, which is several steps before TikTok decides
                whether it will accept it at all. */}
            {(() => {
              const scheduled = scheduleMode === 'schedule'
              const tone =
                publishState === 'rejected'
                  ? 'bg-alert/10 border-alert/25 text-alert'
                : publishState === 'drafted'
                  ? 'bg-violet/10 border-violet/25 text-violet'
                : publishState === 'checking' || publishState === 'unknown'
                  ? 'bg-amber/10 border-amber/25 text-amber'
                  : 'bg-jade/10 border-jade/25 text-jade'
              const icon =
                publishState === 'rejected' ? '✕'
                : publishState === 'drafted' ? '♪'
                : publishState === 'checking' ? '⋯'
                : publishState === 'unknown' ? '?'
                : '✓'
              const heading =
                scheduled                      ? 'Video scheduled'
                : publishState === 'checking'  ? 'Sent to TikTok'
                : publishState === 'live'      ? 'Published to TikTok'
                : publishState === 'drafted'   ? 'Waiting in your TikTok drafts'
                : publishState === 'rejected'  ? 'TikTok rejected the video'
                : publishState === 'unknown'   ? 'Still processing at TikTok'
                : 'Uploaded to TikTok'
              const body =
                scheduled
                  ? `Your video will go live on ${new Date(scheduledAt).toLocaleString()}.`
                : publishState === 'checking'
                  ? 'The upload finished. Waiting for TikTok to finish processing it — this is usually quick.'
                : publishState === 'live'
                  ? 'TikTok confirmed the video is published.'
                : publishState === 'drafted'
                  ? 'Open TikTok, go to your drafts, and finish it there — that is where you can add a sound from their library, then post.'
                : publishState === 'rejected'
                  ? (publishReason
                      ? `TikTok gave this reason: ${publishReason}`
                      : 'TikTok rejected it without giving a reason. Common causes are length, an unsupported format, or copyrighted audio.')
                : publishState === 'unknown'
                  ? 'TikTok has not finished processing yet. It will usually still appear. Check your TikTok notifications, or the post in your queue.'
                  : 'The upload finished.'
              return (
                <>
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 border ${tone}`}>
                    {icon}
                  </div>
                  <h2 className="text-2xl font-extrabold text-ink-high mb-2">{heading}</h2>
                  <p className="text-ink-muted mb-8 text-sm leading-relaxed">{body}</p>
                </>
              )
            })()}
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
                className="bg-[#fe2c55] text-white font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-[#fe2c55]/20"
              >
                Create Another
              </button>
              <Link href="/dashboard" className="bg-raised text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-raised transition-all">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Upload progress overlay ─────────────────────────────────────────────────

  const UploadProgressBanner = isWorking ? (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 px-4 py-3 bg-[#fe2c55] text-white text-sm font-semibold shadow-lg">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
      {uploading ? 'Uploading your video to TikTok…' : 'Publishing your post…'}
    </div>
  ) : null

  // ── Main studio layout ──────────────────────────────────────────────────────

  return (
    <div className="min-h-dvh bg-void flex">
      <Sidebar />
      {UploadProgressBanner}

      <div className="md:ml-56 flex-1 flex flex-col">

        {/* ── Header ── */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 py-3 bg-void/95 backdrop-blur border-b border-edge/80">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black text-white shrink-0"
              style={{ background: '#fe2c55' }}
            >
              T
            </div>
            <span className="font-extrabold text-white tracking-tight text-sm md:text-base">TikTok Studio</span>
            <span className="text-xs bg-green-500/15 text-green-400 font-bold px-2 py-0.5 rounded-full border border-green-500/20">LIVE</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {creator.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={creator.avatar_url} alt="" className="w-7 h-7 rounded-full ring-2 ring-edge" />
            )}
            <span className="text-xs text-ink-muted hidden sm:block">{creator.account_name}</span>
            <button
              onClick={() => fetch('/api/tiktok/disconnect', { method: 'POST' }).then(() => setCreator({ connected: false }))}
              className="text-xs text-ink-faint hover:text-ink-muted transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* ── LEFT: Video editor ── */}
          <div className="flex flex-col flex-1 min-w-0 border-r border-edge/80">

            {/* Canvas / upload zone */}
            <div className="flex-1 flex items-center justify-center bg-black/50 p-4 md:p-6">
              {!videoUrl ? (
                composerOpen ? (
                <PhotoComposer
                  onCancel={() => setComposerOpen(false)}
                  // A composed video is handed to the same handler an uploaded
                  // one goes through, so it gets the same validation and the
                  // whole editor works on it without knowing where it came from.
                  onComposed={file => { setComposerOpen(false); handleFile(file) }}
                />
                ) : (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-full h-full min-h-[60vh] flex items-center justify-center cursor-pointer group"
                >
                  {/* Ambient field. The stage used to be an unbroken black
                      rectangle with a small dashed box floating in it, which is
                      what made a working tool read as an unfinished one. */}
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className={`absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] transition-opacity duration-500 ${dragOver ? 'opacity-40' : 'opacity-20'}`}
                         style={{ background: 'radial-gradient(circle, #fe2c55 0%, transparent 62%)' }} />
                    <div className="absolute left-[38%] top-[58%] h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px] opacity-15"
                         style={{ background: 'radial-gradient(circle, #25f4ee 0%, transparent 65%)' }} />
                  </div>

                  <div className="relative flex flex-col items-center gap-7 px-6">
                    {/* The shape of the thing they are making. */}
                    <div className={`relative aspect-[9/16] w-40 rounded-[26px] border transition-all duration-300 ${
                      dragOver
                        ? 'border-[#fe2c55] scale-[1.04] shadow-[0_0_60px_-12px_rgba(254,44,85,0.65)]'
                        : 'border-edge-lit/70 group-hover:border-[#fe2c55]/60 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)]'
                    }`}>
                      <div className="absolute inset-[7px] rounded-[20px] bg-gradient-to-b from-panel to-void" />
                      <div className="absolute left-1/2 top-2.5 h-1 w-10 -translate-x-1/2 rounded-full bg-edge-lit/80" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${dragOver ? 'text-[#fe2c55]' : 'text-ink-faint'}`}>
                          9:16
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#fe2c55] mb-2">
                        TikTok Studio
                      </p>
                      <h2 className="text-2xl md:text-[28px] font-extrabold tracking-tight text-ink-high leading-tight">
                        {dragOver ? 'Let go' : 'Drop a video to start'}
                      </h2>
                      <p className="mt-2 text-sm text-ink-muted max-w-sm">
                        Trim it on a real timeline, pick the frame people see first, and publish
                        straight to TikTok without leaving the tab.
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <button className="bg-[#fe2c55] text-white font-bold px-6 py-3 rounded-2xl text-sm hover:brightness-110 transition-all shadow-[0_10px_30px_-8px_rgba(254,44,85,0.7)]">
                        Browse files
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setComposerOpen(true) }}
                        className="text-xs font-semibold text-ink-muted hover:text-ink-high underline underline-offset-4 decoration-edge-lit transition-colors"
                      >
                        or build one from photos
                      </button>
                    </div>

                    {/* What this does, said before they commit a 500 MB upload. */}
                    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 max-w-md">
                      {['Frame-accurate trim', 'Cover frame picker', 'Safe-area guides', 'Direct publish'].map(f => (
                        <span key={f} className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                          <span className="h-1 w-1 rounded-full bg-jade" />{f}
                        </span>
                      ))}
                    </div>

                    <p className="font-mono text-[10px] tracking-[0.12em] text-ink-faint">
                      MP4 or MOV &middot; max 500 MB &middot; 3 sec to 10 min
                    </p>

                    {fileError && (
                      <p className="text-xs text-alert text-center max-w-sm">{fileError}</p>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp4,.mov,video/mp4,video/quicktime"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
                )
              ) : (
                <div className="relative" style={{ height: '65vh' }}>
                  {/* 9:16 phone frame */}
                  <div
                    className="relative overflow-hidden rounded-[28px] border border-edge-lit/60 shadow-2xl shadow-black/60 ring-1 ring-white/5"
                    style={{
                      width:  'calc(65vh * 9 / 16)',
                      height: '65vh',
                    }}
                  >
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
                    <canvas
                      ref={canvasRef}
                      width={CANVAS_W}
                      height={CANVAS_H}
                      className="w-full h-full"
                      style={{ filter: composedFilter || 'none' }}
                    />
                    {/* Play overlay */}
                    <button
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center group"
                    >
                      <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/10">
                        <span className="text-2xl">{isPlaying ? '⏸' : '▶️'}</span>
                      </div>
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
                    <SafeAreaOverlay show={showSafeArea} />

                    {/* Active filter badge */}
                    {activeFilter !== 'None' && (
                      <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full text-xs text-white font-semibold">
                        {activeFilter}
                      </div>
                    )}
                  </div>

                  {/* Change video button */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <button
                      onClick={() => setShowSafeArea(v => !v)}
                      title="Show where TikTok's own buttons and caption cover your video"
                      className={`font-mono text-[10px] uppercase tracking-[0.14em] px-2.5 py-1.5 rounded-xl border backdrop-blur-sm transition-colors ${
                        showSafeArea
                          ? 'bg-[#fe2c55]/20 border-[#fe2c55]/50 text-[#fe2c55]'
                          : 'bg-void/80 border-edge text-ink-muted hover:text-ink-high'
                      }`}
                    >
                      Guides
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="font-mono text-[10px] uppercase tracking-[0.14em] bg-void/80 text-ink-muted px-2.5 py-1.5 rounded-xl hover:text-ink-high border border-edge transition-colors backdrop-blur-sm"
                    >
                      Change
                    </button>
                  </div>
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

            {/* Timeline */}
            {videoUrl && (
              <div className="px-4 md:px-6 py-4 border-t border-edge space-y-3 bg-panel/60">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs tabular-nums text-ink-high">{formatTime(currentTime)}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setTrimStart(Math.min(currentTime, trimEnd - MIN_DURATION_S))}
                      title="Set clip start to the playhead (I)"
                      className="font-mono text-[10px] uppercase tracking-[0.14em] px-2.5 py-1.5 rounded-lg border border-edge text-ink-muted hover:text-ink-high hover:border-edge-lit transition-colors"
                    >
                      Set in
                    </button>
                    <button
                      onClick={() => setTrimEnd(Math.max(currentTime, trimStart + MIN_DURATION_S))}
                      title="Set clip end to the playhead (O)"
                      className="font-mono text-[10px] uppercase tracking-[0.14em] px-2.5 py-1.5 rounded-lg border border-edge text-ink-muted hover:text-ink-high hover:border-edge-lit transition-colors"
                    >
                      Set out
                    </button>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-ink-faint">{formatTime(videoDuration)}</span>
                </div>

                <FilmstripTimeline
                  videoUrl={videoUrl}
                  duration={videoDuration}
                  currentTime={currentTime}
                  trimStart={trimStart}
                  trimEnd={trimEnd}
                  minDuration={MIN_DURATION_S}
                  onSeek={seekTo}
                  onTrimChange={(a, b) => { setTrimStart(a); setTrimEnd(b) }}
                  onFramesReady={setFrames}
                />

                <p className="font-mono text-[10px] tracking-[0.1em] text-ink-faint text-center">
                  space play &middot; &larr; &rarr; step &middot; shift+&larr;&rarr; second &middot; I / O trim to playhead
                </p>

                {/* Cover frame. TikTok takes a timestamp for the thumbnail and
                    we were always sending 0, so every video was represented in
                    the feed by its literal first frame — usually black. */}
                {frames.length > 0 && (
                  <div className="pt-3 border-t border-edge">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                        Cover frame
                      </span>
                      {coverTime !== null && (
                        <button
                          onClick={() => setCoverTime(null)}
                          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink-high transition-colors"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {(() => {
                        const inClip = frames.filter(f => f.time >= trimStart && f.time <= trimEnd)
                        const choices = inClip.length > 0 ? inClip : frames
                        return choices.map(f => {
                          const active = coverTime !== null && Math.abs(coverTime - f.time) < 0.01
                          return (
                            <button
                              key={f.time}
                              onClick={() => { setCoverTime(f.time); seekTo(f.time) }}
                              title={`Use the frame at ${formatTime(f.time)}`}
                              className={`shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                                active ? 'border-amber scale-105' : 'border-transparent hover:border-edge-lit opacity-70 hover:opacity-100'
                              }`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={f.url} alt="" className="h-14 w-8 object-cover" draggable={false} />
                            </button>
                          )
                        })
                      })()}
                    </div>
                    <p className="mt-1.5 font-mono text-[10px] tracking-[0.1em] text-ink-faint">
                      {coverTime === null
                        ? 'Using the first frame. Pick one that is not black.'
                        : `Cover set to ${formatTime(coverTime)}`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tool tabs */}
            {videoUrl && (
              <div className="border-t border-edge/80">

                {/* Tab bar — pill style */}
                <div className="flex gap-1 p-2 bg-panel/60">
                  {(['filters', 'captions', 'audio', 'post'] as const).map(tab => {
                    const icons: Record<string, string> = {
                      filters:  '🎨',
                      captions: '💬',
                      audio:    '🔊',
                      post:     '📱',
                    }
                    const labels: Record<string, string> = {
                      filters:  'Filters',
                      captions: 'Text',
                      audio:    'Audio',
                      post:     'Post',
                    }
                    const isActive = toolTab === tab
                    return (
                      <button
                        key={tab}
                        onClick={() => setToolTab(tab)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#fe2c55] text-white shadow-sm shadow-[#fe2c55]/30'
                            : 'text-ink-muted hover:text-ink-body hover:bg-raised/50'
                        }`}
                      >
                        <span>{icons[tab]}</span>
                        <span className="hidden sm:inline">{labels[tab]}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Tab content */}
                <div className="p-4 max-h-72 overflow-y-auto">

                  {/* Filters tab */}
                  {toolTab === 'filters' && (
                    <div className="space-y-4">
                    <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                      {Object.keys(FILTERS).map(f => {
                        const isActive = activeFilter === f
                        return (
                          <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`relative flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl text-xs font-semibold border transition-all ${
                              isActive
                                ? 'bg-[#fe2c55] border-[#fe2c55] text-white shadow-sm shadow-[#fe2c55]/25'
                                : 'bg-panel border-edge/50 text-ink-muted hover:border-edge-lit hover:text-ink-high hover:bg-raised'
                            }`}
                          >
                            {f === 'None' && <span className="text-base">⊘</span>}
                            {f === 'B&W' && <span className="text-base">◑</span>}
                            {!['None', 'B&W'].includes(f) && (
                              <span
                                className="w-5 h-5 rounded-full border border-white/10"
                                style={{
                                  background: f === 'Amber' ? '#f59e0b'
                                    : f === 'Light Blue' ? '#38bdf8'
                                    : f === 'Dark Contrast' ? '#1e1e1e'
                                    : f === 'Warm' ? '#f97316'
                                    : f === 'Cool' ? '#60a5fa'
                                    : f === 'Cinematic' ? '#6366f1'
                                    : '#9ca3af',
                                }}
                              />
                            )}
                            <span className="leading-tight text-center">{f}</span>
                            {isActive && (
                              <span className="absolute top-1 right-1 text-[8px] font-black">✓</span>
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {/* Real colour control. The presets stay, but a look can now
                        be dialled in on top of one instead of being whatever the
                        preset decided. Every value here is baked into the export,
                        not just the preview. */}
                    <div className="rounded-xl border border-edge/60 bg-panel/50 p-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">Adjust</span>
                        {!adjustDefault && (
                          <button
                            onClick={() => setAdjust({ brightness: 100, contrast: 100, saturation: 100, warmth: 0 })}
                            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink-high transition-colors"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <div className="space-y-2.5">
                        {([
                          ['brightness', 'Brightness', 50, 150],
                          ['contrast',   'Contrast',   50, 150],
                          ['saturation', 'Saturation',  0, 200],
                          ['warmth',     'Warmth',    -60,  60],
                        ] as const).map(([key, label, min, max]) => (
                          <div key={key} className="flex items-center gap-3">
                            <label htmlFor={`adj-${key}`} className="w-20 shrink-0 text-[11px] text-ink-muted">{label}</label>
                            <input
                              id={`adj-${key}`}
                              type="range"
                              min={min}
                              max={max}
                              value={adjust[key]}
                              onChange={e => setAdjust(a => ({ ...a, [key]: Number(e.target.value) }))}
                              className="flex-1 accent-[#fe2c55]"
                            />
                            <span className="w-9 shrink-0 text-right font-mono text-[10px] tabular-nums text-ink-faint">
                              {adjust[key]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    </div>
                  )}

                  {/* Captions tab */}
                  {toolTab === 'captions' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
                          Overlay Text
                          <span className="ml-1.5 text-[10px] font-normal text-ink-faint normal-case">(burned into video visually)</span>
                        </label>
                        <textarea
                          value={captionOverlay}
                          onChange={e => setCaptionOverlay(e.target.value)}
                          placeholder="Text shown on your video…"
                          rows={2}
                          className="w-full bg-panel border border-edge/60 rounded-xl px-3 py-2 text-sm text-white placeholder:text-ink-faint resize-none focus:border-[#fe2c55] outline-none transition-colors"
                        />
                        <p className="text-[10px] text-ink-faint mt-1">
                          This appears as a visual overlay on your video preview. The post description is set in the Post tab.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs text-ink-muted">Position:</span>
                        {(['top', 'center', 'bottom'] as const).map(pos => (
                          <button
                            key={pos}
                            onClick={() => setCaptionPosition(pos)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize ${
                              captionPosition === pos
                                ? 'bg-[#fe2c55] border-[#fe2c55] text-white'
                                : 'bg-raised border-edge/50 text-ink-body hover:border-edge-lit'
                            }`}
                          >
                            {pos}
                          </button>
                        ))}
                        <span className="text-xs text-ink-muted ml-1">Color:</span>
                        {CAPTION_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => setCaptionColor(c)}
                            className={`w-7 h-7 rounded-full border-2 transition-all ${
                              captionColor === c ? 'border-white scale-110 shadow-sm' : 'border-edge-lit hover:border-edge-lit'
                            }`}
                            style={{ background: c }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-xs text-ink-muted shrink-0">Size: {captionFontSize}px</label>
                        <input
                          type="range" min={20} max={56} step={2}
                          value={captionFontSize}
                          onChange={e => setCaptionFontSize(parseInt(e.target.value))}
                          className="flex-1 accent-[#fe2c55]"
                        />
                        <label className="flex items-center gap-1.5 text-xs text-ink-muted cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={captionBg}
                            onChange={e => setCaptionBg(e.target.checked)}
                            className="accent-[#fe2c55] rounded"
                          />
                          BG
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Audio tab */}
                  {toolTab === 'audio' && (
                    <div className="space-y-4">

                      {/* Info banner */}
                      <div className="flex gap-3 p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl">
                        <span className="text-amber-400 text-base shrink-0">🎵</span>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-amber-300">About TikTok Music</p>
                          <p className="text-xs text-amber-400/80 leading-relaxed">
                            TikTok&apos;s API currently doesn&apos;t support adding music library tracks to scheduled posts —
                            audio comes directly from your video file. Record your video with music in the
                            background, or use TikTok&apos;s in-app editor after posting to add sounds.
                          </p>
                        </div>
                      </div>

                      {/* Volume control */}
                      <div>
                        <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-2">
                          Video Audio Volume
                        </label>
                        <div className="flex items-center gap-3">
                          <span className="text-sm">🔇</span>
                          <input
                            type="range" min={0} max={100}
                            value={volume}
                            onChange={e => setVolume(parseInt(e.target.value))}
                            className="flex-1 accent-[#fe2c55]"
                          />
                          <span className="text-sm">🔊</span>
                          <span className="text-xs text-ink-muted w-8 text-right font-mono">{volume}%</span>
                        </div>
                        <p className="text-[10px] text-ink-faint mt-1">
                          Preview only — TikTok uses the audio embedded in your uploaded video file.
                        </p>
                      </div>

                      {/* Tip */}
                      <div className="flex gap-2 p-2.5 bg-panel/60 border border-edge/40 rounded-xl">
                        <span className="text-xs shrink-0">💡</span>
                        <p className="text-xs text-ink-muted leading-relaxed">
                          <span className="font-semibold text-ink-body">Pro tip:</span> Record your video to a song playing in the background for built-in audio sync, then use TikTok&apos;s &quot;Add Sound&quot; feature after publishing to officially credit the track.
                        </p>
                      </div>

                      {/* Sound search (kept for future use / shows "Original audio" fallback) */}
                      <div>
                        <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-2">Sound Library</label>
                        <div className="flex gap-2">
                          <input
                            value={soundQuery}
                            onChange={e => setSoundQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && searchSounds(soundQuery)}
                            placeholder="Search sounds…"
                            className="flex-1 bg-panel border border-edge/60 rounded-xl px-3 py-2 text-sm text-white placeholder:text-ink-faint focus:border-[#fe2c55] outline-none transition-colors"
                          />
                          <button
                            onClick={() => searchSounds(soundQuery)}
                            disabled={soundLoading}
                            className="px-3 py-2 bg-raised border border-edge/60 rounded-xl text-xs text-ink-body hover:bg-raised disabled:opacity-50 transition-all"
                          >
                            {soundLoading ? <span className="animate-spin inline-block">⏳</span> : '🔍'}
                          </button>
                        </div>
                        {soundNote && (
                          <p className="text-xs text-amber-500/80 mt-1.5">{soundNote}</p>
                        )}
                        {sounds.length > 0 && (
                          <div className="mt-2 space-y-1 max-h-28 overflow-y-auto">
                            {sounds.map(s => (
                              <button
                                key={s.id}
                                onClick={() => setSelectedSound(s.id === selectedSound?.id ? null : s)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs transition-all ${
                                  selectedSound?.id === s.id
                                    ? 'bg-[#fe2c55]/20 border border-[#fe2c55]/40 text-white'
                                    : 'bg-panel border border-edge/60 text-ink-body hover:border-edge-lit'
                                }`}
                              >
                                <span className="text-base">{s.is_original ? '🎙️' : '🎵'}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate">{s.name}</p>
                                  {s.artist && <p className="text-ink-muted truncate">{s.artist}</p>}
                                </div>
                                {s.duration > 0 && (
                                  <span className="text-ink-muted shrink-0 font-mono">{formatTime(s.duration)}</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Post tab — full form on ALL screen sizes (fixes mobile) */}
                  {toolTab === 'post' && (
                    <PostSettingsPanel {...postPanelProps} />
                  )}

                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Post settings panel (desktop only) ── */}
          <div className="w-80 xl:w-96 flex-col bg-void overflow-y-auto hidden lg:flex border-l border-edge/40">
            {/* Before a video exists this panel was a live-looking form for a
                post that cannot be made yet, sitting above a large empty
                column. Held back until there is something to describe. */}
            {videoUrl ? (
              <div className="flex-1 p-5">
                <PostSettingsPanel {...postPanelProps} />
              </div>
            ) : (
              <div className="flex-1 p-5 flex flex-col justify-center items-center text-center gap-5">
                <div className="w-full max-w-[15rem] space-y-2.5" aria-hidden="true">
                  {[100, 72, 88].map((w, i) => (
                    <div key={i} className="h-2 rounded-full bg-panel" style={{ width: `${w}%` }} />
                  ))}
                  <div className="h-16 rounded-xl border border-edge bg-panel/60" />
                  <div className="flex gap-2 pt-1">
                    <div className="h-7 flex-1 rounded-lg border border-edge bg-panel/60" />
                    <div className="h-7 flex-1 rounded-lg border border-edge bg-panel/60" />
                    <div className="h-7 flex-1 rounded-lg border border-edge bg-panel/60" />
                  </div>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                    Caption, hashtags, privacy
                  </p>
                  <p className="mt-1.5 text-xs text-ink-muted max-w-[15rem]">
                    Everything about the post opens up once a video is loaded.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
