export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const admin = getSupabaseAdmin()

  const { data: link } = await admin
    .from('short_links')
    .select('id, original_url, clicks')
    .eq('slug', slug)
    .single()

  if (!link) {
    return NextResponse.redirect(new URL('/?link_not_found=1', 'https://socialmate.studio'), { status: 302 })
  }

  // Increment click counter (non-fatal)
  await admin
    .from('short_links')
    .update({ clicks: link.clicks + 1 })
    .eq('id', link.id)

  return NextResponse.redirect(link.original_url, { status: 302 })
}
