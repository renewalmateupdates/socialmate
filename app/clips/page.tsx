import { Suspense } from 'react'
import ClipsPageClient from './ClipsPageClient'

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm" style={{ color: 'var(--text-faint)' }}>Loading…</div>
      </div>
    }>
      <ClipsPageClient />
    </Suspense>
  )
}
