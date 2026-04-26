export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { link_id, user_id } = body

    if (!link_id || !user_id) {
      return NextResponse.json({ error: 'Missing link_id or user_id' }, { status: 400 })
    }

    const referrer = request.headers.get('referer') || null

    const db = getSupabaseAdmin()
    await db.from('bio_link_clicks').insert({
      link_id,
      user_id,
      referrer,
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Non-fatal — never block navigation
    return NextResponse.json({ ok: true })
  }
}
