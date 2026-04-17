import { Suspense } from 'react'
import DashboardClient from './DashboardClient'

export default function EnkiDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Guardian initializing…</p>
          </div>
        </div>
      }
    >
      <DashboardClient />
    </Suspense>
  )
}
