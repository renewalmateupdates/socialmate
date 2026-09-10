import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Shared between /api/posts/publish (the Inngest/scheduled path) and
// /api/posts/create (the direct "Post Now" path) — these are two separate
// implementations of "a post just went live for this user" that used to
// duplicate this logic, and drifted: only one of them ever called it, so a
// user who clicked Post Now for an immediate publish (compose's actual Post
// Now path goes through /api/posts/create) never got the streak update or
// the first-post credit bonus at all. One function, called from both.

export async function updateStreak(userId: string) {
  try {
    const { data: settings } = await getSupabaseAdmin()
      .from('user_settings')
      .select('current_streak, longest_streak, last_post_date')
      .eq('user_id', userId)
      .single()

    const today     = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    const lastDate       = settings?.last_post_date
    const currentStreak  = settings?.current_streak ?? 0
    const longestStreak  = settings?.longest_streak ?? 0

    if (lastDate === today) return // Already posted today — no change

    const newStreak = lastDate === yesterday ? currentStreak + 1 : 1
    const newLongest = Math.max(newStreak, longestStreak)

    await getSupabaseAdmin()
      .from('user_settings')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_post_date: today,
      })
      .eq('user_id', userId)
  } catch (err) {
    console.error('Streak update error:', err)
  }
}

export async function handleFirstPostCredits(userId: string) {
  try {
    const { count } = await getSupabaseAdmin()
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'published')

    if (count === 1) {
      // earned_credits is one of the three real pools (monthly/earned/paid) that
      // deduct_ai_credits and the sidebar balance actually read. ai_credits_remaining
      // is a legacy fallback the balance only consults when monthly_credits_remaining
      // is NULL — never true for a modern account (see PR #595, same bug on the
      // onboarding bonus). Writing this bonus there made it invisible and unspendable.
      const { data: userSettings, error: settingsErr } = await getSupabaseAdmin()
        .from('user_settings')
        .select('earned_credits')
        .eq('user_id', userId)
        .maybeSingle()
      if (settingsErr) console.warn('[first-post-credit] settings lookup failed:', settingsErr.message)

      if (userSettings) {
        await getSupabaseAdmin()
          .from('user_settings')
          .update({ earned_credits: (userSettings.earned_credits ?? 0) + 10 })
          .eq('user_id', userId)

        // referred_by is a profiles column, not a user_settings one. It used
        // to be selected above, which 400'd the whole query — so userSettings
        // was null, this block never ran, and no referrer has ever been paid
        // the 10-credit first-post bonus.
        const { data: refProfile } = await getSupabaseAdmin()
          .from('profiles')
          .select('referred_by')
          .eq('id', userId)
          .maybeSingle()

        if (refProfile?.referred_by) {
          const { data: referrerSettings, error: referrerErr } = await getSupabaseAdmin()
            .from('user_settings')
            .select('earned_credits')
            .eq('user_id', refProfile.referred_by)
            .maybeSingle()
          if (referrerErr) console.warn('[first-post-credit] referrer settings lookup failed:', referrerErr.message)

          if (referrerSettings) {
            await getSupabaseAdmin()
              .from('user_settings')
              .update({ earned_credits: (referrerSettings.earned_credits ?? 0) + 10 })
              .eq('user_id', refProfile.referred_by)
          }
        }
      }
    }
  } catch (err) {
    console.error('First-post credit error:', err)
  }
}
