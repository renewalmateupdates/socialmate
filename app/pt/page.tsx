import type { Metadata } from 'next'
import LocalizedLanding, { generateLocaleMetadata } from '@/components/pages/LocalizedLanding'

export function generateMetadata(): Metadata {
  return generateLocaleMetadata('pt')
}

export default function PtPage() {
  return <LocalizedLanding locale="pt" />
}
