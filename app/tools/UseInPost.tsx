'use client'
import { useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { saveToolImage, START_FROM_TOOL_IMAGE, type ImageToolId } from '@/lib/tool-image'
import { track } from '@/lib/analytics'

/**
 * "Use in a post": keeps the image in this browser and takes the visitor into
 * Compose (signing up first if needed), where it is attached. Nothing is
 * uploaded from here; Compose uploads it once the person is signed in.
 */
export default function UseInPost({ makeImage, tool, label = 'Use in a post', className = '', disabled = false }: {
  makeImage: () => Promise<{ blob: Blob; name: string } | null>
  tool: ImageToolId
  label?: string
  className?: string
  disabled?: boolean
}) {
  const [going, setGoing] = useState(false)
  const [error, setError] = useState('')

  const go = async () => {
    if (going || disabled) return
    setGoing(true)
    setError('')
    const made = await makeImage()
    const saved = made ? await saveToolImage(made.blob, tool, made.name) : false
    track('tool_draft_saved', { tool, saved, kind: 'image' })
    if (!saved) {
      setGoing(false)
      setError('This browser would not keep the image. Download it instead, then attach it in Compose.')
      return
    }
    window.location.assign(START_FROM_TOOL_IMAGE)
  }

  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        onClick={go}
        disabled={going || disabled}
        className={`tap inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-edge px-3 text-small text-ink-body transition-colors hover:border-edge-lit hover:bg-raised disabled:opacity-40 ${className}`}
      >
        <ImagePlus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        {going ? 'Opening…' : label}
      </button>
      {error && <span role="alert" className="mt-2 max-w-xs text-small text-alert">{error}</span>}
    </span>
  )
}
