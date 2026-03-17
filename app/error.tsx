'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-8">S</div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Something went wrong</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-4">Unexpected error</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          Something went wrong on our end. This has been logged and we'll look into it.
          Try again — it usually clears up on its own.
        </p>
        {error?.digest && (
          <p className="text-xs text-gray-300 font-mono mb-6">Error ID: {error.digest}</p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="w-full sm:w-auto bg-black text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
            Try again →
          </button>
          <Link href="/dashboard"
            className="w-full sm:w-auto text-sm font-semibold text-gray-500 hover:text-black transition-all text-center">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}