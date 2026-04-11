export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── POST — join Enki waitlist ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, tier_interest } = body

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const db = getAdminSupabase()

  const { error } = await db.from('enki_waitlist').upsert(
    {
      name:          name?.trim() || null,
      email:         email.trim().toLowerCase(),
      tier_interest: tier_interest || 'citizen',
      source:        'website',
    },
    { onConflict: 'email', ignoreDuplicates: false }
  )

  if (error) {
    console.error('Enki waitlist error:', error.message)
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
