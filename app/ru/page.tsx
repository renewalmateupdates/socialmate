import type { Metadata } from 'next'
import LocalizedLanding, { generateLocaleMetadata } from '@/components/pages/LocalizedLanding'

export function generateMetadata(): Metadata {
  return generateLocaleMetadata('ru')
}

export default function RuPage() {
  return <LocalizedLanding locale="ru" />
}
