export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const { name, clientName, industry, website, notes, defaultPlatforms } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 })
    }

    // Use admin client to bypass RLS for workspace creation
    console.log('[WORKSPACE-CREATE] Attempting insert:', { owner_id: user.id, name: name.trim(), is_personal: false })
    const { data, error } = await getSupabaseAdmin()
      .from('workspaces')
      .insert({
        owner_id:          user.id,
        name:              name.trim(),
        client_name:       clientName?.trim() || name.trim(),
        industry:          industry  || null,
        website:           website   || null,
        notes:             notes     || null,
        default_platforms: defaultPlatforms || [],
        is_personal:       false,
        created_at:        new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('[workspace-create] Supabase error:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      })
      return NextResponse.json({ error: 'Failed to create workspace', detail: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, workspace: data })

  } catch (err: any) {
    console.error('[WORKSPACE_CREATE] Unexpected error:', err)
    return NextResponse.json({ error: 'Failed to create workspace', detail: err?.message }, { status: 500 })
  }
}
