import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ADMIN_USER_ID = process.env.ADMIN_USER_ID

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

  // Only your account can approve/reject
  if (ADMIN_USER_ID && user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { affiliate_id, action, rejection_reason } = await req.json()

  if (!affiliate_id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const adminSupabase = getAdminSupabase()

  if (action === 'approve') {
    const { data: affiliate, error } = await adminSupabase
      .from('affiliates')
      .update({
        status: 'active',
        commission_rate: 0.30,
        joined_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.email,
      })
      .eq('id', affiliate_id)
      .select('user_id')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to approve.' }, { status: 500 })
    }

    // TODO (next session): Send approval email via Resend
    // await sendApprovalEmail(affiliate.user_id)
    console.log('TODO: Send approval email to user_id:', affiliate?.user_id)

    return NextResponse.json({ success: true, action: 'approved' })
  }

  if (action === 'reject') {
    const { data: affiliate, error } = await adminSupabase
      .from('affiliates')
      .update({
        status: 'rejected',
        rejection_reason: rejection_reason || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.email,
      })
      .eq('id', affiliate_id)
      .select('user_id')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to reject.' }, { status: 500 })
    }

    // TODO (next session): Send rejection email via Resend
    // await sendRejectionEmail(affiliate.user_id, rejection_reason)
    console.log('TODO: Send rejection email to user_id:', affiliate?.user_id)

    return NextResponse.json({ success: true, action: 'rejected' })
  }
}