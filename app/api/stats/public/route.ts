export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 minutes cache

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const supabase = getSupabaseAdmin()

  const [settingsRes, postsRes] = await Promise.allSettled([
    supabase.from('user_settings').select('plan, white_label_tier'),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
  ])

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
    if (row.plan === 'agency') stats.agency++
    else if (row.plan === 'pro') stats.pro++
    else stats.free++

    if (row.white_label_tier) stats.white_label++
  }

  return NextResponse.json(stats)
}
