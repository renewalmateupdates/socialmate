export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { Resend } from 'resend'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
function getResend() { return new Resend(process.env.RESEND_API_KEY!) }

// ── GET — admin fetch all feedback ─────────────────────────────────────────
export async function GET(_req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: items, error } = await getSupabaseAdmin()
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ feedback: items ?? [] })
}

// ── DELETE — admin delete a feedback item ─────────────────────────────────
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await getSupabaseAdmin()
    .from('feedback')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// ── POST — submit feedback ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
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

  const { data: { user } } = await supabase.auth.getUser()

  const { type, message } = await req.json()

  if (!type || !message?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { error } = await supabase.from('feedback').insert({
    user_id: user?.id ?? null,
    type,
    message: message.trim(),
    email: user?.email ?? null,
  })

  if (error) {
    console.error('Feedback insert error:', error)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }

  // Email + push notification — non-fatal, never block the user response
  try {
    await getResend().emails.send({
      from: 'SocialMate <hello@socialmate.studio>',
      to: 'renewalmate.updates@gmail.com',
      subject: `[${type.toUpperCase()}] New feedback from ${user?.email ?? 'anonymous'}`,
      html: `
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>From:</strong> ${user?.email ?? 'Not logged in'}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="border-left:3px solid #f59e0b;padding-left:12px;margin:12px 0;color:#374151">${message.trim()}</blockquote>
        <p><a href="https://socialmate.studio/admin/feedback">View in Admin</a></p>
      `,
    })
  } catch (emailErr) {
    console.error('Feedback email notification failed:', emailErr)
  }

  // Push notification to admin push subscriptions
  try {
    const { data: adminSettings } = await getSupabaseAdmin()
      .from('user_settings')
      .select('user_id')
      .eq('is_admin', true)
      .limit(5)

    const adminIds = (adminSettings ?? []).map((s: { user_id: string }) => s.user_id)
    if (adminIds.length > 0) {
      const { data: subs } = await getSupabaseAdmin()
        .from('push_subscriptions')
        .select('subscription')
        .in('user_id', adminIds)

      if (subs && subs.length > 0) {
        const webpush = await import('web-push')
        webpush.setVapidDetails(
          'mailto:socialmatehq@gmail.com',
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
          process.env.VAPID_PRIVATE_KEY!
        )
        await Promise.allSettled(
          subs.map((s: { subscription: string }) =>
            webpush.sendNotification(
              JSON.parse(s.subscription as string),
              JSON.stringify({
                title: `New ${type} feedback`,
                body: message.trim().slice(0, 100),
                url: '/admin/feedback',
              })
            )
          )
        )
      }
    }
  } catch (pushErr) {
    console.error('Feedback push notification failed:', pushErr)
  }

  return NextResponse.json({ success: true })
}