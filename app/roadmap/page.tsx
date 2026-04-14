import type { Metadata } from 'next'
import PublicLayout from '@/components/PublicLayout'
import RoadmapClient from './RoadmapClient'

export const metadata: Metadata = {
  title: 'Roadmap — SocialMate',
  description: 'See what SocialMate is building next. Vote on features, suggest ideas, and follow our progress.',
  openGraph: {
    title:       'SocialMate Roadmap',
    description: 'See what we\'re building, what\'s coming soon, and what\'s already shipped.',
    url:         'https://socialmate.studio/roadmap',
  },
  alternates: { canonical: 'https://socialmate.studio/roadmap' },
}

export default function RoadmapPage() {
  return (
    <PublicLayout>
      <RoadmapClient />
    </PublicLayout>
  )
}
