import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Gilgamesh's Guide — Free Business & Creator Guide",
  description: "Gilgamesh's Guide is a free guide for entrepreneurs, creators, and self-starters. Built by Joshua Bostic, founder of SocialMate. Join the waitlist to get notified on launch.",
  openGraph: {
    title: "Gilgamesh's Guide — Free Guide for Entrepreneurs & Creators",
    description: 'A free guide for builders, creators, and entrepreneurs from the founder of SocialMate. Join the waitlist.',
    url: 'https://socialmate.studio/gilgamesh',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: "Gilgamesh's Guide" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Gilgamesh's Guide — Free Guide for Entrepreneurs & Creators",
    description: 'A free guide for builders and creators from the founder of SocialMate. Join the waitlist.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/gilgamesh' },
}

export default function GilgameshLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
