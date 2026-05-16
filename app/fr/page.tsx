import type { Metadata } from 'next'
import LocalizedLanding, { generateLocaleMetadata } from '@/components/pages/LocalizedLanding'

export async function generateMetadata(): Promise<Metadata> {
  return generateLocaleMetadata('fr')
}

export default function FrPage() {
  return <LocalizedLanding locale="fr" />
}
