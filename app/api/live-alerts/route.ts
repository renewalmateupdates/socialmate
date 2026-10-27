export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { accountsPerPlatformFor, resolveWorkspacePlan } from '@/lib/plan'
import { CAMPAIGN_PLATFORMS, PAID_ONLY_PLATFORMS } from '@/lib/campaigns'
import { campaignWorkspace } from '@/lib/campaign-access'
import { WAITING_NOTE, checkAlertPlatforms, normalizeTwitchLogin, validateTemplate } from '@/lib/live-alerts'
import { syncChannelSubscription } from '@/lib/live-alert-run'
import { lookupTwitchUser, twitchConfigured } from '@/lib/twitch'
import { recordUsage } from '@/lib/usage'

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

export async function GET() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await getSupabaseAdmin().from('live_alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  if (error) {
    console.error('[live-alerts] list failed:', error.message)
    return NextResponse.json({ error: 'Could not load your alerts.' }, { status: 500 })
  }
  return NextResponse.json({ alerts: data ?? [] })
}

export async function POST(req: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!twitchConfigured()) return NextResponse.json({ error: 'Go-live alerts are not available right now.' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const db = getSupabaseAdmin()

  const ws = await campaignWorkspace(db, user, body.workspaceId)
  if (!ws.ok) return NextResponse.json({ error: ws.error }, { status: ws.status })

  const login = normalizeTwitchLogin(body.channel)
  if (!login) return NextResponse.json({ error: 'Type a Twitch channel name, like the part after twitch.tv/.' }, { status: 400 })

  const plan = await resolveWorkspacePlan(db, user.id, ws.workspaceId)
  const { count, error: countErr } = await db.from('live_alerts').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
  if (countErr) console.warn('[live-alerts] count failed:', countErr.message)
  const cap = accountsPerPlatformFor(plan)
  if ((count ?? 0) >= cap) {
    return NextResponse.json({
      error: cap === 1
        ? 'The free plan has one go-live alert. Upgrade to Pro for up to 5.'
        : `Your plan has up to ${cap} go-live alerts.`,
      upgradeHref: '/pricing',
    }, { status: 403 })
  }

  const { data: accounts, error: accErr } = await db.from('connected_accounts').select('platform').eq('user_id', user.id)
  if (accErr) console.warn('[live-alerts] connected accounts lookup failed:', accErr.message)
  const platformCheck = checkAlertPlatforms(body.platforms, {
    allowed:   CAMPAIGN_PLATFORMS,
    connected: Array.from(new Set((accounts ?? []).map(a => a.platform as string))),
    paidPlan:  plan !== 'free',
    paidOnly:  PAID_ONLY_PLATFORMS,
  })
  if (!platformCheck.ok) return NextResponse.json({ error: platformCheck.error }, { status: 400 })

  const template = validateTemplate(body.template)
  if (!template.ok) return NextResponse.json({ error: template.error }, { status: 400 })

  let twitchUser
  try {
    twitchUser = await lookupTwitchUser(login)
  } catch (err) {
    console.error('[live-alerts] Twitch lookup failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Could not reach Twitch. Try again in a minute.' }, { status: 502 })
  }
  if (!twitchUser) return NextResponse.json({ error: `There's no Twitch channel called ${login}.` }, { status: 404 })

  const { data: row, error: insertErr } = await db.from('live_alerts').insert({
    user_id:        user.id,
    workspace_id:   ws.workspaceId,
    twitch_user_id: twitchUser.id,
    twitch_login:   twitchUser.login,
    twitch_name:    twitchUser.display_name || twitchUser.login,
    platforms:      platformCheck.platforms,
    template:       template.template,
    enabled:        true,
    // Cleared when Twitch calls the webhook to confirm (or at once if the channel is already confirmed).
    last_error:     WAITING_NOTE,
  }).select('*').single()
  if (insertErr || !row) {
    if (insertErr?.code === '23505') return NextResponse.json({ error: 'You already have an alert for that channel.' }, { status: 409 })
    console.error('[live-alerts] insert failed:', insertErr?.message)
    return NextResponse.json({ error: 'Could not save the alert.' }, { status: 500 })
  }

  // Without the Twitch subscription the alert would never fire, so don't keep half of it.
  const sync = await syncChannelSubscription(db, twitchUser.id)
  if (!sync.ok) {
    const { error: delErr } = await db.from('live_alerts').delete().eq('id', row.id)
    if (delErr) console.warn('[live-alerts] rollback failed:', delErr.message)
    return NextResponse.json({ error: sync.error }, { status: 502 })
  }

  recordUsage(db, user.id, 'live_alert_created', { channel: twitchUser.login, platforms: platformCheck.platforms.join(',') })
  return NextResponse.json({ alert: row })
}
