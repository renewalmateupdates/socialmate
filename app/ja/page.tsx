import type { Metadata } from 'next'
import LocalizedLanding, { generateLocaleMetadata } from '@/components/pages/LocalizedLanding'

export async function generateMetadata(): Promise<Metadata> {
  return generateLocaleMetadata('ja')
}

export default function JaPage() {
  return <LocalizedLanding locale="ja" />
}
