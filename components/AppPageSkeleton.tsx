import type { ReactNode } from 'react'

/**
 * What an app page shows before its JavaScript and data arrive (Nov 20, 2026).
 *
 * Until then /dashboard, /settings, /compose, /queue and /drafts sent a bare
 * spinner as their HTML, and their own loading states were spinners too. A
 * spinner has no text, so a phone recorded no "first contentful paint" until
 * all of the page's JavaScript had run (Speed Insights, 7 days to Nov 20:
 * these pages scored 42 to 66 on phones, the marketing pages 95 to 99). The
 * page's real title is text, so it counts the moment the HTML is painted.
 *
 * No hooks and nothing read from the browser, so the server's HTML and the
 * browser's first render are always the same.
 */

/** The title and placeholder blocks, for a page's own loading state inside its real layout. */
export function AppSkeletonBody({ title, wide = false }: { title: string; wide?: boolean }) {
  return (
    <div className={`${wide ? 'max-w-6xl' : 'max-w-5xl'} mx-auto`} aria-busy="true">
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      <div className="mt-8 space-y-4 animate-pulse" aria-hidden="true">
        <div className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800" />
          <div className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800" />
        </div>
        <div className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  )
}

/**
 * The whole page: the sidebar's place on desktop and its menu button on
 * phones (where components/Sidebar.tsx draws them, in its colors), and the
 * body above. For a page's Suspense fallback, which is what the server sends.
 */
export default function AppPageSkeleton({ title, wide = false, children }: {
  title: string
  wide?: boolean
  children?: ReactNode
}) {
  return (
    <div className="min-h-dvh bg-theme flex">
      <div
        aria-hidden="true"
        className="md:hidden fixed left-3 z-50 min-w-[44px] min-h-[44px] rounded-xl"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)', background: 'var(--surface)', border: '1px solid var(--border-mid)' }}
      />
      <div
        aria-hidden="true"
        className="hidden md:block fixed left-0 top-0 h-screen w-56 z-40"
        style={{ backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
      />
      <div className="md:ml-56 flex-1 min-w-0 p-4 md:p-8">
        {children ?? <AppSkeletonBody title={title} wide={wide} />}
      </div>
    </div>
  )
}
