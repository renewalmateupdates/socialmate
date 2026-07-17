// Shared Suspense fallback for pages whose inner component uses
// useSearchParams(). That hook opts a page out of static prerendering, and a
// bare <Suspense> (no fallback) makes the server ship BLANK HTML — nothing
// paints until the JS bundle hydrates, which reads as a dead white screen on
// slow mobile connections. This static fallback prerenders into the HTML so
// something paints immediately. (Root cause of mobile /login FCP 20.4s.)
export default function SuspenseFallback() {
  return (
    <div className="min-h-dvh bg-white dark:bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="SocialMate" className="w-12 h-12 rounded-2xl animate-pulse" />
        <div className="w-6 h-6 border-2 border-gray-200 dark:border-gray-800 border-t-amber-500 rounded-full animate-spin" />
      </div>
    </div>
  )
}
