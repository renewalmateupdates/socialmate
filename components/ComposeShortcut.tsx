'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Press 'C' anywhere in the authenticated dashboard to open /compose.
 * Ignored when focus is on an input, textarea, or contenteditable element.
 */
export default function ComposeShortcut() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'c' && e.key !== 'C') return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const target = e.target as HTMLElement
      const tag = target.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || target.isContentEditable) return

      router.push('/compose')
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router])

  return null
}
