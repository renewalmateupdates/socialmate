import type { Metadata } from 'next'
import Landing, { generateLocaleMetadata } from '@/components/pages/Landing'

// Cache landing page at CDN for 1 hour — content rarely changes between deploys.
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return generateLocaleMetadata('en')
}

export default async function Home({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const params = await searchParams
  return <Landing locale="en" refCode={params?.ref || ''} />
}
