import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { buildIrisEmailHtml as buildHtml } from '@/lib/iris-email'
import { Resend } from 'resend'

function getResend() { return new Resend(process.env.RESEND_API_KEY) }

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
