import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST — submit a listing application
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { applicant_name, applicant_email, name, tagline, description, url, logo_url, category, mission_statement, why_apply } = body

    if (!applicant_name || !applicant_email || !name || !tagline || !description || !url || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = getAdminSupabase()
    const { error } = await db.from('curated_listings').insert({
      applicant_name,
      applicant_email,
      name,
      tagline,
      description,
      url,
      logo_url: logo_url || null,
      category,
      mission_statement: mission_statement || null,
      why_apply: why_apply || null,
      status: 'pending',
    })

    if (error) {
      console.error('Listings insert error:', error)
      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
    }

    // Notify Joshua via email
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const adminEmail = process.env.ADMIN_EMAIL || 'socialmatehq@gmail.com'
      await resend.emails.send({
        from: 'SocialMate <notifications@socialmate.studio>',
        to: adminEmail,
        subject: `New Listing Application: ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #111;">New Listing Application 📋</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px; color: #666; font-weight: bold;">Tool</td><td style="padding: 8px;">${name}</td></tr>
              <tr><td style="padding: 8px; color: #666; font-weight: bold;">Tagline</td><td style="padding: 8px;">${tagline}</td></tr>
              <tr><td style="padding: 8px; color: #666; font-weight: bold;">URL</td><td style="padding: 8px;"><a href="${url}">${url}</a></td></tr>
              <tr><td style="padding: 8px; color: #666; font-weight: bold;">Category</td><td style="padding: 8px;">${category}</td></tr>
              <tr><td style="padding: 8px; color: #666; font-weight: bold;">Applicant</td><td style="padding: 8px;">${applicant_name} &lt;${applicant_email}&gt;</td></tr>
              <tr><td style="padding: 8px; color: #666; font-weight: bold;">Description</td><td style="padding: 8px;">${description}</td></tr>
              ${mission_statement ? `<tr><td style="padding: 8px; color: #666; font-weight: bold;">Mission</td><td style="padding: 8px;">${mission_statement}</td></tr>` : ''}
              ${why_apply ? `<tr><td style="padding: 8px; color: #666; font-weight: bold;">Why Apply</td><td style="padding: 8px;">${why_apply}</td></tr>` : ''}
            </table>
            <p style="margin-top: 24px;">Review at: <a href="https://socialmate.studio/admin/partners">Admin Panel → Listings tab</a></p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.warn('Failed to send listing notification email:', emailErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Listings POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET — fetch approved listings (public)
export async function GET() {
  const db = getAdminSupabase()
  const { data, error } = await db
    .from('curated_listings')
    .select('id, name, tagline, description, url, logo_url, category, smgive_donated_cents, consecutive_featured_months, created_at')
    .eq('status', 'approved')
    .order('smgive_donated_cents', { ascending: false })

  if (error) return NextResponse.json({ listings: [] })
  return NextResponse.json({ listings: data ?? [] })
}
