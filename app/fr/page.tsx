import type { Metadata } from 'next'
import LocalizedLanding, { generateLocaleMetadata } from '@/components/pages/LocalizedLanding'

export function generateMetadata(): Metadata {
  return generateLocaleMetadata('fr')
}

export default function FrPage() {
  return <LocalizedLanding locale="fr" />
}
