'use client'

/**
 * PostImageExporter
 * Renders a branded 1200×630 post card via the Canvas API and triggers a PNG download.
 * No external dependencies — pure browser canvas.
 */

import { useCallback, useState } from 'react'

const PLATFORM_NAMES: Record<string, string> = {
  discord:   'Discord',
  bluesky:   'Bluesky',
  telegram:  'Telegram',
  mastodon:  'Mastodon',
  twitter:   'X / Twitter',
  linkedin:  'LinkedIn',
  youtube:   'YouTube',
  pinterest: 'Pinterest',
  reddit:    'Reddit',
  instagram: 'Instagram',
  tiktok:    'TikTok',
  facebook:  'Facebook',
  threads:   'Threads',
}

const PLATFORM_ICONS: Record<string, string> = {
  discord:   '💬',
  bluesky:   '🦋',
  telegram:  '✈️',
  mastodon:  '🐘',
  twitter:   '🐦',
  linkedin:  '💼',
  youtube:   '▶️',
  pinterest: '📌',
  reddit:    '🤖',
  instagram: '📸',
  tiktok:    '🎵',
  facebook:  '📘',
  threads:   '🧵',
}

interface Props {
  content: string
  platform?: string
  handle?: string
  /** Optional: custom label for the trigger button. Defaults to "📸 Save as image" */
  buttonLabel?: string
  /** Optional: extra classes for the trigger button */
  buttonClassName?: string
}

/**
 * Wrap text at a max pixel width. Returns array of lines.
 * Uses canvas measureText for accurate wrapping.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const rawLines = text.split('\n')
  const result: string[] = []

  for (const rawLine of rawLines) {
    if (result.length >= maxLines) break

    if (rawLine.trim() === '') {
      result.push('')
      continue
    }

    const words = rawLine.split(' ')
    let current = ''

    for (const word of words) {
      if (result.length >= maxLines) break
      const test = current ? `${current} ${word}` : word
      if (ctx.measureText(test).width > maxWidth && current) {
        result.push(current)
        current = word
      } else {
        current = test
      }
    }

    if (current && result.length < maxLines) {
      result.push(current)
    }
  }

  return result
}

function drawCard(
  canvas: HTMLCanvasElement,
  content: string,
  platform: string | undefined,
  handle: string | undefined,
): void {
  const W = 1200
  const H = 630
  canvas.width  = W
  canvas.height = H

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // ── Background gradient ──────────────────────────────────────────────────
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, '#0a0a0a')
  grad.addColorStop(1, '#111827')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Subtle dot grid overlay
  ctx.fillStyle = 'rgba(255,255,255,0.015)'
  const gridStep = 40
  for (let x = 0; x < W; x += gridStep) {
    for (let y = 0; y < H; y += gridStep) {
      ctx.beginPath()
      ctx.arc(x, y, 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // ── Header bar ───────────────────────────────────────────────────────────
  // Logo text
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = '#f59e0b'
  ctx.textBaseline = 'top'
  ctx.fillText('SocialMate', 52, 28)

  // Divider line
  ctx.strokeStyle = '#1f2937'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, 64)
  ctx.lineTo(W, 64)
  ctx.stroke()

  // ── Content area ─────────────────────────────────────────────────────────
  const contentX    = 60
  const contentTopY = 96
  const contentMaxW = W - contentX * 2   // 1080px
  const maxLines    = 10
  const lineHeight  = 44

  ctx.font = '30px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = '#e5e7eb'
  ctx.textBaseline = 'top'

  const lines = wrapText(ctx, content, contentMaxW, maxLines)
  const truncated = lines.length === maxLines &&
    content.split('\n').join(' ').trim().length > lines.join(' ').length

  lines.forEach((line, i) => {
    const isLast = i === lines.length - 1
    const text   = (truncated && isLast) ? `${line.trimEnd()}…` : line
    ctx.fillText(text, contentX, contentTopY + i * lineHeight)
  })

  // ── Bottom bar ───────────────────────────────────────────────────────────
  const barY = H - 56

  // Thin top border for bottom bar
  ctx.strokeStyle = '#1f2937'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, barY)
  ctx.lineTo(W, barY)
  ctx.stroke()

  // "socialmate.studio" — left
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = '#f59e0b'
  ctx.textBaseline = 'middle'
  ctx.fillText('socialmate.studio', 52, barY + 28)

  // Platform badge — right
  if (platform) {
    const icon  = PLATFORM_ICONS[platform] ?? '📱'
    const name  = PLATFORM_NAMES[platform] ?? platform
    const badge = `${icon}  ${name}`

    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
    ctx.fillStyle = '#9ca3af'
    const bw   = ctx.measureText(badge).width
    ctx.fillText(badge, W - 52 - bw, barY + 28)
  }

  // Optional handle — centre
  if (handle) {
    ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
    ctx.fillStyle = '#6b7280'
    ctx.textAlign = 'center'
    ctx.fillText(handle, W / 2, barY + 28)
    ctx.textAlign = 'left'
  }
}

export default function PostImageExporter({
  content,
  platform,
  handle,
  buttonLabel = '📸 Save as image',
  buttonClassName = '',
}: Props) {
  const [exporting, setExporting] = useState(false)

  const handleExport = useCallback(() => {
    if (!content.trim()) return
    setExporting(true)

    // Use rAF to allow React to flush the state update before blocking work
    requestAnimationFrame(() => {
      try {
        const canvas = document.createElement('canvas')
        drawCard(canvas, content, platform, handle)

        canvas.toBlob(blob => {
          if (!blob) { setExporting(false); return }
          const url  = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href     = url
          link.download = 'post-card.png'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          // Small delay before revoking so Safari can pick up the blob
          setTimeout(() => URL.revokeObjectURL(url), 2000)
          setExporting(false)
        }, 'image/png')
      } catch {
        setExporting(false)
      }
    })
  }, [content, platform, handle])

  const defaultClass =
    'px-5 py-3 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 rounded-xl hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500 dark:hover:text-amber-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5'

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting || !content.trim()}
      className={buttonClassName || defaultClass}
      title="Export this post as a branded PNG card"
      aria-label="Save post as image">
      {exporting ? (
        <>
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          Generating…
        </>
      ) : (
        buttonLabel
      )}
    </button>
  )
}
