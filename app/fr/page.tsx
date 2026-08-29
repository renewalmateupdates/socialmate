import type { Metadata } from 'next'
import Landing, { generateLocaleMetadata } from '@/components/pages/Landing'

// Same page as /, same design, translated. There is exactly one landing
// component — a second copy is how these eight routes spent six weeks serving
// the design the July rebuild replaced.
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return generateLocaleMetadata('fr')
}

export default function FRPage() {
  return <Landing locale="fr" />
}
