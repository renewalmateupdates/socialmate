export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function makeSupabase(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
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
}

/** GET /api/white-label/settings — return current white label config */
export async function GET() {
  const cookieStore = await cookies()
  const supabase = makeSupabase(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('user_settings')
    .select('white_label_active, white_label_tier, white_label_status, white_label_brand_name, white_label_logo_url, white_label_custom_domain, white_label_brand_color, white_label_remove_branding')
    .eq('user_id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    active:           data?.white_label_active ?? false,
    tier:             data?.white_label_tier ?? null,
    status:           data?.white_label_status ?? null,
    brand_name:       data?.white_label_brand_name ?? '',
    logo_url:         data?.white_label_logo_url ?? '',
    custom_domain:    data?.white_label_custom_domain ?? '',
    brand_color:      data?.white_label_brand_color ?? '#f59e0b',
    remove_branding:  data?.white_label_remove_branding ?? false,
  })
}

/** PATCH /api/white-label/settings — update white label config */
export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = makeSupabase(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check user has an active white label subscription
  const { data: settings } = await supabase
    .from('user_settings')
    .select('white_label_active, white_label_tier')
    .eq('user_id', user.id)
    .single()

  if (!settings?.white_label_active) {
    return NextResponse.json({ error: 'Active White Label subscription required' }, { status: 403 })
  }

  const body = await req.json()
  const {
    brand_name,
    logo_url,
    custom_domain,
    brand_color,
    remove_branding,
  } = body

  const update: Record<string, unknown> = {}
  if (typeof brand_name === 'string')      update.white_label_brand_name    = brand_name.trim().slice(0, 100)
  if (typeof logo_url === 'string')        update.white_label_logo_url      = logo_url.trim().slice(0, 500)
  if (typeof brand_color === 'string')     update.white_label_brand_color   = brand_color.trim().slice(0, 7)
  if (typeof remove_branding === 'boolean') {
    // Remove branding is Pro-only
    if (settings.white_label_tier === 'pro' || remove_branding === false) {
      update.white_label_remove_branding = remove_branding
    }
  }
  if (typeof custom_domain === 'string' && settings.white_label_tier === 'pro') {
    update.white_label_custom_domain = custom_domain.trim().slice(0, 200)
  }

  const { error } = await supabase
    .from('user_settings')
    .update(update)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
