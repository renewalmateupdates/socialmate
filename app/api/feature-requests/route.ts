export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, email } = await req.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

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
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[FeatureRequests]', err)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
