import type { Metadata } from 'next'
import HeroLoop from '@/components/landing/HeroLoop'

// Isolation stage for scripts/record-hero.mjs. The recorder loads this at
// 1200x750 and steps the loop frame by frame, so the panel needs to sit alone on
// the void with no nav, no cookie banner, and nothing else animating.
//
// Not linked from anywhere and explicitly noindex — it exists for the asset
// factory, not for visitors.
export const metadata: Metadata = {
  title: 'Hero capture stage',
  robots: { index: false, follow: false },
}

export default function HeroCaptureStage() {
  return (
    <div className="dark flex min-h-screen items-center justify-center bg-void px-10 font-body">
      <div className="w-full max-w-xl">
        <HeroLoop />
      </div>
    </div>
  )
}
