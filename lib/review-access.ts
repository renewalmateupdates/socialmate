import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { requireAdmin } from '@/lib/admin-auth'
import { isMetaReviewerEmail, metaConnectOpen } from '@/lib/meta'
import { isYouTubeReviewerEmail, youtubeConnectOpen } from '@/lib/youtube'

/**
 * Who may start a connect for a platform that is built but still waiting on the
 * platform's own review (Meta App Review for Instagram/Facebook/Threads, Google
 * verification for YouTube). Before approval the platform refuses anyone
 * without a role on the app, so the button and the route are limited to the
 * admin and the reviewer test logins; after approval an env flag opens it to
 * everyone. Server-only: the connect routes and /api/accounts/review-access
 * share these functions, so a shown button always matches what the route does.
 */
async function canConnectBeforeReview(
  open: boolean,
  isReviewer: (email: string | null | undefined) => boolean,
): Promise<boolean> {
  if (open) return true

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
    console.warn('[review-access] getUser failed:', error.message)
  }
  if (!user) return false
  if (isReviewer(user.email)) return true

  return Boolean(await requireAdmin())
}

/** Instagram, Facebook and Threads: META_CONNECT_OPEN, the admin, or META_REVIEWER_EMAILS. */
export function canConnectMeta(): Promise<boolean> {
  return canConnectBeforeReview(metaConnectOpen(), isMetaReviewerEmail)
}

/** YouTube: YOUTUBE_CONNECT_OPEN, the admin, or YOUTUBE_REVIEWER_EMAILS. */
export function canConnectYouTube(): Promise<boolean> {
  return canConnectBeforeReview(youtubeConnectOpen(), isYouTubeReviewerEmail)
}
