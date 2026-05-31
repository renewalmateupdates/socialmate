export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      {/* Sidebar skeleton */}
      <div className="w-14 md:w-56 shrink-0 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col gap-3 p-3">
        <div className="h-9 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse mb-2" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-8 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" style={{ opacity: 1 - i * 0.08 }} />
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-7 w-48 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="h-9 w-32 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-3 animate-pulse">
              <div className="h-4 w-20 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-8 w-12 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          ))}
        </div>

        {/* Posts area */}
        <div className="flex flex-col gap-3">
          <div className="h-5 w-32 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex gap-3 animate-pulse">
              <div className="h-10 w-10 rounded-lg shrink-0 bg-gray-100 dark:bg-gray-800" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
