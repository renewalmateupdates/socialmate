export default function BlogLoading() {
  return (
    <div className="dark min-h-screen bg-void">
      {/* Nav skeleton */}
      <div className="h-16 border-b border-edge bg-gray-950 flex items-center px-8 gap-4">
        <div className="w-8 h-8 rounded-xl bg-gray-800 animate-pulse" />
        <div className="h-5 w-28 rounded bg-gray-800 animate-pulse" />
        <div className="ml-auto flex gap-3">
          <div className="h-8 w-16 rounded-lg bg-gray-800 animate-pulse" />
          <div className="h-8 w-28 rounded-lg bg-gray-800 animate-pulse" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="h-10 w-48 rounded-lg bg-gray-800 animate-pulse mb-3" />
        <div className="h-4 w-96 rounded bg-gray-800 animate-pulse mb-10" />

        {/* Blog cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-edge overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-800" />
              <div className="p-5">
                <div className="h-3 w-20 rounded bg-gray-800 mb-3" />
                <div className="h-5 w-full rounded bg-gray-800 mb-2" />
                <div className="h-5 w-3/4 rounded bg-gray-800 mb-4" />
                <div className="h-3 w-32 rounded bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
