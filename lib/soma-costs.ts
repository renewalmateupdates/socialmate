import type { PlanTier } from './plan'

export const SOMA_COSTS = {
  generate_post:    5,
  generate_daily:   12,
  generate_week:    75,
  ingest_weekly:    25,
  identity_update:  15,
  autopilot_run:    50,
} as const

export type SomaActionType = keyof typeof SOMA_COSTS

/**
 * SOMA's own monthly credits, separate from the AI credits the other tools use.
 * Purchased SOMA credits sit on top and never reset.
 *
 * This used to be two numbers: the credits API granted 500 / 2,000 the first
 * time a workspace loaded SOMA, and the 1st-of-month reset set 1,000 / 5,000.
 * A workspace's allowance depended on which one ran last. The API, the reset
 * and the /soma page all read this now.
 */
export const SOMA_MONTHLY_CREDITS: Record<PlanTier, number> = {
  free:   0,
  pro:    500,
  agency: 2000,
}

/** One full weekly run: read the master doc, then generate the posts. */
export const SOMA_FULL_RUN_COST = SOMA_COSTS.ingest_weekly + SOMA_COSTS.generate_week
