import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { requireAdmin } from '@/lib/admin-auth'
import { isMetaReviewerEmail, metaConnectOpen } from '@/lib/meta'

/**
 * Whether the signed-in person may start an Instagram, Facebook or Threads
 * connect. Everyone once META_CONNECT_OPEN is set after App Review; until then
 * the admin and the reviewer test logins in META_REVIEWER_EMAILS. Server-only:
 * the connect routes and /api/meta/access both use it, so the button and the
 * route always agree.
 */
export async function canConnectMeta(): Promise<boolean> {
  if (metaConnectOpen()) return true

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
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error && error.name !== 'AuthSessionMissingError') {
    console.warn('[meta-access] getUser failed:', error.message)
  }
  if (!user) return false
  if (isMetaReviewerEmail(user.email)) return true

  return Boolean(await requireAdmin())
}
