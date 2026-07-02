export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// ── GET — admin: view all survey responses ────────────────────────────────────
export async function GET(_req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await getSupabaseAdmin()
    .from('user_survey_responses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ responses: data ?? [] })
}

// ── POST — submit survey response ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reason, suggest } = await req.json()
  if (!reason?.trim()) return NextResponse.json({ error: 'Missing reason' }, { status: 400 })

  const rows = [
    { user_id: user.id, question_key: 'keep_coming_back', answer: reason.trim() },
  ]
  if (suggest?.trim()) {
    rows.push({ user_id: user.id, question_key: 'recommend_if', answer: suggest.trim() })
  }

  const { error } = await getSupabaseAdmin()
    .from('user_survey_responses')
    .insert(rows)

  if (error) {
    console.error('Survey insert error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
