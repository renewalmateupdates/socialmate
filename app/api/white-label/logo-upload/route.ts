export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB for logos

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify white label is active
  const { data: settings } = await supabase
    .from('user_settings')
    .select('white_label_active')
    .eq('user_id', user.id)
    .single()

  if (!settings?.white_label_active) {
    return NextResponse.json({ error: 'Active White Label subscription required' }, { status: 403 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({
      error: `Unsupported type. Use JPEG, PNG, WebP, or SVG.`,
    }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({
      error: `File too large (${Math.round(file.size / 1024 / 1024)}MB). Max 5MB for logos.`,
    }, { status: 400 })
  }

  const ext    = file.name.split('.').pop()?.toLowerCase() || 'png'
  const path   = `white-label/${user.id}/logo.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer      = Buffer.from(arrayBuffer)

  const admin = getSupabaseAdmin()
  // Upsert — always replace the logo so old files don't accumulate
  const { data, error } = await admin.storage
    .from('media')
    .upload(path, buffer, {
      contentType: file.type,
      upsert:      true,
    })

  if (error) {
    console.error('[white-label/logo-upload] Storage error:', error)
    return NextResponse.json({ error: 'Upload failed', detail: error.message }, { status: 500 })
  }

  const { data: urlData } = admin.storage.from('media').getPublicUrl(data.path)
  const publicUrl = urlData.publicUrl

  // Persist the logo URL to user_settings immediately
  await supabase
    .from('user_settings')
    .update({ white_label_logo_url: publicUrl })
    .eq('user_id', user.id)

  return NextResponse.json({ url: publicUrl })
}
