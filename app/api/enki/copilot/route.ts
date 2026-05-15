export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: async (cookiesToSet) => {
          const store = await cookies()
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options))
        },
      },
    }
  )
}

// GET — fetch the current user's copilot row (as owner) or the row they're invited to (as copilot)
export async function GET() {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getSupabaseAdmin()

  // Try as owner
  const { data: owned } = await admin
    .from('enki_copilots')
    .select('id, owner_user_id, copilot_user_id, copilot_email, status, invited_at, accepted_at')
    .eq('owner_user_id', user.id)
    .maybeSingle()

  if (owned) return NextResponse.json({ copilot: owned, role: 'owner' })

  // Try as copilot
  const { data: invited } = await admin
    .from('enki_copilots')
    .select('id, owner_user_id, copilot_user_id, copilot_email, status, invited_at, accepted_at')
    .eq('copilot_user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (invited) {
    // Also fetch owner email for display
    const { data: ownerUser } = await admin.auth.admin.getUserById(invited.owner_user_id)
    return NextResponse.json({
      copilot: invited,
      role: 'copilot',
      owner_email: ownerUser?.user?.email ?? null,
    })
  }

  return NextResponse.json({ copilot: null, role: null })
}

// POST — invite a co-pilot (owner only, Commander+ required)
export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify Commander+ tier
  const admin = getSupabaseAdmin()
  const { data: profile } = await admin
    .from('enki_profiles')
    .select('tier')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile || !['commander', 'emperor'].includes(profile.tier)) {
    return NextResponse.json({ error: 'Co-Pilot requires Commander or Emperor tier' }, { status: 403 })
  }

  const body = await req.json()
  const { email } = body as { email?: string }
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  // Upsert: replace any existing (removed) record for this owner
  const { data: existing } = await admin
    .from('enki_copilots')
    .select('id, status')
    .eq('owner_user_id', user.id)
    .maybeSingle()

  let recordId: string

  if (existing) {
    // Update existing record with new invite
    const { data: updated, error: updErr } = await admin
      .from('enki_copilots')
      .update({
        copilot_email: email,
        copilot_user_id: null,
        status: 'pending',
        invited_at: new Date().toISOString(),
        accepted_at: null,
      })
      .eq('id', existing.id)
      .select('id')
      .single()
    if (updErr || !updated) return NextResponse.json({ error: updErr?.message ?? 'DB error' }, { status: 500 })
    recordId = updated.id
  } else {
    // Insert new record
    const { data: inserted, error: insErr } = await admin
      .from('enki_copilots')
      .insert({
        owner_user_id: user.id,
        copilot_email: email,
        status: 'pending',
      })
      .select('id')
      .single()
    if (insErr || !inserted) return NextResponse.json({ error: insErr?.message ?? 'DB error' }, { status: 500 })
    recordId = inserted.id
  }

  // Send invite email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
  const acceptUrl = `${appUrl}/enki/copilot/accept?token=${recordId}`
  const ownerEmail = user.email ?? 'an Enki user'

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Enki by SocialMate <noreply@socialmate.studio>',
      to: email,
      subject: `You've been invited to co-pilot an Enki account`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr>
          <td style="background:#111111;border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;border-bottom:2px solid #f59e0b;">
            <div style="width:48px;height:48px;background:#f59e0b;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#000;margin-bottom:16px;">E</div>
            <div style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Enki Co-Pilot Invitation</div>
            <div style="font-size:13px;color:#6b7280;margin-top:6px;">View-only access to a live trading dashboard</div>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1a1a;padding:40px;border:1px solid #2a2a2a;border-top:none;border-radius:0 0 16px 16px;">
            <p style="font-size:15px;color:#d1d5db;line-height:1.7;margin:0 0 24px;">
              <strong style="color:#ffffff;">${ownerEmail}</strong> has invited you to be their Enki Co-Pilot. As a co-pilot, you'll have <strong style="color:#f59e0b;">read-only access</strong> to view their live trading dashboard, active trades, performance stats, and signals — without the ability to execute or approve trades.
            </p>
            <div style="background:#0f0f0f;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:28px;">
              <p style="font-size:13px;color:#9ca3af;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">As a co-pilot you can:</p>
              <ul style="margin:0;padding:0 0 0 16px;color:#d1d5db;font-size:13px;line-height:2;">
                <li>View live trades and open positions</li>
                <li>Monitor performance and P&amp;L</li>
                <li>See signal analysis and confidence scores</li>
                <li>Track the Enki dashboard in real-time</li>
              </ul>
            </div>
            <div style="text-align:center;margin-bottom:24px;">
              <a href="${acceptUrl}" style="display:inline-block;background:#f59e0b;color:#000000;padding:16px 40px;border-radius:999px;font-size:15px;font-weight:800;text-decoration:none;letter-spacing:-0.3px;">Accept Co-Pilot Invitation →</a>
            </div>
            <p style="font-size:12px;color:#4b5563;text-align:center;margin:0;">
              You need a SocialMate account to accept. <a href="${appUrl}/signup" style="color:#f59e0b;">Create one free →</a><br/>
              This invitation expires if ignored. If you didn't expect this, you can safely ignore it.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })
  } catch (err) {
    console.error('[Enki Copilot] invite email failed:', err)
    // Non-fatal — row was inserted, invite email failure doesn't block the response
  }

  return NextResponse.json({ success: true, record_id: recordId })
}

// DELETE — remove the co-pilot relationship (owner only)
export async function DELETE() {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getSupabaseAdmin()
  const { error } = await admin
    .from('enki_copilots')
    .update({ status: 'removed', copilot_user_id: null })
    .eq('owner_user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
