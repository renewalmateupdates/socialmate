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

// GET — fetch last 20 notifications for the current user
export async function GET() {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  // Return empty list (not 401) so polling never inflates the Vercel error rate
  if (!user) return NextResponse.json({ notifications: [] })

  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, message, action_url, read, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notifications: data ?? [] })
}

// PATCH — mark one or all notifications as read
export async function PATCH(req: NextRequest) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) // PATCH requires auth

  const body = await req.json()
  const { id, markAllRead } = body

  if (markAllRead) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (id) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Provide id or markAllRead: true' }, { status: 400 })
}
