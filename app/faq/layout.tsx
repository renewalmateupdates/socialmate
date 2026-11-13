import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: 'https://socialmate.studio/faq' },
  title: 'FAQ — SocialMate',
  description: 'Answers to common questions about SocialMate, SOMA, Studio Stax, pricing, and how everything works.',
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
