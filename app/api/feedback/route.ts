export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { Resend } from 'resend'
function getResend() { return new Resend(process.env.RESEND_API_KEY!) }


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

  // Email notification to you
  await getResend().emails.send({
    from: 'SocialMate <hello@socialmate.studio>',
    to: 'renewalmate.updates@gmail.com',
    subject: `[${type.toUpperCase()}] New feedback from ${user?.email ?? 'anonymous'}`,
    html: `
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>From:</strong> ${user?.email ?? 'Not logged in'}</p>
      <p><strong>Message:</strong></p>
      <p>${message.trim()}</p>
    `,
  })

  return NextResponse.json({ success: true })
}