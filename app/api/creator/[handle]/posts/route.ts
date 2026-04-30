export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Public endpoint — returns paywalled post list for a creator handle
// content field is stripped; only included when access is verified separately
export async function GET(req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const supabase = getSupabaseAdmin()

  const { data: cm } = await supabase
    .from('creator_monetization')
    .select('id, workspace_id')
    .eq('page_handle', handle)
    .eq('stripe_onboarding_complete', true)
    .single()

  if (!cm) return NextResponse.json({ posts: [] })

  const { data: posts } = await supabase
    .from('creator_paywalled_posts')
    .select('id, title, preview, unlock_price_cents, created_at')
    .eq('creator_monetization_id', cm.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return NextResponse.json({ posts: posts ?? [] })
}
