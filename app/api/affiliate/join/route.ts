import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function getAdminSupabase() {
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminSupabase = getAdminSupabase()

  // Must be on any paid plan (monthly or annual)
  const { data: settings } = await adminSupabase
    .from('user_settings')
    .select('plan, stripe_subscription_id')
    .eq('user_id', user.id)
    .single()

  if (!settings || settings.plan === 'free') {
    return NextResponse.json(
      { error: 'You must be on a paid plan to apply.' },
      { status: 403 }
    )
  }

  // Check if already applied
  const { data: existing } = await adminSupabase
    .from('affiliates')
    .select('id, status')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json(
      { error: 'You have already submitted an application.', status: existing.status },
      { status: 409 }
    )
  }

  const body = await req.json()
  const { full_name, website_url, platforms, audience_size, promotion_plan, why_good_fit } = body

  if (!full_name || !promotion_plan || !why_good_fit) {
    return NextResponse.json(
      { error: 'Please fill out all required fields.' },
      { status: 400 }
    )
  }

  const { error } = await adminSupabase
    .from('affiliates')
    .insert({
      user_id: user.id,
      status: 'pending_review',
      full_name,
      website_url: website_url || null,
      platforms: platforms || [],
      audience_size: audience_size || null,
      promotion_plan,
      why_good_fit,
      applied_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Affiliate apply error:', error)
    return NextResponse.json({ error: 'Failed to submit application.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}