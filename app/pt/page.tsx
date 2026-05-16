import type { Metadata } from 'next'
import LocalizedLanding, { generateLocaleMetadata } from '@/components/pages/LocalizedLanding'

export async function generateMetadata(): Promise<Metadata> {
  return generateLocaleMetadata('pt')
}

export default function PtPage() {
  return <LocalizedLanding locale="pt" />
}
