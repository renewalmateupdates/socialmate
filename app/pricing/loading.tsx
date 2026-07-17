export default function PricingLoading() {
  return (
    <div className="min-h-dvh bg-gray-950">
      {/* Nav bar */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gray-800 animate-pulse" />
          <div className="h-5 w-28 rounded bg-gray-800 animate-pulse" />
        </div>
        <div className="hidden md:flex gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 w-16 rounded bg-gray-800 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-14 pb-10 text-center">
        <div className="h-9 w-72 max-w-full mx-auto rounded-lg bg-gray-800 animate-pulse mb-4" />
        <div className="h-4 w-96 max-w-full mx-auto rounded bg-gray-800/70 animate-pulse" />
      </div>

      {/* Plan cards */}
      <div className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-3xl border border-gray-800 p-8 animate-pulse">
            <div className="h-5 w-20 rounded bg-gray-800 mb-4" />
            <div className="h-9 w-28 rounded-lg bg-gray-800 mb-6" />
            <div className="space-y-3 mb-8">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-3 w-full rounded bg-gray-800/70" />
              ))}
            </div>
            <div className="h-11 rounded-xl bg-amber-500/20" />
          </div>
        ))}
      </div>
    </div>
  )
}
