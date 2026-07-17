export default function AnalyticsLoading() {
  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      {/* Sidebar skeleton */}
      <div className="w-14 md:w-56 shrink-0 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col gap-3 p-3">
        <div className="h-9 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse mb-2" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-8 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" style={{ opacity: 1 - i * 0.08 }} />
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="h-8 w-52 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse mb-2" />
        <div className="h-4 w-80 rounded bg-gray-100 dark:bg-gray-800 animate-pulse mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse mb-6" />
        <div className="h-40 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse" />
      </div>
    </div>
  )
}
