export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getSupabaseAdmin()

  // Fetch the item first to verify ownership and get storage_path
  const { data: item, error: fetchError } = await admin
    .from('media_items')
    .select('id, user_id, storage_path')
    .eq('id', id)
    .single()

  if (fetchError || !item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  if (item.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Remove from storage
  if (item.storage_path) {
    const { error: storageError } = await admin.storage
      .from('media')
      .remove([item.storage_path])
    if (storageError) {
      console.error('[api/media/[id]] Storage remove error:', storageError)
      // Continue to delete DB record even if storage delete fails
    }
  }

  // Delete DB record
  const { error: dbError } = await admin
    .from('media_items')
    .delete()
    .eq('id', id)

  if (dbError) {
    console.error('[api/media/[id]] DB delete error:', dbError)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
