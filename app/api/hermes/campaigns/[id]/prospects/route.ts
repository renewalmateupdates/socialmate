export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getHermesAccess, HERMES_LIMITS, prospectsAddedThisMonth } from '@/lib/hermes-access'

async function getUser() {
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
  return supabase.auth.getUser()
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: campaign_id } = await params
  const { data: { user } } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const access = await getHermesAccess(getSupabaseAdmin(), user.id, user.email)
  if (!access.allowed) return NextResponse.json({ error: 'HERMES is not active on your account' }, { status: 403 })

  // Verify campaign ownership
  const supabase = getSupabaseAdmin()
  const { data: campaign } = await supabase
    .from('hermes_campaigns')
    .select('id')
    .eq('id', campaign_id)
    .eq('user_id', user.id)
    .single()
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

  const body = await req.json()
  const { name, email, bluesky_handle, mastodon_handle, company, notes } = body
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  // Advertised on /hermes as "75/400 prospects/month" — applies across
  // manual adds and Discover imports combined, since both write this table.
  const limit = HERMES_LIMITS[access.tier!].prospectsPerMonth
  if (limit !== Infinity) {
    const addedSoFar = await prospectsAddedThisMonth(supabase, user.id)
    if (addedSoFar >= limit) {
      return NextResponse.json({ error: `You've hit your ${limit} prospects/month cap. Resets next month, or upgrade for more.` }, { status: 429 })
    }
  }

  const { data, error } = await supabase
    .from('hermes_prospects')
    .insert({
      campaign_id,
      user_id: user.id,
      name: name.trim(),
      email: email?.trim() || null,
      bluesky_handle: bluesky_handle?.trim() || null,
      mastodon_handle: mastodon_handle?.trim() || null,
      company: company?.trim() || null,
      notes: notes?.trim() || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ prospect: data })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: campaign_id } = await params
  const { data: { user } } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const access = await getHermesAccess(getSupabaseAdmin(), user.id, user.email)
  if (!access.allowed) return NextResponse.json({ error: 'HERMES is not active on your account' }, { status: 403 })

  const { prospect_id } = await req.json()
  if (!prospect_id) return NextResponse.json({ error: 'prospect_id required' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('hermes_prospects')
    .delete()
    .eq('id', prospect_id)
    .eq('campaign_id', campaign_id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
