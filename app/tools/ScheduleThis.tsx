'use client'
import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { saveToolDraft, START_FROM_TOOL, type ToolId } from '@/lib/tool-draft'
import { track } from '@/lib/analytics'

/**
 * "Schedule this post": keeps what the visitor wrote in this browser and
 * takes them into SocialMate, where onboarding (new accounts) or Compose
 * (signed in) opens with it. A plain link would lose the text.
 */
export default function ScheduleThis({ text, tool, label = 'Schedule this post', className = '' }: {
  text: string
  tool: ToolId
  label?: string
  className?: string
}) {
  const [going, setGoing] = useState(false)
  const disabled = !text.trim() || going

  const go = () => {
    if (disabled) return
    setGoing(true)
    const saved = saveToolDraft(text, tool)
    track('tool_draft_saved', { tool, saved })
    window.location.assign(START_FROM_TOOL)
  }

  return (
    <button
      type="button"
      onClick={go}
      disabled={disabled}
      className={`tap inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-amber px-4 text-small font-medium text-void transition-opacity hover:opacity-90 disabled:opacity-40 ${className}`}
    >
      <CalendarClock className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      {going ? 'Opening…' : label}
    </button>
  )
}
