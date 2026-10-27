// What the dedicated AI routes charge, shared with the screens that quote the price.
// These went to 5 and 10 credits on May 1, 2026, and Compose kept telling people
// 1 and 5 for months afterwards because each side had its own copy of the number.
export const HASHTAGS_COST = 5
export const REPURPOSE_COST = 10
// Per message, charged once when a campaign is created with rewording on. One
// model call writes every message's rewrites (lib/campaign-variants.ts).
export const CAMPAIGN_REWORD_COST = 2
