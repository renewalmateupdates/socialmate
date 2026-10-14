import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create your account',
  description: 'Create a free SocialMate account. No card required, and the free plan never expires.',
  alternates: { canonical: 'https://socialmate.studio/signup' },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
