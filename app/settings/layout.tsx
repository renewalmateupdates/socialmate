// Rendered per request (Nov 20, 2026), so /settings arrives as the real page,
// with the tab from ?tab= already open. As a static page it could not know the
// URL, so its useSearchParams() made Next send a spinner and render everything
// in the browser (it scored 42 on phones, the lowest app page). The page shows
// itself before the user's settings load and fills them in as they arrive.
export const dynamic = 'force-dynamic'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
