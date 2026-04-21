export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

async function getUser() {
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
  return user
}

export async function GET() {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminDb = getSupabaseAdmin()
    const { data } = await adminDb
      .from('user_settings')
      .select('brand_voice')
      .eq('user_id', user.id)
      .maybeSingle()

    return NextResponse.json({ brand_voice: data?.brand_voice ?? null })
  } catch (err) {
    console.error('GET brand-voice error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    const adminDb = getSupabaseAdmin()
    const { error } = await adminDb
      .from('user_settings')
      .upsert({ user_id: user.id, brand_voice: body }, { onConflict: 'user_id' })

    if (error) {
      console.error('PATCH brand-voice error:', error)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH brand-voice error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
