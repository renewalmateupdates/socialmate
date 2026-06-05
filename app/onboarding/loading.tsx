// No <img> tags — image requests delay FCP.
// Text + CSS-only elements paint immediately and trigger FCP.
export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-lg px-6 flex flex-col items-center gap-8 animate-pulse">
        {/* Brand text — no image request needed */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center">
            <span className="text-amber-500 font-bold text-lg">S</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">SocialMate</span>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-1.5 w-10 rounded-full ${i === 0 ? 'bg-amber-500' : 'bg-gray-700'}`} />
          ))}
        </div>

        {/* Form skeleton */}
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
