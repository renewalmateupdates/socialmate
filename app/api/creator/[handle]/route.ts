import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { resolveWorkspacePlan } from '@/lib/plan'

export async function GET(req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const supabase = getSupabaseAdmin()

  const { data: creator } = await supabase
    .from('creator_monetization')
    .select('workspace_id, page_handle, page_title, page_bio, avatar_url, tip_enabled, tip_min, tip_max, subscription_enabled, subscription_price, subscription_name, subscription_description')
    .eq('page_handle', handle)
    .eq('stripe_onboarding_complete', true)
    .single()

  if (!creator) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Monetization only stays live while the creator's own plan is active —
  // downgrading (cancellation reaching term, failed renewal) pauses the tip
  // jar and fan subscriptions without touching their saved on/off preference,
  // so it resumes automatically if they resubscribe.
  const { workspace_id, ...rest } = creator
  const plan = await resolveWorkspacePlan(supabase, '', workspace_id as string)
  const isPaused = plan === 'free'

  return NextResponse.json({
    creator: {
      ...rest,
      tip_enabled: isPaused ? false : rest.tip_enabled,
      subscription_enabled: isPaused ? false : rest.subscription_enabled,
    },
  })
}
