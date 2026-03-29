import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Partner Portal — SocialMate',
    template: '%s | SocialMate Partners',
  },
  description: 'SocialMate Affiliate Partner Portal. Earn 30–40% recurring commissions.',
  robots: { index: false, follow: false },
}

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={inter.className}
      style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f1f1f1' }}
    >
      {children}
    </div>
  )
}
