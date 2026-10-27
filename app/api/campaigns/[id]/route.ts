export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { inngest } from '@/lib/inngest'
import { localDayKey } from '@/lib/campaigns'
import { removeUpcomingPosts, topUpCampaign, type CampaignRow } from '@/lib/campaign-run'

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

async function loadOwn(id: string, userId: string): Promise<CampaignRow | null> {
  const { data, error } = await getSupabaseAdmin().from('campaigns').select('*').eq('id', id).eq('user_id', userId).maybeSingle()
  if (error) console.warn('[campaigns] lookup failed:', error.message)
  return (data as CampaignRow | null) ?? null
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const campaign = await loadOwn(id, user.id)
  if (!campaign) return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 })

  const db = getSupabaseAdmin()
  const [upcoming, sent] = await Promise.all([
    db.from('posts').select('id, content, platforms, scheduled_at, media_urls')
      .eq('metadata->>campaign_id', id).eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true }).limit(50),
    db.from('posts').select('id, content, platforms, status, scheduled_at, published_at')
      .eq('metadata->>campaign_id', id).in('status', ['published', 'partial', 'failed'])
      .order('scheduled_at', { ascending: false }).limit(20),
  ])
  if (upcoming.error) console.warn('[campaigns] upcoming lookup failed:', upcoming.error.message)
  if (sent.error) console.warn('[campaigns] sent lookup failed:', sent.error.message)

  return NextResponse.json({ campaign, upcoming: upcoming.data ?? [], sent: sent.data ?? [] })
}

// { action: 'pause' | 'resume' | 'end' }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const campaign = await loadOwn(id, user.id)
  if (!campaign) return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 })

  const { action } = await req.json().catch(() => ({ action: null }))
  const db  = getSupabaseAdmin()
  const now = new Date()

  if (action === 'pause' || action === 'end') {
    if (campaign.status === 'ended') return NextResponse.json({ error: 'This campaign has already ended.' }, { status: 400 })
    if (action === 'pause' && campaign.status === 'paused') return NextResponse.json({ status: 'paused', removed: 0 })
    const removed = await removeUpcomingPosts(db, id)
    const status  = action === 'pause' ? 'paused' : 'ended'
    const { error } = await db.from('campaigns')
      .update({ status, materialized_until: null, last_note: null, updated_at: now.toISOString() })
      .eq('id', id)
    if (error) {
      console.error('[campaigns] status update failed:', error.message)
      return NextResponse.json({ error: 'Could not update the campaign. Try again.' }, { status: 500 })
    }
    return NextResponse.json({ status, removed })
  }

  if (action === 'resume') {
    if (campaign.status !== 'paused') return NextResponse.json({ error: 'Only a paused campaign can be resumed.' }, { status: 400 })
    if (localDayKey(now, campaign.timezone) > campaign.end_date) {
      return NextResponse.json({ error: 'This campaign is past its end date. Start a new one instead.' }, { status: 400 })
    }
    // Pick up from now: slots that passed while it was paused are skipped.
    const resumed = { ...campaign, status: 'active' as const, materialized_until: now.toISOString() }
    const { error } = await db.from('campaigns')
      .update({ status: 'active', materialized_until: resumed.materialized_until, updated_at: now.toISOString() })
      .eq('id', id)
    if (error) {
      console.error('[campaigns] resume failed:', error.message)
      return NextResponse.json({ error: 'Could not resume the campaign. Try again.' }, { status: 500 })
    }
    const topUp = await topUpCampaign(db, resumed, now, async items => {
      if (items.length) await inngest.send(items.map(p => ({ name: 'post/scheduled', data: p })))
    })
    return NextResponse.json({ status: 'active', created: topUp.created, note: topUp.note })
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
}
