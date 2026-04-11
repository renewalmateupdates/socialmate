import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

/**
 * Returns the authenticated user if they are an admin, otherwise null.
 * Checks (1) ADMIN_EMAIL env var, (2) user_settings.is_admin column.
 * Always use this — never roll your own requireAdmin.
 */
export async function requireAdmin() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Primary: ADMIN_EMAIL env var
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email === adminEmail) return user

  // Fallback: user_settings.is_admin flag
  const { data: settings } = await getSupabaseAdmin()
    .from('user_settings')
    .select('is_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  return settings?.is_admin ? user : null
}
