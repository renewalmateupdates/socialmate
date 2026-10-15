'use client'
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

/** Copies `text`, then says so for a moment. A real button, 44px tall for thumbs. */
export default function CopyButton({ text, label = 'Copy', className = '' }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard blocked (some in-app browsers). Selecting the text is the fallback.
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={`tap inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-edge px-3 text-small text-ink-body transition-colors hover:border-edge-lit hover:bg-raised ${className}`}
      aria-live="polite"
    >
      {copied
        ? <><Check className="h-3.5 w-3.5 text-jade" strokeWidth={2.5} /> Copied</>
        : <><Copy className="h-3.5 w-3.5" strokeWidth={2} /> {label}</>}
    </button>
  )
}
