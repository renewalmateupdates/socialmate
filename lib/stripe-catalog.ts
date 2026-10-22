// What every live Stripe price on the Gilgamesh Enterprise account is, for
// reporting (/admin/hq). Source of truth for the IDs: the "Stripe Live Price
// IDs" table in CLAUDE.md. The webhook keeps its own copies for behaviour;
// this file only labels money, so a missing price shows up as "Other" rather
// than breaking anything.

export type RevenueGroup =
  | 'SocialMate plans'
  | 'Add-ons'
  | 'Credits & boosters'
  | 'Studio Stax'
  | 'Merch'
  | 'Donations'
  | 'Enki'
  | 'Other'

interface PriceInfo { label: string; group: RevenueGroup }

const PRICES: Record<string, PriceInfo> = {
  // Plans (current and legacy; legacy stays mapped for old subscriptions)
  price_1U3jSI7OMwDowUuUm0oMEpiT: { label: 'Pro monthly',           group: 'SocialMate plans' },
  price_1U3jSJ7OMwDowUuUjK3igDLr: { label: 'Agency monthly',        group: 'SocialMate plans' },
  price_1U3jSJ7OMwDowUuUO3utSP0R: { label: 'Pro annual',            group: 'SocialMate plans' },
  price_1U3jSJ7OMwDowUuUTMLaC9Fu: { label: 'Agency annual',         group: 'SocialMate plans' },
  price_1T9S2v7OMwDowUuULHznqUD5: { label: 'Pro monthly (legacy)',  group: 'SocialMate plans' },
  price_1TFMHp7OMwDowUuUgeLAeJNY: { label: 'Agency monthly (legacy)', group: 'SocialMate plans' },
  price_1TFMHx7OMwDowUuUl9PqWxMs: { label: 'Pro annual (legacy)',   group: 'SocialMate plans' },
  price_1TFMI07OMwDowUuUoHfKJEpo: { label: 'Agency annual (legacy)', group: 'SocialMate plans' },
  // Add-ons
  price_1TFMHt7OMwDowUuU56Fzw4fE: { label: 'White Label Basic',     group: 'Add-ons' },
  price_1TFMIG7OMwDowUuUcjNNGB0Q: { label: 'White Label Pro',       group: 'Add-ons' },
  price_1UEHaA7OMwDowUuUJ2OA4jic: { label: 'HERMES Starter',        group: 'Add-ons' },
  price_1UEHcB7OMwDowUuUFwqE1Hk6: { label: 'HERMES Pro',            group: 'Add-ons' },
  price_1TP8rU7OMwDowUuUYLBNAVux: { label: 'SOMA Autopilot',        group: 'Add-ons' },
  price_1TPlGE7OMwDowUuUWS0QUnLw: { label: 'SOMA Full Send',        group: 'Add-ons' },
  // One-time packs
  price_1TFMI47OMwDowUuUhTrbe3oq: { label: 'AI credits 100',        group: 'Credits & boosters' },
  price_1TFMI77OMwDowUuU0wDZWcCL: { label: 'AI credits 300',        group: 'Credits & boosters' },
  price_1TFMIA7OMwDowUuUwI3SEGCR: { label: 'AI credits 750',        group: 'Credits & boosters' },
  price_1TFMID7OMwDowUuU2sQgbIx9: { label: 'AI credits 2000',       group: 'Credits & boosters' },
  price_1TOK9u7OMwDowUuUlgZPUwLZ: { label: 'X Booster Spark',       group: 'Credits & boosters' },
  price_1TOKAH7OMwDowUuUn6pcSTQd: { label: 'X Booster Boost',       group: 'Credits & boosters' },
  price_1TOKBv7OMwDowUuUsykwyuUa: { label: 'X Booster Surge',       group: 'Credits & boosters' },
  price_1TOKCg7OMwDowUuU2PEzonf6: { label: 'X Booster Storm',       group: 'Credits & boosters' },
  price_1TRx227OMwDowUuU8IRlxaRh: { label: 'SOMA credits 75',       group: 'Credits & boosters' },
  price_1TRx2U7OMwDowUuU5ZqeMu6a: { label: 'SOMA credits 225',      group: 'Credits & boosters' },
  price_1TRx2w7OMwDowUuU4t8lMMwe: { label: 'SOMA credits 500',      group: 'Credits & boosters' },
  // Studio Stax (checkout uses price_data; these are the recurring prices)
  price_1TP8wi7OMwDowUuUNQW7ER95: { label: 'Studio Stax Founding',  group: 'Studio Stax' },
  price_1TP8xG7OMwDowUuUO05Vh1Kq: { label: 'Studio Stax Standard',  group: 'Studio Stax' },
  // Donations
  price_1TFMIJ7OMwDowUuUj5amigA0: { label: 'Donation $5',           group: 'Donations' },
  price_1TFMIM7OMwDowUuUcmN2hPwT: { label: 'Donation $10',          group: 'Donations' },
  price_1TFMIQ7OMwDowUuUfdZXeATH: { label: 'Donation $25',          group: 'Donations' },
  price_1TFMIT7OMwDowUuUHgqWqtUZ: { label: 'Donation $50',          group: 'Donations' },
  // Enki (wound down; kept so any remaining payment is labelled)
  price_1TMthL7OMwDowUuUndSIejcJ: { label: 'Enki Commander monthly', group: 'Enki' },
  price_1TMthy7OMwDowUuURnoHc2Qq: { label: 'Enki Commander annual', group: 'Enki' },
  price_1TMtiN7OMwDowUuUU5rzK88L: { label: 'Enki Emperor monthly',  group: 'Enki' },
  price_1TMtis7OMwDowUuUpQ2hZamc: { label: 'Enki Emperor annual',   group: 'Enki' },
  price_1TMtkc7OMwDowUuU8aepieuq: { label: 'Enki Cloud Runner',     group: 'Enki' },
}

export function priceInfo(priceId: string | null | undefined): PriceInfo | null {
  return priceId ? PRICES[priceId] ?? null : null
}

// One-time Checkout Sessions tag themselves with metadata.type (see the
// checkout routes). Creator Hub payments are deliberately absent: that money
// belongs to the creator (Connect destination charges), not to SocialMate.
const SESSION_TYPES: Record<string, PriceInfo> = {
  credit_pack:     { label: 'AI credits',      group: 'Credits & boosters' },
  twitter_booster: { label: 'X Booster',       group: 'Credits & boosters' },
  soma_credits:    { label: 'SOMA credits',    group: 'Credits & boosters' },
  merch:           { label: 'Merch',           group: 'Merch' },
  donation:        { label: 'Donation',        group: 'Donations' },
}

export const CREATOR_HUB_TYPES = new Set(['creator_tip', 'creator_post_unlock', 'creator_subscription'])

export function sessionInfo(metadata: Record<string, string> | null | undefined): PriceInfo | null {
  if (!metadata) return null
  if (metadata.studio_stax === 'true') return { label: 'Studio Stax listing', group: 'Studio Stax' }
  return (metadata.type && SESSION_TYPES[metadata.type]) || priceInfo(metadata.price_id)
}
