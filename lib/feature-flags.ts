// The kill switches this codebase actually honours.
//
// A flag only does something if some code path reads it. Two do today, and both
// read the same way: a MISSING row means enabled, and only an explicit
// `enabled: false` turns the feature off (fail-open, so a wiped table can never
// take the product down).
//
// That fail-open design is right, but it made the admin page useless: with no
// rows seeded, /admin/feature-flags rendered "0 flags" and told you to go write
// SQL. The switches existed, worked, and were invisible.
//
// So the registry lives here instead of in the database. The page lists these
// whether or not a row exists, and toggling one upserts the row. Nobody has to
// know a table is involved.
//
// ADDING A FLAG: add it here AND read it at the point it should take effect.
// An entry with no reader is a switch wired to nothing, which is worse than no
// switch at all — it looks like protection you do not have.

export interface FeatureFlagSpec {
  flag: string
  label: string
  // What actually happens when this is switched OFF. Written for the person
  // deciding at 2am whether flipping it is safe.
  whenOff: string
}

export const FEATURE_FLAGS: FeatureFlagSpec[] = [
  {
    flag:    'twitter_posting',
    label:   'X / Twitter posting',
    whenOff: 'Publishing to X fails immediately with a "paused" message. Other platforms are unaffected. Use when X is rejecting writes and you want to stop burning the $0.01-per-tweet charge.',
  },
  {
    flag:    'ai_caption_generation',
    label:   'AI caption generation',
    whenOff: 'The caption tool returns "paused" and no credits are charged. Every other AI tool keeps working.',
  },
  {
    flag:    'ai_pulse',
    label:   'SM-Pulse',
    whenOff: 'SM-Pulse trend scans return "paused" and no credits are charged.',
  },
  {
    flag:    'ai_radar',
    label:   'SM-Radar',
    whenOff: 'SM-Radar reports return "paused" and no credits are charged.',
  },
  {
    flag:    'media_upload',
    label:   'Media uploads',
    whenOff: 'Uploads are refused at the door, before any bytes are stored. The main lever if Supabase storage or egress costs spike. Existing media is untouched.',
  },
  {
    flag:    'push_notifications',
    label:   'Push notifications',
    whenOff: 'No web pushes are sent. In-app notifications still appear.',
  },
  {
    flag:    'evergreen_recycling',
    label:   'Evergreen recycling',
    whenOff: 'The daily 6am recycler skips its run, so nothing is re-queued. Already-scheduled posts are unaffected.',
  },
]

// Merge the registry with whatever rows exist, so a flag that has never been
// toggled still appears — as enabled, because that is what the readers do.
export function mergeFlagState(
  rows: Array<{ flag: string; enabled: boolean; updated_at?: string | null; updated_by?: string | null }> | null,
) {
  const byFlag = new Map((rows ?? []).map((r) => [r.flag, r]))
  return FEATURE_FLAGS.map((spec) => {
    const row = byFlag.get(spec.flag)
    return {
      ...spec,
      // No row = no override = the feature is live.
      enabled:    row ? row.enabled : true,
      configured: !!row,
      updated_at: row?.updated_at ?? null,
      updated_by: row?.updated_by ?? null,
    }
  })
}
