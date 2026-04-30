export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// POST { email } — check if email has an active fan subscription for this creator
// Returns { hasAccess: true, posts: [...with content] } or { hasAccess: false }
export async function POST(req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const { email } = await req.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ hasAccess: false, error: 'email required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { data: cm } = await supabase
    .from('creator_monetization')
    .select('id, workspace_id')
    .eq('page_handle', handle)
    .eq('stripe_onboarding_complete', true)
    .single()

  if (!cm) return NextResponse.json({ hasAccess: false })

  // Check active fan subscription by email
  const { data: sub } = await supabase
    .from('creator_fan_subscriptions')
    .select('id, status')
    .eq('creator_monetization_id', cm.id)
    .eq('subscriber_email', email.toLowerCase().trim())
    .eq('status', 'active')
    .maybeSingle()

  if (!sub) return NextResponse.json({ hasAccess: false })

  // Return full content for all paywalled posts
  const { data: posts } = await supabase
    .from('creator_paywalled_posts')
    .select('id, title, preview, content, unlock_price_cents, created_at')
    .eq('creator_monetization_id', cm.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return NextResponse.json({ hasAccess: true, posts: posts ?? [] })
}
