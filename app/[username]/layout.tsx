import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const APP_URL = 'https://socialmate.studio'

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase
    .from('link_in_bio')
    .select('display_name, bio, slug')
    .eq('slug', username)
    .single()

  if (!data) return {}

  const name = data.display_name || username
  const title = `${name} — Link in Bio`
  const description = data.bio
    ? `${data.bio} — Built with SocialMate`
    : `${name}'s links, powered by SocialMate`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${APP_URL}/${username}`,
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

export default function UsernameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
