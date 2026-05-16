import type { Metadata } from 'next'
import LocalizedLanding, { generateLocaleMetadata } from '@/components/pages/LocalizedLanding'

export function generateMetadata(): Metadata {
  return generateLocaleMetadata('es')
}

export default function EsPage() {
  return <LocalizedLanding locale="es" />
}
