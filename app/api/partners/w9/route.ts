export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
import { w9SubmittedEmail } from '@/lib/emails/affiliateEmails'

function getResend() { return new Resend(process.env.RESEND_API_KEY!) }

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getAuthedUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  return supabase.auth.getUser()
}

// ── POST — affiliate submits W-9 ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { data: { user } } = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getAdminSupabase()

  const { data: profile } = await db
    .from('affiliate_profiles')
    .select('id, status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) return NextResponse.json({ error: 'Affiliate profile not found' }, { status: 404 })

  // Parse multipart form
  const formData = await req.formData()
  const legalName  = formData.get('legal_name') as string
  const taxIdLast4 = formData.get('tax_id_last4') as string
  const address    = formData.get('address') as string
  const city       = formData.get('city') as string
  const state      = formData.get('state') as string
  const zip        = formData.get('zip') as string
  const file       = formData.get('file') as File | null

  if (!legalName || !taxIdLast4) {
    return NextResponse.json({ error: 'Legal name and last 4 of tax ID required' }, { status: 400 })
  }

  let storagePath: string | null = null

  if (file) {
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const path   = `${profile.id}/w9-${Date.now()}.pdf`

    const { error: uploadError } = await db.storage
      .from('affiliate-tax-docs')
      .upload(path, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      console.error('W-9 upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
    }

    storagePath = path
  }

  // Upsert tax form record
  const { error: dbError } = await db
    .from('affiliate_tax_forms')
    .upsert(
      {
        affiliate_id:  profile.id,
        form_type:     'W-9',
        status:        'submitted',
        legal_name:    legalName,
        tax_id_last4:  taxIdLast4,
        address,
        city,
        state,
        zip,
        storage_path:  storagePath,
        submitted_at:  new Date().toISOString(),
      },
      { onConflict: 'affiliate_id,form_type' }
    )

  if (dbError) {
    console.error('W-9 DB error:', dbError)
    return NextResponse.json({ error: 'Failed to save W-9 record' }, { status: 500 })
  }

  // Mark affiliate w9_submitted
  await db
    .from('affiliate_profiles')
    .update({ w9_submitted: true, w9_submitted_at: new Date().toISOString() })
    .eq('id', profile.id)

  // Confirmation email
  if (user.email) {
    await getResend().emails.send({
      from: 'SocialMate Partners <hello@socialmate.studio>',
      to: user.email,
      subject: 'W-9 received — your payouts are clear',
      html: w9SubmittedEmail({ email: user.email }),
    })
  }

  // Notify admin
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    await getResend().emails.send({
      from: 'SocialMate Partners <hello@socialmate.studio>',
      to: adminEmail,
      subject: `[Partners] W-9 submitted by ${user.email}`,
      html: `<p>${user.email} has submitted their W-9. <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/partners">Review in Admin Panel</a>.</p>`,
    })
  }

  return NextResponse.json({ success: true })
}
