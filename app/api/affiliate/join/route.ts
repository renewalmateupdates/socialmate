export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function audienceSizeQualifies(size: string | null | undefined): boolean {
  if (!size) return false
  const disqualified = ['Under 500']
  return !disqualified.includes(size)
}

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
    .select('id, status, can_reapply_at')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    if (existing.status !== 'rejected') {
      return NextResponse.json(
        { error: 'You have already submitted an application.', status: existing.status },
        { status: 409 }
      )
    }
    // Rejected — check cooldown
    if (existing.can_reapply_at && new Date(existing.can_reapply_at) > new Date()) {
      return NextResponse.json(
        { error: `You can reapply after ${new Date(existing.can_reapply_at).toLocaleDateString()}.`, can_reapply_at: existing.can_reapply_at },
        { status: 409 }
      )
    }
    // Cooldown passed — delete old record so they can reapply fresh
    await adminSupabase.from('affiliates').delete().eq('id', existing.id)
  }

  const body = await req.json()
  const {
    full_name, website_url, social_handles, content_type,
    platforms, audience_size, monthly_reach, engagement_rate,
    promotion_plan, why_good_fit,
  } = body

  if (!full_name || !promotion_plan || !why_good_fit) {
    return NextResponse.json(
      { error: 'Please fill out all required fields.' },
      { status: 400 }
    )
  }

  // Determine if application meets minimum requirements
  const hasPresence = !!(website_url?.trim() || social_handles?.trim())
  const hasAudience = audienceSizeQualifies(audience_size)
  const hasDetailedPlan = promotion_plan.trim().length >= 100
  const hasDetailedFit  = why_good_fit.trim().length >= 50
  const meets_minimum = hasPresence && hasAudience && hasDetailedPlan && hasDetailedFit

  const { error } = await adminSupabase
    .from('affiliates')
    .insert({
      user_id: user.id,
      status: 'pending_review',
      full_name,
      website_url:     website_url || null,
      social_handles:  social_handles || null,
      content_type:    content_type || null,
      platforms:       platforms || [],
      audience_size:   audience_size || null,
      monthly_reach:   monthly_reach || null,
      engagement_rate: engagement_rate || null,
      promotion_plan,
      why_good_fit,
      meets_minimum,
      applied_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Affiliate apply error:', error)
    return NextResponse.json({ error: 'Failed to submit application.' }, { status: 500 })
  }

  // Notify admin when applicant meets minimum requirements
  if (meets_minimum) {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY!)
    const adminEmail = process.env.ADMIN_EMAIL || 'socialmatehq@gmail.com'
    await resend.emails.send({
      from: 'SocialMate <hello@socialmate.studio>',
      to: adminEmail,
      subject: `✅ New affiliate application meets minimum requirements — ${full_name}`,
      html: `
        <p><strong>${full_name}</strong> just applied and meets your minimum requirements.</p>
        <p><strong>Presence:</strong> ${website_url || social_handles || 'N/A'}</p>
        <p><strong>Audience:</strong> ${audience_size || 'N/A'} · Reach: ${monthly_reach || 'N/A'} · Engagement: ${engagement_rate || 'N/A'}</p>
        <p><strong>Content type:</strong> ${content_type || 'N/A'}</p>
        <p><strong>Promotion plan:</strong> ${promotion_plan}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'}/admin">Review in Admin Hub →</a></p>
      `,
    }).catch(() => {}) // non-fatal
  }

  return NextResponse.json({ success: true })
}