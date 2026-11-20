import type { Metadata } from 'next'
import Landing, { generateLocaleMetadata } from '@/components/pages/Landing'

// Cached at the CDN and rebuilt at most once an hour, which only holds while
// the page reads nothing from the request. Until Nov 20, 2026 it awaited
// searchParams for ?ref=, which made every visit a fresh server render (since
// March): on Nov 19, the day Vercel paused the Hobby team for CPU, it was the
// third-busiest route, 227 renders and 16 s of Active CPU in Observability. The
// proxy still sets the sm_ref cookie from ?ref= before the cache answers, and
// ReferralBanner reads the code in the browser.
// scripts/test-cpu-budget.mjs fails if this page reads the request again.
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return generateLocaleMetadata('en')
}

export default function Home() {
  return <Landing locale="en" />
}
