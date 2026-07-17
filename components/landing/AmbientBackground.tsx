// Site-wide living background — a slow-drifting aurora of brand-colored glows
// plus a faint masked grid. Pure CSS (see globals.css .ambient-*), so it costs
// zero JS, renders on the server, and freezes to a static gradient under
// prefers-reduced-motion. Fixed behind all content; sections above use
// translucent backgrounds so this reads through the whole page.
export default function AmbientBackground() {
  return (
    <div className="ambient-bg fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="ambient-blob ambient-blob-1" />
      <div className="ambient-blob ambient-blob-2" />
      <div className="ambient-blob ambient-blob-3" />
      <div className="ambient-blob ambient-blob-4" />
      <div className="ambient-grid" />
    </div>
  )
}
