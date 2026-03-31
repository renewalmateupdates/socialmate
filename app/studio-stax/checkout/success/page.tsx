'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PublicLayout from '@/components/PublicLayout'
import Link from 'next/link'

function SuccessInner() {
  const params      = useSearchParams()
  const billing     = params.get('billing') as 'annual' | 'quarterly' | null

  return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center">
      <div className="text-6xl mb-6">🎉</div>

      <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-full px-4 py-1.5 text-xs font-bold text-green-700 dark:text-green-400 mb-6">
        Payment confirmed
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-3">
        You're live in Studio Stax
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
        Your listing is now active in the directory. Check your inbox — we sent you a confirmation with everything you need to know.
      </p>

      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-8 text-left space-y-3">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">What's next</p>
        <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
          <span className="text-green-500 font-bold mt-0.5">1.</span>
          <span>Donate to SM-Give to climb the rankings — the more you contribute, the higher you appear.</span>
        </div>
        <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
          <span className="text-green-500 font-bold mt-0.5">2.</span>
          <span>You'll receive renewal reminders at 30, 14, and 7 days before your listing expires.</span>
        </div>
        {billing === 'annual' && (
          <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="text-green-500 font-bold mt-0.5">3.</span>
            <span>We'll write your blog feature when your year is up and notify you when it's live.</span>
          </div>
        )}
        <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
          <span className="text-amber-500 font-bold mt-0.5">→</span>
          <span>Early renewal locks in at $80/year — save $19 vs the standard rate.</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/studio-stax"
          className="bg-black dark:bg-white text-white dark:text-black font-bold px-6 py-3 rounded-2xl text-sm hover:opacity-80 transition-all">
          View Studio Stax →
        </Link>
        <Link href="/give"
          className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold px-6 py-3 rounded-2xl text-sm hover:border-gray-400 dark:hover:border-gray-500 transition-all">
          Donate to SM-Give
        </Link>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-8">
        Questions? <a href="mailto:hello@socialmate.studio" className="underline">hello@socialmate.studio</a>
      </p>
    </div>
  )
}

export default function StudioStaxCheckoutSuccess() {
  return (
    <PublicLayout>
      <Suspense fallback={
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      }>
        <SuccessInner />
      </Suspense>
    </PublicLayout>
  )
}
