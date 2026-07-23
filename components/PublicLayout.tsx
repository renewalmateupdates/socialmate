import PublicNav from './PublicNav'
import PHLaunchBanner from './PHLaunchBanner'
import EmberField from './landing/EmberField'
import PublicFooter from './PublicFooter'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    // Warm void base + the shared Gilgamesh ember field, matching the landing
    // page. EmberField is fixed at z-0 behind everything; content is lifted to
    // z-10 so the embers read as atmosphere across every public page.
    <div className="dark relative min-h-screen bg-void">
      <EmberField />
      <div className="relative z-10">
        <PHLaunchBanner />
        <PublicNav />
        <main>{children}</main>
        <PublicFooter />
      </div>
    </div>
  )
}