import type { Metadata } from 'next'
import LocalizedLanding, { generateLocaleMetadata } from '@/components/pages/LocalizedLanding'

export async function generateMetadata(): Promise<Metadata> {
  return generateLocaleMetadata('es')
}

export default function EsPage() {
  return <LocalizedLanding locale="es" />
}
