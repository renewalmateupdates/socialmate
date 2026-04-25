export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const ALLOWED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/quicktime', 'video/webm', 'video/mov',
]
const MAX_SIZE = 50 * 1024 * 1024 // 50MB

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

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({
      error: `Unsupported file type (${file.type}). Use JPEG, PNG, GIF, WebP, MP4, or MOV.`,
    }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({
      error: `File too large (${Math.round(file.size / 1024 / 1024)}MB). Max is 50MB.`,
    }, { status: 400 })
  }

  const ext    = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const random = Math.random().toString(36).slice(2, 10)
  const path   = `${user.id}/${Date.now()}-${random}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer      = Buffer.from(arrayBuffer)

  const admin = getSupabaseAdmin()
  const { data, error } = await admin.storage
    .from('media')
    .upload(path, buffer, {
      contentType: file.type,
      upsert:      false,
    })

  if (error) {
    console.error('[media/upload] Storage error:', error)
    return NextResponse.json({ error: 'Upload failed', detail: error.message }, { status: 500 })
  }

  const { data: urlData } = admin.storage.from('media').getPublicUrl(data.path)

  return NextResponse.json({
    url:  urlData.publicUrl,
    path: data.path,
    type: file.type.startsWith('video/') ? 'video' : 'image',
  })
}
