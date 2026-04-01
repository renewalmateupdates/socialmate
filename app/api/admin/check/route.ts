export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(list: { name: string; value: string; options?: any }[]) {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    const adminEmail = process.env.ADMIN_EMAIL || 'socialmatehq@gmail.com'
    const isAdmin = !!(user && user.email === adminEmail)
    return NextResponse.json({ isAdmin, email: isAdmin ? user?.email : null })
  } catch {
    return NextResponse.json({ isAdmin: false })
  }
}
