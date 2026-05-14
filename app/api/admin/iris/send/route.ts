import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

function getResend() { return new Resend(process.env.RESEND_API_KEY) }

function buildHtml(params: {
  edition: number
  subject: string
  intro: string
  whatShipped: string
  realNumbers: string
  whatsNext: string
  closing: string
  recipientEmail?: string
}): string {
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const unsubscribeUrl = params.recipientEmail
    ? `https://socialmate.studio/api/unsubscribe/iris?email=${encodeURIComponent(params.recipientEmail)}`
    : 'https://socialmate.studio/settings?tab=Notifications'

  function nl2br(s: string) {
    return s.replace(/\n/g, '<br />')
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#d97706,#b45309);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
            <div style="font-size:10px;font-weight:900;letter-spacing:5px;color:#fde68a;text-transform:uppercase;margin-bottom:8px;">✦ &nbsp; THE IRIS DISPATCH &nbsp; ✦</div>
            <div style="font-size:42px;font-weight:900;color:#ffffff;letter-spacing:-2px;line-height:1;">IRIS</div>
            <div style="font-size:12px;color:#fde68a;margin-top:8px;letter-spacing:1px;">Edition #${params.edition} &nbsp;·&nbsp; ${date}</div>
            <div style="font-size:11px;color:#fbbf24;margin-top:4px;">Build-in-public newsletter from SocialMate</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;">

            <!-- Intro -->
            <p style="font-size:16px;color:#111827;line-height:1.75;margin:0 0 32px;">${nl2br(params.intro)}</p>

            <!-- What Shipped -->
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:22px 26px;margin-bottom:20px;">
              <div style="font-size:10px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#92400e;margin-bottom:12px;">🔨 &nbsp; WHAT SHIPPED</div>
              <div style="font-size:14px;color:#374151;line-height:1.75;">${nl2br(params.whatShipped)}</div>
            </div>

            <!-- Real Numbers -->
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:22px 26px;margin-bottom:20px;">
              <div style="font-size:10px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#14532d;margin-bottom:12px;">📊 &nbsp; REAL NUMBERS</div>
              <div style="font-size:14px;color:#374151;line-height:1.75;">${nl2br(params.realNumbers)}</div>
            </div>

            <!-- What's Next -->
            <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:22px 26px;margin-bottom:28px;">
              <div style="font-size:10px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#581c87;margin-bottom:12px;">🚀 &nbsp; WHAT'S NEXT</div>
              <div style="font-size:14px;color:#374151;line-height:1.75;">${nl2br(params.whatsNext)}</div>
            </div>

            <!-- Closing -->
            <p style="font-size:15px;color:#374151;line-height:1.75;margin:0 0 32px;">${nl2br(params.closing)}</p>

            <!-- CTA -->
            <div style="text-align:center;margin-bottom:36px;">
              <a href="https://socialmate.studio" style="display:inline-block;background:#000000;color:#ffffff;padding:14px 36px;border-radius:999px;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">Visit SocialMate →</a>
            </div>

            <!-- Footer -->
            <div style="border-top:1px solid #f3f4f6;padding-top:24px;text-align:center;">
              <p style="font-size:12px;color:#9ca3af;margin:0 0 8px;">
                You're receiving this because you opted in to The IRIS Dispatch on SocialMate.
              </p>
              <p style="font-size:12px;color:#9ca3af;margin:0 0 6px;">
                <a href="${unsubscribeUrl}" style="color:#d97706;text-decoration:underline;font-weight:600;">Unsubscribe</a>
                &nbsp;·&nbsp;
                <a href="https://socialmate.studio/settings?tab=Notifications" style="color:#9ca3af;text-decoration:none;">Manage preferences</a>
                &nbsp;·&nbsp;
                <a href="https://socialmate.studio" style="color:#9ca3af;text-decoration:none;">socialmate.studio</a>
              </p>
              <p style="font-size:11px;color:#d1d5db;margin:8px 0 0;">SocialMate · socialmate.studio</p>
            </div>

          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'socialmatehq@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { subject, intro, whatShipped, realNumbers, whatsNext, closing, preview } = body

  if (!subject || !intro) {
    return NextResponse.json({ error: 'subject and intro are required' }, { status: 400 })
  }

  const admin = getSupabaseAdmin()

  // Determine edition number
  const { count } = await admin.from('iris_dispatches').select('*', { count: 'exact', head: true })
  const edition = (count ?? 0) + 1

  const bodyHtml = buildHtml({ edition, subject, intro, whatShipped: whatShipped ?? '', realNumbers: realNumbers ?? '', whatsNext: whatsNext ?? '', closing: closing ?? '', recipientEmail: undefined })

  // Preview mode — return HTML without sending
  if (preview) {
    return NextResponse.json({ html: bodyHtml, edition })
  }

  // Fetch all opted-in user IDs
  const { data: optins } = await admin
    .from('user_settings')
    .select('user_id')
    .eq('iris_opt_in', true)

  const optedInIds = new Set((optins ?? []).map((r: { user_id: string }) => r.user_id))

  // Fetch emails from auth
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const emails = authUsers
    .filter(u => u.email && optedInIds.has(u.id))
    .map(u => u.email!)

  if (emails.length === 0) {
    return NextResponse.json({ error: 'No opted-in recipients found' }, { status: 400 })
  }

  // Persist dispatch record
  const { error: insertErr } = await admin.from('iris_dispatches').insert({
    edition,
    subject,
    intro,
    what_shipped: whatShipped ?? null,
    real_numbers: realNumbers ?? null,
    whats_next: whatsNext ?? null,
    closing: closing ?? null,
    body_html: bodyHtml,
    recipient_count: emails.length,
  })
  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  // Batch-send via Resend (max 100 per batch)
  const resend = getResend()
  let sent = 0
  const CHUNK = 100
  for (let i = 0; i < emails.length; i += CHUNK) {
    const chunk = emails.slice(i, i + CHUNK)
    try {
      await resend.batch.send(chunk.map(to => ({
        from: 'Joshua @ SocialMate <noreply@socialmate.studio>',
        to,
        subject,
        html: buildHtml({ edition, subject, intro, whatShipped: whatShipped ?? '', realNumbers: realNumbers ?? '', whatsNext: whatsNext ?? '', closing: closing ?? '', recipientEmail: to }),
      })))
      sent += chunk.length
    } catch (err) {
      console.error('IRIS batch send error:', err)
    }
  }

  return NextResponse.json({ ok: true, edition, sent, total: emails.length })
}
