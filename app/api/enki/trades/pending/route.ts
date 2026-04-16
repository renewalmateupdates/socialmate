export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: async (cookiesToSet) => {
          const store = await cookies()
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options))
        },
      },
    }
  )
}

// GET — fetch pending_approval trades for current user
export async function GET(_req: NextRequest) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ trades: [] })

  const { data, error } = await supabase
    .from('enki_trades')
    .select('id, doctrine_id, broker, symbol, side, qty, price, reason, confidence, status, created_at')
    .eq('user_id', user.id)
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ trades: data ?? [] })
}

// PATCH — approve or reject a pending trade
export async function PATCH(req: NextRequest) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { id?: string; action?: 'approve' | 'reject' }
  const { id, action } = body

  if (!id || !action || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Missing or invalid id / action' }, { status: 400 })
  }

  const newStatus = action === 'approve' ? 'filled' : 'cancelled'

  const { error } = await supabase
    .from('enki_trades')
    .update({ status: newStatus })
    .eq('id', id)
    .eq('user_id', user.id) // RLS safety belt

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
