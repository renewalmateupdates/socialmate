import { Suspense } from 'react'
import TruthClient from './TruthClient'

export const metadata = { title: 'Enki Truth Mode — Validation Dashboard' }

export default function TruthModePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-500 text-sm">
        Loading Truth Mode data…
      </div>
    }>
      <TruthClient />
    </Suspense>
  )
}
