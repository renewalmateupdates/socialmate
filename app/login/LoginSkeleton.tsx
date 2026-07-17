import Link from 'next/link'

// Static login skeleton — served as both the route's loading state AND the
// Suspense fallback around LoginInner. LoginInner uses useSearchParams(), which
// bails the page out of prerendering; with an EMPTY Suspense fallback the
// server was shipping blank HTML for /login, so nothing painted until the full
// JS bundle downloaded and hydrated. On mobile networks that was a 20s blank
// screen (Speed Insights: mobile /login FCP 20.4s, RES 33). This skeleton is
// pure static JSX, so it prerenders into the HTML and paints immediately.
export default function LoginSkeleton() {
  return (
    <div className="dark min-h-dvh bg-gray-950 flex flex-col">
      <div className="border-b border-gray-800 bg-gray-900 px-8 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="SocialMate" className="w-7 h-7 rounded-lg" />
          <span className="font-bold text-base tracking-tight text-white">SocialMate</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-10">
            <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-white">Welcome back</h1>
            <p className="text-gray-400 text-sm mb-8">Sign in to your SocialMate account</p>

            {/* Google button placeholder */}
            <div className="h-12 rounded-xl bg-gray-800 animate-pulse mb-6" />

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-xs text-gray-600">or</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            {/* Email + password field placeholders */}
            <div className="h-4 w-16 rounded bg-gray-800 animate-pulse mb-2" />
            <div className="h-12 rounded-xl bg-gray-800 animate-pulse mb-4" />
            <div className="h-4 w-20 rounded bg-gray-800 animate-pulse mb-2" />
            <div className="h-12 rounded-xl bg-gray-800 animate-pulse mb-6" />

            {/* Sign-in button placeholder */}
            <div className="h-12 rounded-xl bg-amber-500/30 animate-pulse" />
          </div>

          <div className="h-4 w-48 mx-auto rounded bg-gray-800/60 animate-pulse mt-6" />
        </div>
      </div>
    </div>
  )
}
