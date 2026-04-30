export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

async function makeClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
}

// GET — list paywalled posts for creator (owner only)
export async function GET(req: NextRequest) {
  try {
    const supabase = await makeClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const workspaceId = req.nextUrl.searchParams.get('workspace_id')
    if (!workspaceId) return NextResponse.json({ error: 'workspace_id required' }, { status: 400 })

    const admin = getSupabaseAdmin()
    const { data: posts, error } = await admin
      .from('creator_paywalled_posts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ posts: posts ?? [] })
  } catch (err) {
    console.error('[monetize/paywalled-posts GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — create a paywalled post
export async function POST(req: NextRequest) {
  try {
    const supabase = await makeClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { workspace_id, title, preview, content, unlock_price_cents } = await req.json()
    if (!workspace_id || !title?.trim() || !preview?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'title, preview, and content are required' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    // Get creator_monetization_id
    const { data: cm } = await admin
      .from('creator_monetization')
      .select('id, stripe_onboarding_complete')
      .eq('workspace_id', workspace_id)
      .single()

    if (!cm?.stripe_onboarding_complete) {
      return NextResponse.json({ error: 'Connect Stripe before creating paywalled posts.' }, { status: 400 })
    }

    const { data: post, error } = await admin
      .from('creator_paywalled_posts')
      .insert({
        workspace_id,
        creator_monetization_id: cm.id,
        title: title.trim(),
        preview: preview.trim(),
        content: content.trim(),
        unlock_price_cents: unlock_price_cents ? parseInt(unlock_price_cents) : null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ post })
  } catch (err) {
    console.error('[monetize/paywalled-posts POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — remove a paywalled post
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await makeClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const admin = getSupabaseAdmin()
    const { error } = await admin
      .from('creator_paywalled_posts')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[monetize/paywalled-posts DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
