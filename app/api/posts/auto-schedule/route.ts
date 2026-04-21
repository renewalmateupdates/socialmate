export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Best send times per platform (ET hours, 24h). Weekdays only.
const BEST_HOURS: Record<string, number[]> = {
  bluesky:  [8, 9, 10],
  discord:  [16, 17, 18, 19, 20, 21],
  telegram: [8, 9, 18, 19, 20],
  mastodon: [9, 10, 11],
  twitter:  [8, 9, 12, 13],
}
const DEFAULT_HOURS = [9]

// ET offset from UTC. Rough — we pick a consistent daily slot, not real TZ math.
// ET = UTC-4 (EDT) / UTC-5 (EST). We use -4 as a reasonable default.
const ET_OFFSET_HOURS = 4

function isWeekday(date: Date): boolean {
  const day = date.getUTCDay()
  return day !== 0 && day !== 6
}

/**
 * Given a target calendar day and an ET hour, return a UTC Date.
 * date is already a Date set to midnight UTC of the target day.
 */
function etHourToUtc(dayUtcMidnight: Date, etHour: number): Date {
  return new Date(dayUtcMidnight.getTime() + (etHour + ET_OFFSET_HOURS) * 3600 * 1000)
}

/**
 * Pick an optimal UTC datetime for a post, given:
 * - platforms array (to choose best hour)
 * - target day (Date at UTC midnight)
 * - set of already-taken ISO timestamps (to avoid collisions, 30-min window)
 */
function pickSlot(
  platforms: string[],
  dayUtcMidnight: Date,
  takenSlots: Set<string>,
): Date | null {
  // Collect candidate hours from all selected platforms
  const candidateHoursSet = new Set<number>()
  for (const p of platforms) {
    const hours = BEST_HOURS[p] ?? DEFAULT_HOURS
    hours.forEach(h => candidateHoursSet.add(h))
  }
  // Fall back to defaults if nothing matched
  if (candidateHoursSet.size === 0) DEFAULT_HOURS.forEach(h => candidateHoursSet.add(h))

  // Sort candidates ascending
  const candidates = Array.from(candidateHoursSet).sort((a, b) => a - b)

  for (const hour of candidates) {
    const slot = etHourToUtc(dayUtcMidnight, hour)
    const slotKey = `${slot.toISOString().slice(0, 13)}` // YYYY-MM-DDTHH — 1-hr bucket
    if (!takenSlots.has(slotKey)) {
      takenSlots.add(slotKey)
      return slot
    }
  }
  // All best hours taken — use first candidate anyway (append to day)
  return etHourToUtc(dayUtcMidnight, candidates[0])
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Plan check — free users cannot use auto-schedule
  const adminDb = getSupabaseAdmin()
  const { data: workspace } = await adminDb
    .from('workspaces')
    .select('plan')
    .eq('owner_id', user.id)
    .eq('is_personal', true)
    .single()

  const plan = (workspace?.plan as string | null) ?? 'free'
  if (plan === 'free') {
    return NextResponse.json({ error: 'upgrade_required', plan: 'free' }, { status: 403 })
  }

  // Parse optional filters from body
  const body = await request.json().catch(() => ({}))
  const { draftIds, platforms: filterPlatforms } = body as {
    draftIds?: string[]
    platforms?: string[]
  }

  // Fetch drafts
  let draftsQuery = adminDb
    .from('posts')
    .select('id, content, platforms, created_at')
    .eq('user_id', user.id)
    .eq('status', 'draft')
    .order('created_at', { ascending: true })

  if (draftIds && draftIds.length > 0) {
    draftsQuery = draftsQuery.in('id', draftIds)
  }

  const { data: drafts, error: draftsError } = await draftsQuery
  if (draftsError) {
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 })
  }
  if (!drafts || drafts.length === 0) {
    return NextResponse.json({ scheduled: 0, posts: [], slots: [] })
  }

  // Fetch existing scheduled posts to know which slots are taken
  const horizonDays = plan === 'agency' ? 30 : 14
  const horizonDate = new Date()
  horizonDate.setDate(horizonDate.getDate() + horizonDays)

  const { data: existing } = await adminDb
    .from('posts')
    .select('scheduled_at')
    .eq('user_id', user.id)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .lte('scheduled_at', horizonDate.toISOString())

  // Build taken-slot set (1-hr buckets per day, per platform-friendly slot)
  const takenSlots = new Set<string>()
  ;(existing ?? []).forEach((p: { scheduled_at: string }) => {
    if (p.scheduled_at) {
      const d = new Date(p.scheduled_at)
      takenSlots.add(`${d.toISOString().slice(0, 13)}`)
    }
  })

  // Build a list of upcoming weekday dates within the horizon
  const weekdays: Date[] = []
  const cursor = new Date()
  cursor.setUTCHours(0, 0, 0, 0)
  cursor.setUTCDate(cursor.getUTCDate() + 1) // start tomorrow
  while (weekdays.length < horizonDays && cursor <= horizonDate) {
    if (isWeekday(cursor)) {
      weekdays.push(new Date(cursor))
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  // Assign each draft a slot
  const slots: Array<{ id: string; title: string; scheduled_at: string }> = []
  let dayIndex = 0

  for (const draft of drafts) {
    // Determine effective platforms
    let platforms: string[] = draft.platforms ?? []
    if (filterPlatforms && filterPlatforms.length > 0) {
      platforms = filterPlatforms
    }
    if (platforms.length === 0) platforms = ['bluesky']

    // Find next available weekday (cycle through)
    let attempts = 0
    let slot: Date | null = null
    while (!slot && attempts < weekdays.length) {
      const day = weekdays[dayIndex % weekdays.length]
      slot = pickSlot(platforms, day, takenSlots)
      dayIndex++
      attempts++
    }

    if (!slot) continue // shouldn't happen, but guard

    // Update draft → scheduled
    const { error: updateError } = await adminDb
      .from('posts')
      .update({ status: 'scheduled', scheduled_at: slot.toISOString() })
      .eq('id', draft.id)
      .eq('user_id', user.id)

    if (!updateError) {
      slots.push({
        id: draft.id,
        title: (draft.content as string ?? '').slice(0, 60) || '(no content)',
        scheduled_at: slot.toISOString(),
      })
    }
  }

  // Return both `slots` (detailed) and `posts` (id + scheduled_at) for queue page
  const posts = slots.map(s => ({ id: s.id, scheduled_at: s.scheduled_at }))
  return NextResponse.json({ scheduled: slots.length, posts, slots })
}
