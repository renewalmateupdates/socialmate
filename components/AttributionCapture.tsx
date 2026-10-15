'use client'
import { useEffect } from 'react'
import { captureFirstTouch } from '@/lib/attribution-client'

/**
 * Records where a visitor came from on the first page they land on, not only
 * on /signup, which most people reach by clicking through from somewhere else.
 * See lib/attribution.ts. Renders nothing.
 */
export default function AttributionCapture() {
  useEffect(() => { captureFirstTouch() }, [])
  return null
}
