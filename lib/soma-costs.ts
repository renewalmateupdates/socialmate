export const SOMA_COSTS = {
  generate_post:    5,
  generate_daily:   12,
  generate_week:    75,
  ingest_weekly:    25,
  identity_update:  15,
  autopilot_run:    50,
} as const

export type SomaActionType = keyof typeof SOMA_COSTS
