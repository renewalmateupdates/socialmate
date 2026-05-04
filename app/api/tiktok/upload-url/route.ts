export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const path = `tiktok/${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.webm`

  const admin = getSupabaseAdmin()
  const { data: signedData, error } = await admin.storage
    .from('media')
    .createSignedUploadUrl(path)

  if (error || !signedData) {
    console.error('[tiktok/upload-url]', error)
    return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
  }

  // Return proxy URL through socialmate.studio (verified in TikTok portal)
  // instead of direct Supabase URL — TikTok PULL_FROM_URL requires verified domain
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL!
  const proxyUrl  = `${appUrl}/api/tiktok/video/${path}`

  return NextResponse.json({
    signedUrl:  signedData.signedUrl,
    path,
    publicUrl:  proxyUrl,
  })
}
