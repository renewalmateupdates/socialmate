export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 minutes cache

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { normalizePlan } from '@/lib/plan'

export async function GET() {
  const supabase = getSupabaseAdmin()

  // Deliberately counts every account, ours included. This is the raw "how many
  // accounts exist" number, not an activation rate, and the two surfaces that
  // show it publicly and internally must agree — the hub reading 106 against a
  // home page reading 110 was the actual defect here, not the 4 themselves.
  //
  // Activation ratios are the opposite case and still exclude us. See
  // /admin/funnel and /admin/overview, where counting our own accounts in a
  // numerator is what kept "1 user has ever published" alive for five months.
  const [settingsRes, postsRes] = await Promise.allSettled([
    supabase.from('user_settings').select('user_id, plan, white_label_tier'),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
  ])

  if (settingsRes.status === 'fulfilled' && settingsRes.value.error) {
    console.warn('[stats/public] settings query failed:', settingsRes.value.error.message)
  }
  if (postsRes.status === 'fulfilled' && postsRes.value.error) {
    console.warn('[stats/public] posts query failed:', postsRes.value.error.message)
  }

  const settingsData = settingsRes.status === 'fulfilled' ? (settingsRes.value.data ?? []) : []
  const postsCount  = postsRes.status === 'fulfilled'   ? (postsRes.value.count  ?? 0) : 0

  const stats = {
    free:         0,
    pro:          0,
    agency:       0,
    white_label:  0,
    total:        settingsData.length,
    posts_published: postsCount,
  }

  for (const row of settingsData) {
    // Bucket by tier, not by billing SKU — an exact-string match counted every
    // annual subscriber as a free user.
    const tier = normalizePlan(row.plan)
    if (tier === 'agency') stats.agency++
    else if (tier === 'pro') stats.pro++
    else stats.free++

    if (row.white_label_tier) stats.white_label++
  }

  return NextResponse.json(stats)
}
