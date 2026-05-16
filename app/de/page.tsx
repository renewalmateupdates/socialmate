import type { Metadata } from 'next'
import LocalizedLanding, { generateLocaleMetadata } from '@/components/pages/LocalizedLanding'

export function generateMetadata(): Metadata {
  return generateLocaleMetadata('de')
}

export default function DePage() {
  return <LocalizedLanding locale="de" />
}
