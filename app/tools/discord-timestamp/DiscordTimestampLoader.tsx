'use client'
import dynamic from 'next/dynamic'

// Client-only: the default time and every preview depend on the viewer's clock
// and time zone, which the server cannot know, so rendering it there would only
// produce a mismatch to correct. The placeholder holds the space to avoid a jump.
const DiscordTimestamp = dynamic(() => import('./DiscordTimestamp'), {
  ssr: false,
  loading: () => <div className="min-h-[560px] rounded-2xl border border-edge bg-panel" aria-hidden="true" />,
})

export default function DiscordTimestampLoader() {
  return <DiscordTimestamp />
}
