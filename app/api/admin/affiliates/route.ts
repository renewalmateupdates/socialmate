export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/admin-auth'

// GET /api/admin/affiliates
// The partner list for the "Affiliate" dropdown in /admin/coupons, which ties a
// code to a partner so they earn on it. The page has always fetched this path,
// but the route was never written, so the dropdown was always empty and no
// code could be given to a partner.
//
// Emails come from affiliate_profiles: `affiliates` has no email column.
export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = getSupabaseAdmin()
  const [{ data: affiliates, error }, { data: profiles, error: profErr }] = await Promise.all([
    db.from('affiliates').select('id, user_id, full_name, status').order('created_at', { ascending: false }),
    db.from('affiliate_profiles').select('user_id, email, full_name'),
  ])
  if (error) {
    console.warn('[admin/affiliates] list failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (profErr) console.warn('[admin/affiliates] profile lookup failed:', profErr.message)

  const profileByUser = new Map((profiles ?? []).map(p => [p.user_id, p]))
  return NextResponse.json({
    affiliates: (affiliates ?? []).map(a => {
      const profile = profileByUser.get(a.user_id)
      return {
        id:        a.id,
        full_name: a.full_name || profile?.full_name || null,
        email:     profile?.email ?? '',
        status:    a.status,
      }
    }),
  })
}
