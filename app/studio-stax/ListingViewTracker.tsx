'use client'
import { useEffect } from 'react'

// Invisible component that fires a single POST on page load to batch-increment
// view counters for all listing IDs visible on the Studio Stax directory page.
export default function ListingViewTracker({ listingIds }: { listingIds: string[] }) {
  useEffect(() => {
    if (!listingIds.length) return
    fetch('/api/studio-stax/view', {
      method:    'POST',
      headers:   { 'Content-Type': 'application/json' },
      body:      JSON.stringify({ listing_ids: listingIds }),
      keepalive: true,
    }).catch(() => {}) // fire-and-forget, never block the user
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
