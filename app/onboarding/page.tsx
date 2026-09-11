import { cookies } from 'next/headers'
import { Suspense } from 'react'
import OnboardingInner from './OnboardingClient'

function OnboardingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-lg px-6 flex flex-col items-center gap-8 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center">
            <span className="text-amber-500 font-bold text-lg">S</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">SocialMate</span>
        </div>
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-1.5 w-10 rounded-full ${i === 0 ? 'bg-amber-500' : 'bg-gray-700'}`} />
          ))}
        </div>
        <div className="w-full space-y-4">
          <div className="h-6 w-48 rounded-lg bg-gray-800" />
          <div className="h-4 w-64 rounded bg-gray-800" />
          <div className="h-12 w-full rounded-xl bg-gray-800 mt-6" />
          <div className="h-12 w-full rounded-xl bg-gray-800" />
          <div className="h-12 w-full rounded-xl bg-amber-500/20 mt-2" />
        </div>
      </div>
    </div>
  )
}

// Server Component so the referral banner's presence is known before the
// client ever paints. It used to be read from document.cookie inside a
// useEffect on the client — correct for avoiding a hydration mismatch, but it
// meant the banner popped in after first paint on every referred visit,
// pushing everything below it down. That was a large share of this page's
// measured CLS (0.33, "Poor") and, since it sits above the largest painted
// element, likely inflated LCP too. Reading the cookie here means server and
// client agree on the very first render — no mismatch, no post-mount shift.
export default async function Onboarding() {
  const cookieStore = await cookies()
  const initialReferralCode = cookieStore.get('ref_code')?.value || null

  return (
    <Suspense fallback={<OnboardingSkeleton />}>
      <OnboardingInner initialReferralCode={initialReferralCode} />
    </Suspense>
  )
}
