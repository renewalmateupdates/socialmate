export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { inngest } from '@/lib/inngest'
import { resolveWorkspacePlan } from '@/lib/plan'
import { CAMPAIGN_PLATFORMS, PAID_ONLY_PLATFORMS } from '@/lib/campaigns'
import { WAITING_NOTE, checkAlertPlatforms, validateTemplate } from '@/lib/live-alerts'
import { postLiveAlert, syncChannelSubscription, type LiveAlertRow } from '@/lib/live-alert-run'
import { channelInfo } from '@/lib/twitch'

async function currentUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function loadOwn(id: string, userId: string): Promise<LiveAlertRow | null> {
  const { data, error } = await getSupabaseAdmin().from('live_alerts').select('*').eq('id', id).eq('user_id', userId).maybeSingle()
  if (error) console.warn('[live-alerts] lookup failed:', error.message)
  return (data as LiveAlertRow | null) ?? null
}

// { action: 'test' } posts the alert now with the channel's current title.
// Otherwise any of { enabled, platforms, template } updates the alert.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const alert = await loadOwn(id, user.id)
  if (!alert) return NextResponse.json({ error: 'Alert not found.' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const db = getSupabaseAdmin()

  if (body.action === 'test') {
    const info = await channelInfo(alert.twitch_user_id).catch(() => null)
    const res = await postLiveAlert(db, alert, {
      name:  alert.twitch_name,
      title: info?.title ?? '',
      game:  info?.game ?? '',
      url:   `https://twitch.tv/${alert.twitch_login}`,
    }, async items => {
      await inngest.send(items.map(p => ({ name: 'post/scheduled', data: p })))
    }, { streamId: null, test: true })
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 })
    return NextResponse.json({ posted: true, postId: res.postId })
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (body.platforms !== undefined) {
    const plan = await resolveWorkspacePlan(db, user.id, alert.workspace_id)
    const { data: accounts, error: accErr } = await db.from('connected_accounts').select('platform').eq('user_id', user.id)
    if (accErr) console.warn('[live-alerts] connected accounts lookup failed:', accErr.message)
    const check = checkAlertPlatforms(body.platforms, {
      allowed:   CAMPAIGN_PLATFORMS,
      connected: Array.from(new Set((accounts ?? []).map(a => a.platform as string))),
      paidPlan:  plan !== 'free',
      paidOnly:  PAID_ONLY_PLATFORMS,
    })
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 })
    patch.platforms = check.platforms
  }

  if (body.template !== undefined) {
    const t = validateTemplate(body.template)
    if (!t.ok) return NextResponse.json({ error: t.error }, { status: 400 })
    patch.template = t.template
  }

  const toggling = typeof body.enabled === 'boolean' && body.enabled !== alert.enabled
  if (toggling) {
    patch.enabled = body.enabled
    patch.last_error = body.enabled ? WAITING_NOTE : null
  }

  const { data: updated, error } = await db.from('live_alerts').update(patch).eq('id', id).select('*').single()
  if (error || !updated) {
    console.error('[live-alerts] update failed:', error?.message)
    return NextResponse.json({ error: 'Could not save the change.' }, { status: 500 })
  }

  if (toggling) {
    const sync = await syncChannelSubscription(db, alert.twitch_user_id)
    if (!sync.ok) {
      // Put it back so the switch shows what is really happening.
      const { error: revertErr } = await db.from('live_alerts').update({ enabled: alert.enabled }).eq('id', id)
      if (revertErr) console.warn('[live-alerts] revert failed:', revertErr.message)
      return NextResponse.json({ error: sync.error }, { status: 502 })
    }
  }

  return NextResponse.json({ alert: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const alert = await loadOwn(id, user.id)
  if (!alert) return NextResponse.json({ error: 'Alert not found.' }, { status: 404 })

  const db = getSupabaseAdmin()
  const { error } = await db.from('live_alerts').delete().eq('id', id)
  if (error) {
    console.error('[live-alerts] delete failed:', error.message)
    return NextResponse.json({ error: 'Could not delete the alert.' }, { status: 500 })
  }
  // Unsubscribes from Twitch if no other alert follows this channel.
  const sync = await syncChannelSubscription(db, alert.twitch_user_id, [alert.eventsub_id])
  if (!sync.ok) console.warn('[live-alerts] unsubscribe after delete failed for', alert.twitch_user_id)
  return NextResponse.json({ deleted: true })
}
