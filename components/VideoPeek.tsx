'use client'
import { useState } from 'react'
import { Play } from 'lucide-react'

/**
 * A post's video, loaded only when the viewer asks for it.
 *
 * Queue and Calendar list many posts at once. Drawing each video (even with
 * preload="metadata") pulls part of every file from storage on every visit,
 * and storage egress is a running cost. A button costs nothing until pressed.
 */
export default function VideoPeek({ src, label = 'Play video' }: { src: string; label?: string }) {
  const [open, setOpen] = useState(false)
  if (!src) return null
  if (open) {
    return (
      <video
        src={src}
        controls
        autoPlay
        playsInline
        className="mt-2 w-40 max-h-72 rounded-lg bg-black"
        aria-label="Post video"
      />
    )
  }
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); setOpen(true) }}
      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 border border-theme rounded-lg px-2.5 py-1.5 min-h-[32px] hover:border-gray-400 transition-all">
      <Play className="w-3.5 h-3.5" strokeWidth={2} /> {label}
    </button>
  )
}
