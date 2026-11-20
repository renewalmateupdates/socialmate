'use client'
// Vercel Web Analytics and Speed Insights, minus our own visits
// (lib/internal-device.ts). A client component because the root layout is a
// server component and beforeSend is a function.
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { isInternalDevice } from '@/lib/internal-device'

export default function VercelInsights() {
  return (
    <>
      <Analytics beforeSend={event => (isInternalDevice() ? null : event)} />
      <SpeedInsights beforeSend={event => (isInternalDevice() ? null : event)} />
    </>
  )
}
