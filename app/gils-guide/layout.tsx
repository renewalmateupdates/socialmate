import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Gilgamesh's Guide — Free Guide for Entrepreneurs, Creators & Builders",
  description: "A free guide for creators, builders, and entrepreneurs who refuse to wait for permission. By Joshua Bostic, founder of SocialMate. Download free — no catch.",
  openGraph: {
    title: "Gilgamesh's Guide — Free Guide for Entrepreneurs & Creators",
    description: 'A free guide for builders, creators, and entrepreneurs. Written by Joshua Bostic, founder of SocialMate. Free forever.',
    url: 'https://socialmate.studio/gils-guide',
    images: [{ url: 'https://socialmate.studio/og-image.png', width: 1270, height: 760, alt: "Gilgamesh's Guide" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Gilgamesh's Guide — Free Guide for Creators & Builders",
    description: 'Free forever. No $997 course. Just real knowledge from someone still in the trenches.',
    images: ['https://socialmate.studio/og-image.png'],
  },
  alternates: { canonical: 'https://socialmate.studio/gils-guide' },
}

export default function GilsGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
