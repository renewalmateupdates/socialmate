import { supabase } from '@/lib/supabase'

/**
 * Connecting an account is the activation event. Record it as one.
 *
 * `profiles.onboarding_completed` is the flag that decides whether someone is
 * allowed into the product at all — `app/dashboard/page.tsx` and
 * `app/auth/callback/route.ts` both send you back to /onboarding when it is
 * false, and nothing else lets you out. Until now the only two things that ever
 * set it were reaching onboarding step 5 and pressing the small grey
 * "Skip setup" link in the header.
 *
 * Neither of those is what a person actually does. OAuth connects open in a new
 * tab and the callback lands them on /accounts, so the sequence is: click
 * connect, complete OAuth, look at the accounts page showing the platform they
 * just linked, and never return to the onboarding tab sitting behind it. That
 * tab is the only thing that could have advanced them to step 5.
 *
 * Measured in production on 2 Sep: of the 18 accounts that have ever connected
 * a platform, 12 could not reach the dashboard. All 12 had zero posts, because
 * they had never once seen the inside of the product. The oldest had been stuck
 * since 17 April. It is the largest single reason no external user has ever
 * published.
 *
 * So: the moment a connection succeeds, the account is activated, wherever in
 * the app that happens. Onboarding still runs and still does the rest — display
 * name, goal, completion credits, starter post — when they get there. This only
 * guarantees the door stays open.
 *
 * Fire-and-forget by design. This is called from success handlers whose job is
 * to tell someone their account connected; it must never delay or break that.
 */
export async function markActivated(userId?: string | null): Promise<void> {
  try {
    const id = userId ?? (await supabase.auth.getUser()).data.user?.id
    if (!id) return

    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', id)

    // Never discard a Supabase error. If this write starts failing, it locks
    // every newly connected user out of the product again, silently, exactly
    // as it did for five months.
    if (error) console.error('[activation] could not mark activated:', error.message)
  } catch (err) {
    console.error('[activation] could not mark activated:', err)
  }
}
