// The parts of a SOMA voice profile that people type freely: example posts
// and house rules (the optional last screen of the Voice DNA interview).
// Shared by the voice route and the generator so both read them the same way.
//
// Pure: no imports, safe in the browser.

export const MAX_EXAMPLES = 3
export const MAX_EXAMPLE_CHARS = 1500
export const MAX_RULES_CHARS = 500

/** Up to three non-empty example posts, each trimmed and capped. */
export function cleanExamples(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((e): e is string => typeof e === 'string')
    .map(e => e.trim().slice(0, MAX_EXAMPLE_CHARS))
    .filter(Boolean)
    .slice(0, MAX_EXAMPLES)
}

/** House rules live on tone_profile.house_rules. */
export function houseRules(toneProfile: unknown): string {
  const rules = (toneProfile as { house_rules?: unknown } | null)?.house_rules
  return typeof rules === 'string' ? rules.trim() : ''
}
