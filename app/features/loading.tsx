export default function FeaturesLoading() {
  return (
    <div className="min-h-screen bg-gray-950 animate-pulse">
      {/* Nav skeleton */}
      <div className="h-16 border-b border-gray-800 flex items-center px-6 gap-6">
        <div className="h-7 w-32 rounded-lg bg-gray-800" />
        <div className="flex gap-4 ml-8">
          {[...Array(5)].map((_, i) => <div key={i} className="h-4 w-16 rounded bg-gray-800" />)}
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center flex flex-col items-center gap-4">
        <div className="h-5 w-24 rounded-full bg-amber-500/20" />
        <div className="h-12 w-96 rounded-xl bg-gray-800" />
        <div className="h-5 w-80 rounded-lg bg-gray-800" />
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-9 w-24 rounded-full bg-gray-800" />)}
        </div>
      </div>

      {/* Feature grid skeleton */}
      <div className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-800 p-6 flex flex-col gap-3">
            <div className="h-8 w-8 rounded-xl bg-gray-800" />
            <div className="h-5 w-36 rounded-lg bg-gray-800" />
            <div className="h-3 w-full rounded bg-gray-800" />
            <div className="h-3 w-4/5 rounded bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  )
}
