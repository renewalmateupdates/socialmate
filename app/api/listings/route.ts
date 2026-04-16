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
    const { data: newListing, error } = await db.from('curated_listings').insert({
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
    }).select('id').single()

    if (error) {
      console.error('Listings insert error:', error)
      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
    }

    // ── In-app notification for admin ────────────────────────────────────────
    // Look up Joshua's user_id by ADMIN_EMAIL so the bell icon shows the new application.
    // This is fire-and-forget — we never fail the request if this doesn't work.
    const adminEmail = process.env.ADMIN_EMAIL || 'socialmatehq@gmail.com'
    ;(async () => {
      try {
        // auth.users is only accessible via service-role listUsers
        const { data: { users } } = await db.auth.admin.listUsers({ perPage: 1000 })
        const admin = users.find((u: { email?: string }) => u.email === adminEmail)

        if (admin?.id) {
          await db.from('notifications').insert({
            user_id:    admin.id,
            type:       'studio_stax_application',
            title:      'New Studio Stax Application',
            message:    `${name} (${applicant_name}) applied for a listing.`,
            is_read:    false,
            data:       JSON.stringify({ action_url: '/admin/studio-stax', listing_id: newListing?.id }),
          })
        }
      } catch (notifErr) {
        // Non-fatal — log and continue
        console.error('[StaxApply] Failed to send admin notification:', notifErr)
      }
    })()

    // Notify Joshua via email — fire and forget
    const resend = new Resend(process.env.RESEND_API_KEY)
    const missionExcerpt = mission_statement ? mission_statement.slice(0, 200) + (mission_statement.length > 200 ? '…' : '') : null
    const whyExcerpt = why_apply ? why_apply.slice(0, 200) + (why_apply.length > 200 ? '…' : '') : null
    resend.emails.send({
      from: 'SocialMate <noreply@socialmate.studio>',
      to: adminEmail,
      subject: `🏪 New Studio Stax Application — ${name}`,
      html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#1a1a1a;border-radius:16px;overflow:hidden;border:1px solid #333;">
      <div style="background:#111;padding:20px 28px;border-bottom:1px solid #333;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;">Studio Stax</p>
        <h1 style="margin:4px 0 0;font-size:20px;font-weight:800;color:#fff;">New Listing Application</h1>
      </div>
      <div style="padding:28px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:8px 12px 8px 0;color:#9ca3af;font-weight:600;white-space:nowrap;vertical-align:top;">Tool</td>
            <td style="padding:8px 0;color:#f3f4f6;font-weight:700;">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;color:#9ca3af;font-weight:600;vertical-align:top;">Tagline</td>
            <td style="padding:8px 0;color:#d1d5db;">${tagline}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;color:#9ca3af;font-weight:600;vertical-align:top;">URL</td>
            <td style="padding:8px 0;"><a href="${url}" style="color:#60a5fa;">${url}</a></td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;color:#9ca3af;font-weight:600;vertical-align:top;">Applicant</td>
            <td style="padding:8px 0;color:#d1d5db;">${applicant_name} &lt;${applicant_email}&gt;</td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;color:#9ca3af;font-weight:600;vertical-align:top;">Category</td>
            <td style="padding:8px 0;color:#d1d5db;">${category}</td>
          </tr>
          ${missionExcerpt ? `<tr>
            <td style="padding:8px 12px 8px 0;color:#9ca3af;font-weight:600;vertical-align:top;">Mission</td>
            <td style="padding:8px 0;color:#d1d5db;line-height:1.5;">${missionExcerpt}</td>
          </tr>` : ''}
          ${whyExcerpt ? `<tr>
            <td style="padding:8px 12px 8px 0;color:#9ca3af;font-weight:600;vertical-align:top;">Why apply</td>
            <td style="padding:8px 0;color:#d1d5db;line-height:1.5;">${whyExcerpt}</td>
          </tr>` : ''}
        </table>
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #333;text-align:center;">
          <a href="https://socialmate.studio/admin/studio-stax" style="display:inline-block;background:#fff;color:#111;font-weight:700;font-size:13px;padding:12px 24px;border-radius:10px;text-decoration:none;">
            Review in Admin →
          </a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
    }).catch(() => {})

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
