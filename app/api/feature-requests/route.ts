export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { message, email } = await req.json()

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Missing message' }, { status: 400 })
  }

  // Use a simple fetch to Supabase REST API to avoid needing server client cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const res = await fetch(`${supabaseUrl}/rest/v1/feature_requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      message: message.trim(),
      email: email?.trim() || null,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('feature_requests insert error:', text)
    // Return success anyway so UX is not broken if table doesn't exist yet
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: true })
}
