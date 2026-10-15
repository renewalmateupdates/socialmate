import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TikTok Studio: Edit and Schedule TikTok Videos',
  description: 'Trim, filter, caption and schedule TikTok videos in the same place you plan every other platform. Free on every plan, with no per-post charges.',
  openGraph: {
    title:       'TikTok Studio: Edit and Schedule TikTok Videos',
    description: 'Trim, filter, caption and schedule TikTok videos in the same place you plan every other platform. Free on every plan, with no per-post charges.',
    url:         'https://socialmate.studio/tiktok',
  },
  alternates: { canonical: 'https://socialmate.studio/tiktok' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
