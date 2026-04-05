export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpush = require('web-push')

export async function POST(request: NextRequest) {
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
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: sub } = await getSupabaseAdmin()
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!sub) {
    return NextResponse.json({ ok: false, reason: 'No subscription found' })
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:hello@socialmate.studio',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const pushSubscription = {
    endpoint: sub.endpoint,
    keys: { p256dh: sub.p256dh, auth: sub.auth },
  }

  const payload = JSON.stringify({
    title: 'SocialMate',
    body: 'Push notifications are working!',
    url: '/settings?tab=Notifications',
    tag: 'test',
  })

  try {
    await webpush.sendNotification(pushSubscription, payload)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err?.statusCode === 410) {
      await getSupabaseAdmin()
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', sub.endpoint)
      return NextResponse.json({ ok: false, reason: 'Subscription expired' })
    }
    console.error('Test push error:', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
