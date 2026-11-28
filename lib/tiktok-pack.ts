/**
 * The TikTok pack: scheduled TikTok videos past the month's allowance, bought
 * once (Nov 28, 2026).
 *
 * TikTok stays free. Joshua: "I dont want to make tiktok a pro feature". Post
 * now and Send to drafts are never refused at the monthly count (TODO.md,
 * Decided Nov 27), because they go from the creator's browser straight to
 * TikTok and cost nothing. A scheduled video is different: it waits in our
 * storage until TikTok pulls it, which costs storage and bandwidth. That is
 * what the monthly count bounds (PLAN_TIKTOK_VIDEOS in lib/plan.ts), and what
 * a pack extends.
 *
 * How the videos are kept:
 * - workspaces.tiktok_booster_credits, on the owner's personal workspace, holds
 *   the videos left in their packs. Packs stack and never expire.
 * - A video scheduled while the month's allowance lasts counts against the
 *   month (tiktok_videos_this_month), as before. One scheduled after that takes
 *   a pack video instead, is marked tiktok_posts.used_pack_video, and does not
 *   count against the month.
 * - Cancelling a scheduled video, or TikTok refusing it when it is sent, gives
 *   back what it took: the pack video if it used one, the month's slot if not.
 *
 * Checkout builds the price from TIKTOK_PACK (Stripe price_data), so the
 * checkout and every page that names the price read this one constant, and
 * there is no Stripe Price to keep in step with it.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export const TIKTOK_PACK = {
  videos:     20,
  priceCents: 199,
} as const

/** "$1.99" */
export const TIKTOK_PACK_PRICE = `$${(TIKTOK_PACK.priceCents / 100).toFixed(2)}`

/** The Checkout Session metadata type the Stripe webhook credits. */
export const TIKTOK_PACK_TYPE = 'tiktok_pack'

export type TiktokAllowance = {
  /** Whether one more video may be scheduled. */
  allowed:   boolean
  /** True when it takes a pack video rather than one of the month's. */
  usesPack:  boolean
  /** The month's videos left before this one. */
  monthLeft: number
}

/** Whether one more scheduled video fits, and what it uses. */
export function tiktokAllowance(monthly: number, usedThisMonth: number, packVideos: number): TiktokAllowance {
  const monthLeft = Math.max(0, monthly - Math.max(0, usedThisMonth))
  if (monthLeft > 0) return { allowed: true, usesPack: false, monthLeft }
  if (packVideos > 0) return { allowed: true, usesPack: true, monthLeft: 0 }
  return { allowed: false, usesPack: false, monthLeft: 0 }
}

/**
 * The month's count as of `now`. A count last reset in an earlier month is 0,
 * which is how the routes that write it reset it. In UTC: the routes store the
 * reset as a UTC date, and a local reading puts Nov 1 in October anywhere west
 * of London.
 */
export function usedThisMonth(
  count: number | null | undefined,
  resetAt: string | null | undefined,
  now: Date = new Date(),
): number {
  const reset = resetAt ? new Date(resetAt) : new Date(0)
  if (reset.getUTCMonth() !== now.getUTCMonth() || reset.getUTCFullYear() !== now.getUTCFullYear()) return 0
  return Math.max(0, count ?? 0)
}

/**
 * The pack size a TikTok pack Checkout Session paid for, or null. The webhook
 * credits what was bought, so a later change to TIKTOK_PACK never changes an
 * old purchase.
 */
export function packVideosFromMetadata(metadata: Record<string, string> | null | undefined): number | null {
  if (metadata?.type !== TIKTOK_PACK_TYPE) return null
  const videos = Number(metadata.videos)
  return Number.isInteger(videos) && videos > 0 && videos <= 1000 ? videos : null
}

/** What a creator is told when the month's videos and their pack are used up. */
export function packOfferMessage(monthly: number, planName: string): string {
  return `You've used this month's ${monthly} TikTok videos on the ${planName} plan, so scheduling is paused ` +
    `until the 1st. Post now still works. Or add ${TIKTOK_PACK.videos} scheduled videos for ` +
    `${TIKTOK_PACK_PRICE}; they never expire.`
}

/**
 * Takes one pack video, only while the balance is still what the caller read,
 * so two requests can't spend the same video. False when it changed or failed.
 */
export async function takePackVideo(db: SupabaseClient, workspaceId: string, balance: number): Promise<boolean> {
  const { data, error } = await db
    .from('workspaces')
    .update({ tiktok_booster_credits: balance - 1 })
    .eq('id', workspaceId)
    .eq('tiktok_booster_credits', balance)
    .select('id')
  if (error) console.error('[tiktok-pack] could not take a pack video:', error.message)
  return !error && (data?.length ?? 0) > 0
}

/**
 * Gives one pack video back, for a scheduled video that used one and then was
 * cancelled or refused. Logs and carries on if it fails: the caller has already
 * done what the person asked.
 */
export async function givePackVideoBack(db: SupabaseClient, userId: string, label: string): Promise<void> {
  const { data: ws, error } = await db
    .from('workspaces')
    .select('id, tiktok_booster_credits')
    .eq('owner_id', userId)
    .eq('is_personal', true)
    .limit(1)
    .maybeSingle()
  if (error || !ws) {
    console.error(`[${label}] could not read the TikTok pack to give a video back:`, error?.message ?? 'no personal workspace')
    return
  }
  const { error: backErr } = await db
    .from('workspaces')
    .update({ tiktok_booster_credits: (ws.tiktok_booster_credits ?? 0) + 1 })
    .eq('id', ws.id)
  if (backErr) console.error(`[${label}] could not give the TikTok pack video back:`, backErr.message)
}
