import type { Metadata } from 'next'
import LocalizedLanding, { generateLocaleMetadata } from '@/components/pages/LocalizedLanding'

export function generateMetadata(): Metadata {
  return generateLocaleMetadata('zh')
}

export default function ZhPage() {
  return <LocalizedLanding locale="zh" />
}
