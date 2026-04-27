export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

async function getUser() {
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
  return user
}

// GET /api/soma/projects/[id]/latest-ingestion
// Returns the most recent ingestion for this project so the diff result
// can be restored on page reload without re-submitting the doc.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ ingestion: null })

    const { id: projectId } = await params
    const admin = getSupabaseAdmin()

    const { data } = await admin
      .from('soma_weekly_ingestion')
      .select('id, is_diff, extracted_insights, week_label, created_at')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!data) return NextResponse.json({ ingestion: null })

    return NextResponse.json({
      ingestion: {
        ingestion_id:       data.id,
        is_diff:            data.is_diff,
        extracted_insights: data.extracted_insights,
        week_label:         data.week_label,
        created_at:         data.created_at,
      },
    })
  } catch (err) {
    console.error('[SOMA Latest Ingestion GET]', err)
    return NextResponse.json({ ingestion: null })
  }
}
