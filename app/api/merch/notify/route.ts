export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email || !email.includes('@')) return NextResponse.json({ error: 'Invalid email' }, { status: 400 })

  const db = getSupabaseAdmin()
  await db.from('merch_waitlist').upsert({ email: email.trim().toLowerCase(), created_at: new Date().toISOString() }, { onConflict: 'email' })
  return NextResponse.json({ success: true })
}
