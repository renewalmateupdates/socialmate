export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isFeatureEnabled, featurePausedMessage } from '@/lib/feature-flag-check'
import { MEDIA_ALLOWED_TYPES, MEDIA_MAX_BYTES } from '@/lib/media-upload'

// A signed upload URL for one image or video, so the browser puts the file
// straight into storage (lib/media-upload.ts says why). The same checks as
// /api/media/upload: the media_upload kill switch, a signed-in user, the
// allowed types and the 50 MB cap, and the same path layout.
export async function POST(request: NextRequest) {
  if (!(await isFeatureEnabled('media_upload'))) {
    return NextResponse.json({ error: featurePausedMessage('Media upload') }, { status: 503 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null) as { name?: unknown; type?: unknown; size?: unknown } | null
  const name = typeof body?.name === 'string' ? body.name : ''
  const type = typeof body?.type === 'string' ? body.type : ''
  const size = Number(body?.size)

  if (!MEDIA_ALLOWED_TYPES.includes(type)) {
    return NextResponse.json({ error: `Unsupported file type (${type || 'unknown'}). Use JPEG, PNG, GIF, WebP, MP4, or MOV.` }, { status: 400 })
  }
  if (!Number.isFinite(size) || size <= 0) {
    return NextResponse.json({ error: 'That file looks empty.' }, { status: 400 })
  }
  if (size > MEDIA_MAX_BYTES) {
    return NextResponse.json({ error: `File too large (${Math.round(size / 1024 / 1024)}MB). Max is 50MB.` }, { status: 400 })
  }

  const ext    = (name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'bin'
  const random = Math.random().toString(36).slice(2, 10)
  const path   = `${user.id}/${Date.now()}-${random}.${ext}`

  const admin = getSupabaseAdmin()
  const { data, error } = await admin.storage.from('media').createSignedUploadUrl(path)
  if (error || !data) {
    console.error('[media/upload-url] signed URL failed:', error?.message)
    return NextResponse.json({ error: 'Upload failed. Try again.' }, { status: 500 })
  }
  const { data: urlData } = admin.storage.from('media').getPublicUrl(path)

  return NextResponse.json({
    signedUrl: data.signedUrl,
    path,
    publicUrl: urlData.publicUrl,
    type:      type.startsWith('video/') ? 'video' : 'image',
  })
}
