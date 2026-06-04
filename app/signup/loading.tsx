export default function SignupLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col flex-1 bg-gray-950 p-12">
        <div className="flex items-center gap-3 mb-auto">
          <div className="w-10 h-10 rounded-xl bg-gray-800 animate-pulse" />
          <div className="h-5 w-28 rounded bg-gray-800 animate-pulse" />
        </div>
        <div className="space-y-4 mb-auto">
          <div className="h-8 w-3/4 rounded-lg bg-gray-800 animate-pulse" />
          <div className="h-4 w-full rounded bg-gray-800 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-gray-800 animate-pulse" />
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md space-y-5">
          <div className="h-8 w-40 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse mb-6" />
          <div className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="h-12 rounded-xl bg-amber-100 dark:bg-amber-900/20 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
