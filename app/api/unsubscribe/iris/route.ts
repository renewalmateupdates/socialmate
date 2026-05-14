import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.redirect(new URL('/unsubscribe/iris?error=1', req.url))
  }

  const admin = getSupabaseAdmin()

  // Look up user by email
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

  if (user) {
    await admin
      .from('user_settings')
      .update({ iris_opt_in: false })
      .eq('user_id', user.id)
  }

  return NextResponse.redirect(new URL(`/unsubscribe/iris?success=1&email=${encodeURIComponent(email)}`, req.url))
}
