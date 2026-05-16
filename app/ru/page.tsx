import type { Metadata } from 'next'
import LocalizedLanding, { generateLocaleMetadata } from '@/components/pages/LocalizedLanding'

export async function generateMetadata(): Promise<Metadata> {
  return generateLocaleMetadata('ru')
}

export default function RuPage() {
  return <LocalizedLanding locale="ru" />
}
