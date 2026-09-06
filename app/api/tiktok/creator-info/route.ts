export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getValidAccessToken } from '@/lib/tiktok-auth'

/**
 * What this creator's TikTok account will and will not allow.
 *
 * TikTok's content sharing audit is largely a check that the posting UI honours
 * this response rather than inventing its own options. It was being fetched and
 * then discarded — the studio read the avatar and the name and nothing else —
 * so the privacy list was hardcoded, the duration cap was a constant, and the
 * duet/stitch/comment toggles moved freely even for creators whose account has
 * them switched off.
 *
 * Returned as explicit fields rather than a passthrough blob, so a missing one
 * is visible here instead of silently undefined three layers up.
 */

interface CreatorInfo {
  creator_avatar_url?: string
  creator_username?: string
  creator_nickname?: string
  privacy_level_options?: string[]
  comment_disabled?: boolean
  duet_disabled?: boolean
  stitch_disabled?: boolean
  max_video_post_duration_sec?: number
}

// Only used when TikTok cannot be reached. Deliberately the most restrictive
// reading: no privacy option is assumed available, so the UI asks rather than
// guesses, and interactions are treated as off rather than on.
const CONSERVATIVE: Required<Pick<CreatorInfo,
  'privacy_level_options' | 'comment_disabled' | 'duet_disabled' | 'stitch_disabled' | 'max_video_post_duration_sec'>> = {
  privacy_level_options: [],
  comment_disabled: true,
  duet_disabled: true,
  stitch_disabled: true,
  max_video_post_duration_sec: 600,
}

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ connected: false })

  const { data: account, error } = await getSupabaseAdmin()
    .from('connected_accounts')
    .select('account_name, profile_image_url, platform_user_id')
    .eq('user_id', user.id)
    .eq('platform', 'tiktok')
    .maybeSingle()

  if (error) console.warn('[tiktok/creator-info] account lookup failed:', error.message)
  if (!account) return NextResponse.json({ connected: false })

  // Shared helper rather than a second copy of the refresh logic. The copy that
  // used to live here carried the same bug: it only refreshed when expires_at
  // was set, so a row without one presented a dead token forever.
  const auth = await getValidAccessToken(user.id)
  if (!auth.ok) {
    return NextResponse.json({
      connected: true,
      account_name: account.account_name,
      avatar_url:   account.profile_image_url,
      open_id:      account.platform_user_id,
      creator_info: CONSERVATIVE,
      info_error:   auth.message,
    })
  }

  let info: CreatorInfo | null = null
  try {
    const res = await fetch('https://open.tiktokapis.com/v2/post/publish/creator_info/query/', {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${auth.token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      info = (data?.data ?? null) as CreatorInfo | null
    } else {
      console.warn('[tiktok/creator-info] query failed:', res.status, (await res.text().catch(() => '')).slice(0, 200))
    }
  } catch (err) {
    console.warn('[tiktok/creator-info] query threw (non-fatal):', err)
  }

  return NextResponse.json({
    connected:    true,
    // TikTok's own nickname is the name the audit expects to see on the screen.
    account_name: info?.creator_nickname || account.account_name,
    avatar_url:   info?.creator_avatar_url || account.profile_image_url,
    username:     info?.creator_username ?? null,
    open_id:      account.platform_user_id,
    creator_info: {
      privacy_level_options:       info?.privacy_level_options ?? CONSERVATIVE.privacy_level_options,
      comment_disabled:            info?.comment_disabled ?? CONSERVATIVE.comment_disabled,
      duet_disabled:               info?.duet_disabled ?? CONSERVATIVE.duet_disabled,
      stitch_disabled:             info?.stitch_disabled ?? CONSERVATIVE.stitch_disabled,
      max_video_post_duration_sec: info?.max_video_post_duration_sec ?? CONSERVATIVE.max_video_post_duration_sec,
    },
    // Tells the client whether the values above are TikTok's answer or our
    // fallback, so it can say "we could not reach TikTok" instead of showing
    // an empty privacy list as though the account had no options.
    info_ok: info !== null,
  })
}
