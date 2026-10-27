export const dynamic = 'force-dynamic'
// Creating a campaign with rewording makes one model call (up to 30s).
export const maxDuration = 60
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { inngest } from '@/lib/inngest'
import { resolveWorkspacePlan } from '@/lib/plan'
import { deductAiCredits, refundAiCredits, type CreditSplit } from '@/lib/ai-credits'
import { CAMPAIGN_REWORD_COST } from '@/lib/ai-tool-costs'
import { isValidTimeZone, localDayKey, validateCampaign } from '@/lib/campaigns'
import { campaignWorkspace } from '@/lib/campaign-access'
import { writeVariants } from '@/lib/campaign-variants'
import { topUpCampaign, type CampaignRow } from '@/lib/campaign-run'
import { recordUsage } from '@/lib/usage'

async function sessionClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
}

// Credits are taken monthly first, then earned, then purchased. A partial
// refund gives back the most valuable pool first.
function refundShare(split: CreditSplit, amount: number): CreditSplit {
  const paid    = Math.min(split.paid, amount)
  const earned  = Math.min(split.earned, amount - paid)
  const monthly = Math.min(split.monthly, amount - paid - earned)
  return { monthly, earned, paid }
}

export async function GET() {
  const supabase = await sessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getSupabaseAdmin()
  const { data: campaigns, error } = await db.from('campaigns')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) {
    console.error('[campaigns] list failed:', error.message)
    return NextResponse.json({ error: 'Could not load your campaigns.' }, { status: 500 })
  }

  // Next post for each, in one query.
  const ids = (campaigns ?? []).map(c => c.id)
  const nextPost: Record<string, string> = {}
  if (ids.length) {
    const { data: upcoming, error: upErr } = await db.from('posts')
      .select('scheduled_at, metadata')
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
      .in('metadata->>campaign_id', ids)
      .order('scheduled_at', { ascending: true })
      .limit(500)
    if (upErr) console.warn('[campaigns] upcoming lookup failed:', upErr.message)
    for (const p of upcoming ?? []) {
      const id = (p.metadata as { campaign_id?: string } | null)?.campaign_id
      if (id && !nextPost[id]) nextPost[id] = p.scheduled_at as string
    }
  }

  return NextResponse.json({
    campaigns: (campaigns ?? []).map(c => ({ ...c, next_post_at: nextPost[c.id] ?? null })),
  })
}

export async function POST(req: NextRequest) {
  const supabase = await sessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Nothing was sent.' }, { status: 400 })

  const db = getSupabaseAdmin()
  const ws = await campaignWorkspace(db, user, body.workspaceId)
  if (!ws.ok) return NextResponse.json({ error: ws.error }, { status: ws.status })

  const plan = await resolveWorkspacePlan(db, user.id, ws.workspaceId)
  const { data: accounts, error: accErr } = await db.from('connected_accounts').select('platform').eq('user_id', user.id)
  if (accErr) console.warn('[campaigns] connected accounts lookup failed:', accErr.message)
  const connected = Array.from(new Set((accounts ?? []).map(a => a.platform as string)))

  const now   = new Date()
  const today = localDayKey(now, isValidTimeZone(body.timezone) ? body.timezone : 'UTC')
  const check = validateCampaign(body, { today, paidPlan: plan !== 'free', connected })
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 })
  let messages = check.value.messages

  // Rewording: charge first (the charge is the gate), give back what was not delivered.
  let charged = 0
  let split: CreditSplit | null = null
  if (body.reword === true) {
    const cost = CAMPAIGN_REWORD_COST * messages.length
    const deduct = await deductAiCredits(supabase, user.id, cost, 'campaign_reword')
    if (!deduct.ok) {
      if (deduct.reason === 'insufficient') {
        return NextResponse.json({
          error: `Rewording costs ${cost} credits and you have ${deduct.total}. Turn rewording off, or use fewer messages.`,
          creditsRequired: cost,
          creditsRemaining: deduct.total,
        }, { status: 402 })
      }
      return NextResponse.json({ error: 'Could not check your credits. Try again in a minute.' }, { status: 500 })
    }
    split = { monthly: deduct.monthly, earned: deduct.earned, paid: deduct.paid }
    charged = cost

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      await refundAiCredits(supabase, user.id, split)
      return NextResponse.json({ error: 'Rewording is not available right now. Nothing was charged.' }, { status: 500 })
    }
    const result = await writeVariants(apiKey, messages, check.value.platforms)
    if (!result.ok) {
      await refundAiCredits(supabase, user.id, split)
      return NextResponse.json({ error: `${result.error} Nothing was charged.` }, { status: 502 })
    }
    messages = result.messages
    const undelivered = (messages.length - result.rewordedCount) * CAMPAIGN_REWORD_COST
    if (undelivered > 0) {
      const back = refundShare(split, undelivered)
      await refundAiCredits(supabase, user.id, back)
      split = { monthly: split.monthly - back.monthly, earned: split.earned - back.earned, paid: split.paid - back.paid }
      charged -= undelivered
    }
  }

  const { data: row, error: insertErr } = await db.from('campaigns').insert({
    user_id:      user.id,
    workspace_id: ws.workspaceId,
    name:         check.value.name,
    status:       'active',
    platforms:    check.value.platforms,
    days:         check.value.days,
    times:        check.value.times,
    timezone:     check.value.timezone,
    start_date:   check.value.start_date,
    end_date:     check.value.end_date,
    messages,
    reworded:     charged > 0,
  }).select('*').single()
  if (insertErr || !row) {
    console.error('[campaigns] insert failed:', insertErr?.message)
    if (split && charged > 0) await refundAiCredits(supabase, user.id, split)
    return NextResponse.json({ error: 'Could not save the campaign. Nothing was charged.' }, { status: 500 })
  }

  const topUp = await topUpCampaign(db, row as CampaignRow, now, async items => {
    if (items.length) await inngest.send(items.map(p => ({ name: 'post/scheduled', data: p })))
  })

  recordUsage(db, user.id, 'campaign_created', {
    campaign_id: row.id,
    platforms:   check.value.platforms.join(','),
    messages:    messages.length,
    reworded:    charged > 0,
    first_week:  topUp.created,
  })

  return NextResponse.json({ id: row.id, created: topUp.created, note: topUp.note, charged })
}
