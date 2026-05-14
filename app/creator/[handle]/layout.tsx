import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const APP_URL = 'https://socialmate.studio'

export async function generateMetadata(
  { params }: { params: Promise<{ handle: string }> }
): Promise<Metadata> {
  const { handle } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase
    .from('creator_monetization')
    .select('page_title, page_bio')
    .eq('page_handle', handle)
    .single()

  if (!data) return {}

  const title = data.page_title || `${handle}'s Creator Page`
  const description = data.page_bio
    ? `${data.page_bio} — Powered by SocialMate`
    : `Support ${title} — tips, fan subscriptions, and more on SocialMate`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${APP_URL}/creator/${handle}`,
      images: [{ url: '/og-image.png', width: 1270, height: 760, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  }
}

export default function CreatorHandleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
