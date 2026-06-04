export default function SettingsLoading() {
  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      {/* Sidebar skeleton */}
      <div className="w-14 md:w-56 shrink-0 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col gap-3 p-3">
        <div className="h-9 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse mb-2" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-8 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" style={{ opacity: 1 - i * 0.08 }} />
        ))}
      </div>

      {/* Settings content */}
      <div className="flex-1 overflow-auto p-6 max-w-3xl">
        <div className="h-8 w-32 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse mb-6" />

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>

        {/* Settings fields */}
        <div className="space-y-5">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-28 rounded bg-gray-100 dark:bg-gray-800 animate-pulse mb-2" />
              <div className="h-11 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </div>
          ))}
          <div className="h-11 w-32 rounded-xl bg-amber-100 dark:bg-amber-900/20 animate-pulse mt-4" />
        </div>
      </div>
    </div>
  )
}
