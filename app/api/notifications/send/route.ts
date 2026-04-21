// NOTE: This route requires:
//   npm install web-push
//   npm install --save-dev @types/web-push
//
// Required environment variables:
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY  — generate with: npx web-push generate-vapid-keys
//   VAPID_PRIVATE_KEY             — server-side only
//   VAPID_SUBJECT                 — e.g. mailto:hello@socialmate.studio
//   INTERNAL_SECRET               — shared secret for server-to-server calls

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpush = require('web-push')

export async function POST(request: NextRequest) {
  // Protect this endpoint — callable with either the internal secret or the Inngest CRON_SECRET
  const secret = request.headers.get('x-internal-secret')
  const internalKey = request.headers.get('x-internal-key')
  const validSecret = (secret && secret === process.env.INTERNAL_SECRET)
  const validInternalKey = (internalKey && internalKey === process.env.CRON_SECRET)
  if (!validSecret && !validInternalKey) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { user_id, title, body: msgBody, url, tag } = body

  if (!user_id || !title) {
    return NextResponse.json({ error: 'user_id and title are required' }, { status: 400 })
  }

  // Fetch push subscription for the user
  const { data: sub, error: fetchError } = await getSupabaseAdmin()
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', user_id)
    .maybeSingle()

  if (fetchError) {
    console.error('Push send: fetch subscription error:', fetchError)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }

  if (!sub) {
    return NextResponse.json({ ok: false, reason: 'No subscription found for user' })
  }

  // Configure VAPID details
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:hello@socialmate.studio',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const pushSubscription = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  }

  const payload = JSON.stringify({ title, body: msgBody || '', url: url || '/dashboard', tag: tag || 'socialmate' })

  try {
    await webpush.sendNotification(pushSubscription, payload)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    // 410 Gone means the subscription is no longer valid — clean it up
    if (err?.statusCode === 410) {
      await getSupabaseAdmin()
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', sub.endpoint)
      return NextResponse.json({ ok: false, reason: 'Subscription expired and removed' })
    }
    console.error('Push send error:', err)
    return NextResponse.json({ error: 'Failed to send push notification' }, { status: 500 })
  }
}
