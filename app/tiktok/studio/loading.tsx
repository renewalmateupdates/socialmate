// TikTok Studio was the one app route the loading.tsx sweeps (PRs #459, #466)
// missed, and it is the route that needed it most: unlike the other app pages
// it is a SERVER component that awaits supabase.auth.getUser() — a network
// round trip to Supabase Auth — before it returns any JSX. Without a loading
// boundary the browser gets nothing at all until that resolves.
//
// Vercel Speed Insights, mobile, last 7 days: FCP 3.58s, LCP 5.09s, RES 66.
// With this file Next streams the shell immediately and the auth check happens
// behind it.
export default function Loading() {
  return (
    <div className="min-h-dvh bg-gray-950 flex">
      {/* Sidebar rail placeholder — matches the md:ml-56 offset the real page
          uses, so nothing shifts when the page swaps in. CLS is currently 0.03
          on mobile and 0 on desktop; a skeleton that changes the layout would
          be a net loss. */}
      <div className="hidden md:block w-56 flex-shrink-0 border-r border-gray-800" />

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-8 w-56 rounded-lg bg-gray-800" />
          <div className="mt-3 h-4 w-80 rounded bg-gray-800/70" />

          <div className="mt-8 grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <div className="h-72 rounded-2xl bg-gray-800/60" />
            <div className="space-y-3">
              <div className="h-11 rounded-xl bg-gray-800/60" />
              <div className="h-11 rounded-xl bg-gray-800/60" />
              <div className="h-11 rounded-xl bg-gray-800/60" />
              <div className="h-11 rounded-xl bg-gray-800/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
